import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// Inter, self-hosted (the weight axis, bundled by Vite — no CDN, works offline). Used for the
// wordmark and headings so Studio's chrome matches the docs site; body stays on the system stack.
import "@fontsource-variable/inter/wght.css";
import { App } from "./App.tsx";
import "./styles.css";

const root = document.getElementById("root");
if (!root) throw new Error("missing #root");
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
