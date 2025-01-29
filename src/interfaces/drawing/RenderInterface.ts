/* eslint-disable @typescript-eslint/no-namespace */
import { Polygon } from "../Polygon";
import { Brush } from "./Brush";
import { Color } from "./Color";
import { DrawingInterface } from "./DrawingInterface";

export namespace RenderInterface {
	const inMemCanvas1 = document.createElement("canvas");
	const inMemCanvas2 = document.createElement("canvas");

	export function render(
		instance: DrawingInterface,
		canvasRef: React.RefObject<HTMLCanvasElement>,
	) {
		// pull and check canvas
		const canvas = canvasRef.current;
		if (canvas === null) {
			return;
		}

		// pull and check 2d graphics context
		const context = canvas.getContext("2d");
		if (context === null) {
			return;
		}

		// only render when we need to
		if (instance.shouldRender === false) {
			return;
		}
		instance.shouldRender = false;

		// clear screen
		const bounding = canvas.getBoundingClientRect();
		context.restore();
		context.clearRect(0, 0, bounding.width, bounding.height);
		context.imageSmoothingEnabled = false;

		// translate relative to display x, y
		context.save();
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
		context.translate(tx, ty);

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

		// render canvas background
		inMemCanvas1.width = instance.image.width;
		inMemCanvas1.height = instance.image.height;
		const bgImageData = new ImageData(
			instance.image.bgData,
			instance.image.width,
			instance.image.height,
		);
		const inMemContext1 = inMemCanvas1.getContext("2d")!;
		inMemContext1.putImageData(bgImageData, 0, 0);

		// render pixels
		inMemCanvas2.width = instance.image.width;
		inMemCanvas2.height = instance.image.height;
		const imageData = new ImageData(
			instance.image.layers[0],
			instance.image.width,
			instance.image.height,
		);
		const inMemContext2 = inMemCanvas2.getContext("2d")!;
		inMemContext2.putImageData(imageData, 0, 0);

		context.setTransform(
			instance.display.zoom,
			0,
			0,
			instance.display.zoom,
			tx,
			ty,
		);
		context.drawImage(inMemCanvas1, 0, 0);
		context.drawImage(inMemCanvas2, 0, 0);
		context.setTransform(1, 0, 0, 1, tx, ty);

		// render selection
		renderSelection(instance, context);
		renderPartialSelection(instance, context);

		switch (instance.brush.selected) {
			case Brush.PENCIL:
				renderCursorPencil(instance, context);
				break;
			case Brush.SELECT:
				renderCursorSelect(instance, context);
				break;
			case Brush.ERASER:
				renderCursorEraser(instance, context);
				break;
			case Brush.DROPPER:
			default:
				renderCursorEyedropper(instance, context);
				break;
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

		const aabb = Polygon.aabb([
			instance.toImageCoords(
				instance.toPointerCoords(instance.brush.press.start),
			),
			instance.toImageCoords(instance.toPointerCoords(instance.cursor)),
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
		const aabb = Polygon.aabb(instance.selection.points);

		const left = aabb.x + instance.selection.translation.x;
		const top = aabb.y + instance.selection.translation.y;
		const right = left + aabb.width;
		const bottom = top + aabb.height;

		// render image
		for (const pixel of instance.selection.colors) {
			context.fillStyle = Color.toStringRGBA(pixel.color);
			context.fillRect(
				(pixel.x + left) * instance.display.zoom,
				(pixel.y + top) * instance.display.zoom,
				instance.display.zoom,
				instance.display.zoom,
			);
		}

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
		const pointer = instance.pointerCoords();
		context.fillRect(pointer.x, pointer.y, 1, 1);

		// render aim hairs
		const [ax, ay] = instance.gridCoords();

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
		const rgbColor = Color.toRGB(instance.currentColor());

		// render pixel (if drawn)
		context.fillStyle = `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, ${rgbColor.a / 255})`;
		const [ax, ay] = instance.gridCoords();
		for (const point of instance.pencilShape()) {
			context.fillRect(
				ax + instance.display.zoom * point.x,
				ay + instance.display.zoom * point.y,
				instance.display.zoom,
				instance.display.zoom,
			);
		}

		// render precise location
		context.fillStyle = "white";
		const pointer = instance.pointerCoords();
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
		const pointer = instance.pointerCoords();
		context.fillRect(pointer.x, pointer.y, 1, 1);

		// render aim hairs
		const [ax, ay] = instance.gridCoords();
		for (const point of instance.pencilShape()) {
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
		const pointer = instance.pointerCoords();
		context.fillRect(pointer.x, pointer.y, 1, 1);

		// render aim hairs
		const [ax, ay] = instance.gridCoords();

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
