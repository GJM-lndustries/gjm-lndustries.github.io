/**
 * Motor del simulacro: arma el cuadernillo desde el banco, controla las sesiones y el tiempo
 * (sin pausa, como en el examen real) y calcula los resultados.
 *
 * Estructura oficial del cuadernillo estándar Saber 11 (Guía de orientación ICFES 2026):
 *   Sesión 1 (4 h 30 min): Matemáticas 25, Lectura crítica 41, Sociales y ciudadanas 25, Ciencias naturales 29.
 *   Sesión 2 (4 h 30 min): Matemáticas 25, Sociales y ciudadanas 25, Ciencias naturales 29, Inglés 55.
 * El simulacro completo conserva esa estructura y la escala al tamaño del banco.
 */
import { AREA_IDS, type AreaId, type Question } from "@/data/questions/types";
import { weightedGlobalScore } from "./score";

export type SimulacroFormat = "corto" | "completo";

export const OFFICIAL_SESSIONS: Partial<Record<AreaId, number>>[] = [
  { "lectura-critica": 41, matematicas: 25, "sociales-ciudadanas": 25, "ciencias-naturales": 29 },
  { matematicas: 25, "ciencias-naturales": 29, "sociales-ciudadanas": 25, ingles: 55 },
];
export const OFFICIAL_SESSION_MINUTES = 270;

/** Simulacro corto: una sesión de 25 preguntas en 40 minutos con las cinco áreas. */
export const SHORT_PLAN: Partial<Record<AreaId, number>> = {
  "lectura-critica": 5,
  matematicas: 6,
  "sociales-ciudadanas": 5,
  "ciencias-naturales": 5,
  ingles: 4,
};
export const SHORT_MINUTES = 40;

export interface SessionPlan {
  areas: Partial<Record<AreaId, number>>;
  minutes: number;
}

const sum = (r: Partial<Record<AreaId, number>>) => Object.values(r).reduce((s, n) => s + (n ?? 0), 0);

/** Sesiones de cada formato. El completo se escala para no pedir más preguntas de las que hay. */
export function planFormat(format: SimulacroFormat, bankCounts: Record<AreaId, number>): SessionPlan[] {
  if (format === "corto") {
    const areas = Object.fromEntries(
      Object.entries(SHORT_PLAN).map(([a, n]) => [a, Math.min(n!, bankCounts[a as AreaId] ?? 0)])
    ) as Partial<Record<AreaId, number>>;
    return [{ areas, minutes: SHORT_MINUTES }];
  }
  const officialTotals = Object.fromEntries(
    AREA_IDS.map(a => [a, OFFICIAL_SESSIONS.reduce((s, ses) => s + (ses[a] ?? 0), 0)])
  ) as Record<AreaId, number>;
  const factor = Math.min(1, ...AREA_IDS.map(a => (bankCounts[a] ?? 0) / officialTotals[a]));
  return OFFICIAL_SESSIONS.map(session => {
    const areas = Object.fromEntries(
      Object.entries(session).map(([a, n]) => [a, Math.max(1, Math.floor(n! * factor))])
    ) as Partial<Record<AreaId, number>>;
    // Mismo ritmo que el examen real: 4 h 30 min para las preguntas oficiales de la sesión.
    const minutes = Math.round((sum(areas) * OFFICIAL_SESSION_MINUTES) / sum(session));
    return { areas, minutes };
  });
}

/** Generador pseudoaleatorio con semilla (mulberry32): el mismo intento se puede reconstruir. */
export function rng(seed: number) {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(items: T[], random: () => number): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Elige `n` preguntas de un área procurando que los textos compartidos (stimulusId)
 * salgan completos y juntos, como en el cuadernillo real.
 */
function pickArea(questions: Question[], n: number, random: () => number): Question[] {
  const groups = new Map<string, Question[]>();
  for (const q of questions) {
    const key = q.stimulusId ?? `solo:${q.id}`;
    groups.set(key, [...(groups.get(key) ?? []), q]);
  }
  const picked: Question[] = [];
  const leftovers: Question[] = [];
  for (const group of shuffle([...groups.values()], random)) {
    if (picked.length + group.length <= n) picked.push(...group);
    else leftovers.push(...group);
  }
  for (const q of shuffle(leftovers, random)) if (picked.length < n) picked.push(q);
  return picked;
}

/** Orden dentro de un área: por parte (Inglés) y con las preguntas de un mismo texto seguidas. */
function orderArea(questions: Question[]): Question[] {
  const first = new Map<string, number>();
  questions.forEach((q, i) => {
    const key = q.stimulusId ?? `solo:${q.id}`;
    if (!first.has(key)) first.set(key, i);
  });
  return questions
    .map((q, i) => ({ q, i, g: first.get(q.stimulusId ?? `solo:${q.id}`)! }))
    .sort((x, y) => (x.q.parte ?? 0) - (y.q.parte ?? 0) || x.g - y.g || x.i - y.i)
    .map(x => x.q);
}

export interface SimulacroSession {
  questionIds: string[];
  minutes: number;
  startedAt: number | null;
  finishedAt: number | null;
}

export interface SimulacroAttempt {
  v: 1;
  format: SimulacroFormat;
  seed: number;
  createdAt: number;
  sessions: SimulacroSession[];
  /** Sesión actual (índice). */
  current: number;
  /** Pregunta visible dentro de la sesión actual. */
  index: number;
  answers: Record<string, string>;
  marked: string[];
  finishedAt: number | null;
  /** Ya se guardó en el progreso (para no contarlo dos veces). */
  recorded?: boolean;
}

export function buildAttempt(
  format: SimulacroFormat,
  bank: Record<AreaId, Question[]>,
  seed: number,
  now: number
): SimulacroAttempt {
  const random = rng(seed);
  const counts = Object.fromEntries(AREA_IDS.map(a => [a, bank[a]?.length ?? 0])) as Record<AreaId, number>;
  const plan = planFormat(format, counts);
  // Por área, se eligen todas las preguntas de una vez y se reparten entre sesiones (sin repetir).
  const pool = Object.fromEntries(
    AREA_IDS.map(a => [a, pickArea(bank[a] ?? [], plan.reduce((s, p) => s + (p.areas[a] ?? 0), 0), random)])
  ) as Record<AreaId, Question[]>;
  const sessions = plan.map(p => {
    const ids: string[] = [];
    for (const [area, n] of Object.entries(p.areas) as [AreaId, number][]) {
      const taken = pool[area].splice(0, n);
      ids.push(...orderArea(taken).map(q => q.id));
    }
    return { questionIds: ids, minutes: p.minutes, startedAt: null, finishedAt: null };
  });
  return { v: 1, format, seed, createdAt: now, sessions, current: 0, index: 0, answers: {}, marked: [], finishedAt: null };
}

export function sessionDeadline(s: SimulacroSession): number | null {
  return s.startedAt == null ? null : s.startedAt + s.minutes * 60_000;
}

export function isRunning(a: SimulacroAttempt): boolean {
  const s = a.sessions[a.current];
  return a.finishedAt == null && s.startedAt != null && s.finishedAt == null;
}

export function remainingMs(a: SimulacroAttempt, now: number): number {
  const s = a.sessions[a.current];
  const deadline = sessionDeadline(s);
  if (deadline == null) return s.minutes * 60_000;
  if (s.finishedAt != null) return 0;
  return Math.max(0, deadline - now);
}

export function startSession(a: SimulacroAttempt, now: number): SimulacroAttempt {
  const s = a.sessions[a.current];
  if (a.finishedAt != null || s.startedAt != null) return a;
  const sessions = a.sessions.map((x, i) => (i === a.current ? { ...x, startedAt: now } : x));
  return { ...a, sessions, index: 0 };
}

/** Cierra la sesión actual. Si era la última, cierra el simulacro. */
export function finishSession(a: SimulacroAttempt, now: number): SimulacroAttempt {
  const s = a.sessions[a.current];
  if (s.startedAt == null || s.finishedAt != null) return a;
  const end = Math.min(now, sessionDeadline(s)!);
  const sessions = a.sessions.map((x, i) => (i === a.current ? { ...x, finishedAt: end } : x));
  const last = a.current === a.sessions.length - 1;
  return { ...a, sessions, finishedAt: last ? end : null };
}

/** Pasa a la siguiente sesión (después del receso). */
export function nextSession(a: SimulacroAttempt): SimulacroAttempt {
  const s = a.sessions[a.current];
  if (s.finishedAt == null || a.current >= a.sessions.length - 1) return a;
  return { ...a, current: a.current + 1, index: 0 };
}

/** El tiempo no se detiene: si se agotó (aunque la página estuviera cerrada), la sesión se cierra sola. */
export function expireIfNeeded(a: SimulacroAttempt, now: number): SimulacroAttempt {
  if (!isRunning(a)) return a;
  const deadline = sessionDeadline(a.sessions[a.current])!;
  return now >= deadline ? finishSession(a, deadline) : a;
}

export function answerQuestion(a: SimulacroAttempt, questionId: string, optionId: string, now: number): SimulacroAttempt {
  const checked = expireIfNeeded(a, now);
  if (!isRunning(checked) || !checked.sessions[checked.current].questionIds.includes(questionId)) return checked;
  return { ...checked, answers: { ...checked.answers, [questionId]: optionId } };
}

export function toggleMark(a: SimulacroAttempt, questionId: string): SimulacroAttempt {
  if (!isRunning(a)) return a;
  const marked = a.marked.includes(questionId) ? a.marked.filter(id => id !== questionId) : [...a.marked, questionId];
  return { ...a, marked };
}

export function goTo(a: SimulacroAttempt, index: number): SimulacroAttempt {
  const n = a.sessions[a.current].questionIds.length;
  return { ...a, index: Math.max(0, Math.min(n - 1, index)) };
}

export interface AreaResult {
  correct: number;
  total: number;
  answered: number;
  /** Aciertos en escala 0–100 (estimado). */
  score: number;
}

export interface SimulacroResult {
  perArea: Partial<Record<AreaId, AreaResult>>;
  /** Puntaje global estimado 0–500 con la ponderación oficial; null si faltan áreas. */
  global: number | null;
  correct: number;
  total: number;
  answered: number;
  /** % de aciertos sobre el total de preguntas. */
  percent: number;
}

export function scoreAttempt(a: SimulacroAttempt, getQuestion: (id: string) => Question | undefined): SimulacroResult {
  const perArea: Partial<Record<AreaId, AreaResult>> = {};
  let correct = 0, total = 0, answered = 0;
  for (const id of a.sessions.flatMap(s => s.questionIds)) {
    const q = getQuestion(id);
    if (!q) continue;
    const r = (perArea[q.area] ??= { correct: 0, total: 0, answered: 0, score: 0 });
    r.total++;
    total++;
    if (a.answers[id] !== undefined) { r.answered++; answered++; }
    if (a.answers[id] === q.answer) { r.correct++; correct++; }
  }
  for (const r of Object.values(perArea)) r!.score = Math.round((r!.correct / r!.total) * 100);
  const global = weightedGlobalScore(
    Object.fromEntries(AREA_IDS.map(area => [area, perArea[area]?.score ?? null])) as Record<AreaId, number | null>
  );
  return { perArea, global, correct, total, answered, percent: total ? Math.round((correct / total) * 100) : 0 };
}

export const SIMULACRO_STORAGE_KEY = "proicfes_simulacro_v1";

/** Lee un intento guardado; descarta datos dañados o de otra versión. */
export function parseAttempt(raw: string | null, exists: (id: string) => boolean): SimulacroAttempt | null {
  if (!raw) return null;
  try {
    const a = JSON.parse(raw) as SimulacroAttempt;
    const ok =
      a && a.v === 1 && (a.format === "corto" || a.format === "completo") && Array.isArray(a.sessions) &&
      a.sessions.length > 0 && a.sessions.every(s => Array.isArray(s.questionIds) && s.questionIds.every(exists) && typeof s.minutes === "number") &&
      Number.isInteger(a.current) && a.current >= 0 && a.current < a.sessions.length &&
      typeof a.answers === "object" && a.answers !== null && Array.isArray(a.marked);
    return ok ? { ...a, index: Number.isInteger(a.index) ? a.index : 0 } : null;
  } catch {
    return null;
  }
}

/** 1:05:09 o 4:09 */
export function formatClock(ms: number): string {
  const total = Math.ceil(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

/** «2 h 20 min» o «40 min» */
export function formatMinutes(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h ? `${h} h${m ? ` ${m} min` : ""}` : `${m} min`;
}
