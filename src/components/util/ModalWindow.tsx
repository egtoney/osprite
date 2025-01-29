import React from "react";

export function ModalWindow(
	props: {
		title: string;
		open: boolean;
		setOpen: (open: boolean) => void;
	} & React.PropsWithChildren,
) {
	return (
		<div
			style={{
				visibility: props.open ? "visible" : "hidden",
				position: "fixed",
				inset: 0,
				zIndex: 100,
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
			}}
		>
			<div
				style={{
					position: "absolute",
					width: "100%",
					height: "100%",
					backgroundColor: "rgba(0, 0, 0, .1)",
				}}
				onClick={() => props.setOpen(false)}
			/>
			<div
				style={{
					border: "1px solid black",
					zIndex: 101,
					display: "flex",
					flexDirection: "column",
					backgroundColor: "white",
					borderRadius: 2,
					overflow: "hidden",
				}}
			>
				<div
					style={{
						padding: 4,
						backgroundColor: "rgba(0, 0, 0, 0.2)",
					}}
				>
					{props.title}
				</div>
				{props.children}
			</div>
		</div>
	);
}
