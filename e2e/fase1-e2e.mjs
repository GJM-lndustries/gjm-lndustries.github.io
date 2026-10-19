// E2E de la fase 1 (onboarding, inicio, semana, práctica, lecciones, yo, simulacro).
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
const PLAN = { scoreRange: "250-300", examWindow: "2027-08", dailyMinutes: 5, studyMoment: "Al llegar del colegio" };
const DIAG = { finishedAt: "2026-10-13T20:00:00.000Z", answers: [
  { questionId: "x1", area: "matematicas", correct: false }, { questionId: "x2", area: "lectura-critica", correct: true },
  { questionId: "x3", area: "ciencias-naturales", correct: true }, { questionId: "x4", area: "sociales-ciudadanas", correct: true }, { questionId: "x5", area: "ingles", correct: true }], estimate: 279, low: 229, high: 329 };
const tests = {};
const T = (name, fn) => { tests[name] = fn; };

T("semana: hoy según la fecha real (mié y dom)", async () => {
  for (const [time, label, iso] of [["2026-10-14T15:00:00-05:00", "Mi", "2026-10-14"], ["2026-10-18T09:00:00-05:00", "D", "2026-10-18"], ["2026-10-19T00:30:00-05:00", "L", "2026-10-19"]]) {
    const { c, page } = await ctx({ time, progress: { hasCompletedOnboarding: true } });
    await page.goto(BASE + "/inicio", { waitUntil: "networkidle" });
    const ol = page.locator("ol[aria-label='Tu semana']");
    await ol.waitFor();
    await page.waitForFunction(() => document.querySelector("ol[aria-label='Tu semana']")?.getAttribute("data-today"));
    const today = await ol.getAttribute("data-today");
    const ringed = await ol.locator("li").evaluateAll(lis => lis.filter(li => li.querySelector(".border-navy")).map(li => li.innerText.trim()));
    check(`semana ${time}: data-today=${iso}`, today === iso, today);
    check(`semana ${time}: anillo solo en ${label}`, ringed.length === 1 && ringed[0].startsWith(label), JSON.stringify(ringed));
    await c.close();
  }
});

T("onboarding: rango, carrera, meta, fecha, minutos, momento y mini prueba", async () => {
  const { c, page } = await ctx({ time: "2026-10-14T16:00:00-05:00" });
  await page.goto(BASE + "/meta", { waitUntil: "networkidle" });
  const cont = () => page.getByRole("button", { name: /^Continuar/ });
  check("paso 1: sin slider de 0 a 500", (await page.locator("input[type=range]").count()) === 0);
  check("paso 1: Continuar deshabilitado sin elegir", await cont().isDisabled());
  await shot(page, "01-meta-paso1-puntaje");
  await page.getByRole("radio", { name: "Entre 250 y 300" }).click();
  await page.getByText("Ya lo presenté").click();
  check("paso 1: con «Ya lo presenté» pregunta cuánto sacó", (await page.getByRole("heading", { name: "¿Cuánto sacaste en el ICFES?" }).count()) === 1);
  await page.getByLabel("Puntaje exacto").fill("287");
  await shot(page, "01b-meta-paso1-ya-lo-presente");
  await cont().click();
  await page.getByRole("button", { name: "Medicina" }).click();
  check("paso 2: meta sugerida 300 como referencia", (await page.getByText("Te sugerimos 300").count()) === 1 && (await page.getByRole("radio", { name: "300", exact: true }).getAttribute("aria-checked")) === "true");
  check("paso 2: cita el promedio nacional con fuente", (await page.getByText(/Promedio nacional, calendario A 2025/).count()) === 1 && (await page.getByRole("link", { name: /Fuente: ICFES/ }).getAttribute("href"))?.includes("icfes.gov.co"));
  await shot(page, "02-meta-paso2-carrera-meta");
  await cont().click();
  await page.getByRole("heading", { name: "¿Cuándo presentas el ICFES?" }).waitFor();
  check("paso 3: próximas fechas (marzo y julio-agosto de 2027)", (await page.getByRole("radio", { name: /Marzo de 2027/ }).count()) === 1 && (await page.getByRole("radio", { name: /Julio\/agosto de 2027/ }).count()) === 1);
  await page.getByRole("radio", { name: /Julio\/agosto de 2027/ }).click();
  await shot(page, "03-meta-paso3-fecha");
  await cont().click();
  await page.getByRole("radio", { name: /10\s*minutos/ }).click();
  await page.getByRole("radio", { name: "5 días" }).click();
  await shot(page, "04-meta-paso4-tiempo");
  await cont().click();
  await page.getByRole("radio", { name: "En el bus o en el camino" }).click();
  check("paso 5: frase de intención", (await page.getByText("Voy a estudiar 10 minutos en el bus o en el camino.").count()) === 1);
  await shot(page, "05-meta-paso5-momento");
  await page.getByRole("button", { name: /Guardar y seguir/ }).click();
  let p = await stored(page);
  check("guarda plan, meta y semana", p.hasCompletedOnboarding && p.targetScore === 300 && p.career === "Medicina" && p.presentedExam && p.currentScore === 287 && p.plan?.examWindow === "2027-07" && p.plan?.dailyMinutes === 10 && p.plan?.studyMoment === "En el bus o en el camino" && p.plan?.scoreRange === "250-300" && p.streakState?.weeklyGoal === 5, JSON.stringify({ t: p.targetScore, plan: p.plan, wg: p.streakState?.weeklyGoal }));
  await shot(page, "06-meta-paso6-mini-prueba");
  await page.getByRole("button", { name: /Empezar la mini prueba/ }).click();
  for (let k = 0; k < 5; k++) {
    await page.locator("[aria-label='Opciones de respuesta'] button").first().click();
    if (k === 0) await shot(page, "07-mini-prueba-pregunta");
    await page.getByRole("button", { name: k < 4 ? /^Siguiente/ : /Ver mi punto de partida/ }).click();
  }
  await page.getByTestId("diagnostico-resultado").waitFor();
  p = await stored(page);
  const d = p.diagnostic;
  check("mini prueba: 5 respuestas guardadas y estimado con rango", d && d.answers.length === 5 && d.high - d.low === 100 && d.estimate >= 125 && d.estimate <= 375, JSON.stringify(d && { e: d.estimate, l: d.low, h: d.high }));
  const total = Object.values(p.areaStats).reduce((s, a) => s + a.answered, 0);
  check("mini prueba: las respuestas cuentan en el progreso", total === 5, String(total));
  check("mini prueba: muestra «te faltan» frente a la meta", (await page.getByText(/Te faltan unos \d+ puntos para tu meta de 300|Ya estás cerca de tu meta/).count()) === 1);
  await shot(page, "08-mini-prueba-resultado");
  await page.getByRole("button", { name: /Ver mi plan de hoy/ }).click();
  await page.waitForURL(/\/inicio/);
  check("al final lleva a /inicio", page.url().endsWith("/inicio"));
  await c.close();
});

T("onboarding: omitir no obliga a nada", async () => {
  const { c, page } = await ctx();
  await page.goto(BASE + "/meta", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Omitir" }).click();
  await page.waitForURL(/\/inicio/);
  const p = await stored(page);
  check("omitir lleva a /inicio con meta de referencia 300", page.url().endsWith("/inicio") && p.targetScore === 300);
  await c.close();
});

T("inicio: un botón, progreso de entrada, sin ceros, sin «Iniciar sesión» arriba", async () => {
  const { c, page } = await ctx({ time: "2026-10-14T16:00:00-05:00", progress: { hasCompletedOnboarding: true, targetScore: 300, career: "Medicina", plan: PLAN, diagnostic: DIAG } });
  await page.goto(BASE + "/inicio", { waitUntil: "networkidle" });
  await page.getByTestId("reto-boton").waitFor();
  const main = await page.locator("main").innerText();
  check("un solo botón principal en el reto", (await page.locator("main .btn-primary").count()) === 1, String(await page.locator("main .btn-primary").count()));
  check("progreso de entrada: 1 de 3 listo (definiste tu meta)", /1 de 3 listo/i.test(main) && main.includes("Definiste tu meta"));
  check("sin muro de ceros (0%, 0:00, 0 XP, —)", !/\b0%|0:00|\b0 XP|—/.test(main), (main.match(/\b0%|0:00|\b0 XP|—/) || [""])[0]);
  check("«te faltan» con la mini prueba", (await page.getByTestId("te-faltan").innerText()).includes("Te faltan 21 puntos"));
  check("intención de implementación arriba", main.includes("Voy a estudiar 5 minutos al llegar del colegio."));
  check("áreas plegadas por defecto", !(await page.locator("details").first().evaluate(d => d.open)));
  check("encabezado móvil: cuenta solo como ícono discreto (sin botón «Iniciar sesión»)", (await page.locator("header.fixed").getByText("Iniciar sesión").count()) === 0 && (await page.locator("header.fixed [data-testid=header-account]").count()) === 1);
  check("sin invitación a cuenta antes del primer día", (await page.getByTestId("cuenta-invita").count()) === 0);
  check("el botón lleva a la lección recomendada (mate, la que falló)", (await page.getByTestId("reto-boton").getAttribute("href")) === "/matematicas?leccion=math-1&reto=1");
  await shot(page, "09-inicio-nuevo");
  await c.close();
});

T("reto completo: tarjetas, práctica amable, día cumplido e invitación a cuenta", async () => {
  const { c, page } = await ctx({ time: "2026-10-14T16:00:00-05:00", progress: { hasCompletedOnboarding: true, targetScore: 300, plan: PLAN, diagnostic: DIAG } });
  await page.goto(BASE + "/inicio", { waitUntil: "networkidle" });
  await page.getByTestId("reto-boton").click();
  await page.getByTestId("tarjeta-n").waitFor();
  check("lección en tarjetas: «Tarjeta 1 de 4»", (await page.getByTestId("tarjeta-n").innerText()) === "Tarjeta 1 de 4");
  check("duración honesta (~4 min, no 15)", (await page.locator("main").innerText()).includes("4 tarjetas · ~4 min"));
  await shot(page, "10-leccion-tarjeta", false);
  for (let k = 0; k < 3; k++) { await page.clock.runFor(15000); await page.clock.resume(); await page.getByRole("button", { name: /Siguiente tarjeta/ }).click(); }
  check("una tarjeta a la vez", (await page.locator("main .card").count()) === 1, String(await page.locator("main .card").count()));
  await page.clock.runFor(15000); await page.clock.resume();
  await page.getByRole("button", { name: /Ir a practicar/ }).click();
  let p = await stored(page);
  check("terminar las tarjetas cuenta como lectura del día", p.streakState.today.readingDone === true);
  await page.locator("[data-qid]").waitFor();
  for (let k = 0; k < 4; k++) {
    if (!(await page.locator("[data-qid]").count())) break;
    await answer(page, true);
    await page.getByRole("button", { name: /Siguiente pregunta|Ver resultados/ }).click();
  }
  await page.getByRole("link", { name: "Volver al plan de hoy" }).click();
  await page.getByTestId("reto-boton").waitFor();
  check("tras leer, el botón lleva a la práctica del reto", (await page.getByTestId("reto-boton").getAttribute("href")) === "/practica?reto=1");
  await page.getByTestId("reto-boton").click();
  await page.waitForURL(/practica/);
  await page.locator("[data-qid]").waitFor();
  check("reto: «Pregunta 1 de 3», sin contador de correctas", (await page.locator("main").innerText()).includes("Pregunta 1 de 3") && !(await page.locator("main").innerText()).includes("correctas"));
  const q1 = await page.locator("[data-qid]").getAttribute("data-qid");
  await page.clock.runFor(40000); await page.clock.resume();
  await answer(page, false);
  const fb = await page.locator("[role=status]").innerText();
  check("retroalimentación «Casi. Mira el truco»", fb.includes("Casi. Mira el truco"), fb.slice(0, 60));
  check("sin rojo fuerte en la respuesta equivocada", (await page.locator(".answer-option.incorrect").evaluate(e => getComputedStyle(e).borderColor)) !== "rgb(239, 68, 68)" && (await page.locator(".bg-red-50, .bg-red-500, .text-red-600").count()) === 0);
  await shot(page, "11-practica-casi-truco");
  for (let k = 1; k < 3; k++) {
    await page.getByRole("button", { name: /Siguiente pregunta|Ver resumen/ }).click();
    await page.clock.runFor(40000); await page.clock.resume();
    await answer(page, true);
  }
  await page.getByRole("button", { name: /Ver resumen/ }).click();
  await page.getByTestId("reto-resumen").waitFor();
  p = await stored(page);
  check("primera práctica: 3 preguntas fáciles", q1 && p.streakState.today.questionsAnswered >= 3, JSON.stringify(p.streakState.today));
  check("día cumplido con lectura + 3 preguntas", p.streakState.today.completed === true && p.streakState.current === 1, JSON.stringify(p.streakState.today));
  check("XP con tope diario registrado", p.xpDay?.earned > 0 && p.xpDay.earned <= 150, JSON.stringify(p.xpDay));
  await shot(page, "12-reto-resumen");
  await page.getByRole("link", { name: /Volver al plan de hoy/ }).click();
  const dlg = page.getByRole("dialog", { name: /Día 1 cumplido/ });
  await dlg.waitFor();
  check("celebración con la semana: 1 de 4 días", (await dlg.innerText()).includes("1 de 4 días"));
  await shot(page, "13-dia-cumplido", false);
  await dlg.getByRole("button", { name: "Seguir" }).click();
  // La animación de salida (framer) no avanza con el reloj falso: se verifica el estado y se recarga.
  await page.waitForFunction(() => JSON.parse(localStorage.getItem("proicfes_progress")).streakState.today.celebrated === true);
  await page.reload({ waitUntil: "networkidle" });
  await page.getByTestId("cuenta-invita").waitFor();
  check("invitación a cuenta en contexto tras el primer día", await page.getByTestId("cuenta-invita").isVisible());
  await shot(page, "14-inicio-dia-cumplido");
  await page.getByTestId("cuenta-invita").getByRole("button", { name: "Ahora no" }).click();
  check("«Ahora no» la oculta", (await page.getByTestId("cuenta-invita").count()) === 0);
  await c.close();
});

T("comodín automático: cubre el día faltante y avisa una vez", async () => {
  const streakState = { days: ["2026-10-12", "2026-10-13"], current: 2, longest: 2, freezesAvailable: 1, freezeUsedWeek: null, weeklyGoal: 4,
    today: { date: "2026-10-13", readingMs: 120000, answeringMs: 110000, questionsAnswered: 3, readingDone: true, answeringDone: true, completed: true, celebrated: true } };
  const { c, page } = await ctx({ time: "2026-10-15T10:00:00-05:00", progress: { hasCompletedOnboarding: true, streakState, streak: 2 } });
  await page.goto(BASE + "/inicio", { waitUntil: "networkidle" });
  const st = page.getByText(/Usamos tu comodín para cubrir el miércoles/);
  await st.waitFor();
  check("aviso del comodín", await st.isVisible());
  check("racha sigue en 2", (await page.getByLabel("Racha de 2 días").count()) >= 1);
  check("el miércoles se ve cubierto", (await page.getByLabel("Cubierto con comodín").count()) === 1);
  check("semana: 2 de 4 días (el comodín no suma)", (await page.locator("main").innerText()).includes("2 de 4 días"));
  await shot(page, "15-comodin-automatico", false);
  await page.getByRole("button", { name: "Entendido" }).click();
  check("el aviso se cierra", (await page.getByText(/Usamos tu comodín/).count()) === 0);
  await c.close();
});

T("aviso de cookies compacto y con el mismo peso para rechazar y aceptar", async () => {
  const { c, page } = await ctx({ consent: false });
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  const bn = page.getByTestId("cookie-banner");
  await bn.waitFor();
  const bb = await bn.boundingBox();
  check("ocupa ≤ 16 % de la pantalla", bb.height / 844 <= 0.16, `${Math.round(bb.height)}px`);
  const cls = await bn.locator("button").evaluateAll(bs => bs.slice(0, 2).map(b => b.className));
  check("Rechazar y Aceptar con el mismo estilo", cls.length === 2 && cls[0] === cls[1]);
  check("la portada mantiene «Iniciar sesión» arriba", await page.locator("header").getByRole("link", { name: "Iniciar sesión" }).isVisible());
  await shot(page, "16-portada-cookies-compacto", false);
  await c.close();
});

T("/yo reúne meta, semana, áreas e insignias; ranking oculto", async () => {
  const { c, page } = await ctx({ time: "2026-10-14T18:00:00-05:00", progress: { hasCompletedOnboarding: true, targetScore: 330, career: "Ingeniería", plan: PLAN, diagnostic: DIAG,
    badges: ["primer_paso"], completedLessons: [{ lessonId: "math-1", completed: true, score: 100 }],
    streakState: { days: ["2026-10-12", "2026-10-13"], current: 2, longest: 2, freezesAvailable: 1, weeklyGoal: 4, today: { date: "2026-10-14", readingMs: 0, answeringMs: 0, questionsAnswered: 0 } } } });
  await page.goto(BASE + "/yo", { waitUntil: "networkidle" });
  const meta = await page.getByTestId("yo-meta").innerText();
  check("/yo: «te faltan X» a la meta", /Te faltan \d+ puntos/.test(meta), meta.split("\n").slice(0, 2).join(" | "));
  check("/yo: semana 2/4", (await page.locator("main").innerText()).includes("2/4"));
  check("/yo: avance por área (5)", (await page.locator("#yo-areas + ul li").count()) === 5);
  check("/yo: insignias sin muro de candados (≤ 3 bloqueadas)", (await page.locator("text=Insignia bloqueada").count()) <= 3 && (await page.locator("text=Insignia ganada").count()) === 1);
  check("/yo: sin enlaces a Logros ni Ranking", (await page.locator("main a[href='/logros'], main a[href='/leaderboard'], nav a[href='/logros']").count()) === 0);
  check("/yo: una sola tarjeta de cuenta, opcional", (await page.getByTestId("yo-cuenta").count()) === 1 && (await page.getByTestId("yo-cuenta").innerText()).includes("Opcional"));
  await shot(page, "17-yo");
  await page.goto(BASE + "/leaderboard", { waitUntil: "networkidle" });
  await page.waitForURL(/\/yo$/);
  check("/leaderboard redirige a /yo", new URL(page.url()).pathname === "/yo");
  await c.close();
});

T("simulacro: recomienda el corto y al final dice cuánto falta y qué practicar", async () => {
  const { c, page } = await ctx({ progress: { hasCompletedOnboarding: true, targetScore: 330, plan: PLAN } });
  await page.goto(BASE + "/simulacro", { waitUntil: "networkidle" });
  check("intro: corto recomendado", (await page.getByTestId("sim-recomendado").innerText()).includes("Recomendado para empezar"));
  check("intro: reglas plegadas", (await page.locator("details:not([open]) #sim-reglas").count()) === 1);
  check("intro: completo «para cuando estés listo»", (await page.locator("section[aria-labelledby=sim-completo]").textContent()).includes("Para cuando estés listo"));
  await shot(page, "18-simulacro-intro");
  await page.getByRole("button", { name: "Empezar simulacro corto" }).click();
  await page.getByRole("timer").waitFor();
  for (let i = 0; i < 25; i++) {
    await answer(page, i % 2 === 0);
    if (i < 24) await page.getByRole("button", { name: "Siguiente" }).click();
  }
  await page.getByRole("button", { name: "Terminar sesión", exact: true }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Sí, terminar" }).click();
  await page.getByTestId("sim-te-faltan").waitFor();
  check("final: «te faltan X puntos para tu meta de 330»", /Te faltan \d+ puntos para tu meta de 330|Alcanzas tu meta/.test(await page.getByTestId("sim-te-faltan").innerText()));
  const items = page.getByTestId("sim-practicar").locator("li");
  check("final: 3 cosas para practicar con enlace", (await items.count()) === 3 && (await page.getByTestId("sim-practicar").locator("a[href^='/practica?area=']").count()) === 3);
  check("final: sin barras rojas", (await page.locator("main .bg-red-500, main .text-red-600").count()) === 0);
  await shot(page, "19-simulacro-final");
  await c.close();
});

const BARRA_P = { hasCompletedOnboarding: true, targetScore: 330, career: "Ingeniería", plan: PLAN, diagnostic: DIAG, practiceXp: 40, totalXp: 40,
  streakState: { days: ["2026-10-15", "2026-10-16"], current: 2, longest: 2, freezesAvailable: 1, weeklyGoal: 4, today: { date: "2026-10-17", readingMs: 0, answeringMs: 0, questionsAnswered: 0 } } };
for (const width of [1280, 1440]) {
  T(`escritorio ${width}: barra superior con cuenta regresiva, racha y cuenta; /inicio a dos columnas`, async () => {
    const { c, page } = await ctx({ time: "2026-10-17T18:00:00-05:00", progress: BARRA_P, mobile: false, width });
    await page.goto(BASE + "/inicio", { waitUntil: "networkidle" });
    const bar = page.getByTestId("barra-escritorio");
    await bar.getByTestId("header-countdown").waitFor();
    check(`${width}: «Faltan 257 días para el ICFES»`, /Faltan\s+257\s+días para el ICFES/.test(await bar.getByTestId("header-countdown").innerText()));
    check(`${width}: racha «2 días»`, /2\s*días/.test(await bar.getByTestId("header-streak").innerText()));
    check(`${width}: entrada de cuenta`, await bar.getByTestId("header-account").isVisible());
    const main = await page.getByTestId("reto-boton").boundingBox();
    const side = await page.getByTestId("inicio-lateral").boundingBox();
    check(`${width}: meta y semana en la columna derecha`, side.x > main.x + main.width - 1 && side.y < main.y + 50, `main ${Math.round(main.x)}+${Math.round(main.width)}, lateral ${Math.round(side.x)}`);
    check(`${width}: «Te faltan» y «Esta semana» en la columna lateral`, (await page.getByTestId("inicio-lateral").getByTestId("te-faltan").count()) === 1 && (await page.getByTestId("inicio-lateral").getByTestId("semana").count()) === 1);
    const content = await page.locator("#contenido > div.mx-auto").boundingBox();
    const gapRight = width - (side.x + side.width);
    check(`${width}: sin vacío grande a la derecha (≤ 140 px)`, gapRight <= 140, `${Math.round(gapRight)} px`);
    check(`${width}: tarjeta lateral sin «—»`, !(await page.locator("aside.fixed").innerText()).includes("—"));
    await shot(page, `20-escritorio-${width}-inicio`, false);
    await page.goto(BASE + "/practica", { waitUntil: "networkidle" });
    await bar.getByTestId("header-countdown").waitFor();
    await shot(page, `21-escritorio-${width}-practica`, false);
    await c.close();
  });
}

T("escritorio sin datos: racha y fecha con invitación neutra (sin «0» ni «—»)", async () => {
  const { c, page } = await ctx({ time: "2026-10-17T18:00:00-05:00", progress: { hasCompletedOnboarding: true }, mobile: false });
  await page.goto(BASE + "/inicio", { waitUntil: "networkidle" });
  const bar = page.getByTestId("barra-escritorio");
  await bar.getByTestId("header-countdown").waitFor();
  check("sin fecha: «Pon tu fecha del examen» a /meta", (await bar.getByTestId("header-countdown").innerText()).includes("Pon tu fecha") && (await bar.getByTestId("header-countdown").getAttribute("href")).startsWith("/meta"));
  check("racha 0: «Empieza tu racha hoy»", (await bar.getByTestId("header-streak").innerText()).includes("Empieza tu racha hoy"));
  check("cuenta sin sesión: «Iniciar sesión» discreto", (await bar.getByTestId("header-account").innerText()).includes("Iniciar sesión"));
  check("lateral: «Descúbrelo en 5 preguntas» en vez de «—»", await page.getByTestId("sidebar-estimado").isVisible());
  await shot(page, "22-escritorio-sin-datos", false);
  await c.close();
});

T("móvil: encabezado compacto y cuenta regresiva dentro de /inicio", async () => {
  const { c, page } = await ctx({ time: "2026-10-17T18:00:00-05:00", progress: BARRA_P });
  await page.goto(BASE + "/inicio", { waitUntil: "networkidle" });
  await page.locator("main header").getByTestId("header-countdown").waitFor();
  check("móvil: cuenta regresiva en /inicio", /Faltan\s+257\s+días/.test(await page.locator("main header").getByTestId("header-countdown").innerText()));
  check("móvil: encabezado sin cuenta regresiva", (await page.locator("body > div header.fixed").getByTestId("header-countdown").count()) === 0);
  check("móvil: llama y cuenta en el encabezado", (await page.locator("header.fixed").getByTestId("header-streak").count()) === 1 && (await page.locator("header.fixed").getByTestId("header-account").count()) === 1);
  await shot(page, "23-movil-inicio");
  await c.close();
});

for (const [name, fn] of Object.entries(tests)) { if (ONLY && !ONLY.test(name)) continue; try { await fn(); } catch (e) { check(name, false, e.message.split("\n").slice(0, 3).join(" ")); } }
check("sin errores de consola", errors.length === 0, errors.slice(0, 5).join(" | "));
console.log(`\n${pass} PASS, ${fail} FAIL`);
await b.close();
process.exit(fail ? 1 : 0);
