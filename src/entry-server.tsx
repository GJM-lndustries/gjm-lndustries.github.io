/**
 * Punto de entrada para el prerender (solo en build, se ejecuta en Node).
 * `vite build --ssr` lo compila a dist-ssr/ y scripts/postbuild.mjs lo usa para escribir
 * el HTML estático de cada ruta con su contenido real, sus metadatos y su JSON-LD.
 */
import { prerenderToNodeStream } from "react-dom/static";
import { Router } from "wouter";
import App from "./App";
import { preloadAllLazyRoutes } from "./pages/legal";
import { findRoute } from "./seo/routes";

export { SITE, absoluteUrl } from "./config/site";
export { ROUTES, NOT_FOUND_META } from "./seo/routes";
export { renderHeadTags } from "./seo/head";
export { pendingLegalPlaceholders } from "./config/legal";

async function renderOnce(path: string): Promise<string> {
  const { prelude } = await prerenderToNodeStream(
    <Router ssrPath={path} ssrSearch="">
      <App hydrating />
    </Router>
  );
  const chunks: Buffer[] = [];
  for await (const chunk of prelude) chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  return Buffer.concat(chunks).toString("utf8");
}

/** Marca de React para un <Suspense> que no estaba listo (contenido oculto hasta ejecutar JS). */
const PENDING_BOUNDARY = "<!--$?-->";

/**
 * HTML de la app para una ruta (mismo árbol que hidrata main.tsx, sin animaciones de entrada).
 * Las páginas en archivo aparte se cargan antes, para que el HTML traiga su contenido completo.
 */
export async function renderRoute(path: string): Promise<string> {
  await preloadAllLazyRoutes();
  const html = await renderOnce(path);
  if (!findRoute(path)?.noindex && html.includes(PENDING_BOUNDARY))
    throw new Error(`Prerender incompleto en ${path}: hay un <Suspense> sin resolver (sin JS no se vería)`);
  return html;
}
