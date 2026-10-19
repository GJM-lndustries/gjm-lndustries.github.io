// Servidor estático que imita GitHub Pages: archivo exacto → ruta.html → ruta/index.html (301 con /) → 404.html (404)
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
const root = path.resolve(process.argv[2] || "dist");
const port = Number(process.argv[3] || 4173);
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".xml": "application/xml", ".txt": "text/plain", ".woff2": "font/woff2" };
// Comprime texto con gzip, como hacen GitHub Pages y Cloudflare Pages.
let currentReq = null;
const send = (res, code, file) => {
  const type = types[path.extname(file)] || "application/octet-stream";
  const gz = /text|javascript|json|xml|svg/.test(type) && /gzip/.test(currentReq?.headers["accept-encoding"] || "");
  res.writeHead(code, { "content-type": type, ...(gz ? { "content-encoding": "gzip", vary: "Accept-Encoding" } : {}), "cache-control": file.includes("/assets/") ? "public, max-age=31536000, immutable" : "public, max-age=600" });
  const stream = fs.createReadStream(file);
  (gz ? stream.pipe(zlib.createGzip()) : stream).pipe(res);
};
const isFile = p => fs.existsSync(p) && fs.statSync(p).isFile();
http.createServer((req, res) => {
  currentReq = req;
  const url = new URL(req.url, "http://x");
  const p = decodeURIComponent(url.pathname);
  const fsPath = path.join(root, p);
  if (!fsPath.startsWith(root)) { res.writeHead(400); return res.end(); }
  if (isFile(fsPath)) return send(res, 200, fsPath);
  if (p.endsWith("/") && isFile(path.join(fsPath, "index.html"))) return send(res, 200, path.join(fsPath, "index.html"));
  if (isFile(fsPath + ".html")) return send(res, 200, fsPath + ".html");
  if (isFile(path.join(fsPath, "index.html"))) { res.writeHead(301, { location: p + "/" + url.search }); return res.end(); }
  return send(res, 404, path.join(root, "404.html"));
}).listen(port, () => console.log(`listening http://localhost:${port} root=${root}`));
