import { Fish, Hunter, Team, type Piece } from './Piece.svelte';

export const safeZoneCols = [0, 10];
export const sandZoneCols = [4, 6];
export const waterZoneCols = [5];

export class Board {
	board: (Piece | null)[][] = $state<Array<Array<Piece | null>>>([]);

	constructor(copy?: Board) {
		if (copy) {
			this.board = copy.board.map((row) => row.slice());
		} else {
			// make a 5x11 board with pieces in end columns
			this.board = Array.from({ length: 5 }, () => Array.from({ length: 11 }, () => null));
			for (let i = 0; i < 5; i++) {
				this.board[i][0] = i == 2 ? new Hunter(Team.ONE) : new Fish(Team.ONE);
				this.board[i][10] = i == 2 ? new Hunter(Team.TWO) : new Fish(Team.TWO);
			}
		}
	}

	at(row: [number, number] | number, col: number | undefined = undefined): Piece | null {
		if (Array.isArray(row)) {
			[row, col] = row;
		}

		if (col === undefined) {
			throw new Error('Invalid arguments');
		}

		return this.board[row][col];
	}

	/**
	 *
	 * @param col col to count
	 * @param team team to count
	 * @param moveOriginExclude ignore moves originating from this position (usually the move being checked)
	 * @param rowExcludes don't count pieces in these rows, usually from pieces in that location that are staged to move
	 * @returns number of pieces in the column from the given team
	 */
	teamColCount(
		col: number,
		team: Team,
		moveOriginExclude: [number, number] | null = null,
		rowExcludes: number[] | null = null
	): number {
		return this.board.filter(
			(row, i) =>
				(!rowExcludes || !rowExcludes.includes(i)) &&
				row[col]?.team === team &&
				(!moveOriginExclude || (i != moveOriginExclude[0] && col != moveOriginExclude[1]))
		).length;
	}
}
