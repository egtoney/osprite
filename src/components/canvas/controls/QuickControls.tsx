export function QuickControls() {
	return (
		<div
			style={{
				margin: "0 4px",
				display: "flex",
				flexDirection: "column",
			}}
		>
			<button
				className="icon-button"
				style={{
					aspectRatio: 1,
				}}
			>
				{"<-"}
			</button>
			<button
				className="icon-button"
				style={{
					aspectRatio: 1,
				}}
			>
				{"->"}
			</button>
		</div>
	);
}
