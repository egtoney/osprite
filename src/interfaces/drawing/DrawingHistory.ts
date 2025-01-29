import { RGBColor } from "./Color";
import { DrawingInterface } from "./DrawingInterface";

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
}
