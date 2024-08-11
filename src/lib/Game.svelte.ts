import { Board } from "./Board.svelte";
import { Move } from "./Move.svelte";
import { Team } from "./Piece.svelte";
import { Tile } from "./Tile.svelte";
import { type Piece, Fish, Hunter } from "./Piece.svelte";

export class Game {
	board: Board;
	pendingMoves: Move[];
	turn: number = 0;

	constructor() {
		this.board = new Board();
		this.pendingMoves = [];
		this.turn = 0;
	}

	getTeamTurn(): Team {
		return this.turn % 2 === 0 ? Team.ONE : Team.TWO;
	}

	pendMove(coords: [number, number], vector: [number, number]): boolean {
		const [x, y] = coords;

		if (this.board.at(x, y) === null) {
			return false;
		}

		const move = new Move(coords, vector, this.board.at(x, y)!);

		if (move.isValid(this.board)) {
			this.pendingMoves.push(move);
			return true;
		}
		return false;

	}

	getTile(row: number, col: number) {
		if (this.pendingMoves.some((m) => {
			const [x, y] = m.position;

			if (x == row && y == col) {
				return true;
			}
		})) {
			const tile = new Tile(this.board.at(row, col), [row, col]);

			tile.moving = true;

			return tile;
		}

		return new Tile(this.board.at(row, col), [row, col]);
	}

	getMoves(row: (number | [number, number] | null), col: (number | null) = null) {
		if (Array.isArray(row)) {
			[row, col] = row;
		}
		if (col === null) {
			throw new Error('Invalid arguments');
		}

		if (row === null) {
			return [];
		}

		return this.board.at(row, col)?.getMoveOffsets().map((offset) => {
			const [dx, dy] = offset;
			return [row + dx, col + dy];
		}).filter(([x, y]) => {
			return x >= 0 && x < 5 && y >= 0 && y < 11;
		}).filter(([x, y]) => {
			return this.board.at(x, y) === null;
		});
	}
}
