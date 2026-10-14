import { describe, expect, it } from "vitest";
import { DAILY_XP_CAP, grantXp, xpForAnswer, xpToday } from "./xp";

const now = new Date("2026-10-14T15:00:00-05:00");
describe("xp", () => {
  it("da más por acertar, pero también premia el intento", () => {
    expect(xpForAnswer(true)).toBeGreaterThan(xpForAnswer(false));
    expect(xpForAnswer(false)).toBeGreaterThan(0);
  });
  it("respeta el tope diario y se reinicia al día siguiente", () => {
    let r = grantXp(undefined, 100, now);
    expect(r.granted).toBe(100);
    r = grantXp(r.day, 100, now);
    expect(r.granted).toBe(DAILY_XP_CAP - 100);
    expect(xpToday(r.day, now)).toBe(DAILY_XP_CAP);
    expect(grantXp(r.day, 10, now).granted).toBe(0);
    const tomorrow = new Date("2026-10-15T08:00:00-05:00");
    expect(grantXp(r.day, 10, tomorrow).granted).toBe(10);
    expect(xpToday(r.day, tomorrow)).toBe(0);
  });
});
