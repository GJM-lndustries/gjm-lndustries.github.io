// E2E Parte B: calendario .ics, fechas y tarifas, rutas del onboarding, lo que más pesa y curso (ejemplo).
// BASE = servidor con dist (ghpages-server en 4173 por defecto). SHOTS = carpeta para capturas.
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
import { readFileSync as rf } from "fs";
const PLAN = { scoreRange: "250-300", examWindow: "2027-07", dailyMinutes: 10, studyMoment: "En el bus o en el camino" };
const T = "2026-10-19T12:00:00-05:00";
async function dl(page, testid) {
  const [d] = await Promise.all([page.waitForEvent("download"), page.getByTestId(testid).click()]);
  return { name: d.suggestedFilename(), text: rf(await d.path(), "utf8") };
}
const tests = {
  async calendario() {
    const { c, page } = await ctx({ time: T, progress: { hasCompletedOnboarding: true, targetScore: 300, plan: PLAN } });
    await page.goto(BASE + "/inicio", { waitUntil: "networkidle" });
    const card = page.getByTestId("calendario");
    await card.scrollIntoViewIfNeeded();
    check("inicio: tarjeta «Agregar a mi calendario»", await card.isVisible());
    check("hora sugerida según el momento (bus 06:30)", (await page.getByLabel("Hora del recordatorio diario").inputValue()) === "06:30");
    await page.getByLabel("Hora del recordatorio diario").fill("19:15");
    const d = await dl(page, "ics-diario");
    check("recordatorio diario .ics válido", d.name.endsWith(".ics") && /BEGIN:VCALENDAR[\s\S]*DTSTART;TZID=America\/Bogota:\d{8}T191500\r\nDURATION:PT10M\r\nRRULE:FREQ=DAILY;UNTIL=20270701T045900Z[\s\S]*END:VCALENDAR/.test(d.text), d.text.replace(/[\s\S]*END:VTIMEZONE/, "").slice(0, 400));
    const e = await dl(page, "ics-examen");
    check("examen .ics de día completo con aviso de 30 días", /DTSTART;VALUE=DATE:20270701/.test(e.text) && /TRIGGER:-P30D/.test(e.text) && /confirma la fecha/i.test(e.text), e.text.slice(0, 400));
    check("líneas CRLF y <= 75 bytes", e.text.split("\r\n").every(l => Buffer.byteLength(l) <= 75));
    await card.scrollIntoViewIfNeeded();
    await shot(page, "01-inicio-calendario", false);
    await c.close();
  },
  async fechasTarifas() {
    const { c, page } = await ctx({ time: T });
    await page.goto(BASE + "/cuando-y-cuanto-cuesta", { waitUntil: "networkidle" });
    check("h1", (await page.getByRole("heading", { level: 1, name: "¿Cuándo es mi ICFES y cuánto cuesta?" }).count()) === 1);
    check("dice que calendario B 2027 no está publicado", /no ha publicado el calendario B 2027/.test(await page.getByTestId("aviso-2027").innerText()));
    const t = await page.getByTestId("tabla-tarifas").innerText();
    check("tabla de tarifas 2026 (72.000 / 108.000 / 430.000)", t.includes("$72.000") && t.includes("$108.000") && t.includes("$430.000") && t.includes("$646.000"));
    check("fechas oficiales 2026", /26 de julio de 2026/.test(await page.getByTestId("fechas-A-2026").innerText()) && /15 de marzo de 2026/.test(await page.getByTestId("fechas-B-2026").innerText()));
    const links = await page.locator("a[href*='icfes.gov.co']").count();
    check("cita fuentes de icfes.gov.co", links >= 6, String(links));
    check("revisado con fecha", (await page.getByText(/Revisado el 19 de octubre de 2026/).count()) === 1);
    check("sin examen elegido: lleva a elegir fecha", (await page.getByRole("link", { name: /Elegir mi fecha|elige/i }).count()) >= 1 || (await page.getByTestId("ics-examen").count()) === 0);
    await shot(page, "02-cuando-y-cuanto-cuesta");
    await c.close();
  },
  async onboardingRutas() {
    const { c, page } = await ctx({ time: T });
    await page.goto(BASE + "/meta", { waitUntil: "networkidle" });
    const cont = () => page.getByRole("button", { name: /^Continuar/ });
    await page.getByRole("radio", { name: "Entre 250 y 300" }).click();
    await cont().click();
    await page.getByRole("heading", { name: "¿Qué te gustaría estudiar?" }).waitFor();
    { const body = await page.locator("body").innerText(); check("texto nuevo (no «puntaje de corte»)", !/puntaje de corte/.test(body) && /Cada universidad usa el ICFES a su manera/.test(body), (body.match(/.{0,60}(corte|a su manera).{0,40}/g) || []).join(" | ")); }
    await page.getByRole("button", { name: "Policía (patrullero)" }).click();
    check("meta Policía muestra el requisito de 40", /40 o más/.test(await page.getByTestId("nota-meta").innerText()));
    await page.getByRole("button", { name: "Tecnólogo SENA" }).click();
    check("meta SENA: sin puntaje mínimo", /sin puntaje mínimo/.test(await page.getByTestId("nota-meta").innerText()));
    await page.getByRole("button", { name: "Ejército (oficial)" }).click();
    await shot(page, "03-meta-ejercito");
    await cont().click();
    await page.getByRole("heading", { name: "¿Cuándo presentas el ICFES?" }).waitFor();
    check("tipo de examen: Saber 11 por defecto", (await page.getByRole("radio", { name: /^Saber 11/ }).getAttribute("aria-checked")) === "true");
    await page.getByRole("radio", { name: /Validación del bachillerato/ }).click();
    check("nota de validación (221 preguntas)", /221 preguntas/.test(await page.getByTestId("nota-tipo").innerText()));
    await page.getByRole("radio", { name: /Pre Saber/ }).click();
    check("nota Pre Saber", /mismo día que el Saber 11/.test(await page.getByTestId("nota-tipo").innerText()));
    await page.getByRole("radio", { name: /Julio\/agosto de 2027/ }).click();
    await shot(page, "04-meta-tipo-examen");
    await cont().click();
    await page.getByRole("radio", { name: /10\s*minutos/ }).click();
    await page.getByRole("radio", { name: "5 días" }).click();
    await cont().click();
    await page.getByRole("radio", { name: "En el bus o en el camino" }).click();
    await page.getByRole("button", { name: /Guardar|Continuar/ }).last().click();
    await page.waitForTimeout(300);
    const p = await stored(page);
    check("guarda tipo de examen y meta", p.plan?.examType === "presaber" && p.career === "Ejército (oficial)", JSON.stringify({ plan: p.plan, career: p.career }));
    await c.close();
  },
  async loQueMasPesa() {
    const { c, page } = await ctx({ time: T, progress: { hasCompletedOnboarding: true, career: "Policía (patrullero)", plan: PLAN,
      areaStats: { matematicas: { answered: 20, correct: 10 }, "lectura-critica": { answered: 20, correct: 12 }, "sociales-ciudadanas": { answered: 20, correct: 8 }, "ciencias-naturales": { answered: 20, correct: 10 }, ingles: { answered: 20, correct: 14 } } } });
    await page.goto(BASE + "/lo-que-mas-pesa", { waitUntil: "networkidle" });
    const first = page.locator("article").first();
    check("la meta elegida va primero", (await first.getAttribute("data-testid")) === "inst-policia");
    check("promedio estimado de las 4 áreas", (await page.getByTestId("promedio-policia").count()) === 1);
    const all = await page.locator("main").innerText();
    check("Javeriana 40 %", /pesa el 40 %/.test(all));
    check("Icesi 285 / 310 / 350", /285/.test(all) && /310/.test(all) && /350/.test(all));
    check("Nacional: examen propio y PEAMA/PAET/PTIUN", /examen propio/.test(all) && /PEAMA/.test(all) && /PTIUN/.test(all));
    check("UdeA: sin mínimo", /no pide puntaje mínimo/.test(all));
    check("cada institución con fuente", (await page.locator("article").count()) === (await page.locator("article:has(a[target=_blank])").count()));
    await shot(page, "05-lo-que-mas-pesa");
    await c.close();
  },
  async curso() {
    const { c, page } = await ctx({ time: T });
    await page.goto(BASE + "/curso", { waitUntil: "networkidle" });
    check("h1 curso", (await page.getByRole("heading", { level: 1, name: "ProICFES para tu curso" }).count()) === 1);
    check("explica qué ve el docente", /Nunca el puntaje/.test(await page.getByTestId("curso-privacidad").innerText()));
    check("sin sesión pide cuenta", (await page.getByTestId("curso-cuenta").count()) === 1);
    await page.getByRole("tab", { name: "Soy docente" }).click();
    check("docente: cuenta de adulto", /cuenta de adulto/.test(await page.getByTestId("curso-cuenta").innerText()));
    await shot(page, "06-curso");
    await page.getByTestId("ver-ejemplo").click();
    const d = page.getByTestId("demo");
    check("ejemplo rotulado como inventado", /datos inventados/.test(await d.innerText()));
    check("ejemplo: competencia más débil primero", /Formulación y ejecución/.test(await d.getByTestId("debiles").locator("li").first().innerText()));
    await d.scrollIntoViewIfNeeded();
    await shot(page, "07-curso-ejemplo");
    await c.close();
  },
};
for (const [n, fn] of Object.entries(tests)) {
  if (ONLY && !ONLY.test(n)) continue;
  try { await fn(); } catch (e) { fail++; console.log(`FAIL ${n} — ${e.message.split("\n")[0]}`); }
}
await b.close();
if (errors.length) { console.log("ERRORES DE CONSOLA:"); for (const e of [...new Set(errors)]) console.log("  " + e); }
console.log(`\n${pass} PASS, ${fail} FAIL, ${errors.length} errores de consola`);
process.exit(fail || errors.length ? 1 : 0);
