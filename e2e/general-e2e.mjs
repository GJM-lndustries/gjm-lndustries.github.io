import { fileURLToPath } from "node:url";
const ROOT_DIR = fileURLToPath(new URL("..", import.meta.url)).replace(/\/$/, "");
const SHOTS_DIR = process.env.OUT || `${ROOT_DIR}/e2e/.shots`;
const CHROME = process.env.CHROME_PATH || "/usr/bin/google-chrome";
import { chromium } from "playwright-core";
const BASE = "http://localhost:4173";
const OUT = SHOTS_DIR;
const report = { errors: [], checks: [] };
const check = (name, ok, extra = "") => { report.checks.push(`${ok ? "PASS" : "FAIL"} ${name}${extra ? " — " + extra : ""}`); };

const browser = await chromium.launch({ executablePath: CHROME, args: ["--no-sandbox"] });
for (const [name, viewport, mobile] of [["desktop", { width: 1280, height: 800 }, false], ["mobile", { width: 390, height: 844 }, true]]) {
  const ctx = await browser.newContext({ viewport, isMobile: mobile, hasTouch: mobile, locale: "es-CO" });
  const page = await ctx.newPage();
  page.on("console", m => {
    if (m.type() !== "error" && m.type() !== "warning") return;
    // 429 del correo de prueba de Supabase / Failed to load resource de /no-existe: no son fallos de la app.
    if (/429|Failed to load resource.*no-existe|otp\?redirect_to/.test(m.text())) return;
    report.errors.push(`[${name}] console.${m.type()}: ${m.text()} @ ${page.url()}`);
  });
  page.on("pageerror", e => report.errors.push(`[${name}] pageerror: ${e.message} @ ${page.url()}`));
  // Supabase (cuentas) es el único origen externo esperado; el resto se reporta.
  const allowedExternal = u => /\.supabase\.co\//.test(u) || u.startsWith("data:");
  page.on("request", r => { if (!r.url().startsWith(BASE) && !allowedExternal(r.url())) report.errors.push(`[${name}] request externo: ${r.url()}`); });
  page.on("response", r => {
    if (r.status() >= 400 && !r.url().includes("/no-existe") && !allowedExternal(r.url()))
      report.errors.push(`[${name}] HTTP ${r.status()} ${r.url()}`);
  });
  const shot = async f => page.screenshot({ path: `${OUT}/${name}-${f}.png`, fullPage: false });
  const full = async f => page.screenshot({ path: `${OUT}/${name}-${f}-full.png`, fullPage: true });
  const pageChecks = async label => {
    const h1 = await page.locator("h1").count();
    const nestedA = await page.locator("a a").count();
    check(`[${name}] ${label}: exactly one h1`, h1 === 1, `h1=${h1}`);
    check(`[${name}] ${label}: no nested <a>`, nestedA === 0, `nested=${nestedA}`);
  };

  const readConsent = () => page.evaluate(() => JSON.parse(localStorage.getItem("proicfes_consent") || "null"));
  const consentCalls = () => page.evaluate(() => (window.dataLayer || []).map(a => [...a]).filter(a => a[0] === "consent"));
  const banner = page.getByTestId("cookie-banner");
  const dialog = page.getByTestId("cookie-settings");

  // 0. Aviso de cookies en la primera visita
  let resp = await page.goto(BASE + "/", { waitUntil: "networkidle" });
  check(`[${name}] home status 200`, resp.status() === 200);
  await page.waitForTimeout(800);
  check(`[${name}] aviso de cookies aparece en la primera visita`, await banner.isVisible());
  check(`[${name}] aviso es región accesible`, (await page.getByRole("region", { name: "Aviso de cookies" }).count()) === 1);
  const bb = await banner.boundingBox();
  check(`[${name}] aviso no tapa demasiado (≤ 40% de la pantalla)`, bb.height / viewport.height <= 0.4, `${Math.round(bb.height)}px de ${viewport.height}px`);
  if (mobile) {
    const navTop = await page.evaluate(() => { const n = [...document.querySelectorAll("nav")].find(e => getComputedStyle(e).position === "fixed" && e.getBoundingClientRect().bottom >= innerHeight - 1); return n ? n.getBoundingClientRect().top : innerHeight; });
    check(`[${name}] aviso queda encima de la barra inferior, sin taparla`, bb.y + bb.height <= navTop + 1, `aviso termina en ${Math.round(bb.y + bb.height)}, barra empieza en ${Math.round(navTop)}`);
  }
  let cc = await consentCalls();
  check(`[${name}] Consent Mode v2: todo denegado por defecto`, cc[0]?.[1] === "default" && ["ad_storage", "ad_user_data", "ad_personalization", "analytics_storage"].every(k => cc[0][2][k] === "denied"), JSON.stringify(cc[0]));
  check(`[${name}] sin decisión no hay nada guardado`, (await readConsent()) === null);
  check(`[${name}] no se cargan scripts de Google antes del consentimiento`, await page.evaluate(() => ![...document.scripts].some(s => /googletagmanager|googlesyndication|google-analytics/.test(s.src))));
  await shot("00-aviso-cookies");
  // Escritorio rechaza; móvil acepta todas.
  await banner.getByRole("button", { name: mobile ? "Aceptar todas" : "Rechazar" }).click();
  await page.waitForTimeout(300);
  let stored0 = await readConsent();
  check(`[${name}] decisión guardada con versión y fecha`, stored0?.version === 1 && !isNaN(Date.parse(stored0?.date)) && stored0.necessary === true && stored0.analytics === mobile && stored0.ads === mobile, JSON.stringify(stored0));
  check(`[${name}] aviso se oculta tras decidir`, !(await banner.isVisible()));
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  check(`[${name}] aviso no reaparece tras recargar`, (await banner.count()) === 0);
  cc = await consentCalls();
  check(`[${name}] tras recargar se aplica la decisión guardada (consent update)`, cc[1]?.[1] === "update" && cc[1][2].analytics_storage === (mobile ? "granted" : "denied"), JSON.stringify(cc[1]));

  // 1. Home (sin progreso guardado: no debe bloquear con onboarding)
  const vp = await page.getAttribute('meta[name="viewport"]', "content");
  check(`[${name}] viewport sin maximum-scale`, !vp.includes("maximum-scale"), vp);
  check(`[${name}] h1 de la portada con palabras clave`, (await page.locator("h1", { hasText: "Prepárate para el ICFES" }).count()) === 1);
  await page.goto(BASE + "/inicio", { waitUntil: "networkidle" });
  check(`[${name}] /inicio saluda («Tu plan de hoy»)`, (await page.locator("h1", { hasText: "Tu plan de hoy" }).count()) === 1);
  check(`[${name}] home no bloqueada por onboarding`, (await page.locator("text=Más para practicar").count()) > 0);
  check(`[${name}] puntaje muestra — sin datos`, (await page.locator("text=Hacer la mini prueba").count()) > 0);
  await pageChecks("home");
  await shot("01-home"); await full("01-home");
  if (mobile) {
    check(`[${name}] header móvil sin menú hamburguesa`, (await page.getByRole("button", { name: "Abrir menú" }).count()) === 0);
  }

  // 2. Deep link /matematicas + recarga
  resp = await page.goto(BASE + "/matematicas", { waitUntil: "networkidle" });
  check(`[${name}] /matematicas deep link 200`, resp.status() === 200);
  await page.reload({ waitUntil: "networkidle" });
  check(`[${name}] /matematicas tras recarga muestra el módulo`, (await page.locator("h1", { hasText: "Matemáticas" }).count()) === 1);
  check(`[${name}] nivel Experto marcado como próximamente`, (await page.locator("text=Próximamente").count()) > 0);
  await pageChecks("matematicas");
  await shot("02-matematicas");

  // 3. Lección
  await page.locator("button", { hasText: "Números y operaciones básicas" }).click();
  await page.waitForTimeout(400);
  await pageChecks("leccion");
  await shot("03-leccion");
  for (let i = 0; i < 10 && (await page.locator("button", { hasText: "Siguiente tarjeta" }).count()); i++) {
    await page.locator("button", { hasText: "Siguiente tarjeta" }).click(); await page.waitForTimeout(150);
  }
  await page.locator("button", { hasText: "Ir a practicar" }).click();
  await page.locator(".answer-option").nth(1).click(); // q1 correcta = b
  await page.waitForTimeout(300);
  await shot("04-leccion-quiz-feedback");
  await page.locator("button", { hasText: "Siguiente pregunta" }).click();
  await page.locator(".answer-option").nth(0).click(); // q2 incorrecta (a)
  await page.locator("button", { hasText: "Ver resultados" }).click();
  await page.waitForTimeout(500);
  const lessonScore = await page.locator("text=1 de 2 preguntas correctas").count();
  check(`[${name}] puntaje de lección correcto (sin doble conteo)`, lessonScore === 1);
  check(`[${name}] lección muestra 50%`, (await page.locator("text=50%").count()) > 0);
  await shot("05-leccion-resultado");

  // 4. Práctica (deep link directo)
  resp = await page.goto(BASE + "/practica", { waitUntil: "networkidle" });
  check(`[${name}] /practica deep link 200`, resp.status() === 200);
  await pageChecks("practica-setup");
  await shot("06-practica-setup"); await full("06-practica-setup");
  await page.locator("button", { hasText: "Matemáticas" }).first().click();
  await page.locator("fieldset button", { hasText: /^5$/ }).click();
  await page.locator("button", { hasText: "Empezar práctica" }).click();
  await page.waitForTimeout(300);
  for (let i = 0; i < 5; i++) {
    await page.locator(".answer-option").first().click();
    await page.waitForTimeout(250);
    if (i === 0 || i === 1) await shot(`07-practica-pregunta-${i + 1}`);
    if (i === 0) await pageChecks("practica-pregunta");
    const nextBtn = page.locator("button", { hasText: /Siguiente pregunta|Ver resumen/ });
    await nextBtn.click();
    await page.waitForTimeout(200);
  }
  check(`[${name}] resumen de práctica`, (await page.locator("h1", { hasText: "Resumen de la sesión" }).count()) === 1);
  await pageChecks("practica-resumen");
  await shot("08-practica-resumen"); await full("08-practica-resumen");
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("proicfes_progress") || "{}"));
  const missed = Object.keys(stored.missedQuestions || {}).length;
  check(`[${name}] áreaStats matemáticas registradas`, (stored.areaStats?.matematicas?.answered ?? 0) >= 7, JSON.stringify(stored.areaStats?.matematicas));
  check(`[${name}] falladas guardadas en localStorage`, missed >= 1, `missed=${missed}`);
  // Repaso por enlace directo
  await page.goto(BASE + "/practica?repaso=1", { waitUntil: "networkidle" });
  await page.waitForTimeout(300);
  check(`[${name}] /practica?repaso=1 arranca repaso`, (await page.locator("text=fallaste esta pregunta antes").count()) === 1);
  await shot("09-practica-repaso");

  // 5. Simulacro (corto completo en ambos tamaños; completo por sesiones en escritorio)
  resp = await page.goto(BASE + "/simulacro", { waitUntil: "networkidle" });
  check(`[${name}] /simulacro deep link 200`, resp.status() === 200);
  await pageChecks("simulacro-intro");
  check(`[${name}] simulacro: intro muestra corto (25 preguntas, 40 min) y completo por sesiones`,
    (await page.locator("#sim-corto").count()) === 1 && /25 preguntas/.test(await page.locator("section[aria-labelledby=sim-corto]").innerText()) &&
    /40 min/.test(await page.locator("section[aria-labelledby=sim-corto]").innerText()) && /sesión 2, \d+ preguntas/.test(await page.locator("section[aria-labelledby=sim-completo]").innerText()));
  check(`[${name}] simulacro: reglas sin pausa visibles`, (await page.locator("text=El tiempo corre sin pausa").count()) === 1);
  await shot("10-simulacro-intro");
  await page.getByRole("button", { name: "Empezar simulacro corto" }).click();
  await page.waitForTimeout(300);
  const timer = page.getByRole("timer");
  check(`[${name}] simulacro: reloj visible (40 min)`, /^(40:00|39:\d\d)$/.test((await timer.innerText()).trim()), await timer.innerText());
  await pageChecks("simulacro-examen");
  await page.locator(".answer-option").nth(0).click();
  await page.waitForTimeout(150);
  check(`[${name}] simulacro: sin retroalimentación durante el examen`,
    (await page.locator("text=¡Correcto!").count()) === 0 && (await page.locator("text=Respuesta incorrecta").count()) === 0);
  await page.getByRole("button", { name: "Siguiente" }).click();
  await page.getByRole("button", { name: "Marcar para revisar" }).click();
  await page.locator(".answer-option").nth(1).click();
  await page.waitForTimeout(150);
  await shot("11-simulacro-pregunta");
  await page.getByRole("button", { name: "Siguiente" }).click();
  await page.getByRole("button", { name: "Anterior", exact: true }).click();
  check(`[${name}] simulacro: al volver se conserva la respuesta y la marca`,
    (await page.locator(".answer-option[aria-pressed=true]").count()) === 1 && (await page.getByRole("button", { name: "Marcada" }).getAttribute("aria-pressed")) === "true");
  await page.getByRole("button", { name: "Ver todas las preguntas" }).click();
  const grid = page.getByRole("navigation", { name: "Preguntas de la sesión" });
  check(`[${name}] simulacro: navegador con 25 preguntas`, (await grid.getByRole("button").count()) === 25);
  check(`[${name}] simulacro: navegador indica respondida y marcada`,
    (await grid.getByRole("button", { name: "Pregunta 2, respondida, marcada para revisar" }).count()) === 1 &&
    (await grid.getByRole("button", { name: "Pregunta 3, sin responder" }).count()) === 1);
  await shot("11b-simulacro-navegador");
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  check(`[${name}] simulacro: al recargar sigue el mismo intento (sin pausa)`,
    (await page.getByRole("timer").count()) === 1 && /Pregunta 2 de 25/.test(await page.locator("h1 + p").innerText()));
  await page.getByRole("button", { name: "Ver todas las preguntas" }).click();
  await grid.getByRole("button", { name: /^Pregunta 1,/ }).click();
  for (let i = 0; i < 25; i++) {
    if (i !== 5 && i !== 6 && (await page.locator(".answer-option[aria-pressed=true]").count()) === 0) await page.locator(".answer-option").nth(i % 3).click();
    if (i < 24) await page.getByRole("button", { name: "Siguiente" }).click();
  }
  await page.getByRole("button", { name: "Terminar sesión", exact: true }).click();
  const dlg = page.getByRole("dialog");
  check(`[${name}] simulacro: confirmación con sin responder y marcadas`,
    /Sin responder: 2/.test(await dlg.innerText()) && /Marcadas para revisar: 1/.test(await dlg.innerText()));
  await shot("11c-simulacro-confirmar");
  await dlg.getByRole("button", { name: "Sí, terminar" }).click();
  await page.waitForTimeout(500);
  await pageChecks("simulacro-resultados");
  const globalTxt = await page.locator("section[aria-labelledby=sim-global]").innerText();
  check(`[${name}] simulacro: global estimado sobre 500 con ponderación`, /\d+\s*\/ 500/.test(globalTxt) && /ponderación oficial/.test(globalTxt), globalTxt.split("\n").slice(0, 3).join(" | "));
  check(`[${name}] simulacro: puntaje 0–100 de las 5 pruebas`, (await page.getByRole("meter").count()) === 5);
  check(`[${name}] simulacro: «te faltan X» frente a la meta`, /Te faltan \d+ puntos|Alcanzas tu meta/.test(await page.getByTestId("sim-te-faltan").innerText()));
  check(`[${name}] simulacro: hasta 3 cosas para practicar con enlace`, (await page.getByTestId("sim-practicar").locator("a[href^='/practica?area=']").count()) >= 1 && (await page.getByTestId("sim-practicar").locator("li").count()) <= 3);
  await shot("12-simulacro-resultados"); await full("12-simulacro-resultados");
  await page.getByRole("button", { name: "Sin responder (2)" }).click();
  const items = page.locator("section[aria-labelledby=sim-revision] li");
  check(`[${name}] simulacro: filtro sin responder`, (await items.count()) === 2);
  await items.first().getByRole("button").first().click();
  check(`[${name}] simulacro: revisión con respuesta correcta y explicación`, (await page.locator("text=No respondiste esta pregunta").count()) === 1);
  await shot("12b-simulacro-revision");
  const hist = () => page.evaluate(() => JSON.parse(localStorage.getItem("proicfes_progress") || "{}").simulacroHistory?.length ?? 0);
  check(`[${name}] simulacro: resultado guardado en el historial`, (await hist()) === 1);
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  check(`[${name}] simulacro: recargar resultados no duplica el registro`, (await hist()) === 1 && (await page.locator("h1", { hasText: "Resultados del simulacro" }).count()) === 1);
  await page.getByRole("button", { name: "Hacer otro simulacro" }).click();
  await page.waitForTimeout(300);
  check(`[${name}] simulacro: historial en la intro`, (await page.locator("#sim-historial").count()) === 1);

  if (!mobile) {
    await page.getByRole("button", { name: "Empezar simulacro completo" }).click();
    await page.waitForTimeout(300);
    const att = () => page.evaluate(() => JSON.parse(localStorage.getItem("proicfes_simulacro_v1")));
    let a = await att();
    check(`[${name}] simulacro completo: dos sesiones proporcionales`, a.sessions.length === 2 && a.sessions.every(s => s.questionIds.length >= 40 && s.minutes >= 80),
      a.sessions.map(s => `${s.questionIds.length} preguntas/${s.minutes} min`).join(", "));
    check(`[${name}] simulacro completo: encabezado de sesión`, /Sesión 1 de 2/.test(await page.locator("h1").innerText()));
    // El reloj no se detiene: simular que pasó el tiempo con la página cerrada.
    await page.evaluate(() => { const k = "proicfes_simulacro_v1"; const x = JSON.parse(localStorage.getItem(k)); x.sessions[0].startedAt = Date.now() - (x.sessions[0].minutes * 60000 + 5000); localStorage.setItem(k, JSON.stringify(x)); });
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForTimeout(400);
    check(`[${name}] simulacro completo: tiempo agotado cierra la sesión y lleva al receso`, (await page.locator("h1", { hasText: "Receso" }).count()) === 1);
    await shot("12c-simulacro-receso");
    await page.getByRole("button", { name: "Empezar sesión 2" }).click();
    await page.waitForTimeout(300);
    check(`[${name}] simulacro completo: sesión 2 en curso`, /Sesión 2 de 2/.test(await page.locator("h1").innerText()));
    await page.getByRole("button", { name: "Ver todas las preguntas" }).click();
    await grid.getByRole("button").last().click();
    await page.waitForTimeout(200);
    check(`[${name}] simulacro completo: Inglés al final de la sesión 2`, (await page.locator(".score-badge", { hasText: "Inglés" }).count()) === 1);
    await page.locator(".answer-option").nth(0).click();
    await page.getByRole("button", { name: "Terminar sesión", exact: true }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Sí, terminar" }).click();
    await page.waitForTimeout(500);
    check(`[${name}] simulacro completo: resultados con las 5 pruebas`, (await page.getByRole("meter").count()) === 5 && (await page.locator("text=Tiempo usado").count()) === 1);
    check(`[${name}] simulacro completo: historial con 2 registros`, (await hist()) === 2);
    await page.getByRole("button", { name: "Hacer otro simulacro" }).click();
  }

  // 6. Mi progreso (carga diferida de recharts)
  resp = await page.goto(BASE + "/analytics", { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  check(`[${name}] /analytics carga`, (await page.locator("h1", { hasText: "Mi progreso" }).count()) === 1);
  await shot("13-mi-progreso"); await full("13-mi-progreso");

  // 7. Ranking honesto
  await page.goto(BASE + "/leaderboard", { waitUntil: "networkidle" });
  await page.waitForTimeout(300);
  check(`[${name}] ranking oculto: /leaderboard lleva a /yo`, new URL(page.url()).pathname === "/yo" && (await page.locator("text=Juan Pérez").count()) === 0);
  await shot("14-ranking");

  // 7b. Cuentas activas (Supabase anon en SITE.integrations; Google aún apagado)
  resp = await page.goto(BASE + "/cuenta", { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  check(`[${name}] /cuenta 200 y noindex`, resp.status() === 200 && (await page.getAttribute('meta[name="robots"]', "content")).startsWith("noindex"));
  await page.goto(BASE + "/yo", { waitUntil: "networkidle" });
  check(`[${name}] cuentas: acceso a /cuenta desde /yo`, (await page.locator("a[href='/cuenta']").count()) > 0);
  await page.goto(BASE + "/cuenta", { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  check(`[${name}] cuentas: pestañas Crear cuenta / Ya tengo cuenta`, (await page.getByRole("tab").count()) === 2);
  check(`[${name}] cuentas: sin botón de Google (aún no configurado)`, (await page.getByRole("button", { name: "Continuar con Google" }).count()) === 0);
  check(`[${name}] cuentas: formulario de correo visible`, (await page.getByLabel("Correo electrónico").count()) >= 1);
  await page.getByRole("tab", { name: "Crear cuenta" }).click();
  const crear = page.getByRole("button", { name: "Crear cuenta", exact: true });
  check(`[${name}] cuentas: Crear cuenta deshabilitado sin autorización`, await crear.isDisabled());
  await page.getByLabel("Fecha de nacimiento").fill("1999-06-15");
  check(`[${name}] cuentas: variante adulto`, (await page.locator("fieldset[data-variant=adulto]").count()) === 1);
  await page.getByRole("checkbox").check();
  await page.getByLabel("Correo electrónico").fill("proicfes.e2e.preview@gmail.com");
  const pw = page.locator('input[type="password"]');
  for (let i = 0; i < await pw.count(); i++) await pw.nth(i).fill("prueba-e2e-123");
  check(`[${name}] cuentas: Crear cuenta habilitado con datos y autorización`, await crear.isEnabled());
  // No se envía el formulario: evitar crear usuarios reales en Supabase desde las pruebas.
  check(`[${name}] cuentas: se descarga supabase-js`, await page.evaluate(() => performance.getEntriesByType("resource").some(r => /supabase/i.test(r.name))));
  await pageChecks("cuenta");
  if (!mobile) await shot("33-cuenta-activa");
  else await shot("33-cuenta-activa");

  // 8. Home con datos
  await page.goto(BASE + "/inicio", { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await shot("15-home-con-progreso");

  // 9. Meta opcional
  await page.goto(BASE + "/meta", { waitUntil: "networkidle" });
  const omitir = page.getByRole("button", { name: /^(Omitir|Cancelar)$/ });
  check(`[${name}] /meta tiene 'Omitir'`, (await omitir.count()) === 1);
  await shot("16-meta");
  await omitir.click();
  await page.waitForTimeout(300);
  check(`[${name}] omitir vuelve al inicio`, new URL(page.url()).pathname === "/inicio");

  // 10. Ruta inexistente
  resp = await page.goto(BASE + "/no-existe", { waitUntil: "networkidle" });
  check(`[${name}] ruta inexistente devuelve 404 y página amigable`, resp.status() === 404 && (await page.locator("h1", { hasText: "Página no encontrada" }).count()) === 1);
  await shot("17-404");

  // 11. Barra final
  await page.goto(BASE + "/glosario/", { waitUntil: "networkidle" });
  await page.waitForTimeout(300);
  check(`[${name}] /glosario/ se normaliza`, new URL(page.url()).pathname === "/glosario" && (await page.locator("h1", { hasText: "Glosario" }).count()) === 1);

  // 12. Preguntas frecuentes + pie de página
  resp = await page.goto(BASE + "/preguntas-frecuentes", { waitUntil: "networkidle" });
  await page.waitForTimeout(300);
  check(`[${name}] /preguntas-frecuentes 200`, resp.status() === 200);
  await pageChecks("faq");
  check(`[${name}] FAQ con 11 preguntas`, (await page.locator("main details").count()) === 11);
  await page.locator("main details summary").nth(2).click();
  check(`[${name}] FAQ se despliega y muestra la fórmula`, await page.locator("text=La fórmula oficial es").isVisible());
  check(`[${name}] pie 'Hecho por GJM lndustries'`, (await page.locator("footer", { hasText: "Hecho por GJM lndustries" }).count()) === 1);
  check(`[${name}] fuentes autoalojadas cargadas`, await page.evaluate(async () => { await document.fonts.ready; return document.fonts.check("700 16px Lexend") && [...document.fonts].some(f => f.family.includes("Lexend") && f.status === "loaded"); }));
  await shot("18-faq");
  await page.locator("footer").scrollIntoViewIfNeeded();
  await shot("19-footer");
  for (const href of ["/politica-de-privacidad", "/tratamiento-de-datos", "/terminos", "/cookies"])
    check(`[${name}] pie enlaza ${href}`, (await page.locator(`footer a[href="${href}"]`).count()) === 1);

  // 12b. Cambiar la decisión desde «Configurar cookies» del pie
  const footerBtn = page.locator("footer").getByRole("button", { name: "Configurar cookies" });
  await footerBtn.click(); await page.waitForTimeout(250);
  check(`[${name}] «Configurar cookies» abre el diálogo`, await dialog.isVisible() && (await page.getByRole("dialog", { name: "Configurar cookies" }).count()) === 1);
  check(`[${name}] diálogo refleja la decisión guardada`, (await page.locator("#cookies-analiticas").isChecked()) === mobile && (await page.locator("#cookies-necesarias").isDisabled()));
  check(`[${name}] foco dentro del diálogo`, await page.evaluate(() => !!document.activeElement?.closest('[data-testid="cookie-settings"]')));
  await shot("19b-configurar-cookies");
  await page.keyboard.press("Escape"); await page.waitForTimeout(200);
  check(`[${name}] Escape cierra el diálogo`, (await dialog.count()) === 0);
  await footerBtn.click(); await page.waitForTimeout(250);
  await page.locator("#cookies-analiticas").click();
  await dialog.getByRole("button", { name: "Guardar selección" }).click();
  await page.waitForTimeout(300);
  const stored1 = await readConsent();
  check(`[${name}] nueva selección guardada`, stored1?.analytics === !mobile && stored1?.ads === mobile && stored1.version === 1, JSON.stringify(stored1));
  await page.reload({ waitUntil: "networkidle" }); await page.waitForTimeout(300);
  check(`[${name}] selección persiste tras recargar, sin aviso`, (await readConsent())?.analytics === !mobile && (await banner.count()) === 0);
  check(`[${name}] con consentimiento pero sin IDs no se carga ningún script de Google`, await page.evaluate(() => ![...document.scripts].some(s => /googletagmanager|googlesyndication|google-analytics/.test(s.src))));

  // 12c. Páginas legales (primero navegando dentro de la app: carga diferida)
  await page.locator('footer a[href="/terminos"]').click();
  await page.locator("h1", { hasText: "Términos y condiciones de uso" }).waitFor({ timeout: 5000 }).catch(() => {});
  check(`[${name}] navegar a /terminos desde el pie carga la página`, new URL(page.url()).pathname === "/terminos" && (await page.locator("h1", { hasText: "Términos y condiciones de uso" }).count()) === 1 && (await page.title()).startsWith("Términos"));
  for (const [route, h] of [["/politica-de-privacidad", "Política de privacidad"], ["/tratamiento-de-datos", "Política de Tratamiento de Datos Personales"], ["/terminos", "Términos y condiciones de uso"], ["/cookies", "Política de cookies"]]) {
    resp = await page.goto(BASE + route, { waitUntil: "networkidle" });
    await page.waitForTimeout(300);
    check(`[${name}] ${route} 200 con h1 «${h}»`, resp.status() === 200 && (await page.locator("h1", { hasText: h }).count()) === 1);
    await pageChecks(route);
    check(`[${name}] ${route}: sin datos por llenar y con la fecha de vigencia`, (await page.locator("main mark").count()) === 0 && (await page.locator("main", { hasText: "Vigente desde: 5 de octubre de 2026" }).count()) === 1);
  }
  await page.goto(BASE + "/tratamiento-de-datos", { waitUntil: "networkidle" });
  const td = await page.locator("main").innerText();
  check(`[${name}] tratamiento: cita Ley 1581, plazos y SIC`, ["Ley 1581 de 2012", "1377 de 2013", "1074 de 2015", "diez (10) días hábiles", "quince (15) días hábiles", "Superintendencia de Industria y Comercio"].every(t => td.includes(t)), ["Ley 1581 de 2012", "1377 de 2013", "1074 de 2015", "diez (10) días hábiles", "quince (15) días hábiles", "Superintendencia de Industria y Comercio"].filter(t => !td.includes(t)).join(", "));
  await page.goto(BASE + "/terminos", { waitUntil: "networkidle" });
  const tt = await page.locator("main").innerText();
  check(`[${name}] términos: Ley 1480, retracto 5 días hábiles, no afiliación ICFES`, ["Ley 1480 de 2011", "cinco (5) días hábiles", "ICFES"].every(t => tt.includes(t)));
  await page.goto(BASE + "/cookies", { waitUntil: "networkidle" });
  await page.getByRole("region", { name: "Tu elección" }).getByRole("button", { name: "Configurar cookies" }).click(); await page.waitForTimeout(200);
  check(`[${name}] /cookies permite cambiar la decisión`, await dialog.isVisible());
  await page.keyboard.press("Escape");
  await page.goto(BASE + "/politica-de-privacidad", { waitUntil: "networkidle" });
  await page.waitForTimeout(300);
  const pp = await page.locator("main").innerText();
  check(`[${name}] privacidad muestra el responsable real`, ["Gelmis Julian Muñoz Chacón", "1.112.045.927", "Calle 3 Oeste #70-34", "311 411 3632", "shaconjulian@gmail.com"].every(t => pp.includes(t)) && (await page.locator('main a[href="mailto:shaconjulian@gmail.com"]').count()) >= 1);
  await shot("22-politica-privacidad"); await full("22-politica-privacidad");

  // 13. Metadatos al navegar dentro de la app
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.locator('a[href="/practica"]:visible').first().click();
  await page.waitForTimeout(400);
  const seo = await page.evaluate(() => ({ title: document.title, canonical: document.querySelector('link[rel="canonical"]')?.href, desc: document.querySelector('meta[name="description"]')?.content, ld: document.getElementById("ld-json")?.textContent || "" }));
  check(`[${name}] título y canonical se actualizan al navegar`, seo.title.startsWith("Preguntas tipo ICFES") && seo.canonical === "https://proicfes.com.co/practica" && seo.ld.includes("LearningResource"), JSON.stringify(seo.title));
  await ctx.close();

  // 14. Sin JavaScript: el HTML estático trae contenido real
  const nojs = await browser.newContext({ viewport, isMobile: mobile, javaScriptEnabled: false, locale: "es-CO" });
  const np = await nojs.newPage();
  for (const [route, h] of [["/", "Prepárate para el ICFES"], ["/matematicas", "Matemáticas"], ["/practica", "Modo práctica"], ["/preguntas-frecuentes", "Preguntas frecuentes sobre el Saber 11"], ["/politica-de-privacidad", "Política de privacidad"], ["/terminos", "Términos y condiciones de uso"]]) {
    const r = await np.goto(BASE + route);
    const h1 = np.locator("h1");
    check(`[${name}] sin JS ${route}: h1 visible con contenido`, r.status() === 200 && (await h1.count()) === 1 && (await h1.isVisible()) && (await h1.innerText()).includes(h), await h1.first().innerText().catch(() => "?"));
  }
  await np.goto(BASE + "/matematicas");
  await np.screenshot({ path: `${OUT}/${name}-20-sin-js-matematicas.png` });
  await nojs.close();
  continue;

}
await browser.close();
console.log(report.checks.join("\n"));
console.log("\nERRORS/WARNINGS (" + report.errors.length + "):\n" + report.errors.join("\n"));
