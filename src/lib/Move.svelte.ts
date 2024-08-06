import type { Board } from "./Board.svelte";
import type { Piece } from "./Piece.svelte";

export class Move {
	position: [number, number];
	vector: [number, number];
	piece: Piece;
	constructor(position: [number, number], vector: [number, number], piece: Piece) {
		this.position = position;
		this.vector = vector;
		this.piece = piece;
	}

	isValid(board: Board): boolean {
		const [dx, dy] = this.vector;
		const [x, y] = this.position;
		let [nx, ny] = [x + dx, y + dy];

		// Check the vector is valid
		if (!this.piece.getMoveOffsets().some(([ox, oy]) => ox === dx && oy === dy)) {
			return false;
		}

		// Check if the move is within bounds
		if (nx < 0 || nx >= board.board.length || ny < 0 || ny >= board.board[0].length) {
			return false;
		}

		// Ensure it isn't hopping over pieces
		while (nx !== x && ny !== y) {
			if (board.board[nx][ny] !== null) {
				return false;
			}

			nx -= dx > 0 ? 1 : dx < 0 ? -1 : 0;
			ny -= dy > 0 ? 1 : dy < 0 ? -1 : 0;
		}

		return true;
	}

	commit(board: Board): boolean {
		if (!this.isValid(board)) {
			return false;
		}

		board.board[this.position[0]][this.position[1]] = null;
		board.board[this.position[0] + this.vector[0]][this.position[1] + this.vector[1]] = this.piece;

		return true;
	}
}
