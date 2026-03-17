import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import StandaloneApp from "./standalone/StandaloneApp";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <StandaloneApp />
  </StrictMode>
);
