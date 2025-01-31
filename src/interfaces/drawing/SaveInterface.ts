import { DrawingInterface } from "./DrawingInterface";

export interface SaveInterface {
	name?: string;
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace SaveInterface {
	export function save(instance: DrawingInterface) {
		if (instance.saveHook) {
			instance.saveHook();
		}
	}
}
