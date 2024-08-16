export const enum PieceType {
	FISH,
	HUNTER
}

export const enum Team {
	ONE,
	TWO
}

/**
 * Represents a piece on the board.
 */
export interface Piece {
	team: Team;

	get type(): PieceType;
	moveOffsets: [number, number][];
	get moveCost(): number;
	get captureOffsets(): [number, number][];
	get captureNeedsMirror(): boolean;
	get captureMirrorSameType(): boolean;
	flip(): void;
}

export class Fish implements Piece {
	team: Team;
	t: PieceType;

	constructor(team: Team) {
		this.team = team;
		this.t = PieceType.FISH;
	}

	get type(): PieceType {
		return this.t;
	}

	get moveOffsets(): [number, number][] {
		return [
			[1, 0],
			[-1, 0],
			[0, 1],
			[0, -1],
			[2, 0],
			[-2, 0],
			[0, 2],
			[0, -2],
			[1, 1],
			[-1, 1],
			[1, -1],
			[-1, -1],
			[2, 2],
			[-2, 2],
			[2, -2],
			[-2, -2]
		];
	}

	get captureOffsets(): [number, number][] {
		// Straight lines
		return [
			[1, 0],
			[-1, 0],
			[0, 1],
			[0, -1]
		];
	}

	get captureNeedsMirror(): boolean {
		return true;
	}

	get captureMirrorSameType(): boolean {
		return true;
	}

	get moveCost(): number {
		return 1;
	}

	flip() {
		this.team = this.team === Team.ONE ? Team.TWO : Team.ONE;
	}
}

export class Hunter implements Piece {
	team: Team;
	t: PieceType;

	constructor(team: Team) {
		this.team = team;
		this.t = PieceType.HUNTER;
	}
	get type(): PieceType {
		return this.t;
	}
	get moveOffsets(): [number, number][] {
		return [
			[0, 1],
			[1, 0],
			[0, -1],
			[-1, 0]
		];
	}

	get captureOffsets(): [number, number][] {
		// All directions
		return [
			[1, 1],
			[-1, 1],
			[1, -1],
			[-1, -1],
			[0, 1],
			[1, 0],
			[0, -1],
			[-1, 0]
		];
	}

	get captureNeedsMirror(): boolean {
		return false;
	}

	get captureMirrorSameType(): boolean {
		return false;
	}

	get moveCost(): number {
		return 2;
	}

	flip() {
		this.team = this.team === Team.ONE ? Team.TWO : Team.ONE;
	}
}
