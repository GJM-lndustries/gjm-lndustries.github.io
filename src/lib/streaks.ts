/**
 * Rachas diarias (America/Bogota).
 * Un día cuenta solo si se completa el reto: lectura activa ≥ 2 min y
 * práctica/quiz con ≥ 1 min 50 s activos y al menos MIN_QUESTIONS respuestas.
 */
export const STREAK_TZ = "America/Bogota";
export const READING_GOAL_MS = 2 * 60 * 1000;
export const ANSWERING_GOAL_MS = 110 * 1000; // 1:50
export const MIN_QUESTIONS_FOR_STREAK = 3;
export const FREEZES_PER_WEEK = 1;

export interface DailyChallengeState {
  /** Día civil en Bogota (YYYY-MM-DD). */
  date: string;
  readingMs: number;
  answeringMs: number;
  questionsAnswered: number;
  readingDone: boolean;
  answeringDone: boolean;
  completed: boolean;
  celebrated?: boolean;
}

export interface StreakState {
  /** Días completados (YYYY-MM-DD), ordenados. */
  days: string[];
  current: number;
  longest: number;
  freezesAvailable: number;
  /** Semana ISO (YYYY-Www) en que se usó el congelamiento. */
  freezeUsedWeek: string | null;
  today: DailyChallengeState;
}

export function bogotaDateString(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: STREAK_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function bogotaWeekKey(now: Date = new Date()): string {
  // Semana aproximada por fecha Bogota (suficiente para 1 freeze/semana).
  const d = bogotaDateString(now);
  const [y, m, day] = d.split("-").map(Number);
  const utc = Date.UTC(y!, m! - 1, day!);
  const dt = new Date(utc);
  const oneJan = new Date(Date.UTC(y!, 0, 1));
  const week = Math.ceil(((dt.getTime() - oneJan.getTime()) / 86400000 + oneJan.getUTCDay() + 1) / 7);
  return `${y}-W${String(week).padStart(2, "0")}`;
}

export function emptyDaily(date: string = bogotaDateString()): DailyChallengeState {
  return {
    date,
    readingMs: 0,
    answeringMs: 0,
    questionsAnswered: 0,
    readingDone: false,
    answeringDone: false,
    completed: false,
  };
}

export function defaultStreakState(now: Date = new Date()): StreakState {
  return {
    days: [],
    current: 0,
    longest: 0,
    freezesAvailable: FREEZES_PER_WEEK,
    freezeUsedWeek: null,
    today: emptyDaily(bogotaDateString(now)),
  };
}

/** Asegura que `today` corresponde al día civil actual; resetea si cambió el día. */
export function rollStreakDay(state: StreakState, now: Date = new Date()): StreakState {
  const today = bogotaDateString(now);
  if (state.today.date === today) return state;
  let freezes = state.freezesAvailable;
  const week = bogotaWeekKey(now);
  if (state.freezeUsedWeek !== week) freezes = Math.max(freezes, FREEZES_PER_WEEK);
  // ¿Se rompió la racha? Si ayer no está en days y no se congela…
  const yesterday = bogotaDateString(new Date(now.getTime() - 86400000));
  let current = state.current;
  if (state.days.includes(yesterday) || state.days.includes(today)) {
    // ok
  } else if (current > 0) {
    // Opción de freeze: si hay freeze y el hueco es de 1 día desde último day
    const last = state.days[state.days.length - 1];
    if (last && freezes > 0 && isYesterdayOf(last, today)) {
      // no auto-usar; el usuario puede usarlo explícitamente. Aquí solo detectamos rotura.
      current = 0;
    } else if (!last || daysBetween(last, today) > 1) {
      current = 0;
    }
  }
  return {
    ...state,
    current,
    freezesAvailable: freezes,
    today: emptyDaily(today),
  };
}

function isYesterdayOf(day: string, today: string): boolean {
  return daysBetween(day, today) === 1;
}

export function daysBetween(a: string, b: string): number {
  const [ay, am, ad] = a.split("-").map(Number);
  const [by, bm, bd] = b.split("-").map(Number);
  const ms = Date.UTC(by!, bm! - 1, bd!) - Date.UTC(ay!, am! - 1, ad!);
  return Math.round(ms / 86400000);
}

export function addActiveMs(
  state: StreakState,
  kind: "reading" | "answering",
  ms: number,
  now: Date = new Date()
): StreakState {
  let s = rollStreakDay(state, now);
  if (ms <= 0 || s.today.completed) return s;
  const today = { ...s.today };
  if (kind === "reading") {
    today.readingMs = Math.min(READING_GOAL_MS, today.readingMs + ms);
    if (today.readingMs >= READING_GOAL_MS) today.readingDone = true;
  } else {
    today.answeringMs = Math.min(ANSWERING_GOAL_MS, today.answeringMs + ms);
  }
  today.answeringDone =
    today.answeringMs >= ANSWERING_GOAL_MS && today.questionsAnswered >= MIN_QUESTIONS_FOR_STREAK;
  s = { ...s, today };
  return maybeCompleteDay(s, now);
}

export function addChallengeQuestion(state: StreakState, now: Date = new Date()): StreakState {
  let s = rollStreakDay(state, now);
  if (s.today.completed) return s;
  const today = {
    ...s.today,
    questionsAnswered: s.today.questionsAnswered + 1,
  };
  today.answeringDone =
    today.answeringMs >= ANSWERING_GOAL_MS && today.questionsAnswered >= MIN_QUESTIONS_FOR_STREAK;
  return maybeCompleteDay({ ...s, today }, now);
}

function maybeCompleteDay(state: StreakState, now: Date): StreakState {
  const today = state.today;
  if (today.completed || !today.readingDone || !today.answeringDone) return state;
  const date = today.date;
  if (state.days.includes(date)) {
    return { ...state, today: { ...today, completed: true } };
  }
  const days = [...state.days, date].sort();
  const yesterday = bogotaDateString(new Date(now.getTime() - 86400000));
  const nextCurrent = state.days.includes(yesterday) ? state.current + 1 : 1;
  const longest = Math.max(state.longest, nextCurrent);
  return {
    ...state,
    days,
    current: nextCurrent,
    longest,
    today: { ...today, completed: true },
  };
}

/** Usa un congelamiento para cubrir el día anterior faltante (mantiene racha). */
export function useStreakFreeze(state: StreakState, now: Date = new Date()): StreakState | { error: string } {
  const s = rollStreakDay(state, now);
  const week = bogotaWeekKey(now);
  if (s.freezesAvailable <= 0) return { error: "No te quedan congelamientos esta semana." };
  if (s.freezeUsedWeek === week) return { error: "Ya usaste el congelamiento de esta semana." };
  const yesterday = bogotaDateString(new Date(now.getTime() - 86400000));
  if (s.days.includes(yesterday)) return { error: "Ayer ya cuenta: no hace falta congelar." };
  if (s.current === 0 && s.days.length === 0) return { error: "Empieza una racha antes de congelar." };
  const days = [...s.days, yesterday].sort();
  return {
    ...s,
    days,
    freezesAvailable: s.freezesAvailable - 1,
    freezeUsedWeek: week,
    // current se recalcula al completar hoy
  };
}

export function weekCalendar(state: StreakState, now: Date = new Date()): { date: string; label: string; done: boolean; isToday: boolean }[] {
  const today = bogotaDateString(now);
  // Lunes–domingo de la semana actual (Bogota)
  const [y, m, d] = today.split("-").map(Number);
  const utc = new Date(Date.UTC(y!, m! - 1, d!));
  const dow = new Date(utc).getUTCDay(); // 0 Sun
  const mondayOffset = dow === 0 ? -6 : 1 - dow;
  const labels = ["L", "M", "X", "J", "V", "S", "D"];
  const out = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(utc.getTime() + (mondayOffset + i) * 86400000);
    const date = bogotaDateString(day);
    // bogotaDateString on UTC midnight can drift; build from parts instead
    const iso = day.toISOString().slice(0, 10);
    out.push({
      date: iso,
      label: labels[i]!,
      done: state.days.includes(iso) || (state.today.completed && state.today.date === iso),
      isToday: iso === today,
    });
  }
  return out;
}

export function formatMs(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

export function streakBadges(longest: number, current: number): string[] {
  const ids: string[] = [];
  if (Math.max(longest, current) >= 3) ids.push("racha_3");
  if (Math.max(longest, current) >= 7) ids.push("racha_7");
  if (Math.max(longest, current) >= 30) ids.push("racha_30");
  return ids;
}
