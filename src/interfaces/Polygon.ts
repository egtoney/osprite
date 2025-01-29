/* eslint-disable @typescript-eslint/no-namespace */
import { AABB } from "./AABB";
import { Vec2 } from "./drawing/Vec2";

export type Polygon = Vec2[];

export namespace Polygon {
	/**
	 * Check if a point is inside or on the edge of a polygon
	 * @param {number[]} point - [x, y] coordinates of the point
	 * @param {Array<number[]>} polygon - Array of points [[x1, y1], [x2, y2], ...] defining the polygon
	 * @returns {boolean} True if the point is inside or on the edge, otherwise false
	 */
	export function contains(polygon: Polygon, point: Vec2) {
		const px = point.x;
		const py = point.y;
		let isInside = false;

		for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
			const xi = polygon[i].x;
			const yi = polygon[i].y;
			const xj = polygon[j].x;
			const yj = polygon[j].y;

			// Check if point is on the edge
			if (
				(py - yi) * (xj - xi) === (px - xi) * (yj - yi) && // Collinear check
				Math.min(xi, xj) <= px &&
				px <= Math.max(xi, xj) &&
				Math.min(yi, yj) <= py &&
				py <= Math.max(yi, yj)
			) {
				return true; // Point is on an edge
			}

			// Check if the ray crosses the edge
			const intersects =
				yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;
			if (intersects) {
				isInside = !isInside;
			}
		}

		return isInside;
	}

	export function toAabb(polygon: Polygon): AABB {
		const xArr = polygon.map((p) => p.x);
		const left = xArr.reduce(
			(a, b) => (a < b ? a : b),
			Number.POSITIVE_INFINITY,
		);
		const right = xArr.reduce(
			(a, b) => (a > b ? a : b),
			Number.NEGATIVE_INFINITY,
		);

		const yArr = polygon.map((p) => p.y);
		const top = yArr.reduce(
			(a, b) => (a < b ? a : b),
			Number.POSITIVE_INFINITY,
		);
		const bottom = yArr.reduce(
			(a, b) => (a > b ? a : b),
			Number.NEGATIVE_INFINITY,
		);

		return {
			x: left,
			y: top,
			width: right - left,
			height: bottom - top,
		};
	}
}
