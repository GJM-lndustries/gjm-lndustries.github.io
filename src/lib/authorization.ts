/**
 * Autorización de tratamiento de datos (Ley 1581 de 2012) para el registro.
 * - Adulto (≥ 18): casilla de autorización del Titular.
 * - Menor (< 18): casilla en la que el menor declara tener permiso de su papá, mamá o acudiente
 *   para usar el servicio y guardar su progreso (mecanismo ligero; no pedimos datos del acudiente).
 */
import { LEGAL } from "@/config/legal";

export type AuthorizationVariant = "adulto" | "menor";

export interface AuthorizationValue {
  /**
   * Adulto: «Autorizo el tratamiento…».
   * Menor: «Confirmo que tengo permiso de mi papá, mamá o acudiente…».
   */
  accepted: boolean;
}

export interface AuthorizationRecord {
  variant: AuthorizationVariant;
  policyVersion: string;
  acceptedAt: string;
  /** Solo variante «menor»: el estudiante declaró tener permiso del acudiente. */
  guardianPermissionConfirmed?: boolean;
}

export const MAYORIA_DE_EDAD = 18;

/** Edad cumplida a una fecha (por defecto, hoy). */
export function ageOn(birthDate: Date, today: Date = new Date()): number {
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
}

/** Variante de autorización según la fecha de nacimiento. */
export function variantForBirthDate(
  birthDate: Date,
  today: Date = new Date()
): AuthorizationVariant {
  return ageOn(birthDate, today) < MAYORIA_DE_EDAD ? "menor" : "adulto";
}

/** ¿Se puede crear la cuenta con esta autorización? */
export function isAuthorizationComplete(
  variant: AuthorizationVariant,
  v: AuthorizationValue
): boolean {
  return !!v.accepted;
}

/** Prueba de la autorización para guardar junto a la cuenta. */
export function buildAuthorizationRecord(
  variant: AuthorizationVariant,
  v: AuthorizationValue,
  now: Date = new Date()
): AuthorizationRecord {
  if (!isAuthorizationComplete(variant, v))
    throw new Error("Autorización incompleta");
  return {
    variant,
    policyVersion: LEGAL.version,
    acceptedAt: now.toISOString(),
    ...(variant === "menor" ? { guardianPermissionConfirmed: true } : {}),
  };
}
