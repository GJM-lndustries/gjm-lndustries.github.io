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
  rollStreakDay,
  completeReading,
  weekProgress,
  DEFAULT_WEEKLY_GOAL,
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

  it("congelamiento cubre un día faltante (automático al volver)", () => {
    const now = new Date("2026-10-07T12:00:00-05:00");
    // Completó el 5, saltó el 6, ahora es 7
    let s = completeToday(defaultStreakState(new Date("2026-10-05T12:00:00-05:00")));
    s = { ...s, current: 1, days: ["2026-10-05"], today: { ...s.today, date: "2026-10-05", completed: true } };
    s = addActiveMs(s, "reading", 0, now); // roll to 7
    expect(s.today.date).toBe("2026-10-07");
    expect(s.days).toContain("2026-10-06");
    expect(s.current).toBe(1);
    expect(s.freezesAvailable).toBe(0);
    // ya no hace falta usarlo a mano
    expect("error" in useStreakFreeze(s, now)).toBe(true);
  });

  it("la semana usa las iniciales de Colombia: L, M, Mi, J, V, S, D", () => {
    const labels = weekCalendar(defaultStreakState(new Date("2026-10-08T15:00:00Z")), new Date("2026-10-08T15:00:00Z")).map(d => d.label);
    expect(labels).toEqual(["L", "M", "Mi", "J", "V", "S", "D"]);
  });
});

describe("semana flexible y comodín automático", () => {
  const at = (d: string) => new Date(`${d}T12:00:00-05:00`);
  function doneOn(s: ReturnType<typeof defaultStreakState>, d: string) {
    let x = addActiveMs(s, "reading", READING_GOAL_MS, at(d));
    x = addActiveMs(x, "answering", ANSWERING_GOAL_MS, at(d));
    for (let i = 0; i < MIN_QUESTIONS_FOR_STREAK; i++) x = addChallengeQuestion(x, at(d));
    return x;
  }

  it("marca hoy según la fecha real, no la del prerender", () => {
    const s = defaultStreakState(at("2026-10-12"));
    const wed = weekCalendar(s, at("2026-10-14"));
    expect(wed.map(d => d.label)).toEqual(["L", "M", "Mi", "J", "V", "S", "D"]);
    expect(wed.find(d => d.isToday)?.label).toBe("Mi");
    expect(weekCalendar(s, at("2026-10-18")).find(d => d.isToday)?.label).toBe("D");
    expect(weekCalendar(s, null).some(d => d.isToday)).toBe(false);
  });

  it("el comodín cubre solo un día faltante, una vez por semana, y avisa", () => {
    let s = doneOn(defaultStreakState(at("2026-10-12")), "2026-10-12");
    s = doneOn(s, "2026-10-13");
    expect(s.current).toBe(2);
    // falta el 14; el 15 entra: el comodín cubre el 14
    s = rollStreakDay(s, at("2026-10-15"));
    expect(s.current).toBe(2);
    expect(s.frozenDays).toEqual(["2026-10-14"]);
    expect(s.freezeNotice).toBe("2026-10-14");
    s = doneOn(s, "2026-10-15");
    expect(s.current).toBe(3);
    const wk = weekCalendar(s, at("2026-10-15"));
    expect(wk.find(d => d.date === "2026-10-14")).toMatchObject({ frozen: true, done: false });
    // otro hueco la misma semana: ya no hay comodín
    s = rollStreakDay(s, at("2026-10-17"));
    expect(s.current).toBe(0);
  });

  it("dos días seguidos sin estudiar reinician la racha", () => {
    let s = doneOn(defaultStreakState(at("2026-10-12")), "2026-10-12");
    s = rollStreakDay(s, at("2026-10-15"));
    expect(s.current).toBe(0);
    expect(s.frozenDays ?? []).toEqual([]);
  });

  it("cuenta los días de la semana frente a la meta flexible", () => {
    let s = doneOn(defaultStreakState(at("2026-10-12")), "2026-10-12");
    s = doneOn(s, "2026-10-14");
    expect(weekProgress(s, at("2026-10-14"))).toEqual({ done: 2, goal: DEFAULT_WEEKLY_GOAL, met: false });
    expect(weekProgress({ ...s, weeklyGoal: 2 }, at("2026-10-14")).met).toBe(true);
    // la semana siguiente empieza en cero
    expect(weekProgress(rollStreakDay(s, at("2026-10-19")), at("2026-10-19")).done).toBe(0);
  });
});

describe("lectura por tarjetas", () => {
  it("terminar las tarjetas cuenta como lectura si no se saltaron", () => {
    const now = new Date("2026-10-14T12:00:00-05:00");
    const s = defaultStreakState(now);
    expect(completeReading(s, 10_000, now).today.readingDone).toBe(false);
    expect(completeReading(s, 50_000, now).today.readingDone).toBe(true);
  });
});
