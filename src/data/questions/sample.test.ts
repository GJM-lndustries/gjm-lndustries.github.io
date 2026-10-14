import { describe, expect, it } from "vitest";
import { questionsByArea } from "./index";
import { SAMPLE_QUESTION } from "./sample";

describe("pregunta de ejemplo de la portada", () => {
  it("es idéntica a la primera pregunta de Matemáticas sin texto de apoyo del banco", () => {
    const fromBank = questionsByArea.matematicas.find(q => !q.stimulusId);
    expect(SAMPLE_QUESTION).toEqual(fromBank);
  });
});
