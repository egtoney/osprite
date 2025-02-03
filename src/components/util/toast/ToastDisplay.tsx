import { useMemo } from "react";
import { REMOVE_TOAST_AFTER, Toast, ToastLevel } from "./Toast";

export function ToastDisplay(props: { toast: Toast }) {
	const color = useMemo(() => {
		switch (props.toast.level) {
			case ToastLevel.SUCCESS:
				return "color-green";
			case ToastLevel.INFO:
				return "color-blue";
			case ToastLevel.WARNING:
				return "color-yellow";
			case ToastLevel.ERROR:
				return "color-red";
		}
	}, [props.toast]);

	const percent = (100 * (Date.now() - props.toast.time)) / REMOVE_TOAST_AFTER;

	return (
		<div
			// className={`${color}`}
			style={{
				position: "relative",
				backgroundColor: "white",
				border: "1px solid black",
				borderRadius: "2px",
				minWidth: "calc(min(50vw, 300px))",
				maxWidth: "50vw",
				padding: ".25em",
				margin: ".25em",
				boxShadow: "0px 1px 1px black",
				overflow: "hidden",
			}}
		>
			{props.toast.text}
			<div
				className={color}
				style={{
					position: "absolute",
					left: 0,
					bottom: 0,
					width: `${percent}%`,
					height: "3px",
				}}
			/>
		</div>
	);
}
