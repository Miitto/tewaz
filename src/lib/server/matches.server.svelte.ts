import { ServerMatch } from '../classes/ServerMatch.server.svelte';
import { uniqueId, type UID } from './util.server';

const matches: ServerMatch[] = $state([]);

export function createMatch(): ServerMatch {
	const match = new ServerMatch(uniqueId());
	matches.push(match);

	return match;
}

export function getMatch(id: UID): ServerMatch | undefined {
	const match = matches.find((match) => match.id === id);
	return match;
}

export function deleteMatch(id: UID) {
	const index = matches.findIndex((match) => match.id === id);
	if (index !== -1) {
		matches.splice(index, 1);
	}
}
