import { useContext } from "react";
import { DrawingInterfaceContext } from "../../../../../interfaces/drawing/react/DrawingInterfaceContext";
import { RenderInterface } from "../../../../../interfaces/drawing/RenderInterface";
import { BootstrapIconCircleFill } from "../../../../icons/BootstrapIconCircleFill";
import { BootstrapIconSquareFill } from "../../../../icons/BootstrapIconSquareFill";
import { CustomToggle } from "../../../../util/CustomToggle";
import { BrushShape } from "../../../../../interfaces/drawing/brush/BrushShape";

export function PencilOptions() {
	const [drawingInterface] = useContext(DrawingInterfaceContext);

	return (
		<>
			<button
				className="icon-button icon-button-sm icon-button-space-right"
				onClick={() => {
					drawingInterface.brush.pencil.shape =
						drawingInterface.brush.pencil.shape === BrushShape.CIRCLE
							? BrushShape.SQUARE
							: BrushShape.CIRCLE;
					RenderInterface.queueRender(drawingInterface);
				}}
				disabled
			>
				{drawingInterface.brush.pencil.shape === BrushShape.CIRCLE ? (
					<BootstrapIconCircleFill size={10} />
				) : (
					<BootstrapIconSquareFill size={10} />
				)}
			</button>
			<div
				className="flex-center icon-button-space-right"
				style={{
					marginRight: "6px",
				}}
			>
				<input
					className="icon-button"
					style={{
						width: "50px",
						marginRight: "2px",
					}}
					type="number"
					value={drawingInterface.brush.pencil.size}
					min={1}
					onChange={(e) => {
						const parsed = Math.max(1, Number(e.target.value));
						drawingInterface.brush.pencil.size = parsed;
						RenderInterface.queueRender(drawingInterface);
					}}
				/>
				px
			</div>
			<CustomToggle
				label="pixel perfect"
				value={drawingInterface.brush.pencil.pixelPerfect}
				onChange={() => {
					drawingInterface.brush.pencil.pixelPerfect =
						!drawingInterface.brush.pencil.pixelPerfect;
					RenderInterface.queueRender(drawingInterface);
				}}
			/>
		</>
	);
}
