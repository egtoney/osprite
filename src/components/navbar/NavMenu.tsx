import { ShadowedWindow } from "../util/ShadowedWindow";

export function NavMenu(
	props: {
		name: string;
		open: boolean;
		setOpen: (open: boolean) => void;
	} & React.PropsWithChildren,
) {
	return (
		<ShadowedWindow open={props.open} setOpen={props.setOpen}>
			<div
				className="nav-button-wrapper"
				style={{
					position: "relative",
				}}
			>
				<div
					className="nav-button"
					style={{
						paddingRight: "10px",
						paddingLeft: "5px",
						cursor: "pointer",
					}}
					onClick={() => props.setOpen(!props.open)}
				>
					{props.name}
				</div>
				<div
					style={{
						position: "absolute",
						visibility: props.open ? undefined : "hidden",
						display: props.open ? "flex" : undefined,
						flexDirection: "column",
						minWidth: "100px",
						backgroundColor: "white",
						zIndex: 100,
						padding: "0px 0px",
						border: "1px solid rgba(0, 0, 0, .2)",
						borderRadius: "4px",
						borderStartStartRadius: 0,
					}}
				>
					{props.children}
				</div>
			</div>
		</ShadowedWindow>
	);
}
