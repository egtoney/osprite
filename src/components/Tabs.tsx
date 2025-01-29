import { useContext } from "react";
import { DrawingInterfaceListContext } from "../interfaces/drawing/DrawingInterfaceListContext";
import { DrawingInterfaceContext } from "../interfaces/drawing/DrawingInterfaceContext";

export function Tab(props: { focused: boolean; name: string; index: number }) {
	const [interfaces, setInterfaces] = useContext(DrawingInterfaceListContext);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [_, setInterface] = useContext(DrawingInterfaceContext);

	return (
		<div
			style={{
				display: "flex",
				alignItems: "center",
				width: "120px",
				border: "1px solid black",
				borderBottom: props.focused ? "none" : "1px solid black",
				borderStartStartRadius: "4px",
				borderStartEndRadius: "4px",
				margin: "0 1px",
				padding: "2px",
				paddingBottom: "0",
				position: "relative",
				bottom: -1,
				backgroundColor: props.focused ? "white" : "rgba(0, 0, 0, .1)",
				cursor: "pointer",
			}}
			onClick={() => {
				setInterface(props.index);
			}}
		>
			<div style={{ flexGrow: 1, overflow: "hidden", whiteSpace: "nowrap" }}>
				{props.name}
			</div>
			<div
				style={{ display: "flex", alignItems: "center" }}
				onClick={() => {
					console.log("removing", interfaces, props.index);
					interfaces.splice(props.index, 1);

					setInterfaces([...interfaces]);

					// if (props.focused) {
					// 	setInterface(Math.max(0, props.index - 1));
					// }
				}}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="16"
					fill="currentColor"
					className="bi bi-x"
					viewBox="0 0 16 16"
				>
					<path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
				</svg>
			</div>
		</div>
	);
}

export function Tabs() {
	const [interfaces] = useContext(DrawingInterfaceListContext);
	const [selected] = useContext(DrawingInterfaceContext);

	const _interfaces = interfaces ?? [];

	return (
		<div
			style={{
				display: "flex",
				padding: "0px 3px",
				borderBottom: "1px solid black",
			}}
		>
			{_interfaces.map((i, index) => (
				<Tab
					key={i.id}
					focused={i === selected}
					name={i.save.name ?? "new file"}
					index={index}
				/>
			))}
		</div>
	);
}
