import { ImageInterface, ImageInterfaceSlice } from "./ImageInterface";

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace ClipboardInterface {
	/**
	 * Handles when the paste kind is "string". This will only work when the contents of the string is a valid objectURL. Supported types will depend on the user's browser. All browsers are supposed to at least support png.
	 */
	function handlePasteString(
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
	async function handlePasteFile(
		item: DataTransferItem,
	): Promise<ImageInterfaceSlice | undefined> {
		// decode passed file
		const file = item.getAsFile();
		if (file === null) {
			return;
		}
		return ImageInterface.decode(URL.createObjectURL(file));
	}

	export async function handlePaste(
		e: ClipboardEvent,
	): Promise<ImageInterfaceSlice | undefined> {
		// try to parse all clipboard items till the first supported item is found
		for (const item of e.clipboardData?.items ?? []) {
			let result;
			switch (item.kind) {
				case "string":
					result = await handlePasteString(item);
					break;
				case "file":
					result = await handlePasteFile(item);
					break;
			}

			if (result !== undefined) {
				return result;
			} else {
				console.warn("unsupported paste with type", item.type);
			}
		}
	}
}
