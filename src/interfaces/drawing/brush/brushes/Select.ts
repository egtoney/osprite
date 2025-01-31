import { assert } from "../../../../lib/lang";
import { Polygon } from "../../../Polygon";
import { Vec2 } from "../../../Vec2";
import { CoordinateInterface } from "../../CoordinateInterface";
import { DrawingInterface } from "../../DrawingInterface";
import { ImageInterface, ImageInterfaceSlice } from "../../ImageInterface";
import { SelectionInterface } from "../../SelectionInterface";
import { BrushTrigger } from "../BrushTrigger";

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Select {
	export function useBrushSelect(
		instance: DrawingInterface,
		trigger: BrushTrigger,
		ix: number,
		iy: number,
	) {
		// if cursor is in selection consider it a move
		if (trigger === BrushTrigger.START) {
			// check if ix, iy in an existing selection (this would be a move)
			if (
				instance.selection &&
				Polygon.contains(instance.selection.points, { x: ix, y: iy })
			) {
				instance.selection.moving = true;
			}
		}

		// if cursor moving
		if (trigger === BrushTrigger.MOVE) {
			// move selection flagged for move
			if (instance.selection?.moving === true) {
				const start = CoordinateInterface.toImageCoords(
					instance,
					CoordinateInterface.toPointerCoords(
						instance,
						instance.brush.press.start,
					),
				);
				const delta = Vec2.diff({ x: ix, y: iy }, start);
				instance.selection.translation = delta;
			}
		}

		// if cursor ended
		if (trigger === BrushTrigger.END) {
			if (instance.selection?.moving === true) {
				// option 1: if we were moving a selection, end the move and update the location of the selection
				instance.selection.moving = false;
				instance.selection.points.forEach((pt) => {
					pt.x += instance.selection!.translation.x;
					pt.y += instance.selection!.translation.y;
				});
				instance.selection.translation = { x: 0, y: 0 };
			} else {
				// option 2: start a new selection with the cursor coordinates

				// before we can start a new selection we must end the previous selection
				if (instance.selection !== undefined) {
					SelectionInterface.clearSelection(instance);
				}

				// compute selection polygon
				const pt1 = Vec2.clamp(
					CoordinateInterface.toImageCoords(
						instance,
						CoordinateInterface.toPointerCoords(instance, {
							...instance.brush.press.start,
						}),
					),
					{ x: 0, y: 0 },
					{ x: instance.image.width, y: instance.image.height },
				);
				const pt2 = Vec2.clamp(
					{ x: ix, y: iy },
					{ x: 0, y: 0 },
					{ x: instance.image.width, y: instance.image.height },
				);
				const points = [
					pt1,
					{ x: pt1.x, y: pt2.y },
					pt2,
					{ x: pt2.x, y: pt1.y },
				];
				const aabb = Polygon.toAabb(points);

				// check that the new selection wasn't just an empty click
				if (aabb.width === 0 || aabb.height === 0) {
					return;
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
			}
		}
	}
}
