/**
 * Paso posterior a `vite build` (y al build SSR en dist-ssr/):
 *  1. Prerenderiza cada ruta estática con React (contenido real en el HTML, visible sin JS)
 *     y escribe dist/<ruta>/index.html y dist/<ruta>.html con su propio <title>, descripción,
 *     canonical, hreflang, Open Graph y JSON-LD. Los enlaces directos y recargas responden 200.
 *  2. Crea dist/404.html (noindex) para rutas desconocidas.
 *  3. Genera dist/sitemap.xml y dist/robots.txt con la URL de src/config/site.ts.
 *  4. Precarga las fuentes principales y borra dist-ssr/.
 * Funciona igual en GitHub Pages y en Cloudflare Pages.
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = path.resolve(import.meta.dirname, "..");
const dist = path.join(root, "dist");
const ssrDir = path.join(root, "dist-ssr");
const ssrEntry = fs.readdirSync(ssrDir).find(f => /^entry-server\.m?js$/.test(f));
const { renderRoute, renderHeadTags, ROUTES, NOT_FOUND_META, SITE, absoluteUrl, pendingLegalPlaceholders } = await import(
  pathToFileURL(path.join(ssrDir, ssrEntry)).href
);

const template = fs.readFileSync(path.join(dist, "index.html"), "utf8");
if (!template.includes("<!--app-html-->")) throw new Error("index.html sin el marcador <!--app-html-->");

// Precarga de las fuentes «latin» (las que usa el español) para evitar el cambio de fuente.
const fontPreloads = fs
  .readdirSync(path.join(dist, "assets"))
  .filter(f => /^(lexend|dm-sans)-latin-wght-normal-.*\.woff2$/.test(f))
  .map(f => `<link rel="preload" href="/assets/${f}" as="font" type="font/woff2" crossorigin />`);
if (fontPreloads.length !== 2) throw new Error(`Se esperaban 2 fuentes para precargar, hay ${fontPreloads.length}`);

// Páginas en archivo JS aparte (src/pages/lazyRoutes.ts): al abrir su URL directamente,
// main.tsx las carga antes de hidratar. Precargarlas en el <head> evita esperar en cascada.
const manifestPath = path.join(dist, ".vite", "manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const ROUTE_SOURCES = {
  "/inicio": "src/pages/Inicio.tsx",
  "/logros": "src/pages/Logros.tsx",
  "/glosario": "src/pages/Glosario.tsx",
  "/tips": "src/pages/Tips.tsx",
  "/meta": "src/pages/Onboarding.tsx",
  "/analytics": "src/pages/Analytics.tsx",
  "/practica": "src/pages/Practica.tsx",
  "/simulacro": "src/pages/Simulacro.tsx",
  "/politica-de-privacidad": "src/pages/legal/PoliticaPrivacidad.tsx",
  "/tratamiento-de-datos": "src/pages/legal/TratamientoDatos.tsx",
  "/terminos": "src/pages/legal/Terminos.tsx",
  "/cookies": "src/pages/legal/Cookies.tsx",
  ...Object.fromEntries(["matematicas", "lectura", "ciencias", "sociales", "ingles"].map(m => [`/${m}`, "src/pages/ModulePage.tsx"])),
};
const entryKey = Object.keys(manifest).find(k => manifest[k].isEntry);
const alreadyLoaded = new Set([manifest[entryKey].file, ...(manifest[entryKey].imports ?? []).map(k => manifest[k].file)]);
function routePreloads(routePath) {
  const src = ROUTE_SOURCES[routePath];
  if (!src) return [];
  if (!manifest[src]) throw new Error(`postbuild: ${src} no está en el manifest de Vite`);
  const files = new Set();
  const visit = key => {
    const c = manifest[key];
    if (!c || files.has(c.file)) return;
    files.add(c.file);
    (c.imports ?? []).forEach(visit);
  };
  visit(src);
  return [...files].filter(f => !alreadyLoaded.has(f) && !template.includes(f)).map(f => `<link rel="modulepreload" crossorigin href="/${f}" />`);
}

async function page(route, renderPath = route.path) {
  const appHtml = await renderRoute(renderPath);
  if (!appHtml.includes("<h1")) throw new Error(`La ruta ${renderPath} no tiene <h1> en el HTML prerenderizado`);
  return template
    .replace(/<title>[^<]*<\/title>\s*<!--app-head[^>]*-->/, [renderHeadTags(route), ...fontPreloads, ...routePreloads(route.path)].join("\n    "))
    .replace("<!--app-html-->", appHtml);
}

let written = 0;
for (const r of ROUTES) {
  const html = await page(r);
  if (r.path === "/") {
    fs.writeFileSync(path.join(dist, "index.html"), html);
    continue;
  }
  const rel = r.path.replace(/^\//, "");
  fs.mkdirSync(path.join(dist, rel), { recursive: true });
  fs.writeFileSync(path.join(dist, rel, "index.html"), html);
  fs.writeFileSync(path.join(dist, `${rel}.html`), html);
  written++;
}

fs.writeFileSync(path.join(dist, "404.html"), await page(NOT_FOUND_META, "/__pagina-no-encontrada"));

const today = new Date().toISOString().slice(0, 10);
const urls = ROUTES.filter(r => !r.noindex)
  .map(r => `  <url>\n    <loc>${absoluteUrl(r.path)}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`)
  .join("\n");
fs.writeFileSync(
  path.join(dist, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
);
fs.writeFileSync(path.join(dist, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${SITE.url}/sitemap.xml\n`);

// GitHub Pages: no procesar con Jekyll
fs.writeFileSync(path.join(dist, ".nojekyll"), "");
fs.rmSync(ssrDir, { recursive: true, force: true });
fs.rmSync(path.join(dist, ".vite"), { recursive: true, force: true });

const pending = pendingLegalPlaceholders();
if (pending.length) {
  console.warn(
    `\n⚠️  Páginas legales con datos sin llenar en src/config/legal.ts (${pending.length}):\n   ${pending.join("\n   ")}\n`
  );
}

console.log(`postbuild: ${written + 1} rutas prerenderizadas, 404.html, sitemap.xml y robots.txt para ${SITE.url}`);
