import { useEffect, useMemo, useState } from "react";
import { Color, RGBColor } from "../../interfaces/drawing/Color";
import { ColorSlider } from "./ColorSlider";

function RGBOptions(props: { color: Color; onChange: (color: Color) => void }) {
	const [r, setR] = useState(0);
	const [g, setG] = useState(0);
	const [b, setB] = useState(0);
	const [a, setA] = useState(0);

	useEffect(() => {
		try {
			Color.assertRGB(props.color);
			if (
				r !== props.color.r ||
				g !== props.color.g ||
				b !== props.color.b ||
				a !== props.color.a
			) {
				setR(props.color.r);
				setG(props.color.g);
				setB(props.color.b);
				setA(props.color.a);
			}
		} catch {
			const rgbColor = Color.toRGB(props.color);
			if (
				r !== rgbColor.r ||
				g !== rgbColor.g ||
				b !== rgbColor.b ||
				a !== rgbColor.a
			) {
				setR(rgbColor.r);
				setG(rgbColor.g);
				setB(rgbColor.b);
				setA(rgbColor.a);
			}
		}
	}, [props.color, r, g, b, a]);

	return (
		<>
			<ColorSlider
				label="R"
				colors={[Color.BLACK, Color.RED]}
				value={r}
				maxValue={255}
				decimalPlaces={0}
				onSet={(v) => {
					setR(v);
					props.onChange({ r: v, g, b, a } as Color);
				}}
			/>
			<ColorSlider
				label="G"
				colors={[Color.BLACK, Color.GREEN]}
				value={g}
				maxValue={255}
				decimalPlaces={0}
				onSet={(v) => {
					setG(v);
					props.onChange({ r, g: v, b, a } as Color);
				}}
			/>
			<ColorSlider
				label="B"
				colors={[Color.BLACK, Color.BLUE]}
				value={b}
				maxValue={255}
				decimalPlaces={0}
				onSet={(v) => {
					setB(v);
					props.onChange({ r, g, b: v, a } as Color);
				}}
			/>
			<ColorSlider
				label="A"
				colors={[
					Color.CLEAR,
					{
						...Color.toRGB(props.color),
						a: 255,
					},
				]}
				value={a}
				maxValue={255}
				decimalPlaces={0}
				onSet={(v) => {
					setA(v);
					props.onChange({ r, g, b, a: v } as Color);
				}}
			/>
		</>
	);
}

function HSVOptions(props: { color: Color; onChange: (color: Color) => void }) {
	const [h, setH] = useState(0);
	const [s, setS] = useState(0);
	const [v, setV] = useState(0);
	const [a, setA] = useState(0);

	useEffect(() => {
		try {
			Color.assertHSV(props.color);
			if (
				h !== props.color.h ||
				s !== props.color.s ||
				v !== props.color.v ||
				a !== props.color.a
			) {
				setH(props.color.h);
				setS(props.color.s);
				setV(props.color.v);
				setA(props.color.a);
			}
		} catch {
			const hsvColor = Color.toHSV(props.color);
			if (
				h !== hsvColor.h ||
				s !== hsvColor.s ||
				v !== hsvColor.v ||
				a !== hsvColor.a
			) {
				setH(hsvColor.h);
				setS(hsvColor.s);
				setV(hsvColor.v);
				setA(hsvColor.a);
			}
		}
	}, [props.color, h, s, v, a]);

	const applyToH = (h: RGBColor) =>
		Color.hsvToRGB({
			...Color.rgbToHSV(h),
			s,
			v,
		});

	return (
		<>
			<ColorSlider
				label="H"
				colors={[
					applyToH(Color.RED),
					applyToH(Color.YELLOW),
					applyToH(Color.GREEN),
					applyToH(Color.CYAN),
					applyToH(Color.BLUE),
					applyToH(Color.MAGENTA),
					applyToH(Color.RED),
				]}
				value={h}
				maxValue={360}
				decimalPlaces={0}
				onSet={(_v) => {
					setV(_v);
					props.onChange({ h: _v, s, v, a } as Color);
				}}
			/>
			<ColorSlider
				label="S"
				colors={[
					Color.hsvToRGB({
						...Color.rgbToHSV(Color.WHITE),
						v,
					}),
					Color.hsvToRGB({
						h: h,
						s: 100,
						v: v,
						a: 255,
					}),
				]}
				value={s}
				maxValue={100}
				decimalPlaces={0}
				onSet={(_v) => {
					setS(_v);
					props.onChange({ h, s: _v, v, a } as Color);
				}}
			/>
			<ColorSlider
				label="V"
				colors={[
					Color.BLACK,
					Color.hsvToRGB({
						h: h,
						s: s,
						v: 100,
						a: 255,
					}),
				]}
				value={v}
				maxValue={100}
				decimalPlaces={0}
				onSet={(_v) => {
					setV(_v);
					props.onChange({ h, s, v: _v, a } as Color);
				}}
			/>
			<ColorSlider
				label="A"
				colors={[
					Color.CLEAR,
					{
						...Color.toRGB(props.color),
						a: 255,
					},
				]}
				value={a}
				maxValue={255}
				decimalPlaces={0}
				onSet={(_v) => {
					setA(_v);
					props.onChange({ h, s, v, a: _v } as Color);
				}}
			/>
		</>
	);
}

function HSLOptions(props: { color: Color; onChange: (color: Color) => void }) {
	const [h, setH] = useState(0);
	const [s, setS] = useState(0);
	const [l, setL] = useState(0);
	const [a, setA] = useState(0);

	useEffect(() => {
		// try to handle if HSL
		try {
			Color.assertHSL(props.color);
			if (
				h !== props.color.h ||
				s !== props.color.s ||
				l !== props.color.l ||
				a !== props.color.a
			) {
				setH(props.color.h);
				setS(props.color.s);
				setL(props.color.l);
				setA(props.color.a);
			}

			// handle when not HSL
		} catch {
			const hslColor = Color.toHSL(props.color);
			if (
				h !== hslColor.h ||
				s !== hslColor.s ||
				l !== hslColor.l ||
				a !== hslColor.a
			) {
				setH(hslColor.h);
				setS(hslColor.s);
				setL(hslColor.l);
				setA(hslColor.a);
			}
		}
	}, [props.color, h, s, l, a]);

	const applyToH = (h: RGBColor) =>
		Color.hslToRGB({
			...Color.rgbToHSL(h),
			s,
			l,
		});

	const applyToS = (s: RGBColor) =>
		Color.hslToRGB({
			...Color.rgbToHSL(s),
			l,
		});

	const applyToL = (l: RGBColor) =>
		Color.hslToRGB({
			...Color.rgbToHSL(l),
			s,
		});

	return (
		<>
			<ColorSlider
				label="H"
				colors={[
					applyToH(Color.RED),
					applyToH(Color.YELLOW),
					applyToH(Color.GREEN),
					applyToH(Color.CYAN),
					applyToH(Color.BLUE),
					applyToH(Color.MAGENTA),
					applyToH(Color.RED),
				]}
				value={h}
				maxValue={360}
				decimalPlaces={0}
				onSet={(_v) => {
					setH(_v);
					props.onChange({ h: _v, s, l, a } as Color);
				}}
			/>
			<ColorSlider
				label="S"
				colors={[
					applyToS(Color.GREY),
					{
						...Color.toRGB(props.color),
						a: 255,
					},
				]}
				value={s}
				maxValue={100}
				decimalPlaces={0}
				onSet={(_v) => {
					setS(_v);
					props.onChange({ h, s: _v, l, a } as Color);
				}}
			/>
			<ColorSlider
				label="L"
				colors={[
					applyToL(Color.BLACK),
					{
						...Color.toRGB(props.color),
						a: 255,
					},
					applyToL(Color.WHITE),
				]}
				value={l}
				maxValue={100}
				decimalPlaces={0}
				onSet={(_v) => {
					setL(_v);
					props.onChange({ h, s, l: _v, a } as Color);
				}}
			/>
			<ColorSlider
				label="A"
				colors={[
					Color.CLEAR,
					{
						...Color.toRGB(props.color),
						a: 255,
					},
				]}
				value={a}
				maxValue={255}
				decimalPlaces={0}
				onSet={(_v) => {
					setA(_v);
					props.onChange({ h, s, l, a: _v } as Color);
				}}
			/>
		</>
	);
}

function GrayOptions(props: {
	color: Color;
	onChange: (color: Color) => void;
}) {
	const [grey, setGrey] = useState(0);
	const [a, setA] = useState(0);

	// sync downstream color changes
	useEffect(() => {
		// convert color to RGB
		const rgbColor = Color.toRGB(props.color);
		if (grey !== rgbColor.r || a !== rgbColor.a) {
			setGrey(rgbColor.r);
			setA(props.color.a);
		}
	}, [props.color, a, grey]);

	return (
		<>
			<ColorSlider
				label="Grey"
				colors={[Color.BLACK, Color.WHITE]}
				value={grey}
				maxValue={255}
				decimalPlaces={0}
				onSet={(_v) => {
					setGrey(_v);
					props.onChange({ r: _v, g: _v, b: _v, a } as Color);
				}}
			/>
			<ColorSlider
				label="A"
				colors={[
					Color.CLEAR,
					{
						...Color.toRGB(props.color),
						a: 255,
					},
				]}
				value={a}
				maxValue={255}
				decimalPlaces={0}
				onSet={(_v) => {
					setA(_v);
					props.onChange({ r: grey, g: grey, b: grey, a: _v } as Color);
				}}
			/>
		</>
	);
}

export function ColorPicker(props: {
	color: Color;
	onChange: (color: Color) => void;
}) {
	const [method, setMethod] = useState(0);
	const [displayedHex, setDisplayedHex] = useState("");

	const onChange = (color: Color) => {
		if (!Color.equal(props.color, color)) {
			props.onChange(color);
		}
	};

	const invalidHex = useMemo(
		() => Color.parseHex(displayedHex) === null,
		[displayedHex],
	);

	useEffect(() => {
		// only update if new color
		if (!Color.equal(props.color, Color.parseHex(displayedHex))) {
			setDisplayedHex(Color.toStringHex(Color.toRGB(props.color)).substring(1));
		}
	}, [props.color]);

	const options = [
		<RGBOptions color={props.color} onChange={onChange} />,
		<HSVOptions color={props.color} onChange={onChange} />,
		<HSLOptions color={props.color} onChange={onChange} />,
		<GrayOptions color={props.color} onChange={onChange} />,
	];

	if (method < 0 || method > 4) {
		setMethod(0);
	}

	const optionDiv = options[method];

	return (
		<div
			className="color-picker"
			style={{ zIndex: 100, backgroundColor: "white" }}
		>
			{/* top row */}
			<div
				style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}
			>
				<button
					className="icon-button icon-button-sm"
					onClick={() => setMethod(0)}
				>
					RGB
				</button>
				<button
					className="icon-button icon-button-sm"
					onClick={() => setMethod(1)}
				>
					HSV
				</button>
				<button
					className="icon-button icon-button-sm"
					onClick={() => setMethod(2)}
				>
					HSL
				</button>
				<button
					className="icon-button icon-button-sm"
					onClick={() => setMethod(3)}
				>
					Gray
				</button>
				<div style={{ flexGrow: 1 }} />
				#
				<input
					type="text"
					value={displayedHex}
					onChange={(e) => {
						const candidate = e.target.value;

						setDisplayedHex(candidate);

						// check if value is valid hex
						const candidateColor = Color.parseHex(candidate);
						if (candidateColor !== null) {
							props.onChange(candidateColor);
						}
					}}
					style={{
						width: "14ex",
						textAlign: "start",
						borderColor: invalidHex ? "red" : "revert",
						backgroundColor: invalidHex ? "rgba(255, 0, 0, .1)" : "revert",
					}}
				/>
				{/* color preview */}
				<div
					className="icon-button"
					style={{
						width: "30px",
						backgroundColor: Color.toStringRGBA(Color.toRGB(props.color)),
						marginLeft: "4px",
					}}
				/>
			</div>
			{/* color pickers */}
			{optionDiv}
		</div>
	);
}
