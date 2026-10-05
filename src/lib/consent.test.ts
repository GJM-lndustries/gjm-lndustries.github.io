import { describe, expect, it } from "vitest";
import {
  ALL_DENIED,
  ALL_GRANTED,
  CONSENT_STORAGE_KEY,
  CONSENT_VERSION,
  consentDefaultsScript,
  makeConsent,
  parseConsent,
  readConsent,
  toGoogleConsent,
  writeConsent,
} from "./consent";
import { loadAds, loadAnalytics, planThirdPartyScripts } from "./thirdParty";

function memoryStorage() {
  const data = new Map<string, string>();
  return { getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => void data.set(k, v), data };
}

describe("consentimiento de cookies", () => {
  it("guarda versión, fecha y categorías, y se puede leer de nuevo", () => {
    const store = memoryStorage();
    const c = makeConsent({ analytics: true, ads: false }, new Date("2026-10-04T15:00:00Z"));
    writeConsent(c, store);
    const raw = JSON.parse(store.data.get(CONSENT_STORAGE_KEY)!);
    expect(raw).toMatchObject({ version: CONSENT_VERSION, date: "2026-10-04T15:00:00.000Z", necessary: true, analytics: true, ads: false });
    expect(readConsent(store)).toEqual(c);
  });

  it("sin decisión, dañada o de otra versión → vuelve a preguntar (null)", () => {
    expect(parseConsent(null)).toBeNull();
    expect(parseConsent("no-es-json")).toBeNull();
    expect(parseConsent(JSON.stringify({ ...makeConsent(ALL_GRANTED), version: CONSENT_VERSION + 1 }))).toBeNull();
    expect(parseConsent(JSON.stringify({ version: CONSENT_VERSION, date: "x", analytics: true, ads: true }))).toBeNull();
    expect(parseConsent(JSON.stringify({ version: CONSENT_VERSION, date: new Date().toISOString(), analytics: "sí", ads: true }))).toBeNull();
  });

  it("las necesarias siempre quedan activas aunque se rechace todo", () => {
    expect(makeConsent(ALL_DENIED).necessary).toBe(true);
  });

  it("traduce a Google Consent Mode v2 (por defecto todo denegado)", () => {
    expect(toGoogleConsent(null)).toEqual({
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: "denied",
      functionality_storage: "granted",
      security_storage: "granted",
    });
    expect(toGoogleConsent({ analytics: true, ads: false })).toMatchObject({ analytics_storage: "granted", ad_storage: "denied", ad_user_data: "denied" });
    expect(toGoogleConsent(ALL_GRANTED)).toMatchObject({ ad_storage: "granted", ad_user_data: "granted", ad_personalization: "granted" });
  });

  it("el script del <head> fija «denied» por defecto y aplica la decisión guardada", () => {
    const script = consentDefaultsScript();
    const pushed: unknown[][] = [];
    const store = memoryStorage();
    store.setItem(CONSENT_STORAGE_KEY, JSON.stringify(makeConsent({ analytics: true, ads: false })));
    const win: Record<string, unknown> = {};
    new Function("window", "localStorage", "dataLayer", `${script.replace("window.dataLayer=window.dataLayer||[];", "")}`)(win, store, {
      push: (args: IArguments) => pushed.push([...args]),
    });
    expect(pushed[0]).toEqual(["consent", "default", expect.objectContaining({ ad_storage: "denied", analytics_storage: "denied", wait_for_update: 500 })]);
    expect(pushed[1]).toEqual(["consent", "update", { ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied", analytics_storage: "granted" }]);
  });
});

describe("carga de terceros", () => {
  const ids = { gaMeasurementId: "G-ABC123", adsenseClientId: "ca-pub-1234567890" };

  it("no carga nada sin consentimiento, aunque haya IDs", () => {
    expect(planThirdPartyScripts(null, ids)).toEqual([]);
    expect(planThirdPartyScripts(ALL_DENIED, ids)).toEqual([]);
  });

  it("carga solo la categoría aceptada", () => {
    expect(planThirdPartyScripts({ analytics: true, ads: false }, ids).map(p => p.id)).toEqual(["analytics"]);
    expect(planThirdPartyScripts({ analytics: false, ads: true }, ids).map(p => p.id)).toEqual(["ads"]);
    expect(planThirdPartyScripts(ALL_GRANTED, ids).map(p => p.src)).toEqual([
      "https://www.googletagmanager.com/gtag/js?id=G-ABC123",
      "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1234567890",
    ]);
  });

  it("sin IDs configurados (hoy) es un no-op incluso con todo aceptado", () => {
    expect(planThirdPartyScripts(ALL_GRANTED, { gaMeasurementId: "", adsenseClientId: "" })).toEqual([]);
    expect(loadAnalytics(ALL_GRANTED)).toBe(false);
    expect(loadAds(ALL_GRANTED)).toBe(false);
  });

  it("ignora IDs con formato inválido", () => {
    expect(planThirdPartyScripts(ALL_GRANTED, { gaMeasurementId: "UA-1", adsenseClientId: "pub-1" })).toEqual([]);
  });
});
