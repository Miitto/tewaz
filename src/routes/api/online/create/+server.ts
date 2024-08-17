import type { GameConfig } from '$lib/classes/Game.svelte';
import { createMatch } from '$lib/server/matches.server.svelte';

export async function POST({ request }) {
	const config: GameConfig = await request.json();
	const match = createMatch(config);

	const readable = match.readable;

	return new Response(readable, {
		headers: {
			'cache-control': 'no-cache',
			'content-type': 'text/event-stream',
			'match-id': match.id
		}
	});
}
