import {
	PropsWithChildren,
	createContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { Loading } from "../../../components/Loading";
import { DisplayInterface } from "../DisplayInterface";
import { DrawingInterface } from "../DrawingInterface";
import { DrawingInterfaceProvider } from "./DrawingInterfaceContext";
import { FileInterface } from "../FileInterface";

export const DrawingInterfaceListContext = createContext<
	[DrawingInterface[], (index: DrawingInterface[]) => void]
>([[], () => {}]);

let lastLength = -1;

export const DrawingInterfaceListProvider = (
	props: PropsWithChildren<unknown>,
) => {
	const [interfaces, setInterfaces] = useState<DrawingInterface[] | null>(null);

	// load initial context
	useEffect(() => {
		(async () => {
			const drawingContexts = await FileInterface.getContext();

			// pass render hook so the drawing interface can trigger a render update
			setInterfaces([...drawingContexts]);
		})();
	}, []);

	// setup react hook
	useEffect(() => {
		if (interfaces) {
			// update interfaces with new react hooks
			for (const c of interfaces) {
				DisplayInterface.setReactRenderHook(
					c,
					() => FileInterface.saveContext(interfaces),
					() => setInterfaces([...interfaces]),
				);
			}
			// save open interfaces only when interfaces length changes
			if (lastLength !== interfaces.length) {
				FileInterface.saveContext(interfaces);
			}
			lastLength = interfaces.length;
		}
	}, [interfaces]);

	const context = useMemo<
		[DrawingInterface[], (index: DrawingInterface[]) => void]
	>(() => [interfaces ?? [], setInterfaces], [interfaces]);

	return (
		<DrawingInterfaceListContext.Provider value={context}>
			<Loading loaded={interfaces !== null}>
				<DrawingInterfaceProvider>{props.children}</DrawingInterfaceProvider>
			</Loading>
		</DrawingInterfaceListContext.Provider>
	);
};
