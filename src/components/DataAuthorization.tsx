import { useId } from 'react';
import { Link } from 'wouter';
import type { AuthorizationValue, AuthorizationVariant } from '@/lib/authorization';
import { SITE } from '@/config/site';

/**
 * Casilla de «Autorización de tratamiento de datos» para el futuro formulario de registro.
 * - `adulto`: una casilla.
 * - `menor`: datos del padre, madre o representante legal + declaración de que escuchó al menor.
 * Usa `isAuthorizationComplete()` para habilitar el botón de registro y
 * `buildAuthorizationRecord()` para guardar la prueba de la autorización.
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
  const set = (patch: Partial<AuthorizationValue>) => onChange({ ...value, ...patch });
  const input = 'w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-primary';
  const policies = (
    <>
      la <Link href="/tratamiento-de-datos" className="underline underline-offset-2 text-primary">Política de Tratamiento de Datos Personales</Link>{' '}
      y la <Link href="/politica-de-privacidad" className="underline underline-offset-2 text-primary">Política de privacidad</Link>
    </>
  );

  return (
    <fieldset className="space-y-3 rounded-xl border border-border p-4" data-variant={variant}>
      <legend className="px-1 text-sm font-semibold text-foreground">Autorización de tratamiento de datos</legend>

      {variant === 'menor' && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Como el estudiante es menor de 18 años, la autorización debe darla su padre, madre o representante legal
            (Ley 1581 de 2012, art. 7).
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1">
              <label htmlFor={`${id}-nombre`} className="text-xs font-medium">Nombre del representante</label>
              <input id={`${id}-nombre`} className={input} autoComplete="name" required value={value.guardianName ?? ''} onChange={e => set({ guardianName: e.target.value })} />
            </div>
            <div className="space-y-1">
              <label htmlFor={`${id}-doc`} className="text-xs font-medium">Documento de identidad</label>
              <input id={`${id}-doc`} className={input} inputMode="numeric" required value={value.guardianDocument ?? ''} onChange={e => set({ guardianDocument: e.target.value })} />
            </div>
            <div className="space-y-1">
              <label htmlFor={`${id}-correo`} className="text-xs font-medium">Correo del representante</label>
              <input id={`${id}-correo`} type="email" className={input} autoComplete="email" required value={value.guardianEmail ?? ''} onChange={e => set({ guardianEmail: e.target.value })} />
            </div>
          </div>
          <label className="flex items-start gap-2 text-sm leading-relaxed">
            <input type="checkbox" className="mt-1 h-4 w-4 accent-[#16a34a]" checked={!!value.minorHeard} onChange={e => set({ minorHeard: e.target.checked })} required />
            <span>Declaro que hablé con el menor sobre el uso de sus datos y tuve en cuenta su opinión.</span>
          </label>
        </div>
      )}

      <label className="flex items-start gap-2 text-sm leading-relaxed">
        <input type="checkbox" className="mt-1 h-4 w-4 accent-[#16a34a]" checked={value.accepted} onChange={e => set({ accepted: e.target.checked })} required />
        <span>
          {variant === 'menor' ? (
            <>
              Como padre, madre o representante legal, <strong>autorizo</strong> a {SITE.name} a tratar los datos personales
              del menor para las finalidades descritas en {policies}, incluida su transmisión a proveedores fuera de Colombia.
            </>
          ) : (
            <>
              <strong>Autorizo</strong> a {SITE.name} a tratar mis datos personales para las finalidades descritas en {policies},
              incluida su transmisión a proveedores fuera de Colombia. Conozco mis derechos a conocer, actualizar, rectificar y
              suprimir mis datos y a revocar esta autorización.
            </>
          )}
        </span>
      </label>
    </fieldset>
  );
}
