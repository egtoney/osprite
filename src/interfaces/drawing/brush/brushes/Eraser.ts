import { BlendMode } from "../../color/BlendMode";
import { Color } from "../../color/Color";
import { ColorInterface } from "../../color/ColorInterface";
import { DrawingInterface } from "../../DrawingInterface";
import { ImageInterface } from "../../ImageInterface";
import { BrushInterface } from "../BrushInterface";
import { BrushTrigger } from "../BrushTrigger";

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Eraser {
	export function useBrushEraser(
		instance: DrawingInterface,
		_trigger: BrushTrigger,
		ix: number,
		iy: number,
	) {
		if (!ImageInterface.pointInImage(instance, ix, iy)) {
			return;
		}

		for (const point of BrushInterface.brushShape(instance)) {
			ColorInterface.setColor(
				instance,
				ix + point.x,
				iy + point.y,
				Color.CLEAR,
				true,
				BlendMode.REPLACE,
			);
		}
	}
}
