/**
 * Consentimiento de cookies y almacenamiento (categorías: necesarias, analíticas, publicidad).
 *
 * - Se guarda en localStorage (`proicfes_consent`) con versión y fecha. Si cambia
 *   CONSENT_VERSION (por ejemplo, porque se agrega un servicio nuevo), se vuelve a preguntar.
 * - Google Consent Mode v2: todo lo no necesario arranca en «denied» (script en el <head>
 *   generado por `consentDefaultsScript()`) y se actualiza cuando la persona decide.
 */
export const CONSENT_STORAGE_KEY = "proicfes_consent";
export const CONSENT_VERSION = 1;

export type ConsentCategory = "analytics" | "ads";

export interface ConsentChoices {
  analytics: boolean;
  ads: boolean;
}

export interface StoredConsent {
  version: number;
  /** Fecha ISO de la decisión (sirve como prueba del consentimiento). */
  date: string;
  /** Las necesarias siempre están activas. */
  necessary: true;
  analytics: boolean;
  ads: boolean;
}

export const ALL_GRANTED: ConsentChoices = { analytics: true, ads: true };
export const ALL_DENIED: ConsentChoices = { analytics: false, ads: false };

export function makeConsent(choices: ConsentChoices, now: Date = new Date()): StoredConsent {
  return { version: CONSENT_VERSION, date: now.toISOString(), necessary: true, analytics: !!choices.analytics, ads: !!choices.ads };
}

/** Lee un consentimiento guardado; devuelve null si no existe, está dañado o es de otra versión. */
export function parseConsent(raw: string | null | undefined): StoredConsent | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw) as Partial<StoredConsent>;
    if (v?.version !== CONSENT_VERSION) return null;
    if (typeof v.analytics !== "boolean" || typeof v.ads !== "boolean") return null;
    if (typeof v.date !== "string" || Number.isNaN(Date.parse(v.date))) return null;
    return { version: v.version, date: v.date, necessary: true, analytics: v.analytics, ads: v.ads };
  } catch {
    return null;
  }
}

export function readConsent(storage: Pick<Storage, "getItem"> | undefined = safeStorage()): StoredConsent | null {
  try {
    return parseConsent(storage?.getItem(CONSENT_STORAGE_KEY));
  } catch {
    return null;
  }
}

export function writeConsent(consent: StoredConsent, storage: Pick<Storage, "setItem"> | undefined = safeStorage()): void {
  try {
    storage?.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consent));
  } catch {
    /* almacenamiento bloqueado: la decisión vale solo para esta visita */
  }
}

function safeStorage(): Storage | undefined {
  try {
    return typeof window === "undefined" ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
}

type ConsentValue = "granted" | "denied";
export interface GoogleConsentState {
  ad_storage: ConsentValue;
  ad_user_data: ConsentValue;
  ad_personalization: ConsentValue;
  analytics_storage: ConsentValue;
  functionality_storage: ConsentValue;
  security_storage: ConsentValue;
}

/** Traduce las categorías a los parámetros de Google Consent Mode v2. */
export function toGoogleConsent(c: ConsentChoices | null): GoogleConsentState {
  const ads: ConsentValue = c?.ads ? "granted" : "denied";
  return {
    ad_storage: ads,
    ad_user_data: ads,
    ad_personalization: ads,
    analytics_storage: c?.analytics ? "granted" : "denied",
    functionality_storage: "granted",
    security_storage: "granted",
  };
}

/**
 * Script en línea para el <head>, antes de cualquier etiqueta de Google: define `gtag`,
 * fija los valores por defecto en «denied» y, si ya hay una decisión guardada y vigente,
 * la aplica de inmediato.
 */
export function consentDefaultsScript(): string {
  const defaults = { ...toGoogleConsent(null), wait_for_update: 500 };
  return [
    "window.dataLayer=window.dataLayer||[];",
    "function gtag(){dataLayer.push(arguments);}",
    `gtag('consent','default',${JSON.stringify(defaults)});`,
    "try{",
    `var c=JSON.parse(localStorage.getItem(${JSON.stringify(CONSENT_STORAGE_KEY)})||'null');`,
    `if(c&&c.version===${CONSENT_VERSION}){var a=c.ads?'granted':'denied';`,
    "gtag('consent','update',{ad_storage:a,ad_user_data:a,ad_personalization:a,analytics_storage:c.analytics?'granted':'denied'});}",
    "}catch(e){}",
  ].join("");
}
