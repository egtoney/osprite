import {
	PropsWithChildren,
	createContext,
	useContext,
	useMemo,
	useState,
} from "react";
import { DrawingInterface } from "./DrawingInterface";
import { DrawingInterfaceListContext } from "./DrawingInterfaceListContext";

export const DEFAULT_CONTEXT: DrawingInterface = new DrawingInterface(
	32,
	32,
	1,
);

export const DrawingInterfaceContext = createContext<
	[DrawingInterface, (index: number) => void]
>([DEFAULT_CONTEXT, () => {}]);

export const DrawingInterfaceProvider = (props: PropsWithChildren<unknown>) => {
	const [interfaces] = useContext(DrawingInterfaceListContext);
	const [index, setIndex] = useState(0);

	const actualValue = useMemo(() => {
		if ((interfaces?.length ?? 0) === 0) {
			return DEFAULT_CONTEXT;
		}
		const actualIndex = Math.max(0, Math.min(index, interfaces.length - 1));
		return interfaces[actualIndex];
	}, [interfaces, index]);

	return (
		<DrawingInterfaceContext.Provider value={[actualValue, setIndex]}>
			{props.children}
		</DrawingInterfaceContext.Provider>
	);
};
