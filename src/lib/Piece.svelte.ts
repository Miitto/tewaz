export const enum PieceType {
	FISH,
	HUNTER
}

export const enum Team {
	ONE,
	TWO
}

export interface Piece {
	type: PieceType;
	team: Team;

	getType(): PieceType;
	getMoveOffsets(): [number, number][];
	getMoveCost(): number;
}

export class Fish {
	type: PieceType;
	team: Team;

	constructor(team: Team) {
		this.type = PieceType.FISH;
		this.team = team;
	}

	getType(): PieceType {
		return this.type;
	}

	getMoveOffsets(): [number, number][] {
		return [[1, 0], [-1, 0], [0, 1], [0, -1], [2, 0], [-2, 0], [0, 2], [0, -2], [1, 1], [-1, 1], [1, -1], [-1, -1], [2, 2], [-2, 2], [2, -2], [-2, -2]]
	}

	getMoveCost(): number {
		return 1;
	}
}

export class Hunter {
	type: PieceType;
	team: Team;
	constructor(team: Team) {
		this.type = PieceType.HUNTER;
		this.team = team;
	}
	getType(): PieceType {
		return this.type;
	}
	getMoveOffsets(): [number, number][] {
		return [[1, 1], [-1, 1], [1, -1], [-1, -1]];
	}
	getMoveCost(): number {
		return 2;
	}
}
