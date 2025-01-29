import { useContext } from "react";
import { Brush } from "../../../../interfaces/drawing/Brush";
import { DrawingInterfaceContext } from "../../../../interfaces/drawing/DrawingInterfaceContext";

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
				{Brush.iconFor(Brush.SELECT)()}
			</button>
			{/*  */}
			<button
				className="icon-button icon-button-sm"
				onClick={() => {
					drawingInterface.brush.selected = Brush.PENCIL;
					drawingInterface.queueRender();
				}}
			>
				{Brush.iconFor(Brush.PENCIL)()}
			</button>
			{/*  */}
			<button
				className="icon-button icon-button-sm"
				onClick={() => {
					drawingInterface.brush.selected = Brush.ERASER;
					drawingInterface.queueRender();
				}}
			>
				{Brush.iconFor(Brush.ERASER)()}
			</button>
			{/*  */}
			<button
				className="icon-button icon-button-sm"
				onClick={() => {
					drawingInterface.brush.selected = Brush.DROPPER;
					drawingInterface.queueRender();
				}}
			>
				{Brush.iconFor(Brush.DROPPER)()}
			</button>
			{/*  */}
			<button
				className="icon-button icon-button-sm"
				onClick={() => {
					drawingInterface.brush.selected = Brush.ZOOM;
					drawingInterface.queueRender();
				}}
			>
				{Brush.iconFor(Brush.ZOOM)()}
			</button>
			{/*  */}
			<button
				className="icon-button icon-button-sm"
				onClick={() => {
					drawingInterface.brush.selected = Brush.PAN;
					drawingInterface.queueRender();
				}}
			>
				{Brush.iconFor(Brush.PAN)()}
			</button>
		</div>
	);
}
