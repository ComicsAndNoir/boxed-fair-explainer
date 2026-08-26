import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/global.css";
import App from "./App.tsx";
import { JargonToggleProvider } from "./components/layout/JargonToggleProvider.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <JargonToggleProvider>
      <App />
    </JargonToggleProvider>
  </StrictMode>,
);
