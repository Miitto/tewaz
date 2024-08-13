import type { Board } from './Board.svelte';
import type { Piece } from './Piece.svelte';

export class Move {
	position: [number, number];
	target: [number, number];
	piece: Piece;
	constructor(position: [number, number], target: [number, number], piece: Piece) {
		this.position = position;
		this.target = target;
		this.piece = piece;
	}

	hasTarget(target: [number, number]): boolean {
		return this.target[0] === target[0] && this.target[1] === target[1];
	}

	hasPosition(position: [number, number]): boolean {
		return this.position[0] === position[0] && this.position[1] === position[1];
	}

	isValid(board: Board): boolean {
		const [x, y] = this.position;
		let [nx, ny] = this.target;

		const dx = nx - x;
		const dy = ny - y;

		// Check the target is valid
		if (!this.piece.getMoveOffsets().some(([ox, oy]) => ox === dx && oy === dy)) {
			console.log('Invalid move target');
			return false;
		}

		// Check if the move is within bounds
		if (nx < 0 || nx >= board.board.length || ny < 0 || ny >= board.board[0].length) {
			console.log('Out of bounds');
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
		board.board[this.position[0] + this.target[0]][this.position[1] + this.target[1]] = this.piece;

		return true;
	}
}
