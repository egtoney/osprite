import { DisplayInterface } from "../../DisplayInterface";
import { DrawingInterface } from "../../DrawingInterface";
import { BrushTrigger } from "../BrushTrigger";

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Zoom {
	export function useBrushZoom(
		instance: DrawingInterface,
		trigger: BrushTrigger,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		_ix: number,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		_iy: number,
	) {
		if (trigger === BrushTrigger.START) {
			if (instance.brush.button === 0) {
				DisplayInterface.updateZoom(instance, 1);
			} else {
				DisplayInterface.updateZoom(instance, -1);
			}
		}
	}
}
