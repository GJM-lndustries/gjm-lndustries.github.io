import { describe, expect, it } from "vitest";
import { SITE } from "@/config/site";
import { buildAuthorizationRecord } from "./authorization";
import {
  ACCOUNTS_ENABLED,
  PENDING_SIGNUP_KEY,
  authErrorMessage,
  profileRowFrom,
  readPendingSignup,
  type PendingSignup,
} from "./accounts";

const mem = (init: Record<string, string> = {}) => {
  const m = new Map(Object.entries(init));
  return {
    getItem: (k: string) => m.get(k) ?? null,
    setItem: (k: string, v: string) => void m.set(k, v),
    removeItem: (k: string) => void m.delete(k),
  };
};
const now = new Date("2026-10-04T15:00:00Z");
const adult: PendingSignup = {
  birthYear: 1999,
  variant: "adulto",
  authorization: buildAuthorizationRecord("adulto", { accepted: true }, now),
  createdAt: now.toISOString(),
};
const minor: PendingSignup = {
  birthYear: 2010,
  variant: "menor",
  authorization: buildAuthorizationRecord(
    "menor",
    {
      accepted: true,
      guardianName: "Ana Pérez",
      guardianDocument: "12345678",
      guardianEmail: "ana@example.com",
      minorHeard: true,
    },
    now
  ),
  displayName: "  Sofi  ",
  createdAt: now.toISOString(),
};

describe("cuentas", () => {
  it("con URL y clave anon de Supabase las cuentas están activas", () => {
    expect(SITE.integrations.supabaseUrl).toMatch(
      /^https:\/\/.+\.supabase\.co$/
    );
    expect(SITE.integrations.supabaseAnonKey.length).toBeGreaterThan(20);
    expect(ACCOUNTS_ENABLED).toBe(true);
    expect(SITE.integrations.googleSignIn).toBe(false);
  });

  it("perfil de adulto: sin datos de representante", () => {
    const row = profileRowFrom("u1", adult, {
      version: 1,
      date: "2026-10-04T14:00:00Z",
      necessary: true,
      analytics: false,
      ads: false,
    });
    expect(row).toMatchObject({
      id: "u1",
      birth_year: 1999,
      is_minor: false,
      guardian_name: null,
      minor_heard: false,
      consent_version: "1",
    });
    expect(row.data_authorization_at).toBe(now.toISOString());
  });

  it("perfil de menor: incluye la autorización del representante", () => {
    const row = profileRowFrom("u2", minor, null);
    expect(row).toMatchObject({
      is_minor: true,
      guardian_name: "Ana Pérez",
      guardian_document: "12345678",
      guardian_email: "ana@example.com",
      minor_heard: true,
      display_name: "Sofi",
      consent_version: null,
    });
  });

  it("menor sin representante: no se crea el perfil", () => {
    expect(() =>
      profileRowFrom(
        "u3",
        {
          ...minor,
          authorization: { ...minor.authorization, guardian: undefined },
        },
        null
      )
    ).toThrow();
  });

  it("registro pendiente: se lee, caduca a las 24 h y descarta datos incompletos", () => {
    const s = mem({ [PENDING_SIGNUP_KEY]: JSON.stringify(minor) });
    expect(readPendingSignup(s, now.getTime())?.variant).toBe("menor");
    expect(readPendingSignup(s, now.getTime() + 25 * 3600_000)).toBeNull();
    const broken = mem({
      [PENDING_SIGNUP_KEY]: JSON.stringify({
        ...minor,
        authorization: { ...minor.authorization, guardian: undefined },
      }),
    });
    expect(readPendingSignup(broken, now.getTime())).toBeNull();
    expect(
      readPendingSignup(mem({ [PENDING_SIGNUP_KEY]: "{" }), now.getTime())
    ).toBeNull();
  });

  it("errores en español", () => {
    expect(authErrorMessage("Signups not allowed for otp")).toMatch(
      /Crear cuenta/
    );
    expect(
      authErrorMessage(
        "For security purposes, you can only request this after 60 seconds"
      )
    ).toMatch(/minuto/);
    expect(authErrorMessage(undefined)).toMatch(/Intenta de nuevo/);
  });
});
