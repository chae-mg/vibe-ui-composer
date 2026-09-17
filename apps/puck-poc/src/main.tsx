import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Puck } from "./puck";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Puck />
  </StrictMode>,
);
