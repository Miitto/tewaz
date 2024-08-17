import type { GameConfig } from '$lib/classes/Game.svelte';
import { ClientMatch } from '$lib/classes/Match.svelte';
import { Team } from '$lib/classes/Piece.svelte';
import type { UID } from '$lib/server/util.server';
import type { SyncResponse } from '../../routes/api/online/sync/[id]/+server';

let currentMatches: ClientMatch[] = $state([]);

export async function createMatch(config?: GameConfig): Promise<ClientMatch> {
	const match = await ClientMatch.create(config);

	await match.ensureStream();

	currentMatches = [...currentMatches, match];

	localStorage.setItem('matches', JSON.stringify(currentMatches.map((match) => match.asPayload())));

	return match;
}

// TODO: Check if the game has ended server side. Currently if the server restarts then you could rejoin into someone elses game
export async function joinMatch(id: UID, team?: Team): Promise<ClientMatch> {
	const gameStateResp = await fetch(`/api/online/sync/${id}`);
	const gameState: SyncResponse = await gameStateResp.json();

	const match = new ClientMatch(id, team ?? Team.TWO, gameState.config);
	match.setupBoard(gameState.matchString, gameState.pendingMoves);

	await match.ensureStream();

	currentMatches = [...currentMatches, match];
	localStorage.setItem('matches', JSON.stringify(currentMatches.map((match) => match.asPayload())));

	return match;
}

export async function getMatch(id: UID): Promise<ClientMatch | undefined> {
	const active = currentMatches.find((match) => match.id === id);
	if (active) {
		return active;
	}

	const matches = JSON.parse(localStorage.getItem('matches') ?? '[]') as { id: UID; team: Team }[];

	const match = matches.find((match) => match.id === id);

	if (match) {
		return joinMatch(id, match.team);
	}
}

export function leaveMatch(id: UID) {
	const index = currentMatches.findIndex((match) => match.id === id);
	if (index !== -1) {
		currentMatches.splice(index, 1);
	}

	localStorage.setItem('matches', JSON.stringify(currentMatches.map((match) => match.asPayload())));
}
