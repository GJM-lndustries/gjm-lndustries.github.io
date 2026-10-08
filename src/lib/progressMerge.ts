/**
 * Sincronización del progreso local (localStorage) con la cuenta (tabla `progress` de Supabase).
 *
 * Reglas:
 *  1. Primer inicio de sesión en este navegador (progreso local anónimo) → se FUSIONA con el de la
 *     cuenta: no se pierde lo que el estudiante hizo antes de crear la cuenta ni lo que ya tenía en ella.
 *  2. Después, el documento completo se sincroniza con «gana el último que escribió» (updated_at).
 *  3. Si el progreso local pertenece a OTRA cuenta (cambio de usuario en el mismo navegador), no se
 *     mezcla: se reemplaza por el de la cuenta que inicia sesión.
 * Todo es puro (sin red ni almacenamiento) para poder probarlo.
 */
import { AREA_IDS } from "@/data/questions/types";
import {
  defaultProgress,
  normalizeProgress,
  type UserProgress,
} from "@/contexts/ProgressContext";

export const SYNC_STORAGE_KEY = "proicfes_sync";

/** Estado de sincronización guardado junto al progreso local. */
export interface SyncMeta {
  /** Cuenta con la que está sincronizado el progreso local. */
  userId: string;
  /** updated_at de la fila remota la última vez que local y remoto quedaron iguales. */
  remoteUpdatedAt: string | null;
  /** Momento en que local y remoto quedaron iguales. */
  syncedAt: string;
  /** Último cambio local (si es posterior a syncedAt, hay cambios por subir). */
  localUpdatedAt: string;
  /** finishedAt del último simulacro subido a `attempts`. */
  attemptsUploadedUntil?: string;
}

const time = (s: string | null | undefined) => {
  const t = s ? Date.parse(s) : NaN;
  return Number.isNaN(t) ? -Infinity : t;
};
const union = (a: string[], b: string[]) => Array.from(new Set([...a, ...b]));

/** ¿El progreso está vacío (nunca se usó la app en este navegador)? */
export function isEmptyProgress(p: UserProgress): boolean {
  return (
    p.completedLessons.length === 0 &&
    p.simulacroHistory.length === 0 &&
    p.simulacroScores.length === 0 &&
    Object.keys(p.missedQuestions).length === 0 &&
    AREA_IDS.every(a => (p.areaStats[a]?.answered ?? 0) === 0) &&
    !p.hasCompletedOnboarding &&
    p.favoriteLessons.length === 0 &&
    p.favoriteQuestions.length === 0
  );
}

/**
 * Fusiona el progreso local anónimo con el de la cuenta. Ambos representan actividad distinta,
 * así que los contadores se suman; lo que tiene identidad (lecciones, simulacros, insignias) se une.
 */
export function mergeProgress(
  localIn: UserProgress,
  remoteIn: UserProgress
): UserProgress {
  const local = normalizeProgress(localIn);
  const remote = normalizeProgress(remoteIn);

  // Lecciones: unión por lessonId; se conserva el mejor puntaje y XP y la fecha más reciente.
  const lessons = new Map(
    remote.completedLessons.map(l => [l.lessonId, { ...l }])
  );
  for (const l of local.completedLessons) {
    const r = lessons.get(l.lessonId);
    if (!r) {
      lessons.set(l.lessonId, { ...l });
      continue;
    }
    lessons.set(l.lessonId, {
      lessonId: l.lessonId,
      completed: r.completed || l.completed,
      score: Math.max(r.score, l.score),
      xpEarned: Math.max(r.xpEarned, l.xpEarned),
      completedAt:
        time(l.completedAt) > time(r.completedAt)
          ? l.completedAt
          : r.completedAt,
    });
  }
  const completedLessons = Array.from(lessons.values());

  // Respuestas por área: se suman (son respuestas distintas).
  const areaStats = { ...remote.areaStats };
  for (const a of AREA_IDS) {
    const r = remote.areaStats[a] ?? { answered: 0, correct: 0 };
    const l = local.areaStats[a] ?? { answered: 0, correct: 0 };
    areaStats[a] = {
      answered: r.answered + l.answered,
      correct: r.correct + l.correct,
    };
  }

  // Preguntas falladas: unión; se suman los fallos y queda la fecha más reciente.
  const missedQuestions = { ...remote.missedQuestions };
  for (const [id, m] of Object.entries(local.missedQuestions)) {
    const r = missedQuestions[id];
    missedQuestions[id] = r
      ? {
          misses: r.misses + m.misses,
          lastMissed:
            time(m.lastMissed) > time(r.lastMissed)
              ? m.lastMissed
              : r.lastMissed,
        }
      : { ...m };
  }

  // Simulacros: unión por id, en orden cronológico (máximo 50).
  const history = new Map(remote.simulacroHistory.map(r => [r.id, r]));
  const newLocalRecords = local.simulacroHistory.filter(
    r => !history.has(r.id)
  );
  for (const r of newLocalRecords) history.set(r.id, r);
  const simulacroHistory = Array.from(history.values())
    .sort((a, b) => time(a.finishedAt) - time(b.finishedAt))
    .slice(-50);
  // Porcentajes (lista simple): los de la cuenta + los locales anteriores al historial + los simulacros nuevos.
  const legacyLocal = local.simulacroScores.slice(
    0,
    Math.max(0, local.simulacroScores.length - local.simulacroHistory.length)
  );
  const simulacroScores = [
    ...remote.simulacroScores,
    ...legacyLocal,
    ...newLocalRecords.map(r => r.percent),
  ];

  // Racha: la del día de estudio más reciente (si es el mismo día, la mayor).
  const lt = time(local.lastStudyDate);
  const rt = time(remote.lastStudyDate);
  const day =
    lt > rt
      ? { streak: local.streak, lastStudyDate: local.lastStudyDate }
      : rt > lt
        ? { streak: remote.streak, lastStudyDate: remote.lastStudyDate }
        : {
            streak: Math.max(local.streak, remote.streak),
            lastStudyDate: remote.lastStudyDate || local.lastStudyDate,
          };

  // Meta personal: la de la cuenta si ya la tenía; si no, la local.
  const goalFrom =
    remote.hasCompletedOnboarding || !local.hasCompletedOnboarding
      ? remote
      : local;

  return {
    ...defaultProgress(),
    ...day,
    totalXp: completedLessons.reduce((s, l) => s + l.xpEarned, 0),
    completedLessons,
    areaStats,
    missedQuestions,
    simulacroHistory,
    simulacroScores,
    badges: union(remote.badges, local.badges),
    hasCompletedOnboarding: goalFrom.hasCompletedOnboarding,
    currentScore: goalFrom.currentScore,
    minimumScore: goalFrom.minimumScore,
    targetScore: goalFrom.targetScore,
    career: goalFrom.career,
    presentedExam: goalFrom.presentedExam ?? local.presentedExam,
    streakState:
      (local.streakState?.days?.length ?? 0) >= (remote.streakState?.days?.length ?? 0)
        ? local.streakState ?? remote.streakState
        : remote.streakState ?? local.streakState,
    favoriteLessons: union(remote.favoriteLessons, local.favoriteLessons),
    favoriteQuestions: union(remote.favoriteQuestions, local.favoriteQuestions),
  };
}

export type SyncDecision =
  /** Subir `doc` a la cuenta (y dejarlo también en local). */
  | { action: "push"; doc: UserProgress; reason: string }
  /** Reemplazar el progreso local por `doc` (el de la cuenta). */
  | { action: "pull"; doc: UserProgress; reason: string }
  /** Guardar `doc` (fusión) en local y subirlo. */
  | { action: "merge"; doc: UserProgress; reason: string }
  | { action: "none"; reason: string };

export interface SyncInput {
  userId: string;
  local: UserProgress;
  meta: SyncMeta | null;
  /** Fila remota (null si la cuenta aún no tiene progreso). */
  remote: { data: UserProgress; updatedAt: string } | null;
}

/** Decide qué hacer al iniciar sesión o al volver a la app. */
export function decideSync({
  userId,
  local,
  meta,
  remote,
}: SyncInput): SyncDecision {
  // Progreso local de otra cuenta: no se mezcla.
  if (meta && meta.userId !== userId) {
    return {
      action: "pull",
      doc: remote ? normalizeProgress(remote.data) : defaultProgress(),
      reason: "otra-cuenta",
    };
  }
  // Primer inicio de sesión en este navegador.
  if (!meta) {
    if (!remote) return { action: "push", doc: local, reason: "cuenta-nueva" };
    if (isEmptyProgress(local))
      return {
        action: "pull",
        doc: normalizeProgress(remote.data),
        reason: "local-vacio",
      };
    return {
      action: "merge",
      doc: mergeProgress(local, remote.data),
      reason: "primer-inicio",
    };
  }
  // Ya sincronizado con esta cuenta: gana el último que escribió.
  if (!remote) return { action: "push", doc: local, reason: "remoto-vacio" };
  const localDirty = time(meta.localUpdatedAt) > time(meta.syncedAt);
  const remoteChanged = time(remote.updatedAt) !== time(meta.remoteUpdatedAt);
  if (!localDirty && !remoteChanged)
    return { action: "none", reason: "al-dia" };
  if (localDirty && !remoteChanged)
    return { action: "push", doc: local, reason: "cambios-locales" };
  if (!localDirty && remoteChanged)
    return {
      action: "pull",
      doc: normalizeProgress(remote.data),
      reason: "cambios-remotos",
    };
  return time(meta.localUpdatedAt) > time(remote.updatedAt)
    ? { action: "push", doc: local, reason: "conflicto-gana-local" }
    : {
        action: "pull",
        doc: normalizeProgress(remote.data),
        reason: "conflicto-gana-remoto",
      };
}

/** Lee el estado de sincronización guardado (o null si no hay o está dañado). */
export function parseSyncMeta(raw: string | null): SyncMeta | null {
  if (!raw) return null;
  try {
    const m = JSON.parse(raw) as SyncMeta;
    return m &&
      typeof m.userId === "string" &&
      typeof m.syncedAt === "string" &&
      typeof m.localUpdatedAt === "string"
      ? m
      : null;
  } catch {
    return null;
  }
}
