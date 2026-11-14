import ReactDOM from "react-dom/client";
import "@excalidraw/excalidraw/index.css";
import "./styles/globals.css";
import App from "./App";
import { ErrorBoundary } from "@/components/feedback/ErrorBoundary";

// Assets locais do Excalidraw (fontes) para funcionamento 100% offline.
declare global {
  interface Window {
    EXCALIDRAW_ASSET_PATH?: string;
  }
}
window.EXCALIDRAW_ASSET_PATH = "excalidraw-assets/";

const container = document.getElementById("root");
if (!container) throw new Error("Elemento raiz não encontrado");

ReactDOM.createRoot(container).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
);
