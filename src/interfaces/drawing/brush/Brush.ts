import { BootstrapIconArrowsMove } from "../../../components/icons/BootstrapIconArrowsMove";
import { BootstrapIconEraser } from "../../../components/icons/BootstrapIconEraser";
import { BootstrapIconEyedropper } from "../../../components/icons/BootstrapIconEyedropper";
import { BootstrapIconPencil } from "../../../components/icons/BootstrapIconPencil";
import { BootstrapIconPlusSquareDotted } from "../../../components/icons/BootstrapIconPlusSquareDotted";
import { BootstrapIconSearch } from "../../../components/icons/BootstrapIconSearch";

/* eslint-disable @typescript-eslint/no-namespace */
export enum Brush {
	SELECT,
	PENCIL,
	ERASER,
	DROPPER,
	ZOOM,
	PAN,
}

export namespace Brush {
	export function iconFor(brush: Brush) {
		switch (brush) {
			case Brush.SELECT:
				return BootstrapIconPlusSquareDotted;
			case Brush.PENCIL:
				return BootstrapIconPencil;
			case Brush.ERASER:
				return BootstrapIconEraser;
			case Brush.DROPPER:
				return BootstrapIconEyedropper;
			case Brush.ZOOM:
				return BootstrapIconSearch;
			case Brush.PAN:
				return BootstrapIconArrowsMove;
		}
	}
}
