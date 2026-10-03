import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { AreaId } from "@/data/questions/types";
import { emptyAreaStats, estimateScore, type AreaStats, type ScoreEstimate } from "@/lib/score";

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

export interface UserProgress {
  totalXp: number;
  streak: number;
  lastStudyDate: string;
  completedLessons: LessonProgress[];
  simulacroScores: number[]; // % de aciertos de cada simulacro
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
  estimate: ScoreEstimate;
  completeLesson: (lessonId: string, score: number, xp: number) => void;
  addSimulacroScore: (score: number) => void;
  recordAnswer: (question: { id: string; area: AreaId }, correct: boolean) => void;
  getLessonProgress: (lessonId: string) => LessonProgress | undefined;
  isLessonCompleted: (lessonId: string) => boolean;
  getModuleProgress: (moduleId: string, lessonIds: string[]) => number;
  resetProgress: () => void;
  completeOnboarding: (currentScore: number, minimumScore: number, targetScore: number, career: string) => void;
}

const defaultProgress = (): UserProgress => ({
  totalXp: 0,
  streak: 0,
  lastStudyDate: "",
  completedLessons: [],
  simulacroScores: [],
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
function loadProgress(): UserProgress {
  const base = defaultProgress();
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return base;
    const parsed = JSON.parse(saved) as Partial<UserProgress> & { estimatedScore?: number };
    delete parsed.estimatedScore; // el estimado anterior no era confiable; ahora se calcula
    return {
      ...base,
      ...parsed,
      areaStats: { ...base.areaStats, ...(parsed.areaStats ?? {}) },
      missedQuestions: parsed.missedQuestions ?? {},
      completedLessons: Array.isArray(parsed.completedLessons) ? parsed.completedLessons : [],
      simulacroScores: Array.isArray(parsed.simulacroScores) ? parsed.simulacroScores : [],
      badges: Array.isArray(parsed.badges) ? parsed.badges : [],
    };
  } catch {
    return base;
  }
}

function withStudyDay(prev: UserProgress): Pick<UserProgress, "streak" | "lastStudyDate"> {
  const today = new Date().toDateString();
  if (prev.lastStudyDate === today) return { streak: prev.streak || 1, lastStudyDate: today };
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  return { streak: prev.lastStudyDate === yesterday ? prev.streak + 1 : 1, lastStudyDate: today };
}

function addBadge(badges: string[], id: string, condition: boolean) {
  if (condition && !badges.includes(id)) badges.push(id);
}

const ProgressContext = createContext<ProgressContextType | null>(null);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState<UserProgress>(loadProgress);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      /* almacenamiento lleno o bloqueado: seguimos sin guardar */
    }
  }, [progress]);

  const estimate = useMemo(() => estimateScore(progress.areaStats), [progress.areaStats]);

  const completeLesson = useCallback((lessonId: string, score: number, xp: number) => {
    setProgress(prev => {
      const existing = prev.completedLessons.find(l => l.lessonId === lessonId);
      const now = new Date().toISOString();
      const completedLessons = existing
        ? prev.completedLessons.map(l =>
            l.lessonId === lessonId
              ? { ...l, score: Math.max(l.score, score), xpEarned: Math.max(l.xpEarned, xp), completedAt: now }
              : l
          )
        : [...prev.completedLessons, { lessonId, completed: true, score, xpEarned: xp, completedAt: now }];
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
  }, []);

  const addSimulacroScore = useCallback((score: number) => {
    setProgress(prev => ({ ...prev, ...withStudyDay(prev), simulacroScores: [...prev.simulacroScores, score] }));
  }, []);

  const recordAnswer = useCallback((question: { id: string; area: AreaId }, correct: boolean) => {
    setProgress(prev => {
      const stat = prev.areaStats[question.area] ?? { answered: 0, correct: 0 };
      const missedQuestions = { ...prev.missedQuestions };
      if (correct) {
        delete missedQuestions[question.id];
      } else {
        const m = missedQuestions[question.id];
        missedQuestions[question.id] = { misses: (m?.misses ?? 0) + 1, lastMissed: new Date().toISOString() };
      }
      return {
        ...prev,
        ...withStudyDay(prev),
        areaStats: {
          ...prev.areaStats,
          [question.area]: { answered: stat.answered + 1, correct: stat.correct + (correct ? 1 : 0) },
        },
        missedQuestions,
      };
    });
  }, []);

  const getLessonProgress = useCallback(
    (lessonId: string) => progress.completedLessons.find(l => l.lessonId === lessonId),
    [progress.completedLessons]
  );

  const isLessonCompleted = useCallback(
    (lessonId: string) => progress.completedLessons.some(l => l.lessonId === lessonId && l.completed),
    [progress.completedLessons]
  );

  const getModuleProgress = useCallback(
    (_moduleId: string, lessonIds: string[]) => {
      if (lessonIds.length === 0) return 0;
      const done = lessonIds.filter(id => progress.completedLessons.some(l => l.lessonId === id && l.completed));
      return Math.round((done.length / lessonIds.length) * 100);
    },
    [progress.completedLessons]
  );

  const resetProgress = useCallback(() => {
    setProgress(defaultProgress());
  }, []);

  const completeOnboarding = useCallback(
    (currentScore: number, minimumScore: number, targetScore: number, career: string) => {
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
        estimate,
        completeLesson,
        addSimulacroScore,
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
