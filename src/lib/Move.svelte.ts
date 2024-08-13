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

	isValid(skipMoveCost = false, ignoreThisMove = false): boolean {
		const board = this.game.board;
		const [x, y] = this.position;
		let [nx, ny] = this.target;

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

		// FIXME: Need this to work before the pending move is added to the list as well. Some sort of exclusion for the current move? Might be fixed need to check
		// Ensure column is not at max capacity
		if (sandZoneCols.includes(ny)) {
			if (
				this.game.stagedTeamColCount(ny, this.piece.team, this) >=
				this.game.teamMaxInSandCol + (ignoreThisMove ? 1 : 0)
			) {
				console.log('Column is full');
				return false;
			}
		} else if (waterZoneCols.includes(ny)) {
			if (
				this.game.stagedTeamColCount(ny, this.piece.team, this) >=
				this.game.teamMaxInWaterCol + (ignoreThisMove ? 1 : 0)
			) {
				console.log('Column is full');
				return false;
			}
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

	commit(): boolean {
		// Ensure the move is still valid
		if (!this.isValid(true)) {
			return false;
		}

		this.game.pendingMoves = this.game.pendingMoves.filter((move) => move !== this);

		this.game.board.board[this.position[0]][this.position[1]] = null;
		this.game.board.board[this.target[0]][this.target[1]] = this.piece;

		return true;
	}
}
