import EventEmitter from 'node:events';
import type { UID } from '../server/util.server';
import { createSSE } from '$lib/server/sse.server';
import { type MovePayload } from './Move.svelte';
import { Game } from './Game.svelte';
import type { Match, MatchPayload } from './Match.svelte';

export class ServerMatch implements Match {
	id: UID;
	emitter: EventEmitter;

	game: Game;

	readable: ReadableStream;
	subscribe: (emitter: EventEmitter, id: string) => void;

	constructor(id: UID, emitter?: EventEmitter) {
		this.id = id;
		this.emitter = emitter ?? new EventEmitter();

		const { readable, subscribe } = createSSE();
		this.readable = readable;
		this.subscribe = subscribe;

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

	async unstageMove(target: [number, number]) {
		this.game.unstageMove(target);

		this.emitter.emit('unmove', target);
		return true;
	}

	async endTurn(): Promise<boolean> {
		if (!this.game.endTurn()) {
			return false;
		}

		this.emitter.emit('end-turn');
		return true;
	}
}
