import { describe, expect, it } from "vitest";
import {
  ANSWERING_GOAL_MS,
  MIN_QUESTIONS_FOR_STREAK,
  READING_GOAL_MS,
  addActiveMs,
  addChallengeQuestion,
  bogotaDateString,
  defaultStreakState,
  daysBetween,
  formatMs,
  streakBadges,
  weekCalendar,
  useStreakFreeze,
} from "./streaks";

// helper exported via completing both parts
function completeToday(base = defaultStreakState(new Date("2026-10-05T18:00:00-05:00"))) {
  let s = addActiveMs(base, "reading", READING_GOAL_MS, new Date("2026-10-05T18:00:00-05:00"));
  s = addActiveMs(s, "answering", ANSWERING_GOAL_MS, new Date("2026-10-05T18:00:00-05:00"));
  for (let i = 0; i < MIN_QUESTIONS_FOR_STREAK; i++) {
    s = addChallengeQuestion(s, new Date("2026-10-05T18:00:00-05:00"));
  }
  return s;
}

describe("streaks", () => {
  it("formatea fechas en America/Bogota", () => {
    // 05 Oct 2026 23:30 UTC = 18:30 Bogota same day; 05:00 UTC = Oct 4 evening Bogota
    expect(bogotaDateString(new Date("2026-10-05T18:00:00-05:00"))).toBe("2026-10-05");
    expect(daysBetween("2026-10-04", "2026-10-05")).toBe(1);
    expect(formatMs(125000)).toBe("2:05");
  });

  it("no marca el día hasta lectura + práctica + preguntas", () => {
    const now = new Date("2026-10-05T18:00:00-05:00");
    let s = defaultStreakState(now);
    s = addActiveMs(s, "reading", READING_GOAL_MS, now);
    expect(s.today.readingDone).toBe(true);
    expect(s.today.completed).toBe(false);
    s = addActiveMs(s, "answering", ANSWERING_GOAL_MS, now);
    expect(s.today.answeringDone).toBe(false); // faltan preguntas
    for (let i = 0; i < MIN_QUESTIONS_FOR_STREAK; i++) s = addChallengeQuestion(s, now);
    expect(s.today.completed).toBe(true);
    expect(s.current).toBe(1);
    expect(s.days).toContain("2026-10-05");
  });

  it("alarga la racha si ayer también contó", () => {
    const d1 = new Date("2026-10-05T18:00:00-05:00");
    let s = completeToday(defaultStreakState(d1));
    expect(s.current).toBe(1);
    const d2 = new Date("2026-10-06T18:00:00-05:00");
    s = { ...s, today: { ...s.today, date: "2026-10-05" } }; // force roll
    s = addActiveMs(s, "reading", READING_GOAL_MS, d2);
    s = addActiveMs(s, "answering", ANSWERING_GOAL_MS, d2);
    for (let i = 0; i < MIN_QUESTIONS_FOR_STREAK; i++) s = addChallengeQuestion(s, d2);
    expect(s.today.date).toBe("2026-10-06");
    expect(s.current).toBe(2);
    expect(s.longest).toBe(2);
  });

  it("insignias 3/7/30", () => {
    expect(streakBadges(3, 3)).toEqual(expect.arrayContaining(["racha_3"]));
    expect(streakBadges(7, 2)).toEqual(expect.arrayContaining(["racha_3", "racha_7"]));
    expect(streakBadges(30, 1)).toEqual(expect.arrayContaining(["racha_30"]));
  });

  it("congelamiento cubre un día faltante", () => {
    const now = new Date("2026-10-07T12:00:00-05:00");
    // Completó el 5, saltó el 6, ahora es 7
    let s = completeToday(defaultStreakState(new Date("2026-10-05T12:00:00-05:00")));
    s = { ...s, current: 1, days: ["2026-10-05"], today: { ...s.today, date: "2026-10-05", completed: true } };
    s = addActiveMs(s, "reading", 0, now); // roll to 7
    expect(s.today.date).toBe("2026-10-07");
    const frozen = useStreakFreeze(s, now);
    expect("error" in frozen).toBe(false);
    if (!("error" in frozen)) {
      expect(frozen.days).toContain("2026-10-06");
      expect(frozen.freezesAvailable).toBe(0);
    }
  });

  it("la semana usa las iniciales de Colombia: L, M, Mi, J, V, S, D", () => {
    const labels = weekCalendar(defaultStreakState(new Date("2026-10-08T15:00:00Z")), new Date("2026-10-08T15:00:00Z")).map(d => d.label);
    expect(labels).toEqual(["L", "M", "Mi", "J", "V", "S", "D"]);
  });
});
