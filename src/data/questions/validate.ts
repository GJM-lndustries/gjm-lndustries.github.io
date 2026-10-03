import { AREA_IDS, COMPETENCIAS, type AreaId } from "./types";

export interface BankFile {
  /** Área esperada según el nombre del archivo */
  area: AreaId;
  file: string;
  questions: unknown[];
}

const REQUIRED_STRINGS = [
  "id",
  "area",
  "competencia",
  "afirmacion",
  "enunciado",
  "answer",
  "explanation",
  "tip",
] as const;

function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function nonEmpty(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

/**
 * Valida el banco completo. Devuelve una lista de errores legibles;
 * si está vacía, el banco es válido.
 */
export function validateBank(files: BankFile[], stimuli: unknown[]): string[] {
  const errors: string[] = [];
  const stimulusIds = new Set<string>();
  const usedStimuli = new Set<string>();

  stimuli.forEach((s, i) => {
    const where = `stimuli.json[${i}]`;
    if (!isObj(s)) return errors.push(`${where}: no es un objeto`);
    if (!nonEmpty(s.id)) errors.push(`${where}: falta "id"`);
    else if (stimulusIds.has(s.id)) errors.push(`${where}: id repetido "${s.id}"`);
    else stimulusIds.add(s.id);
    if (!AREA_IDS.includes(s.area as AreaId)) errors.push(`${where}: área inválida "${String(s.area)}"`);
    if (!nonEmpty(s.text)) errors.push(`${where}: falta "text"`);
  });

  const seen = new Map<string, string>();
  for (const { area, file, questions } of files) {
    questions.forEach((q, i) => {
      const where = `${file}[${i}]${isObj(q) && nonEmpty(q.id) ? ` (${q.id})` : ""}`;
      if (!isObj(q)) return errors.push(`${where}: no es un objeto`);

      for (const key of REQUIRED_STRINGS) {
        if (!nonEmpty(q[key])) errors.push(`${where}: falta el campo "${key}"`);
      }
      if (nonEmpty(q.id)) {
        const prev = seen.get(q.id);
        if (prev) errors.push(`${where}: id repetido (ya existe en ${prev})`);
        else seen.set(q.id, file);
      }
      if (q.area !== area) errors.push(`${where}: el área "${String(q.area)}" no coincide con el archivo (${area})`);
      if (nonEmpty(q.competencia) && !COMPETENCIAS[area].includes(q.competencia)) {
        errors.push(`${where}: competencia "${q.competencia}" no es válida para ${area}`);
      }
      if (![1, 2, 3].includes(q.difficulty as number)) errors.push(`${where}: "difficulty" debe ser 1, 2 o 3`);
      if (q.source !== "original" && q.source !== "proicfes-lecciones") {
        errors.push(`${where}: "source" debe ser "original" o "proicfes-lecciones"`);
      }
      if (typeof q.reviewed !== "boolean") errors.push(`${where}: "reviewed" debe ser true/false`);
      if (q.stimulusId !== undefined) {
        if (!nonEmpty(q.stimulusId) || !stimulusIds.has(q.stimulusId)) {
          errors.push(`${where}: stimulusId "${String(q.stimulusId)}" no existe en stimuli.json`);
        } else usedStimuli.add(q.stimulusId);
      }

      if (!Array.isArray(q.options) || q.options.length < 2) {
        errors.push(`${where}: debe tener al menos 2 opciones`);
        return;
      }
      if (q.options.length > 8) errors.push(`${where}: demasiadas opciones (${q.options.length})`);
      const optionIds = new Set<string>();
      const optionTexts = new Set<string>();
      q.options.forEach((o, j) => {
        if (!isObj(o) || !nonEmpty(o.id) || !nonEmpty(o.text)) {
          errors.push(`${where}: la opción ${j} necesita "id" y "text"`);
          return;
        }
        if (optionIds.has(o.id)) errors.push(`${where}: opción repetida "${o.id}"`);
        optionIds.add(o.id);
        const t = o.text.trim().toLowerCase();
        if (optionTexts.has(t)) errors.push(`${where}: texto de opción repetido "${o.text}"`);
        optionTexts.add(t);
      });
      if (nonEmpty(q.answer) && !optionIds.has(q.answer)) {
        errors.push(`${where}: la respuesta "${q.answer}" no está entre las opciones`);
      }
    });
  }

  for (const id of stimulusIds) {
    if (!usedStimuli.has(id)) errors.push(`stimuli.json: el estímulo "${id}" no lo usa ninguna pregunta`);
  }
  return errors;
}
