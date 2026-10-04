import { createRoot, hydrateRoot } from "react-dom/client";
import { Router } from "wouter";
import App from "./App";
import { preloadRoute } from "./pages/legal";
import "./index.css";

const container = document.getElementById("root")!;

// /ruta/ → /ruta antes de arrancar, para que coincida con el HTML prerenderizado.
if (location.pathname.length > 1 && location.pathname.endsWith("/")) {
  history.replaceState(history.state, "", location.pathname.replace(/\/+$/, "") + location.search + location.hash);
}

// El HTML de cada ruta viene prerenderizado (scripts/postbuild.mjs). Si la URL no trae
// parámetros (?area=…), se hidrata ese HTML; si no, se renderiza desde cero.
const hydrate = () =>
  // Mismo árbol que src/entry-server.tsx (<Router> + <App hydrating />).
  hydrateRoot(
    container,
    <Router>
      <App hydrating />
    </Router>
  );

if (container.firstElementChild && location.search === "") {
  // Si la ruta es una página en archivo aparte (legales), se carga antes de hidratar.
  // Cede un cuadro para que el navegador pinte primero el HTML estático (mejor LCP en celulares).
  const start = () => {
    if (document.visibilityState === "visible") requestAnimationFrame(() => setTimeout(hydrate, 0));
    else hydrate();
  };
  preloadRoute(location.pathname).then(start, start);
} else {
  container.textContent = "";
  createRoot(container).render(
    <Router>
      <App />
    </Router>
  );
}
