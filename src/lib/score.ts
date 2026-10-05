import { AREA_IDS, type AreaId } from "@/data/questions/types";

export interface AreaStat {
  answered: number;
  correct: number;
}
export type AreaStats = Record<AreaId, AreaStat>;

/** Mínimo de respuestas por área antes de mostrar un estimado para esa área. */
export const MIN_ANSWERS_PER_AREA = 2;

export function emptyAreaStats(): AreaStats {
  return Object.fromEntries(AREA_IDS.map(a => [a, { answered: 0, correct: 0 }])) as AreaStats;
}

/** Porcentaje de aciertos 0–100 (o null si no hay suficientes respuestas). */
export function areaAccuracy(stat: AreaStat | undefined, min = MIN_ANSWERS_PER_AREA): number | null {
  if (!stat || stat.answered < Math.max(1, min)) return null;
  return Math.round((stat.correct / stat.answered) * 100);
}

/**
 * Ponderación oficial del puntaje global Saber 11:
 * global = round(((3·LC + 3·M + 3·SC + 3·CN + 1·Inglés) / 13) × 5)
 * con cada área en escala 0–100. Devuelve null si falta alguna área.
 */
export function weightedGlobalScore(perArea: Record<AreaId, number | null>): number | null {
  const lc = perArea["lectura-critica"];
  const m = perArea.matematicas;
  const sc = perArea["sociales-ciudadanas"];
  const cn = perArea["ciencias-naturales"];
  const ing = perArea.ingles;
  if (lc == null || m == null || sc == null || cn == null || ing == null) return null;
  return Math.round(((3 * lc + 3 * m + 3 * sc + 3 * cn + 1 * ing) / 13) * 5);
}

export interface ScoreEstimate {
  /** Puntaje global estimado 0–500, o null si aún no hay datos en las 5 áreas */
  global: number | null;
  /** Aciertos 0–100 por área (null = sin datos suficientes) */
  perArea: Record<AreaId, number | null>;
  /** Áreas a las que todavía les faltan respuestas */
  missingAreas: AreaId[];
  totalAnswered: number;
}

export function estimateScore(stats: Partial<AreaStats> | undefined, min = MIN_ANSWERS_PER_AREA): ScoreEstimate {
  const perArea = Object.fromEntries(
    AREA_IDS.map(a => [a, areaAccuracy(stats?.[a], min)])
  ) as Record<AreaId, number | null>;
  const missingAreas = AREA_IDS.filter(a => perArea[a] == null);
  const totalAnswered = AREA_IDS.reduce((s, a) => s + (stats?.[a]?.answered ?? 0), 0);
  return { global: weightedGlobalScore(perArea), perArea, missingAreas, totalAnswered };
}
