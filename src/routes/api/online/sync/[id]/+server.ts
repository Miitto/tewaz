import type { GameConfig } from '$lib/classes/Game.svelte.js';
import { getMatch } from '$lib/server/matches.server.svelte';
import { error, json } from '@sveltejs/kit';

export interface SyncResponse {
	matchString: string;
	pendingMoves: [[number, number], [number, number]][];
	config: GameConfig;
}

export async function GET({ params }) {
	const match = getMatch(params.id);

	if (!match) {
		error(404, 'Match not found');
	}

	const matchString = match?.matchString() ?? '';

	const pendingMoves: [[number, number], [number, number]][] =
		match?.game.pendingMoves.map((move) => [
			[move.position.x, move.position.y],
			[move.target.x, move.target.y]
		]) ?? [];

	const config = match?.game.config;

	const payload: SyncResponse = {
		matchString: matchString,
		pendingMoves: pendingMoves,
		config: config
	};

	return json(payload);
}
