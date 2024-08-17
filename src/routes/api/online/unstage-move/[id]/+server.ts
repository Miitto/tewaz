import { Coord } from '$lib/classes/Coord';
import { getMatch } from '$lib/server/matches.server.svelte';
import { error } from '@sveltejs/kit';

export const POST = async ({ params, request }) => {
	const { id } = params;

	const match = getMatch(id);

	if (!match) {
		return new Response(null, { status: 404 });
	}

	const data = await request.json();

	const payload = {
		target: new Coord(data.target.x, data.target.y),
		team: data.team
	};

	try {
		if (!(await match.unstageMove(payload.target))) {
			error(400, 'Failed to move');
		}
	} catch (e) {
		console.error(e);
		error(400, 'Failed to move');
	}

	return new Response(null, { status: 204 });
};
