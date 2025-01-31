/* eslint-disable react-hooks/rules-of-hooks */
import { Vec2 } from "../../Vec2";
import { CoordinateInterface } from "../CoordinateInterface";
import { DrawingInterface } from "../DrawingInterface";
import { Brush } from "./Brush";
import { Dropper } from "./brushes/Dropper";
import { Eraser } from "./brushes/Eraser";
import { Pan } from "./brushes/Pan";
import { Pencil } from "./brushes/Pencil";
import { Select } from "./brushes/Select";
import { Zoom } from "./brushes/Zoom";
import { BrushShape } from "./BrushShape";
import { BrushTrigger } from "./BrushTrigger";

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace BrushInterface {
	export function brushShape(instance: DrawingInterface): Vec2[] {
		const points: Vec2[] = [];
		const left = -Math.floor(instance.brush.pencil.size / 2);

		switch (instance.brush.pencil.shape) {
			case BrushShape.SQUARE:
				for (let x = 0; x < instance.brush.pencil.size; x++) {
					for (let y = 0; y < instance.brush.pencil.size; y++) {
						points.push({ x: x + left, y: y + left });
					}
				}
				break;
			case BrushShape.CIRCLE:
				// do nothing
				break;
		}

		return points;
	}

	export function useBrush(instance: DrawingInterface, trigger: BrushTrigger) {
		if (instance.brush.press.pressed === false) {
			return;
		}

		const image = CoordinateInterface.imageCoords(instance);

		switch (instance.brush.selected) {
			case Brush.SELECT:
				Select.useBrushSelect(instance, trigger, image.x, image.y);
				break;
			case Brush.PENCIL:
				Pencil.useBrushPencil(instance, trigger, image.x, image.y);
				break;
			case Brush.ERASER:
				Eraser.useBrushEraser(instance, trigger, image.x, image.y);
				break;
			case Brush.DROPPER:
				Dropper.useBrushDropper(instance, trigger, image.x, image.y);
				break;
			case Brush.ZOOM:
				Zoom.useBrushZoom(instance, trigger, image.x, image.y);
				break;
			case Brush.PAN:
				Pan.useBrushPan(instance, trigger, image.x, image.y);
				break;
		}

		instance.shouldRender = true;
	}
}
