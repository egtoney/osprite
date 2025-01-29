import { useState } from "react";
import { FileInterface } from "../../../interfaces/drawing/FileInterface";
import { NavMenu } from "../NavMenu";
import { NavMenuButton } from "../NavMenuButton";

export function HelpNavMenu() {
	const [open, setOpen] = useState(false);

	return (
		<>
			{/* actual menu */}
			<NavMenu name="Help" open={open} setOpen={setOpen}>
				<NavMenuButton
					name="delete all data"
					setOpen={setOpen}
					onClick={() => FileInterface.clearData()}
				/>
			</NavMenu>
		</>
	);
}
