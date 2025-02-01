/* eslint-disable @typescript-eslint/no-namespace */

export interface Color {
	a: number;
}

export interface RGBColor extends Color {
	r: number;
	g: number;
	b: number;
}

export interface HSVColor extends Color {
	h: number;
	s: number;
	v: number;
}

export interface HSLColor extends Color {
	h: number;
	s: number;
	l: number;
}

export namespace Color {
	export const CLEAR: RGBColor = { r: 0, g: 0, b: 0, a: 0 };

	export const WHITE: RGBColor = { r: 255, g: 255, b: 255, a: 255 };
	export const BLACK: RGBColor = { r: 0, g: 0, b: 0, a: 255 };
	export const GREY: RGBColor = { r: 128, g: 128, b: 128, a: 255 };

	export const RED: RGBColor = { r: 255, g: 0, b: 0, a: 255 };
	export const YELLOW: RGBColor = { r: 255, g: 255, b: 0, a: 255 };
	export const GREEN: RGBColor = { r: 0, g: 255, b: 0, a: 255 };
	export const CYAN: RGBColor = { r: 0, g: 255, b: 255, a: 255 };
	export const BLUE: RGBColor = { r: 0, g: 0, b: 255, a: 255 };
	export const MAGENTA: RGBColor = { r: 255, g: 0, b: 255, a: 255 };

	export function clampComponent(component: number) {
		return Math.max(0, Math.min(component, 255));
	}

	export function equal(a: Color | null, b: Color | null) {
		// ensure not null
		if (a === null || b === null) {
			return false;
		}

		// convert to RGB
		const rgbA = toRGB(a);
		const rgbB = toRGB(b);

		// compare each component
		return (
			rgbA.r === rgbB.r &&
			rgbA.g === rgbB.g &&
			rgbA.b === rgbB.b &&
			rgbA.a === rgbB.a
		);
	}

	export function parseHex(hex: string): RGBColor | null {
		hex = hex.trim();

		const getComponent = (index: number) => {
			let componentWidth: number;
			switch (hex.length) {
				case 3:
				case 4:
					componentWidth = 1;
					break;
				case 6:
				case 8:
					componentWidth = 2;
					break;
				default:
					return null;
			}
			const startIndex = componentWidth * index;
			if (startIndex + componentWidth > hex.length) {
				return null;
			}

			const parsed = hex.substring(startIndex, startIndex + componentWidth);
			return Number.parseInt(
				parsed.length == 1 ? `${parsed}${parsed}` : parsed,
				16,
			);
		};

		if ([3, 4, 6, 8].includes(hex.length) && /[0-9a-f]+/gi.test(hex)) {
			const components = [
				getComponent(0),
				getComponent(1),
				getComponent(2),
				getComponent(3) ?? 255,
			];
			if (components.includes(null) || components.includes(Number.NaN)) {
				return null;
			}
			return {
				r: components[0]!,
				g: components[1]!,
				b: components[2]!,
				a: components[3]!,
			};
		}
		return null;
	}

	export function toStringRGBA(color: RGBColor): string {
		return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a / 255})`;
	}

	export function toStringHex(color: RGBColor): string {
		return `#${color.r.toString(16).padStart(2, "0")}${color.g.toString(16).padStart(2, "0")}${color.b.toString(16).padStart(2, "0")}${color.a.toString(16).padStart(2, "0")}`;
	}

	/**
	 * Blends the foreground color onto the background color using normal alpha compositing
	 */
	export function blendNormal(bg: RGBColor, fg: RGBColor): RGBColor {
		const fgA = fg.a / 255;
		const bgA = bg.a / 255;
		const alpha = fgA + bgA * (1 - fgA);
		if (alpha === 0) {
			return Color.CLEAR;
		}

		const red = (fg.r * fgA + bg.r * bgA * (1 - fgA)) / alpha;
		const green = (fg.g * fgA + bg.g * bgA * (1 - fgA)) / alpha;
		const blue = (fg.b * fgA + bg.b * bgA * (1 - fgA)) / alpha;

		return {
			r: Math.round(red),
			g: Math.round(green),
			b: Math.round(blue),
			a: Math.round(255 * alpha),
		};
	}

	/**
	 * Blends the foreground color onto the background color.
	 * - When fg alpha is 255 the foreground replaces the background
	 * - When fg alpha is 0 the foreground erases the background
	 * - Otherwise the foreground is blended with the background using alpha compositing
	 */
	export function blendPencil(bg: RGBColor, fg: RGBColor): RGBColor {
		if (fg.a === 255) {
			return fg;
		}

		if (fg.a === 0) {
			return Color.CLEAR;
		}

		return blendNormal(bg, fg);
	}

	/** */
	export function blend(foreground: RGBColor, background: RGBColor): RGBColor {
		const alpha = foreground.a / 255;
		return {
			r: alpha * foreground.r + (1 - alpha) * background.r,
			g: alpha * foreground.g + (1 - alpha) * background.g,
			b: alpha * foreground.b + (1 - alpha) * background.b,
			a: 255,
		};
	}

	export function luminance(color: RGBColor) {
		const normalize = (component: number) => {
			component /= 255; // Scale to [0, 1]
			return component <= 0.03928
				? component / 12.92
				: Math.pow((component + 0.055) / 1.055, 2.4);
		};

		const rL = normalize(color.r);
		const gL = normalize(color.g);
		const bL = normalize(color.b);

		return 0.2126 * rL + 0.7152 * gL + 0.0722 * bL;
	}

	export function getBestTextColor(backgroundColor: RGBColor): RGBColor {
		// Calculate luminance of background
		const bgLuminance = luminance(backgroundColor);

		// Calculate contrast ratio for white and black
		const whiteContrast = (1.0 + 0.05) / (bgLuminance + 0.05);
		const blackContrast = (bgLuminance + 0.05) / (0.0 + 0.05);

		// Return the color with the higher contrast ratio
		return whiteContrast > blackContrast ? Color.WHITE : Color.BLACK;
	}

	export function assertRGB(color: Color): asserts color is RGBColor {
		if ("r" in color && "g" in color && "b" in color && "a" in color) {
			return;
		}
		throw new Error(`color is not RGB`);
	}

	export function assertHSV(color: Color): asserts color is HSVColor {
		if ("h" in color && "s" in color && "v" in color && "a" in color) {
			return;
		}
		throw new Error(`color is not HSV`);
	}

	export function assertHSL(color: Color): asserts color is HSLColor {
		if ("h" in color && "s" in color && "l" in color && "a" in color) {
			return;
		}
		throw new Error(`color is not HSL`);
	}

	export function rgbToHSV(color: RGBColor): HSVColor {
		const r = color.r / 255;
		const g = color.g / 255;
		const b = color.b / 255;

		const max = Math.max(r, g, b);
		const min = Math.min(r, g, b);
		const delta = max - min;

		let h = 0;
		if (delta !== 0) {
			if (max === r) {
				h = ((g - b) / delta) % 6;
			} else if (max === g) {
				h = (b - r) / delta + 2;
			} else if (max === b) {
				h = (r - g) / delta + 4;
			}
			h *= 60;
			if (h < 0) h += 360;
		}

		const s = max === 0 ? 0 : (delta / max) * 100;
		const v = max * 100;

		return { h, s, v, a: color.a };
	}

	/** @FIXME */
	export function hsvToRGB(color: HSVColor): RGBColor {
		const s = color.s / 100;
		const v = color.v / 100;
		const h = color.h;

		const c = v * s;
		const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
		const m = v - c;

		let r = 0,
			g = 0,
			b = 0;
		if (h >= 0 && h < 60) {
			r = c;
			g = x;
			b = 0;
		} else if (h >= 60 && h < 120) {
			r = x;
			g = c;
			b = 0;
		} else if (h >= 120 && h < 180) {
			r = 0;
			g = c;
			b = x;
		} else if (h >= 180 && h < 240) {
			r = 0;
			g = x;
			b = c;
		} else if (h >= 240 && h < 300) {
			r = x;
			g = 0;
			b = c;
		} else if (h >= 300 && h <= 360) {
			r = c;
			g = 0;
			b = x;
		}

		r = Math.max(0, Math.min(255, Math.round((r + m) * 255)));
		g = Math.max(0, Math.min(255, Math.round((g + m) * 255)));
		b = Math.max(0, Math.min(255, Math.round((b + m) * 255)));

		return { r, g, b, a: color.a };
	}

	export function rgbToHSL(color: RGBColor): HSLColor {
		const r = color.r / 255;
		const g = color.g / 255;
		const b = color.b / 255;

		const max = Math.max(r, g, b);
		const min = Math.min(r, g, b);
		const delta = max - min;

		// Calculate Lightness
		const l = (max + min) / 2;

		let h = 0,
			s = 0;

		// Calculate Saturation
		if (delta !== 0) {
			s = l <= 0.5 ? delta / (max + min) : delta / (2 - max - min);

			// Calculate Hue
			if (max === r) {
				h = ((g - b) / delta) % 6;
			} else if (max === g) {
				h = (b - r) / delta + 2;
			} else if (max === b) {
				h = (r - g) / delta + 4;
			}
			h *= 60;
			if (h < 0) h += 360;
		}

		return { h, s: s * 100, l: l * 100, a: color.a };
	}

	export function hslToRGB(color: HSLColor): RGBColor {
		const s = color.s / 100;
		const l = color.l / 100;
		const h = color.h;

		const c = (1 - Math.abs(2 * l - 1)) * s;
		const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
		const m = l - c / 2;

		let r = 0,
			g = 0,
			b = 0;

		if (h >= 0 && h < 60) {
			r = c;
			g = x;
			b = 0;
		} else if (h >= 60 && h < 120) {
			r = x;
			g = c;
			b = 0;
		} else if (h >= 120 && h < 180) {
			r = 0;
			g = c;
			b = x;
		} else if (h >= 180 && h < 240) {
			r = 0;
			g = x;
			b = c;
		} else if (h >= 240 && h < 300) {
			r = x;
			g = 0;
			b = c;
		} else if (h >= 300 && h <= 360) {
			r = c;
			g = 0;
			b = x;
		}

		r = Math.round((r + m) * 255);
		g = Math.round((g + m) * 255);
		b = Math.round((b + m) * 255);

		return { r, g, b, a: color.a };
	}

	export function toRGB<T extends Color>(color: T): RGBColor {
		try {
			assertRGB(color);
			return color;
		} catch {
			/* empty */
		}
		try {
			assertHSV(color);
			return hsvToRGB(color);
		} catch {
			/* empty */
		}
		try {
			assertHSL(color);
			return hslToRGB(color);
		} catch {
			/* empty */
		}
		console.error(color);
		throw new Error(`can not convert to RGB`);
	}

	export function toHSV<T extends Color>(color: T): HSVColor {
		try {
			assertRGB(color);
			return rgbToHSV(color);
		} catch {
			/* empty */
		}
		try {
			assertHSV(color);
			return color;
		} catch {
			/* empty */
		}
		try {
			assertHSL(color);
			return rgbToHSV(hslToRGB(color));
		} catch {
			/* empty */
		}
		throw new Error();
	}

	export function toHSL<T extends Color>(color: T): HSLColor {
		try {
			assertRGB(color);
			return rgbToHSL(color);
		} catch {
			/* empty */
		}
		try {
			assertHSV(color);
			return rgbToHSL(hsvToRGB(color));
		} catch {
			/* empty */
		}
		try {
			assertHSL(color);
			return color;
		} catch {
			/* empty */
		}
		throw new Error();
	}
}
