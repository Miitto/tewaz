import { Coord, type Point } from './Coord';
import { Fish, Hunter, PieceType, Team, type Piece } from './Piece.svelte';

/**
 * Represents a board with pieces on it.
 * Can calculate information based on pieces current locations
 */
export class Board {
	board: (Piece | null)[][];

	constructor(setup?: Board | string[]) {
		if (setup instanceof Board) {
			this.board = setup.board.map((row) => row.slice());
		} else if (Array.isArray(setup)) {
			this.board = Array.from({ length: setup.length }, () =>
				Array.from({ length: setup[0].length }, () => null)
			);
			this.setupBoard(setup);
		} else {
			// make a 5x11 board with pieces in end columns
			this.board = Array.from({ length: 5 }, () => Array.from({ length: 11 }, () => null));
			for (let i = 0; i < 5; i++) {
				this.board[i][0] = i == 2 ? new Hunter(Team.ONE) : new Fish(Team.ONE);
				this.board[i][10] = i == 2 ? new Hunter(Team.TWO) : new Fish(Team.TWO);
			}
		}
	}

	get width(): number {
		return this.board[0].length;
	}

	get height(): number {
		return this.board.length;
	}

	at(row: Point | number, col?: number): Piece | null {
		if (Array.isArray(row)) {
			[row, col] = row;
		}

		if (row instanceof Coord) {
			[row, col] = row;
		}

		if (col === undefined) {
			throw new Error('Invalid arguments');
		}

		return this.board[row][col];
	}

	/**
	 *
	 * @param col col to count
	 * @param team team to count
	 * @param moveOriginExclude ignore moves originating from this position (usually the move being checked)
	 * @param rowExcludes don't count pieces in these rows, usually from pieces in that location that are staged to move
	 * @returns number of pieces in the column from the given team
	 */
	teamColCount(
		col: number,
		team: Team,
		moveOriginExclude: Coord | null = null,
		rowExcludes: number[] | null = null
	): number {
		return this.board.filter(
			(row, i) =>
				(!rowExcludes || !rowExcludes.includes(i)) &&
				row[col]?.team === team &&
				(!moveOriginExclude || (i != moveOriginExclude.x && col != moveOriginExclude.y))
		).length;
	}

	isInBounds(pos: Point): boolean {
		const [row, col] = pos;
		return row >= 0 && row < this.board.length && col >= 0 && col < this.board[0].length;
	}

	setupBoard(rows: string[]) {
		rows = rows.filter((row) => row.length > 0);
		this.board = Array.from({ length: rows.length }, () =>
			Array.from({ length: rows[0].length }, () => null)
		);

		rows.forEach((row, y) => {
			const tiles = row.split('');
			tiles.forEach((tile, x) => {
				switch (tile) {
					case '.':
						this.board[y][x] = null;
						break;
					case 'f':
						this.board[y][x] = new Fish(Team.TWO);
						break;
					case 'F':
						this.board[y][x] = new Fish(Team.ONE);
						break;
					case 'h':
						this.board[y][x] = new Hunter(Team.TWO);
						break;
					case 'H':
						this.board[y][x] = new Hunter(Team.ONE);
						break;
				}
			});
		});
	}

	/**
	 * Check if a piece can capture a piece at a certain position
	 * @param pos position to check
	 * @returns true if a piece can capture a piece at pos
	 */
	posCanCapture(pos: Point, target: Point): boolean {
		const [x, y] = pos;
		const [tx, ty] = target;

		if (!this.isInBounds(pos) || !this.isInBounds(target)) {
			return false;
		}

		const piece = this.at(pos);
		const targetPiece = this.at(target);

		if (!piece || !targetPiece) {
			return false;
		}

		if (piece?.team === targetPiece?.team) {
			return false;
		}

		return piece?.captureOffsets.some(([dx, dy]) => {
			if (x + dx !== tx || y + dy !== ty) {
				return false;
			}

			return this.captureCheck(pos, [dx, dy]);
		});
	}

	/**
	 * Get all positions that are dangerous for a team
	 * @param team team to check
	 * @returns all positions that are dangerous for team
	 */
	getDangerousPositions(): Coord[] {
		const dangerousPositions: Coord[] = [];
		this.board.forEach((row, i) => {
			row.forEach((piece, j) => {
				piece?.captureOffsets.some(([dx, dy]) => {
					if (this.posCanCapture([i, j], [i + dx, j + dy])) {
						dangerousPositions.push(new Coord(i + dx, j + dy));
					}
				});
			});
		});
		return dangerousPositions;
	}

	/**
	 * Check if a certain position is dangerous
	 * @param pos position to check
	 * @returns true if pos is dangerous
	 */
	posIsDangerous(pos: Coord, team: Team): boolean {
		const [x, y] = pos;

		return this.board.some((row, i) => {
			return row.some((piece, j) => {
				if (!piece) {
					return false;
				}
				if (piece?.team === team) {
					return false;
				}
				return piece.captureOffsets.some(([dx, dy]) => {
					if (i + dx !== x || j + dy !== y) {
						return false;
					}

					return this.captureCheck([i, j], [dx, dy]);
				});
			});
		});
	}

	/**
	 * Check if the conditions are met for a piece to capture at this offset (mirror, same type, etc)
	 * @param pos pos that is attempting to capture
	 * @param offset offset to capture
	 * @returns true if the conditions are met
	 */
	private captureCheck(pos: Point, offset: [number, number]): boolean {
		const [x, y] = pos;
		const [dx, dy] = offset;

		const piece = this.at(pos);

		if (!piece) {
			return false;
		}

		if (piece.captureNeedsMirror) {
			const mirrorCoord = [x + dx * 2, y + dy * 2] as [number, number];
			if (!this.isInBounds(mirrorCoord)) {
				return false;
			}
			const mirroredPiece = this.at([x + dx * 2, y + dy * 2]);
			if (!mirroredPiece) {
				return false;
			}
			if (mirroredPiece.team !== piece.team) {
				return false;
			}
			if (mirroredPiece.captureMirrorSameType && mirroredPiece.type !== piece.type) {
				return false;
			}
			return true;
		} else {
			return true;
		}
	}

	toString(): string {
		return this.board.reduce(
			(acc, row) =>
				acc +
				row.reduce((acc, cell) => {
					if (cell === null) {
						return acc + '.';
					}
					const letter = cell.type === PieceType.FISH ? 'f' : 'h';

					if (cell.team === Team.ONE) {
						return acc + letter.toUpperCase();
					} else {
						return acc + letter;
					}
				}, '') +
				' ',
			''
		);
	}
}
