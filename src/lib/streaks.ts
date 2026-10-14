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
/** Meta flexible: días de estudio por semana (lunes a domingo). */
export const DEFAULT_WEEKLY_GOAL = 4;
export const WEEKLY_GOAL_OPTIONS = [3, 4, 5, 7] as const;

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
  /** Días cubiertos por el comodín (también están en `days` para no romper la racha). */
  frozenDays?: string[];
  /** Último día cubierto automáticamente por el comodín, para avisarlo una vez. */
  freezeNotice?: string | null;
  /** Días por semana que el estudiante eligió como meta. */
  weeklyGoal?: number;
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

/**
 * Asegura que `today` corresponde al día civil actual; resetea si cambió el día.
 * Si faltó exactamente un día y queda comodín esta semana, el comodín cubre ese día
 * automáticamente (sin que el estudiante tenga que hacer nada) y se avisa una vez.
 */
export function rollStreakDay(state: StreakState, now: Date = new Date()): StreakState {
  const today = bogotaDateString(now);
  if (state.today.date === today) return state;
  let freezes = state.freezesAvailable;
  const week = bogotaWeekKey(now);
  if (state.freezeUsedWeek !== week) freezes = Math.max(freezes, FREEZES_PER_WEEK);
  const yesterday = bogotaDateString(new Date(now.getTime() - 86400000));
  let { current, days, freezeUsedWeek } = state;
  let frozenDays = state.frozenDays ?? [];
  let freezeNotice = state.freezeNotice ?? null;
  if (!days.includes(yesterday) && !days.includes(today) && current > 0) {
    const last = days[days.length - 1];
    if (last && daysBetween(last, today) === 2 && freezes > 0 && freezeUsedWeek !== week) {
      days = [...days, yesterday].sort();
      frozenDays = [...frozenDays, yesterday];
      freezes -= 1;
      freezeUsedWeek = week;
      freezeNotice = yesterday;
    } else {
      current = 0;
    }
  }
  return {
    ...state,
    days,
    current,
    frozenDays,
    freezeNotice,
    freezeUsedWeek,
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
  if (s.freezeUsedWeek === week) return { error: "Ya usaste el comodín de esta semana." };
  const yesterday = bogotaDateString(new Date(now.getTime() - 86400000));
  if (s.days.includes(yesterday)) return { error: "Ayer ya cuenta; no necesitas el comodín." };
  if (s.current === 0 && s.days.length === 0) return { error: "Primero empieza una racha." };
  const days = [...s.days, yesterday].sort();
  return {
    ...s,
    days,
    frozenDays: [...(s.frozenDays ?? []), yesterday],
    freezesAvailable: s.freezesAvailable - 1,
    freezeUsedWeek: week,
    // current se recalcula al completar hoy
  };
}

export interface WeekDay {
  date: string;
  label: string;
  done: boolean;
  frozen: boolean;
  isToday: boolean;
}

/** Fechas (YYYY-MM-DD) de lunes a domingo de la semana de `today`. */
export function weekDates(today: string): string[] {
  const [y, m, d] = today.split("-").map(Number);
  const utc = Date.UTC(y!, m! - 1, d!);
  const dow = new Date(utc).getUTCDay(); // 0 = domingo
  const mondayOffset = dow === 0 ? -6 : 1 - dow;
  return Array.from({ length: 7 }, (_, i) => new Date(utc + (mondayOffset + i) * 86400000).toISOString().slice(0, 10));
}

export const WEEK_LABELS = ["L", "M", "Mi", "J", "V", "S", "D"] as const;

/**
 * Semana actual (lunes a domingo, Bogotá). `now = null` devuelve la semana sin marcar
 * «hoy»: es lo que se usa en el HTML prerenderizado, que no sabe qué día se abrirá.
 */
export function weekCalendar(state: StreakState, now: Date | null = new Date()): WeekDay[] {
  const today = now ? bogotaDateString(now) : state.today.date;
  const frozen = new Set(state.frozenDays ?? []);
  return weekDates(today).map((iso, i) => ({
    date: iso,
    label: WEEK_LABELS[i]!,
    done: !frozen.has(iso) && (state.days.includes(iso) || (state.today.completed && state.today.date === iso)),
    frozen: frozen.has(iso),
    isToday: now != null && iso === today,
  }));
}

/** Días estudiados esta semana (sin contar los cubiertos por comodín) frente a la meta semanal. */
export function weekProgress(state: StreakState, now: Date = new Date()): { done: number; goal: number; met: boolean } {
  const goal = state.weeklyGoal ?? DEFAULT_WEEKLY_GOAL;
  const done = weekCalendar(state, now).filter(d => d.done).length;
  return { done, goal, met: done >= goal };
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
