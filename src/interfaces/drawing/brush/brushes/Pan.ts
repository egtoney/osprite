import { Vec2 } from "../../../Vec2";
import { DrawingInterface } from "../../DrawingInterface";
import { BrushTrigger } from "../BrushTrigger";

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Pan {
	export function useBrushPan(
		instance: DrawingInterface,
		trigger: BrushTrigger,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		_ix: number,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		_iy: number,
	) {
		if (trigger === BrushTrigger.START) {
			instance.brush.press.miscData["startDelta"] = {
				x: instance.display.dx,
				y: instance.display.dy,
			};
			instance.brush.press.miscData["startRawCursor"] = {
				...instance.rawCursor,
			};
		}
		if (trigger === BrushTrigger.MOVE) {
			const delta = Vec2.diff(
				instance.rawCursor,
				instance.brush.press.miscData["startRawCursor"] as Vec2,
			);

			const startDelta: Vec2 = instance.brush.press.miscData[
				"startDelta"
			] as Vec2;
			instance.display.dx = startDelta.x + delta.x;
			instance.display.dy = startDelta.y + delta.y;
		}
	}
}
