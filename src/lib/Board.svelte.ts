import { Fish, Hunter, Team, type Piece } from './Piece.svelte';
export class Board {
	board: (Piece | null)[][];

	constructor(copy?: Board) {
		if (copy) {
			this.board = copy.board.map(row => row.slice());
			console.log("copy");
		} else {
			// make a 5x11 board with pieces in end columns
			this.board = Array.from({ length: 5 }, () => Array.from({ length: 11 }, () => null));
			for (let i = 0; i < 5; i++) {
				this.board[i][0] = i == 2 ? new Hunter(Team.ONE) : new Fish(Team.ONE);
				this.board[i][10] = i == 2 ? new Hunter(Team.TWO) : new Fish(Team.TWO);
			}
		}
	}

	at(row: ([number, number] | number), col: number | undefined = undefined): Piece | null {
		if (Array.isArray(row)) {
			[row, col] = row;
		}

		if (col === undefined) {
			throw new Error('Invalid arguments');
		}

		return this.board[row][col];
	}
}
