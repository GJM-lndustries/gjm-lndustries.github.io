/**
 * Datos del Responsable del Tratamiento y de las políticas legales.
 *
 * Se usan en /tratamiento-de-datos, /politica-de-privacidad, /terminos y /cookies. Si algún valor
 * vuelve a quedar como [MARCADOR], el sitio lo resalta y `pnpm build` muestra una advertencia.
 * (Decreto 1377 de 2013, compilado en el Decreto 1074 de 2015, art. 2.2.2.25.3.1: la política debe
 * indicar nombre o razón social, domicilio, dirección, correo electrónico y teléfono del Responsable.)
 */
/**
 * 📅 FECHA DE LANZAMIENTO (AAAA-MM-DD): fecha de entrada en vigencia de todas las políticas
 * (publicación en proicfes.com.co).
 */
export const FECHA_LANZAMIENTO = "2026-10-05";

const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

/** «2026-10-05» → «5 de octubre de 2026» (sin zona horaria: no depende del reloj ni del navegador). */
export function fechaLarga(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  return `${Number(m[3])} de ${MESES[Number(m[2]) - 1]} de ${m[1]}`;
}

export const LEGAL = {
  responsable: {
    /** Persona natural responsable del tratamiento (titular de la marca GJM lndustries). */
    nombre: "Gelmis Julian Muñoz Chacón",
    documento: "cédula de ciudadanía 1.112.045.927",
    /** Ciudad de domicilio (también define la jurisdicción de los Términos). */
    ciudad: "Cali, Valle del Cauca",
    direccion: "Calle 3 Oeste #70-34, Cali, Valle del Cauca",
    telefono: "311 411 3632",
    /** Correo para consultas, reclamos y solicitudes de datos personales. */
    correo: "shaconjulian@gmail.com",
  },
  /** Texto de la fecha de vigencia; sale de FECHA_LANZAMIENTO (no editar aquí). */
  fechaVigencia: fechaLarga(FECHA_LANZAMIENTO),
  /** Súbela (1.1, 2.0…) cada vez que cambies las políticas de forma relevante. */
  version: "1.0",
} as const;

export const PLACEHOLDER_RE = /^\[.+\]$/;

/** Campos de LEGAL que aún tienen el texto de ejemplo entre corchetes. */
export function pendingLegalPlaceholders(): string[] {
  const values = [...Object.values(LEGAL.responsable), LEGAL.fechaVigencia];
  return values.filter(v => PLACEHOLDER_RE.test(v));
}
