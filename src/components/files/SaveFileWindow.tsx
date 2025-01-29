import { useContext, useEffect, useMemo, useState } from "react";
import { useAsyncMemo } from "../../hooks/useAsyncMemo";
import { FileInterface } from "../../interfaces/drawing/FileInterface";
import { ModalWindow } from "../util/ModalWindow";
import "./CustomWindow.css";
import { DrawingInterfaceContext } from "../../interfaces/drawing/DrawingInterfaceContext";

export function SaveFileWindow(props: {
	open: boolean;
	setOpen: (open: boolean) => void;
}) {
	const [name, setName] = useState("new file");
	const [drawingInterface] = useContext(DrawingInterfaceContext);
	const files = useAsyncMemo(() => FileInterface.getFiles(), [props.open]);
	const invalid = useMemo(
		() => {
			const existing = (files ?? []).find((file) => file.id === `file/${name}`);

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			if ((existing?.doc as any)?.id === drawingInterface.id) {
				return false;
			}

			return true;
		},
		[files, name],
	);

	useEffect(
		() => setName(drawingInterface.save.name ?? "new file"),
		[drawingInterface],
	);

	return (
		<ModalWindow title="save file" open={props.open} setOpen={props.setOpen}>
			<div id="custom-window">
				<div>
					{(files ?? []).map((file, i) => (
						<div key={i}>{file.id}</div>
					))}
				</div>
				<div className="row flex-center">
					<span>name</span>
					<input
						type="text"
						value={name}
						onChange={(e) => setName(e.target.value)}
						data-invalid={invalid}
					/>
				</div>
				<div className="row flex-center">
					<button
						className="icon-button"
						onClick={() => {
							// name must be set
							if (!name) {
								return;
							}

							// update name
							drawingInterface.save.name = name;

							// save file
							FileInterface.saveFile(drawingInterface, true);

							// close this window
							props.setOpen(false);
						}}
					>
						save
					</button>
				</div>
			</div>
		</ModalWindow>
	);
}
