import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { AREA_IDS, COMPETENCIAS, INGLES_PARTES, type InglesParte } from "./types";
import { validateBank } from "./validate";
import { BANK_COUNTS, allQuestions, getQuestions, questionsByArea } from "./index";
import { modules } from "@/lib/appData";

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

  it("todas las lecciones apuntan a preguntas existentes", () => {
    for (const m of modules) {
      for (const l of m.lessons) {
        expect(getQuestions(l.questionIds)).toHaveLength(l.questionIds.length);
        for (const q of getQuestions(l.questionIds)) expect(q.area).toBe(m.area);
      }
    }
  });

  it("tiene al menos 30 preguntas originales de Matemáticas", () => {
    expect(allQuestions.filter(q => q.area === "matematicas" && q.source === "original").length).toBeGreaterThanOrEqual(30);
  });

  it("tiene unas 30 preguntas por área, con todas las competencias representadas", () => {
    for (const area of AREA_IDS) {
      const qs = allQuestions.filter(q => q.area === area);
      expect(qs.length, area).toBeGreaterThanOrEqual(30);
      for (const c of COMPETENCIAS[area]) {
        if (area === "ingles") continue; // en Inglés se revisan las partes de la prueba
        expect(qs.filter(q => q.competencia === c).length, `${area} · ${c}`).toBeGreaterThanOrEqual(5);
      }
    }
  });

  it("Inglés cubre las 7 partes de la prueba Saber 11", () => {
    const partes = new Set(allQuestions.filter(q => q.area === "ingles").map(q => q.parte));
    for (const p of Object.keys(INGLES_PARTES)) expect(partes.has(Number(p) as InglesParte), `parte ${p}`).toBe(true);
  });

  it("las preguntas originales no reutilizan textos señalados por parecerse a ítems publicados", () => {
    const text = JSON.stringify(allQuestions).toLowerCase();
    expect(text).not.toContain("aporofobia");
    expect(text).not.toMatch(/placas de 3 d[ií]gitos/);
  });

  it("BANK_COUNTS (meta.ts) coincide con el banco", () => {
    for (const a of AREA_IDS) expect(BANK_COUNTS[a], a).toBe(questionsByArea[a].length);
  });
});
