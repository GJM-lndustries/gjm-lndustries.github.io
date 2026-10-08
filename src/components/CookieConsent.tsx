import { useEffect, useRef, useState } from 'react';
import { Link } from 'wouter';
import { Cookie, X } from 'lucide-react';
import { useConsent } from '@/contexts/ConsentContext';
import { ALL_DENIED, ALL_GRANTED } from '@/lib/consent';
import { SITE } from '@/config/site';

const inactive = (id: string) => (id ? '' : ' Hoy no están activas en ProICFES.');

const btnPrimary = 'btn-primary btn-sm';
const btnSecondary = 'btn-secondary btn-sm';

/** Aviso de cookies (no modal) + panel de configuración. Solo se muestra en el navegador. */
export default function CookieConsent() {
  const { consent, ready, settingsOpen, save, openSettings } = useConsent();
  if (!ready) return null;
  return (
    <>
      {!consent && !settingsOpen && (
        <section
          role="region"
          aria-label="Aviso de cookies"
          data-testid="cookie-banner"
          className="fixed z-[55] left-2 right-2 bottom-[calc(4rem+env(safe-area-inset-bottom))] lg:bottom-4 lg:left-auto lg:right-4 lg:max-w-md bg-card text-foreground border border-border rounded-2xl shadow-xl p-4"
        >
          <div className="flex items-start gap-3">
            <Cookie className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div className="space-y-1">
              <h2 className="font-bold font-['Lexend'] text-sm">Tu privacidad</h2>
              <p className="text-xs leading-relaxed text-foreground/85">
                Usamos almacenamiento necesario para guardar tu progreso en este dispositivo. Las cookies de analítica y
                publicidad solo se activan si las aceptas. Más información en la{' '}
                <Link href="/cookies" className="underline underline-offset-2 font-semibold text-primary">política de cookies</Link>.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-3">
            <button type="button" className={btnSecondary} onClick={() => save(ALL_DENIED)}>Rechazar</button>
            <button type="button" className={btnSecondary} onClick={openSettings}>Configurar</button>
            <button type="button" className={btnPrimary} onClick={() => save(ALL_GRANTED)}>Aceptar todas</button>
          </div>
        </section>
      )}
      {settingsOpen && <CookieSettingsDialog />}
    </>
  );
}

function Toggle({ id, label, description, checked, disabled, onChange }: {
  id: string; label: string; description: string; checked: boolean; disabled?: boolean; onChange?: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-border last:border-b-0">
      <div>
        <label htmlFor={id} className="font-semibold text-sm text-foreground">{label}</label>
        <p id={`${id}-desc`} className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{description}</p>
      </div>
      <input
        id={id}
        type="checkbox"
        role="switch"
        aria-describedby={`${id}-desc`}
        checked={checked}
        disabled={disabled}
        onChange={e => onChange?.(e.target.checked)}
        className="mt-1 w-10 h-5 flex-shrink-0 appearance-none rounded-full bg-muted-foreground/30 relative cursor-pointer transition-colors checked:bg-green-600 disabled:opacity-60 disabled:cursor-not-allowed before:content-[''] before:absolute before:top-0.5 before:left-0.5 before:w-4 before:h-4 before:rounded-full before:bg-white before:shadow before:transition-transform checked:before:translate-x-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      />
    </div>
  );
}

function CookieSettingsDialog() {
  const { consent, save, closeSettings } = useConsent();
  const [analytics, setAnalytics] = useState(consent?.analytics ?? false);
  const [ads, setAds] = useState(consent?.ads ?? false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Foco dentro del diálogo, Escape para cerrar y devolver el foco a donde estaba.
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    panel?.querySelector<HTMLElement>('button, input:not(:disabled), a')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSettings();
      if (e.key !== 'Tab' || !panel) return;
      const items = [...panel.querySelectorAll<HTMLElement>('button, input:not(:disabled), a[href]')];
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); previous?.focus?.(); };
  }, [closeSettings]);

  return (
    <div className="fixed inset-0 z-[70] bg-black/50 flex items-end sm:items-center justify-center p-2 sm:p-4" onClick={closeSettings}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookies-dialogo-titulo"
        data-testid="cookie-settings"
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-card text-foreground rounded-2xl shadow-2xl p-5"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id="cookies-dialogo-titulo" className="font-bold font-['Lexend'] text-lg">Configurar cookies</h2>
          <button type="button" onClick={closeSettings} aria-label="Cerrar" className="p-1 rounded-lg hover:bg-muted">
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Elige qué permites. Puedes cambiarlo cuando quieras desde «Configurar cookies» en el pie de página.
        </p>
        <div className="mt-3">
          <Toggle id="cookies-necesarias" label="Necesarias" checked disabled
            description="Guardan tu progreso y esta elección en tu navegador. Sin ellas el sitio no funciona; siempre están activas." />
          <Toggle id="cookies-analiticas" label="Analíticas" checked={analytics} onChange={setAnalytics}
            description={`Nos ayudan a saber, de forma agregada, qué páginas se usan más (Google Analytics).${inactive(SITE.integrations.gaMeasurementId)}`} />
          <Toggle id="cookies-publicidad" label="Publicidad" checked={ads} onChange={setAds}
            description={`Permiten mostrar anuncios que ayudan a mantener ProICFES gratis (Google AdSense).${inactive(SITE.integrations.adsenseClientId)}`} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4">
          <button type="button" className={btnSecondary} onClick={() => save(ALL_DENIED)}>Rechazar todas</button>
          <button type="button" className={btnSecondary} onClick={() => save({ analytics, ads })}>Guardar selección</button>
          <button type="button" className={btnPrimary} onClick={() => save(ALL_GRANTED)}>Aceptar todas</button>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Detalles en la <Link href="/cookies" onClick={closeSettings} className="underline underline-offset-2">política de cookies</Link> y la{' '}
          <Link href="/politica-de-privacidad" onClick={closeSettings} className="underline underline-offset-2">política de privacidad</Link>.
        </p>
      </div>
    </div>
  );
}
