import { ColorInterface } from "../../color/ColorInterface";
import { DrawingInterface } from "../../DrawingInterface";
import { ImageInterface } from "../../ImageInterface";
import { RenderInterface } from "../../RenderInterface";
import { BrushTrigger } from "../BrushTrigger";

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Dropper {
	export function useBrushDropper(
		instance: DrawingInterface,
		_trigger: BrushTrigger,
		ix: number,
		iy: number,
	) {
		if (!ImageInterface.pointInImage(instance, ix, iy)) {
			return;
		}

		const rgbColor = ColorInterface.getColor(instance, ix, iy);

		if (rgbColor !== null) {
			switch (instance.brush.button) {
				case 0:
					instance.colors.primary = rgbColor;
					break;
				case 1:
					instance.colors.secondary = rgbColor;
					break;
			}
			RenderInterface.queueRender(instance);
		}
	}
}
