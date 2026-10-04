/**
 * Punto de entrada para el prerender (solo en build, se ejecuta en Node).
 * `vite build --ssr` lo compila a dist-ssr/ y scripts/postbuild.mjs lo usa para escribir
 * el HTML estático de cada ruta con su contenido real, sus metadatos y su JSON-LD.
 */
import { prerenderToNodeStream } from "react-dom/static";
import { Router } from "wouter";
import App from "./App";

export { SITE, absoluteUrl } from "./config/site";
export { ROUTES, NOT_FOUND_META } from "./seo/routes";
export { renderHeadTags } from "./seo/head";

/** HTML de la app para una ruta (mismo árbol que hidrata main.tsx, sin animaciones de entrada). */
export async function renderRoute(path: string): Promise<string> {
  const { prelude } = await prerenderToNodeStream(
    <Router ssrPath={path} ssrSearch="">
      <App hydrating />
    </Router>
  );
  const chunks: Buffer[] = [];
  for await (const chunk of prelude) chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  return Buffer.concat(chunks).toString("utf8");
}
