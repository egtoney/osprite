import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useToggle } from "../../../hooks/useToggle";
import { ArrayExt } from "../../../interfaces/Array";
import { Color } from "../../../interfaces/drawing/color/Color";
import { ColorInterface } from "../../../interfaces/drawing/color/ColorInterface";
import { DrawingInterface } from "../../../interfaces/drawing/DrawingInterface";
import { DrawingInterfaceContext } from "../../../interfaces/drawing/react/DrawingInterfaceContext";
import { RenderInterface } from "../../../interfaces/drawing/RenderInterface";
import { Checkerboard } from "../../colors/Checkerboard";
import { ColorButton } from "../../colors/ColorButton";
import { BootstrapIconFolder } from "../../icons/BootstrapIconFolder";
import { BootstrapIconGripVertical } from "../../icons/BootstrapIconGripVertical";
import { BootstrapIconList } from "../../icons/BootstrapIconList";
import { BootstrapIconLock } from "../../icons/BootstrapIconLock";
import { BootstrapIconUnlock } from "../../icons/BootstrapIconUnlock";
import "./ColorControls.css";

const DEFAULT_PALLET = [
	Color.CLEAR,
	Color.WHITE,
	Color.BLACK,
	Color.GREY,
	Color.RED,
	Color.YELLOW,
	Color.GREEN,
	Color.CYAN,
	Color.BLUE,
	Color.MAGENTA,
];

export function ColorPallet(props: {
	locked: boolean;
	drawingInterface: DrawingInterface;
}) {
	const boxSize = 22;

	const [selected, setSelected] = useState<number | null>(null);
	const [pallet, setPallet] = useState<Color[]>(DEFAULT_PALLET);
	const [palletSize, setPalletSize] = useState(DEFAULT_PALLET.length);
	const ref = useRef<HTMLDivElement>(null);
	const [pressed, setPressed] = useState(false);
	const [location, setLocation] = useState([0, 0]);
	const [resize, setResize] = useState(false);

	// effect to update pallet colors
	useEffect(() => {
		// do nothing if locked
		if (props.locked) {
			return;
		}

		// do nothing if there is no selection
		if (selected === null) {
			return;
		}

		const palletColor = pallet[selected] ?? Color.BLACK;
		const currentColor = ColorInterface.currentColor(props.drawingInterface);

		if (!Color.equal(palletColor, currentColor)) {
			pallet[selected] = { ...currentColor };
			setPallet([...pallet]);
		}
	}, [
		props.drawingInterface.colors.primary,
		props.drawingInterface.colors.secondary,
		props.drawingInterface.brush.button,
		props.drawingInterface,
		props.locked,
		pallet,
		selected,
	]);

	const startMove = (x: number, y: number) => {
		setPressed(true);
		updateMove(x, y, true);
	};
	const updateMove = (
		x: number,
		y: number,
		pressedOverride: boolean = false,
		finish: boolean = false,
	) => {
		if (ref.current && (pressed || pressedOverride)) {
			const bounds = ref.current.getBoundingClientRect();
			const col = Math.floor((x - bounds.left) / (boxSize + 1));
			const row = Math.floor((y - bounds.top) / (boxSize + 1));
			const rowSize = Math.floor((bounds.width - 1) / (boxSize + 1));
			const newLength = col + row * rowSize;

			if (resize) {
				setPalletSize(newLength);
			}
			setLocation([(boxSize + 1) * col + 1, (boxSize + 1) * row + 1]);

			// recreate pallet if finishing
			if (resize && finish) {
				setPallet(ArrayExt.resize([...pallet], newLength, Color.BLACK));
			}
		}
	};
	const endMove = (x: number, y: number) => {
		setPressed(false);
		updateMove(x, y, true, true);
		setResize(false);
	};

	const colors = useMemo<Color[]>(() => {
		const res = [];
		for (let i = 0; i < palletSize; i++) {
			if (i < pallet.length) {
				res[i] = pallet[i];
			} else {
				res[i] = { ...Color.BLACK };
			}
		}
		return res;
	}, [pallet, palletSize]);

	return (
		<div
			className="pallet-grid"
			style={{
				flexGrow: 1,
				overflow: "hidden",
			}}
			onTouchMove={(e) => {
				updateMove(e.touches[0].clientX, e.touches[0].clientY);
			}}
			onMouseMove={(e) => {
				updateMove(e.clientX, e.clientY);
			}}
			onTouchEnd={(e) => {
				endMove(e.touches[0].clientX, e.touches[0].clientY);
			}}
			onMouseUp={(e) => {
				endMove(e.clientX, e.clientY);
			}}
			onContextMenu={(e) => {
				e.preventDefault();
			}}
		>
			<div
				ref={ref}
				style={{
					display: "flex",
					flexWrap: "wrap",
					gap: 1,
					padding: "1px",
					position: "relative",
				}}
			>
				{colors.map((color, i) => (
					<div
						key={i}
						style={{
							outline: "1px solid black",
							cursor: "pointer",
							overflow: "hidden",
							position: "relative",
							width: `${boxSize}px`,
							height: `${boxSize}px`,
						}}
						onClick={() => {
							props.drawingInterface.colors.primary = { ...color };
							RenderInterface.queueRender(props.drawingInterface);
							setSelected(i);
						}}
						onTouchStart={() => {
							setResize(false); // BUGFIX: needed to prevent unneeded resizes for some reason
						}}
						onMouseUp={(e) => {
							switch (e.button) {
								case 0:
									props.drawingInterface.colors.primary = { ...color };
									RenderInterface.queueRender(props.drawingInterface);
									setSelected(i);
									break;
								case 2:
									props.drawingInterface.colors.secondary = { ...color };
									RenderInterface.queueRender(props.drawingInterface);
									setSelected(i);
									break;
								default:
									break;
							}
						}}
					>
						<div
							style={{
								position: "relative",
								width: "200%",
								height: "200%",
								backgroundColor: Color.toStringRGBA(
									Color.toRGB(color ?? Color.BLACK),
								),
								zIndex: 1,
							}}
						/>
						<Checkerboard />
					</div>
				))}
				<div
					style={{
						width: `${boxSize + 1}px`,
						height: `${boxSize + 1}px`,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						cursor: "all-scroll",
						position: pressed ? "absolute" : "initial",
						left: `${location[0]}px`,
						top: `${location[1]}px`,
					}}
					onMouseDown={(e) => {
						startMove(e.clientX, e.clientY);
						setResize(true);
					}}
					onTouchStart={(e) => {
						startMove(e.touches[0].clientX, e.touches[0].clientY);
						setResize(true);
					}}
				>
					<BootstrapIconGripVertical />
				</div>
			</div>
			<div style={{ flexGrow: 1 }} />
		</div>
	);
}

export function ColorControls() {
	const [drawingInterface] = useContext(DrawingInterfaceContext);
	const [locked, toggleLocked] = useToggle(true);

	return (
		<div
			id="color-controls"
			style={{
				display: "flex",
				width: "160px",
				flexDirection: "column",
				margin: "0 4px",
			}}
		>
			{/* spacing */}
			<div
				style={{
					margin: "6px 0",
				}}
			>
				<button
					className="icon-button icon-button-sm"
					onClick={() => toggleLocked()}
				>
					{locked ? <BootstrapIconLock /> : <BootstrapIconUnlock />}
				</button>
				<button className="icon-button icon-button-sm" disabled>
					<BootstrapIconFolder />
				</button>
				<button className="icon-button icon-button-sm" disabled>
					<BootstrapIconList />
				</button>
			</div>
			<ColorPallet locked={locked} drawingInterface={drawingInterface} />
			<div className="color-gradient"></div>
			<ColorButton
				color={drawingInterface.colors.primary}
				onChange={(c) => {
					drawingInterface.colors.primary = c;
					RenderInterface.queueRender(drawingInterface);
				}}
			/>
			<ColorButton
				color={drawingInterface.colors.secondary}
				onChange={(c) => {
					drawingInterface.colors.secondary = c;
					RenderInterface.queueRender(drawingInterface);
				}}
			/>
		</div>
	);
}
