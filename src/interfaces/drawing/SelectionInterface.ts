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

	export function clearSelection(instance: DrawingInterface): void {
		if (instance.selection) {
			ImageInterface.insertIntoLayer(
				instance,
				0,
				Polygon.toAabb(instance.selection.points),
				instance.selection.data,
				true,
			);
			delete instance.selection;
		}
	}
}
