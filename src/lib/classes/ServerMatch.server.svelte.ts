import EventEmitter from 'node:events';
import type { UID } from '../server/util.server';
import { createSSE } from '$lib/server/sse.server';
import { type MovePayload } from './Move.svelte';
import { Game } from './Game.svelte';
import type { Match, MatchPayload } from './Match.svelte';
import type { Point } from './Coord';
import { PieceType, Team } from './Piece.svelte';

export class ServerMatch implements Match {
	id: UID;
	emitter: EventEmitter;

	game: Game;

	get readable(): ReadableStream {
		const { readable, subscribe } = createSSE();

		subscribe(this.emitter, 'move');
		subscribe(this.emitter, 'un-move');
		subscribe(this.emitter, 'end-turn');

		return readable;
	}

	constructor(id: UID, emitter?: EventEmitter) {
		this.id = id;
		this.emitter = emitter ?? new EventEmitter();

		this.game = new Game();
	}

	asPayload(): MatchPayload {
		return {
			id: this.id
		};
	}

	async stageMove(data: MovePayload): Promise<boolean> {
		if (!this.game.stageMove(data.position, data.target, true)) return false;

		this.emitter.emit('move', data);
		return true;
	}

	async unstageMove(target: Point) {
		this.game.unstageMove(target);

		this.emitter.emit('un-move', { target: target, team: this.game.teamTurn });
		return true;
	}

	async endTurn(): Promise<boolean> {
		const team = this.game.teamTurn;
		if (!this.game.endTurn()) {
			return false;
		}

		this.emitter.emit('end-turn', { team: team });
		return true;
	}

	matchString(): string {
		return (
			this.game.turn.toString() +
			' ' +
			this.game.board.board.reduce(
				(acc, row) =>
					acc +
					row.reduce((acc, cell) => {
						if (cell === null) {
							return acc + '.';
						}
						const letter = cell.type === PieceType.FISH ? 'f' : 'h';

						if (cell.team === Team.ONE) {
							return acc + letter.toUpperCase();
						} else {
							return acc + letter;
						}
					}, '') +
					' ',
				''
			)
		);
	}
}
