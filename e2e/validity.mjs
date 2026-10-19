import { fileURLToPath } from "node:url";
const ROOT_DIR = fileURLToPath(new URL("..", import.meta.url)).replace(/\/$/, "");
const SHOTS_DIR = process.env.OUT || `${ROOT_DIR}/e2e/.shots`;
const CHROME = process.env.CHROME_PATH || "/usr/bin/google-chrome";
import { chromium } from "playwright-core";
const BASE = process.env.BASE || "http://127.0.0.1:4173";
const routes = ["/", "/inicio", "/yo", "/practica", "/simulacro", "/matematicas", "/lectura", "/ciencias", "/sociales", "/ingles", "/preguntas-frecuentes", "/glosario", "/tips", "/politica-de-privacidad", "/tratamiento-de-datos", "/terminos", "/cookies", "/creditos", "/analytics", "/logros", "/leaderboard", "/cuenta", "/meta", "/404"];
const b = await chromium.launch({ executablePath: CHROME, args: ["--no-sandbox"] });
const p = await b.newPage({ viewport: { width: 390, height: 844 } });
const SEL = "button div, button p, button h1, button h2, button h3, button h4, button ul, button ol, button li, button table, button section, button button, button a, a button, a a, a div:has(a)";
let total = 0;
async function check(label) {
  const r = await p.evaluate(sel => [...document.querySelectorAll(sel)].map(e => { const host = e.closest("button,a"); return `${host.tagName.toLowerCase()}[${(host.getAttribute("aria-label") || host.textContent || "").trim().slice(0, 40)}] > ${e.tagName.toLowerCase()}`; }), SEL);
  const uniq = [...new Set(r)]; total += uniq.length;
  if (uniq.length) console.log(label, uniq.length, "\n  " + uniq.slice(0, 8).join("\n  "));
}
for (const r of routes) { await p.goto(BASE + r, { waitUntil: "networkidle" }); await check(r); }
await p.goto(BASE + "/", { waitUntil: "networkidle" }); await p.locator("#ejemplo button").first().click(); await check("/ ejemplo respondido");
console.log("TOTAL", total); await b.close();
