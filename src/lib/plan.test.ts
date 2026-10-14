import { describe, expect, it } from "vitest";
import { diagnosticEstimate, examWindows, intentionSentence, pickDiagnostic, suggestedGoal, weeksUntil } from "./plan";
import { questionsByArea, getStimulus } from "@/data/questions";
import { AREA_IDS } from "@/data/questions/types";

describe("plan", () => {
  it("las próximas fechas dependen de hoy", () => {
    expect(examWindows(new Date("2026-10-14T12:00:00-05:00")).map(w => w.id)).toEqual(["2027-03", "2027-08", "nose"]);
    expect(examWindows(new Date("2027-02-10T12:00:00-05:00")).map(w => w.id)).toEqual(["2027-03", "2027-08", "nose"]);
    expect(examWindows(new Date("2027-05-10T12:00:00-05:00")).map(w => w.id)).toEqual(["2027-08", "2028-03", "nose"]);
    expect(weeksUntil("2027-08", new Date("2027-07-01T12:00:00-05:00"))).toBe(4);
    expect(weeksUntil("nose")).toBeNull();
  });
  it("sugiere 300 salvo que ya se vea cerca o por encima", () => {
    expect(suggestedGoal(undefined)).toBe(300);
    expect(suggestedGoal("lt250")).toBe(300);
    expect(suggestedGoal("nose")).toBe(300);
    expect(suggestedGoal("350-400")).toBe(400);
  });
  it("arma la frase de intención", () => {
    expect(intentionSentence(5, "Al llegar del colegio")).toBe("Voy a estudiar 5 minutos al llegar del colegio.");
    expect(intentionSentence(10, "En el bus o en el camino")).toBe("Voy a estudiar 10 minutos en el bus o en el camino.");
  });
  it("la mini prueba tiene una pregunta por área", () => {
    const qs = pickDiagnostic(questionsByArea, id => getStimulus(id)?.text.length ?? 0);
    expect(qs.map(q => q.area)).toEqual(AREA_IDS);
  });
  it("el punto de partida es moderado y con rango", () => {
    const none = diagnosticEstimate(AREA_IDS.map(area => ({ area, correct: false })));
    const all = diagnosticEstimate(AREA_IDS.map(area => ({ area, correct: true })));
    expect(none.estimate).toBe(125);
    expect(all.estimate).toBe(375);
    expect(all.high - all.low).toBe(100);
  });
});
