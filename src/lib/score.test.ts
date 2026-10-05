import { describe, expect, it } from "vitest";
import { emptyAreaStats, estimateScore, weightedGlobalScore } from "./score";

describe("puntaje global estimado (ponderación Saber 11)", () => {
  it("100 en todas las áreas da 500 y 0 da 0", () => {
    const all = (v: number) => ({
      matematicas: v,
      "lectura-critica": v,
      "ciencias-naturales": v,
      "sociales-ciudadanas": v,
      ingles: v,
    });
    expect(weightedGlobalScore(all(100))).toBe(500);
    expect(weightedGlobalScore(all(0))).toBe(0);
  });

  it("aplica pesos 3-3-3-3-1 sobre 13 y escala ×5", () => {
    // (3·60 + 3·50 + 3·40 + 3·70 + 1·80) / 13 × 5 = 284,6 → 285
    expect(
      weightedGlobalScore({
        "lectura-critica": 60,
        matematicas: 50,
        "sociales-ciudadanas": 40,
        "ciencias-naturales": 70,
        ingles: 80,
      })
    ).toBe(285);
  });

  it("Inglés pesa menos que las demás áreas", () => {
    const base = { matematicas: 50, "lectura-critica": 50, "ciencias-naturales": 50, "sociales-ciudadanas": 50, ingles: 50 };
    const masIngles = weightedGlobalScore({ ...base, ingles: 100 })!;
    const masMate = weightedGlobalScore({ ...base, matematicas: 100 })!;
    expect(masMate).toBeGreaterThan(masIngles);
  });

  it("no muestra puntaje (null) mientras falten áreas", () => {
    const stats = emptyAreaStats();
    expect(estimateScore(stats).global).toBeNull();
    stats.matematicas = { answered: 10, correct: 7 };
    const e = estimateScore(stats);
    expect(e.global).toBeNull();
    expect(e.perArea.matematicas).toBe(70);
    expect(e.missingAreas).toHaveLength(4);
  });

  it("calcula el estimado cuando todas las áreas tienen datos", () => {
    const stats = emptyAreaStats();
    for (const k of Object.keys(stats) as (keyof typeof stats)[]) stats[k] = { answered: 4, correct: 2 };
    expect(estimateScore(stats).global).toBe(250);
  });
});
