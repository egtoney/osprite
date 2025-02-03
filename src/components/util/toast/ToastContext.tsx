import { PropsWithChildren, createContext, useEffect, useState } from "react";
import { v4 } from "uuid";
import { REMOVE_TOAST_AFTER, Toast, ToastLevel } from "./Toast";

export interface ToastInfo {
	level: ToastLevel;
	text: string;
}

export const ToastContext = createContext<
	[Toast[], (toast: ToastInfo) => void, (toast: Toast) => void]
>([[], () => {}, () => {}]);

export const ToastProvider = (props: PropsWithChildren<unknown>) => {
	const [toasts, setToasts] = useState<Toast[]>([]);

	const addToast = (info: ToastInfo) => {
		const toast: Toast = {
			...info,
			id: v4(),
			time: Date.now(),
		};
		setToasts([...toasts, toast]);
	};

	const removeToast = (toast: Toast) => {
		setToasts(toasts.filter((t) => t.id === toast.id));
	};

	// remove old toasts
	useEffect(() => {
		const listener = setInterval(() => {
			const olderThan = Date.now() - REMOVE_TOAST_AFTER;
			if (toasts.length > 0) {
				setToasts(toasts.filter((t) => t.time > olderThan));
			}
		}, 16);

		return () => clearInterval(listener);
	}, [toasts]);

	return (
		<ToastContext.Provider value={[toasts, addToast, removeToast]}>
			{props.children}
		</ToastContext.Provider>
	);
};
