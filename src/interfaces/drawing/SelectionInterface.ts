import { assert } from "../../lib/lang";
import { Polygon } from "../Polygon";
import { Vec2 } from "../Vec2";
import { DrawingInterface } from "./DrawingInterface";
import { ImageInterface, ImageInterfaceSlice } from "./ImageInterface";

export interface SelectionInterface {
	moving: boolean;
	/** offset to use when moving selection to account for where the cursor pressed */
	cursorOffset: Vec2;
	translation: Vec2;
	points: Polygon;
	data: ImageInterfaceSlice;
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace SelectionInterface {
	export function fromImage(image: ImageInterfaceSlice): SelectionInterface {
		return {
			moving: false,
			cursorOffset: { x: 0, y: 0 },
			translation: { x: 0, y: 0 },
			points: [
				{ x: 0, y: 0 },
				{ x: image.width, y: 0 },
				{ x: image.width, y: image.height },
				{ x: 0, y: image.height },
			],
			data: image,
		};
	}

	export function clearSelection(instance: DrawingInterface): boolean {
		if (instance.selection) {
			ImageInterface.insertIntoLayer(
				instance,
				0,
				Polygon.toAabb(instance.selection.points),
				instance.selection.data,
				true,
			);

			delete instance.selection;

			return true;
		}
		return false;
	}

	export function startSelection(
		instance: DrawingInterface,
		points: Polygon,
	): boolean {
		const aabb = Polygon.toAabb(points);

		// check that the new selection wasn't just an empty click
		if (aabb.width === 0 || aabb.height === 0) {
			return false;
		}

		// cut selection out of image
		const data: ImageInterfaceSlice = ImageInterface.spliceLayer(
			instance.image,
			0,
			aabb,
		);
		assert(data.data.length > 0);

		// create the new selection
		instance.selection = {
			moving: false,
			cursorOffset: { x: 0, y: 0 },
			translation: { x: 0, y: 0 },
			data,
			points,
		};

		return true;
	}

	export function moveSelection(instance: DrawingInterface, delta: Vec2) {
		assert(instance.selection, "selection must be set before trying to move");

		instance.selection.points = instance.selection.points.map((p) => {
			return { x: p.x + delta.x, y: p.y + delta.y };
		});
	}

	export function updateSelection(
		instance: DrawingInterface,
		polygon: Polygon,
	) {
		assert(instance.selection, "selection must be set before updating");

		instance.selection.moving = false;
		instance.selection.translation = { x: 0, y: 0 };
		instance.selection.points = [...polygon];
	}
}
