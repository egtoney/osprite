/* eslint-disable @typescript-eslint/no-namespace */

import { assert } from "../../lib/lang";
import { AABB } from "../AABB";
import { Color, RGBColor } from "./Color";
import { DrawingHistory } from "./DrawingHistory";
import { DrawingInterface } from "./DrawingInterface";
import { RenderInterface } from "./RenderInterface";
import { Vec2 } from "./Vec2";

export interface ImageInterfaceSlice {
	data: Uint8ClampedArray;
	width: number;
	height: number;
}

export interface ImageInterface {
	layer: number;
	layers: Uint8ClampedArray[];
	bgData: Uint8ClampedArray;
	width: number;
	height: number;
}

export namespace ImageInterface {
	// #region Encode/Decode
	/**
	 * Decodes an image file into a usable image format
	 * @param {File} file - The image file to process
	 * @returns {Promise<ImageInterfaceSlice>} - Image
	 */
	export function decode(objectURL: string): Promise<ImageInterfaceSlice> {
		return new Promise((resolve, reject) => {
			const img = new Image();
			img.onload = () => {
				const canvas = document.createElement("canvas");
				canvas.width = img.width;
				canvas.height = img.height;

				const ctx = canvas.getContext("2d");
				if (!ctx) {
					reject(new Error("Failed to get 2D context"));
					return;
				}

				ctx.drawImage(img, 0, 0);
				const imageData = ctx.getImageData(0, 0, img.width, img.height).data;
				resolve({
					data: imageData,
					width: img.width,
					height: img.height,
				}); // Uint8ClampedArray (RGBA pixel data)
			};

			img.onerror = (err) => reject(err);

			// Load image from Blob URL
			img.src = objectURL;
		});
	}

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
		const canvas = RenderInterface.renderToCanvas(null, {
			width: data.width,
			height: data.height,
			data: data.layers[0],
		});

		// Export the canvas to a Base64 PNG
		return {
			content_type: "image/png",
			data: canvas.toDataURL("image/png").split(";base64,")[1],
		};
	}

	//#endregion
	// #region Operations

	export function pointInImage(
		instance: DrawingInterface,
		x: number,
		y: number,
	) {
		return (
			x > 0 && x < instance.image.width && y > 0 && y < instance.image.height
		);
	}

	export function indexInImage(instance: DrawingInterface, index: number) {
		return index >= 0 && index < instance.image.bgData.length; // we can use bgData since it's the same size
	}

	export function getColor(
		instance: DrawingInterface,
		x: number,
		y: number,
	): RGBColor | null {
		// check that x,y is valid
		if (!pointInImage(instance, x, y)) {
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

	function nreadColor(buffer: Uint8ClampedArray, index: number): RGBColor {
		return {
			r: buffer[index],
			g: buffer[index + 1],
			b: buffer[index + 2],
			a: buffer[index + 3],
		};
	}

	function nwriteColor(
		buffer: Uint8ClampedArray,
		index: number,
		color: RGBColor,
	) {
		buffer[index] = color.r;
		buffer[index + 1] = color.g;
		buffer[index + 2] = color.b;
		buffer[index + 3] = color.a;
	}

	function ncopyColor(
		targetBuffer: Uint8ClampedArray,
		targetIndex: number,
		sourceBuffer: Uint8ClampedArray,
		sourceIndex: number,
	) {
		targetBuffer[targetIndex] = sourceBuffer[sourceIndex];
		targetBuffer[targetIndex + 1] = sourceBuffer[sourceIndex + 1];
		targetBuffer[targetIndex + 2] = sourceBuffer[sourceIndex + 2];
		targetBuffer[targetIndex + 3] = sourceBuffer[sourceIndex + 3];
	}

	export function setColor(
		instance: DrawingInterface,
		x: number,
		y: number,
		color: RGBColor,
		historize: boolean,
	): void {
		// TODO: eventually support layers
		const layerIndex = 0;

		// check that x,y is valid
		if (!pointInImage(instance, x, y)) {
			return;
		}

		// pull and validate layer
		const layer = instance.image.layers[layerIndex];
		if (layer === undefined) {
			return;
		}

		// calculate and validate index
		const index = 4 * (x + y * instance.image.width);
		if (!indexInImage(instance, index)) {
			return;
		}

		// grab current color
		const oldColor: RGBColor = nreadColor(layer, index);

		// do nothing if colors are equal
		if (Color.equal(oldColor, color)) {
			return;
		}

		// update color
		nwriteColor(layer, index, color);

		// update history
		if (historize) {
			DrawingHistory.pushChange(instance, layerIndex, x, y, color, oldColor);
		}
	}

	/**
	 *
	 * @throws if layer index is out of bounds
	 * @throws if region is invalid
	 */
	export function spliceLayer(
		instance: ImageInterface,
		layerIndex: number,
		region: AABB,
		clearColor: RGBColor = Color.CLEAR,
	): ImageInterfaceSlice {
		// grab layer
		const layer = instance.layers[layerIndex];
		assert(layer, "invalid layer index passed");

		// clamp aabb region to image size
		const clampedRegion = AABB.clamp(
			region,
			AABB.fromSize(instance.width, instance.height),
		);
		const clampedRight = clampedRegion.x + clampedRegion.width;
		const clampedBottom = clampedRegion.y + clampedRegion.height;

		// start buffer
		const buffer = new Uint8ClampedArray(
			4 * clampedRegion.width * clampedRegion.height,
		);

		// copy data from source image
		let writeIndex = 0;
		for (let y = clampedRegion.y; y < clampedBottom; y++) {
			for (let x = clampedRegion.x; x < clampedRight; x++) {
				const readIndex = 4 * (x + y * instance.width);

				// read color
				ncopyColor(buffer, writeIndex, layer, readIndex);
				writeIndex += 4;

				// clear color
				nwriteColor(layer, readIndex, clearColor);
			}
		}

		return {
			width: clampedRegion.width,
			height: clampedRegion.height,
			data: buffer,
		};
	}

	export function insertIntoLayer(
		instance: DrawingInterface,
		layerIndex: number,
		offset: Vec2,
		slice: ImageInterfaceSlice,
		historize: boolean,
	): void {
		// grab layer
		const layer = instance.image.layers[layerIndex];
		assert(layer, "invalid layer index passed");

		// clamp slice region to image size
		const clampedRegion = AABB.clamp(
			{ x: offset.x, y: offset.y, width: slice.width, height: slice.height },
			AABB.fromSize(instance.image.width, instance.image.height),
		);
		const clampedRight = clampedRegion.x + clampedRegion.width;
		const clampedBottom = clampedRegion.y + clampedRegion.height;

		// copy data from source image
		for (let y = clampedRegion.y; y < clampedBottom; y++) {
			for (let x = clampedRegion.x; x < clampedRight; x++) {
				const readIndex = 4 * (x - offset.x + (y - offset.y) * slice.width);
				const writeIndex = 4 * (x + y * instance.image.width);

				// read color
				const oldColor = historize && nreadColor(layer, writeIndex);

				// write color
				ncopyColor(layer, writeIndex, slice.data, readIndex);

				// update history
				if (historize === true) {
					const newColor = nreadColor(slice.data, readIndex);
					DrawingHistory.pushChange(
						instance,
						layerIndex,
						x,
						y,
						newColor,
						oldColor as RGBColor,
					);
				}
			}
		}
	}

	// #endregion
}
