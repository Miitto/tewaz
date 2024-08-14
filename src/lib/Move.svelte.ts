import { sandZoneCols, waterZoneCols } from './Board.svelte';
import type { Game } from './Game.svelte';
import type { Piece } from './Piece.svelte';

export class Move {
	position: [number, number];
	target: [number, number];
	piece: Piece;
	game: Game;

	constructor(position: [number, number], target: [number, number], game: Game) {
		this.position = position;
		this.target = target;
		const piece = game.board.at(position);
		if (!piece) {
			throw new Error('No piece at position');
		}
		this.piece = piece;
		this.game = game;
	}

	hasTarget(target: [number, number]): boolean {
		return this.target[0] === target[0] && this.target[1] === target[1];
	}

	hasPosition(position: [number, number]): boolean {
		return this.position[0] === position[0] && this.position[1] === position[1];
	}

	isValid(skipMoveCost = false): boolean {
		const board = this.game.board;
		const [x, y] = this.position;
		const [nx, ny] = this.target;

		const dx = nx - x;
		const dy = ny - y;

		if (this.game.teamTurn !== this.piece?.team) {
			console.log('Not your turn');
			return false;
		}

		if (!skipMoveCost && this.game.movesUsed > this.game.moveAllowance - this.piece.moveCost) {
			console.log('Move allowance exceeded');
			return false;
		}

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

		// Ensure column is not at max capacity
		if (sandZoneCols.includes(ny)) {
			if (
				this.game.stagedTeamColCount(ny, this.piece.team, this.position) >=
				this.game.teamMaxInSandCol
			) {
				console.log('Column is full');
				return false;
			}
		} else if (waterZoneCols.includes(ny)) {
			if (
				this.game.stagedTeamColCount(ny, this.piece.team, this.position) >=
				this.game.teamMaxInWaterCol
			) {
				console.log('Column is full');
				return false;
			}
		}

		let xOffset = nx;
		let yOffset = ny;

		console.log('Offsets', xOffset, yOffset, x, y, dx, dy);

		// FIXME: I managed to hop over a piece, cannot seem to reproduce

		// Ensure it isn't hopping over pieces
		while (xOffset !== x || yOffset !== y) {
			console.log('Checking', xOffset, yOffset, board.at([xOffset, yOffset]));
			if (board.board[xOffset][yOffset] !== null) {
				console.log('Piece in the way at', xOffset, yOffset);
				return false;
			}

			if (dx != 0 && xOffset !== x) {
				xOffset -= dx > 0 ? 1 : -1;
			}
			if (dy != 0 && yOffset !== y) {
				yOffset -= dy > 0 ? 1 : -1;
			}
		}
		console.log('No pieces in the way');

		return true;
	}

	/** Commit this move. Will not check validity */
	commit(): boolean {
		this.game.pendingMoves = this.game.pendingMoves.filter((move) => move !== this);

		this.game.board.board[this.position[0]][this.position[1]] = null;
		this.game.board.board[this.target[0]][this.target[1]] = this.piece;

		return true;
	}
}
