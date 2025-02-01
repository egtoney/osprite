import { useContext } from "react";
import { ClipboardInterface } from "../../../../../interfaces/drawing/ClipboardInterface";
import { DrawingInterfaceContext } from "../../../../../interfaces/drawing/react/DrawingInterfaceContext";
import { BootstrapIconClipboard } from "../../../../icons/BootstrapIconClipboard";
import { BootstrapIconCopy } from "../../../../icons/BootstrapIconCopy";
import { BootstrapIconScissors } from "../../../../icons/BootstrapIconScissors";

export function SelectOptions() {
	const [drawingInterface] = useContext(DrawingInterfaceContext);

	return (
		<>
			<div style={{ flexGrow: 1 }}></div>
			<button
				className="icon-button icon-button-sm"
				onClick={() => ClipboardInterface.cut(drawingInterface)}
			>
				<BootstrapIconScissors />
			</button>
			<button
				className="icon-button icon-button-sm"
				onClick={() => ClipboardInterface.copy(drawingInterface)}
			>
				<BootstrapIconCopy />
			</button>
			<button
				className="icon-button icon-button-sm"
				onClick={() => ClipboardInterface.paste(drawingInterface)}
			>
				<BootstrapIconClipboard />
			</button>
		</>
	);
}
