import { createMatch } from '$lib/server/matches.server.svelte';

export async function GET() {
	const match = createMatch();

	return new Response(match.readable, {
		headers: {
			'cache-control': 'no-cache',
			'content-type': 'text/event-stream',
			'match-id': match.id
		}
	});
}
