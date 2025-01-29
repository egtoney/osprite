import { useContext } from "react";
import { PencilShape } from "../../../../../interfaces/drawing/DrawingInterface";
import { BootstrapIconCircleFill } from "../../../../icons/BootstrapIconCircleFill";
import { DrawingInterfaceContext } from "../../../../../interfaces/drawing/DrawingInterfaceContext";
import { BootstrapIconSquareFill } from "../../../../icons/BootstrapIconSquareFill";
import { CustomToggle } from "../../../../util/CustomToggle";

export function PencilOptions() {
	const [drawingInterface] = useContext(DrawingInterfaceContext);

	return (
		<>
			<button
				className="icon-button icon-button-sm icon-button-space-right"
				onClick={() => {
					drawingInterface.brush.pencil.shape =
						drawingInterface.brush.pencil.shape === PencilShape.CIRCLE
							? PencilShape.SQUARE
							: PencilShape.CIRCLE;
					drawingInterface.queueRender();
				}}
				disabled
			>
				{drawingInterface.brush.pencil.shape === PencilShape.CIRCLE ? (
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
						drawingInterface.queueRender();
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
					drawingInterface.queueRender();
				}}
			/>
		</>
	);
}
