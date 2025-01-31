import { useContext, useMemo } from "react";
import { Brush } from "../../../../interfaces/drawing/brush/Brush";
import { DrawingInterfaceContext } from "../../../../interfaces/drawing/react/DrawingInterfaceContext";
import { BootstrapIconArrowClockwise } from "../../../icons/BootstrapIconArrowClockwise";
import { BootstrapIconArrowCounterclockwise } from "../../../icons/BootstrapIconArrowCounterclockwise";
import { BootstrapIconFullscreen } from "../../../icons/BootstrapIconFullscreen";
import { DropperOptions } from "./options/DropperOptions";
import { EraserOptions } from "./options/EraserOptions";
import { PencilOptions } from "./options/PencilOptions";
import { SelectOptions } from "./options/SelectOptions";
import { DrawingHistory } from "../../../../interfaces/drawing/DrawingHistory";

export function BrushOptions() {
	const [drawingInterface] = useContext(DrawingInterfaceContext);

	const options = [
		<SelectOptions />,
		<PencilOptions />,
		<EraserOptions />,
		<DropperOptions />,
	];

	const option = useMemo(() => {
		switch (drawingInterface.brush.selected) {
			case Brush.SELECT:
				return options[0];
			case Brush.PENCIL:
				return options[1];
			case Brush.ERASER:
				return options[2];
			case Brush.DROPPER:
				return options[3];
			default:
				return null;
		}
	}, [drawingInterface.brush.selected]);

	return (
		<div
			style={{
				display: "flex",
				alignItems: "center",
				margin: "6px 0",
			}}
		>
			{/* fullscreen button */}
			<button
				className="icon-button icon-button-sm icon-button-space-right"
				onClick={() => {}}
				disabled
			>
				<BootstrapIconFullscreen />
			</button>
			{/* undo button */}
			<button
				className="icon-button icon-button-sm"
				onClick={() => {
					DrawingHistory.undo(drawingInterface);
				}}
				disabled={!DrawingHistory.canUndo(drawingInterface)}
			>
				<BootstrapIconArrowCounterclockwise />
			</button>
			{/* redo button */}
			<button
				className="icon-button icon-button-sm icon-button-space-right"
				onClick={() => {
					DrawingHistory.redo(drawingInterface);
				}}
				disabled={!DrawingHistory.canRedo(drawingInterface)}
			>
				<BootstrapIconArrowClockwise />
			</button>
			{option}
		</div>
	);
}
