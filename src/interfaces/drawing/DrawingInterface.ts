import { v4 } from "uuid";
import { Vec2 } from "../Vec2";
import { Brush } from "./brush/Brush";
import { BrushShape } from "./brush/BrushShape";
import { Color } from "./color/Color";
import { DisplayInterface } from "./DisplayInterface";
import { ImageInterface } from "./ImageInterface";
import { SaveInterface } from "./SaveInterface";
import { SelectionInterface } from "./SelectionInterface";
import { DrawingHistory } from "./DrawingHistory";

export interface DrawingInterface {
	id: string;
	shouldRender: boolean;

	rawCursor: Vec2;
	cursor: Vec2;
	wheel: number;
	brush: {
		press: {
			pressed: boolean;
			curr: Vec2;
			start: Vec2;
			end: Vec2;
			miscData: {
				[key: string]: unknown;
			};
		};
		button: number;
		selected: Brush;
		pencil: {
			shape: BrushShape;
			size: number;
			pixelPerfect: boolean;
		};
	};
	display: DisplayInterface;
	save: SaveInterface;
	image: ImageInterface;
	colors: {
		primary: Color;
		secondary: Color;
	};
	selection?: SelectionInterface;
	history: DrawingHistory[];
	undoHistory: DrawingHistory[];

	saveHook?: () => unknown;
	renderHook?: () => unknown;
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace DrawingInterface {
	export function create(
		width: number,
		height: number,
		zoom: number,
	): DrawingInterface {
		return {
			id: v4(),
			shouldRender: true,
			rawCursor: { x: 0, y: 0 },
			cursor: { x: 0, y: 0 },
			wheel: 0,
			brush: {
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
					shape: BrushShape.SQUARE,
					size: 1,
					pixelPerfect: false,
				},
			},
			save: {},
			colors: {
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
			},
			history: [],
			undoHistory: [],
			image: {
				layer: 0,
				layers: [new Uint8ClampedArray(4 * width * height)],
				bgData: new Uint8ClampedArray(4 * width * height),
				width: width,
				height: height,
			},
			display: {
				dx: 0,
				dy: 0,
				left: 0,
				top: 0,
				width: 0,
				height: 0,
				zoom: zoom,
			},
		};
	}
}
