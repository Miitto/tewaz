import type { GameConfig } from '$lib/classes/Game.svelte';
import { ClientMatch } from '$lib/classes/Match.svelte';
import { Team } from '$lib/classes/Piece.svelte';
import type { UID } from '$lib/server/util.server';
import type { SyncResponse } from '../../routes/api/online/sync/[id]/+server';

let currentMatches: ClientMatch[] = $state([]);

// TODO: Store matches in local storage so you can rejoin correctly on a disconnect
export async function createMatch(config?: GameConfig): Promise<ClientMatch> {
	const match = await ClientMatch.create(config);

	await match.ensureStream();

	currentMatches = [...currentMatches, match];
	return match;
}

export async function joinMatch(id: UID): Promise<ClientMatch> {
	const gameStateResp = await fetch(`/api/online/sync/${id}`);
	const gameState: SyncResponse = await gameStateResp.json();

	const match = new ClientMatch(id, Team.TWO, gameState.config);
	match.setupBoard(gameState.matchString, gameState.pendingMoves);

	await match.ensureStream();

	currentMatches = [...currentMatches, match];

	return match;
}

export function getMatch(id: UID): ClientMatch | undefined {
	return currentMatches.find((match) => match.id === id);
}
