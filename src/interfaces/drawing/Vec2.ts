/* eslint-disable @typescript-eslint/no-namespace */
export interface Vec2 {
	x: number;
	y: number;
}

export namespace Vec2 {
	export function diff(a: Vec2, b: Vec2): Vec2 {
		return {
			x: a.x - b.x,
			y: a.y - b.y,
		};
	}

	export function equal(a: Vec2, b: Vec2): boolean {
		return a.x === b.x && a.y === b.y;
	}

	export function clamp(a: Vec2, min: Vec2, max: Vec2): Vec2 {
		return {
			x: Math.max(min.x, Math.min(a.x, max.x)),
			y: Math.max(min.y, Math.min(a.y, max.y)),
		};
	}
}
