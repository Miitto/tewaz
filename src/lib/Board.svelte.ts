import { Move } from './Move.svelte';
import { type Piece, Fish, Hunter, Team } from './Piece.svelte';
export class Board {
	board: (Piece | null)[][];
	turn: number;
	pendingMoves: Move[] = [];

	getTeamTurn(): Team {
		return this.turn % 2 === 0 ? Team.ONE : Team.TWO;
	}

	constructor() {
		this.board = Array(5).fill(Array(11).fill(null));
		this.turn = 0;
	}

	pendMove(coords: [number, number], vector: [number, number]): boolean {
		const [x, y] = coords;

		if (this.board[x][y] === null) {
			return false;
		}

		const move = new Move(coords, vector, this.board[x][y]);

		if (move.isValid(this)) {
			this.pendingMoves.push(move);
			return true;
		}
		return false;
	}
}
