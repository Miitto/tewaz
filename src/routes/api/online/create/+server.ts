import { createMatch } from '$lib/server/matches.server.svelte';

export async function GET() {
	const match = createMatch();

	const readable = match.readable;

	console.log('Match created :', match.id);

	return new Response(readable, {
		headers: {
			'cache-control': 'no-cache',
			'content-type': 'text/event-stream',
			'match-id': match.id
		}
	});
}
