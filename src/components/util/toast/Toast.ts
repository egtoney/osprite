export const REMOVE_TOAST_AFTER = 3 * 1000;

export enum ToastLevel {
	SUCCESS,
	INFO,
	WARNING,
	ERROR,
}

export interface Toast {
	id: string;
	level: ToastLevel;
	text: string;
	time: number;
}
