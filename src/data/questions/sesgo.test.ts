import { describe, expect, it } from "vitest";
import { AREA_IDS } from "./types";
import { questionsByArea } from "./index";

/**
 * En los cuadernillos oficiales la respuesta correcta es la opción más larga en
 * cerca del 15–25 % de las preguntas. Si aquí pasara mucho más, un estudiante
 * podría «adivinar por longitud» y nuestra práctica le enseñaría un mal hábito.
 */
const MAX_PCT_MAS_LARGA = 0.35;
const MAX_RAZON = 1.4;
const MIN_CHARS = 6; // las opciones de una o dos palabras («is», «are», «8») no cuentan para la razón

describe("sesgo de la opción más larga", () => {
  for (const area of AREA_IDS) {
    const qs = questionsByArea[area].filter(q => q.options.length >= 3 && q.options.length <= 4);

    it(`${area}: la correcta es la más larga en ≤35 % de las preguntas`, () => {
      const masLarga = qs.filter(q => {
        const c = q.options.find(o => o.id === q.answer)!.text.length;
        return q.options.every(o => o.id === q.answer || o.text.length < c);
      });
      expect(masLarga.length / qs.length, masLarga.map(q => q.id).join(", ")).toBeLessThanOrEqual(MAX_PCT_MAS_LARGA);
    });

    it(`${area}: ninguna correcta es mucho más larga que la siguiente (>${MAX_RAZON}×)`, () => {
      const extremas = qs.filter(q => {
        const c = q.options.find(o => o.id === q.answer)!.text.length;
        const otra = Math.max(...q.options.filter(o => o.id !== q.answer).map(o => o.text.length));
        return otra >= MIN_CHARS && c / otra > MAX_RAZON;
      });
      expect(extremas.map(q => q.id)).toEqual([]);
    });

    it(`${area}: cada distractor dice qué trampa es y por qué no`, () => {
      const faltan: string[] = [];
      for (const q of questionsByArea[area]) {
        if (q.options.length > 4) continue; // parte 1 de Inglés: emparejar palabras, no hay distractores con trampa
        for (const o of q.options) {
          if (o.id === q.answer || o.ejemplo) continue;
          if (!o.trampa || !o.porQueNo) faltan.push(`${q.id}/${o.id}`);
        }
      }
      expect(faltan).toEqual([]);
    });
  }
});
