/* eslint-disable @typescript-eslint/no-namespace */
import PouchDB from "pouchdb";
import { DrawingInterface } from "./DrawingInterface";
import { ImageInterface } from "./ImageInterface";
import { assert } from "../../lib/lang";

export namespace FileInterface {
	const db = new PouchDB("local");

	export async function clearData() {
		await db.destroy();
	}

	function cleanContext(context: DrawingInterface): Partial<DrawingInterface> {
		const clonedContext: Partial<DrawingInterface> = {};

		// TODO: remove when DrawingInterface is no longer a class
		for (const key of Object.keys(context) as (keyof DrawingInterface)[]) {
			if (typeof context[key] !== "function") {
				try {
					// @ts-expect-error: some properties could be readonly
					clonedContext[key] = context[key];
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				} catch (e) {
					// do nothing
				}
			}
		}

		return clonedContext;
	}

	function cleanContexts(contexts: DrawingInterface[]): Partial<DrawingInterface>[] {
		const clonedContexts: Partial<DrawingInterface>[] = [];

		for (const context of contexts) {
			clonedContexts.push(cleanContext(context));
		}

		return clonedContexts;
	}

	// #region Context

	export async function saveContext(contexts: DrawingInterface[]) {
		const clonedContexts = cleanContexts(contexts);

		let _rev: undefined | string = undefined;
		try {
			_rev = (await db.get("static/drawing_context"))._rev;
		} catch {
			// do nothing
		}

		await db.put(
			{
				_id: "static/drawing_context",
				_rev: _rev,
				context: clonedContexts,
			},
			{
				force: true,
			},
		);

		console.log("saved context");
	}

	export async function getContext(): Promise<DrawingInterface[]> {
		try {
			const record = await db.get("static/drawing_context");
			const stripped = (record as any).context as DrawingInterface[];

			return stripped.map((plainObj) => {
				const classObj = new DrawingInterface(1, 1, 1);
				Object.assign(classObj, plainObj);
				return classObj;
			});
		} catch {
			return [new DrawingInterface(16 * 8, 16 * 8, 4)];
		}
	}

	// #endregion

	// #region File

	export async function saveFile(context: DrawingInterface, newFile: boolean) {
		// check if file already exists
		let _rev: undefined | string = undefined;
		if (!newFile) {
			const oldDoc = await db.get(`file/${context.save.name}`);

			assert(oldDoc._rev, "old document must have revision to overwrite");

			_rev = oldDoc._rev;
		}

		assert(context.save.name, "file does not have a set name");
		
		const doc = {
			_id: `file/${context.save.name}`,
			_rev,
			_attachments: {
				image: ImageInterface.encodeToBase64PNG(context.image),
			},
			...cleanContexts([context])[0],
		};

		console.log(doc);

		await db.put(doc);

		console.log('saved', context.save.name);
	}

	export async function getFiles() {
		return (await db.allDocs({
			include_docs: true,
			startkey: "file/",
			endkey: "file/" + "\uffff",
		})).rows;
	}

	export function getFile(id: string) {
		return db.get(id);
	}

	export function downloadFile(context: DrawingInterface) {
		const canvas = document.createElement("canvas");
		canvas.width = context.image.width;
		canvas.height = context.image.height;
		const ctx = canvas.getContext("2d");

		assert(ctx, 'Could not get Graphics2D context');

		// clear background
		ctx.clearRect(0, 0, context.image.width, context.image.height);

		// Example: Add some text// render pixels
		for (let x = 0; x < context.image.width; x++) {
			for (let y = 0; y < context.image.height; y++) {
				const index = 4 * (x + y * context.image.width);

				const r = context.image.layers[0][index + 0];
				const g = context.image.layers[0][index + 1];
				const b = context.image.layers[0][index + 2];
				const a = context.image.layers[0][index + 3];

				ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a / 255})`;
				ctx.fillRect(
					x,
					y,
					1,
					1,
				);
			}
		}

		const link = document.createElement("a");

		// Convert canvas to data URL (Base64 PNG)
		link.href = canvas.toDataURL("image/png");

		// Set the download filename
		link.download = "canvas-image.png";

		// Programmatically click the link to trigger download
		link.click();
	}

	// #endregion
}
