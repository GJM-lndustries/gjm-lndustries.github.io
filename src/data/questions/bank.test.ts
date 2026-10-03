import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { AREA_IDS } from "./types";
import { validateBank } from "./validate";
import { allQuestions, getQuestions } from "./index";
import { modules } from "@/lib/appData";
import { SIMULACRO_QUESTION_IDS } from "@/data/simulacro";

const dir = path.resolve(import.meta.dirname);
const read = (f: string) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));

describe("banco de preguntas", () => {
  it("pasa la validación de esquema", () => {
    const files = AREA_IDS.map(area => ({ area, file: `${area}.json`, questions: read(`${area}.json`) }));
    expect(validateBank(files, read("stimuli.json"))).toEqual([]);
  });

  it("detecta errores típicos", () => {
    const bad = [{ id: "x", area: "matematicas", competencia: "Argumentación", afirmacion: "a", difficulty: 4, enunciado: "e", options: [{ id: "a", text: "1" }, { id: "a", text: "2" }], answer: "z", explanation: "e", tip: "t", source: "otro", reviewed: "no" }];
    const errors = validateBank([{ area: "matematicas", file: "m.json", questions: [...bad, bad[0]] }], []);
    const text = errors.join("\n");
    expect(text).toMatch(/id repetido/);
    expect(text).toMatch(/difficulty/);
    expect(text).toMatch(/no está entre las opciones/);
    expect(text).toMatch(/opción repetida/);
    expect(text).toMatch(/source/);
    expect(text).toMatch(/reviewed/);
  });

  it("todas las lecciones y el simulacro apuntan a preguntas existentes", () => {
    for (const m of modules) {
      for (const l of m.lessons) {
        expect(getQuestions(l.questionIds)).toHaveLength(l.questionIds.length);
        for (const q of getQuestions(l.questionIds)) expect(q.area).toBe(m.area);
      }
    }
    expect(getQuestions(SIMULACRO_QUESTION_IDS)).toHaveLength(SIMULACRO_QUESTION_IDS.length);
  });

  it("tiene al menos 30 preguntas originales de Matemáticas", () => {
    expect(allQuestions.filter(q => q.area === "matematicas" && q.source === "original").length).toBeGreaterThanOrEqual(30);
  });
});
