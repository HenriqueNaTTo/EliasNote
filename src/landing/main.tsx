import ReactDOM from "react-dom/client";
import "@/styles/globals.css";
import "@/styles/landing.css";
import { LandingApp } from "@/landing/LandingApp";
import { LocaleProvider } from "@/landing/i18n/LocaleContext";

const container = document.getElementById("landing-root");
if (!container) throw new Error("Elemento raiz da landing não encontrado");

ReactDOM.createRoot(container).render(
  <LocaleProvider>
    <LandingApp />
  </LocaleProvider>,
);
