import { describe, expect, it } from "vitest";
import { CODE_RE, DEMO_SUMMARY, normalizeCode, validAlias, weakest } from "./curso";

describe("curso", () => {
  it("normaliza el código", () => {
    expect(normalizeCode(" ab-c2 3d9")).toBe("ABC23D");
    expect(CODE_RE.test("ABC23D")).toBe(true);
    expect(CODE_RE.test("ABCO1D")).toBe(false);
  });
  it("valida el alias", () => {
    expect(validAlias(" a ")).toBe(false);
    expect(validAlias("Ana")).toBe(true);
    expect(validAlias("x".repeat(31))).toBe(false);
  });
  it("ordena las competencias más débiles e ignora las de pocas respuestas", () => {
    const w = weakest([...DEMO_SUMMARY.rows, { area: "ingles", competencia: "Vocabulario", students: 5, answered: 10, correct: 0, pct: 0 }], 3);
    expect(w.map(r => r.pct)).toEqual([41, 45, 50]);
  });
});
