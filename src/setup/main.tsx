import ReactDOM from "react-dom/client";
import "@/styles/globals.css";
import { SetupApp } from "@/setup/SetupApp";
import { tauriSetupApi } from "@/setup/api";

const container = document.getElementById("setup-root");
if (!container) throw new Error("Elemento raiz do instalador não encontrado");

ReactDOM.createRoot(container).render(<SetupApp api={tauriSetupApi} />);
