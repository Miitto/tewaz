import { Coord } from '$lib/classes/Coord';
import type { MovePayload } from '$lib/classes/Move.svelte.js';
import { getMatch } from '$lib/server/matches.server.svelte';
import { error } from '@sveltejs/kit';

export const POST = async ({ params, request }) => {
	const { id } = params;

	const match = getMatch(id);

	if (!match) {
		return new Response(null, { status: 404 });
	}

	const data = await request.json();

	const payload: MovePayload = {
		position: new Coord(data.position.x, data.position.y),
		target: new Coord(data.target.x, data.target.y),
		team: data.team
	};

	try {
		if (!(await match.stageMove(payload))) {
			error(400, 'Failed to move');
		}
	} catch (e) {
		console.error(e);
		error(400, 'Failed to move');
	}

	return new Response(null, { status: 204 });
};
