/**
 * Paso posterior a `vite build` para GitHub Pages:
 *  1. Copia dist/index.html a cada ruta estática (dist/<ruta>/index.html y dist/<ruta>.html)
 *     con su propio <title>, descripción, canonical y og:url. Así los enlaces directos y
 *     las recargas responden 200 en lugar de 404.
 *  2. Crea dist/404.html (misma app, con noindex) para rutas desconocidas.
 *  3. Genera dist/sitemap.xml.
 */
import fs from "node:fs";
import path from "node:path";
import { routes, SITE_URL } from "./routes.mjs";

const dist = path.resolve(import.meta.dirname, "../dist");
const template = fs.readFileSync(path.join(dist, "index.html"), "utf8");

const esc = s => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function render({ path: route, title, description }, { noindex = false } = {}) {
  const url = SITE_URL + (route === "/" ? "/" : route);
  let html = template
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/, `$1${esc(description)}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${esc(title)}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${esc(description)}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`)
    .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`);
  if (noindex) {
    html = html
      .replace(/\s*<link rel="canonical"[^>]*>/, "")
      .replace("</title>", '</title>\n    <meta name="robots" content="noindex" />');
  }
  return html;
}

let written = 0;
for (const r of routes) {
  const html = render(r);
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

fs.writeFileSync(
  path.join(dist, "404.html"),
  render({ path: "/404", title: "Página no encontrada · ProICFES", description: "La página que buscas no existe." }, { noindex: true })
);

const today = new Date().toISOString().slice(0, 10);
const urls = routes
  .filter(r => r.sitemap !== false)
  .map(r => `  <url>\n    <loc>${SITE_URL}${r.path === "/" ? "/" : r.path}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`)
  .join("\n");
fs.writeFileSync(
  path.join(dist, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
);

// GitHub Pages: no procesar con Jekyll
fs.writeFileSync(path.join(dist, ".nojekyll"), "");

console.log(`postbuild: ${written} rutas con index.html propio, 404.html y sitemap.xml generados.`);
