/**
 * Carga de servicios de terceros (Google Analytics / AdSense) SOLO con consentimiento.
 * Mientras no haya IDs en SITE.integrations, todo es un no-op: no se carga nada.
 */
import { SITE } from "@/config/site";
import { toGoogleConsent, type ConsentChoices } from "./consent";

export interface IntegrationIds {
  gaMeasurementId: string;
  adsenseClientId: string;
}

export interface ScriptPlan {
  id: "analytics" | "ads";
  src: string;
}

/** Decide qué scripts se pueden cargar según el consentimiento y los IDs configurados. */
export function planThirdPartyScripts(consent: ConsentChoices | null, ids: IntegrationIds = SITE.integrations): ScriptPlan[] {
  const plan: ScriptPlan[] = [];
  if (consent?.analytics && /^G-[A-Z0-9]+$/.test(ids.gaMeasurementId)) {
    plan.push({ id: "analytics", src: `https://www.googletagmanager.com/gtag/js?id=${ids.gaMeasurementId}` });
  }
  if (consent?.ads && /^ca-pub-\d+$/.test(ids.adsenseClientId)) {
    plan.push({ id: "ads", src: `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ids.adsenseClientId}` });
  }
  return plan;
}

type Gtag = (...args: unknown[]) => void;
function gtag(): Gtag | undefined {
  if (typeof window === "undefined") return undefined;
  const w = window as unknown as { gtag?: Gtag; dataLayer?: unknown[] };
  if (!w.gtag) {
    w.dataLayer = w.dataLayer || [];
    w.gtag = function () { (w.dataLayer as unknown[]).push(arguments); };
  }
  return w.gtag;
}

const loaded = new Set<string>();

function injectScript(plan: ScriptPlan) {
  if (loaded.has(plan.id) || typeof document === "undefined") return;
  loaded.add(plan.id);
  const s = document.createElement("script");
  s.async = true;
  s.src = plan.src;
  if (plan.id === "ads") s.crossOrigin = "anonymous";
  s.dataset.consent = plan.id;
  document.head.appendChild(s);
}

/** Informa a Google Consent Mode la decisión actual (no carga nada por sí mismo). */
export function updateGoogleConsent(consent: ConsentChoices | null) {
  gtag()?.("consent", "update", toGoogleConsent(consent));
}

/** Carga Google Analytics si hay ID configurado y la persona aceptó «analíticas». Si no, no hace nada. */
export function loadAnalytics(consent: ConsentChoices | null): boolean {
  const plan = planThirdPartyScripts(consent).find(p => p.id === "analytics");
  if (!plan) return false;
  const g = gtag()!;
  g("js", new Date());
  g("config", SITE.integrations.gaMeasurementId, { anonymize_ip: true });
  injectScript(plan);
  return true;
}

/** Carga Google AdSense si hay ID configurado y la persona aceptó «publicidad». Si no, no hace nada. */
export function loadAds(consent: ConsentChoices | null): boolean {
  const plan = planThirdPartyScripts(consent).find(p => p.id === "ads");
  if (!plan) return false;
  injectScript(plan);
  return true;
}

/** ¿Hay algún script de terceros ya cargado en esta visita? */
export function loadedThirdParties(): string[] {
  return [...loaded];
}
