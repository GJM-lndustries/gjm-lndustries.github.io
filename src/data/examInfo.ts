/**
 * Fechas y tarifas oficiales del Saber 11 (fuente: icfes.gov.co).
 * REVISAR cuando el ICFES publique la resolución de tarifas 2027 (sale hacia mediados de noviembre)
 * y el calendario B 2027. Cambia `CHECKED_AT` cada vez que se revise.
 */
export const CHECKED_AT = "2026-10-19";
export const CHECKED_LABEL = "19 de octubre de 2026";

export const SOURCES = {
  tarifas: { label: "ICFES, tarifas examen Saber 11", url: "https://www.icfes.gov.co/evaluaciones-icfes/saber-11/tarifas-examen-saber-11/" },
  resolucionTarifas: { label: "Resolución 000629 del 11 de noviembre de 2025 (PDF)", url: "https://www.icfes.gov.co/wp-content/uploads/2025/11/20251111-000629-resoluciones.pdf" },
  cronograma: { label: "ICFES, cronograma examen Saber 11", url: "https://www.icfes.gov.co/evaluaciones-icfes/cronograma-de-evaluaciones/cronograma-examen-saber-11/" },
  calendarioA2026: { label: "Calendario Saber 11 segundo semestre 2026 (PDF)", url: "https://www.icfes.gov.co/wp-content/uploads/2026/05/calendario-2026-11A-v2.pdf" },
  inscripcion: { label: "ICFES, trámite de inscripción Saber 11", url: "https://www.icfes.gov.co/atencion-y-servicios-a-la-ciudadania/tramites/inscripcion-aplicacion-y-resultados-del-examen-de-estado-de-la-educacion-media-saber-11/" },
  preSaber: { label: "ICFES, acerca del examen Pre Saber", url: "https://www.icfes.gov.co/evaluaciones-icfes/acerca-del-examen-prueba-pre-saber/" },
  validacion: { label: "ICFES, acerca de Validación del Bachillerato", url: "https://www.icfes.gov.co/evaluaciones-icfes/1-acerca-del-examen-validacion-del-bachillerato-academico/" },
  guia2026: { label: "Guía de orientación Saber 11 2026 (PDF)", url: "https://www.icfes.gov.co/wp-content/uploads/2026/03/17-marzo-guia-de-orientacion-saber-11-2026-2.pdf" },
} as const;

export interface Fee {
  poblacion: string;
  detalle?: string;
  ordinaria: number;
  extraordinaria: number;
}

/** Tarifas 2026 (Resolución 000629 de 2025). Extraordinaria = 50 % más. */
export const FEES_2026: Fee[] = [
  { poblacion: "Colegio público", ordinaria: 72000, extraordinaria: 108000 },
  { poblacion: "Privado rango I", detalle: "pensión hasta $98.000", ordinaria: 72000, extraordinaria: 108000 },
  { poblacion: "Privado rango II", detalle: "pensión de $98.000 a $176.000", ordinaria: 94000, extraordinaria: 141000 },
  { poblacion: "Privado rango III", detalle: "pensión de $176.001 a $283.000", ordinaria: 95000, extraordinaria: 142000 },
  { poblacion: "Privado rango IV", detalle: "pensión de $283.001 a $505.000", ordinaria: 100000, extraordinaria: 151000 },
  { poblacion: "Privado rango V", detalle: "pensión de $505.001 a $1.500.000", ordinaria: 120000, extraordinaria: 180000 },
  { poblacion: "Privado rango VI", detalle: "pensión de más de $1.500.000", ordinaria: 143000, extraordinaria: 215000 },
  { poblacion: "Bachiller graduado", detalle: "de la 1.ª a la 4.ª inscripción", ordinaria: 143000, extraordinaria: 215000 },
  { poblacion: "Bachiller graduado", detalle: "desde la 5.ª inscripción", ordinaria: 430000, extraordinaria: 646000 },
];

export interface Aplicacion {
  id: string;
  nombre: string;
  registroOrdinario: string;
  registroExtraordinario: string;
  citaciones: string;
  aplicacion: string;
  resultados: string;
}

/** Calendario oficial 2026 (cronograma del ICFES). */
export const CALENDARIO_2026: Aplicacion[] = [
  {
    id: "B-2026",
    nombre: "Calendario B 2026",
    registroOrdinario: "4 de noviembre al 19 de diciembre de 2025",
    registroExtraordinario: "22 de diciembre de 2025 al 16 de enero de 2026",
    citaciones: "27 de febrero de 2026",
    aplicacion: "Domingo 15 de marzo de 2026",
    resultados: "15 de mayo de 2026",
  },
  {
    id: "A-2026",
    nombre: "Calendario A 2026",
    registroOrdinario: "9 de marzo al 1 de mayo de 2026",
    registroExtraordinario: "4 al 22 de mayo de 2026",
    citaciones: "10 de julio de 2026",
    aplicacion: "Domingo 26 de julio de 2026",
    resultados: "25 de septiembre de 2026",
  },
];

export const formatCOP = (n: number) => `$${String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
