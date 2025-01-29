import { useContext } from "react";
import { DrawingInterfaceContext } from "../../../../../interfaces/drawing/DrawingInterfaceContext";

export function EraserOptions() {
	const [drawingInterface] = useContext(DrawingInterfaceContext);

	return (
		<>
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
		</>
	);
}