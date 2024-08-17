import type { UID } from '../server/util.server';
import { Game } from './Game.svelte';
import { Coord, type Point } from './Coord';
import { Fish, Hunter, Team } from './Piece.svelte';
import { Move } from './Move.svelte';

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
		const response = await fetch('/api/online/connect', {
			method: 'GET',
			headers: {
				'match-id': this.id.toString()
			}
		});

		if (!response.ok) {
			console.error('Failed to create room:', response.statusText);
		}

		this.stream = response.body!.pipeThrough(new TextDecoderStream());
	}

	static async create(): Promise<ClientMatch> {
		const response = await fetch('/api/online/create', {
			method: 'GET'
		});

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

		const response = await fetch(`/api/online/unstage-move/${this.id}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(target)
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

	setupBoard(str: string, pendingMoves: [[number, number], [number, number]][]) {
		const board = this.game.board.board;

		const [turn, ...rows] = str.split(' ');

		this.game.turn = parseInt(turn);

		rows.forEach((row, y) => {
			const tiles = row.split('');
			tiles.forEach((tile, x) => {
				switch (tile) {
					case '.':
						board[y][x] = null;
						break;
					case 'f':
						board[y][x] = new Fish(Team.TWO);
						break;
					case 'F':
						board[y][x] = new Fish(Team.ONE);
						break;
					case 'h':
						board[y][x] = new Hunter(Team.TWO);
						break;
					case 'H':
						board[y][x] = new Hunter(Team.ONE);
						break;
				}
			});
		});

		this.game.pendingMoves = pendingMoves.map(
			([position, target]) =>
				new Move(new Coord(position[0], position[1]), new Coord(target[0], target[1]), this.game)
		);
	}
}
