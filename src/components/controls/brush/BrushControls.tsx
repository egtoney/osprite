import { useContext } from "react";
import { Brush } from "../../../interfaces/drawing/Brush";
import { DrawingInterfaceContext } from "../../../interfaces/drawing/DrawingInterfaceContext";
import { BootstrapIconArrowsMove } from "../../icons/BootstrapIconArrowsMove";
import { BootstrapIconEraser } from "../../icons/BootstrapIconEraser";
import { BootstrapIconEyedropper } from "../../icons/BootstrapIconEyedropper";
import { BootstrapIconPencil } from "../../icons/BootstrapIconPencil";
import { BootstrapIconPlusSquareDotted } from "../../icons/BootstrapIconPlusSquareDotted";
import { BootstrapIconSearch } from "../../icons/BootstrapIconSearch";

export function BrushControls() {
	const [drawingInterface] = useContext(DrawingInterfaceContext);

	return (
		<div
			style={{
				margin: "0 4px",
				display: "flex",
				flexDirection: "column",
			}}
		>
			{/* spacing */}
			<div
				style={{
					margin: "6px 0",
				}}
			>
				<div className="icon-button-spacer"></div>
			</div>
			{/* buttons */}
			{/*  */}
			<button
				className="icon-button icon-button-sm"
				onClick={() => {
					drawingInterface.brush.selected = Brush.SELECT;
					drawingInterface.queueRender();
				}}
			>
				<BootstrapIconPlusSquareDotted />
			</button>
			{/*  */}
			<button
				className="icon-button icon-button-sm"
				onClick={() => {
					drawingInterface.brush.selected = Brush.PENCIL;
					drawingInterface.queueRender();
				}}
			>
				<BootstrapIconPencil />
			</button>
			{/*  */}
			<button
				className="icon-button icon-button-sm"
				onClick={() => {
					drawingInterface.brush.selected = Brush.ERASER;
					drawingInterface.queueRender();
				}}
			>
				<BootstrapIconEraser />
			</button>
			{/*  */}
			<button
				className="icon-button icon-button-sm"
				onClick={() => {
					drawingInterface.brush.selected = Brush.DROPPER;
					drawingInterface.queueRender();
				}}
			>
				<BootstrapIconEyedropper />
			</button>
			{/*  */}
			<button
				className="icon-button icon-button-sm"
				onClick={() => {}}
				disabled
			>
				<BootstrapIconSearch />
			</button>
			{/*  */}
			<button
				className="icon-button icon-button-sm"
				onClick={() => {}}
				disabled
			>
				<BootstrapIconArrowsMove />
			</button>
		</div>
	);
}
