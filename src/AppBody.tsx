import { useContext } from "react";
import { BrushControls } from "./components/canvas/controls/brush/BrushControls";
import { CanvasControls } from "./components/canvas/controls/CanvasControls";
import { ColorControls } from "./components/canvas/controls/ColorControls";
import {
	DEFAULT_CONTEXT,
	DrawingInterfaceContext,
} from "./interfaces/drawing/DrawingInterfaceContext";
import { Footer } from "./components/Footer";

export function AppBody() {
	const [drawingInterface] = useContext(DrawingInterfaceContext);
	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				flexGrow: 1,
			}}
		>
			<div
				style={{
					display: "flex",
					flexGrow: 1,
				}}
			>
				{drawingInterface === DEFAULT_CONTEXT ? (
					<div></div>
				) : (
					<>
						<ColorControls />
						<CanvasControls />
						<BrushControls />
					</>
				)}
			</div>
			{drawingInterface !== DEFAULT_CONTEXT && <Footer />}
		</div>
	);
}
