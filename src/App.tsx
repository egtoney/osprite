import "./App.css";
import { AppBody } from "./AppBody";
import { Navbar } from "./components/navbar/Navbar";
import { Tabs } from "./components/Tabs";
import { ToastProvider } from "./components/util/toast/ToastContext";
import { DrawingInterfaceListProvider } from "./interfaces/drawing/react/DrawingInterfaceListContext";

function App() {
	return (
		<ToastProvider>
			<DrawingInterfaceListProvider>
				<div
					style={{
						display: "flex",
						width: "100vw",
						height: "100%",
						flexDirection: "column",
					}}
				>
					<Navbar />
					<Tabs />
					<AppBody />
				</div>
			</DrawingInterfaceListProvider>
		</ToastProvider>
	);
}

export default App;
