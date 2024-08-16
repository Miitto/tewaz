import { Board, boardHeight, boardWidth, sandZoneCols, waterZoneCols } from './Board.svelte';
import { Coord, type Point } from './Coord';
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

	hasTarget(target: Point): boolean {
		return this.target.equals(target);
	}

	hasPosition(position: Point): boolean {
		return this.position.equals(position);
	}

	/**
	 * Check if the move is valid relative to the current game state
	 * @param committing if the move is being committed. Will skip move cost check if true, and log failed checks
	 * @returns true if the move is valid, false otherwise
	 */
	isValid(committing: boolean = false): boolean {
		const [x, y] = this.position;
		const [nx, ny] = this.target;

		const dx = nx - x;
		const dy = ny - y;

		// Check if it is the team's turn
		if (this.game.teamTurn !== this.piece?.team) {
			if (committing) console.log('Not team turn');
			return false;
		}

		// Check if the piece would exceed the move allowance
		if (!committing && this.game.movesUsed > this.game.moveAllowance - this.piece.moveCost) {
			if (committing) console.log('Move allowance exceeded');
			return false;
		}

		// Check if the move is within bounds
		if (nx < 0 || nx >= boardHeight || ny < 0 || ny >= boardWidth) {
			if (committing) console.log('Out of bounds');
			return false;
		}

		// Opponent's safe zone
		if (this.piece.team === Team.ONE && ny === boardWidth - 1) {
			if (committing) console.log('Opponent safe zone');
			return false;
		} else if (this.piece.team === Team.TWO && ny === 0) {
			if (committing) console.log('Opponent safe zone');
			return false;
		}

		// Check the piece can move in that direction
		if (!this.piece.moveOffsets.some(([ox, oy]) => ox === dx && oy === dy)) {
			if (committing) console.log('Invalid move offset');
			return false;
		}

		// Ensure column is not at max capacity
		if (sandZoneCols.includes(ny)) {
			if (
				this.game.stagedTeamColCount(ny, this.piece.team, this.position) >=
				this.game.teamMaxInSandCol
			) {
				if (committing) console.log('Sand col full');
				return false;
			}
		} else if (waterZoneCols.includes(ny)) {
			if (
				this.game.stagedTeamColCount(ny, this.piece.team, this.position) >=
				this.game.teamMaxInWaterCol
			) {
				if (committing) console.log('Water col full');
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
				if (committing) console.log('Piece in the way at', xOffset, yOffset);
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
			} else {
				console.log('Piece lost', this.piece);
			}
		}

		return true;
	}

	isDangerous(): boolean {
		return this.game.board.posIsDangerous(this.target, this.piece.team);
	}

	static findHomePositions(game: Game, team: Team): Coord[] {
		const safeCol = team === Team.ONE ? 0 : boardWidth - 1;

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
			console.log('Sending home', this.target);
		}
		this.commit();
	}

	capture() {
		console.log('Capturing', this.target);
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
