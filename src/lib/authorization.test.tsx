import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";
import { Router } from "wouter";
import DataAuthorization from "@/components/DataAuthorization";
import { LEGAL, pendingLegalPlaceholders } from "@/config/legal";
import { ageOn, buildAuthorizationRecord, isAuthorizationComplete, variantForBirthDate } from "./authorization";

describe("autorización de tratamiento de datos", () => {
  const hoy = new Date(2026, 9, 4);

  it("calcula la edad y exige representante a menores de 18", () => {
    expect(ageOn(new Date(2008, 9, 4), hoy)).toBe(18);
    expect(ageOn(new Date(2008, 9, 5), hoy)).toBe(17);
    expect(variantForBirthDate(new Date(2008, 9, 5), hoy)).toBe("menor");
    expect(variantForBirthDate(new Date(2008, 9, 4), hoy)).toBe("adulto");
  });

  it("adulto: basta la casilla", () => {
    expect(isAuthorizationComplete("adulto", { accepted: false })).toBe(false);
    expect(isAuthorizationComplete("adulto", { accepted: true })).toBe(true);
  });

  it("menor: exige datos del representante y haber escuchado al menor", () => {
    const base = { accepted: true, guardianName: "Ana Gómez", guardianDocument: "52123456", guardianEmail: "ana@correo.co", minorHeard: true };
    expect(isAuthorizationComplete("menor", base)).toBe(true);
    expect(isAuthorizationComplete("menor", { ...base, minorHeard: false })).toBe(false);
    expect(isAuthorizationComplete("menor", { ...base, guardianEmail: "ana" })).toBe(false);
    expect(isAuthorizationComplete("menor", { ...base, guardianName: "" })).toBe(false);
    expect(isAuthorizationComplete("menor", { ...base, accepted: false })).toBe(false);
  });

  it("genera la prueba de la autorización con versión de la política y fecha", () => {
    const rec = buildAuthorizationRecord("menor", { accepted: true, guardianName: " Ana Gómez ", guardianDocument: "52123456", guardianEmail: "ana@correo.co", minorHeard: true }, new Date("2026-10-04T12:00:00Z"));
    expect(rec).toEqual({ variant: "menor", policyVersion: LEGAL.version, acceptedAt: "2026-10-04T12:00:00.000Z", guardian: { name: "Ana Gómez", document: "52123456", email: "ana@correo.co" } });
    expect(() => buildAuthorizationRecord("adulto", { accepted: false })).toThrow();
  });

  it("el componente muestra la variante correcta y enlaza las políticas", () => {
    const render = (variant: "adulto" | "menor") =>
      renderToString(
        <Router ssrPath="/registro">
          <DataAuthorization variant={variant} value={{ accepted: false }} onChange={() => {}} />
        </Router>,
      );
    const adulto = render("adulto");
    const menor = render("menor");
    expect(adulto).toContain("/tratamiento-de-datos");
    expect(adulto).not.toContain("representante");
    expect(menor).toContain("Nombre del representante");
    expect(menor).toContain("tuve en cuenta su opinión");
  });

  it("lista los datos legales pendientes por llenar", () => {
    const pending = pendingLegalPlaceholders();
    for (const p of pending) expect(p).toMatch(/^\[.+\]$/);
  });
});
