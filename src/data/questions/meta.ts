/**
 * Datos livianos del banco (sin las preguntas): se pueden importar desde cualquier página sin
 * arrastrar los JSON del banco al archivo principal. Las preguntas están en ./index.ts.
 */
import type { AreaId } from "./types";

export const AREA_INFO: Record<
  AreaId,
  { label: string; short: string; moduleId: string; weight: number }
> = {
  matematicas: { label: "Matemáticas", short: "Mate", moduleId: "matematicas", weight: 3 },
  "lectura-critica": { label: "Lectura crítica", short: "Lectura", moduleId: "lectura", weight: 3 },
  "ciencias-naturales": { label: "Ciencias naturales", short: "Ciencias", moduleId: "ciencias", weight: 3 },
  "sociales-ciudadanas": { label: "Sociales y ciudadanas", short: "Sociales", moduleId: "sociales", weight: 3 },
  ingles: { label: "Inglés", short: "Inglés", moduleId: "ingles", weight: 1 },
};

export const DIFFICULTY_LABEL: Record<1 | 2 | 3, string> = {
  1: "Básico",
  2: "Intermedio",
  3: "Avanzado",
};

/**
 * Número de preguntas por área. Lo usan el inicio y el JSON-LD sin cargar el banco;
 * bank.test.ts comprueba que coincida con los JSON (actualízalo al agregar preguntas).
 */
export const BANK_COUNTS: Record<AreaId, number> = {
  matematicas: 39,
  "lectura-critica": 30,
  "ciencias-naturales": 31,
  "sociales-ciudadanas": 33,
  ingles: 30,
};

export const BANK_TOTAL = Object.values(BANK_COUNTS).reduce((s, n) => s + n, 0);
