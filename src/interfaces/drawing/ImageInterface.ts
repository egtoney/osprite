/* eslint-disable @typescript-eslint/no-namespace */

import { assert } from "../../lib/lang";
import { AABB } from "../AABB";
import { BlendMode } from "./color/BlendMode";
import { Color, RGBColor } from "./color/Color";
import { DrawingHistory } from "./DrawingHistory";
import { DrawingInterface } from "./DrawingInterface";
import { RenderInterface } from "./RenderInterface";
import { Vec2 } from "../Vec2";
import { ColorInterface } from "./color/ColorInterface";

export interface ImageInterfaceSlice {
	data: Uint8ClampedArray;
	width: number;
	height: number;
}

export interface ImageLayer {
	data: Uint8ClampedArray;
	name: string;
	blendingMode: BlendMode;
	/** 0-255 alpha value */
	alpha: number;
	rev: number;
	_canvas?: HTMLCanvasElement;
	_rev?: number;
}

export interface ImageInterface {
	layer: number;
	layers: ImageLayer[];
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
			data: data.layers[0].data,
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

	export function flagLayerChange(layer: ImageLayer) {
		layer._rev ??= layer.rev;
		layer.rev = layer._rev + 1;
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

				// write color
				ColorInterface.ncopyColor(
					buffer,
					writeIndex,
					layer.data,
					readIndex,
					BlendMode.REPLACE,
				);
				writeIndex += 4;

				// clear color
				ColorInterface.nwriteColor(
					layer.data,
					readIndex,
					clearColor,
					BlendMode.REPLACE,
				);
			}
		}

		flagLayerChange(layer);

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

		const imageRegion = AABB.fromSize(
			instance.image.width,
			instance.image.height,
		);

		// do nothing if slice does not overlap with the image
		const region = {
			x: offset.x,
			y: offset.y,
			width: slice.width,
			height: slice.height,
		};
		if (!AABB.intersect(region, imageRegion)) {
			return;
		}

		// clamp slice region to image size
		const clampedRegion = AABB.clamp(region, imageRegion);
		const clampedRight = clampedRegion.x + clampedRegion.width;
		const clampedBottom = clampedRegion.y + clampedRegion.height;

		// copy data from source image
		for (let y = clampedRegion.y; y < clampedBottom; y++) {
			for (let x = clampedRegion.x; x < clampedRight; x++) {
				const readIndex = 4 * (x - offset.x + (y - offset.y) * slice.width);
				const writeIndex = 4 * (x + y * instance.image.width);

				// read color
				const oldColor =
					historize && ColorInterface.nreadColor(layer.data, writeIndex);

				// write color
				ColorInterface.ncopyColor(
					layer.data,
					writeIndex,
					slice.data,
					readIndex,
					BlendMode.NORMAL,
				);

				// update history
				if (historize === true) {
					const newColor = ColorInterface.nreadColor(slice.data, readIndex);
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

		flagLayerChange(layer);
	}

	// #endregion
}
