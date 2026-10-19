/**
 * Cómo usa el Saber 11 cada institución. Solo datos de páginas oficiales de cada una,
 * con enlace y fecha de consulta. REVISAR cada semestre (cambian con cada convocatoria).
 */
import type { AreaId } from "./questions/types";

export const ADMISIONES_CHECKED = "19 de octubre de 2026";

export type UsoIcfes = "ponderado" | "minimo" | "becas" | "examen-propio" | "requisito";

export interface Institucion {
  id: string;
  nombre: string;
  ciudad?: string;
  /** Una línea: cómo cuenta tu ICFES allá. */
  resumen: string;
  usos: UsoIcfes[];
  /** Áreas que entran en el cálculo (si la institución lo publica). */
  areas?: AreaId[];
  puntos: string[];
  /** Qué hacer con eso para estudiar. */
  consejo: string;
  fuentes: { label: string; url: string }[];
  /** Metas del onboarding con las que se relaciona (para mostrarla primero). */
  metas?: string[];
}

export const USO_LABEL: Record<UsoIcfes, string> = {
  ponderado: "Pondera tus áreas",
  minimo: "Pide un mínimo para inscribirte",
  becas: "Becas por puntaje",
  "examen-propio": "Examen propio",
  requisito: "Solo pide haberlo presentado",
};

export const INSTITUCIONES: Institucion[] = [
  {
    id: "univalle",
    nombre: "Universidad del Valle",
    ciudad: "Cali",
    resumen: "Tu global solo sirve para poder inscribirte; lo que decide es tu puntaje ponderado en las áreas que pesa tu programa.",
    usos: ["minimo", "ponderado"],
    puntos: [
      "El puntaje global es un requisito mínimo para inscribirse (Resolución 080 de 2024 del Consejo Académico).",
      "Cada programa asigna un peso a cada prueba del Saber 11; los pesos suman 100 %. Algunos programas suman pruebas específicas.",
      "Cada puntaje de área se multiplica por su peso y se suman los resultados. Los inscritos se ordenan de mayor a menor con esa suma y entran los primeros, según los cupos (art. 20).",
      "Si hay empate en la línea de corte, gana el mejor puntaje en el área que más pesa. Y si tu programa no le da peso a Inglés, Inglés sirve para desempatar (art. 22): nunca es inútil.",
    ],
    consejo: "Busca en admisiones.univalle.edu.co cuánto pesa cada área en tu programa: un punto en un área que pesa 30 % vale el triple que uno en un área de 10 %.",
    fuentes: [
      { label: "Univalle, Resolución 080 de 2024 (reglamento de inscripción y admisión, arts. 20 y 22)", url: "https://registro.univalle.edu.co/wp-content/uploads/2024/05/RCA_080_Reglamento_inscripcion_y_admision-Pregrado.pdf" },
    ],
  },
  {
    id: "javeriana-cali",
    nombre: "Pontificia Universidad Javeriana Cali",
    ciudad: "Cali",
    resumen: "El Saber 11 pesa el 40 % de la selección; el otro 60 % son entrevista y pruebas específicas.",
    usos: ["ponderado", "minimo"],
    areas: ["ciencias-naturales", "lectura-critica", "sociales-ciudadanas", "matematicas"],
    puntos: [
      "Saber 11: 40 % de la selección. Entrevista y pruebas específicas: 60 %.",
      "Para exámenes presentados desde agosto de 2014 pondera Ciencias Naturales, Lectura Crítica, Sociales y Ciudadanas y Matemáticas. Inglés no entra en esa ponderación.",
      "Publica una tabla de puntaje mínimo para inscribirse en cada carrera.",
    ],
    consejo: "Si apuntas a la Javeriana, las cuatro áreas que pondera valen más que Inglés para entrar.",
    fuentes: [
      { label: "Javeriana Cali, criterios de selección", url: "http://www.javerianacali.edu.co/admisiones/criterios-de-seleccion" },
      { label: "Javeriana Cali, admisiones", url: "http://www.javerianacali.edu.co/admisiones" },
    ],
  },
  {
    id: "icesi",
    nombre: "Universidad Icesi",
    ciudad: "Cali",
    resumen: "Para entrar pide tu registro del examen y tus notas; el puntaje global decide a qué becas puedes aspirar.",
    usos: ["becas", "requisito"],
    puntos: [
      "«Icesi Cree en ti» e «Icesi Conecta»: desde 285 de puntaje global.",
      "Becas Empresariales (50 a 100 % de la matrícula, estratos 1 a 4, ingresos familiares de 1 a 4 SMMLV en Cali) y becas para estratos 1 y 2 con ICETEX: desde 310.",
      "Beca Talento Excepcional: desde 350 (370 para Medicina), del 50 al 80 % del primer semestre.",
      "Todas tienen cupos limitados y más requisitos: revísalos completos en la página de Icesi. Lo publicado es para calendario A.",
    ],
    consejo: "Mira cuántos puntos te faltan para el siguiente umbral; ninguna beca está garantizada por el puntaje solo.",
    fuentes: [
      { label: "Icesi, becas por Saber 11", url: "https://www.icesi.edu.co/sitios/convocatoria-becas" },
      { label: "Icesi, Beca Talento Excepcional", url: "https://www.icesi.edu.co/becas/beca-talento-excepcional/" },
      { label: "Icesi, Becas Empresariales", url: "https://www.icesi.edu.co/becas/becas-empresariales/" },
    ],
  },
  {
    id: "unal",
    nombre: "Universidad Nacional de Colombia",
    resumen: "En la admisión regular entras con el examen propio de la Nacional, no con el puntaje del Saber 11.",
    usos: ["examen-propio", "requisito"],
    areas: ["matematicas", "lectura-critica", "sociales-ciudadanas", "ciencias-naturales"],
    puntos: [
      "Admisión regular: examen propio de 120 preguntas. El Saber 11 se pide como requisito y para calcular el valor de la matrícula.",
      "Desde 2027-1 (Resolución 19 del 3 de julio de 2026), los programas especiales PEAMA y PAET (sedes Amazonia, Caribe, Orinoquia y Tumaco) y el PTIUN seleccionan con el Saber 11: Matemáticas, Lectura Crítica, Sociales y Ciencias, con resultados desde 2020.",
    ],
    consejo: "Si vas por la admisión regular, prepara también el examen de la Nacional. Si aplicas a PEAMA, PAET o PTIUN, esas cuatro áreas del ICFES sí cuentan.",
    fuentes: [
      { label: "UNAL, guía paso a paso de admisión", url: "https://admisiones.unal.edu.co/pregrado/guia-paso-a-paso-pregrado/" },
      { label: "UNAL, normativa de admisión", url: "https://admisiones.unal.edu.co/pregrado/normativa-pregrado/" },
    ],
  },
  {
    id: "udea",
    nombre: "Universidad de Antioquia",
    resumen: "Admite con su propio examen y no pide puntaje mínimo del ICFES: basta con haberlo presentado.",
    usos: ["examen-propio", "requisito"],
    puntos: [
      "Examen de admisión propio: 50 % competencia lectora y 50 % razonamiento lógico.",
      "Eliminó el puntaje mínimo del Saber 11: solo hay que acreditar que lo presentaste.",
    ],
    consejo: "Lo que practicas de Lectura Crítica y Matemáticas te sirve para su examen, aunque no cuente el puntaje del ICFES.",
    fuentes: [
      { label: "UdeA, preguntas frecuentes de admisión", url: "https://www.udea.edu.co/wps/portal/udea/web/generales/interna/asEstudiarUdeA/quiero-estudiar-udea/Pregrado/asContenidos/asDestacados/preguntas-frecuentes-proceso-admision" },
    ],
  },
  {
    id: "sena",
    nombre: "SENA (tecnólogo)",
    resumen: "Para un tecnólogo te piden ser bachiller y el código de tu examen, sin puntaje mínimo.",
    usos: ["requisito"],
    metas: ["Tecnólogo SENA"],
    puntos: [
      "Tecnólogo: título de bachiller y resultados del Saber 11; la plataforma valida el código (número de registro) del examen.",
      "Técnico, auxiliar u operario: no piden bachiller ni ICFES.",
      "No hay puntaje mínimo: el SENA selecciona con su propia prueba.",
    ],
    consejo: "Un buen puntaje igual te sirve si después quieres pasar a la universidad o aspirar a becas.",
    fuentes: [{ label: "SENA, convocatoria 2026", url: "https://www.sena.edu.co/es-co/Noticias/Paginas/noticia.aspx?IdNoticia=9021" }],
  },
  {
    id: "policia",
    nombre: "Policía Nacional (patrullero)",
    resumen: "Pide un promedio de 40 o más en Lectura Crítica, Sociales, Matemáticas y Ciencias (escala de 0 a 100 por prueba).",
    usos: ["minimo"],
    areas: ["lectura-critica", "sociales-ciudadanas", "matematicas", "ciencias-naturales"],
    metas: ["Policía (patrullero)"],
    puntos: [
      "Promedio de 40 o más en Lectura Crítica, Sociales y Ciudadanas, Matemáticas y Ciencias Naturales. No es el puntaje global.",
      "Si no llegas a 40 puedes seguir en el proceso, pero queda a decisión del Consejo de Admisiones.",
    ],
    consejo: "Mira tu estimado por área: si alguna de esas cuatro está baja, súbela primero.",
    fuentes: [{ label: "Policía Nacional, convocatoria de patrulleros", url: "https://www.policia.gov.co/noticia/abierta-convocatoria-para-patrulleros-policia-preinscripcion-esta-habilitada-en-pagina-web" }],
  },
  {
    id: "ejercito",
    nombre: "Ejército (Escuela Militar de Cadetes)",
    resumen: "Pide certificar tus resultados del Saber 11, sin un puntaje mínimo publicado, y tiene su propia prueba de inglés.",
    usos: ["requisito"],
    metas: ["Ejército (oficial)"],
    puntos: [
      "Convocatoria 2027-1 para oficiales: certificar los resultados del Saber 11 (o presentarlos en el primer semestre).",
      "Hay prueba de inglés propia, además de pruebas psicométricas, físicas y entrevista. Edad de 16 a menos de 21 años al ingreso.",
    ],
    consejo: "Practicar Inglés en ProICFES también te prepara para su prueba de inglés.",
    fuentes: [{ label: "ESMIC, instructivo de incorporación 2027-1 (PDF)", url: "https://www.esmic.edu.co/aym_images/files/Incorporacion/instructivos/instructivo_prof_ciencias_mil_2027_1.pdf" }],
  },
];

/** Promedio de las cuatro áreas que mira la Policía (0–100), o null si falta alguna. */
export function promedioPolicia(perArea: Partial<Record<AreaId, number>>): number | null {
  const a: AreaId[] = ["lectura-critica", "sociales-ciudadanas", "matematicas", "ciencias-naturales"];
  const v = a.map(x => perArea[x]);
  if (v.some(n => n == null)) return null;
  return Math.round((v as number[]).reduce((s, n) => s + n, 0) / 4);
}
