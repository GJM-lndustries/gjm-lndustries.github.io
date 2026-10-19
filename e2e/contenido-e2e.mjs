// E2E de contenido v2: trampas, «qué evalúa», puntos fáciles, /yo trampas, parte 1, Tips y FAQ.
// BASE = servidor con dist (ghpages-server en 4173 por defecto).
import { fileURLToPath } from "node:url";
const ROOT_DIR = fileURLToPath(new URL("..", import.meta.url)).replace(/\/$/, "");
const SHOTS_DIR = process.env.OUT || `${ROOT_DIR}/e2e/.shots`;
const CHROME = process.env.CHROME_PATH || "/usr/bin/google-chrome";
import { chromium } from "playwright-core";
const BASE = process.env.BASE || "http://127.0.0.1:4173";
const ONLY = process.env.ONLY ? new RegExp(process.env.ONLY) : null;
const b = await chromium.launch({ executablePath: CHROME, args: ["--no-sandbox", "--disable-dev-shm-usage"] });
let pass = 0, fail = 0; const errors = [];
const check = (n, ok, extra = "") => { ok ? pass++ : fail++; console.log(`${ok ? "PASS" : "FAIL"} ${n}${extra ? " — " + extra : ""}`); };
const CONSENT = { version: 1, date: "2026-10-01T00:00:00.000Z", necessary: true, analytics: false, ads: false };
export async function ctx({ time, progress, consent = true, mobile = true, width = 1280 } = {}) {
  const c = await b.newContext({ viewport: mobile ? { width: 390, height: 844 } : { width, height: 900 }, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 1, serviceWorkers: "block" });
  if (time) await c.clock.install({ time: new Date(time) });
  await c.addInitScript(([cs, p]) => {
    if (cs) localStorage.setItem("proicfes_consent", JSON.stringify(cs));
    localStorage.setItem("proicfes_install_dismissed", String(Date.now()));
    if (p && !sessionStorage.getItem("seeded")) { localStorage.setItem("proicfes_progress", JSON.stringify(p)); sessionStorage.setItem("seeded", "1"); }
  }, [consent ? CONSENT : null, progress ?? null]);
  const page = await c.newPage();
  page.on("pageerror", e => errors.push(`${page.url()}: ${e.message}`));
  page.on("console", m => m.type() === "error" && !/404/.test(m.text()) && errors.push(`${page.url()}: ${m.text()}`));
  return { c, page };
}
const SHOTS = process.env.SHOTS; // carpeta para capturas (opcional)
const hideNav = p => p.addStyleTag({ content: "nav.fixed.bottom-0{visibility:hidden!important}" }).catch(() => {});
async function shot(page, name, full = true) {
  if (!SHOTS) return;
  await page.waitForTimeout(450);
  await hideNav(page);
  await page.screenshot({ path: `${SHOTS}/${name}.png`, fullPage: full });
}
const stored = page => page.evaluate(() => JSON.parse(localStorage.getItem("proicfes_progress") || "{}"));
import { readFileSync, readdirSync } from "fs";
const QDIR = `${ROOT_DIR}/src/data/questions`;
const ANSWER = Object.fromEntries(readdirSync(QDIR).filter(f => f.endsWith(".json") && f !== "stimuli.json").flatMap(f => JSON.parse(readFileSync(`${QDIR}/${f}`)).map(q => [q.id, q.answer])));
/** Responde la pregunta visible: bien o mal a propósito. */
async function answer(page, right) {
  const qv = page.locator("[data-qid]").last();
  const id = await qv.getAttribute("data-qid");
  const ok = ANSWER[id];
  const opts = qv.locator("[aria-label='Opciones de respuesta'] button");
  const n = await opts.count();
  for (let i = 0; i < n; i++) {
    const letter = (await opts.nth(i).locator("span").first().innerText()).trim().toLowerCase();
    if ((letter === ok) === right) { await opts.nth(i).click(); return id; }
  }
  throw new Error("sin opción para " + id);
}

const tests = {};
const T = (name, fn) => { tests[name] = fn; };
const BASEP = { hasCompletedOnboarding: true };
const nivel = page => page.locator("fieldset", { hasText: "2. Nivel" }).getByRole("button");

T("trampa: al fallar explica por qué tu opción no es y muestra qué evalúa", async () => {
  const { c, page } = await ctx({ progress: BASEP });
  await page.goto(BASE + "/practica?trampa=extremo", { waitUntil: "networkidle" });
  await page.locator("[data-qid]").first().waitFor();
  const id = await answer(page, false);
  const box = page.getByTestId("trampa");
  await box.waitFor();
  const t = await box.innerText();
  check("caja de trampa visible", /Por qué tu opción \([A-D]\) no es/i.test(t), t.slice(0, 80));
  check("nombra el tipo de trampa", /Extremo|Verdad a medias|Fuera de contexto|Confunde|Lectura literal|Opinión|Causa|No responde|Dato|Error|Desfase|Palabra/i.test(t));
  check("muestra «Por qué la … sí»", (await page.getByText(/Por qué la [A-D] sí/).count()) >= 1);
  const qe = await page.getByTestId("que-evalua").innerText();
  check("muestra «Qué evalúa» con competencia y afirmación", /Qué evalúa/.test(qe) && qe.length > 40, qe.slice(0, 90));
  await shot(page, "c01-trampa-feedback");
  const p = await stored(page);
  check("suma la trampa en trapStats", Object.values(p.trapStats || {}).reduce((s, n) => s + n, 0) === 1, JSON.stringify(p.trapStats) + " " + id);
  await c.close();
});

T("al acertar no aparece la caja de trampa", async () => {
  const { c, page } = await ctx({ progress: BASEP });
  await page.goto(BASE + "/practica?trampa=extremo", { waitUntil: "networkidle" });
  await page.locator("[data-qid]").first().waitFor();
  await answer(page, true);
  await page.getByTestId("que-evalua").waitFor();
  check("sin caja de trampa al acertar", (await page.getByTestId("trampa").count()) === 0);
  await c.close();
});

T("/yo: tus trampas más comunes con enlace a practicar", async () => {
  const { c, page } = await ctx({ progress: { ...BASEP, trapStats: { "lectura-literal": 6, extremo: 4, "confunde-conceptos": 2, opinion: 1 } } });
  await page.goto(BASE + "/yo", { waitUntil: "networkidle" });
  const card = page.getByTestId("yo-trampas");
  await card.waitFor();
  const t = await card.innerText();
  check("muestra las 3 más comunes en orden", t.indexOf("Lectura literal") >= 0 && t.indexOf("Lectura literal") < t.indexOf("Se va al extremo") && t.indexOf("Se va al extremo") < t.indexOf("Confunde conceptos") && !/Opinión/.test(t), t.slice(0, 160));
  const href = await card.getByRole("link").first().getAttribute("href");
  check("enlace a practicar esa trampa", href === "/practica?trampa=lectura-literal", href);
  await card.scrollIntoViewIfNeeded();
  await shot(page, "c02-yo-trampas");
  await c.close();
  const e = await ctx({ progress: BASEP });
  await e.page.goto(BASE + "/yo", { waitUntil: "networkidle" });
  await e.page.waitForTimeout(400);
  check("sin datos no muestra la tarjeta", (await e.page.getByTestId("yo-trampas").count()) === 0);
  await e.c.close();
});

T("puntos fáciles: tras practicar, recuperar las fáciles falladas", async () => {
  const { c, page } = await ctx({ progress: BASEP });
  await page.goto(BASE + "/practica?area=matematicas", { waitUntil: "networkidle" });
  await nivel(page).nth(1).click();
  await page.locator("fieldset", { hasText: "Preguntas por sesión" }).getByRole("button", { name: "5", exact: true }).click();
  await page.getByRole("button", { name: /Empezar práctica/ }).click();
  for (let k = 0; k < 5; k++) {
    await page.locator("[data-qid]").first().waitFor();
    await answer(page, false);
    await page.getByRole("button", { name: k < 4 ? /Siguiente pregunta/ : /Ver resumen/ }).click();
  }
  const card = page.getByTestId("puntos-faciles");
  await card.waitFor();
  const t = await card.innerText();
  check("tarjeta «Tienes 5 puntos fáciles por recuperar»", /Tienes 5 puntos fáciles por recuperar/.test(t), t.slice(0, 80));
  check("botón «Recupéralas en 8 minutos»", (await card.getByRole("button", { name: /Recupéralas en 8 minutos/ }).count()) === 1);
  await shot(page, "c03-puntos-faciles");
  await card.getByRole("button", { name: /Recupéralas/ }).click();
  for (let k = 0; k < 5; k++) {
    await page.locator("[data-qid]").first().waitFor();
    await answer(page, true);
    await page.getByRole("button", { name: k < 4 ? /Siguiente pregunta/ : /Ver resumen/ }).click();
  }
  const r = await page.getByTestId("recuperadas").innerText();
  check("resumen «Recuperaste 5 de 5»", /Recuperaste 5 de 5/.test(r), r.slice(0, 60));
  check("ya no ofrece recuperar otra vez", (await page.getByTestId("puntos-faciles").count()) === 0);
  await shot(page, "c04-recuperadas");
  await c.close();
});

T("simulacro: resultados con puntos fáciles enlazan a /practica?recuperar", async () => {
  const { c, page } = await ctx({ progress: BASEP });
  await page.goto(BASE + "/practica?recuperar=mat-032,lc-030,cn-032", { waitUntil: "networkidle" });
  await page.locator("[data-qid]").first().waitFor();
  const ids = [];
  for (let k = 0; k < 3; k++) {
    await page.locator("[data-qid]").first().waitFor();
    ids.push(await answer(page, k !== 1));
    await page.getByRole("button", { name: k < 2 ? /Siguiente pregunta/ : /Ver resumen/ }).click();
  }
  const r = await page.getByTestId("recuperadas").innerText();
  check("enlace de recuperación arranca la sesión con esas 3", ids.sort().join() === "cn-032,lc-030,mat-032" && /Recuperaste 2 de 3/.test(r), ids.join() + " " + r.slice(0, 40));
  await c.close();
});

T("Inglés parte 1: la palabra del ejemplo no se puede elegir", async () => {
  const { c, page } = await ctx({ progress: BASEP });
  await page.goto(BASE + "/practica?recuperar=ing-001", { waitUntil: "networkidle" });
  const ej = page.locator("[data-ejemplo]");
  await ej.first().waitFor();
  const tag = await ej.first().evaluate(e => e.tagName);
  check("opción del ejemplo no es botón", tag !== "BUTTON", tag);
  check("dice «Usada en el ejemplo»", (await page.getByText("Usada en el ejemplo").count()) === 1);
  await ej.first().click({ force: true });
  check("hacer clic no la marca como respuesta", (await page.getByTestId("que-evalua").count()) === 0);
  await page.keyboard.press("d");
  await page.waitForTimeout(200);
  check("la tecla de su letra tampoco la elige", (await page.getByTestId("que-evalua").count()) === 0);
  await shot(page, "c05-parte1-ejemplo");
  await c.close();
});

T("pregunta en negativo: el NO va en negrita", async () => {
  const { c, page } = await ctx({ progress: BASEP });
  await page.goto(BASE + "/practica?recuperar=soc-039", { waitUntil: "networkidle" });
  await page.locator("[data-qid]").first().waitFor();
  check("«NO» en <strong>", (await page.locator("[data-qid] strong", { hasText: /^NO$/ }).count()) === 1);
  await c.close();
});

T("Tips: reglas oficiales actualizadas y fuente", async () => {
  const { c, page } = await ctx({});
  await page.goto(BASE + "/tips", { waitUntil: "networkidle" });
  for (let round = 0; round < 3; round++) {
    const closed = page.locator("main button[aria-expanded='false']");
    const n = await closed.count();
    for (let i = n - 1; i >= 0; i--) await closed.nth(i).click().catch(() => {});
    await page.waitForTimeout(300);
  }
  let body = await page.locator("main").innerText();
  for (const title of ["Lleva lo obligatorio", "Lo que está prohibido"]) { await page.getByRole("button", { name: new RegExp(title) }).first().click().catch(() => {}); await page.waitForTimeout(250); body += await page.locator("main").innerText(); }
  for (const [n, re] of [["una mala no resta más", /una mala no resta más que una en blanco/i], ["2 minutos por pregunta", /2 minutos por pregunta/], ["sin calculadora", /sin calculadora/i], ["lápiz No. 2", /lápiz de mina No\. 2/], ["prohibido", /reloj inteligente/i], ["dos sesiones", /dos sesiones/i], ["fuente guía 2026", /guía de orientación Saber 11 2026/]]) check(`tips: ${n}`, re.test(body));
  check("tips: ya no dice 25 % de adivinar", !/25 ?%/.test(body));
  await shot(page, "c06-tips");
  await c.close();
});

T("FAQ: entradas nuevas", async () => {
  const { c, page } = await ctx({});
  await page.goto(BASE + "/preguntas-frecuentes", { waitUntil: "networkidle" });
  for (const id of ["percentil-y-puesto", "puntaje-se-vence", "no-puedo-presentar"]) {
    const d = page.locator(`details#${id}`);
    check(`faq: existe ${id}`, (await d.count()) === 1);
    await d.locator("summary").click();
  }
  await page.waitForTimeout(300);
  const t = await page.locator("details#percentil-y-puesto").innerText() + await page.locator("details#puntaje-se-vence").innerText() + await page.locator("details#no-puedo-presentar").innerText();
  check("faq: cita Res. 268/2020, Decreto 869/2010 y Res. 675/2019", /268 de 2020/.test(t) && /869 de 2010/.test(t) && /675 de 2019/.test(t), t.slice(0, 100));
  await page.locator("details#percentil-y-puesto").scrollIntoViewIfNeeded();
  await shot(page, "c07-faq-nuevas", false);
  await c.close();
});

T("Inglés: la lección habla de 4 niveles", async () => {
  const txt = readFileSync(`${ROOT_DIR}/src/lib/appData.ts`, "utf8");
  check("4 niveles Pre A1, A1, A2 y B1", /4 niveles: Pre A1, A1, A2 y B1/.test(txt) && !/3 niveles/.test(txt));
});

for (const [n, fn] of Object.entries(tests)) {
  if (ONLY && !ONLY.test(n)) continue;
  try { await fn(); } catch (e) { fail++; console.log(`FAIL ${n} — ${e.message.split("\n")[0]}`); }
}
await b.close();
if (errors.length) { console.log("ERRORES DE CONSOLA:"); for (const e of [...new Set(errors)]) console.log("  " + e); }
console.log(`\n${pass} PASS, ${fail} FAIL, ${errors.length} errores de consola`);
process.exit(fail || errors.length ? 1 : 0);
