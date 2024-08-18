import { Board } from './Board.svelte';
import { Coord, type Point } from './Coord';
import { Move } from './Move.svelte';
import { Team } from './Piece.svelte';
import { Tile } from './Tile.svelte';

export interface GameConfig {
	teamMaxInSandCol: number;
	teamMaxInWaterCol: number;
	moveAllowance: number;

	sandCols: number[];
	waterCols: number[];

	initialBoardSetup: string;
	startingTeam: Team | null;
}

/**
 * Local game state
 * Includes current board state, pending moves, and turn information
 * Will hold game configuration and rules
 */
export class Game {
	config: GameConfig = {
		teamMaxInSandCol: 2,
		teamMaxInWaterCol: 1,
		moveAllowance: 2,
		sandCols: [4, 6],
		waterCols: [5],
		startingTeam: null,
		initialBoardSetup:
			'F..........f ' + 'F..........f ' + 'H..........h ' + 'F..........f ' + 'F..........f'
	};

	board: Board = $state(new Board());

	/** Uncommitted Moves */
	stagedMoves: Move[] = $state([]);

	/** Turn number for game */
	turn: number = 0;

	constructor(config?: Partial<GameConfig>) {
		if (!config) {
			return;
		}
		if (config.initialBoardSetup) {
			this.config.initialBoardSetup = config.initialBoardSetup;
			this.setupBoard('0 ' + config.initialBoardSetup, []);
		}

		if (config.teamMaxInSandCol) {
			this.config.teamMaxInSandCol = config.teamMaxInSandCol;
		}

		if (config.teamMaxInWaterCol) {
			this.config.teamMaxInWaterCol = config.teamMaxInWaterCol;
		}

		if (config.moveAllowance) {
			this.config.moveAllowance = config.moveAllowance;
		}

		if (config.sandCols) {
			this.config.sandCols = config.sandCols;
		}

		if (config.waterCols) {
			this.config.waterCols = config.waterCols;
		}

		if ((config.startingTeam ?? null) !== null) {
			this.config.startingTeam = config.startingTeam as Team;
		} else {
			this.config.startingTeam = Math.random() > 0.5 ? Team.ONE : Team.TWO;
		}
	}

	/** Moves left in turn */
	get movesUsed() {
		return this.stagedMoves.reduce((acc, cur) => acc + cur.piece.moveCost, 0);
	}

	/** Calculated tiles on the board */
	tiles: Tile[][] = $derived(
		this.board.board.map((row, i) =>
			row.map((col, j) => {
				const tile = new Tile(
					this.board.at(i, j),
					new Coord(i, j),
					[0, row.length - 1],
					this.config.sandCols,
					this.config.waterCols
				);

				// Check if the tile is moving
				if (this.stagedMoves.some((m) => m.position.x == i && m.position.y == j)) {
					tile.moving = true;
				}

				// Check if a tile has been moved here
				if (this.stagedMoves.some((m) => m.target.x == i && m.target.y == j)) {
					tile.movingTo = true;
				}

				return tile;
			})
		)
	);

	/** Team whose turn it is */
	get teamTurn() {
		return this.turn % 2 === (this.config.startingTeam === Team.ONE ? 0 : 1) ? Team.ONE : Team.TWO;
	}

	/**
	 * Pend a move to be committed later
	 * @param coords position of the piece to move
	 * @param target target position to move the piece to
	 * @returns if the piece can be moved to that position
	 */
	stageMove(coords: Point, target: Point, logFailure: boolean = false): boolean {
		const move = new Move(coords, target, this);
		if (move.isValid(false, logFailure)) {
			this.stagedMoves.push(move);
			return true;
		}
		return false;
	}

	/**
	 * Remove a move from the pending moves
	 * @param target position of the staged move target
	 */
	unstageMove(target: Point) {
		this.stagedMoves = this.stagedMoves.filter((move) => !move.hasTarget(target));
		let preLen = this.stagedMoves.length + 1;
		while (preLen > this.stagedMoves.length) {
			preLen = this.stagedMoves.length;
			this.stagedMoves = this.stagedMoves.filter((move) => move.isValid());
		}
	}

	/**
	 * Attempt to commit all staged moves
	 * @returns if all moves have been committed
	 */
	commitStagedMoves(): boolean {
		if (this.stagedMoves.some((move) => !move.isValid(true))) {
			console.log('Some moves cannot be committed');
			return false;
		}
		this.stagedMoves.forEach((move) => {
			move.commit();
		});
		return true;
	}

	/**
	 * Process the end of a turn. Commit moves, capture pieces, increment turn number
	 */
	endTurn() {
		// This needs to be before any pieces are taken, otherwise the moves used will be incorrect
		if (this.movesUsed < this.config.moveAllowance) {
			console.log('Not all moves used');
			return false;
		}

		const dangerousMoves = this.stagedMoves.filter((move) => move.isDangerous());

		dangerousMoves.map((move) => {
			move.piece.flip();
			move.sendHome();
		});

		if (!this.commitStagedMoves()) {
			return false;
		}

		// Find pieces to capture
		this.board.getDangerousPositions().forEach((pos) => {
			const piece = this.board.at(pos);
			if (piece) {
				new Move(pos, pos, this).capture();
			}
		});

		this.turn++;

		return true;
	}

	/**
	 *
	 * @param col col to count
	 * @param team team co count
	 * @param moveOriginExclude ignore moves originating from this position (usually the move being checked)
	 * @returns number of pieces in the column from the given team
	 */
	stagedTeamColCount(col: number, team: Team, moveOriginExclude: Coord | null = null): number {
		const board = new Board(this.board);

		this.applyStagedMoves(board);

		return board.teamColCount(col, team, moveOriginExclude);
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
		this.stagedMoves.forEach((move) => move.commit(board, false));

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
	applyStagedMoves(board: Board) {
		this.stagedMoves.forEach((move) => move.commit(board, false));
	}

	/**
	 * Set up the board from a string
	 * @param str Board state as a string. Each set is separated by a space, with the first being the turn number. All sets afterwards are the rows, and each character in a row is a piece. '.' is empty, 'f' is fish'h' is hunter. Lowercase is team 2, uppercase is team 1
	 * @param pendingMoves List of pending moves to set up
	 */
	setupBoard(str: string, pendingMoves: [[number, number], [number, number]][]) {
		const [turn, ...rows] = str.split(' ');

		this.turn = parseInt(turn);

		this.board.setupBoard(rows);

		this.stagedMoves = pendingMoves.map(
			([position, target]) =>
				new Move(new Coord(position[0], position[1]), new Coord(target[0], target[1]), this)
		);
	}
}
