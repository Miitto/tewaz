import type { Coord } from './Coord';
import type { Piece } from './Piece.svelte';

export const enum Terrain {
	SAFE,
	NORMAL,
	SAND,
	WATER
}

/**
 * Represents a tile on the board with calculated state.
 */
export class Tile {
	committed = false;
	piece: Piece | null = null;

	/** Original position of the piece */
	moving = false;
	/** Pending position of the piece */
	movingTo = false;

	danger = false;
	type: Terrain;

	constructor(
		piece: Piece | null,
		coords: Coord,
		safeZoneCols: number[],
		sandZoneCols: number[],
		waterZoneCols: number[]
	) {
		this.piece = piece;
		const y = coords.y;

		if (safeZoneCols.includes(y)) {
			this.type = Terrain.SAFE;
		} else if (sandZoneCols.includes(y)) {
			this.type = Terrain.SAND;
		} else if (waterZoneCols.includes(y)) {
			this.type = Terrain.WATER;
		} else {
			this.type = Terrain.NORMAL;
		}
	}

	getClass() {
		switch (this.type) {
			case Terrain.SAFE:
				return 'safe';
			case Terrain.SAND:
				return 'sand';
			case Terrain.WATER:
				return 'water';
			default:
				return '';
		}
	}

	get team() {
		return this.piece?.team;
	}
}
