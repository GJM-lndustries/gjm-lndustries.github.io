/**
 * Cuentas opcionales con Supabase (correo+contraseña, enlace mágico, Google).
 * Menores: casilla de permiso del acudiente (sin datos del representante).
 * Si SITE.integrations.supabaseUrl / supabaseAnonKey están vacíos, ACCOUNTS_ENABLED es false.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { SITE } from "@/config/site";
import type { AuthorizationRecord, AuthorizationVariant } from "./authorization";
import type { StoredConsent } from "./consent";

export const ACCOUNTS_ENABLED = Boolean(SITE.integrations.supabaseUrl && SITE.integrations.supabaseAnonKey);

/** Ruta de retorno de OAuth / magic link / reset (debe estar en Redirect URLs de Supabase). */
export const AUTH_CALLBACK_PATH = "/cuenta";
export const AUTH_STORAGE_KEY = "proicfes_auth";
export const PENDING_SIGNUP_KEY = "proicfes_pending_signup";

/** Mínimo alineado con Supabase (password_min_length = 8). */
export const PASSWORD_MIN_LENGTH = 8;

let client: Promise<SupabaseClient> | null = null;

export function getSupabase(): Promise<SupabaseClient> | null {
  if (!ACCOUNTS_ENABLED || typeof window === "undefined") return null;
  client ??= import("@supabase/supabase-js").then(({ createClient }) =>
    createClient(SITE.integrations.supabaseUrl, SITE.integrations.supabaseAnonKey, {
      auth: {
        flowType: "pkce",
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: AUTH_STORAGE_KEY,
      },
    })
  );
  return client;
}

export function callbackUrl(origin: string = window.location.origin, path = AUTH_CALLBACK_PATH): string {
  return origin + path;
}

export function resetCallbackUrl(origin: string = window.location.origin): string {
  return `${origin}${AUTH_CALLBACK_PATH}?reset=1`;
}

export interface PendingSignup {
  birthYear: number;
  variant: AuthorizationVariant;
  authorization: AuthorizationRecord;
  displayName?: string;
  createdAt: string;
}

const PENDING_MAX_AGE_MS = 24 * 60 * 60 * 1000;

export function savePendingSignup(p: PendingSignup, storage: Pick<Storage, "setItem"> = localStorage): void {
  storage.setItem(PENDING_SIGNUP_KEY, JSON.stringify(p));
}

export function readPendingSignup(storage: Pick<Storage, "getItem"> = localStorage, now: number = Date.now()): PendingSignup | null {
  try {
    const p = JSON.parse(storage.getItem(PENDING_SIGNUP_KEY) ?? "null") as PendingSignup | null;
    if (!p || typeof p.birthYear !== "number" || !p.authorization || (p.variant !== "adulto" && p.variant !== "menor")) return null;
    if (now - Date.parse(p.createdAt) > PENDING_MAX_AGE_MS) return null;
    if (p.variant === "menor" && !p.authorization.guardianPermissionConfirmed) return null;
    return p;
  } catch {
    return null;
  }
}

export function clearPendingSignup(storage: Pick<Storage, "removeItem"> = localStorage): void {
  storage.removeItem(PENDING_SIGNUP_KEY);
}

export interface ProfileRow {
  id: string;
  display_name: string | null;
  birth_year: number;
  is_minor: boolean;
  guardian_name: string | null;
  guardian_document: string | null;
  guardian_email: string | null;
  minor_heard: boolean;
  data_policy_version: string;
  data_authorization_at: string;
  consent_version: string | null;
  consent_at: string | null;
}

export function profileRowFrom(userId: string, p: PendingSignup, consent: StoredConsent | null): ProfileRow {
  const minor = p.variant === "menor";
  if (minor && !p.authorization.guardianPermissionConfirmed) throw new Error("Falta la confirmación del permiso del acudiente");
  const name = p.displayName?.trim();
  return {
    id: userId,
    display_name: name ? name.slice(0, 80) : null,
    birth_year: p.birthYear,
    is_minor: minor,
    guardian_name: null,
    guardian_document: null,
    guardian_email: null,
    minor_heard: minor,
    data_policy_version: p.authorization.policyVersion,
    data_authorization_at: p.authorization.acceptedAt,
    consent_version: consent ? String(consent.version) : null,
    consent_at: consent ? consent.date : null,
  };
}

export type AuthErrorKind =
  | "no-account"
  | "unconfirmed"
  | "rate-limit"
  | "invalid-credentials"
  | "weak-password"
  | "invalid-email"
  | "generic";

export interface AuthErrorInfo {
  kind: AuthErrorKind;
  message: string;
}

/** Clasifica errores de Supabase Auth para la UI. */
export function classifyAuthError(message: string | undefined): AuthErrorInfo {
  const m = (message ?? "").toLowerCase();
  if (m.includes("signups not allowed") || m.includes("otp_disabled") || m.includes("user not found"))
    return { kind: "no-account", message: "No encontramos una cuenta con ese correo. Si es tu primera vez, crea una cuenta." };
  if (m.includes("email not confirmed") || m.includes("not confirmed"))
    return {
      kind: "unconfirmed",
      message: "Todavía no confirmaste tu correo. Revisa tu bandeja (y spam) o pide que te reenviemos el enlace.",
    };
  if (m.includes("rate limit") || m.includes("security purposes") || m.includes("over_email") || m.includes("429"))
    return { kind: "rate-limit", message: "Demasiados intentos. Espera un minuto y vuelve a probar." };
  if (m.includes("invalid login") || m.includes("invalid credentials") || m.includes("wrong password") || m.includes("invalid_credentials"))
    return { kind: "invalid-credentials", message: "Correo o contraseña incorrectos. Revísalos, usa «Olvidé mi contraseña» o crea una cuenta si es tu primera vez." };
  if (m.includes("password") && (m.includes("least") || m.includes("weak") || m.includes("short") || m.includes("characters")))
    return { kind: "weak-password", message: `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres.` };
  if ((m.includes("invalid") && m.includes("email")) || m.includes("email_address_invalid"))
    return { kind: "invalid-email", message: "Revisa el correo: parece que no es válido." };
  if (m.includes("expired") || (m.includes("otp") && !m.includes("otp_disabled")))
    return { kind: "generic", message: "El enlace venció o ya se usó. Pide uno nuevo." };
  if (m.includes("provider is not enabled") || m.includes("unsupported provider"))
    return { kind: "generic", message: "Ese método aún no está disponible. Usa correo y contraseña." };
  if (m.includes("acudiente") || m.includes("representante"))
    return { kind: "generic", message: "Un menor de 18 años debe confirmar el permiso de su acudiente." };
  if (m.includes("fetch") || m.includes("network"))
    return { kind: "generic", message: "No hay conexión con el servidor. Revisa tu internet e intenta de nuevo." };
  if (m.includes("user already registered") || m.includes("already been registered"))
    return { kind: "generic", message: "Ese correo ya tiene cuenta. Usa «Iniciar sesión» o «Olvidé mi contraseña»." };
  return { kind: "generic", message: "Algo salió mal. Intenta de nuevo en unos minutos." };
}

export function authErrorMessage(message: string | undefined): string {
  return classifyAuthError(message).message;
}

export function validatePassword(password: string): string | null {
  if (password.length < PASSWORD_MIN_LENGTH) return `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres.`;
  return null;
}

/** Inicial del correo o nombre para el avatar del menú. */
export function accountInitial(emailOrName: string | null | undefined): string {
  const s = (emailOrName ?? "").trim();
  if (!s) return "?";
  return s[0]!.toUpperCase();
}
