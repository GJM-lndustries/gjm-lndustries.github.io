import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";
import { Router } from "wouter";
import DataAuthorization from "@/components/DataAuthorization";
import {
  FECHA_LANZAMIENTO,
  LEGAL,
  fechaLarga,
  pendingLegalPlaceholders,
} from "@/config/legal";
import {
  ageOn,
  buildAuthorizationRecord,
  isAuthorizationComplete,
  variantForBirthDate,
} from "./authorization";

describe("autorización de tratamiento de datos", () => {
  const hoy = new Date(2026, 9, 4);

  it("calcula la edad y clasifica menores de 18", () => {
    expect(ageOn(new Date(2008, 9, 4), hoy)).toBe(18);
    expect(ageOn(new Date(2008, 9, 5), hoy)).toBe(17);
    expect(variantForBirthDate(new Date(2008, 9, 5), hoy)).toBe("menor");
    expect(variantForBirthDate(new Date(2008, 9, 4), hoy)).toBe("adulto");
  });

  it("adulto: basta la casilla de tratamiento de datos", () => {
    expect(isAuthorizationComplete("adulto", { accepted: false })).toBe(false);
    expect(isAuthorizationComplete("adulto", { accepted: true })).toBe(true);
  });

  it("menor: basta la casilla de permiso del acudiente (sin datos del representante)", () => {
    expect(isAuthorizationComplete("menor", { accepted: false })).toBe(false);
    expect(isAuthorizationComplete("menor", { accepted: true })).toBe(true);
  });

  it("genera la prueba de la autorización con versión de la política y fecha", () => {
    const adulto = buildAuthorizationRecord(
      "adulto",
      { accepted: true },
      new Date("2026-10-04T12:00:00Z")
    );
    expect(adulto).toEqual({
      variant: "adulto",
      policyVersion: LEGAL.version,
      acceptedAt: "2026-10-04T12:00:00.000Z",
    });
    const menor = buildAuthorizationRecord(
      "menor",
      { accepted: true },
      new Date("2026-10-04T12:00:00Z")
    );
    expect(menor).toEqual({
      variant: "menor",
      policyVersion: LEGAL.version,
      acceptedAt: "2026-10-04T12:00:00.000Z",
      guardianPermissionConfirmed: true,
    });
    expect(() =>
      buildAuthorizationRecord("adulto", { accepted: false })
    ).toThrow();
  });

  it("el componente muestra la variante correcta y no pide datos del acudiente", () => {
    const render = (variant: "adulto" | "menor") =>
      renderToString(
        <Router ssrPath="/registro">
          <DataAuthorization
            variant={variant}
            value={{ accepted: false }}
            onChange={() => {}}
          />
        </Router>
      );
    const adulto = render("adulto");
    const menor = render("menor");
    expect(adulto).toContain("/tratamiento-de-datos");
    expect(adulto).toContain("Autorizo");
    expect(adulto).not.toContain("acudiente");
    expect(menor).toContain("tengo permiso de mi papá, mamá o acudiente");
    expect(menor).not.toContain("Nombre del representante");
    expect(menor).not.toContain("Documento de identidad");
    expect(menor).not.toContain("Correo del representante");
  });

  it("los datos legales están completos y la vigencia sale de la fecha de lanzamiento", () => {
    expect(pendingLegalPlaceholders()).toEqual([]);
    expect(fechaLarga("2026-10-04")).toBe("4 de octubre de 2026");
    expect(fechaLarga("2027-01-15")).toBe("15 de enero de 2027");
    expect(LEGAL.fechaVigencia).toBe(fechaLarga(FECHA_LANZAMIENTO));
  });
});
