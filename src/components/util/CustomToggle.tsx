import { BootstrapIconCheck } from "../icons/BootstrapIconCheck";
import { BootstrapIconX } from "../icons/BootstrapIconX";

export function CustomToggle(props: {label: string, value: boolean, onChange: (value: boolean) => void}) {
	return (
		<div
			className="hover-button flex-center"
			style={{
				cursor: "pointer",
				height: '100%',
				padding: '0 4px'
			}}
			onClick={() => props.onChange(!props.value)}
		>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					width: "15px",
					height: "15px",
					border: "1px solid black",
					borderRadius: "2px",
					marginRight: "4px",
				}}
			>
				{props.value ? <BootstrapIconCheck /> : <BootstrapIconX />}
			</div>
			{props.label}
		</div>
	);
}
