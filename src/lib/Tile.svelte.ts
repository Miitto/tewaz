import type { Piece } from "./Piece.svelte";

export const enum Terrain {
	SAFE,
	NORMAL,
	SAND,
	WATER
}

export class Tile {
	committed = false;
	piece: Piece | null = null;
	moving = false;
	movingTo = false;
	danger = false;
	type: Terrain;

	constructor(piece: Piece | null, coords: [number, number]) {
		this.piece = piece;
		console.log("Tile is of piece: ", piece?.type);

		const y = coords[1];

		if (y == 0 || y == 10) {
			this.type = Terrain.SAFE;
		} else if (y == 4 || y == 6) {
			this.type = Terrain.SAND;
		} else if (y == 5) {
			this.type = Terrain.WATER;
		} else {
			this.type = Terrain.NORMAL;
		}
	}

	getClass() {
		switch (this.type) {
			case Terrain.SAFE:
				return "safe";
			case Terrain.SAND:
				return "sand";
			case Terrain.WATER:
				return "water";
			default:
				return "";
		}
	}
}
