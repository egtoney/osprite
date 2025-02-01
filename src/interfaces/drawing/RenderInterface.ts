/* eslint-disable @typescript-eslint/no-namespace */
import { Polygon } from "../Polygon";
import { Brush } from "./brush/Brush";
import { BrushInterface } from "./brush/BrushInterface";
import { Color } from "./color/Color";
import { ColorInterface } from "./color/ColorInterface";
import { CoordinateInterface } from "./CoordinateInterface";
import { DrawingInterface } from "./DrawingInterface";
import { ImageInterfaceSlice, ImageLayer } from "./ImageInterface";

export namespace RenderInterface {
	const backgroundCanvas = document.createElement("canvas");
	const foregroundCanvas = document.createElement("canvas");
	const inMemSelectionCanvas = document.createElement("canvas");

	/**
	 * Renders the image slice to the passed canvas. If one is not passed a new canvas will be created.
	 */
	export function renderToCanvas(
		canvas: HTMLCanvasElement | null,
		image: ImageInterfaceSlice,
	): HTMLCanvasElement {
		if (canvas === null) {
			canvas = document.createElement("canvas");
		}
		canvas.width = image.width;
		canvas.height = image.height;
		const imageData = new ImageData(image.data, image.width, image.height);
		const context = canvas.getContext("2d")!;
		context.putImageData(imageData, 0, 0);
		return canvas;
	}

	export function shouldRenderBackground(instance: DrawingInterface) {
		return (
			instance._display === undefined ||
			instance._display.width !== instance.display.width ||
			instance._display.height !== instance.display.height
		);
	}

	export function shouldRenderForeground(instance: DrawingInterface) {
		// TODO: eventually detect when image is resized as well
		for (const layer of instance.image.layers) {
			if (shouldRenderLayer(layer)) {
				return true;
			}
		}
		return false;
	}

	export function shouldRenderLayer(layer: ImageLayer) {
		// render if there isn't a canvas already
		return (
			layer._canvas === undefined ||
			// render if rev numbers don't match
			layer.rev !== layer._rev
		);
	}

	export function shouldRenderDisplay(instance: DrawingInterface) {
		return (
			instance._display === undefined ||
			instance._display.dx !== instance.display.dx ||
			instance._display.dy !== instance.display.dy ||
			instance._display.left !== instance.display.left ||
			instance._display.top !== instance.display.top ||
			instance._display.width !== instance.display.width ||
			instance._display.height !== instance.display.height ||
			instance._display.zoom !== instance.display.zoom
		);
	}

	function tryBuildBackgroundImage(instance: DrawingInterface) {
		if (!instance.image.bgData) {
			instance.image.bgData = new Uint8ClampedArray(
				instance.image.width * instance.image.height * 4,
			);
		}
		if (instance.image.bgData[0] === 0) {
			for (let x = 0; x < instance.image.width; x++) {
				for (let y = 0; y < instance.image.height; y++) {
					const index = (y * instance.image.width + x) * 4;
					const bx = Math.floor(x / 16);
					const by = Math.floor(y / 16);

					const color =
						(bx + by) % 2 === 0 ? [128, 128, 128, 255] : [211, 211, 211, 255];

					instance.image.bgData[index + 0] = color[0];
					instance.image.bgData[index + 1] = color[1];
					instance.image.bgData[index + 2] = color[2];
					instance.image.bgData[index + 3] = color[3];
				}
			}
		}
	}

	export function render(
		instance: DrawingInterface,
		drawingCanvasRef: React.RefObject<HTMLCanvasElement>,
		interfaceCanvasRef: React.RefObject<HTMLCanvasElement>,
	) {
		// pull and check canvas
		const drawingCanvas = drawingCanvasRef.current;
		if (drawingCanvas === null) {
			return;
		}

		// pull and check 2d graphics context
		const drawingContext = drawingCanvas.getContext("2d");
		if (drawingContext === null) {
			return;
		}

		// pull and check canvas
		const interfaceCanvas = interfaceCanvasRef.current;
		if (interfaceCanvas === null) {
			return;
		}

		// pull and check 2d graphics context
		const interfaceContext = interfaceCanvas.getContext("2d");
		if (interfaceContext === null) {
			return;
		}

		// only render when we need to
		if (instance.shouldRender === false) {
			return;
		}
		instance.shouldRender = false;

		tryBuildBackgroundImage(instance);

		const tx = Math.round(
			(instance.display.width - instance.display.zoom * instance.image.width) /
				2 +
				instance.display.dx,
		);
		const ty = Math.round(
			(instance.display.height -
				instance.display.zoom * instance.image.height) /
				2 +
				instance.display.dy,
		);

		if (
			shouldRenderBackground(instance) ||
			shouldRenderForeground(instance) ||
			shouldRenderDisplay(instance)
		) {
			// clear screen
			drawingContext.restore();
			drawingContext.clearRect(-10000, -10000, 20000, 20000);
			drawingContext.imageSmoothingEnabled = false;

			// setup transforms for foreground and background renders
			drawingContext.setTransform(
				instance.display.zoom,
				0,
				0,
				instance.display.zoom,
				tx,
				ty,
			);

			// render canvas background
			if (shouldRenderBackground(instance)) {
				renderToCanvas(backgroundCanvas, {
					width: instance.image.width,
					height: instance.image.height,
					data: instance.image.bgData,
				});
			}

			// render foreground only if needed
			if (shouldRenderForeground(instance)) {
				const foregroundContext = foregroundCanvas.getContext("2d")!;
				foregroundContext.clearRect(
					0,
					0,
					instance.image.width,
					instance.image.height,
				);

				// render layers to foreground
				for (const layer of instance.image.layers) {
					// render layer to in memory canvas if needed
					if (shouldRenderLayer(layer)) {
						layer._canvas ??= document.createElement("canvas");
						layer._rev = layer.rev;

						renderToCanvas(layer._canvas, {
							width: instance.image.width,
							height: instance.image.height,
							data: layer.data,
						});
					}

					// render layer to in memory foreground canvas
					foregroundContext.drawImage(layer._canvas!, 0, 0);
				}
			}

			drawingContext.drawImage(backgroundCanvas, 0, 0);
			drawingContext.drawImage(foregroundCanvas, 0, 0);
		}

		interfaceContext.restore();
		interfaceContext.clearRect(-10000, -10000, 20000, 20000);
		interfaceContext.imageSmoothingEnabled = false;
		interfaceContext.setTransform(1, 0, 0, 1, tx, ty);

		// render selection
		renderSelection(instance, interfaceContext);
		renderPartialSelection(instance, interfaceContext);

		switch (instance.brush.selected) {
			case Brush.PENCIL:
				renderCursorPencil(instance, interfaceContext);
				break;
			case Brush.SELECT:
				renderCursorSelect(instance, interfaceContext);
				break;
			case Brush.ERASER:
				renderCursorEraser(instance, interfaceContext);
				break;
			case Brush.DROPPER:
			default:
				renderCursorEyedropper(instance, interfaceContext);
				break;
		}

		// update rendered display info
		instance._display = { ...instance.display };
	}

	export function queueRender(instance: DrawingInterface) {
		instance.shouldRender = true;
		if (instance.renderHook !== undefined) {
			instance.renderHook();
		}
	}

	export function renderSelectionRect(
		instance: DrawingInterface,
		context: CanvasRenderingContext2D,
		left: number,
		right: number,
		top: number,
		bottom: number,
	) {
		const width = right - left;
		const height = bottom - top;

		context.fillStyle = `rgba(0, 0, 0, 1)`;
		// left
		context.fillRect(
			left * instance.display.zoom - 1,
			top * instance.display.zoom,
			1,
			height * instance.display.zoom,
		);
		// right
		context.fillRect(
			(left + width) * instance.display.zoom,
			top * instance.display.zoom,
			1,
			height * instance.display.zoom,
		);
		// top
		context.fillRect(
			left * instance.display.zoom,
			top * instance.display.zoom - 1,
			width * instance.display.zoom,
			1,
		);
		// bottom
		context.fillRect(
			left * instance.display.zoom,
			(top + height) * instance.display.zoom,
			width * instance.display.zoom,
			1,
		);

		const delta = (Date.now() % 1000) / 500;
		context.fillStyle = `rgba(255, 255, 255, 1)`;

		// top and bottom
		const renderTopOrBottom = (dy: number, offset: number) => {
			for (let x = -1 - offset; x < width; x += 2) {
				let dx = left + x + delta;
				let dw = 1;

				if (dx > right || dx + 1 < left) {
					continue;
				} else if (dx < left) {
					const diff = left - dx;
					dw -= diff;
					dx = left;
				} else if (dx + 1 > right) {
					const diff = dx + 1 - right;
					dw -= diff;

					if (diff < 0) {
						continue;
					}
				}

				context.fillRect(
					dx * instance.display.zoom,
					top * instance.display.zoom + dy,
					dw * instance.display.zoom,
					1,
				);
			}
		};
		// top
		renderTopOrBottom(-1, 0);
		// bottom
		renderTopOrBottom(height * instance.display.zoom, height % 2 === 0 ? 0 : 1);

		// left and right
		const renderLeftOrRight = (dx: number, offset: number) => {
			for (let y = -1 - offset; y < height; y += 2) {
				let dy = top + y + delta;
				let dh = 1;

				if (dy > bottom || dy + 1 < top) {
					continue;
				} else if (dy < top) {
					const diff = top - dy;
					dh -= diff;
					dy = top;
				} else if (dy + 1 > bottom) {
					const diff = dy + 1 - bottom;
					dh -= diff;

					if (diff < 0) {
						continue;
					}
				}

				context.fillRect(
					left * instance.display.zoom + dx,
					dy * instance.display.zoom,
					1,
					dh * instance.display.zoom,
				);
			}
		};
		// left
		renderLeftOrRight(-1, 0);
		// right
		renderLeftOrRight(width * instance.display.zoom, width % 2 === 0 ? 0 : 1);
	}

	export function renderPartialSelection(
		instance: DrawingInterface,
		context: CanvasRenderingContext2D,
	) {
		if (
			instance.brush.selected !== Brush.SELECT ||
			!instance.brush.press.pressed ||
			!instance.brush.press.start ||
			instance.selection?.moving === true
		) {
			return;
		}

		const aabb = Polygon.toAabb([
			CoordinateInterface.toImageCoords(
				instance,
				CoordinateInterface.toPointerCoords(
					instance,
					instance.brush.press.start,
				),
			),
			CoordinateInterface.toImageCoords(
				instance,
				CoordinateInterface.toPointerCoords(instance, instance.cursor),
			),
		]);

		renderSelectionRect(
			instance,
			context,
			aabb.x,
			aabb.x + aabb.width,
			aabb.y,
			aabb.y + aabb.height,
		);
	}

	export function renderSelection(
		instance: DrawingInterface,
		context: CanvasRenderingContext2D,
	) {
		if (!instance.selection) {
			return;
		}
		const tx = Math.round(
			(instance.display.width - instance.display.zoom * instance.image.width) /
				2 +
				instance.display.dx,
		);
		const ty = Math.round(
			(instance.display.height -
				instance.display.zoom * instance.image.height) /
				2 +
				instance.display.dy,
		);
		const aabb = Polygon.toAabb(instance.selection.points);

		const left = aabb.x + instance.selection.translation.x;
		const top = aabb.y + instance.selection.translation.y;
		const right = left + aabb.width;
		const bottom = top + aabb.height;

		// render selected slice
		if (instance.selection.data.data.length === 0) {
			console.log(instance.selection);
		}
		renderToCanvas(inMemSelectionCanvas, instance.selection.data);
		context.setTransform(
			instance.display.zoom,
			0,
			0,
			instance.display.zoom,
			tx,
			ty,
		);
		context.drawImage(inMemSelectionCanvas, left, top);
		context.setTransform(1, 0, 0, 1, tx, ty);

		renderSelectionRect(instance, context, left, right, top, bottom);

		setTimeout(() => {
			if (instance.selection) {
				instance.shouldRender = true;
			}
		}, 10);
	}

	export function renderCursorSelect(
		instance: DrawingInterface,
		context: CanvasRenderingContext2D,
	) {
		context.fillStyle = "white";

		// render precise location
		const pointer = CoordinateInterface.pointerCoords(instance);
		context.fillRect(pointer.x, pointer.y, 1, 1);

		// render aim hairs
		const [ax, ay] = CoordinateInterface.gridCoords(instance);

		// top left
		context.fillRect(ax - 3, ay - 1, 3, 1);
		context.fillRect(ax - 1, ay - 3, 1, 3);

		// top right
		context.fillRect(ax + instance.display.zoom, ay - 1, 3, 1);
		context.fillRect(ax + instance.display.zoom, ay - 3, 1, 3);

		// bottom left
		context.fillRect(ax - 3, ay + instance.display.zoom, 3, 1);
		context.fillRect(ax - 1, ay + instance.display.zoom, 1, 3);

		// bottom left
		context.fillRect(
			ax + instance.display.zoom,
			ay + instance.display.zoom,
			3,
			1,
		);
		context.fillRect(
			ax + instance.display.zoom,
			ay + instance.display.zoom,
			1,
			3,
		);
	}

	export function renderCursorPencil(
		instance: DrawingInterface,
		context: CanvasRenderingContext2D,
	) {
		// convert current color to rgb
		const rgbColor = Color.toRGB(ColorInterface.currentColor(instance));

		// render pixel (if drawn)
		context.fillStyle = `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, ${rgbColor.a / 255})`;
		const [ax, ay] = CoordinateInterface.gridCoords(instance);
		for (const point of BrushInterface.brushShape(instance)) {
			context.fillRect(
				ax + instance.display.zoom * point.x,
				ay + instance.display.zoom * point.y,
				instance.display.zoom,
				instance.display.zoom,
			);
		}

		// render precise location
		context.fillStyle = "white";
		const pointer = CoordinateInterface.pointerCoords(instance);
		context.fillRect(pointer.x, pointer.y, 1, 1);
		context.fillRect(pointer.x - 3, pointer.y, 2, 1);
		context.fillRect(pointer.x + 2, pointer.y, 2, 1);
		context.fillRect(pointer.x, pointer.y - 3, 1, 2);
		context.fillRect(pointer.x, pointer.y + 2, 1, 2);
	}

	export function renderCursorEraser(
		instance: DrawingInterface,
		context: CanvasRenderingContext2D,
	) {
		context.fillStyle = "white";

		// render precise location
		const pointer = CoordinateInterface.pointerCoords(instance);
		context.fillRect(pointer.x, pointer.y, 1, 1);

		// render aim hairs
		const [ax, ay] = CoordinateInterface.gridCoords(instance);
		for (const point of BrushInterface.brushShape(instance)) {
			// top
			context.fillRect(
				ax + point.x * instance.display.zoom,
				ay - 1 + point.y * instance.display.zoom,
				instance.display.zoom,
				1,
			);
			// bottom
			context.fillRect(
				ax + point.x * instance.display.zoom,
				ay + instance.display.zoom + point.y * instance.display.zoom,
				instance.display.zoom,
				1,
			);
			// left
			context.fillRect(
				ax - 1 + point.x * instance.display.zoom,
				ay + point.y * instance.display.zoom,
				1,
				instance.display.zoom,
			);
			// right
			context.fillRect(
				ax + instance.display.zoom + point.x * instance.display.zoom,
				ay + point.y * instance.display.zoom,
				1,
				instance.display.zoom,
			);
		}
	}

	export function renderCursorEyedropper(
		instance: DrawingInterface,
		context: CanvasRenderingContext2D,
	) {
		context.fillStyle = "white";

		// render precise location
		const pointer = CoordinateInterface.pointerCoords(instance);
		context.fillRect(pointer.x, pointer.y, 1, 1);

		// render aim hairs
		const [ax, ay] = CoordinateInterface.gridCoords(instance);

		// top
		context.fillRect(ax, ay - 1, instance.display.zoom, 1);
		// bottom
		context.fillRect(ax, ay + instance.display.zoom, instance.display.zoom, 1);
		// left
		context.fillRect(ax - 1, ay, 1, instance.display.zoom);
		// right
		context.fillRect(ax + instance.display.zoom, ay, 1, instance.display.zoom);
	}
}
