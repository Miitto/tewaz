export type Point = Coord | [number, number];

/**
 * Represents a point on the board.
 */
export class Coord {
	x: number;
	y: number;

	constructor(x: number | [number, number], y?: number) {
		if (Array.isArray(x)) {
			[x, y] = x;
		}

		if (y === undefined) {
			throw new Error('y is required if x is not an array');
		}

		this.x = x;
		this.y = y;
	}

	toString(): string {
		return `(${this.x}, ${this.y})`;
	}

	equals(other: Point): boolean {
		const [row, col] = other;
		return this.x === row && this.y === col;
	}

	*[Symbol.iterator](): IterableIterator<number> {
		for (const i of [this.x, this.y]) {
			yield i;
		}
	}
}
