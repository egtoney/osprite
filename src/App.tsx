import "./App.css";
import { AppBody } from "./AppBody";
import { Navbar } from "./components/navbar/Navbar";
import { Tabs } from "./components/Tabs";
import { DrawingInterfaceListProvider } from "./interfaces/drawing/DrawingInterfaceListContext";

function App() {
	return (
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
				<AppBody/>
			</div>
		</DrawingInterfaceListProvider>
	);
}

export default App;
