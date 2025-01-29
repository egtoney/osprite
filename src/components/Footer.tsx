import { useContext } from "react";
import { DrawingInterfaceContext } from "../interfaces/drawing/DrawingInterfaceContext";

export function Footer() {
	const [drawingInterface] = useContext(DrawingInterfaceContext);

	return (
		<div
			style={{
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				margin: "4px",
			}}
		>
			{/* filename */}
			<div>{drawingInterface.save.name ?? "new file"}</div>
			{/* spacer */}
			<div style={{ flexGrow: 1 }} />
			{/* image size */}
			<div style={{ display: "flex", alignItems: "center" }}>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="16"
					fill="currentColor"
					className="bi bi-aspect-ratio"
					viewBox="0 0 16 16"
				>
					<path d="M0 3.5A1.5 1.5 0 0 1 1.5 2h13A1.5 1.5 0 0 1 16 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 12.5zM1.5 3a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5z" />
					<path d="M2 4.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1H3v2.5a.5.5 0 0 1-1 0zm12 7a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1 0-1H13V8.5a.5.5 0 0 1 1 0z" />
				</svg>
				&nbsp;{drawingInterface.image.width} {drawingInterface.image.height}
			</div>
			{/* spacer */}
			<div style={{ flexGrow: 1 }} />
			{/* frame index */}
			<span>frame:</span>
			<input
				style={{
					border: "1px solid black",
					width: "5em",
					marginRight: "1em",
				}}
				type="number"
				value={1}
			/>
			{/* zoom */}
			<input
				style={{ border: "1px solid black", width: "5em" }}
				type="number"
				value={drawingInterface.display.zoom * 100}
				readOnly={true}
			/>
		</div>
	);
}
