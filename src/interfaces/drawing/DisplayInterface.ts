import { Vec2 } from "../Vec2";
import { DrawingInterface } from "./DrawingInterface";
import { RenderInterface } from "./RenderInterface";

export interface DisplayInterface {
	dx: number;
	dy: number;
	left: number;
	top: number;
	width: number;
	height: number;
	zoom: number;
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace DisplayInterface {
	export function updateZoom(
		instance: DrawingInterface,
		delta: number,
		offsetOverride?: Vec2,
	) {
		const prevScale = instance.display.zoom;

		const offset = offsetOverride ?? {
			x: instance.cursor.x,
			y: instance.cursor.y,
		};
		offset.x -= instance.display.width / 2;
		offset.y -= instance.display.height / 2;

		instance.display.zoom += delta;
		instance.display.zoom = Math.max(1, Math.min(instance.display.zoom, 64));
		instance.wheel = instance.display.zoom;

		const scale = instance.display.zoom / prevScale - 1;

		instance.display.dx -= offset.x * scale;
		instance.display.dy -= offset.y * scale;

		instance.cursor.x =
			instance.rawCursor.x - instance.display.dx - instance.display.left;
		instance.cursor.y =
			instance.rawCursor.y - instance.display.dy - instance.display.top;

		instance.shouldRender = true;
		RenderInterface.queueRender(instance);
	}

	export function setReactRenderHook(
		instance: DrawingInterface,
		saveHook: () => unknown,
		renderHook: () => unknown,
	) {
		instance.saveHook = saveHook;
		instance.renderHook = renderHook;
	}

	export function setDisplaySize(
		instance: DrawingInterface,
		left: number,
		top: number,
		width: number,
		height: number,
	) {
		instance.display.left = left;
		instance.display.top = top;
		instance.display.width = width;
		instance.display.height = height;
		RenderInterface.queueRender(instance);
	}
}
