import { Vec2 } from "../Vec2";
import { BlendMode } from "./color/BlendMode";
import { RGBColor } from "./color/Color";
import { ColorInterface } from "./color/ColorInterface";
import { DrawingInterface } from "./DrawingInterface";
import { RenderInterface } from "./RenderInterface";
import { SaveInterface } from "./SaveInterface";

export interface ColorVec extends Vec2 {
	color: RGBColor;
}

export interface DrawingHistory {
	changes: (ColorVec & {
		oldColor: RGBColor;
	})[];
	complete: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace DrawingHistory {
	export function pushChange(
		instance: DrawingInterface,
		layerIndex: number,
		x: number,
		y: number,
		newColor: RGBColor,
		oldColor: RGBColor,
	) {
		// do nothing if no history event to record into
		if (instance.history.length === 0) {
			return;
		}

		const event = instance.history[instance.history.length - 1];
		event.changes.push({
			x,
			y,
			color: newColor,
			oldColor: oldColor,
		});
	}

	export function canUndo(instance: DrawingInterface) {
		return instance.history.length > 0;
	}

	export function undo(instance: DrawingInterface) {
		// do nothing if no history to undo
		if (instance.history.length === 0) {
			return;
		}

		// pop last element
		const [history] = instance.history.splice(instance.history.length - 1, 1);

		// for each point undo change
		for (const change of history.changes) {
			ColorInterface.setColor(
				instance,
				change.x,
				change.y,
				change.oldColor,
				false,
				BlendMode.REPLACE,
			);
		}

		// push onto the undo history buffer
		instance.undoHistory.push(history);
		SaveInterface.save(instance);
		RenderInterface.queueRender(instance);
	}

	export function canRedo(instance: DrawingInterface) {
		return instance.undoHistory.length > 0;
	}

	export function redo(instance: DrawingInterface) {
		// do nothing if no undo history to redo
		if (instance.undoHistory.length === 0) {
			return;
		}

		// pop last element
		const [history] = instance.undoHistory.splice(
			instance.undoHistory.length - 1,
			1,
		);

		// for each point undo change
		for (const change of history.changes) {
			ColorInterface.setColor(
				instance,
				change.x,
				change.y,
				change.color,
				false,
				BlendMode.REPLACE,
			);
		}

		// push onto the undo buffer
		instance.history.push(history);
		SaveInterface.save(instance);
		RenderInterface.queueRender(instance);
	}
}
