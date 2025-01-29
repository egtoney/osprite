import { FileNavMenu } from "./menus/FileNavMenu";
import { HelpNavMenu } from "./menus/HelpNavMenu";
import "./Navbar.css";

export function Navbar() {
	return (
		<div
			className="nav"
			style={{
				display: "flex",
			}}
		>
			<FileNavMenu />
			{/* <NavButton name="Edit" />
			<NavButton name="Sprite" />
			<NavButton name="Layer" />
			<NavButton name="Frame" />
			<NavButton name="Select" />
			<NavButton name="View" /> */}
			<HelpNavMenu />
		</div>
	);
}
