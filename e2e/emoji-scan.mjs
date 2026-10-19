// Escaneo estático de emoji / pictogramas en el repo del sitio.
import { fileURLToPath } from "node:url";
const ROOT_DIR = fileURLToPath(new URL("..", import.meta.url)).replace(/\/$/, "");
const SHOTS_DIR = process.env.OUT || `${ROOT_DIR}/e2e/.shots`;
const CHROME = process.env.CHROME_PATH || "/usr/bin/google-chrome";
import { readFileSync, readdirSync, statSync } from "fs";
import { join, relative } from "path";
const ROOT = ROOT_DIR;
const DIRS = ["src", "public", "scripts", "index.html", "supabase"];
const EXT = /\.(tsx?|jsx?|mjs|json|md|html|css|txt|webmanifest|sql|svg|xml)$/;
// Pictográficos + flechas/símbolos dingbat + indicadores regionales (banderas) + selector de variación + keycap
const PICTO = /\p{Extended_Pictographic}|[\u{1F1E6}-\u{1F1FF}]|\u{FE0F}|\u{20E3}|[\u2190-\u21FF\u2700-\u27BF\u2B00-\u2BFF\u2600-\u26FF\u2300-\u23FF\u25A0-\u25FF\u2022\u2713-\u2717\u2605\u2606]/u;
const PICTO_G = new RegExp(PICTO.source, "gu");
const out = [];
function walk(p) {
  const s = statSync(p);
  if (s.isDirectory()) { for (const f of readdirSync(p)) if (!["node_modules", "dist", "dist-ssr", ".git"].includes(f)) walk(join(p, f)); return; }
  if (!EXT.test(p)) return;
  const lines = readFileSync(p, "utf8").split("\n");
  lines.forEach((l, i) => {
    const m = l.match(PICTO_G);
    if (m) out.push({ file: relative(ROOT, p), line: i + 1, chars: [...new Set(m)].map(c => `${c} U+${c.codePointAt(0).toString(16).toUpperCase()}`), text: l.trim().slice(0, 140) });
  });
}
for (const d of DIRS) walk(join(ROOT, d));
console.log(JSON.stringify(out, null, 1));
