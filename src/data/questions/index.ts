import matematicas from "./matematicas.json";
import lecturaCritica from "./lectura-critica.json";
import cienciasNaturales from "./ciencias-naturales.json";
import socialesCiudadanas from "./sociales-ciudadanas.json";
import ingles from "./ingles.json";
import stimuliData from "./stimuli.json";
import type { AreaId, Question, Stimulus } from "./types";

export * from "./types";
export * from "./meta";

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
