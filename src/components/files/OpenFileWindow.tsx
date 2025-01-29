import { useContext, useState } from "react";
import { useAsyncMemo } from "../../hooks/useAsyncMemo";
import { DrawingInterfaceListContext } from "../../interfaces/drawing/DrawingInterfaceListContext";
import { FileInterface } from "../../interfaces/drawing/FileInterface";
import { CustomTable } from "../util/CustomTable";
import { ModalWindow } from "../util/ModalWindow";
import "./CustomWindow.css";
import { BootstrapIconFileEarmarkIcon } from "../icons/BootstrapIconFileEarmarkIcon";
import { DrawingInterface } from "../../interfaces/drawing/DrawingInterface";
import { DrawingInterfaceContext } from "../../interfaces/drawing/DrawingInterfaceContext";

export function OpenFileWindow(props: {
	open: boolean;
	setOpen: (open: boolean) => void;
}) {
	const [selected, setSelected] = useState(-1);
	const [drawingInterfaces, setDrawingInterfaces] = useContext(
		DrawingInterfaceListContext,
	);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [_, setSelectedDrawingInterface] = useContext(DrawingInterfaceContext);
	const files = useAsyncMemo(() => FileInterface.getFiles(), [props.open]);

	return (
		<ModalWindow title="open file" open={props.open} setOpen={props.setOpen}>
			<div id="custom-window" style={{ width: 700 }}>
				<CustomTable
					headers={["name", "date modified"]}
					data={(files ?? []).map((file) => [
						<div style={{ display: "flex", alignItems: "baseline" }}>
							<BootstrapIconFileEarmarkIcon />
							{file.id.split("file/")[1]}
						</div>,
						"12/10/2024",
					])}
					selected={selected}
					setSelected={setSelected}
				/>
				<div className="row flex-center">
					<button
						className="icon-button"
						onClick={() => {
							// open file
							if (files && selected >= 0 && selected < files.length) {
								FileInterface.getFile(files[selected].id).then((file) => {
									const existingInterface = drawingInterfaces.find(
										// eslint-disable-next-line @typescript-eslint/no-explicit-any
										(i) => i.id === (file as any).id,
									);

									if (existingInterface === undefined) {
										// add interface if it is not already in the list
										const obj = new DrawingInterface(1, 1, 1);
										Object.assign(obj, file);
										setDrawingInterfaces([...drawingInterfaces, obj]);
									} else {
										// select the existing opened file
										const index = drawingInterfaces.indexOf(existingInterface);
										setSelectedDrawingInterface(index);
									}
								});
							}

							// close this window
							props.setOpen(false);
						}}
						disabled={selected === -1}
					>
						open
					</button>
				</div>
			</div>
		</ModalWindow>
	);
}
