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
		console.log('Pending move');

		const move = new Move(coords, vector, this);

		if (move.isValid()) {
			console.log('Move is valid');
			this.pendingMoves.push(move);
			return true;
		}
		console.log('Move is not valid');
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

		console.log('Committing moves');
		// Commit moves, and filter out all that succeeded

		if (this.pendingMoves.some((move) => !move.isValid(true))) {
			console.log('Some moves cannot be committed');
			return;
		}
		this.pendingMoves.forEach((move) => {
			move.commit();
		});
		this.turn++;
	}

	/** Get team pieces in a column including none committed moves */
	stagedTeamColCount(col: number, team: Team, excludeMove: Move | null = null): number {
		const current = this.board.teamColCount(col, team);

		// Count pending moves that would affect this column
		const pending = this.pendingMoves.filter(
			(move) => move.target[1] === col && move.piece.team === team && move !== excludeMove
		).length;

		return current + pending;
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
				// Filter out moves that are out of bounds
				.filter(([x, y]) => {
					return x >= 0 && x < 5 && y >= 0 && y < 11;
				})
				// Filter out moves that would result in a collision
				.filter(([x, y]) => {
					return this.board.at(x, y) === null;
				})
				// Filter out moves that would collide with a pending move
				.filter(([x, y]) => {
					return !this.pendingMoves.some((move) => move.target[0] === x && move.target[1] === y);
				})
				// Check you can't hop over pieces
				.filter(([x, y]) => {
					while (x !== row && y !== col) {
						if (this.board.at(x, y) !== null) {
							return false;
						}

						x -= x > row ? 1 : x < row ? -1 : 0;
						y -= y > col ? 1 : y < col ? -1 : 0;
					}
					return true;
				}) as [number, number][]) ?? []
		);
	}
}
