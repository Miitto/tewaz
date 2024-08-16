import { getMatch } from '$lib/server/matches.server.svelte';
import { error } from '@sveltejs/kit';

export const POST = async ({ params }) => {
	const { id } = params;

	const match = getMatch(id);

	if (!match) {
		error(404, 'Match not found');
	}

	if (!(await match.endTurn())) {
		error(400, 'Failed to end turn');
	}

	return new Response(null, { status: 204 });
};
