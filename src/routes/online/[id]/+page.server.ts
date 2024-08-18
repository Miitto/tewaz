import { getMatch } from '$lib/server/matches.server.svelte';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const { id } = params;

	const match = getMatch(id);

	const matchString = match?.gameString() ?? '';

	const pendingMoves: [[number, number], [number, number]][] =
		match?.game.stagedMoves.map((move) => [
			[move.position.x, move.position.y],
			[move.target.x, move.target.y]
		]) ?? [];

	return {
		matchExists: match !== undefined,
		matchString,
		pendingMoves
	};
};
