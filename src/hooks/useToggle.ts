import { useState } from "react";

export function useToggle(
	initialState: boolean = false,
): [boolean, () => void] {
	const [toggle, setToggle] = useState(initialState);
	return [toggle, () => setToggle(!toggle)];
}
