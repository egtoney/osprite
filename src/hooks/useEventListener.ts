import { useEffect } from "react";

export function useEventListener<
	T extends HTMLElement,
	K extends keyof HTMLElementEventMap,
>(
	ref: React.RefObject<T>,
	type: K,
	listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown,
	deps: React.DependencyList,
	options?: boolean | AddEventListenerOptions,
): void {
	useEffect(() => {
		if (ref.current) {
			ref.current.addEventListener(type, listener, options);

			return () => {
				if (ref.current) {
					ref.current.removeEventListener(type, listener);
				}
			};
		}
	}, [ref, ...deps]);
}
