// Rutas estáticas de la app. Mantener sincronizado con src/App.tsx.
// `sitemap: false` = la ruta existe pero no se publica en el sitemap.
export const SITE_URL = "https://gjm-lndustries.github.io";

export const routes = [
  { path: "/", title: "ProICFES · Prepárate para el Saber 11", description: "Prepárate gratis para el ICFES Saber 11 con lecciones cortas, modo práctica con explicaciones, simulacros y tu puntaje estimado por áreas." },
  { path: "/practica", title: "Modo práctica · ProICFES", description: "Practica preguntas tipo Saber 11 por área, nivel y competencia, con retroalimentación inmediata, explicación y tips." },
  { path: "/simulacro", title: "Simulacro · ProICFES", description: "Mini simulacro tipo ICFES con preguntas de varias áreas y revisión de cada respuesta." },
  { path: "/matematicas", title: "Matemáticas · ProICFES", description: "Lecciones de Matemáticas para el Saber 11: operaciones, estadística, álgebra y conteo con ejemplos de la vida diaria." },
  { path: "/lectura", title: "Lectura Crítica · ProICFES", description: "Lecciones de Lectura Crítica para el Saber 11: comprensión literal, relaciones entre textos y argumentación." },
  { path: "/ciencias", title: "Ciencias Naturales · ProICFES", description: "Lecciones de Ciencias Naturales para el Saber 11: la célula y las leyes de Newton con ejemplos cotidianos." },
  { path: "/sociales", title: "Sociales y Ciudadanas · ProICFES", description: "Lecciones de Sociales y Ciudadanas para el Saber 11: Constitución, mecanismos de participación e historia de Colombia." },
  { path: "/ingles", title: "Inglés · ProICFES", description: "Lecciones de Inglés para el Saber 11: comprensión de lectura y gramática básica." },
  { path: "/analytics", title: "Mi progreso · ProICFES", description: "Tus aciertos por área y tu puntaje global estimado con la ponderación del Saber 11." },
  { path: "/logros", title: "Mis logros · ProICFES", description: "Insignias, racha de estudio y progreso por área en ProICFES." },
  { path: "/glosario", title: "Glosario · ProICFES", description: "Palabras técnicas del ICFES explicadas en lenguaje sencillo." },
  { path: "/tips", title: "Estrategias para el ICFES · ProICFES", description: "Estrategias y consejos para presentar el examen Saber 11." },
  { path: "/leaderboard", title: "Ranking (próximamente) · ProICFES", description: "El ranking entre estudiantes llegará pronto. Mientras tanto, revisa tus marcas personales.", sitemap: false },
  { path: "/meta", title: "Define tu meta · ProICFES", description: "Define tu puntaje objetivo para el Saber 11 (opcional).", sitemap: false },
];
