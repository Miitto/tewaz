import { PieceType, Team } from '$lib/classes/Piece.svelte';
import { getMatch } from '$lib/server/matches.server.svelte';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const { id } = params;

	const match = getMatch(id);

	const matchString =
		match?.game.turn.toString() +
		' ' +
		(match?.game.board.board.reduce(
			(acc, row) =>
				acc +
				row.reduce((acc, cell) => {
					if (cell === null) {
						return acc + '.';
					}
					const letter = cell.type === PieceType.FISH ? 'f' : 'h';

					if (cell.team === Team.ONE) {
						return acc + letter.toUpperCase();
					} else {
						return acc + letter;
					}
				}, '') +
				' ',
			''
		) ?? '');

	const pendingMoves: [[number, number], [number, number]][] =
		match?.game.pendingMoves.map((move) => [
			[move.position.x, move.position.y],
			[move.target.x, move.target.y]
		]) ?? [];

	return {
		matchExists: match !== undefined,
		matchString,
		pendingMoves
	};
};
