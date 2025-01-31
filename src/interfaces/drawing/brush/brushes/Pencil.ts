import { BlendMode } from "../../color/BlendMode";
import { Color } from "../../color/Color";
import { ColorInterface } from "../../color/ColorInterface";
import { DrawingInterface } from "../../DrawingInterface";
import { ImageInterface } from "../../ImageInterface";
import { BrushInterface } from "../BrushInterface";
import { BrushTrigger } from "../BrushTrigger";

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Pencil {
	export function useBrushPencil(
		instance: DrawingInterface,
		_trigger: BrushTrigger,
		ix: number,
		iy: number,
	) {
		if (!ImageInterface.pointInImage(instance, ix, iy)) {
			return;
		}

		const rgbColor = Color.toRGB(ColorInterface.currentColor(instance));

		for (const point of BrushInterface.brushShape(instance)) {
			// check that we have not already painted this pixel
			const paintedMap: any =
				instance.brush.press.miscData["painted"] ??
				(instance.brush.press.miscData["painted"] = {});
			const index = `${ix + point.x},${iy + point.y}`;
			if (paintedMap[index]) {
				continue;
			}
			paintedMap[index] = true;

			// actually paint the pixel
			ColorInterface.setColor(
				instance,
				ix + point.x,
				iy + point.y,
				rgbColor,
				true,
				BlendMode.NORMAL,
			);
		}
	}
}
