export function Checkerboard() {
	return (
		<div
			style={{
				position: "absolute",
				width: "352px",
				height: "352px",
				left: "calc(50% - 165px)",
				top: "calc(50% - 165px)",
				backgroundColor: "lightgrey",
				backgroundImage:
					"linear-gradient( 45deg, grey 25%, transparent 25%, transparent 75%, grey 75%, grey ), linear-gradient( -45deg, grey 25%, transparent 25%, transparent 75%, grey 75%, grey )",
				backgroundSize: "32px 32px",
				backgroundRepeat: "repeat",
				transform: "rotate(45deg)",
			}}
		/>
	);
}
