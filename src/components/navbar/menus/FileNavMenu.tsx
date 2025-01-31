import { useContext, useState } from "react";
import { DrawingInterfaceContext } from "../../../interfaces/drawing/react/DrawingInterfaceContext";
import { FileInterface } from "../../../interfaces/drawing/FileInterface";
import { NewFileWindow } from "../../files/NewFileWindow";
import { SaveFileWindow } from "../../files/SaveFileWindow";
import { NavMenu } from "../NavMenu";
import { NavMenuButton } from "../NavMenuButton";
import { OpenFileWindow } from "../../files/OpenFileWindow";

export function FileNavMenu() {
	const [open, setOpen] = useState(false);
	const [drawingInterface] = useContext(DrawingInterfaceContext);
	const [newFileVisible, setNewFileVisible] = useState(false);
	const [saveFileVisible, setSaveFileVisible] = useState(false);
	const [openFileVisible, setOpenFileVisible] = useState(false);

	return (
		<>
			{/* used windows */}
			<NewFileWindow open={newFileVisible} setOpen={setNewFileVisible} />
			<SaveFileWindow open={saveFileVisible} setOpen={setSaveFileVisible} />
			<OpenFileWindow open={openFileVisible} setOpen={setOpenFileVisible} />
			{/* actual menu */}
			<NavMenu name="File" open={open} setOpen={setOpen}>
				<NavMenuButton
					name="new"
					setOpen={setOpen}
					onClick={() => setNewFileVisible(true)}
				></NavMenuButton>
				<NavMenuButton
					name="open"
					setOpen={setOpen}
					onClick={() => setOpenFileVisible(true)}
				/>
				<NavMenuButton
					name="save"
					setOpen={setOpen}
					onClick={() => {
						if (drawingInterface.save.name) {
							FileInterface.saveFile(drawingInterface, false);
						} else {
							setSaveFileVisible(true);
						}
					}}
				/>
				<NavMenuButton
					name="save as"
					setOpen={setOpen}
					onClick={() => setSaveFileVisible(true)}
				/>
				<div
					style={{
						margin: "0px 10px",
						borderBottom: "1px solid rgba(0, 0, 0, .2)",
					}}
				/>
				<NavMenuButton name="upload" setOpen={setOpen} onClick={() => {}} />
				<NavMenuButton
					name="download"
					setOpen={setOpen}
					onClick={() => {
						FileInterface.downloadFile(drawingInterface);
					}}
				/>
			</NavMenu>
		</>
	);
}
