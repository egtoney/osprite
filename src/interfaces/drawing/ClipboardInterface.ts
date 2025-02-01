import { DrawingInterface } from "./DrawingInterface";
import { ImageInterface, ImageInterfaceSlice } from "./ImageInterface";
import { RenderInterface } from "./RenderInterface";
import { SelectionInterface } from "./SelectionInterface";

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace ClipboardInterface {
	/**
	 * Handles when the paste kind is "string". This will only work when the contents of the string is a valid objectURL. Supported types will depend on the user's browser. All browsers are supposed to at least support png.
	 */
	function handlePasteEventString(
		item: DataTransferItem,
	): Promise<ImageInterfaceSlice | undefined> {
		return new Promise((resolve) => {
			// get data as text
			item.getAsString((textData) => {
				ImageInterface.decode(textData)
					.then(resolve)
					.catch(() => resolve(undefined));
			});
		});
	}

	/**
	 * Handles when the paste kind is "file". This will only work if the image file as supported by the browser. All browsers are supposed to at least support png.
	 */
	async function handlePasteEventFile(
		item: DataTransferItem,
	): Promise<ImageInterfaceSlice | undefined> {
		// decode passed file
		const file = item.getAsFile();
		if (file === null) {
			return;
		}
		return ImageInterface.decode(URL.createObjectURL(file));
	}

	export async function handlePasteEvent(
		e: ClipboardEvent,
	): Promise<ImageInterfaceSlice | undefined> {
		// try to parse all clipboard items till the first supported item is found
		for (const item of e.clipboardData?.items ?? []) {
			let result;
			switch (item.kind) {
				case "string":
					result = await handlePasteEventString(item);
					break;
				case "file":
					result = await handlePasteEventFile(item);
					break;
			}

			if (result !== undefined) {
				return result;
			} else {
				console.warn("unsupported paste with type", item.type);
			}
		}
	}

	export function applyPaste(
		instance: DrawingInterface,
		decoded: ImageInterfaceSlice,
	) {
		// clear current selection
		SelectionInterface.clearSelection(instance);

		// start a new selection with the pasted image
		instance.selection = SelectionInterface.fromImage(decoded);
		RenderInterface.queueRender(instance);
	}

	export async function paste(instance: DrawingInterface) {
		try {
			// try decoding the image
			const decoded = await ImageInterface.decode(
				await navigator.clipboard.readText(),
			);

			applyPaste(instance, decoded);

			// eslint-disable-next-line @typescript-eslint/no-unused-vars
		} catch (e) {
			// TODO: eventually display warning
			console.log(e);
		}
	}

	export async function copy(instance: DrawingInterface) {
		if (instance.selection) {
			// write to clipboard
			await navigator.clipboard.write([
				new ClipboardItem({
					"text/plain": RenderInterface.renderToCanvas(
						null,
						instance.selection.data,
					).toDataURL("image/png"),
				}),
			]);
		}
	}

	export async function cut(instance: DrawingInterface) {
		await copy(instance);

		if (instance.selection) {
			// difference, clear selection
			delete instance.selection;
			RenderInterface.queueRender(instance);
		}
	}
}
