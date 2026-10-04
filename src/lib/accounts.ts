/**
 * Cuentas opcionales con Supabase (Google y enlace mágico por correo).
 * Si SITE.integrations.supabaseUrl / supabaseAnonKey están vacíos, ACCOUNTS_ENABLED es false:
 * no se descarga @supabase/supabase-js, no se hace ninguna petición y la app funciona solo con
 * el progreso local, como siempre.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { SITE } from "@/config/site";
import type {
  AuthorizationRecord,
  AuthorizationVariant,
} from "./authorization";
import type { StoredConsent } from "./consent";

export const ACCOUNTS_ENABLED = Boolean(
  SITE.integrations.supabaseUrl && SITE.integrations.supabaseAnonKey
);

/** Ruta a la que vuelven Google y el enlace del correo (debe estar en «Redirect URLs» de Supabase). */
export const AUTH_CALLBACK_PATH = "/cuenta";
export const AUTH_STORAGE_KEY = "proicfes_auth";
export const PENDING_SIGNUP_KEY = "proicfes_pending_signup";

let client: Promise<SupabaseClient> | null = null;

/** Cliente de Supabase (se descarga solo la primera vez que se pide). null si no hay cuentas. */
export function getSupabase(): Promise<SupabaseClient> | null {
  if (!ACCOUNTS_ENABLED || typeof window === "undefined") return null;
  client ??= import("@supabase/supabase-js").then(({ createClient }) =>
    createClient(
      SITE.integrations.supabaseUrl,
      SITE.integrations.supabaseAnonKey,
      {
        auth: {
          flowType: "pkce",
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storageKey: AUTH_STORAGE_KEY,
        },
      }
    )
  );
  return client;
}

export function callbackUrl(origin: string = window.location.origin): string {
  return origin + AUTH_CALLBACK_PATH;
}

/**
 * Datos del registro que se guardan ANTES de ir a Google o de enviar el enlace por correo,
 * para crear el perfil cuando la persona vuelve con la sesión iniciada.
 */
export interface PendingSignup {
  birthYear: number;
  variant: AuthorizationVariant;
  authorization: AuthorizationRecord;
  displayName?: string;
  createdAt: string;
}

/** El registro pendiente caduca a las 24 horas (el enlace del correo dura menos). */
const PENDING_MAX_AGE_MS = 24 * 60 * 60 * 1000;

export function savePendingSignup(
  p: PendingSignup,
  storage: Pick<Storage, "setItem"> = localStorage
): void {
  storage.setItem(PENDING_SIGNUP_KEY, JSON.stringify(p));
}

export function readPendingSignup(
  storage: Pick<Storage, "getItem"> = localStorage,
  now: number = Date.now()
): PendingSignup | null {
  try {
    const p = JSON.parse(
      storage.getItem(PENDING_SIGNUP_KEY) ?? "null"
    ) as PendingSignup | null;
    if (
      !p ||
      typeof p.birthYear !== "number" ||
      !p.authorization ||
      (p.variant !== "adulto" && p.variant !== "menor")
    )
      return null;
    if (now - Date.parse(p.createdAt) > PENDING_MAX_AGE_MS) return null;
    if (p.variant === "menor" && !p.authorization.guardian) return null;
    return p;
  } catch {
    return null;
  }
}

export function clearPendingSignup(
  storage: Pick<Storage, "removeItem"> = localStorage
): void {
  storage.removeItem(PENDING_SIGNUP_KEY);
}

/** Fila de public.profiles (supabase/migrations/0001_init.sql). */
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

/** Arma la fila del perfil a partir del registro pendiente y de la elección de cookies vigente. */
export function profileRowFrom(
  userId: string,
  p: PendingSignup,
  consent: StoredConsent | null
): ProfileRow {
  const minor = p.variant === "menor";
  const g = p.authorization.guardian;
  if (minor && !g)
    throw new Error("Falta la autorización del representante legal");
  const name = p.displayName?.trim();
  return {
    id: userId,
    display_name: name ? name.slice(0, 80) : null,
    birth_year: p.birthYear,
    is_minor: minor,
    guardian_name: minor ? g!.name : null,
    guardian_document: minor ? g!.document : null,
    guardian_email: minor ? g!.email : null,
    // isAuthorizationComplete() exige que el representante declare haber escuchado al menor.
    minor_heard: minor,
    data_policy_version: p.authorization.policyVersion,
    data_authorization_at: p.authorization.acceptedAt,
    consent_version: consent ? String(consent.version) : null,
    consent_at: consent ? consent.date : null,
  };
}

/** Mensajes de error de Supabase en español claro. */
export function authErrorMessage(message: string | undefined): string {
  const m = (message ?? "").toLowerCase();
  if (m.includes("signups not allowed") || m.includes("user not found"))
    return "No encontramos una cuenta con ese correo. Si es tu primera vez, usa «Crear cuenta».";
  if (m.includes("rate limit") || m.includes("security purposes"))
    return "Espera un minuto antes de pedir otro enlace.";
  if (m.includes("invalid") && m.includes("email"))
    return "Revisa el correo: parece que no es válido.";
  if (m.includes("expired") || m.includes("otp"))
    return "El enlace venció o ya se usó. Pide uno nuevo.";
  if (m.includes("representante"))
    return "Un menor de 18 años necesita la autorización de su representante legal.";
  if (m.includes("fetch") || m.includes("network"))
    return "No hay conexión con el servidor. Revisa tu internet e intenta de nuevo.";
  return "Algo salió mal. Intenta de nuevo en unos minutos.";
}
