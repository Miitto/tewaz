import { Board } from './Board.svelte';
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
				const tile = new Tile(this.board.at(i, j), [i, j]);

				// Check if the tile is moving
				if (this.pendingMoves.some((m) => m.position[0] == i && m.position[1] == j)) {
					tile.moving = true;
				}

				// Check if a tile has been moved here
				if (this.pendingMoves.some((m) => m.target[0] == i && m.target[1] == j)) {
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
	stageMove(coords: [number, number], vector: [number, number]): boolean {
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
	unstageMove(target: [number, number]) {
		this.pendingMoves = this.pendingMoves.filter((move) => !move.hasTarget(target));
	}

	/**
	 * Commit all moves and end turn
	 */
	endTurn() {
		if (this.movesUsed < this.moveAllowance) {
			console.log('Not all moves used');
			return;
		}

		if (this.pendingMoves.some((move) => !move.isValid(true))) {
			console.log('Some moves cannot be committed');
			return;
		}
		this.pendingMoves.forEach((move) => {
			move.commit();
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
	stagedTeamColCount(
		col: number,
		team: Team,
		moveOriginExclude: [number, number] | null = null
	): number {
		// rows in this column that are moving.
		const movingRows = this.pendingMoves
			.filter((move) => move.position[1] === col)
			.map((move) => move.position[0]);

		// Count pieces in this column, passing in the moving rows to exclude them from the count
		const current = this.board.teamColCount(col, team, moveOriginExclude, movingRows);

		// Count pending moves that would affect this column, excluding the move being checked
		const pending = this.pendingMoves.filter(
			(move) =>
				move.target[1] === col && move.piece.team === team && move.position !== moveOriginExclude
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
	getMoves(row: number | [number, number] | null, col: number | null = null): [number, number][] {
		// Allow for both getMoves(row, col) and getMoves([row, col]). If row is null, return an empty array.
		if (Array.isArray(row)) {
			[row, col] = row;
		}

		if (row === null) {
			return [];
		}

		// If col is still null, then row was a number or invalid array and col was not provided
		if (col === null) {
			throw new Error('Invalid arguments');
		}

		return (
			(this.board
				.at(row, col)
				?.getMoveOffsets()
				// Map offsets to coordinates
				.map((offset) => {
					const [dx, dy] = offset;
					return [row + dx, col + dy];
				})
				// Create a move object to check if the move is valid TODO: Maybe make this static so you don't need to create a move object?
				.filter(([x, y]) => {
					const move = new Move([row, col], [x, y], this);
					return move.isValid();
				}) as [number, number][]) ?? []
		);
	}
}
