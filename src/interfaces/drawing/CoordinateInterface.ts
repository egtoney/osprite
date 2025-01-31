import { DrawingInterface } from "./DrawingInterface";
import { Vec2 } from "../Vec2";

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace CoordinateInterface {
	export function displayDelta(instance: DrawingInterface) {
		return [
			(instance.display.width - instance.display.zoom * instance.image.width) /
				2,
			(instance.display.height -
				instance.display.zoom * instance.image.height) /
				2,
		];
	}

	/** Translates wrapper coordinates relative to image */
	export function toPointerCoords(
		instance: DrawingInterface,
		displayCoords: Vec2,
	): Vec2 {
		const delta = displayDelta(instance);

		return { x: displayCoords.x - delta[0], y: displayCoords.y - delta[1] };
	}

	export function pointerCoords(instance: DrawingInterface) {
		return toPointerCoords(instance, {
			x: instance.cursor.x,
			y: instance.cursor.y,
		});
	}

	export function toImageCoords(
		instance: DrawingInterface,
		pointerCoords: Vec2,
	): Vec2 {
		return {
			x: Math.floor(pointerCoords.x / instance.display.zoom),
			y: Math.floor(pointerCoords.y / instance.display.zoom),
		};
	}

	export function imageCoords(instance: DrawingInterface) {
		return toImageCoords(instance, pointerCoords(instance));
	}

	export function gridCoords(instance: DrawingInterface) {
		const image = imageCoords(instance);

		return [instance.display.zoom * image.x, instance.display.zoom * image.y];
	}
}
