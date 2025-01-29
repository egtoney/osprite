import { ReactNode, useState } from "react";
import "./CustomTable.css";

export function CustomTable(props: {
	headers: string[];
	data: ReactNode[][];
	selected: number | undefined;
	setSelected: ((selected: number) => void) | undefined;
}) {
	const [colWidth] = useState([200, 200, 100]);

	return (
		<div className="custom-table">
			<div className="custom-table-row">
				{props.headers.map((header, i) => (
					<div
						key={i}
						className="custom-table-col"
						style={{ width: colWidth[i] }}
					>
						{header}
					</div>
				))}
			</div>
			{props.data.map((row, i) => (
				<div
					key={i}
					className="custom-table-row"
					onClick={() => {
						if (props.setSelected) {
							props.setSelected(i);
						}
					}}
					style={{
						backgroundColor:
							props.selected === i ? "rgba(0, 0, 255, .1)" : undefined,
					}}
				>
					{row.map((col, i) => (
						<div
							key={i}
							className="custom-table-col"
							style={{ width: colWidth[i] }}
						>
							{col}
						</div>
					))}
				</div>
			))}
		</div>
	);
}
