import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { AreaId, TrapType } from "@/data/questions/types";
import { getQuestion } from "@/data/questions";
import {
  emptyAreaStats,
  estimateScore,
  type AreaStats,
  type ScoreEstimate,
} from "@/lib/score";
import {
  addActiveMs,
  addChallengeQuestion,
  completeReading,
  defaultStreakState,
  rollStreakDay,
  streakBadges,
  useStreakFreeze as applyFreeze,
  type StreakState,
} from "@/lib/streaks";

import { grantXp, xpForAnswer, type XpDay } from "@/lib/xp";

const STORAGE_KEY = "proicfes_progress";

/** Respuestas del onboarding que personalizan el plan. Todo es opcional y editable en /meta. */
export interface StudyPlan {
  /** Rango de puntaje que cree que sacaría (o que sacó). */
  scoreRange: string;
  /** Cuándo presenta: "AAAA-03", "AAAA-08" o "nose". */
  examWindow: string;
  /** Minutos al día que se propone. */
  dailyMinutes: number;
  /** Intención de implementación: en qué momento del día va a estudiar. */
  studyMoment: string;
  /** Qué examen presenta (por defecto Saber 11). */
  examType?: ExamType;
}

export type ExamType = "saber11" | "presaber" | "validacion";

/** Resultado de la mini prueba de 5 preguntas (una por área). */
export interface DiagnosticResult {
  finishedAt: string; // ISO
  answers: { questionId: string; area: AreaId; correct: boolean }[];
  /** Punto de partida aproximado (0–500) y su rango. */
  estimate: number;
  low: number;
  high: number;
}

interface LessonProgress {
  lessonId: string;
  completed: boolean;
  score: number; // 0-100
  xpEarned: number;
  completedAt?: string;
}

export interface MissedQuestion {
  misses: number;
  lastMissed: string; // ISO
}

/** Resumen de un simulacro terminado (se guarda en el historial). */
export interface SimulacroRecord {
  /** Identificador estable del intento (para no registrarlo dos veces). */
  id: string;
  format: "corto" | "completo";
  finishedAt: string; // ISO
  /** Puntaje global estimado 0–500 (null si faltó alguna área). */
  global: number | null;
  percent: number;
  correct: number;
  total: number;
  /** Aciertos 0–100 por área. */
  perArea: Partial<Record<AreaId, number>>;
}

/** Suma 1 a la trampa de la opción elegida (si la tiene). */
/** Suma una respuesta a las estadísticas por competencia. */
export function addCompetencia(
  stats: UserProgress["competenciaStats"],
  question: { area: AreaId; competencia?: string },
  correct: boolean
): UserProgress["competenciaStats"] {
  if (!question.competencia) return stats;
  const key = `${question.area}|${question.competencia}`;
  const cur = stats?.[key] ?? { answered: 0, correct: 0 };
  return { ...stats, [key]: { answered: cur.answered + 1, correct: cur.correct + (correct ? 1 : 0) } };
}

function addTrap(stats: UserProgress["trapStats"], questionId: string, chosen?: string): UserProgress["trapStats"] {
  if (!chosen) return stats;
  const trap = getQuestion(questionId)?.options.find(o => o.id === chosen)?.trampa;
  if (!trap) return stats;
  return { ...stats, [trap]: (stats?.[trap] ?? 0) + 1 };
}

export interface UserProgress {
  totalXp: number;
  streak: number;
  lastStudyDate: string;
  completedLessons: LessonProgress[];
  simulacroScores: number[]; // % de aciertos de cada simulacro
  /** Historial de simulacros con puntaje por área (los más recientes al final). */
  simulacroHistory: SimulacroRecord[];
  badges: string[];
  /** Respuestas por área (lecciones, práctica y simulacro) para el puntaje estimado */
  areaStats: AreaStats;
  /** Preguntas falladas que deben volver a aparecer en la práctica */
  missedQuestions: Record<string, MissedQuestion>;
  // Meta personal (opcional, se define en /meta)
  hasCompletedOnboarding: boolean;
  currentScore: number;
  minimumScore: number;
  targetScore: number;
  career: string;
  /** true si el usuario indicó que ya presentó el Saber 11 */
  presentedExam: boolean;
  favoriteLessons: string[];
  favoriteQuestions: string[];
  /** Racha con reto diario (America/Bogota). */
  streakState: StreakState;
  /** XP de preguntas respondidas (las lecciones suman aparte en completedLessons). */
  practiceXp: number;
  /** XP ganado hoy, para el tope diario. */
  xpDay?: XpDay;
  plan?: StudyPlan;
  diagnostic?: DiagnosticResult;
  /** Día (YYYY-MM-DD) en que el estudiante cerró la invitación a crear cuenta. */
  accountPromptDismissed?: string;
  /** «Tus trampas más comunes»: cuántas veces cayó en cada tipo de trampa. */
  trapStats?: Partial<Record<TrapType, number>>;
  /** Aciertos por competencia, clave "area|competencia". Solo esto se agrega en «ProICFES para tu curso». */
  competenciaStats?: Record<string, { answered: number; correct: number }>;
}

interface ProgressContextType {
  progress: UserProgress;
  /** true cuando ya se leyó el progreso guardado en este navegador. */
  loaded: boolean;
  estimate: ScoreEstimate;
  completeLesson: (lessonId: string, score: number, xp: number) => void;
  addSimulacroScore: (score: number) => void;
  /** Registra un simulacro terminado y las respuestas dadas (una sola actualización). */
  recordSimulacro: (
    record: SimulacroRecord,
    answers: { question: { id: string; area: AreaId; competencia?: string }; correct: boolean; chosen?: string }[]
  ) => void;
  /** Reemplaza todo el progreso (sincronización con la cuenta). */
  replaceProgress: (next: UserProgress) => void;
  recordAnswer: (
    question: { id: string; area: AreaId; competencia?: string },
    correct: boolean,
    /** Opción elegida (para contar la trampa en la que cayó). */
    chosen?: string
  ) => void;
  getLessonProgress: (lessonId: string) => LessonProgress | undefined;
  isLessonCompleted: (lessonId: string) => boolean;
  getModuleProgress: (moduleId: string, lessonIds: string[]) => number;
  resetProgress: () => void;
  completeOnboarding: (
    currentScore: number,
    minimumScore: number,
    targetScore: number,
    career: string,
    presentedExam?: boolean
  ) => void;
  /** Suma tiempo activo al reto de hoy (lectura o práctica). */
  trackChallengeTime: (kind: "reading" | "answering", ms: number) => void;
  /** Cuenta una respuesta hacia el mínimo del reto. */
  trackChallengeQuestion: () => void;
  useStreakFreeze: () => { error?: string };
  acknowledgeStreakCelebration: () => void;
  savePlan: (plan: StudyPlan) => void;
  /** Terminó las tarjetas de una lección (con `cardsMs` activos en ellas). */
  trackReadingCards: (cardsMs: number) => void;
  saveDiagnostic: (d: DiagnosticResult) => void;
  setWeeklyGoal: (days: number) => void;
  dismissFreezeNotice: () => void;
  dismissAccountPrompt: () => void;
}

export const defaultProgress = (): UserProgress => ({
  totalXp: 0,
  streak: 0,
  lastStudyDate: "",
  completedLessons: [],
  simulacroScores: [],
  simulacroHistory: [],
  badges: [],
  areaStats: emptyAreaStats(),
  missedQuestions: {},
  hasCompletedOnboarding: false,
  currentScore: 0,
  minimumScore: 0,
  targetScore: 300,
  career: "",
  presentedExam: false,
  favoriteLessons: [],
  favoriteQuestions: [],
  streakState: defaultStreakState(),
  practiceXp: 0,
});

/** Carga el progreso guardado y completa campos que no existían en versiones anteriores. */
export function normalizeProgress(
  parsed: Partial<UserProgress> & { estimatedScore?: number }
): UserProgress {
  const base = defaultProgress();
  const p = { ...parsed };
  delete p.estimatedScore;
  return {
    ...base,
    ...p,
    areaStats: { ...base.areaStats, ...(p.areaStats ?? {}) },
    missedQuestions: p.missedQuestions ?? {},
    completedLessons: Array.isArray(p.completedLessons)
      ? p.completedLessons
      : [],
    simulacroScores: Array.isArray(p.simulacroScores) ? p.simulacroScores : [],
    simulacroHistory: Array.isArray(p.simulacroHistory)
      ? p.simulacroHistory
      : [],
    badges: Array.isArray(p.badges) ? p.badges : [],
    presentedExam: Boolean(p.presentedExam),
    practiceXp: typeof p.practiceXp === "number" ? p.practiceXp : 0,
    streakState: rollStreakDay(
      p.streakState && typeof p.streakState === "object"
        ? { ...defaultStreakState(), ...p.streakState, today: { ...defaultStreakState().today, ...(p.streakState as StreakState).today } }
        : migrateLegacyStreak(p as Partial<UserProgress>)
    ),
  };
}

function migrateLegacyStreak(p: Partial<UserProgress>): StreakState {
  const base = defaultStreakState();
  if (!p.streak || !p.lastStudyDate) return base;
  // No inventamos días pasados; solo conservamos el contador como longest hint.
  return { ...base, current: 0, longest: Math.max(base.longest, p.streak) };
}

function loadProgress(): UserProgress {
  if (typeof window === "undefined") return defaultProgress(); // prerender en Node: sin progreso guardado
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return defaultProgress();
    return normalizeProgress(JSON.parse(saved));
  } catch {
    return defaultProgress();
  }
}


function addBadge(badges: string[], id: string, condition: boolean) {
  if (condition && !badges.includes(id)) badges.push(id);
}

const ProgressContext = createContext<ProgressContextType | null>(null);

/**
 * `deferLoad`: al hidratar HTML prerenderizado, el primer render debe coincidir con el HTML
 * estático (progreso vacío); el progreso guardado se carga justo después de montar.
 */
export function ProgressProvider({
  children,
  deferLoad = false,
}: {
  children: React.ReactNode;
  deferLoad?: boolean;
}) {
  const [progress, setProgress] = useState<UserProgress>(() =>
    deferLoad ? defaultProgress() : loadProgress()
  );
  const [loaded, setLoaded] = useState(!deferLoad);

  useEffect(() => {
    if (loaded) return;
    setProgress(loadProgress());
    setLoaded(true);
  }, [loaded]);

  // Lo recién cargado no se vuelve a escribir: así una pestaña que cargó antes que otra
  // (o que no encontró nada) no pisa el progreso guardado sin que el usuario haya hecho nada.
  const skipFirstSave = useRef(true);
  useEffect(() => {
    if (!loaded) return; // no sobrescribir lo guardado antes de cargarlo
    if (skipFirstSave.current) {
      skipFirstSave.current = false;
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      /* almacenamiento lleno o bloqueado: seguimos sin guardar */
    }
  }, [progress, loaded]);

  const estimate = useMemo(
    () => estimateScore(progress.areaStats),
    [progress.areaStats]
  );

  const completeLesson = useCallback(
    (lessonId: string, score: number, xp: number) => {
      setProgress(prev => {
        const existing = prev.completedLessons.find(
          l => l.lessonId === lessonId
        );
        const now = new Date().toISOString();
        // Solo suma la parte del XP de la lección que no se había ganado, y con el tope diario.
        const { granted, day: xpDay } = grantXp(prev.xpDay, Math.max(0, xp - (existing?.xpEarned ?? 0)));
        const completedLessons = existing
          ? prev.completedLessons.map(l =>
              l.lessonId === lessonId
                ? {
                    ...l,
                    score: Math.max(l.score, score),
                    xpEarned: l.xpEarned + granted,
                    completedAt: now,
                  }
                : l
            )
          : [
              ...prev.completedLessons,
              {
                lessonId,
                completed: true,
                score,
                xpEarned: granted,
                completedAt: now,
              },
            ];
        const badges = [...prev.badges];
        addBadge(badges, "primer_paso", completedLessons.length >= 1);
        addBadge(badges, "cinco_lecciones", completedLessons.length >= 5);
        addBadge(badges, "perfecto", score === 100);
        for (const id of streakBadges(prev.streakState.longest, prev.streakState.current)) {
          addBadge(badges, id, true);
        }
        return {
          ...prev,
          totalXp: completedLessons.reduce((sum, l) => sum + l.xpEarned, 0) + (prev.practiceXp ?? 0),
          completedLessons,
          badges,
          xpDay,
        };
      });
    },
    []
  );

  const addSimulacroScore = useCallback((score: number) => {
    setProgress(prev => ({
      ...prev,
      simulacroScores: [...prev.simulacroScores, score],
    }));
  }, []);

  const recordSimulacro = useCallback<ProgressContextType["recordSimulacro"]>(
    (record, answers) => {
      setProgress(prev => {
        if (prev.simulacroHistory.some(r => r.id === record.id)) return prev;
        const areaStats = { ...prev.areaStats };
        const missedQuestions = { ...prev.missedQuestions };
        const now = new Date().toISOString();
        let trapStats = prev.trapStats;
        let competenciaStats = prev.competenciaStats;
        for (const { question, correct, chosen } of answers) {
          if (!correct) trapStats = addTrap(trapStats, question.id, chosen);
          competenciaStats = addCompetencia(competenciaStats, question, correct);
          const stat = areaStats[question.area] ?? { answered: 0, correct: 0 };
          areaStats[question.area] = {
            answered: stat.answered + 1,
            correct: stat.correct + (correct ? 1 : 0),
          };
          if (correct) delete missedQuestions[question.id];
          else
            missedQuestions[question.id] = {
              misses: (missedQuestions[question.id]?.misses ?? 0) + 1,
              lastMissed: now,
            };
        }
        return {
          ...prev,
          areaStats,
          missedQuestions,
          trapStats,
          competenciaStats,
          simulacroScores: [...prev.simulacroScores, record.percent],
          simulacroHistory: [...prev.simulacroHistory, record].slice(-50),
        };
      });
    },
    []
  );

  const replaceProgress = useCallback(
    (next: UserProgress) => setProgress(normalizeProgress(next)),
    []
  );

  const recordAnswer = useCallback(
    (question: { id: string; area: AreaId; competencia?: string }, correct: boolean, chosen?: string) => {
      setProgress(prev => {
        const trapStats = correct ? prev.trapStats : addTrap(prev.trapStats, question.id, chosen);
        const stat = prev.areaStats[question.area] ?? {
          answered: 0,
          correct: 0,
        };
        const missedQuestions = { ...prev.missedQuestions };
        if (correct) {
          delete missedQuestions[question.id];
        } else {
          const m = missedQuestions[question.id];
          missedQuestions[question.id] = {
            misses: (m?.misses ?? 0) + 1,
            lastMissed: new Date().toISOString(),
          };
        }
        const { granted, day: xpDay } = grantXp(prev.xpDay, xpForAnswer(correct));
        const badges = [...prev.badges];
        const totalXp = prev.totalXp + granted;
        addBadge(badges, "xp_500", totalXp >= 500);
        return {
          ...prev,
          practiceXp: (prev.practiceXp ?? 0) + granted,
          totalXp,
          trapStats,
          competenciaStats: addCompetencia(prev.competenciaStats, question, correct),
          xpDay,
          badges,
          areaStats: {
            ...prev.areaStats,
            [question.area]: {
              answered: stat.answered + 1,
              correct: stat.correct + (correct ? 1 : 0),
            },
          },
          missedQuestions,
        };
      });
    },
    []
  );

  const getLessonProgress = useCallback(
    (lessonId: string) =>
      progress.completedLessons.find(l => l.lessonId === lessonId),
    [progress.completedLessons]
  );

  const isLessonCompleted = useCallback(
    (lessonId: string) =>
      progress.completedLessons.some(
        l => l.lessonId === lessonId && l.completed
      ),
    [progress.completedLessons]
  );

  const getModuleProgress = useCallback(
    (_moduleId: string, lessonIds: string[]) => {
      if (lessonIds.length === 0) return 0;
      const done = lessonIds.filter(id =>
        progress.completedLessons.some(l => l.lessonId === id && l.completed)
      );
      return Math.round((done.length / lessonIds.length) * 100);
    },
    [progress.completedLessons]
  );

  const resetProgress = useCallback(() => {
    setProgress(defaultProgress());
  }, []);

  const savePlan = useCallback((plan: StudyPlan) => {
    setProgress(prev => ({ ...prev, plan }));
  }, []);

  const saveDiagnostic = useCallback((d: DiagnosticResult) => {
    setProgress(prev => ({ ...prev, diagnostic: d }));
  }, []);

  const setWeeklyGoal = useCallback((days: number) => {
    setProgress(prev => ({ ...prev, streakState: { ...prev.streakState, weeklyGoal: days } }));
  }, []);

  const dismissFreezeNotice = useCallback(() => {
    setProgress(prev => ({ ...prev, streakState: { ...prev.streakState, freezeNotice: null } }));
  }, []);

  const dismissAccountPrompt = useCallback(() => {
    setProgress(prev => ({ ...prev, accountPromptDismissed: new Date().toISOString().slice(0, 10) }));
  }, []);

  const completeOnboarding = useCallback(
    (
      currentScore: number,
      minimumScore: number,
      targetScore: number,
      career: string,
      presentedExam = false
    ) => {
      setProgress(prev => ({
        ...prev,
        hasCompletedOnboarding: true,
        currentScore,
        minimumScore,
        targetScore,
        career,
        presentedExam,
      }));
    },
    []
  );

  const syncStreakFields = (prev: UserProgress, streakState: StreakState): UserProgress => {
    const badges = [...prev.badges];
    for (const id of streakBadges(streakState.longest, streakState.current)) addBadge(badges, id, true);
    return {
      ...prev,
      streakState,
      streak: streakState.current,
      lastStudyDate: streakState.today.completed ? streakState.today.date : prev.lastStudyDate,
      badges,
    };
  };

  const trackChallengeTime = useCallback((kind: "reading" | "answering", ms: number) => {
    setProgress(prev => syncStreakFields(prev, addActiveMs(prev.streakState, kind, ms)));
  }, []);

  const trackReadingCards = useCallback((cardsMs: number) => {
    setProgress(prev => syncStreakFields(prev, completeReading(prev.streakState, cardsMs)));
  }, []);

  const trackChallengeQuestion = useCallback(() => {
    setProgress(prev => syncStreakFields(prev, addChallengeQuestion(prev.streakState)));
  }, []);

  const useStreakFreeze = useCallback(() => {
    let error: string | undefined;
    setProgress(prev => {
      const res = applyFreeze(prev.streakState);
      if ("error" in res) {
        error = res.error;
        return prev;
      }
      return syncStreakFields(prev, res);
    });
    return { error };
  }, []);

  const acknowledgeStreakCelebration = useCallback(() => {
    setProgress(prev => ({
      ...prev,
      streakState: {
        ...prev.streakState,
        today: { ...prev.streakState.today, celebrated: true },
      },
    }));
  }, []);

  return (
    <ProgressContext.Provider
      value={{
        progress,
        loaded,
        estimate,
        completeLesson,
        addSimulacroScore,
        recordSimulacro,
        replaceProgress,
        recordAnswer,
        getLessonProgress,
        isLessonCompleted,
        getModuleProgress,
        resetProgress,
        completeOnboarding,
        trackChallengeTime,
        trackChallengeQuestion,
        useStreakFreeze,
        acknowledgeStreakCelebration,
        savePlan,
        trackReadingCards,
        saveDiagnostic,
        setWeeklyGoal,
        dismissFreezeNotice,
        dismissAccountPrompt,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used within ProgressProvider");
  return ctx;
}
