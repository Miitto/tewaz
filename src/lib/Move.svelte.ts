import { sandZoneCols, waterZoneCols } from './Board.svelte';
import { Coord } from './Coord';
import type { Game } from './Game.svelte';
import { Team, type Piece } from './Piece.svelte';

export class Move {
	position: Coord;
	target: Coord;
	piece: Piece;
	game: Game;
	private discard = false;

	constructor(position: Coord, target: Coord, game: Game) {
		this.position = position;
		this.target = target;
		const piece = game.board.at(position);
		if (!piece) {
			throw new Error('No piece at position');
		}
		this.piece = piece;
		this.game = game;
	}

	hasTarget(target: Coord | [number, number]): boolean {
		return this.target.equals(target);
	}

	hasPosition(position: Coord | [number, number]): boolean {
		return this.position.equals(position);
	}

	isValid(skipMoveCost = false): boolean {
		const board = this.game.board;
		const [x, y] = this.position;
		const [nx, ny] = this.target;

		const dx = nx - x;
		const dy = ny - y;

		if (this.game.teamTurn !== this.piece?.team) {
			return false;
		}

		if (!skipMoveCost && this.game.movesUsed > this.game.moveAllowance - this.piece.moveCost) {
			return false;
		}

		// Check the target is valid
		if (!this.piece.moveOffsets.some(([ox, oy]) => ox === dx && oy === dy)) {
			return false;
		}

		// Check if the move is within bounds
		if (nx < 0 || nx >= board.board.length || ny < 0 || ny >= board.board[0].length) {
			return false;
		}

		// Ensure column is not at max capacity
		if (sandZoneCols.includes(ny)) {
			if (
				this.game.stagedTeamColCount(ny, this.piece.team, this.position) >=
				this.game.teamMaxInSandCol
			) {
				return false;
			}
		} else if (waterZoneCols.includes(ny)) {
			if (
				this.game.stagedTeamColCount(ny, this.piece.team, this.position) >=
				this.game.teamMaxInWaterCol
			) {
				return false;
			}
		}

		let xOffset = nx;
		let yOffset = ny;

		// FIXME: I managed to hop over a piece, cannot seem to reproduce

		// Ensure it isn't hopping over pieces
		while (xOffset !== x || yOffset !== y) {
			if (board.board[xOffset][yOffset] !== null) {
				return false;
			}

			if (dx != 0 && xOffset !== x) {
				xOffset -= dx > 0 ? 1 : -1;
			}
			if (dy != 0 && yOffset !== y) {
				yOffset -= dy > 0 ? 1 : -1;
			}
		}

		return true;
	}

	/** Commit this move. Will not check validity */
	commit(): boolean {
		this.game.pendingMoves = this.game.pendingMoves.filter((move) => move !== this);

		this.game.board.board[this.position.x][this.position.y] = null;

		// Piece should be deleted if there is no target
		if (!this.discard) {
			this.game.board.board[this.target.x][this.target.y] = this.piece;
		}

		return true;
	}

	isDangerous(): boolean {
		return this.game.board.posIsDangerous(this.target, this.piece.team);
	}

	sendHome() {
		const safeCol = this.piece.team === Team.ONE ? 0 : this.game.board.board[0].length - 1;
		// Find empty safe col slot
		const row = this.game.board.board.findIndex((row) => row[safeCol] === null);

		// No safe spot TODO: Needs balancing. Currently discards piece, should maybe store it for next turn?
		if (row === -1) {
			console.log('No space in Safe Zone, piece lost');
			this.discard = true;
		} else {
			this.target.x = row;
			this.target.y = safeCol;
		}
		this.commit();
	}
}
