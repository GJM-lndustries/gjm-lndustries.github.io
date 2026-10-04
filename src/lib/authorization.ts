/**
 * Lógica de la autorización de tratamiento de datos (Ley 1581 de 2012) para el futuro registro.
 * Menores de 18 años: autoriza el padre, madre o representante legal, después de escuchar al menor
 * (art. 7 Ley 1581 de 2012; art. 2.2.2.25.2.9 Decreto 1074 de 2015).
 */
import { LEGAL } from "@/config/legal";

export type AuthorizationVariant = "adulto" | "menor";

export interface AuthorizationValue {
  /** Casilla principal: «Autorizo el tratamiento…». */
  accepted: boolean;
  /** Solo variante «menor». */
  guardianName?: string;
  guardianDocument?: string;
  guardianEmail?: string;
  /** El representante declara que escuchó la opinión del menor. */
  minorHeard?: boolean;
}

export interface AuthorizationRecord {
  variant: AuthorizationVariant;
  policyVersion: string;
  acceptedAt: string;
  guardian?: { name: string; document: string; email: string };
}

export const MAYORIA_DE_EDAD = 18;

/** Edad cumplida a una fecha (por defecto, hoy). */
export function ageOn(birthDate: Date, today: Date = new Date()): number {
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
}

/** Variante de autorización que corresponde según la fecha de nacimiento. */
export function variantForBirthDate(birthDate: Date, today: Date = new Date()): AuthorizationVariant {
  return ageOn(birthDate, today) < MAYORIA_DE_EDAD ? "menor" : "adulto";
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** ¿Se puede crear la cuenta con esta autorización? */
export function isAuthorizationComplete(variant: AuthorizationVariant, v: AuthorizationValue): boolean {
  if (!v.accepted) return false;
  if (variant === "adulto") return true;
  return (
    !!v.minorHeard &&
    (v.guardianName ?? "").trim().length >= 3 &&
    (v.guardianDocument ?? "").trim().length >= 5 &&
    EMAIL_RE.test((v.guardianEmail ?? "").trim())
  );
}

/** Prueba de la autorización para guardar junto a la cuenta (art. 2.2.2.25.2.5 Decreto 1074 de 2015). */
export function buildAuthorizationRecord(variant: AuthorizationVariant, v: AuthorizationValue, now: Date = new Date()): AuthorizationRecord {
  if (!isAuthorizationComplete(variant, v)) throw new Error("Autorización incompleta");
  return {
    variant,
    policyVersion: LEGAL.version,
    acceptedAt: now.toISOString(),
    ...(variant === "menor"
      ? { guardian: { name: v.guardianName!.trim(), document: v.guardianDocument!.trim(), email: v.guardianEmail!.trim() } }
      : {}),
  };
}
