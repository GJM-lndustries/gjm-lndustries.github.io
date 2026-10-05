/**
 * Metadatos SEO de cada ruta estática. Es la única lista de rutas del sitio:
 * la usan el prerender (scripts/postbuild.mjs), el sitemap y el <title> al navegar.
 * Mantener sincronizado con las <Route> de src/App.tsx.
 */
import type { AreaId } from "@/data/questions/types";

export type RouteKind = "home" | "course" | "practice" | "quiz" | "faq" | "glossary" | "page";

export interface RouteMeta {
  path: string;
  /** Nombre corto (migas de pan y JSON-LD). */
  name: string;
  /** <title>: único por página, ~60 caracteres. */
  title: string;
  /** Meta descripción: única por página, ~150–160 caracteres. */
  description: string;
  kind: RouteKind;
  /** Área del Saber 11 (solo páginas de área). */
  area?: AreaId;
  /** Páginas personales o sin contenido propio: no se indexan ni van al sitemap. */
  noindex?: boolean;
}

export const ROUTES: RouteMeta[] = [
  {
    path: "/",
    name: "Portada",
    title: "Preicfes gratis: estudia para el ICFES Saber 11 | ProICFES",
    description:
      "Estudia para el ICFES gratis con lecciones cortas, preguntas tipo ICFES con explicación y simulacros. Calcula tu puntaje estimado del Saber 11 por áreas.",
    kind: "home",
  },
  {
    path: "/inicio",
    name: "Tu estudio",
    title: "Tu estudio · ProICFES",
    description: "Tablero de estudio: reto diario, áreas del Saber 11, práctica y simulacro.",
    kind: "page",
    noindex: true,
  },
  {
    path: "/yo",
    name: "Yo",
    title: "Tu espacio · ProICFES",
    description: "Racha, meta personal y acceso a tu cuenta.",
    kind: "page",
    noindex: true,
  },
  {
    path: "/practica",
    name: "Modo práctica",
    title: "Preguntas tipo ICFES con respuestas y explicación | ProICFES",
    description:
      "Practica gratis preguntas tipo Saber 11 de Matemáticas, Lectura Crítica, Ciencias, Sociales e Inglés. Elige área y nivel, y mira la explicación al instante.",
    kind: "practice",
  },
  {
    path: "/simulacro",
    name: "Simulacro",
    title: "Simulacro ICFES gratis en línea | ProICFES",
    description:
      "Simulacro ICFES gratis: corto (25 preguntas, 40 min) o completo por sesiones, con reloj, puntaje por prueba, global estimado y explicación de cada respuesta.",
    kind: "quiz",
  },
  {
    path: "/matematicas",
    name: "Matemáticas",
    title: "Matemáticas ICFES: lecciones y preguntas | ProICFES",
    description:
      "Repasa Matemáticas para el ICFES: operaciones, promedio y mediana, gráficas, álgebra y probabilidad, con ejemplos de la vida diaria y preguntas explicadas.",
    kind: "course",
    area: "matematicas",
  },
  {
    path: "/lectura",
    name: "Lectura Crítica",
    title: "Lectura Crítica ICFES: lecciones y preguntas | ProICFES",
    description:
      "Mejora en Lectura Crítica para el Saber 11: comprensión literal e inferencial, propósito del autor y argumentación, con preguntas tipo ICFES explicadas.",
    kind: "course",
    area: "lectura-critica",
  },
  {
    path: "/ciencias",
    name: "Ciencias Naturales",
    title: "Ciencias Naturales ICFES: lecciones y preguntas | ProICFES",
    description:
      "Prepara Ciencias Naturales para el ICFES con lecciones sobre la célula y las leyes de Newton, ejemplos cotidianos y preguntas tipo Saber 11 con explicación.",
    kind: "course",
    area: "ciencias-naturales",
  },
  {
    path: "/sociales",
    name: "Sociales y Ciudadanas",
    title: "Sociales y Ciudadanas ICFES: lecciones | ProICFES",
    description:
      "Estudia Sociales y Ciudadanas para el Saber 11: la Constitución de 1991, tus derechos y los momentos clave de la historia de Colombia, con preguntas explicadas.",
    kind: "course",
    area: "sociales-ciudadanas",
  },
  {
    path: "/ingles",
    name: "Inglés",
    title: "Inglés ICFES: vocabulario y gramática | ProICFES",
    description:
      "Repasa Inglés para el ICFES Saber 11: vocabulario frecuente, tiempos verbales y comprensión de lectura, con preguntas de práctica y explicación en español.",
    kind: "course",
    area: "ingles",
  },
  {
    path: "/preguntas-frecuentes",
    name: "Preguntas frecuentes",
    title: "Saber 11: cómo se calcula el puntaje y más | ProICFES",
    description:
      "Qué es el Saber 11, qué pruebas tiene, cómo se calcula el puntaje global con la ponderación oficial del ICFES y cómo usar ProICFES para prepararte gratis.",
    kind: "faq",
  },
  {
    path: "/glosario",
    name: "Glosario",
    title: "Glosario del ICFES: términos explicados fácil | ProICFES",
    description:
      "Palabras que aparecen en el ICFES Saber 11 explicadas en lenguaje sencillo: competencias, inferencia, media, mediana, hipótesis y más.",
    kind: "glossary",
  },
  {
    path: "/tips",
    name: "Estrategias",
    title: "Consejos para presentar el ICFES Saber 11 | ProICFES",
    description:
      "Estrategias para el día del examen Saber 11: cómo manejar el tiempo, descartar opciones, leer las preguntas y llegar tranquilo a cada sesión.",
    kind: "page",
  },
  {
    path: "/politica-de-privacidad",
    name: "Política de privacidad",
    title: "Política de privacidad | ProICFES",
    description:
      "Qué datos usa ProICFES, para qué y con quién se comparten, y cómo ejercer tus derechos de habeas data según la Ley 1581 de 2012 de protección de datos.",
    kind: "page",
  },
  {
    path: "/tratamiento-de-datos",
    name: "Tratamiento de datos personales",
    title: "Política de Tratamiento de Datos Personales | ProICFES",
    description:
      "Política de Tratamiento de Datos Personales de ProICFES: finalidades, derechos, consultas en 10 días hábiles, reclamos en 15, menores de edad y transferencias.",
    kind: "page",
  },
  {
    path: "/terminos",
    name: "Términos y condiciones",
    title: "Términos y condiciones de uso | ProICFES",
    description:
      "Condiciones de uso de ProICFES: fin educativo, sin afiliación con el ICFES, sin garantía de resultados, propiedad intelectual y derechos del consumidor.",
    kind: "page",
  },
  {
    path: "/cookies",
    name: "Política de cookies",
    title: "Política de cookies | ProICFES",
    description:
      "Qué cookies y almacenamiento usa ProICFES (necesarias, analíticas y de publicidad), para qué sirven y cómo aceptarlas, rechazarlas o cambiar tu elección.",
    kind: "page",
  },
  {
    path: "/analytics",
    name: "Mi progreso",
    title: "Mi progreso · ProICFES",
    description: "Tus aciertos por área y tu puntaje global estimado con la ponderación del Saber 11.",
    kind: "page",
    noindex: true,
  },
  {
    path: "/logros",
    name: "Mis logros",
    title: "Mis logros · ProICFES",
    description: "Insignias, racha de estudio y progreso por área en ProICFES.",
    kind: "page",
    noindex: true,
  },
  {
    path: "/leaderboard",
    name: "Ranking",
    title: "Ranking (próximamente) · ProICFES",
    description: "El ranking entre estudiantes llegará pronto. Mientras tanto, revisa tus marcas personales.",
    kind: "page",
    noindex: true,
  },
  {
    path: "/cuenta",
    name: "Tu cuenta",
    title: "Tu cuenta · ProICFES",
    description: "Crea tu cuenta para guardar tu progreso en la nube y seguir desde cualquier dispositivo.",
    kind: "page",
    noindex: true,
  },
  {
    path: "/meta",
    name: "Define tu meta",
    title: "Define tu meta · ProICFES",
    description: "Define tu puntaje objetivo para el Saber 11 (opcional).",
    kind: "page",
    noindex: true,
  },
];

export const NOT_FOUND_META: RouteMeta = {
  path: "/404",
  name: "Página no encontrada",
  title: "Página no encontrada · ProICFES",
  description: "La página que buscas no existe. Vuelve al inicio de ProICFES para seguir estudiando.",
  kind: "page",
  noindex: true,
};

export function findRoute(path: string): RouteMeta | undefined {
  const clean = path.length > 1 ? path.replace(/\/+$/, "") : path;
  return ROUTES.find(r => r.path === clean);
}
