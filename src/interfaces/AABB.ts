import { assert } from "../lib/lang";

/**
 * Assertions
 * - width and height will always be positive number or zero
 */
export interface AABB {
	x: number;
	y: number;
	width: number;
	height: number;
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace AABB {
	/**
	 * Creates an axis-aligned bounding box (AABB) from the given width and height.
	 * The AABB will be positioned at (0,0).
	 *
	 * @param {number} width - The width of the bounding box.
	 * @param {number} height - The height of the bounding box.
	 * @returns {AABB} - A new AABB with the specified width and height, positioned at (0,0).
	 *
	 * @example
	 * const box = fromSize(10, 20);
	 * console.log(box); // { x: 0, y: 0, width: 10, height: 20 }
	 */
	export function fromSize(width: number, height: number): AABB {
		return { x: 0, y: 0, width, height };
	}

	/**
	 * Checks if two axis-aligned bounding boxes (AABB) intersect.
	 *
	 * @param {AABB} a - The first AABB.
	 * @param {AABB} b - The second AABB.
	 * @returns {boolean} - Returns `true` if the AABBs intersect, otherwise `false`.
	 *
	 * @example
	 * const a = { x: 0, y: 0, width: 10, height: 10 };
	 * const b = { x: 5, y: 5, width: 10, height: 10 };
	 * console.log(intersect(a, b)); // true
	 *
	 * @example
	 * const c = { x: 20, y: 20, width: 10, height: 10 };
	 * console.log(intersect(a, c)); // false
	 */
	export function intersect(a: AABB, b: AABB): boolean {
		return (
			a.x < b.x + b.width &&
			a.x + a.width > b.x &&
			a.y < b.y + b.height &&
			a.y + a.height > b.y
		);
	}

	/**
	 * Clamps the bounds of a by b. Basically ensures that a does not extend past the bounds of b.
	 *
	 * @throws if clamp would result in an invalid aabb
	 * @throws if b does not at least partially contain a
	 */
	export function clamp(a: AABB, b: AABB): AABB {
		// compute bounds
		const left = Math.max(a.x, b.y);
		const right = Math.min(a.x + a.width, b.x + b.width);
		const top = Math.max(a.y, b.y);
		const bottom = Math.min(a.y + a.height, b.y + b.height);

		// validate bounds
		assert(right >= left);
		assert(bottom >= top);

		// return valid aabb
		return {
			x: left,
			y: top,
			width: right - left,
			height: bottom - top,
		};
	}
}
