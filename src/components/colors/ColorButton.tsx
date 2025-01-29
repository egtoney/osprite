import { useState } from "react";
import { Color } from "../../interfaces/drawing/Color";
import { Checkerboard } from "./Checkerboard";
import { ColorPicker } from "./ColorPicker";

export function ColorButton(props: {
	color: Color;
	onChange: (color: Color) => void;
}) {
	const [open, setOpen] = useState(false);

	return (
		<div style={{ position: "relative", width: "100%" }}>
			{open && (
				<>
					<div
						style={{
							position: "fixed",
							left: 0,
							top: 0,
							right: 0,
							bottom: 0,
							backgroundColor: "rgba(0, 0, 0, .5)",
							zIndex: 3,
						}}
						onClick={() => {
							setOpen(false);
						}}
					/>
					<ColorPicker color={props.color} onChange={props.onChange} />
				</>
			)}
			<button
				className="icon-button color-button"
				style={{
					position: "relative",
					marginBottom: "2px",
					display: "flex",
					alignItems: "stretch",
					overflow: "hidden",
				}}
				onClick={() => setOpen(!open)}
			>
				<Checkerboard />
				<div
					style={{
						flexGrow: 1,
						backgroundColor: Color.toStringRGBA(Color.toRGB(props.color)),
						color: Color.toStringRGBA(
							Color.getBestTextColor(Color.blend(Color.toRGB(props.color), Color.WHITE)),
						),
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						zIndex: 0,
						fontSize: "1.25em",
					}}
				>
					{Color.toStringHex(Color.toRGB(props.color))}
				</div>
			</button>
		</div>
	);
}
