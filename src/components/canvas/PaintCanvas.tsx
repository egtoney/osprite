import { useContext, useEffect, useRef, useState } from "react";
import { useEventListener } from "../../hooks/useEventListener";
import { Brush } from "../../interfaces/drawing/brush/Brush";
import { ClipboardInterface } from "../../interfaces/drawing/ClipboardInterface";
import { CoordinateInterface } from "../../interfaces/drawing/CoordinateInterface";
import { CursorInterface } from "../../interfaces/drawing/CursorInterface";
import { DisplayInterface } from "../../interfaces/drawing/DisplayInterface";
import { DrawingHistory } from "../../interfaces/drawing/DrawingHistory";
import { DrawingInterfaceContext } from "../../interfaces/drawing/react/DrawingInterfaceContext";
import { RenderInterface } from "../../interfaces/drawing/RenderInterface";
import { SelectionInterface } from "../../interfaces/drawing/SelectionInterface";
import { Polygon } from "../../interfaces/Polygon";
import { Vec2 } from "../../interfaces/Vec2";
import { BootstrapIconArrowsMove } from "../icons/BootstrapIconArrowsMove";
import { ToastContext } from "../util/toast/ToastContext";
import "./PaintCanvas.css";

export function PaintCanvas() {
	const wrapperRef = useRef<HTMLDivElement>(null);
	const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
	const interfaceCanvasRef = useRef<HTMLCanvasElement>(null);
	const [canvasWidth, setCanvasWidth] = useState(320);
	const [canvasHeight, setCanvasHeight] = useState(180);
	const [drawingInterface] = useContext(DrawingInterfaceContext);
	const addToast = useContext(ToastContext)[1];

	const [startTouches, setStartTouches] = useState<Vec2[]>([]);
	const [touches, setTouches] = useState<Vec2[]>([]);
	const [startZoom, setStartZoom] = useState(4);
	const [startTranslation, setStartTranslation] = useState<Vec2>({
		x: 0,
		y: 0,
	});
	const [startTouch, setStartTouch] = useState(0);
	const [startTouchCenter, setStartTouchCenter] = useState<Vec2>({
		x: 0,
		y: 0,
	});
	const [currTouch, setCurrTouch] = useState(0);
	const [currTouchCenter, setCurrTouchCenter] = useState<Vec2>({
		x: 0,
		y: 0,
	});
	const [isZooming, setIsZooming] = useState(false);

	/**
	 * Ensure drawing interface has access to toasts
	 */
	useEffect(() => {
		drawingInterface.addToast = addToast;
	}, [drawingInterface, addToast]);

	/**
	 * Resizes the game canvas to fill wrapper
	 */
	useEffect(() => {
		function handleResize() {
			if (
				wrapperRef.current &&
				drawingCanvasRef.current &&
				interfaceCanvasRef.current
			) {
				const wrapper = wrapperRef.current;
				const bounding = drawingCanvasRef.current.getBoundingClientRect();

				setCanvasWidth(wrapper.clientWidth);
				setCanvasHeight(wrapper.clientHeight);

				DisplayInterface.setDisplaySize(
					drawingInterface,
					bounding.left,
					bounding.top,
					wrapper.clientWidth,
					wrapper.clientHeight,
				);
			}
		}
		window.addEventListener("resize", handleResize);
		handleResize();
		return () => window.removeEventListener("resize", handleResize);
	}, [drawingInterface]);

	// #region Arrow Keys Support

	useEffect(() => {
		const listener = (e: KeyboardEvent) => {
			if (
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				["INPUT", "TEXTAREA"].includes((e.target as any).tagName) ||
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				(e.target as any).isContentEditable
			) {
				return; // Ignore undo/redo inside text inputs
			}

			let dx = 0;
			let dy = 0;

			switch (e.key) {
				case "ArrowRight":
					dx++;
					break;
				case "ArrowLeft":
					dx--;
					break;
				case "ArrowDown":
					dy++;
					break;
				case "ArrowUp":
					dy--;
					break;
			}

			if (dx !== 0 || dy !== 0) {
				if (drawingInterface.selection) {
					// if there's a selection move the selection
					SelectionInterface.moveSelection(drawingInterface, { x: dx, y: dy });
				} else {
					// otherwise move the display
					drawingInterface.display.dx -= dx * drawingInterface.display.zoom;
					drawingInterface.display.dy -= dy * drawingInterface.display.zoom;
				}
				RenderInterface.queueRender(drawingInterface);
			}
		};

		document.addEventListener("keydown", listener);

		return () => document.removeEventListener("keydown", listener);
	}, [drawingInterface]);

	// #endregion

	// #region Undo/Redo Shortcut Support

	useEffect(() => {
		const listener = (e: KeyboardEvent) => {
			if (
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				["INPUT", "TEXTAREA"].includes((e.target as any).tagName) ||
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				(e.target as any).isContentEditable
			) {
				return; // Ignore undo/redo inside text inputs
			}

			if ((e.ctrlKey || e.metaKey) && e.key === "z") {
				e.preventDefault();
				if (e.shiftKey) {
					DrawingHistory.redo(drawingInterface);
				} else {
					DrawingHistory.undo(drawingInterface);
				}
			}

			if ((e.ctrlKey || e.metaKey) && e.key === "y") {
				e.preventDefault();
				DrawingHistory.redo(drawingInterface);
			}
		};

		document.addEventListener("keydown", listener);

		return () => document.removeEventListener("keydown", listener);
	}, [drawingInterface]);

	// #endregion

	// #region Cut/Copy/Paste Shortcut Support

	useEffect(() => {
		const listener = async (e: ClipboardEvent) => {
			const decoded = await ClipboardInterface.handlePasteEvent(e);

			if (decoded) {
				ClipboardInterface.applyPaste(drawingInterface, decoded);
			}
		};
		document.addEventListener("paste", listener);

		return () => document.removeEventListener("paste", listener);
	}, [drawingInterface]);

	useEffect(() => {
		const listener = (e: ClipboardEvent) => {
			e.preventDefault();
			ClipboardInterface.copy(drawingInterface);
		};
		document.addEventListener("copy", listener);

		return () => document.removeEventListener("copy", listener);
	}, [drawingInterface, addToast]);

	useEffect(() => {
		const listener = (e: ClipboardEvent) => {
			e.preventDefault();
			ClipboardInterface.cut(drawingInterface);
		};
		document.addEventListener("cut", listener);

		return () => document.removeEventListener("cut", listener);
	});

	// #endregion

	/**
	 * Events
	 */
	useEventListener(
		wrapperRef,
		"touchmove",
		(e) => {
			e.preventDefault();

			if (isZooming === false && e.touches.length === 1) {
				CursorInterface.handleCursorMove(
					drawingInterface,
					e.touches[0].clientX,
					e.touches[0].clientY,
				);
			} else if (e.touches.length === 2) {
				const _touches: Vec2[] = [];
				for (let i = 0; i < e.touches.length; i++) {
					_touches.push({
						x: e.touches[i].clientX,
						y: e.touches[i].clientY,
					});
				}
				setTouches(_touches);

				const currTouch =
					((_touches[0].x - _touches[1].x) ** 2 +
						(_touches[0].y - _touches[1].y) ** 2) **
					0.5;

				setCurrTouch(currTouch);

				const touchCenter: Vec2 = {
					x: (_touches[0].x + _touches[1].x) / 2,
					y: (_touches[0].y + _touches[1].y) / 2,
				};

				setCurrTouchCenter(touchCenter);
			}
		},
		[drawingInterface, isZooming],
	);

	useEventListener(
		wrapperRef,
		"mousemove",
		(e) => {
			CursorInterface.handleCursorMove(drawingInterface, e.clientX, e.clientY);
		},
		[drawingInterface],
	);

	useEventListener(
		wrapperRef,
		"touchstart",
		(e) => {
			e.preventDefault();

			if (e.touches.length === 1) {
				// handle touch
				console.log("touchstart");
				CursorInterface.handleCursorStart(
					drawingInterface,
					e.touches[0].clientX,
					e.touches[0].clientY,
				);
			} else if (e.touches.length === 2) {
				// set start touches
				const _touches: Vec2[] = [];
				for (let i = 0; i < e.touches.length; i++) {
					_touches.push({
						x: e.touches[i].clientX,
						y: e.touches[i].clientY,
					});
				}
				setStartTouches(_touches);

				const startTouch =
					((_touches[0].x - _touches[1].x) ** 2 +
						(_touches[0].y - _touches[1].y) ** 2) **
					0.5;

				setStartTouch(startTouch);
				setCurrTouch(startTouch);

				const touchCenter: Vec2 = {
					x: (_touches[0].x + _touches[1].x) / 2,
					y: (_touches[0].y + _touches[1].y) / 2,
				};

				setStartTouchCenter(touchCenter);
				setCurrTouchCenter(touchCenter);

				setStartZoom(drawingInterface.display.zoom);
				setStartTranslation({
					x: drawingInterface.display.dx,
					y: drawingInterface.display.dy,
				});

				setIsZooming(true);
			}
		},
		[drawingInterface],
	);

	useEventListener(
		wrapperRef,
		"mousedown",
		(e) => {
			CursorInterface.handleCursorStart(
				drawingInterface,
				e.clientX,
				e.clientY,
				e.button,
			);
		},
		[drawingInterface],
	);

	useEventListener(
		wrapperRef,
		"touchend",
		(e) => {
			e.preventDefault();

			setStartTouches([]);
			setTouches([]);

			if (e.touches.length === 0) {
				setIsZooming(false);
			}

			if (isZooming === false) {
				CursorInterface.handleCursorEnd(drawingInterface);
			}
		},
		[drawingInterface, isZooming],
	);

	useEventListener(
		wrapperRef,
		"mouseup",
		() => {
			CursorInterface.handleCursorEnd(drawingInterface);
		},
		[drawingInterface],
	);

	useEventListener(
		wrapperRef,
		"wheel",
		(e) => {
			e.preventDefault();

			drawingInterface.wheel -= e.deltaY / 100;
			drawingInterface.wheel = Math.max(
				1,
				Math.min(drawingInterface.wheel, 64),
			);

			const delta =
				Math.round(drawingInterface.wheel) - drawingInterface.display.zoom;
			if (delta !== 0) {
				DisplayInterface.updateZoom(drawingInterface, delta);
			}
		},
		[drawingInterface],
	);

	useEventListener(
		wrapperRef,
		"mouseleave",
		() => {
			CursorInterface.handleCursorEnd(drawingInterface);
		},
		[drawingInterface],
	);

	useEventListener(
		wrapperRef,
		"contextmenu",
		(e) => {
			e.preventDefault();
		},
		[drawingInterface],
	);

	/**
	 * Touch zoom/pan
	 */
	useEffect(() => {
		// zoom reference point
		const ref: Vec2 = {
			x: currTouchCenter.x - drawingInterface.display.dx,
			y: currTouchCenter.y - drawingInterface.display.dy,
		};

		// try zoom
		const diffZoom = Math.round(Math.abs(currTouch - startTouch) / 75);
		if (diffZoom > 0) {
			const newZoom =
				currTouch < startTouch
					? Math.max(1, Math.min(startZoom - diffZoom, 64))
					: Math.max(1, Math.min(startZoom + diffZoom, 64));
			const delta = newZoom - drawingInterface.display.zoom;

			DisplayInterface.updateZoom(drawingInterface, delta, ref);
		}

		// try pan
		const diff: Vec2 = Vec2.diff(currTouchCenter, startTouchCenter);
		drawingInterface.display.dx = startTranslation.x + diff.x;
		drawingInterface.display.dy = startTranslation.y + diff.y;

		RenderInterface.queueRender(drawingInterface);
	}, [
		drawingInterface,
		startZoom,
		startTranslation,
		startTouch,
		startTouchCenter,
		currTouch,
		currTouchCenter,
	]);

	/**
	 * Render
	 */
	useEffect(() => {
		let handle: number | undefined;
		function render() {
			handle = requestAnimationFrame(render);

			RenderInterface.render(
				drawingInterface,
				drawingCanvasRef,
				interfaceCanvasRef,
			);
		}

		handle = requestAnimationFrame(render);

		return () => {
			if (handle) {
				cancelAnimationFrame(handle);
			}
		};
	}, [drawingInterface]);

	/**
	 * Always render first frame drawing interface changes
	 */
	useEffect(() => {
		if (drawingInterface) {
			RenderInterface.queueRender(drawingInterface);
		}
	}, [drawingInterface]);

	const hoveringSelection =
		drawingInterface.selection &&
		Polygon.contains(
			drawingInterface.selection.points,
			CoordinateInterface.imageCoords(drawingInterface),
		);
	const cursorIcon = hoveringSelection
		? BootstrapIconArrowsMove
		: Brush.iconFor(drawingInterface.brush.selected);

	return (
		<div ref={wrapperRef} className="wrapper-outer" style={{ zIndex: 50 }}>
			<canvas
				ref={drawingCanvasRef}
				width={canvasWidth}
				height={canvasHeight}
				style={{
					width: canvasWidth,
					height: canvasHeight,
				}}
			/>
			<canvas
				ref={interfaceCanvasRef}
				width={canvasWidth}
				height={canvasHeight}
				style={{
					width: canvasWidth,
					height: canvasHeight,
				}}
			/>
			<div
				className="flex-center"
				style={{
					position: "relative",
					left: drawingInterface.cursor.x + drawingInterface.display.dx,
					top: drawingInterface.cursor.y + drawingInterface.display.dy - 30,
					width: "30px",
					height: "30px",
					pointerEvents: "none",
				}}
			>
				{cursorIcon()}
			</div>
			{touches.map((t) => (
				<div
					style={{
						position: "fixed",
						left: t.x - 20,
						top: t.y - 20,
						width: "40px",
						height: "40px",
						borderRadius: "50%",
						border: `8px solid rgba(0, 0, 0, .2)`,
					}}
				/>
			))}
			{startTouches.map((t) => (
				<div
					style={{
						position: "fixed",
						left: t.x - 20,
						top: t.y - 20,
						width: "20px",
						height: "20px",
						borderRadius: "50%",
						border: "2px solid rgba(0, 0, 0, .2)",
					}}
				/>
			))}
		</div>
	);
}
