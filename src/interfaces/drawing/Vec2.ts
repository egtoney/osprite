/* eslint-disable @typescript-eslint/no-namespace */
export interface Vec2 {
	x: number;
	y: number;
}

export namespace Vec2 {
	export function diff(a: Vec2, b: Vec2): Vec2 {
		return {
			x: a.x - b.x,
			y: a.y - b.y
		};
	}

	export function equal(a: Vec2, b: Vec2): boolean {
		return a.x === b.x && a.y === b.y;
	}
}