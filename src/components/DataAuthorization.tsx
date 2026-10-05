import { useId } from "react";
import { Link } from "wouter";
import type {
  AuthorizationValue,
  AuthorizationVariant,
} from "@/lib/authorization";
import { SITE } from "@/config/site";

/**
 * Casilla de autorización para el registro de cuentas.
 * - `adulto`: autorización de tratamiento de datos del Titular.
 * - `menor`: el estudiante confirma que tiene permiso de su papá, mamá o acudiente
 *   (no pedimos nombre, documento ni correo del acudiente).
 */
export default function DataAuthorization({
  variant,
  value,
  onChange,
}: {
  variant: AuthorizationVariant;
  value: AuthorizationValue;
  onChange: (next: AuthorizationValue) => void;
}) {
  const id = useId();
  const policies = (
    <>
      la{" "}
      <Link
        href="/tratamiento-de-datos"
        className="underline underline-offset-2 text-primary"
      >
        Política de Tratamiento de Datos Personales
      </Link>{" "}
      y la{" "}
      <Link
        href="/politica-de-privacidad"
        className="underline underline-offset-2 text-primary"
      >
        Política de privacidad
      </Link>
    </>
  );

  return (
    <fieldset
      className="space-y-3 rounded-xl border border-border p-4"
      data-variant={variant}
    >
      <legend className="px-1 text-sm font-semibold text-foreground">
        {variant === "menor"
          ? "Permiso de tu acudiente"
          : "Autorización de tratamiento de datos"}
      </legend>

      {variant === "menor" && (
        <p className="text-xs text-muted-foreground leading-relaxed">
          Como tienes menos de 18 años, pedimos que confirmes que tu papá, mamá
          o acudiente te da permiso para crear la cuenta y guardar tu progreso.
          No pedimos sus datos. El detalle está en {policies}.
        </p>
      )}

      <label
        className="flex items-start gap-2 text-sm leading-relaxed"
        htmlFor={`${id}-ok`}
      >
        <input
          id={`${id}-ok`}
          type="checkbox"
          className="mt-1 h-4 w-4 accent-[#16a34a]"
          checked={value.accepted}
          onChange={e => onChange({ ...value, accepted: e.target.checked })}
          required
        />
        <span>
          {variant === "menor" ? (
            <>
              <strong>Confirmo</strong> que tengo permiso de mi papá, mamá o
              acudiente para usar {SITE.name} y guardar mi progreso, según{" "}
              {policies}.
            </>
          ) : (
            <>
              <strong>Autorizo</strong> a {SITE.name} a tratar mis datos
              personales para las finalidades descritas en {policies}, incluida
              su transmisión a proveedores fuera de Colombia. Conozco mis
              derechos a conocer, actualizar, rectificar y suprimir mis datos y
              a revocar esta autorización.
            </>
          )}
        </span>
      </label>
    </fieldset>
  );
}
