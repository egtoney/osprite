/* eslint-disable react-hooks/rules-of-hooks */
import { BrushInterface } from "./brush/BrushInterface";
import { BrushTrigger } from "./brush/BrushTrigger";
import { DrawingHistory } from "./DrawingHistory";
import { DrawingInterface } from "./DrawingInterface";
import { RenderInterface } from "./RenderInterface";
import { SaveInterface } from "./SaveInterface";

/**
Rules for Cursor logic
- each cursor start begins a new drawing snippets
- drawing snippets can be undone/redone
- if a new cursor start begins before the last one is complete it is undone and a new snippet is started
*/
// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace CursorInterface {
	export function handleCursorStart(
		instance: DrawingInterface,
		x: number,
		y: number,
		button?: number,
	) {
		instance.rawCursor.x = x;
		instance.rawCursor.y = y;

		DrawingHistory.startChangeSet(instance);

		// translate cursor location to be relative to drawing interface
		instance.cursor.x = x - instance.display.dx - instance.display.left;
		instance.cursor.y = y - instance.display.dy - instance.display.top;

		// start a new press if not already started (needed for operations like select)
		if (instance.brush.press.pressed === false) {
			instance.brush.press.start = {
				x: instance.cursor.x,
				y: instance.cursor.y,
			};
		}

		// flag brush as being pressed
		instance.brush.press.pressed = true;
		instance.brush.press.miscData = {};

		// map mouse button to virtual brush button
		switch (button ?? 0) {
			case 0:
				instance.brush.button = 0;
				break;
			case 2:
				instance.brush.button = 1;
				break;
			default:
				// do nothing
				break;
		}

		BrushInterface.useBrush(instance, BrushTrigger.START);
	}

	export function handleCursorMove(
		instance: DrawingInterface,
		x: number,
		y: number,
	) {
		instance.rawCursor.x = x;
		instance.rawCursor.y = y;

		// flag that the canvas will need to re-render due to changes
		instance.shouldRender = true;

		// last cursor position
		const sx = instance.cursor.x;
		const sy = instance.cursor.y;

		// new cursor position
		const tx = x - instance.display.left - instance.display.dx;
		const ty = y - instance.display.top - instance.display.dy;

		// displacements
		const dx = tx - sx;
		const dy = ty - sy;

		// max displacement
		const steps = Math.max(Math.abs(dx), Math.abs(dy));

		// move 1px in the dx or dy direction (whichever is larger) till we are near the target
		for (let step = 1; step <= steps; step++) {
			instance.cursor.x = sx + (step * dx) / steps;
			instance.cursor.y = sy + (step * dy) / steps;

			instance.brush.press.curr = { ...instance.cursor };
			BrushInterface.useBrush(instance, BrushTrigger.MOVE);
		}

		// ensure end point is drawn
		instance.cursor.x = tx;
		instance.cursor.y = ty;

		BrushInterface.useBrush(instance, BrushTrigger.MOVE);

		RenderInterface.queueRender(instance);
	}

	export function handleCursorEnd(instance: DrawingInterface) {
		if (instance.brush.press.pressed === false) {
			return;
		}

		// Use the brush one last time at the end position. This was probably already done but some brushes only do something when they end.
		BrushInterface.useBrush(instance, BrushTrigger.END);

		DrawingHistory.endChangeSet(instance);

		// flag that the brush is no longer pressed
		instance.brush.press.pressed = false;

		SaveInterface.save(instance);
		RenderInterface.queueRender(instance);
	}
}
