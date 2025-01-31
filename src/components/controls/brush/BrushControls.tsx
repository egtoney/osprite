import { useContext } from "react";
import { Brush } from "../../../interfaces/drawing/brush/Brush";
import { DrawingInterfaceContext } from "../../../interfaces/drawing/react/DrawingInterfaceContext";
import { BootstrapIconArrowsMove } from "../../icons/BootstrapIconArrowsMove";
import { BootstrapIconEraser } from "../../icons/BootstrapIconEraser";
import { BootstrapIconEyedropper } from "../../icons/BootstrapIconEyedropper";
import { BootstrapIconPencil } from "../../icons/BootstrapIconPencil";
import { BootstrapIconPlusSquareDotted } from "../../icons/BootstrapIconPlusSquareDotted";
import { BootstrapIconSearch } from "../../icons/BootstrapIconSearch";
import { RenderInterface } from "../../../interfaces/drawing/RenderInterface";

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
					RenderInterface.queueRender(drawingInterface);
				}}
			>
				<BootstrapIconPlusSquareDotted />
			</button>
			{/*  */}
			<button
				className="icon-button icon-button-sm"
				onClick={() => {
					drawingInterface.brush.selected = Brush.PENCIL;
					RenderInterface.queueRender(drawingInterface);
				}}
			>
				<BootstrapIconPencil />
			</button>
			{/*  */}
			<button
				className="icon-button icon-button-sm"
				onClick={() => {
					drawingInterface.brush.selected = Brush.ERASER;
					RenderInterface.queueRender(drawingInterface);
				}}
			>
				<BootstrapIconEraser />
			</button>
			{/*  */}
			<button
				className="icon-button icon-button-sm"
				onClick={() => {
					drawingInterface.brush.selected = Brush.DROPPER;
					RenderInterface.queueRender(drawingInterface);
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
