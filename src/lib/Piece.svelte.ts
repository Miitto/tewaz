export const enum PieceType {
	FISH,
	HUNTER
}

export const enum Team {
	ONE,
	TWO
}

export interface Piece {
	team: Team;

	get type(): PieceType;
	instanceNo: number;
	getMoveOffsets(): [number, number][];
	getMoveCost(): number;
}

export class Fish implements Piece {
	team: Team;
	t: PieceType;
	instanceNo: number;
	static nextNo = 0;

	constructor(team: Team) {
		this.team = team;
		this.t = PieceType.FISH;
		this.instanceNo = Fish.nextNo;
		Fish.nextNo++;
	}

	get type(): PieceType {
		return this.t;
	}

	getMoveOffsets(): [number, number][] {
		return [[1, 0], [-1, 0], [0, 1], [0, -1], [2, 0], [-2, 0], [0, 2], [0, -2], [1, 1], [-1, 1], [1, -1], [-1, -1], [2, 2], [-2, 2], [2, -2], [-2, -2]]
	}

	getMoveCost(): number {
		return 1;
	}
}

export class Hunter implements Piece {
	team: Team;
	t: PieceType;
	instanceNo: number;
	static nextNo = 0;

	constructor(team: Team) {
		this.team = team;
		this.t = PieceType.HUNTER;
		this.instanceNo = Hunter.nextNo;
		Hunter.nextNo++;
	}
	get type(): PieceType {
		return this.t;
	}
	getMoveOffsets(): [number, number][] {
		return [[1, 1], [-1, 1], [1, -1], [-1, -1]];
	}
	getMoveCost(): number {
		return 2;
	}
}
