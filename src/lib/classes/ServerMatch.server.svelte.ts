import EventEmitter from 'node:events';
import type { UID } from '../server/util.server';
import { createSSE } from '$lib/server/sse.server';
import { type MovePayload } from './Move.svelte';
import { Game } from './Game.svelte';
import type { Match, MatchPayload } from './Match.svelte';
import type { Point } from './Coord';

export class ServerMatch implements Match {
	id: UID;
	emitter: EventEmitter;

	game: Game;

	get readable(): ReadableStream {
		const { readable, subscribe } = createSSE();

		subscribe(this.emitter, 'move');
		subscribe(this.emitter, 'unmove');
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

		this.emitter.emit('unmove', { target: target, team: this.game.teamTurn });
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
}
