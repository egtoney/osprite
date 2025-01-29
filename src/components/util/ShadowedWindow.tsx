import React from "react";

export function ShadowedWindow(
	props: {
		open: boolean;
		setOpen: (open: boolean) => void;
	} & React.PropsWithChildren,
) {
	return (
		<>
			<div
				style={{
					display: props.open ? "initial" : "none",
					position: "fixed",
					inset: 0,
					backgroundColor: "rgba(0, 0, 0, .1)",
					zIndex: 75,
				}}
				onClick={() => props.setOpen(false)}
			/>
			{props.children}
		</>
	);
}
