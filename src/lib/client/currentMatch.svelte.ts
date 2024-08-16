import type { ClientMatch } from '$lib/classes/Match.svelte';

let currentMatch: ClientMatch | null = $state(null);

export function setCurrentMatch(match: ClientMatch) {
	currentMatch = match;
}

export function getCurrentMatch() {
	return currentMatch;
}
