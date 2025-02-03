import { useContext } from "react";
import { ToastDisplay } from "./ToastDisplay";
import { ToastContext } from "./ToastContext";

export function ToastList() {
	const [toasts] = useContext(ToastContext);

	return (
		<div
			style={{
				position: "absolute",
				right: 0,
				bottom: 0,
				zIndex: 10000,
			}}
		>
			{toasts.map((t) => (
				<ToastDisplay key={t.id} toast={t} />
			))}
		</div>
	);
}
