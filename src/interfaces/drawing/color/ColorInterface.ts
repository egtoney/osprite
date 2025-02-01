import { BlendMode } from "./BlendMode";
import { RGBColor, Color } from "./Color";
import { DrawingHistory } from "../DrawingHistory";
import { DrawingInterface } from "../DrawingInterface";
import { ImageInterface } from "../ImageInterface";

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace ColorInterface {
	export function currentColor(instance: DrawingInterface): Color {
		switch (instance.brush.button) {
			case 0:
				return instance.colors.primary;
			case 1:
				return instance.colors.secondary;
		}
		throw new Error();
	}

	export function getColor(
		instance: DrawingInterface,
		x: number,
		y: number,
	): RGBColor | null {
		// check that x,y is valid
		if (!ImageInterface.pointInImage(instance, x, y)) {
			return null;
		}

		const index = 4 * (x + y * instance.image.width);

		// check that index is valid
		if (index < 0 || index > instance.image.layers[0].data.length - 4) {
			return null;
		}

		return {
			r: instance.image.layers[0].data[index + 0],
			g: instance.image.layers[0].data[index + 1],
			b: instance.image.layers[0].data[index + 2],
			a: instance.image.layers[0].data[index + 3],
		};
	}

	export function nreadColor(
		buffer: Uint8ClampedArray,
		index: number,
	): RGBColor {
		return {
			r: buffer[index],
			g: buffer[index + 1],
			b: buffer[index + 2],
			a: buffer[index + 3],
		};
	}

	export function nwriteColor(
		buffer: Uint8ClampedArray,
		index: number,
		color: RGBColor,
		mode: BlendMode,
	) {
		const baseColor: RGBColor = {
			r: buffer[index],
			g: buffer[index + 1],
			b: buffer[index + 2],
			a: buffer[index + 3],
		};

		// blend new and old colors using blend mode
		switch (mode) {
			case BlendMode.NORMAL:
				color = Color.blendNormal(baseColor, color);
				break;
			case BlendMode.PENCIL:
				color = Color.blendPencil(baseColor, color);
				break;
			default:
			case BlendMode.REPLACE:
				// do nothing
				break;
		}

		buffer[index] = color.r;
		buffer[index + 1] = color.g;
		buffer[index + 2] = color.b;
		buffer[index + 3] = color.a;
	}

	export function ncopyColor(
		targetBuffer: Uint8ClampedArray,
		targetIndex: number,
		sourceBuffer: Uint8ClampedArray,
		sourceIndex: number,
		mode: BlendMode,
	) {
		nwriteColor(
			targetBuffer,
			targetIndex,
			{
				r: sourceBuffer[sourceIndex],
				g: sourceBuffer[sourceIndex + 1],
				b: sourceBuffer[sourceIndex + 2],
				a: sourceBuffer[sourceIndex + 3],
			},
			mode,
		);
	}

	/**
	 *
	 */
	export function setColor(
		instance: DrawingInterface,
		x: number,
		y: number,
		color: RGBColor,
		historize: boolean,
		mode: BlendMode,
	): void {
		// TODO: eventually support layers
		const layerIndex = 0;

		// check that x,y is valid
		if (!ImageInterface.pointInImage(instance, x, y)) {
			return;
		}

		// pull and validate layer
		const layer = instance.image.layers[layerIndex];
		if (layer === undefined) {
			return;
		}

		// calculate and validate index
		const index = 4 * (x + y * instance.image.width);
		if (!ImageInterface.indexInImage(instance, index)) {
			return;
		}

		// grab current color
		const oldColor: RGBColor = nreadColor(layer.data, index);

		// do nothing if colors are equal and alpha is 255
		if (Color.equal(oldColor, color) && color.a === 255) {
			return;
		}

		// update color
		nwriteColor(layer.data, index, color, mode);

		// flag that a render is needed
		ImageInterface.flagLayerChange(layer);

		// update history
		if (historize) {
			DrawingHistory.pushChange(instance, layerIndex, x, y, color, oldColor);
		}
	}
}
