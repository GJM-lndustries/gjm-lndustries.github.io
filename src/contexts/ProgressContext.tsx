import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { AreaId } from "@/data/questions/types";
import {
  emptyAreaStats,
  estimateScore,
  type AreaStats,
  type ScoreEstimate,
} from "@/lib/score";

const STORAGE_KEY = "proicfes_progress";

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
  favoriteLessons: string[];
  favoriteQuestions: string[];
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
    answers: { question: { id: string; area: AreaId }; correct: boolean }[]
  ) => void;
  /** Reemplaza todo el progreso (sincronización con la cuenta). */
  replaceProgress: (next: UserProgress) => void;
  recordAnswer: (
    question: { id: string; area: AreaId },
    correct: boolean
  ) => void;
  getLessonProgress: (lessonId: string) => LessonProgress | undefined;
  isLessonCompleted: (lessonId: string) => boolean;
  getModuleProgress: (moduleId: string, lessonIds: string[]) => number;
  resetProgress: () => void;
  completeOnboarding: (
    currentScore: number,
    minimumScore: number,
    targetScore: number,
    career: string
  ) => void;
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
  targetScore: 360,
  career: "",
  favoriteLessons: [],
  favoriteQuestions: [],
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
  };
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

function withStudyDay(
  prev: UserProgress
): Pick<UserProgress, "streak" | "lastStudyDate"> {
  const today = new Date().toDateString();
  if (prev.lastStudyDate === today)
    return { streak: prev.streak || 1, lastStudyDate: today };
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  return {
    streak: prev.lastStudyDate === yesterday ? prev.streak + 1 : 1,
    lastStudyDate: today,
  };
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
        const completedLessons = existing
          ? prev.completedLessons.map(l =>
              l.lessonId === lessonId
                ? {
                    ...l,
                    score: Math.max(l.score, score),
                    xpEarned: Math.max(l.xpEarned, xp),
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
                xpEarned: xp,
                completedAt: now,
              },
            ];
        const day = withStudyDay(prev);
        const badges = [...prev.badges];
        addBadge(badges, "primer_paso", completedLessons.length >= 1);
        addBadge(badges, "cinco_lecciones", completedLessons.length >= 5);
        addBadge(badges, "racha_3", day.streak >= 3);
        addBadge(badges, "perfecto", score === 100);
        return {
          ...prev,
          ...day,
          totalXp: completedLessons.reduce((sum, l) => sum + l.xpEarned, 0),
          completedLessons,
          badges,
        };
      });
    },
    []
  );

  const addSimulacroScore = useCallback((score: number) => {
    setProgress(prev => ({
      ...prev,
      ...withStudyDay(prev),
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
        for (const { question, correct } of answers) {
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
          ...withStudyDay(prev),
          areaStats,
          missedQuestions,
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
    (question: { id: string; area: AreaId }, correct: boolean) => {
      setProgress(prev => {
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
        return {
          ...prev,
          ...withStudyDay(prev),
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

  const completeOnboarding = useCallback(
    (
      currentScore: number,
      minimumScore: number,
      targetScore: number,
      career: string
    ) => {
      setProgress(prev => ({
        ...prev,
        hasCompletedOnboarding: true,
        currentScore,
        minimumScore,
        targetScore,
        career,
      }));
    },
    []
  );

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
