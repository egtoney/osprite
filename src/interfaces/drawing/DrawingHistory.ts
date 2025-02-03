import { ToastLevel } from "../../components/util/toast/Toast";
import { assert } from "../../lib/lang";
import { Polygon } from "../Polygon";
import { Vec2 } from "../Vec2";
import { BlendMode } from "./color/BlendMode";
import { Color, RGBColor } from "./color/Color";
import { ColorInterface } from "./color/ColorInterface";
import { DrawingInterface } from "./DrawingInterface";
import { ImageInterfaceSlice } from "./ImageInterface";
import { RenderInterface } from "./RenderInterface";
import { SaveInterface } from "./SaveInterface";
import { SelectionInterface } from "./SelectionInterface";

export interface ColorChange extends Vec2 {
	color: RGBColor;
	oldColor: RGBColor;
}

export interface SelectionChange {
	points?: Polygon;
	oldPoints?: Polygon;
	data?: ImageInterfaceSlice;
}

export interface SelectionTransformChange {
	points: Polygon;
	oldPoints: Polygon;
}

export enum ChangeType {
	PIXEL,
	SELECTION,
	SELECTION_TRANSFORM,
}

export interface ChangeSet {
	complete: boolean;
	type?: ChangeType;
	changes?: ColorChange[];
	selection?: SelectionChange;
	selectionTransform?: SelectionTransformChange;
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace DrawingHistory {
	export function startChangeSet(instance: DrawingInterface) {
		console.log("starting change set", instance.history.length);

		// check if previous snippet is complete
		if (
			instance.history.length > 0 &&
			instance.history[instance.history.length - 1].complete === false
		) {
			// // undo last snippet
			// DrawingHistory.undo(instance);
			throw new Error();
		}

		// start a new snippet
		instance.history.push({
			complete: false,
		});

		// clear undo snippets
		instance.undoHistory = [];
	}

	export function endChangeSet(instance: DrawingInterface) {
		// end the undo history record since it is complete
		if (instance.history.length > 0) {
			const history = instance.history[instance.history.length - 1];

			// flag as complete
			history.complete = true;

			// custom logic per type
			let shouldRemove = false;
			switch (history.type) {
				case ChangeType.PIXEL:
					// remove when there were no pixel changes
					shouldRemove =
						history.changes === undefined || history.changes.length === 0;
					break;
				case ChangeType.SELECTION:
					// remove if there wasn't a selection (somehow?)
					shouldRemove = history.selection === undefined;
					break;
				case ChangeType.SELECTION_TRANSFORM:
					// remove if there wasn't a transform (somehow?)
					shouldRemove = history.selectionTransform === undefined;
					break;
				default:
					shouldRemove = true;
					break;
			}

			console.log(
				"ending change set",
				instance.history.length,
				shouldRemove,
				history,
			);

			// remove if flagged as a no-op
			if (shouldRemove) {
				console.log("removing last change set", history);
				instance.history.splice(instance.history.length - 1, 1);
			}
		}
	}

	export function pushSelectionTransformation(
		instance: DrawingInterface,
		points: Polygon,
		oldPoints: Polygon,
	) {
		// do nothing if no history event to record into
		if (instance.history.length === 0) {
			return;
		}
		let history = instance.history[instance.history.length - 1]!;

		// ensure changeset type stability
		assert(
			history.type === undefined ||
				history.type === ChangeType.SELECTION_TRANSFORM,
			`can not push a selection transformation into this changeset (type: ${history.type}) expected ${ChangeType.SELECTION_TRANSFORM}`,
		);
		history.type = ChangeType.SELECTION_TRANSFORM;

		// apply to last history event if it was also SELECTION_TRANSFORM
		if (
			instance.history.length > 1 &&
			instance.history[instance.history.length - 2].type ===
				ChangeType.SELECTION_TRANSFORM
		) {
			instance.history.splice(instance.history.length - 1, 1);
			history = instance.history[instance.history.length - 1];

			assert(history.selectionTransform);

			history.selectionTransform.points = points;
		} else {
			history.selectionTransform = { points, oldPoints };
		}
	}

	export function pushSelection(
		instance: DrawingInterface,
		points?: Polygon,
		oldPoints?: Polygon,
		data?: ImageInterfaceSlice,
	) {
		// do nothing if no history event to record into
		if (instance.history.length === 0) {
			return;
		}
		const history = instance.history[instance.history.length - 1]!;

		// history can change from PIXEL to SELECTION since selections can change pixels
		if (history.type === ChangeType.PIXEL) {
			history.type = ChangeType.SELECTION;
		}

		// ensure changeset type stability
		assert(
			history.type === undefined || history.type === ChangeType.SELECTION,
			`can not push a selection into this changeset (type: ${history.type}) expected ${ChangeType.SELECTION}`,
		);
		history.type = ChangeType.SELECTION;

		// ensure that we are not overwriting a previous select
		assert(
			history.selection === undefined,
			"can not overwrite previous selection",
		);

		// actually record the change
		history.selection = { points, oldPoints, data };
	}

	export function pushChange(
		instance: DrawingInterface,
		layerIndex: number,
		x: number,
		y: number,
		newColor: RGBColor,
		oldColor: RGBColor,
		includeNoOp: boolean = false,
	) {
		// do nothing if no history event to record into
		if (instance.history.length === 0) {
			return;
		}
		const history = instance.history[instance.history.length - 1]!;

		// ensure changeset type stability
		assert(
			history.type === undefined || history.type === ChangeType.PIXEL,
			`can not push a change into this changeset (type: ${history.type}) expected ${ChangeType.PIXEL}`,
		);
		history.type = ChangeType.PIXEL;

		// do nothing if colors are equal
		if (Color.equal(newColor, oldColor) && !includeNoOp) {
			return;
		}

		// actually record the change
		history.changes ??= [];
		history.changes.push({
			x,
			y,
			color: newColor,
			oldColor: oldColor,
		});
	}

	export function canUndo(instance: DrawingInterface) {
		return instance.history.length > 0;
	}

	export function undo(instance: DrawingInterface) {
		// do nothing if no history to undo
		if (instance.history.length === 0) {
			return;
		}

		// pop last element
		const [history] = instance.history.splice(instance.history.length - 1, 1);

		console.log(instance.history);
		console.log("undo", history.type, history);
		let userMessage;

		// undo selection transformations
		if (history.selectionTransform) {
			assert(history.type === ChangeType.SELECTION_TRANSFORM);
			userMessage = "Undid Selection Transform";
			console.log(userMessage);

			// assert that there is a selection to modify
			assert(instance.selection);

			// reset translation to previous value
			SelectionInterface.updateSelection(
				instance,
				history.selectionTransform.oldPoints,
			);
		}

		// undo selection
		if (history.selection) {
			assert(history.type === ChangeType.SELECTION);
			userMessage = "Undid Selection";
			console.log(userMessage);

			// apply last selection if one was set
			if (history.selection.oldPoints) {
				SelectionInterface.startSelection(
					instance,
					history.selection.oldPoints,
				);
			} else {
				SelectionInterface.clearSelection(instance);
			}
		}

		// undo pixel changes
		if (history.changes) {
			assert(
				history.type === ChangeType.PIXEL ||
					history.type === ChangeType.SELECTION,
			);

			// don't apply pixels when undoing a SELECT
			userMessage = "Undid Brush Changes";
			console.log(userMessage);
			for (const change of history.changes) {
				ColorInterface.setColor(
					instance,
					change.x,
					change.y,
					change.oldColor,
					false,
					BlendMode.REPLACE,
				);
			}
		}

		// push onto the undo history buffer
		instance.undoHistory.push(history);
		SaveInterface.save(instance);
		RenderInterface.queueRender(instance);

		// alert the user
		if (instance.addToast && userMessage) {
			instance.addToast({
				level: ToastLevel.INFO,
				text: userMessage,
			});
		}
	}

	export function canRedo(instance: DrawingInterface) {
		return instance.undoHistory.length > 0;
	}

	export function redo(instance: DrawingInterface) {
		// do nothing if no undo history to redo
		if (instance.undoHistory.length === 0) {
			return;
		}

		// pop last element
		const [history] = instance.undoHistory.splice(
			instance.undoHistory.length - 1,
			1,
		);

		console.log(instance.undoHistory);
		console.log("redo", history.type, history);
		let userMessage;

		// undo pixel changes
		if (history.changes) {
			assert(
				history.type === ChangeType.PIXEL ||
					history.type === ChangeType.SELECTION,
			);

			// don't change pixels with selection
			if (history.type === ChangeType.PIXEL) {
				userMessage = "Redid Brush Changes";
				console.log(userMessage);
				for (const change of history.changes) {
					ColorInterface.setColor(
						instance,
						change.x,
						change.y,
						change.color,
						false,
						BlendMode.REPLACE,
					);
				}
			}
		}

		// redo selection
		if (history.selection) {
			assert(history.type === ChangeType.SELECTION);

			if (history.selection.points) {
				// apply last selection if one was set

				// apply selection data if present
				if (history.selection.data) {
					userMessage = "Redid Paste";

					SelectionInterface.clearSelection(instance);

					// create the new selection
					instance.selection = {
						moving: false,
						cursorOffset: { x: 0, y: 0 },
						translation: { x: 0, y: 0 },
						data: history.selection.data,
						points: history.selection.points,
					};
				} else {
					userMessage = "Redid Selection";
					SelectionInterface.startSelection(instance, history.selection.points);
				}
			} else {
				userMessage = "Redid Selection Clear";
				SelectionInterface.clearSelection(instance, false);
			}
			console.log(userMessage);
		}

		// redo selection transformations
		if (history.selectionTransform) {
			assert(history.type === ChangeType.SELECTION_TRANSFORM);
			userMessage = "Redid Selection Transform";
			console.log(userMessage);

			// assert that there is a selection to modify
			assert(instance.selection);

			// reset translation to previous value
			SelectionInterface.updateSelection(
				instance,
				history.selectionTransform.points,
			);
		}

		// push onto the undo buffer
		instance.history.push(history);
		SaveInterface.save(instance);
		RenderInterface.queueRender(instance);

		// alert user
		if (instance.addToast && userMessage) {
			instance.addToast({
				level: ToastLevel.INFO,
				text: userMessage,
			});
		}
	}
}
