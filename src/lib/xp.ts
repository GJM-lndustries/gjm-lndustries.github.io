/**
 * Experiencia (XP) con tope diario. El tope es visible para el estudiante: cuando lo
 * alcanza, la app le dice que ya ganó lo de hoy en vez de empujarlo a seguir.
 */
import { bogotaDateString } from "./streaks";

export const XP_CORRECT = 10;
export const XP_ATTEMPT = 3;
export const DAILY_XP_CAP = 150;

export interface XpDay {
  date: string;
  earned: number;
}

export function xpForAnswer(correct: boolean): number {
  return correct ? XP_CORRECT : XP_ATTEMPT;
}

/** Cuánto XP de `amount` cabe hoy y cómo queda el contador del día. */
export function grantXp(day: XpDay | undefined, amount: number, now: Date = new Date()): { granted: number; day: XpDay } {
  const today = bogotaDateString(now);
  const earned = day && day.date === today ? day.earned : 0;
  const granted = Math.max(0, Math.min(amount, DAILY_XP_CAP - earned));
  return { granted, day: { date: today, earned: earned + granted } };
}

export function xpToday(day: XpDay | undefined, now: Date = new Date()): number {
  return day && day.date === bogotaDateString(now) ? day.earned : 0;
}
