import { fileURLToPath } from "node:url";
const ROOT_DIR = fileURLToPath(new URL("..", import.meta.url)).replace(/\/$/, "");
const SHOTS_DIR = process.env.OUT || `${ROOT_DIR}/e2e/.shots`;
const CHROME = process.env.CHROME_PATH || "/usr/bin/google-chrome";
import { chromium } from "playwright-core";
import { createServer } from "http";
import { readFileSync, existsSync, statSync } from "fs";
import { join, extname } from "path";

const DIST = `${ROOT_DIR}/dist`;
const PORT = 4180;
const BASE = `http://127.0.0.1:${PORT}`;
const OUT = SHOTS_DIR;
const mime = { ".html":"text/html",".js":"text/javascript",".css":"text/css",".woff2":"font/woff2",".png":"image/png",".jpg":"image/jpeg",".svg":"image/svg+xml",".json":"application/json",".webp":"image/webp",".ico":"image/x-icon",".xml":"application/xml",".txt":"text/plain" };

const server = createServer((req, res) => {
  let path = decodeURIComponent((req.url || "/").split("?")[0]);
  if (path.endsWith("/")) path += "index.html";
  let file = join(DIST, path);
  if (!existsSync(file) || statSync(file).isDirectory()) {
    file = join(DIST, path.replace(/^\//, "") + ".html");
    if (!existsSync(file)) file = join(DIST, "index.html");
  }
  try {
    res.writeHead(200, { "Content-Type": mime[extname(file)] || "application/octet-stream", "Cache-Control": "no-store" });
    res.end(readFileSync(file));
  } catch {
    res.writeHead(404); res.end();
  }
});
await new Promise(r => server.listen(PORT, "127.0.0.1", r));

const report = [];
const check = (n, ok, extra = "") => { report.push(`${ok ? "PASS" : "FAIL"} ${n}${extra ? " — " + extra : ""}`); console.log(report.at(-1)); };

const browser = await chromium.launch({ executablePath: CHROME, args: ["--no-sandbox"] });

async function run(viewport, label) {
  const ctx = await browser.newContext({
    viewport,
    isMobile: viewport.width < 500,
    hasTouch: viewport.width < 500,
    locale: "es-CO",
  });
  const page = await ctx.newPage();
  const errs = [];
  page.on("pageerror", e => errs.push(e.message));
  page.on("console", m => { if (m.type() === "error" && !/Failed to load resource|net::ERR|favicon/.test(m.text())) errs.push(m.text()); });

  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.evaluate(() => localStorage.setItem("proicfes_consent", JSON.stringify({ version: 1, date: new Date().toISOString(), necessary: true, analytics: false, ads: false })));
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  check(`${label} portada h1`, (await page.locator("h1").count()) >= 1);
  check(`${label} CTA Empezar`, (await page.getByRole("link", { name: /Empezar gratis|Continuar estudiando/ }).count()) >= 1);
  check(`${label} Iniciar sesión`, (await page.getByRole("link", { name: "Iniciar sesión" }).count()) >= 1);
  await page.screenshot({ path: `${OUT}/${label}-80-landing-hero.png`, fullPage: false });

  // sample question interaction
  check(`${label} sin pie de foto en portada`, (await page.locator("text=/Foto: Unsplash/").count()) === 0);
  check(`${label} sin «Sin cuentos»`, !(await page.locator("body").innerText()).includes("Sin cuentos"));
  check(`${label} sin imágenes IA`, (await page.locator('img[src*="hero-icfes"], img[src*="modulo-"], img[src*="hero-study"]').count()) === 0);
  check(`${label} enlace Créditos de imágenes`, (await page.getByRole("link", { name: "Créditos de imágenes" }).count()) >= 1);
  const opt = page.locator("#ejemplo li button").first();
  if (await opt.count()) {
    await opt.click();
    await page.waitForTimeout(200);
    check(`${label} pregunta ejemplo responde`, (await page.locator("#ejemplo [role=status]").count()) >= 1);
  } else check(`${label} pregunta ejemplo responde`, false, "no options");

  await page.getByRole("link", { name: /Empezar gratis|Continuar estudiando/ }).first().click();
  await page.waitForTimeout(800);
  check(`${label} onboarding`, page.url().includes("/meta") || page.url().includes("/inicio"));
  if (page.url().includes("/meta")) {
    await page.screenshot({ path: `${OUT}/${label}-81-onboarding-1.png`, fullPage: true });
    // El flujo completo se prueba en fase1-e2e.mjs; aquí basta con omitirlo.
    await page.getByRole("button", { name: "Omitir" }).click();

    await page.waitForTimeout(800);
  }
  check(`${label} dashboard /inicio`, page.url().includes("/inicio"));
  check(`${label} reto de hoy`, (await page.locator("text=Reto de hoy").count()) >= 1);
  check(`${label} saludo /inicio`, (await page.locator("h1").first().innerText()).includes("Tu plan de hoy"));
  check(`${label} sin copy de portada en /inicio`, !(await page.locator("main").innerText()).includes("Prepárate gratis"));
  const order = await page.evaluate(() => {
    const a = document.getElementById("reto-hoy"), b = document.getElementById("meta-titulo"), c = document.getElementById("areas-titulo");
    return !!(a && b && c) && !!(a.compareDocumentPosition(b) & 4) && !!(b.compareDocumentPosition(c) & 4);
  });
  check(`${label} orden reto → meta → áreas`, order);
  check(`${label} sin hamburguesa`, (await page.locator('[aria-label="Abrir menú"]').count()) === 0);
  if (viewport.width < 500) check(`${label} app sin «Iniciar sesión» en header (invitación en contexto)`, (await page.locator('header [data-testid="header-login"]').count()) === 0);
  // Emoji usados como íconos: no debe quedar ninguno en las pantallas principales.
  const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B50}]/u;
  for (const r of ["/inicio", "/yo", "/logros", "/glosario", "/tips", "/practica", "/simulacro", "/matematicas", "/analytics", "/cuenta", "/creditos"]) {
    await page.goto(BASE + r, { waitUntil: "networkidle" });
    const txt = await page.locator("body").innerText();
    const m = txt.match(EMOJI);
    check(`${label} sin emoji ${r}`, !m, m ? m[0] : "");
    const broken = await page.evaluate(() => [...document.images].filter(i => i.complete && i.naturalWidth === 0).map(i => i.src));
    if (broken.length) check(`${label} imágenes ${r}`, false, broken.join(","));
  }
  await page.goto(BASE + "/creditos", { waitUntil: "networkidle" });
  check(`${label} /creditos h1`, (await page.locator("h1").innerText()).includes("Créditos de imágenes"));
  await page.goto(BASE + "/inicio", { waitUntil: "networkidle" });
  await page.screenshot({ path: `${OUT}/${label}-83-dashboard.png`, fullPage: false });

  // bottom nav 4 items on mobile
  if (viewport.width < 500) {
    check(`${label} bottom nav 4`, (await page.locator('nav[aria-label="Navegación rápida"] a').count()) === 4);
    await page.getByRole("link", { name: "Yo", exact: true }).last().click();
    await page.waitForTimeout(600);
    check(`${label} /yo`, page.url().includes("/yo"));
    await page.screenshot({ path: `${OUT}/${label}-84-yo-streak.png`, fullPage: true });
  }

  check(`${label} 0 console errors`, errs.length === 0, errs.slice(0, 3).join(" | "));
  await ctx.close();
}

await run({ width: 390, height: 844 }, "mobile");
await run({ width: 1280, height: 800 }, "desktop");

console.log(`\n${report.filter(r => r.startsWith("PASS")).length}/${report.length} PASS`);
await browser.close();
server.close();
process.exit(report.some(r => r.startsWith("FAIL")) ? 1 : 0);
