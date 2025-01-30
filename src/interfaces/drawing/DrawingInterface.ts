import { v4 } from "uuid";
import { assert } from "../../lib/lang";
import { Polygon } from "../Polygon";
import { BlendMode } from "./Blend";
import { Brush } from "./Brush";
import { Color, RGBColor } from "./Color";
import { ImageInterface, ImageInterfaceSlice } from "./ImageInterface";
import { Vec2 } from "./Vec2";

export enum PencilShape {
	CIRCLE,
	SQUARE,
}

enum BrushTrigger {
	START,
	MOVE,
	END,
}

interface PencilInfo {
	shape: PencilShape;
	size: number;
	pixelPerfect: boolean;
}

interface BrushPress {
	pressed: boolean;
	curr: Vec2;
	start: Vec2;
	end: Vec2;
	miscData: {
		[key: string]: unknown;
	};
}

interface BrushInfo {
	press: BrushPress;
	button: number;
	selected: Brush;
	pencil: PencilInfo;
}

interface ColorInfo {
	primary: Color;
	secondary: Color;
}

interface DisplayInfo {
	dx: number;
	dy: number;
	left: number;
	top: number;
	width: number;
	height: number;
	zoom: number;
}

interface SaveInfo {
	name?: string;
}

interface ColorVec extends Vec2 {
	color: RGBColor;
}

interface DrawingHistory {
	changes: (ColorVec & {
		oldColor: RGBColor;
	})[];
	complete: boolean;
}

interface SelectInterface {
	moving: boolean;
	/** offset to use when moving selection to account for where the cursor pressed */
	cursorOffset: Vec2;
	translation: Vec2;
	points: Polygon;
	data: ImageInterfaceSlice;
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace SelectInterface {
	export function fromImage(image: ImageInterfaceSlice): SelectInterface {
		return {
			moving: false,
			cursorOffset: { x: 0, y: 0 },
			translation: { x: 0, y: 0 },
			points: [
				{ x: 0, y: 0 },
				{ x: image.width, y: 0 },
				{ x: image.width, y: image.height },
				{ x: 0, y: image.height },
			],
			data: image,
		};
	}

	export function clearSelection(instance: DrawingInterface): void {
		if (instance.selection) {
			ImageInterface.insertIntoLayer(
				instance,
				0,
				Polygon.toAabb(instance.selection.points),
				instance.selection.data,
				true,
			);
			delete instance.selection;
		}
	}
}

export class DrawingInterface {
	public id: string = v4();
	public shouldRender: boolean = true;

	public rawCursor: Vec2 = { x: 0, y: 0 };
	public cursor: Vec2 = { x: 0, y: 0 };
	public wheel: number = 0;
	public brush: BrushInfo = {
		press: {
			pressed: false,
			curr: { x: 0, y: 0 },
			start: { x: 0, y: 0 },
			end: { x: 0, y: 0 },
			miscData: {},
		},
		button: 0,
		selected: Brush.PENCIL,
		pencil: {
			shape: PencilShape.SQUARE,
			size: 1,
			pixelPerfect: false,
		},
	};
	public display: DisplayInfo;
	public save: SaveInfo = {};
	public image: ImageInterface;
	public colors: ColorInfo = {
		primary: {
			r: 255,
			g: 0,
			b: 0,
			a: 255,
		} as Color,
		secondary: {
			r: 0,
			g: 0,
			b: 0,
			a: 0,
		} as Color,
	};
	public selection?: SelectInterface;
	public history: DrawingHistory[] = [];
	public undoHistory: DrawingHistory[] = [];

	private saveHook?: () => unknown;
	private renderHook?: () => unknown;

	public constructor(width: number, height: number, zoom: number) {
		this.image = {
			layer: 0,
			layers: [new Uint8ClampedArray(4 * width * height)],
			bgData: new Uint8ClampedArray(4 * width * height),
			width: width,
			height: height,
		};
		this.display = {
			dx: 0,
			dy: 0,
			left: 0,
			top: 0,
			width: 0,
			height: 0,
			zoom: zoom,
		};
	}

	public currentColor(): Color {
		switch (this.brush.button) {
			case 0:
				return this.colors.primary;
			case 1:
				return this.colors.secondary;
		}
		throw new Error();
	}

	public setReactRenderHook(
		saveHook: () => unknown,
		renderHook: () => unknown,
	) {
		this.saveHook = saveHook;
		this.renderHook = renderHook;
	}

	private saveContext() {
		if (this.saveHook) {
			this.saveHook();
		}
	}

	public queueRender() {
		this.shouldRender = true;
		if (this.renderHook !== undefined) {
			this.renderHook();
		}
	}

	public setDisplaySize(
		left: number,
		top: number,
		width: number,
		height: number,
	) {
		this.display.left = left;
		this.display.top = top;
		this.display.width = width;
		this.display.height = height;
		this.queueRender();
	}

	private displayDelta() {
		return [
			(this.display.width - this.display.zoom * this.image.width) / 2,
			(this.display.height - this.display.zoom * this.image.height) / 2,
		];
	}

	// #region Coordinate Transforms

	/** Translates wrapper coordinates relative to image */
	public toPointerCoords(displayCoords: Vec2): Vec2 {
		const delta = this.displayDelta();

		return { x: displayCoords.x - delta[0], y: displayCoords.y - delta[1] };
	}

	public pointerCoords() {
		return this.toPointerCoords({
			x: this.cursor.x,
			y: this.cursor.y,
		});
	}

	public toImageCoords(pointerCoords: Vec2): Vec2 {
		return {
			x: Math.floor(pointerCoords.x / this.display.zoom),
			y: Math.floor(pointerCoords.y / this.display.zoom),
		};
	}

	public imageCoords() {
		return this.toImageCoords(this.pointerCoords());
	}

	public gridCoords() {
		const image = this.imageCoords();

		return [this.display.zoom * image.x, this.display.zoom * image.y];
	}

	public updateZoom(delta: number, offsetOverride?: Vec2) {
		const prevScale = this.display.zoom;

		const offset = offsetOverride ?? {
			x: this.cursor.x,
			y: this.cursor.y,
		};
		offset.x -= this.display.width / 2;
		offset.y -= this.display.height / 2;

		this.display.zoom += delta;
		this.display.zoom = Math.max(1, Math.min(this.display.zoom, 64));
		this.wheel = this.display.zoom;

		const scale = this.display.zoom / prevScale - 1;

		this.display.dx -= offset.x * scale;
		this.display.dy -= offset.y * scale;

		this.cursor.x = this.rawCursor.x - this.display.dx - this.display.left;
		this.cursor.y = this.rawCursor.y - this.display.dy - this.display.top;

		this.shouldRender = true;
		this.queueRender();
	}

	// #endregion

	//#region Snippet Logic

	public canUndo() {
		return this.history.length > 0;
	}

	public undo() {
		// do nothing if no history to undo
		if (this.history.length === 0) {
			return;
		}

		// pop last element
		const [history] = this.history.splice(this.history.length - 1, 1);

		// for each point undo change
		for (const change of history.changes) {
			ImageInterface.setColor(
				this,
				change.x,
				change.y,
				change.oldColor,
				false,
				BlendMode.REPLACE,
			);
		}

		// push onto the undo history buffer
		this.undoHistory.push(history);
		this.saveContext();
		this.queueRender();
	}

	public canRedo() {
		return this.undoHistory.length > 0;
	}

	public redo() {
		// do nothing if no undo history to redo
		if (this.undoHistory.length === 0) {
			return;
		}

		// pop last element
		const [history] = this.undoHistory.splice(this.undoHistory.length - 1, 1);

		// for each point undo change
		for (const change of history.changes) {
			ImageInterface.setColor(
				this,
				change.x,
				change.y,
				change.color,
				false,
				BlendMode.REPLACE,
			);
		}

		// push onto the undo buffer
		this.history.push(history);
		this.saveContext();
		this.queueRender();
	}

	//#endregion

	//#region Cursor Logic

	/*
		Rules for Cursor logic
		- each cursor start begins a new drawing snippets
		- drawing snippets can be undone/redone
		- if a new cursor start begins before the last one is complete it is undone and a new snippet is started
	 */

	public handleCursorStart(x: number, y: number, button?: number) {
		this.rawCursor.x = x;
		this.rawCursor.y = y;

		// check if previous snippet is complete
		if (
			this.history.length > 0 &&
			this.history[this.history.length - 1].complete === false
		) {
			// undo last snippet
			this.undo();
		}

		// start a new snippet
		this.history.push({
			changes: [],
			complete: false,
		});

		// clear undo snippets
		this.undoHistory = [];

		// translate cursor location to be relative to drawing interface
		this.cursor.x = x - this.display.dx - this.display.left;
		this.cursor.y = y - this.display.dy - this.display.top;

		// start a new press if not already started (needed for operations like select)
		if (this.brush.press.pressed === false) {
			this.brush.press.start = {
				x: this.cursor.x,
				y: this.cursor.y,
			};
		}

		// flag brush as being pressed
		this.brush.press.pressed = true;
		this.brush.press.miscData = {};

		// map mouse button to virtual brush button
		switch (button ?? 0) {
			case 0:
				this.brush.button = 0;
				break;
			case 2:
				this.brush.button = 1;
				break;
			default:
				// do nothing
				break;
		}

		this.useBrush(BrushTrigger.START);
	}

	public handleCursorMove(x: number, y: number) {
		this.rawCursor.x = x;
		this.rawCursor.y = y;

		// flag that the canvas will need to re-render due to changes
		this.shouldRender = true;

		// last cursor position
		const sx = this.cursor.x;
		const sy = this.cursor.y;

		// new cursor position
		const tx = x - this.display.left - this.display.dx;
		const ty = y - this.display.top - this.display.dy;

		// displacements
		const dx = tx - sx;
		const dy = ty - sy;

		// max displacement
		const steps = Math.max(Math.abs(dx), Math.abs(dy));

		// move 1px in the dx or dy direction (whichever is larger) till we are near the target
		for (let step = 1; step <= steps; step++) {
			this.cursor.x = sx + (step * dx) / steps;
			this.cursor.y = sy + (step * dy) / steps;

			this.brush.press.curr = { ...this.cursor };
			this.useBrush(BrushTrigger.MOVE);
		}

		// ensure end point is drawn
		this.cursor.x = tx;
		this.cursor.y = ty;

		this.useBrush(BrushTrigger.MOVE);

		this.queueRender();
	}

	public handleCursorEnd() {
		if (this.brush.press.pressed === false) {
			return;
		}

		// Use the brush one last time at the end position. This was probably already done but some brushes only do something when they end.
		this.useBrush(BrushTrigger.END);

		// end the undo history record since it is complete
		if (this.history.length > 0) {
			this.history[this.history.length - 1].complete = true;

			// some brushes may not do anything (like phase one of select) so remove them
			if (this.history[this.history.length - 1].changes.length === 0) {
				this.history.splice(this.history.length - 1, 1);
			}
		}

		// flag that the brush is no longer pressed
		this.brush.press.pressed = false;

		// save context
		this.saveContext();

		// flag that things need ot be rendered
		this.queueRender();
	}

	//#endregion

	//#region Brush Logic

	private useBrush(trigger: BrushTrigger) {
		if (this.brush.press.pressed === false) {
			return;
		}

		const image = this.imageCoords();

		switch (this.brush.selected) {
			case Brush.SELECT:
				this.useBrushSelect(trigger, image.x, image.y);
				break;
			case Brush.PENCIL:
				this.useBrushPencil(trigger, image.x, image.y);
				break;
			case Brush.ERASER:
				this.useBrushEraser(trigger, image.x, image.y);
				break;
			case Brush.DROPPER:
				this.useBrushDropper(trigger, image.x, image.y);
				break;
			case Brush.ZOOM:
				this.useBrushZoom(trigger, image.x, image.y);
				break;
			case Brush.PAN:
				this.useBrushPan(trigger, image.x, image.y);
				break;
		}

		this.shouldRender = true;
	}

	private useBrushSelect(trigger: BrushTrigger, ix: number, iy: number) {
		// if cursor is in selection consider it a move
		if (trigger === BrushTrigger.START) {
			// check if ix, iy in an existing selection (this would be a move)
			if (
				this.selection &&
				Polygon.contains(this.selection.points, { x: ix, y: iy })
			) {
				this.selection.moving = true;
			}
		}

		// if cursor moving
		if (trigger === BrushTrigger.MOVE) {
			// move selection flagged for move
			if (this.selection?.moving === true) {
				const start = this.toImageCoords(
					this.toPointerCoords(this.brush.press.start),
				);
				const delta = Vec2.diff({ x: ix, y: iy }, start);
				this.selection.translation = delta;
			}
		}

		// if cursor ended
		if (trigger === BrushTrigger.END) {
			if (this.selection?.moving === true) {
				// option 1: if we were moving a selection, end the move and update the location of the selection
				this.selection.moving = false;
				this.selection.points.forEach((pt) => {
					pt.x += this.selection!.translation.x;
					pt.y += this.selection!.translation.y;
				});
				this.selection.translation = { x: 0, y: 0 };
			} else {
				// option 2: start a new selection with the cursor coordinates

				// before we can start a new selection we must end the previous selection
				if (this.selection !== undefined) {
					SelectInterface.clearSelection(this);
				}

				// compute selection polygon
				const pt1 = Vec2.clamp(
					this.toImageCoords(
						this.toPointerCoords({ ...this.brush.press.start }),
					),
					{ x: 0, y: 0 },
					{ x: this.image.width, y: this.image.height },
				);
				const pt2 = Vec2.clamp(
					{ x: ix, y: iy },
					{ x: 0, y: 0 },
					{ x: this.image.width, y: this.image.height },
				);
				const points = [
					pt1,
					{ x: pt1.x, y: pt2.y },
					pt2,
					{ x: pt2.x, y: pt1.y },
				];
				const aabb = Polygon.toAabb(points);

				// check that the new selection wasn't just an empty click
				if (aabb.width === 0 || aabb.height === 0) {
					return;
				}

				// cut selection out of image
				const data: ImageInterfaceSlice = ImageInterface.spliceLayer(
					this.image,
					0,
					aabb,
				);
				assert(data.data.length > 0);

				// create the new selection
				this.selection = {
					moving: false,
					cursorOffset: { x: 0, y: 0 },
					translation: { x: 0, y: 0 },
					data,
					points,
				};
			}
		}
	}

	private useBrushPencil(_trigger: BrushTrigger, ix: number, iy: number) {
		if (!ImageInterface.pointInImage(this, ix, iy)) {
			return;
		}

		const rgbColor = Color.toRGB(this.currentColor());

		for (const point of this.pencilShape()) {
			// check that we have not already painted this pixel
			const paintedMap: any =
				this.brush.press.miscData["painted"] ??
				(this.brush.press.miscData["painted"] = {});
			const index = `${ix + point.x},${iy + point.y}`;
			if (paintedMap[index]) {
				continue;
			}
			paintedMap[index] = true;

			// actually paint the pixel
			ImageInterface.setColor(
				this,
				ix + point.x,
				iy + point.y,
				rgbColor,
				true,
				BlendMode.NORMAL,
			);
		}
	}

	private useBrushEraser(_trigger: BrushTrigger, ix: number, iy: number) {
		if (!ImageInterface.pointInImage(this, ix, iy)) {
			return;
		}

		for (const point of this.pencilShape()) {
			ImageInterface.setColor(
				this,
				ix + point.x,
				iy + point.y,
				Color.CLEAR,
				true,
				BlendMode.REPLACE,
			);
		}
	}

	private useBrushDropper(_trigger: BrushTrigger, ix: number, iy: number) {
		if (!ImageInterface.pointInImage(this, ix, iy)) {
			return;
		}

		const rgbColor = ImageInterface.getColor(this, ix, iy);

		if (rgbColor !== null) {
			switch (this.brush.button) {
				case 0:
					this.colors.primary = rgbColor;
					break;
				case 1:
					this.colors.secondary = rgbColor;
					break;
			}
			this.queueRender();
		}
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	private useBrushZoom(trigger: BrushTrigger, _ix: number, _iy: number) {
		if (trigger === BrushTrigger.START) {
			if (this.brush.button === 0) {
				this.updateZoom(1);
			} else {
				this.updateZoom(-1);
			}
		}
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	private useBrushPan(trigger: BrushTrigger, _ix: number, _iy: number) {
		if (trigger === BrushTrigger.START) {
			this.brush.press.miscData["startDelta"] = {
				x: this.display.dx,
				y: this.display.dy,
			};
			this.brush.press.miscData["startRawCursor"] = { ...this.rawCursor };
		}
		if (trigger === BrushTrigger.MOVE) {
			const delta = Vec2.diff(
				this.rawCursor,
				this.brush.press.miscData["startRawCursor"] as Vec2,
			);

			const startDelta: Vec2 = this.brush.press.miscData["startDelta"] as Vec2;
			this.display.dx = startDelta.x + delta.x;
			this.display.dy = startDelta.y + delta.y;
		}
	}

	//#endregion

	//#region Pencil Methods

	public pencilShape(): Vec2[] {
		const points: Vec2[] = [];
		const left = -Math.floor(this.brush.pencil.size / 2);

		switch (this.brush.pencil.shape) {
			case PencilShape.SQUARE:
				for (let x = 0; x < this.brush.pencil.size; x++) {
					for (let y = 0; y < this.brush.pencil.size; y++) {
						points.push({ x: x + left, y: y + left });
					}
				}
				break;
			case PencilShape.CIRCLE:
				// do nothing
				break;
		}

		return points;
	}

	//#endregion
}
