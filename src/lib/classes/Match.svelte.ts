import type { UID } from '../server/util.server';
import { Game } from './Game.svelte';
import { type Point } from './Coord';
import { Team } from './Piece.svelte';

export interface MatchPayload {
	id: UID;
}

export interface Match {
	id: UID;
	asPayload(): MatchPayload;
}

/**
 * Multiplayer match
 *
 * Holds the current game state and manages multiplayer interactions
 */
export class ClientMatch implements Match {
	id: UID;
	stream: ReadableStream | null = null;
	game: Game = $state(new Game());

	team: Team | null;

	constructor(payload: UID | MatchPayload, team: Team | null, stream?: ReadableStream) {
		if (typeof payload === 'object') {
			this.id = payload.id;
		} else {
			this.id = payload;
		}

		this.team = team;

		this.stream = stream ?? null;
	}

	asPayload(): MatchPayload {
		return {
			id: this.id
		};
	}

	async getStream() {
		if (this.stream) {
			return;
		}
		const response = await fetch(`/api/online/connect/${this.id}`);

		if (!response.ok) {
			console.error('Failed to create room:', response.statusText);
		}

		this.stream = response.body!.pipeThrough(new TextDecoderStream());
	}

	static async create(): Promise<ClientMatch> {
		console.log('Creating Match');
		const response = await fetch('/api/online/create');
		console.log('Response:', response);

		if (!response.ok) {
			console.error('Failed to create room:', response.statusText);
		}

		const id = response.headers.get('match-id');

		if (!id) {
			throw new Error('Failed to create room');
		}

		const stream = response.body!.pipeThrough(new TextDecoderStream());

		return new ClientMatch(id, Team.ONE, stream);
	}

	async stageMove(position: Point, target: Point): Promise<boolean> {
		const success = this.game.stageMove(position, target);

		if (!success) {
			return false;
		}

		const move = this.game.pendingMoves[this.game.pendingMoves.length - 1];

		const response = await fetch(`/api/online/stage-move/${this.id}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(move.asPayload())
		});

		if (!response.ok) {
			console.error('Failed to move:', response.statusText);
			this.game.unstageMove(target);
			return false;
		}

		return true;
	}

	async unstageMove(target: Point) {
		this.game.unstageMove(target);

		let x;
		let y;

		if (Array.isArray(target)) {
			[x, y] = target;
		} else {
			({ x, y } = target);
		}

		const response = await fetch(`/api/online/unstage-move/${this.id}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ target: { x, y } })
		});

		if (!response.ok) {
			console.error('Failed to unstage move:', response.statusText);
		}
	}

	endTurn() {
		this.game.endTurn();

		fetch(`/api/online/end-turn/${this.id}`, {
			method: 'POST'
		});
	}

	/**
	 * Set up the board from a string
	 * @param str Board state as a string. Each set is separated by a space, with the first being the turn number. All sets afterwards are the rows, and each character in a row is a piece. '.' is empty, 'f' is fish'h' is hunter. Lowercase is team 2, uppercase is team 1
	 * @param pendingMoves List of pending moves to set up
	 */
	setupBoard(str: string, pendingMoves: [[number, number], [number, number]][]) {
		this.game.setupBoard(str, pendingMoves);
	}

	async listen() {
		if (!this.stream) {
			await this.getStream();
		}

		const reader = this.stream!.getReader();

		while (true) {
			const { value, done } = await reader.read();

			if (done) {
				break;
			}

			if (value.startsWith(':')) {
				console.log('Received:', value);
				continue;
			}

			const { data, event } = JSON.parse(value);

			console.log(data);

			// Ignore events from the same team - they are already handled locally
			if (data.team === this.team) {
				continue;
			}

			switch (event) {
				case 'move':
					this.game.stageMove(
						[data.position.x, data.position.y],
						[data.target.x, data.target.y],
						false
					);
					break;
				case 'un-move':
					this.game.unstageMove([data.target.x, data.target.y]);
					break;
				case 'end-turn':
					this.game.endTurn();
					break;
				case 'setup':
					this.setupBoard(data.board, data.pendingMoves);
					break;
			}
		}
	}
}
