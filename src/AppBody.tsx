import { useContext } from "react";
import { BrushControls } from "./components/canvas/controls/brush/BrushControls";
import { CanvasControls } from "./components/canvas/controls/CanvasControls";
import { ColorControls } from "./components/canvas/controls/ColorControls";
import { Footer } from "./components/Footer";
import { ToastList } from "./components/util/toast/ToastList";
import {
	DEFAULT_CONTEXT,
	DrawingInterfaceContext,
} from "./interfaces/drawing/react/DrawingInterfaceContext";

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
			<ToastList />
		</div>
	);
}
