import { useEffect, DependencyList, useState } from "react";

export function useAsyncMemo<T>(
	effect: () => Promise<T>,
	deps: DependencyList,
): T | undefined {
	const [value, setValue] = useState<T>();

	useEffect(() => {
		(async () => {
			const newValue = await effect();
			setValue(newValue);
		})();
	}, [...deps, effect]);

	return value;
}
