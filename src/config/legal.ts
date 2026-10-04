/**
 * Datos del Responsable del Tratamiento y de las políticas legales.
 *
 * ⚠️ LLENAR ANTES DE PUBLICAR: reemplaza cada valor entre [CORCHETES]. Se usan en
 * /tratamiento-de-datos, /politica-de-privacidad, /terminos y /cookies. Mientras quede alguno
 * sin llenar, el sitio lo muestra resaltado y `pnpm build` muestra una advertencia.
 * (Decreto 1377 de 2013, compilado en el Decreto 1074 de 2015, art. 2.2.2.25.3.1: la política debe
 * indicar nombre o razón social, domicilio, dirección, correo electrónico y teléfono del Responsable.)
 */
export const LEGAL = {
  responsable: {
    /** Persona natural o jurídica responsable (puede ser el titular de la marca GJM lndustries). */
    nombre: "[NOMBRE COMPLETO DEL RESPONSABLE]",
    /** Tipo y número: «C.C. 1.234.567.890» o «NIT 900.123.456-7». */
    documento: "[CÉDULA/NIT]",
    /** Ciudad de domicilio (también define la jurisdicción de los Términos). */
    ciudad: "[CIUDAD]",
    direccion: "[DIRECCIÓN FÍSICA]",
    telefono: "[TELÉFONO DE CONTACTO]",
    /** Correo para consultas, reclamos y solicitudes de datos personales. */
    correo: "[CORREO DE CONTACTO]",
  },
  /** Fecha desde la que rigen las políticas, p. ej. «1 de noviembre de 2026». */
  fechaVigencia: "[FECHA DE ENTRADA EN VIGENCIA]",
  /** Súbela (1.1, 2.0…) cada vez que cambies las políticas de forma relevante. */
  version: "1.0",
} as const;

export const PLACEHOLDER_RE = /^\[.+\]$/;

/** Campos de LEGAL que aún tienen el texto de ejemplo entre corchetes. */
export function pendingLegalPlaceholders(): string[] {
  const values = [...Object.values(LEGAL.responsable), LEGAL.fechaVigencia];
  return values.filter(v => PLACEHOLDER_RE.test(v));
}
