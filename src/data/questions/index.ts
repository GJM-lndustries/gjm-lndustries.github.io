import matematicas from "./matematicas.json";
import lecturaCritica from "./lectura-critica.json";
import cienciasNaturales from "./ciencias-naturales.json";
import socialesCiudadanas from "./sociales-ciudadanas.json";
import ingles from "./ingles.json";
import stimuliData from "./stimuli.json";
import type { AreaId, Question, Stimulus } from "./types";

export * from "./types";

export const questionsByArea: Record<AreaId, Question[]> = {
  matematicas: matematicas as Question[],
  "lectura-critica": lecturaCritica as Question[],
  "ciencias-naturales": cienciasNaturales as Question[],
  "sociales-ciudadanas": socialesCiudadanas as Question[],
  ingles: ingles as Question[],
};

export const allQuestions: Question[] = Object.values(questionsByArea).flat();

const byId = new Map(allQuestions.map(q => [q.id, q]));
const stimuli = new Map((stimuliData as Stimulus[]).map(s => [s.id, s]));

export function getQuestion(id: string): Question | undefined {
  return byId.get(id);
}

/** Devuelve las preguntas en el mismo orden de los ids (ignora ids inexistentes). */
export function getQuestions(ids: string[]): Question[] {
  return ids.map(id => byId.get(id)).filter((q): q is Question => Boolean(q));
}

export function getStimulus(id?: string): Stimulus | undefined {
  return id ? stimuli.get(id) : undefined;
}

export const AREA_INFO: Record<
  AreaId,
  { label: string; short: string; icon: string; moduleId: string; weight: number }
> = {
  matematicas: { label: "Matemáticas", short: "Mate", icon: "📐", moduleId: "matematicas", weight: 3 },
  "lectura-critica": { label: "Lectura Crítica", short: "Lectura", icon: "📖", moduleId: "lectura", weight: 3 },
  "ciencias-naturales": { label: "Ciencias Naturales", short: "Ciencias", icon: "🔬", moduleId: "ciencias", weight: 3 },
  "sociales-ciudadanas": { label: "Sociales y Ciudadanas", short: "Sociales", icon: "🗺️", moduleId: "sociales", weight: 3 },
  ingles: { label: "Inglés", short: "Inglés", icon: "🌎", moduleId: "ingles", weight: 1 },
};

export const DIFFICULTY_LABEL: Record<1 | 2 | 3, string> = {
  1: "Básico",
  2: "Intermedio",
  3: "Avanzado",
};
