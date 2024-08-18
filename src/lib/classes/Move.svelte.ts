import { Board } from './Board.svelte';
import { Coord, type Point } from './Coord';
import type { Game } from './Game.svelte';
import { Team, type Piece } from './Piece.svelte';

export interface MovePayload {
	position: Point;
	target: Point;
	team: Team;
}

/**
 * Represents a move on the board.
 * Tied to a game instance.
 * Can be committed to the game board.
 * Can be checked for validity.
 * Can check if this move is dangerous for the piece, or will capture other pieces.
 * Can also be a capture move for this piece, which will flip it and send it home.
 */
export class Move {
	position: Coord;
	target: Coord;
	piece: Piece;
	game: Game;
	private discard = false;

	constructor(position: Point, target: Point, game: Game) {
		if (position instanceof Coord) {
			this.position = position;
			this.target = target as Coord;
		} else {
			this.position = new Coord(position[0], position[1]);
			this.target = new Coord((target as [number, number])[0], (target as [number, number])[1]);
		}
		const piece = game.board.at(position);
		if (!piece) {
			throw new Error('No piece at position');
		}
		this.piece = piece;
		this.game = game;
	}

	asPayload(): MovePayload {
		return {
			position: this.position,
			target: this.target,
			team: this.piece.team
		};
	}

	hasTarget(target: Point): boolean {
		return this.target.equals(target);
	}

	hasPosition(position: Point): boolean {
		return this.position.equals(position);
	}

	/**
	 * Check if the move is valid relative to the current game state
	 * @param committing if the move is being committed. Will skip move cost check if true, and log failed checks
	 * @param logAnyway if the move should log failed checks regardless of committing
	 * @returns true if the move is valid, false otherwise
	 */
	isValid(committing: boolean = false, logAnyway: boolean = false): boolean {
		const [x, y] = this.position;
		const [nx, ny] = this.target;

		const dx = nx - x;
		const dy = ny - y;

		// Check if it is the team's turn
		if (this.game.teamTurn !== this.piece?.team) {
			if (committing || logAnyway) console.log('Not team turn');
			return false;
		}

		// Check if the piece would exceed the move allowance
		if (!committing && this.game.movesUsed > this.game.config.moveAllowance - this.piece.moveCost) {
			if (committing || logAnyway) console.log('Move allowance exceeded');
			return false;
		}

		// Check if the move is within bounds
		if (nx < 0 || nx >= this.game.board.height || ny < 0 || ny >= this.game.board.width) {
			if (committing || logAnyway) console.log('Out of bounds');
			return false;
		}

		// Opponent's safe zone
		if (this.piece.team === Team.ONE && ny === this.game.board.width - 1) {
			if (committing || logAnyway) console.log('Opponent safe zone');
			return false;
		} else if (this.piece.team === Team.TWO && ny === 0) {
			if (committing || logAnyway) console.log('Opponent safe zone');
			return false;
		}

		// Check the piece can move in that direction
		if (!this.piece.moveOffsets.some(([ox, oy]) => ox === dx && oy === dy)) {
			if (committing || logAnyway) console.log('Invalid move offset');
			return false;
		}

		// Ensure column is not at max capacity
		if (this.game.config.sandCols.includes(ny)) {
			if (
				this.game.stagedTeamColCount(ny, this.piece.team, this.position) >=
				this.game.config.teamMaxInSandCol
			) {
				if (committing || logAnyway) console.log('Sand col full');
				return false;
			}
			// FIXME: Managed to move two pieces into the water column
		} else if (this.game.config.waterCols.includes(ny)) {
			if (
				this.game.stagedTeamColCount(ny, this.piece.team, this.position) >=
				this.game.config.teamMaxInWaterCol
			) {
				if (committing || logAnyway) console.log('Water col full');
				return false;
			}
		}

		let xOffset = nx;
		let yOffset = ny;

		const board = new Board(this.game.board); // Copy board

		this.game.applyPendingMoves(board);

		// Ensure it isn't hopping over pieces
		while (xOffset !== x || yOffset !== y) {
			if (board.at(xOffset, yOffset) !== null && board.at(xOffset, yOffset) !== this.piece) {
				if (committing || logAnyway) console.log('Piece in the way at', xOffset, yOffset);
				return false;
			}

			// TODO: Check if hopping over full water / sand col

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
	commit(board?: Board, removeMove: boolean = true): boolean {
		if (!board) {
			board = this.game.board;
		}

		if (removeMove) this.game.pendingMoves = this.game.pendingMoves.filter((move) => move !== this);

		board.board[this.position.x][this.position.y] = null;

		// Piece should be deleted if there is no target
		if (!this.discard) {
			if (board.board[this.target.x][this.target.y] === null) {
				board.board[this.target.x][this.target.y] = this.piece;
			}
		}

		return true;
	}

	isDangerous(): boolean {
		return this.game.board.posIsDangerous(this.target, this.piece.team);
	}

	static findHomePositions(game: Game, team: Team): Coord[] {
		const safeCol = team === Team.ONE ? 0 : game.board.width - 1;

		// Find empty safe col slot
		const rows = game.board.board
			.map((row, i) => i)
			.filter((i) => game.board.board[i][safeCol] === null);

		return rows.map((row) => new Coord(row, safeCol));
	}

	sendHome() {
		const safeSpots = Move.findHomePositions(this.game, this.piece.team);

		// No safe spot TODO: Needs balancing. Currently discards piece, should maybe store it for next turn?
		if (safeSpots.length == 0) {
			console.log('No space in Safe Zone, piece lost');
			this.discard = true;
		} else {
			// TODO: Choose where to put the piece
			this.target = safeSpots[0];
		}
		this.commit();
	}

	capture() {
		this.piece.flip();
		this.sendHome();
	}

	willCaptureCoords(): Coord[] {
		const board = new Board(this.game.board); // Copy board

		// Apply all pending moves to new board
		this.game.pendingMoves.forEach((move) => {
			move.commit(board, false);
		});

		return board.getDangerousPositions();
	}
}
