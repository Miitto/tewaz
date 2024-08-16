import { getMatch } from '$lib/server/matches.server.svelte';
import { error } from '@sveltejs/kit';

export async function GET({ params }) {
	const match = getMatch(params.id);

	if (!match) {
		error(404, 'Match not found');
	}

	return new Response();
}
