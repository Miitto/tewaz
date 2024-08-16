import { Board } from './Board.svelte';
import { Coord } from './Coord';
import { Move } from './Move.svelte';
import { Team } from './Piece.svelte';
import { Tile } from './Tile.svelte';

export class Game {
	/** Max pieces per team in a sand col */
	teamMaxInSandCol = 2;
	/** Max pieces per team in a water col */
	teamMaxInWaterCol = 1;

	/** Move cost allowed per turn - all must be used */
	moveAllowance = 2;

	board: Board = $state(new Board());

	/** Uncommitted Moves */
	pendingMoves: Move[] = $state([]);

	/** Turn number for game */
	turn: number = $state(0);

	/** Moves left in turn */
	movesUsed = $derived(this.pendingMoves.reduce((acc, cur) => acc + cur.piece.moveCost, 0));

	/** Calculated tiles on the board */
	tiles: Tile[][] = $derived(
		this.board.board.map((row, i) =>
			row.map((col, j) => {
				const tile = new Tile(this.board.at(i, j), new Coord(i, j));

				// Check if the tile is moving
				if (this.pendingMoves.some((m) => m.position.x == i && m.position.y == j)) {
					tile.moving = true;
				}

				// Check if a tile has been moved here
				if (this.pendingMoves.some((m) => m.target.x == i && m.target.y == j)) {
					tile.movingTo = true;
				}

				return tile;
			})
		)
	);

	/** Team whose turn it is */
	teamTurn = $derived(this.turn % 2 === 0 ? Team.ONE : Team.TWO);

	constructor() {
		this.turn = 0;
	}

	/**
	 * Pend a move to be committed later
	 * @param coords position of the piece to move
	 * @param vector offset to move the piece by
	 * @returns if the piece can be moved to that position
	 */
	stageMove(coords: Coord, vector: Coord): boolean {
		const move = new Move(coords, vector, this);
		if (move.isValid()) {
			this.pendingMoves.push(move);
			return true;
		}
		return false;
	}

	/**
	 * Remove a move from the pending moves
	 * @param target position of the staged move target
	 */
	unstageMove(target: Coord) {
		this.pendingMoves = this.pendingMoves.filter((move) => !move.hasTarget(target));
		let preLen = this.pendingMoves.length + 1;
		while (preLen > this.pendingMoves.length) {
			preLen = this.pendingMoves.length;
			this.pendingMoves = this.pendingMoves.filter((move) => move.isValid());
		}
	}

	/**
	 * Attempt to commit all staged moves
	 * @returns if all moves have been committed
	 */
	commitStagedMoves(): boolean {
		if (this.pendingMoves.some((move) => !move.isValid(true))) {
			console.log('Some moves cannot be committed');
			return false;
		}
		this.pendingMoves.forEach((move) => {
			move.commit();
		});
		return true;
	}

	/**
	 * Process the end of a turn. Commit moves, capture pieces, increment turn number
	 */
	endTurn() {
		// This needs to be before any pieces are taken, otherwise the moves used will be incorrect
		if (this.movesUsed < this.moveAllowance) {
			console.log('Not all moves used');
			return false;
		}

		const dangerousMoves = this.pendingMoves.filter((move) => move.isDangerous());

		dangerousMoves.map((move) => {
			move.piece.flip();
			move.sendHome();
		});

		if (!this.commitStagedMoves()) {
			return;
		}

		// Find pieces to capture
		this.board.getDangerousPositions().forEach((pos) => {
			console.log('Capturing', pos);
			const piece = this.board.at(pos);
			if (piece) {
				new Move(pos, pos, this).capture();
			}
		});

		this.turn++;
	}

	/**
	 *
	 * @param col col to count
	 * @param team team co count
	 * @param moveOriginExclude ignore moves originating from this position (usually the move being checked)
	 * @returns number of pieces in the column from the given team
	 */
	stagedTeamColCount(col: number, team: Team, moveOriginExclude: Coord | null = null): number {
		// rows in this column that are moving.
		const movingRows = this.pendingMoves
			.filter((move) => move.position.y === col)
			.map((move) => move.position.x);

		// Count pieces in this column, passing in the moving rows to exclude them from the count
		const current = this.board.teamColCount(col, team, moveOriginExclude, movingRows);

		// Count pending moves that would affect this column, excluding the move being checked
		const pending = this.pendingMoves.filter(
			(move) =>
				move.target.y === col && move.piece.team === team && move.position !== moveOriginExclude
		);

		return current + pending.length;
	}

	/**
	 * Process game state to get a state for each tile on the board including pending moves
	 * @param row board row
	 * @param col board column
	 * @returns Tile at the given row and column with info about its current state
	 */
	getTile(row: number, col: number) {
		return this.tiles[row][col];
	}

	/**
	 *
	 * @param row row of piece to check
	 * @param col column of piece to check
	 * @returns all valid moves that piece can make
	 */
	getMoves(pos: Coord | null): Move[] {
		if (!pos) {
			return [];
		}
		const [row, col] = pos;

		// If col is still null, then row was a number or invalid array and col was not provided
		if (col === null || col === undefined) {
			throw new Error('Invalid arguments');
		}

		// Apply all pending moves to a new board so we get up to date information
		const board = new Board(this.board);
		this.pendingMoves.forEach((move) => move.commit(board, false));

		return (
			(board
				.at(row, col)
				?.moveOffsets // Map offsets to coordinates
				.map((offset) => {
					const [dx, dy] = offset;
					return new Move(new Coord(row, col), new Coord(row + dx, col + dy), this);
				})
				.filter((move) => move.isValid()) as Move[]) ?? []
		);
	}

	/**
	 * Apply all pending moves to a given board. Will not remove the moves from the pending list. Used for creating a board state with pending moves
	 * @param board board to apply moves to
	 */
	applyPendingMoves(board: Board) {
		this.pendingMoves.forEach((move) => move.commit(board, false));
	}
}
