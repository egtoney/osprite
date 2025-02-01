import { useContext, useState } from "react";
import { ClipboardInterface } from "../../../interfaces/drawing/ClipboardInterface";
import { DrawingInterfaceContext } from "../../../interfaces/drawing/react/DrawingInterfaceContext";
import { NavMenu } from "../NavMenu";
import { NavMenuButton } from "../NavMenuButton";

export function EditNavMenu() {
	const [open, setOpen] = useState(false);
	const [drawingInterface] = useContext(DrawingInterfaceContext);

	return (
		<>
			{/* actual menu */}
			<NavMenu name="Edit" open={open} setOpen={setOpen}>
				<NavMenuButton
					name="Copy"
					setOpen={setOpen}
					onClick={() => ClipboardInterface.copy(drawingInterface)}
				></NavMenuButton>
				<NavMenuButton
					name="Cut"
					setOpen={setOpen}
					onClick={() => ClipboardInterface.cut(drawingInterface)}
				/>
				<NavMenuButton
					name="Paste"
					setOpen={setOpen}
					onClick={() => ClipboardInterface.paste(drawingInterface)}
				/>
			</NavMenu>
		</>
	);
}
