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

/**
 * Tipos de trampa de un distractor («La trampa de esta opción»). Cada opción incorrecta
 * lleva uno, con una línea de por qué no es la respuesta.
 */
export type TrapType =
  | "verdad-a-medias"
  | "extremo"
  | "causa-efecto"
  | "fuera-de-contexto"
  | "no-responde"
  | "lectura-literal"
  | "opinion"
  | "confunde-conceptos"
  | "error-calculo"
  | "dato-equivocado"
  | "desfase-temporal"
  | "palabra-parecida";

export const TRAPS: Record<TrapType, { nombre: string; idea: string }> = {
  "verdad-a-medias": { nombre: "Verdad a medias", idea: "Dice algo cierto, pero incompleto o con un detalle que lo daña." },
  extremo: { nombre: "Se va al extremo", idea: "Usa «siempre», «nunca», «todos» o «solo», y el texto o el caso no dan para tanto." },
  "causa-efecto": { nombre: "Causa y efecto al revés", idea: "Invierte qué produce qué, o pone como causa algo que solo ocurre al mismo tiempo." },
  "fuera-de-contexto": { nombre: "Fuera de contexto", idea: "Tiene sentido en otro tema o situación, pero no en este." },
  "no-responde": { nombre: "Cierto, pero no responde", idea: "Puede ser verdad, pero no contesta lo que pregunta el enunciado." },
  "lectura-literal": { nombre: "Lectura literal", idea: "Se queda con las palabras exactas y pierde lo que el texto quiere decir." },
  opinion: { nombre: "Opinión o «deber ser»", idea: "Suena bien o correcto, pero es una opinión, no lo que muestran el texto o los datos." },
  "confunde-conceptos": { nombre: "Confunde conceptos", idea: "Cambia un concepto por otro parecido (por ejemplo, tutela por acción popular)." },
  "error-calculo": { nombre: "Error de cálculo", idea: "Sale de una cuenta mal hecha o de un paso que se saltó." },
  "dato-equivocado": { nombre: "Dato equivocado", idea: "La cuenta está bien hecha, pero con el dato que no era." },
  "desfase-temporal": { nombre: "Desfase en el tiempo", idea: "Mezcla hechos o ideas de épocas distintas." },
  "palabra-parecida": { nombre: "Palabra parecida", idea: "Se parece en forma o en tema a la correcta, pero no significa lo que se necesita." },
};

export interface QuestionOption {
  id: string;
  text: string;
  /** Inglés parte 1: palabra usada en el ejemplo resuelto; se muestra pero no se puede elegir. */
  ejemplo?: boolean;
  /** Distractores: tipo de trampa. */
  trampa?: TrapType;
  /** Distractores: una línea de por qué no es la respuesta. */
  porQueNo?: string;
}

/** Lectura crítica: tipo de texto (Guía de orientación Saber 11 2026, tablas 21 y 22). */
export type TipoTexto =
  | "Continuo literario"
  | "Continuo filosófico"
  | "Continuo informativo"
  | "Discontinuo literario"
  | "Discontinuo informativo";
export const TIPOS_TEXTO: TipoTexto[] = ["Continuo literario", "Continuo filosófico", "Continuo informativo", "Discontinuo literario", "Discontinuo informativo"];

/** Matemáticas: categoría de contenido (Guía de orientación Saber 11 2026). */
export type CategoriaMat = "Estadística" | "Geometría" | "Álgebra y cálculo";
export const CATEGORIAS_MAT: CategoriaMat[] = ["Estadística", "Geometría", "Álgebra y cálculo"];

export interface Question {
  id: string;
  area: AreaId;
  competencia: string;
  afirmacion: string;
  difficulty: QuestionDifficulty;
  /** Texto/tabla compartido (ver stimuli.json). Opcional. */
  stimulusId?: string;
  /** Ciencias naturales: componente (biológico, químico, físico o CTS). */
  componente?: CienciasComponente;
  /** Inglés: parte de la prueba Saber 11 (1 a 7) a la que imita la pregunta. */
  parte?: InglesParte;
  /** Lectura crítica: tipo de texto del estímulo. */
  tipoTexto?: TipoTexto;
  /** Matemáticas: categoría de contenido. */
  categoria?: CategoriaMat;
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
