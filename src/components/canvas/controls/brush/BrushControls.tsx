import { useContext } from "react";
import { Brush } from "../../../../interfaces/drawing/brush/Brush";
import { DrawingInterfaceContext } from "../../../../interfaces/drawing/react/DrawingInterfaceContext";
import { RenderInterface } from "../../../../interfaces/drawing/RenderInterface";

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
				{Brush.iconFor(Brush.SELECT)()}
			</button>
			{/*  */}
			<button
				className="icon-button icon-button-sm"
				onClick={() => {
					drawingInterface.brush.selected = Brush.PENCIL;
					RenderInterface.queueRender(drawingInterface);
				}}
			>
				{Brush.iconFor(Brush.PENCIL)()}
			</button>
			{/*  */}
			<button
				className="icon-button icon-button-sm"
				onClick={() => {
					drawingInterface.brush.selected = Brush.ERASER;
					RenderInterface.queueRender(drawingInterface);
				}}
			>
				{Brush.iconFor(Brush.ERASER)()}
			</button>
			{/*  */}
			<button
				className="icon-button icon-button-sm"
				onClick={() => {
					drawingInterface.brush.selected = Brush.DROPPER;
					RenderInterface.queueRender(drawingInterface);
				}}
			>
				{Brush.iconFor(Brush.DROPPER)()}
			</button>
			{/*  */}
			<button
				className="icon-button icon-button-sm"
				onClick={() => {
					drawingInterface.brush.selected = Brush.ZOOM;
					RenderInterface.queueRender(drawingInterface);
				}}
			>
				{Brush.iconFor(Brush.ZOOM)()}
			</button>
			{/*  */}
			<button
				className="icon-button icon-button-sm"
				onClick={() => {
					drawingInterface.brush.selected = Brush.PAN;
					RenderInterface.queueRender(drawingInterface);
				}}
			>
				{Brush.iconFor(Brush.PAN)()}
			</button>
		</div>
	);
}
