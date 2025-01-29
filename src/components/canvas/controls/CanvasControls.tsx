import { PaintCanvas } from "../PaintCanvas";
import { BrushOptions } from "./brush/BrushOptions";

export function CanvasControls() {
	return (
		<div
			style={{
				display: "flex",
				flexGrow: 1,
				flexDirection: "column",
				marginLeft: "4px",
			}}
		>
			<BrushOptions />
			<PaintCanvas />
			<div
				style={{
					backgroundColor: "rgba(0, 0, 0, .1)",
					height: "20%",
					marginTop: "8px",
					border: "1px solid black",
					borderRadius: "2px",
				}}
			></div>
		</div>
	);
}
