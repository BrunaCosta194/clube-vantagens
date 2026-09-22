import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App";
import { iniciarAtribuicao } from "./lib/atribuicao";

// Captura utm_*/ref/referrer da primeira página da sessão — 1x, antes de
// qualquer coisa renderizar. Ver src/lib/atribuicao.ts.
iniciarAtribuicao();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
