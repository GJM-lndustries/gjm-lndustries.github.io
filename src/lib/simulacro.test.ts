import { describe, expect, it } from "vitest";
import { AREA_IDS, type AreaId } from "@/data/questions/types";
import { getQuestion, questionsByArea } from "@/data/questions";
import {
  OFFICIAL_SESSIONS, answerQuestion, buildAttempt, expireIfNeeded, finishSession, formatClock, formatMinutes,
  isRunning, nextSession, parseAttempt, planFormat, remainingMs, scoreAttempt, startSession, toggleMark,
} from "./simulacro";

const counts = Object.fromEntries(AREA_IDS.map(a => [a, questionsByArea[a].length])) as Record<AreaId, number>;
const T0 = Date.UTC(2026, 9, 4, 13, 0);

describe("plan del simulacro", () => {
  it("corto: una sesión de 25 preguntas en 40 minutos con las 5 áreas", () => {
    const [s, ...rest] = planFormat("corto", counts);
    expect(rest).toHaveLength(0);
    expect(Object.values(s.areas).reduce((x, y) => x + (y ?? 0), 0)).toBe(25);
    expect(s.minutes).toBe(40);
    expect(Object.keys(s.areas).sort()).toEqual([...AREA_IDS].sort());
  });

  it("completo: dos sesiones con la estructura oficial, escaladas al banco y al ritmo real", () => {
    const plan = planFormat("completo", counts);
    expect(plan).toHaveLength(2);
    expect(plan[0].areas["lectura-critica"]).toBeGreaterThan(0);
    expect(plan[0].areas.ingles).toBeUndefined();
    expect(plan[1].areas.ingles).toBeGreaterThan(0);
    expect(plan[1].areas["lectura-critica"]).toBeUndefined();
    for (const a of AREA_IDS) {
      const used = plan.reduce((s, p) => s + (p.areas[a] ?? 0), 0);
      expect(used, a).toBeLessThanOrEqual(counts[a]);
    }
    // Ritmo: 270 minutos por las preguntas oficiales de la sesión.
    plan.forEach((p, i) => {
      const n = Object.values(p.areas).reduce((x, y) => x + (y ?? 0), 0);
      const official = Object.values(OFFICIAL_SESSIONS[i]).reduce((x, y) => x + (y ?? 0), 0);
      expect(p.minutes).toBe(Math.round((n * 270) / official));
    });
  });

  it("con un banco grande, el completo tiene el tamaño real (254 preguntas, 4 h 30 min por sesión)", () => {
    const big = Object.fromEntries(AREA_IDS.map(a => [a, 500])) as Record<AreaId, number>;
    const plan = planFormat("completo", big);
    expect(plan.map(p => Object.values(p.areas).reduce((x, y) => x + (y ?? 0), 0))).toEqual([120, 134]);
    expect(plan.map(p => p.minutes)).toEqual([270, 270]);
  });
});

describe("cuadernillo", () => {
  it("es reproducible con la misma semilla y no repite preguntas", () => {
    const a = buildAttempt("completo", questionsByArea, 42, T0);
    const b = buildAttempt("completo", questionsByArea, 42, T0);
    expect(a.sessions.map(s => s.questionIds)).toEqual(b.sessions.map(s => s.questionIds));
    const all = a.sessions.flatMap(s => s.questionIds);
    expect(new Set(all).size).toBe(all.length);
    expect(buildAttempt("completo", questionsByArea, 7, T0).sessions[0].questionIds).not.toEqual(a.sessions[0].questionIds);
  });

  it("deja juntas las preguntas de un mismo texto e Inglés en orden de partes", () => {
    for (const seed of [1, 2, 3, 99]) {
      const a = buildAttempt("completo", questionsByArea, seed, T0);
      for (const s of a.sessions) {
        const qs = s.questionIds.map(id => getQuestion(id)!);
        const seen = new Set<string>();
        let prev: string | undefined;
        for (const q of qs) {
          if (q.stimulusId && q.stimulusId !== prev) {
            expect(seen.has(q.stimulusId), `${q.stimulusId} separado (semilla ${seed})`).toBe(false);
            seen.add(q.stimulusId);
          }
          prev = q.stimulusId;
        }
        const partes = qs.filter(q => q.area === "ingles" && q.parte).map(q => q.parte!);
        expect(partes).toEqual([...partes].sort((x, y) => x - y));
      }
    }
  });
});

describe("tiempo y sesiones", () => {
  it("no se puede responder antes de empezar ni después de que se acabe el tiempo", () => {
    let a = buildAttempt("corto", questionsByArea, 5, T0);
    const q = a.sessions[0].questionIds[0];
    expect(answerQuestion(a, q, "a", T0).answers[q]).toBeUndefined();
    a = startSession(a, T0);
    expect(isRunning(a)).toBe(true);
    a = answerQuestion(a, q, "b", T0 + 1000);
    expect(a.answers[q]).toBe("b");
    expect(remainingMs(a, T0 + 60_000)).toBe(39 * 60_000);
    const late = answerQuestion(a, a.sessions[0].questionIds[1], "a", T0 + 41 * 60_000);
    expect(late.answers[a.sessions[0].questionIds[1]]).toBeUndefined();
    expect(late.finishedAt).toBe(T0 + 40 * 60_000);
  });

  it("el reloj no se pausa: al volver después del límite, la sesión ya terminó", () => {
    let a = startSession(buildAttempt("completo", questionsByArea, 9, T0), T0);
    const limit = a.sessions[0].minutes * 60_000;
    a = expireIfNeeded(a, T0 + limit + 5 * 60_000);
    expect(a.sessions[0].finishedAt).toBe(T0 + limit);
    expect(a.finishedAt).toBeNull(); // falta la sesión 2
    a = nextSession(a);
    expect(a.current).toBe(1);
    expect(isRunning(a)).toBe(false); // receso hasta que el estudiante empiece la sesión 2
    a = startSession(a, T0 + limit + 20 * 60_000);
    a = finishSession(a, T0 + limit + 30 * 60_000);
    expect(a.finishedAt).toBe(T0 + limit + 30 * 60_000);
  });

  it("solo se marcan para revisar preguntas mientras la sesión está abierta", () => {
    let a = startSession(buildAttempt("corto", questionsByArea, 3, T0), T0);
    const q = a.sessions[0].questionIds[2];
    a = toggleMark(a, q);
    expect(a.marked).toEqual([q]);
    a = toggleMark(a, q);
    expect(a.marked).toEqual([]);
  });
});

describe("resultados", () => {
  it("calcula aciertos por área (0–100) y el global con la ponderación oficial", () => {
    let a = startSession(buildAttempt("corto", questionsByArea, 11, T0), T0);
    for (const id of a.sessions[0].questionIds) {
      const q = getQuestion(id)!;
      // Acierta todo excepto Inglés.
      a = answerQuestion(a, id, q.area === "ingles" ? q.options.find(o => o.id !== q.answer)!.id : q.answer, T0 + 1000);
    }
    const r = scoreAttempt(finishSession(a, T0 + 2000), getQuestion);
    expect(r.perArea.matematicas!.score).toBe(100);
    expect(r.perArea.ingles!.score).toBe(0);
    expect(r.global).toBe(Math.round(((3 * 100 * 4 + 0) / 13) * 5)); // 462
    expect(r.answered).toBe(25);
  });

  it("las preguntas sin responder cuentan como no acertadas", () => {
    const a = finishSession(startSession(buildAttempt("corto", questionsByArea, 12, T0), T0), T0 + 5000);
    const r = scoreAttempt(a, getQuestion);
    expect(r.correct).toBe(0);
    expect(r.global).toBe(0);
  });

  it("descarta intentos guardados dañados", () => {
    const a = buildAttempt("corto", questionsByArea, 1, T0);
    const exists = (id: string) => Boolean(getQuestion(id));
    expect(parseAttempt(JSON.stringify(a), exists)).toEqual(a);
    expect(parseAttempt("{", exists)).toBeNull();
    expect(parseAttempt(JSON.stringify({ ...a, v: 2 }), exists)).toBeNull();
    expect(parseAttempt(JSON.stringify({ ...a, sessions: [{ ...a.sessions[0], questionIds: ["no-existe"] }] }), exists)).toBeNull();
  });

  it("formatea el reloj y las duraciones", () => {
    expect(formatClock(65_000)).toBe("1:05");
    expect(formatClock(3_909_000)).toBe("1:05:09");
    expect(formatMinutes(40)).toBe("40 min");
    expect(formatMinutes(140)).toBe("2 h 20 min");
    expect(formatMinutes(120)).toBe("2 h");
  });
});
