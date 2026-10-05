// Esquema del banco de preguntas de ProICFES.
// Cada área vive en su propio archivo JSON (matematicas.json, lectura-critica.json, …)
// y los textos/tablas compartidos por varias preguntas viven en stimuli.json.

export type AreaId =
  | "matematicas"
  | "lectura-critica"
  | "ciencias-naturales"
  | "sociales-ciudadanas"
  | "ingles";

/** 1 = básico, 2 = intermedio, 3 = avanzado */
export type QuestionDifficulty = 1 | 2 | 3;

export type QuestionSource = "original" | "proicfes-lecciones";

export type CienciasComponente = "Biológico" | "Químico" | "Físico" | "Ciencia, tecnología y sociedad";
export const CIENCIAS_COMPONENTES: CienciasComponente[] = ["Biológico", "Químico", "Físico", "Ciencia, tecnología y sociedad"];

export type InglesParte = 1 | 2 | 3 | 4 | 5 | 6 | 7;
/**
 * Partes de la prueba de Inglés Saber 11 y número de opciones de cada una
 * (Marco de referencia de la prueba de Inglés, ICFES).
 */
export const INGLES_PARTES: Record<InglesParte, { nombre: string; opciones: number }> = {
  1: { nombre: "Relacionar descripciones con palabras", opciones: 8 },
  2: { nombre: "Avisos: ¿dónde los puedes ver?", opciones: 3 },
  3: { nombre: "Conversaciones cortas", opciones: 3 },
  4: { nombre: "Texto incompleto: gramática", opciones: 3 },
  5: { nombre: "Comprensión de lectura literal", opciones: 3 },
  6: { nombre: "Comprensión de lectura inferencial", opciones: 4 },
  7: { nombre: "Texto incompleto: léxico y gramática", opciones: 4 },
};

export interface QuestionOption {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  area: AreaId;
  competencia: string;
  afirmacion: string;
  difficulty: QuestionDifficulty;
  /** Texto/tabla compartido (ver stimuli.json). Opcional. */
  stimulusId?: string;
  /** Ciencias Naturales: componente (biológico, químico, físico o CTS). */
  componente?: CienciasComponente;
  /** Inglés: parte de la prueba Saber 11 (1 a 7) a la que imita la pregunta. */
  parte?: InglesParte;
  enunciado: string;
  options: QuestionOption[];
  /** id de la opción correcta */
  answer: string;
  explanation: string;
  tip: string;
  source: QuestionSource;
  /** true solo cuando un docente revisó la pregunta */
  reviewed: boolean;
}

export interface Stimulus {
  id: string;
  area: AreaId;
  title?: string;
  /** Texto en Markdown sencillo: párrafos, **negrita** y tablas con | */
  text: string;
}

export const AREA_IDS: AreaId[] = [
  "matematicas",
  "lectura-critica",
  "ciencias-naturales",
  "sociales-ciudadanas",
  "ingles",
];

/** Competencias válidas por área (marco de referencia Saber 11). */
export const COMPETENCIAS: Record<AreaId, string[]> = {
  matematicas: [
    "Interpretación y representación",
    "Formulación y ejecución",
    "Argumentación",
  ],
  "lectura-critica": [
    "Identificar y entender los contenidos locales",
    "Comprender cómo se articulan las partes de un texto",
    "Reflexionar a partir de un texto y evaluar su contenido",
  ],
  "ciencias-naturales": [
    "Uso comprensivo del conocimiento científico",
    "Explicación de fenómenos",
    "Indagación",
  ],
  "sociales-ciudadanas": [
    "Pensamiento social",
    "Interpretación y análisis de perspectivas",
    "Pensamiento reflexivo y sistémico",
  ],
  ingles: ["Comprensión de lectura", "Gramática y léxico", "Vocabulario", "Uso pragmático del lenguaje"],
};
