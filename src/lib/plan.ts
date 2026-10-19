/**
 * Plan personal a partir del onboarding: rangos de puntaje, fecha del examen,
 * meta sugerida y la mini prueba de 5 preguntas.
 *
 * Meta por carrera: no hay una fuente única y verificable de puntajes de corte por
 * carrera (cada universidad los publica por programa y por semestre), así que no se
 * inventan. Se sugiere 300 como referencia general y se cita el promedio nacional.
 */
import { AREA_IDS, type AreaId, type Question } from "@/data/questions/types";
import { weightedGlobalScore } from "./score";
import { bogotaDateString } from "./streaks";

export const SCORE_RANGES = [
  { id: "lt250", label: "Menos de 250", mid: 220 },
  { id: "250-300", label: "Entre 250 y 300", mid: 275 },
  { id: "300-350", label: "Entre 300 y 350", mid: 325 },
  { id: "350-400", label: "Entre 350 y 400", mid: 375 },
  { id: "gt400", label: "Más de 400", mid: 420 },
  { id: "nose", label: "No tengo idea", mid: null },
] as const;
export type ScoreRangeId = (typeof SCORE_RANGES)[number]["id"];

/** Referencia general: no es un puntaje de corte de ninguna universidad. */
export const REFERENCE_GOAL = 300;

/** Dato oficial citado en la app. */
export const NATIONAL_AVERAGE = {
  value: 261,
  label: "Promedio nacional, calendario A 2025",
  source: "ICFES, resultados Saber 11 2025",
  url: "https://www.icfes.gov.co/estadisticas-oficiales/",
} as const;

export const GOAL_OPTIONS = [260, 300, 330, 360, 400] as const;

/** Meta sugerida: 300 por defecto; si ya cree estar cerca o por encima, un paso más arriba. */
export function suggestedGoal(range: string | undefined): number {
  switch (range) {
    case "300-350": return 350;
    case "350-400": return 400;
    case "gt400": return 430;
    default: return REFERENCE_GOAL;
  }
}

export interface ExamWindow {
  id: string; // AAAA-MM o "nose"
  label: string;
  note: string;
}

const MONTHS = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

/**
 * Próximas aplicaciones: el calendario A presenta a mitad de año (en 2026 fue el 26 de julio)
 * y el calendario B en marzo. Las fechas exactas las publica el ICFES cada año.
 * ACTUALIZAR cuando salgan las resoluciones oficiales de 2027 (A y B): hoy el A cuenta hasta
 * el 1 de julio y el B hasta el 1 de marzo, como aproximación.
 */
export function examWindows(now: Date = new Date()): ExamWindow[] {
  const [y, m] = bogotaDateString(now).split("-").map(Number) as [number, number];
  const next = (month: number) => (m < month ? y : y + 1);
  const b = next(3), a = next(7);
  const list = [
    { id: `${b}-03`, label: `Marzo de ${b}`, note: "Calendario B" },
    { id: `${a}-07`, label: `Julio/agosto de ${a}`, note: "Calendario A" },
  ].sort((p, q) => (p.id < q.id ? -1 : 1));
  return [...list, { id: "nose", label: "Todavía no sé", note: "Lo puedes cambiar después" }];
}

/** Año y mes de inicio de la ventana. «AAAA-08» es el formato viejo del calendario A: se cuenta desde julio. */
function windowStart(id: string): [number, number] {
  const [y, mm] = id.split("-").map(Number) as [number, number];
  return [y, mm === 8 ? 7 : mm];
}

export function examWindowLabel(id: string | undefined): string | null {
  if (!id || id === "nose") return null;
  const [y, mm] = windowStart(id);
  return mm === 7 ? `julio/agosto de ${y}` : `${MONTHS[mm - 1]} de ${y}`;
}

/** Semanas aproximadas hasta el inicio del mes del examen (null si no sabe). */
export function weeksUntil(id: string | undefined, now: Date = new Date()): number | null {
  if (!id || id === "nose") return null;
  const [y, mm] = windowStart(id);
  const ms = Date.UTC(y, mm - 1, 1) - now.getTime();
  return ms > 0 ? Math.max(1, Math.round(ms / (7 * 86400000))) : null;
}

export const DAILY_MINUTES = [5, 10, 15] as const;

export const STUDY_MOMENTS = [
  "Al llegar del colegio",
  "En el bus o en el camino",
  "Después de almorzar",
  "En la noche, antes de las 9",
] as const;

/** Frase de intención de implementación: «Voy a estudiar 5 minutos al llegar del colegio». */
export function intentionSentence(minutes: number, moment: string): string {
  const m = moment.trim();
  const lower = m ? m.charAt(0).toLowerCase() + m.slice(1) : "";
  return `Voy a estudiar ${minutes} minutos${lower ? ` ${lower.startsWith("en ") || lower.startsWith("al ") || lower.startsWith("después") || lower.startsWith("antes") ? lower : `(${lower})`}` : " al día"}.`;
}

/**
 * Mini prueba: una pregunta por área, de nivel intermedio, la más corta de leer
 * (enunciado + texto). Determinista para que todos los estudiantes vean las mismas.
 */
export function pickDiagnostic(byArea: Record<AreaId, Question[]>, stimulusLength: (id?: string) => number): Question[] {
  return AREA_IDS.map(area => {
    const pool = byArea[area].filter(q => q.difficulty === 2);
    const from = pool.length ? pool : byArea[area];
    return [...from].sort((a, b) => a.enunciado.length + stimulusLength(a.stimulusId) - (b.enunciado.length + stimulusLength(b.stimulusId)) || (a.id < b.id ? -1 : 1))[0]!;
  });
}

/**
 * Punto de partida con 5 respuestas. Cada área parte de 50 % y la respuesta la mueve
 * a 25 % o 75 % (suavizado), y se pondera como el puntaje global oficial. El rango es
 * amplio a propósito: con 5 preguntas es solo una primera idea.
 */
export function diagnosticEstimate(answers: { area: AreaId; correct: boolean }[]): { estimate: number; low: number; high: number } {
  const per = Object.fromEntries(AREA_IDS.map(a => {
    const xs = answers.filter(x => x.area === a);
    const ok = xs.filter(x => x.correct).length;
    return [a, Math.round(((ok + 0.5) / (xs.length + 1)) * 100)];
  })) as Record<AreaId, number>;
  const estimate = weightedGlobalScore(per) ?? 250;
  return { estimate, low: Math.max(0, estimate - 50), high: Math.min(500, estimate + 50) };
}

/**
 * Días hasta el examen, contados hasta el primer día del mes elegido (aproximado: el ICFES
 * publica la fecha exacta). null si no hay fecha o ya pasó.
 */
export function daysUntilExam(id: string | undefined, now: Date = new Date()): number | null {
  if (!id || id === "nose") return null;
  const [y, mm] = windowStart(id);
  const [ty, tm, td] = bogotaDateString(now).split("-").map(Number) as [number, number, number];
  const days = Math.round((Date.UTC(y, mm - 1, 1) - Date.UTC(ty, tm - 1, td)) / 86400000);
  return days > 0 ? days : null;
}
