import { useEffect, useMemo, useRef, useState } from "react";
import { RGBColor, Color } from "../../interfaces/drawing/color/Color";
import { Checkerboard } from "./Checkerboard";

const DEAD_ZONE = -2;

export function ColorSlider(props: {
	label: string;
	colors: RGBColor[];
	value: number;
	maxValue: number;
	decimalPlaces: number;
	onSet: (value: number) => void;
}) {
	const ref = useRef<HTMLDivElement>(null);
	const [pressed, setPressed] = useState(false);
	const [displayedNumber, setDisplayedNumber] = useState(
		props.value.toString(),
	);

	const invalidHex = useMemo(
		() => Number.isNaN(Number(displayedNumber)) === true,
		[displayedNumber],
	);

	useEffect(() => {
		const candidate = props.value.toString();
		// update if different numbers
		if (Number(displayedNumber) !== Number(formatNumber(candidate))) {
			// allow NaN to equal 0
			if (
				props.value === 0 &&
				(Number.isNaN(Number(displayedNumber)) || displayedNumber === ".")
			) {
				return;
			}
			setDisplayedNumber(candidate);
		}
	}, [props.value, displayedNumber]);

	/** truncate to a number that can be represented as a uint8 */
	const truncateValue = (value: number) => Math.round(255 * value) / 255;

	const percentValue = useMemo(
		() => props.value / props.maxValue,
		[props.value, props.maxValue],
	);

	const outsideInnerBounds = (x: number, y: number, bounds: DOMRect) =>
		x < bounds.left + DEAD_ZONE || // left bounds
		x > bounds.right - DEAD_ZONE || // right bounds
		y < bounds.top - 5 || // top bounds
		y > bounds.bottom; // bottom bounds

	const pressStart = (x: number, y: number) => {
		if (ref.current) {
			const bounds = ref.current.getBoundingClientRect();
			if (!outsideInnerBounds(x, y, bounds) && !pressed) {
				setPressed(true);
			}
		}
	};

	const pressEnd = () => {
		setPressed(false);
	};

	const pressMove = (x: number, y: number, pressedOverride = false) => {
		if (ref.current && (pressedOverride || pressed)) {
			const bounds = ref.current.getBoundingClientRect();

			// ignore single presses outside of inner bounds
			if (!pressed && outsideInnerBounds(x, y, bounds)) {
				return;
			}

			// grab slider percent clamped to [0, 1]
			const value = Math.max(0, Math.min((x - bounds.left) / bounds.width, 1));
			// console.log(x, y, bounds.left, bounds.right, value);

			// truncate decimal and scale to final value
			const rounded = props.maxValue * truncateValue(value);

			props.onSet(rounded);
			setDisplayedNumber(rounded.toString());
		}
	};

	const formatNumber = (num: string) => {
		return num.startsWith("0.")
			? num.substring(1).padEnd(3, "0").substring(0, 3)
			: num;
	};

	return (
		<div
			style={{
				display: "flex",
				alignItems: "center",
			}}
		>
			<div style={{ width: "55px" }}>{props.label}</div>
			<div
				className="color-slider"
				style={{
					cursor: "pointer",
					position: "relative",
				}}
			>
				<div
					style={{
						position: "absolute",
						left: "-3px",
						width: "calc(100% - 2px)",
						height: "2px",
					}}
				>
					<div
						className="color-slider-thumb"
						style={{
							position: "absolute",
							left: `${percentValue * 100}%`,
						}}
					></div>
				</div>
				<div className="color-slider-track-wrapper">
					<div
						ref={ref}
						className="color-slider-track"
						style={{
							marginTop: "5px",
							position: "relative",
						}}
					>
						<Checkerboard />
						<div
							style={{
								position: "absolute",
								left: 0,
								width: "100%",
								height: "100%",
								backgroundImage: `linear-gradient(to right, ${props.colors.map((c) => Color.toStringRGBA(c)).join(", ")})`,
							}}
						/>
					</div>
					<div
						style={{
							pointerEvents: "inherit",
							position: pressed ? "fixed" : "absolute",
							left: pressed ? 0 : -10,
							top: pressed ? 0 : -6,
							width: pressed ? "100vw" : "calc(100% + 20px)",
							zIndex: pressed ? 200 : 1,
							height: pressed ? "100vh" : "calc(100% + 7px)",
							transform: "translateZ(200)",
						}}
						onClick={(e) => pressMove(e.clientX, e.clientY, true)}
						onMouseDown={(e) => pressStart(e.clientX, e.clientY)}
						onMouseUp={() => pressEnd()}
						onMouseLeave={() => pressEnd()}
						onMouseMove={(e) => {
							e.preventDefault();
							pressMove(e.clientX, e.clientY);
						}}
						onTouchStart={(e) => {
							e.preventDefault();
							pressStart(e.touches[0].clientX, e.touches[0].clientY);
						}}
						onTouchEnd={(e) => {
							e.preventDefault();
							pressEnd();
						}}
						onTouchMove={(e) => {
							e.preventDefault();
							pressMove(e.touches[0].clientX, e.touches[0].clientY);
						}}
						onTouchCancel={() => pressEnd()}
					/>
				</div>
			</div>
			<input
				className="icon-button"
				style={{
					width: "34px",
					height: "17px",
					marginLeft: "10px",
					pointerEvents: "all",
					borderColor: invalidHex ? "red" : "revert",
					backgroundColor: invalidHex ? "rgba(255, 0, 0, .1)" : "revert",
				}}
				type="text"
				value={formatNumber(displayedNumber)}
				onChange={(e) => {
					setDisplayedNumber(e.target.value);

					let candidate = Number(e.target.value);

					// ignore invalid input
					if (Number.isNaN(candidate)) {
						props.onSet(0);
						return;
					}

					// clamp between [0, maxValue]
					candidate = Math.max(0, Math.min(candidate, props.maxValue));

					// truncate to make sure number can be represented by a uint8
					candidate = truncateValue(candidate);

					props.onSet(candidate);
				}}
			/>
		</div>
	);
}
