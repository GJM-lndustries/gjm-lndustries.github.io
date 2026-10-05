import LegalPage, { type LegalSection } from '@/components/LegalPage';
import { SITE } from '@/config/site';
import { useConsent } from '@/contexts/ConsentContext';
import { CONSENT_STORAGE_KEY } from '@/lib/consent';
import { LinkPrivacidad, LinkTratamiento } from '@/legal/shared';

interface Fila { nombre: string; proveedor: string; finalidad: string; duracion: string }

const necesarias: Fila[] = [
  { nombre: 'proicfes_progress (almacenamiento local)', proveedor: SITE.name, finalidad: 'Guardar tu progreso, respuestas, meta y preguntas por repasar en tu dispositivo.', duracion: 'Hasta que borres los datos del sitio' },
  { nombre: `${CONSENT_STORAGE_KEY} (almacenamiento local)`, proveedor: SITE.name, finalidad: 'Recordar tu elección sobre cookies (con versión y fecha).', duracion: 'Hasta que la cambies o borres los datos del sitio' },
  { nombre: 'proicfes_simulacro_v1 (almacenamiento local)', proveedor: SITE.name, finalidad: 'Guardar el simulacro en curso (preguntas, respuestas y hora de inicio) para que puedas retomarlo.', duracion: 'Hasta que empieces otro simulacro o borres los datos del sitio' },
  { nombre: 'proicfes_auth y proicfes_sync (almacenamiento local, solo si inicias sesión)', proveedor: `${SITE.name} (con Supabase)`, finalidad: 'Mantener tu sesión iniciada y saber qué parte de tu progreso ya se sincronizó con tu cuenta.', duracion: 'Hasta que cierres sesión o borres los datos del sitio' },
  { nombre: 'Caché del service worker (proicfes-v…)', proveedor: SITE.name, finalidad: 'Permitir que el sitio cargue más rápido y funcione sin conexión.', duracion: 'Hasta la siguiente actualización del sitio' },
  { nombre: '__cf_bm u otras cookies técnicas', proveedor: 'Cloudflare', finalidad: 'Seguridad y protección contra tráfico automatizado, si el proveedor las activa.', duracion: 'Hasta 30 minutos' },
];
const analiticas: Fila[] = [
  { nombre: '_ga, _ga_<ID>', proveedor: 'Google Analytics', finalidad: 'Distinguir visitas y medir de forma agregada qué páginas se usan.', duracion: 'Hasta 2 años' },
];
const publicidad: Fila[] = [
  { nombre: '__gads, __gpi, IDE y similares', proveedor: 'Google AdSense', finalidad: 'Mostrar anuncios, limitar su repetición y medir su rendimiento.', duracion: 'Hasta 13 meses' },
];

function Tabla({ filas }: { filas: Fila[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border border-border rounded-lg">
        <thead className="bg-muted/60 text-left">
          <tr>
            <th scope="col" className="p-2">Nombre</th>
            <th scope="col" className="p-2">Proveedor</th>
            <th scope="col" className="p-2">Finalidad</th>
            <th scope="col" className="p-2">Duración</th>
          </tr>
        </thead>
        <tbody>
          {filas.map(f => (
            <tr key={f.nombre} className="border-t border-border align-top">
              <td className="p-2 font-mono">{f.nombre}</td>
              <td className="p-2">{f.proveedor}</td>
              <td className="p-2">{f.finalidad}</td>
              <td className="p-2">{f.duracion}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const estado = (id: string) => (id ? 'Configuradas en el sitio; solo se cargan si las aceptas.' : 'Hoy no están activas en ProICFES.');

function EstadoActual() {
  const { consent, ready, openSettings } = useConsent();
  const texto = !ready
    ? 'Abre el panel para revisar o cambiar tu elección.'
    : consent
      ? `Tu elección (${new Date(consent.date).toLocaleDateString('es-CO')}): analíticas ${consent.analytics ? 'aceptadas' : 'rechazadas'}, publicidad ${consent.ads ? 'aceptada' : 'rechazada'}.`
      : 'Todavía no has elegido: solo funciona el almacenamiento necesario.';
  return (
    <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-2 not-prose">
      <p className="text-sm">{texto}</p>
      <button
        type="button"
        onClick={openSettings}
        className="btn-primary btn-sm"
      >
        Configurar cookies
      </button>
    </div>
  );
}

const sections: LegalSection[] = [
  {
    id: 'que-son',
    title: '¿Qué son las cookies?',
    content: (
      <p>
        Las cookies son pequeños archivos que un sitio guarda en tu navegador. Tecnologías parecidas, como el
        almacenamiento local (localStorage), cumplen funciones similares. En esta política las llamamos a todas «cookies».
        Cuando permiten identificar a una persona, se consideran datos personales y se rigen por la Ley 1581 de 2012 y
        nuestra <LinkTratamiento />.
      </p>
    ),
  },
  {
    id: 'tu-eleccion',
    title: 'Tu elección',
    content: (
      <>
        <p>
          Las cookies necesarias están siempre activas. Las analíticas y las de publicidad solo se activan si las aceptas,
          y puedes cambiar tu decisión cuando quieras aquí o desde «Configurar cookies» en el pie de página.
        </p>
        <EstadoActual />
      </>
    ),
  },
  {
    id: 'necesarias',
    title: 'Cookies necesarias (siempre activas)',
    content: (
      <>
        <p>Permiten que el sitio funcione y recuerde tu progreso en este dispositivo. No se usan para publicidad.</p>
        <Tabla filas={necesarias} />
      </>
    ),
  },
  {
    id: 'analiticas',
    title: 'Cookies analíticas (opcionales)',
    content: (
      <>
        <p>Nos ayudan a entender, de forma agregada, cómo se usa el sitio para mejorarlo. {estado(SITE.integrations.gaMeasurementId)}</p>
        <Tabla filas={analiticas} />
      </>
    ),
  },
  {
    id: 'publicidad',
    title: 'Cookies de publicidad (opcionales)',
    content: (
      <>
        <p>
          Permiten mostrar anuncios que ayudan a mantener el servicio gratuito. Google puede usarlas según sus propias
          políticas. No usamos datos de menores para publicidad personalizada. {estado(SITE.integrations.adsenseClientId)}
        </p>
        <Tabla filas={publicidad} />
      </>
    ),
  },
  {
    id: 'consent-mode',
    title: 'Cómo respetamos tu decisión',
    content: (
      <p>
        Usamos el modo de consentimiento de Google (Consent Mode v2): mientras no aceptes, las señales de analítica y
        publicidad quedan en «denegado» y sus scripts no se cargan. Si retiras un permiso que ya habías dado, la página se
        recarga para dejar de usar esos servicios.
      </p>
    ),
  },
  {
    id: 'navegador',
    title: 'Cómo borrar o bloquear cookies en tu navegador',
    content: (
      <p>
        También puedes borrar o bloquear cookies y datos de sitios desde la configuración de privacidad de tu navegador
        (Chrome, Safari, Firefox, Edge, etc.). Si borras los datos de {SITE.name}, perderás tu progreso guardado.
      </p>
    ),
  },
  {
    id: 'cambios',
    title: 'Cambios y más información',
    content: (
      <p>
        Si agregamos un servicio nuevo, actualizaremos esta política y volveremos a pedirte tu elección. Más información en
        la <LinkPrivacidad /> y la <LinkTratamiento />.
      </p>
    ),
  },
];

export default function Cookies() {
  return (
    <LegalPage
      path="/cookies"
      title="Política de cookies"
      intro={<p>Aquí te explicamos qué cookies y tecnologías similares usa {SITE.name}, para qué sirven y cómo decidir cuáles permites.</p>}
      sections={sections}
    />
  );
}
