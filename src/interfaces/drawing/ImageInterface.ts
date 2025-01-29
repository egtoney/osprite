/* eslint-disable @typescript-eslint/no-namespace */

import { Color, RGBColor } from "./Color";
import { DrawingInterface } from "./DrawingInterface";

export interface ImageInterface {
	layer: number;
	layers: Uint8ClampedArray[];
	bgData: Uint8ClampedArray;
	width: number;
	height: number;
}

export namespace ImageInterface {
	
	/**
	 * Encode raw pixel data as a Base64 PNG
	 * @param {Uint8Array} pixelData - Raw pixel data
	 * @param {number} width - Image width
	 * @param {number} height - Image height
	 * @returns {string} Base64 PNG string
	 */
	export function encodeToBase64PNG(data: ImageInterface): {
		content_type: "image/png";
		data: string;
	} {
		// Create a canvas
		const canvas = document.createElement("canvas");
		canvas.width = data.width;
		canvas.height = data.height;
		const ctx = canvas.getContext("2d")!;

		// Create an ImageData object from the pixel data
		const imageData = new ImageData(
			data.layers[0], // Must be Uint8ClampedArray
			data.width,
			data.height,
		);

		// Put the ImageData onto the canvas
		ctx.putImageData(imageData, 0, 0);

		// Export the canvas to a Base64 PNG
		return {
			content_type: "image/png",
			data: canvas.toDataURL("image/png").split(";base64,")[1],
		};
	}

	export function inImage(instance: DrawingInterface, x: number, y: number) {
		return x > 0 && x < instance.image.width && y > 0 && y < instance.image.height;
	}

	export function getColor(instance: DrawingInterface, x: number, y: number): RGBColor | null {
		// check that x,y is valid
		if (!inImage(instance, x, y)) {
			return null;
		}

		const index = 4 * (x + y * instance.image.width);

		// check that index is valid
		if (index < 0 || index > instance.image.layers[0].length - 4) {
			return null;
		}

		return {
			r: instance.image.layers[0][index + 0],
			g: instance.image.layers[0][index + 1],
			b: instance.image.layers[0][index + 2],
			a: instance.image.layers[0][index + 3],
		};
	}

	export function setColor(
		instance: DrawingInterface,
		x: number,
		y: number,
		color: RGBColor,
		historize: boolean,
	): void {
		// check that x,y is valid
		if (!inImage(instance, x, y)) {
			return;
		}

		const index = 4 * (x + y * instance.image.width);

		// check that index is valid
		if (index < 0 || index > instance.image.layers[0].length - 4) {
			return;
		}

		// grab current color
		const oldColor: RGBColor = {
			r: instance.image.layers[0][index + 0],
			g: instance.image.layers[0][index + 1],
			b: instance.image.layers[0][index + 2],
			a: instance.image.layers[0][index + 3],
		};

		// do nothing if colors are equal
		if (Color.equal(oldColor, color)) {
			return;
		}

		// update color
		instance.image.layers[0][index + 0] = color.r;
		instance.image.layers[0][index + 1] = color.g;
		instance.image.layers[0][index + 2] = color.b;
		instance.image.layers[0][index + 3] = color.a;

		// update history
		if (historize && instance.history.length > 0) {
			instance.history[instance.history.length - 1].changes.push({
				x,
				y,
				color: color,
				oldColor: oldColor,
			});
		}
	}
}
