import { ClientMatch } from '$lib/classes/Match.svelte';
import { Team } from '$lib/classes/Piece.svelte';
import type { UID } from '$lib/server/util.server';

let currentMatches: ClientMatch[] = $state([]);

export async function createMatch(): Promise<ClientMatch> {
	const match = await ClientMatch.create();
	console.log('Created Match', match);
	currentMatches = [...currentMatches, match];
	return match;
}

export async function joinMatch(id: UID): Promise<ClientMatch> {
	const response = await fetch(`/api/online/connect/${id}`);

	if (!response.ok) {
		throw new Error('Failed to join room');
	}

	const stream = response.body!.pipeThrough(new TextDecoderStream());

	const match = new ClientMatch(id, Team.TWO, stream);

	currentMatches = [...currentMatches, match];

	return match;
}

export function getMatch(id: UID): ClientMatch | undefined {
	return currentMatches.find((match) => match.id === id);
}
