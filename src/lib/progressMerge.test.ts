import { describe, expect, it } from "vitest";
import {
  defaultProgress,
  type SimulacroRecord,
  type UserProgress,
} from "@/contexts/ProgressContext";
import {
  decideSync,
  isEmptyProgress,
  mergeProgress,
  parseSyncMeta,
  type SyncMeta,
} from "./progressMerge";

const p = (patch: Partial<UserProgress>): UserProgress => ({
  ...defaultProgress(),
  ...patch,
});
const rec = (
  id: string,
  finishedAt: string,
  percent = 50
): SimulacroRecord => ({
  id,
  format: "corto",
  finishedAt,
  global: 250,
  percent,
  correct: 10,
  total: 25,
  perArea: { matematicas: 50 },
});

describe("mergeProgress (primer inicio de sesión)", () => {
  const local = p({
    completedLessons: [
      {
        lessonId: "math-1",
        completed: true,
        score: 60,
        xpEarned: 30,
        completedAt: "2026-10-01T10:00:00Z",
      },
      {
        lessonId: "read-1",
        completed: true,
        score: 100,
        xpEarned: 50,
        completedAt: "2026-10-02T10:00:00Z",
      },
    ],
    totalXp: 80,
    areaStats: {
      ...defaultProgress().areaStats,
      matematicas: { answered: 10, correct: 6 },
      ingles: { answered: 4, correct: 1 },
    },
    missedQuestions: {
      "mat-001": { misses: 1, lastMissed: "2026-10-03T00:00:00Z" },
      "lc-002": { misses: 2, lastMissed: "2026-10-01T00:00:00Z" },
    },
    simulacroScores: [40, 60],
    simulacroHistory: [rec("b", "2026-10-03T12:00:00Z", 60)],
    badges: ["primer_paso", "perfecto"],
    streak: 2,
    lastStudyDate: "Sat Oct 03 2026",
    favoriteQuestions: ["q1"],
  });
  const remote = p({
    completedLessons: [
      {
        lessonId: "math-1",
        completed: true,
        score: 90,
        xpEarned: 45,
        completedAt: "2026-09-20T10:00:00Z",
      },
    ],
    totalXp: 45,
    areaStats: {
      ...defaultProgress().areaStats,
      matematicas: { answered: 5, correct: 5 },
    },
    missedQuestions: {
      "mat-001": { misses: 3, lastMissed: "2026-09-01T00:00:00Z" },
    },
    simulacroScores: [70],
    simulacroHistory: [rec("a", "2026-09-25T12:00:00Z", 70)],
    badges: ["primer_paso", "racha_3"],
    streak: 5,
    lastStudyDate: "Fri Sep 25 2026",
    hasCompletedOnboarding: true,
    targetScore: 400,
    career: "Medicina",
    favoriteQuestions: ["q2"],
  });
  const m = mergeProgress(local, remote);

  it("une lecciones por id con el mejor puntaje y XP, y recalcula el XP total sin duplicar", () => {
    expect(m.completedLessons).toHaveLength(2);
    const math = m.completedLessons.find(l => l.lessonId === "math-1")!;
    expect(math.score).toBe(90);
    expect(math.xpEarned).toBe(45);
    expect(math.completedAt).toBe("2026-10-01T10:00:00Z");
    expect(m.totalXp).toBe(45 + 50);
  });

  it("suma las respuestas por área", () => {
    expect(m.areaStats.matematicas).toEqual({ answered: 15, correct: 11 });
    expect(m.areaStats.ingles).toEqual({ answered: 4, correct: 1 });
    expect(m.areaStats["lectura-critica"]).toEqual({ answered: 0, correct: 0 });
  });

  it("une las preguntas falladas sumando fallos y con la fecha más reciente", () => {
    expect(m.missedQuestions["mat-001"]).toEqual({
      misses: 4,
      lastMissed: "2026-10-03T00:00:00Z",
    });
    expect(m.missedQuestions["lc-002"].misses).toBe(2);
  });

  it("une el historial de simulacros en orden cronológico y conserva los porcentajes", () => {
    expect(m.simulacroHistory.map(r => r.id)).toEqual(["a", "b"]);
    // 70 (cuenta) + 40 (local, anterior al historial) + 60 (simulacro local nuevo)
    expect(m.simulacroScores).toEqual([70, 40, 60]);
  });

  it("no duplica un simulacro que ya estaba en la cuenta", () => {
    const again = mergeProgress(local, m);
    expect(again.simulacroHistory.map(r => r.id)).toEqual(["a", "b"]);
    expect(again.simulacroScores).toEqual([70, 40, 60, 40]); // solo el porcentaje antiguo, sin identificador
  });

  it("une insignias y favoritos sin repetir", () => {
    expect(m.badges.sort()).toEqual(["perfecto", "primer_paso", "racha_3"]);
    expect(m.favoriteQuestions.sort()).toEqual(["q1", "q2"]);
  });

  it("toma la racha del día de estudio más reciente", () => {
    expect(m.lastStudyDate).toBe("Sat Oct 03 2026");
    expect(m.streak).toBe(2);
    const sameDay = mergeProgress(
      p({ streak: 1, lastStudyDate: "Sat Oct 03 2026" }),
      p({ streak: 4, lastStudyDate: "Sat Oct 03 2026" })
    );
    expect(sameDay.streak).toBe(4);
  });

  it("conserva la meta de la cuenta; si la cuenta no tenía, usa la local", () => {
    expect(m.targetScore).toBe(400);
    expect(m.career).toBe("Medicina");
    const onlyLocal = mergeProgress(
      p({ hasCompletedOnboarding: true, targetScore: 320, career: "Derecho" }),
      p({})
    );
    expect(onlyLocal.hasCompletedOnboarding).toBe(true);
    expect(onlyLocal.targetScore).toBe(320);
    expect(onlyLocal.career).toBe("Derecho");
  });

  it("fusionar con una cuenta vacía deja el progreso local igual", () => {
    const solo = mergeProgress(local, defaultProgress());
    expect(solo.completedLessons).toEqual(local.completedLessons);
    expect(solo.areaStats).toEqual(local.areaStats);
    expect(solo.totalXp).toBe(80);
    expect(solo.simulacroScores).toEqual([40, 60]);
  });

  it("tolera datos remotos incompletos (versiones anteriores)", () => {
    const old = {
      totalXp: 10,
      completedLessons: [
        { lessonId: "x", completed: true, score: 50, xpEarned: 10 },
      ],
    } as unknown as UserProgress;
    const r = mergeProgress(defaultProgress(), old);
    expect(r.simulacroHistory).toEqual([]);
    expect(r.totalXp).toBe(10);
  });
});

describe("decideSync", () => {
  const user = "user-1";
  const used = p({
    areaStats: {
      ...defaultProgress().areaStats,
      matematicas: { answered: 1, correct: 1 },
    },
  });
  const remoteDoc = p({ totalXp: 99 });
  const meta = (patch: Partial<SyncMeta> = {}): SyncMeta => ({
    userId: user,
    remoteUpdatedAt: "2026-10-04T10:00:00Z",
    syncedAt: "2026-10-04T10:00:01Z",
    localUpdatedAt: "2026-10-04T10:00:01Z",
    ...patch,
  });

  it("primer inicio sin progreso en la cuenta: sube el local", () => {
    expect(
      decideSync({ userId: user, local: used, meta: null, remote: null })
    ).toMatchObject({ action: "push", doc: used });
  });
  it("primer inicio con local vacío: baja el de la cuenta", () => {
    const d = decideSync({
      userId: user,
      local: defaultProgress(),
      meta: null,
      remote: { data: remoteDoc, updatedAt: "2026-10-04T10:00:00Z" },
    });
    expect(d.action).toBe("pull");
  });
  it("primer inicio con ambos: fusiona", () => {
    const d = decideSync({
      userId: user,
      local: used,
      meta: null,
      remote: { data: remoteDoc, updatedAt: "2026-10-04T10:00:00Z" },
    });
    expect(d.action).toBe("merge");
    if (d.action === "merge")
      expect(d.doc.areaStats.matematicas.answered).toBe(1);
  });
  it("progreso local de otra cuenta: no se mezcla", () => {
    const d = decideSync({
      userId: user,
      local: used,
      meta: meta({ userId: "otra" }),
      remote: { data: remoteDoc, updatedAt: "2026-10-04T10:00:00Z" },
    });
    expect(d).toMatchObject({ action: "pull", reason: "otra-cuenta" });
    if (d.action === "pull") expect(d.doc.totalXp).toBe(99);
    expect(
      decideSync({
        userId: user,
        local: used,
        meta: meta({ userId: "otra" }),
        remote: null,
      })
    ).toMatchObject({ action: "pull", doc: defaultProgress() });
  });
  it("ya sincronizado y sin cambios: nada", () => {
    expect(
      decideSync({
        userId: user,
        local: used,
        meta: meta(),
        remote: { data: remoteDoc, updatedAt: "2026-10-04T10:00:00Z" },
      }).action
    ).toBe("none");
  });
  it("solo cambios locales: sube", () => {
    const d = decideSync({
      userId: user,
      local: used,
      meta: meta({ localUpdatedAt: "2026-10-04T11:00:00Z" }),
      remote: { data: remoteDoc, updatedAt: "2026-10-04T10:00:00Z" },
    });
    expect(d.action).toBe("push");
  });
  it("solo cambios en otro dispositivo: baja", () => {
    const d = decideSync({
      userId: user,
      local: used,
      meta: meta(),
      remote: { data: remoteDoc, updatedAt: "2026-10-04T12:00:00Z" },
    });
    expect(d.action).toBe("pull");
  });
  it("cambios en ambos: gana el más reciente", () => {
    const remote = { data: remoteDoc, updatedAt: "2026-10-04T12:00:00Z" };
    expect(
      decideSync({
        userId: user,
        local: used,
        meta: meta({ localUpdatedAt: "2026-10-04T13:00:00Z" }),
        remote,
      })
    ).toMatchObject({
      action: "push",
      reason: "conflicto-gana-local",
    });
    expect(
      decideSync({
        userId: user,
        local: used,
        meta: meta({ localUpdatedAt: "2026-10-04T11:00:00Z" }),
        remote,
      })
    ).toMatchObject({
      action: "pull",
      reason: "conflicto-gana-remoto",
    });
  });
  it("la cuenta perdió su fila: se vuelve a subir", () => {
    expect(
      decideSync({ userId: user, local: used, meta: meta(), remote: null })
        .action
    ).toBe("push");
  });
});

describe("utilidades", () => {
  it("isEmptyProgress", () => {
    expect(isEmptyProgress(defaultProgress())).toBe(true);
    expect(isEmptyProgress(p({ badges: [], favoriteLessons: ["x"] }))).toBe(
      false
    );
    expect(isEmptyProgress(p({ simulacroScores: [10] }))).toBe(false);
  });
  it("parseSyncMeta descarta datos dañados", () => {
    expect(parseSyncMeta(null)).toBeNull();
    expect(parseSyncMeta("{")).toBeNull();
    expect(parseSyncMeta('{"userId":1}')).toBeNull();
    expect(
      parseSyncMeta(
        '{"userId":"u","syncedAt":"a","localUpdatedAt":"b","remoteUpdatedAt":null}'
      )?.userId
    ).toBe("u");
  });
});
