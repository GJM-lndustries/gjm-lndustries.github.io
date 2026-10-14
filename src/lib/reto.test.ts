import { describe, expect, it } from "vitest";
import { nextLesson, recommendedArea } from "./reto";
import { emptyAreaStats } from "./score";

describe("reto de hoy", () => {
  it("recomienda el área que falló en la mini prueba (sin preferir inglés)", () => {
    const diagnostic = { answers: [
      { area: "matematicas" as const, correct: true }, { area: "lectura-critica" as const, correct: false },
      { area: "ciencias-naturales" as const, correct: true }, { area: "sociales-ciudadanas" as const, correct: true }, { area: "ingles" as const, correct: false },
    ] };
    expect(recommendedArea({ diagnostic, areaStats: emptyAreaStats(), completedLessonIds: [], daysDone: 0 })).toBe("lectura-critica");
  });
  it("con datos de práctica, va por la más floja", () => {
    const s = emptyAreaStats();
    s.matematicas = { answered: 10, correct: 9 };
    s["ciencias-naturales"] = { answered: 6, correct: 2 };
    expect(recommendedArea({ areaStats: s, completedLessonIds: [], daysDone: 0 })).toBe("ciencias-naturales");
  });
  it("siguiente lección sin terminar", () => {
    expect(nextLesson("matematicas", []).lesson.id).toBe("math-1");
    expect(nextLesson("matematicas", ["math-1"]).lesson.id).toBe("math-2");
  });
});
