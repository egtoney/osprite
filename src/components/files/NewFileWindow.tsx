import { useContext, useState } from "react";
import { DrawingInterface } from "../../interfaces/drawing/DrawingInterface";
import { DrawingInterfaceContext } from "../../interfaces/drawing/react/DrawingInterfaceContext";
import { DrawingInterfaceListContext } from "../../interfaces/drawing/react/DrawingInterfaceListContext";
import { ModalWindow } from "../util/ModalWindow";
import "./CustomWindow.css";

export function NewFileWindow(props: {
	open: boolean;
	setOpen: (open: boolean) => void;
}) {
	const [width, setWidth] = useState<string | number | undefined>(160);
	const [height, setHeight] = useState<string | number | undefined>(160);
	const [drawingInterfaces, setDrawingInterfaces] = useContext(
		DrawingInterfaceListContext,
	);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [_, setDrawingInterfaceIndex] = useContext(DrawingInterfaceContext);

	return (
		<ModalWindow title="new image" open={props.open} setOpen={props.setOpen}>
			<div id="custom-window">
				<div className="row flex-center">
					<span>width</span>
					<input
						type="number"
						value={width}
						onChange={(e) => setWidth(e.target.value)}
						onBlur={() => setWidth(Number(width))}
					/>
					px
				</div>
				<div className="row flex-center">
					<span>height</span>
					<input
						type="number"
						value={height}
						onChange={(e) => setHeight(e.target.value)}
						onBlur={() => setHeight(Number(height))}
					/>
					px
				</div>
				<div className="row flex-center">
					<button
						className="icon-button"
						onClick={() => {
							// create new drawing interface
							const newInterface = DrawingInterface.create(
								Number(width),
								Number(height),
								1,
							);
							setDrawingInterfaces([...drawingInterfaces, newInterface]);
							setDrawingInterfaceIndex(drawingInterfaces.length);

							// close this window
							props.setOpen(false);
						}}
					>
						create
					</button>
				</div>
			</div>
		</ModalWindow>
	);
}
