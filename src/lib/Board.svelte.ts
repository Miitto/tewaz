import { Coord, type Point } from './Coord';
import { Fish, Hunter, Team, type Piece } from './Piece.svelte';

export const safeZoneCols = [0, 10];
export const sandZoneCols = [4, 6];
export const waterZoneCols = [5];

export const boardWidth = 11;
export const boardHeight = 5;

export class Board {
	board: (Piece | null)[][] = $state<Array<Array<Piece | null>>>([]);

	constructor(copy?: Board) {
		if (copy) {
			this.board = copy.board.map((row) => row.slice());
		} else {
			// make a 5x11 board with pieces in end columns
			this.board = Array.from({ length: 5 }, () => Array.from({ length: 11 }, () => null));
			for (let i = 0; i < 5; i++) {
				this.board[i][0] = i == 2 ? new Hunter(Team.ONE) : new Fish(Team.ONE);
				this.board[i][10] = i == 2 ? new Hunter(Team.TWO) : new Fish(Team.TWO);
			}
		}
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

			if (piece.captureNeedsMirror) {
				const mirrorCoord = [x + dx * 2, y + dy * 2] as [number, number];
				if (!this.isInBounds(mirrorCoord)) {
					return false;
				}
				const mirroredPiece = this.at([x + dx * 2, y + dy * 2]);
				if (!mirroredPiece) {
					return false;
				}
				console.log('mirrored', mirroredPiece);
				if (mirroredPiece.team !== piece.team) {
					console.log('not same team');
					return false;
				}
				if (mirroredPiece.captureMirrorSameType && mirroredPiece.type !== piece.type) {
					console.log('not same type');
					return false;
				}
				return true;
			} else {
				return true;
			}
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
	 * Check if a certain position is dangerous for a team
	 * @param pos position to check
	 * @param team team it is dangerous for
	 * @returns true if pos is dangerous for team
	 */
	posIsDangerous(pos: Coord): boolean {
		const [x, y] = pos;

		return this.board.some((row, i) => {
			return row.some((piece, j) => {
				return piece?.captureOffsets.some(([dx, dy]) => {
					if (x + dx !== i || y + dy !== j) {
						return false;
					}

					return this.posCanCapture([i, j], [x, y]);
				});
			});
		});
	}
}
