import { Link } from "wouter";
import LegalPage, { type LegalSection } from "@/components/LegalPage";
import { SITE } from "@/config/site";
import {
  Correo,
  FichaResponsable,
  LinkCookies,
  LinkSIC,
  LinkTratamiento,
  TablaTerceros,
} from "@/legal/shared";

const sections: LegalSection[] = [
  {
    id: "quien",
    title: "¿Quién es responsable de tus datos?",
    content: <FichaResponsable />,
  },
  {
    id: "hoy",
    title: "Qué datos usamos hoy",
    content: (
      <ul>
        <li>
          <strong>Puedes usar el sitio sin cuenta.</strong> En ese caso tu
          progreso, tus respuestas y tu meta se guardan solo en el
          almacenamiento de tu navegador, en tu dispositivo.
        </li>
        <li>
          <strong>Si creas una cuenta</strong> (correo o Google, cuando esté
          disponible), guardamos tu correo, el año de nacimiento, la
          autorización de tratamiento de datos y, si eres menor de 18 años, la
          confirmación de que tienes permiso de tu papá, mamá o acudiente, para
          sincronizar tu progreso entre dispositivos. El detalle está en la{" "}
          <LinkTratamiento />.
        </li>
        <li>Guardamos en tu navegador tu decisión sobre cookies.</li>
        <li>
          Nuestro proveedor de alojamiento (Cloudflare) procesa datos técnicos
          de la conexión, como la dirección IP, para entregar el sitio y
          protegerlo. El proveedor de cuentas (Supabase) procesa los datos de
          autenticación y el progreso sincronizado.
        </li>
        <li>
          Hoy no usamos analítica ni publicidad. Si las activamos, solo
          funcionarán si las aceptas en el aviso de cookies.
        </li>
      </ul>
    ),
  },
  {
    id: "futuro",
    title: "Qué datos podríamos pedir más adelante",
    content: (
      <>
        <p>
          Más adelante podríamos pedir datos opcionales como grado, colegio o
          ciudad, o activar analítica y publicidad (solo con tu consentimiento
          de cookies). Cualquier dato nuevo te lo pediremos con una casilla de
          autorización, antes de recogerlo, y solo para las finalidades de la{" "}
          <LinkTratamiento />.
        </p>
      </>
    ),
  },
  {
    id: "para-que",
    title: "Para qué los usamos",
    content: (
      <ul>
        <li>
          Mostrarte tu progreso, tu puntaje estimado y las preguntas que debes
          repasar.
        </li>
        <li>Administrar tu cuenta y sincronizar el progreso (si creas una).</li>
        <li>Responder tus mensajes, consultas y reclamos.</li>
        <li>
          Con tu permiso: medir el uso del sitio para mejorarlo y mostrar
          anuncios que lo mantengan gratis.
        </li>
        <li>Proteger el sitio y cumplir la ley.</li>
      </ul>
    ),
  },
  {
    id: "terceros",
    title: "Con quién los compartimos",
    content: (
      <>
        <p>
          No vendemos tus datos. Solo los compartimos con proveedores que nos
          ayudan a operar el servicio, algunos fuera de Colombia:
        </p>
        <TablaTerceros />
        <p>
          Los detalles sobre transmisiones y transferencias internacionales
          están en la <LinkTratamiento />.
        </p>
      </>
    ),
  },
  {
    id: "menores",
    title: "Si eres menor de edad",
    content: (
      <p>
        {SITE.name} está pensado para estudiantes de colegio. Si tienes menos de
        18 años y creas una cuenta, te pediremos que confirmes con una casilla
        que tienes permiso de tu papá, mamá o acudiente; no pedimos sus datos.
        No usamos datos de menores para publicidad personalizada.
      </p>
    ),
  },
  {
    id: "derechos",
    title: "Tus derechos",
    content: (
      <>
        <p>
          Puedes conocer, actualizar, rectificar y pedir la supresión de tus
          datos, solicitar prueba de tu autorización, revocarla y presentar
          quejas ante la <LinkSIC />. Escríbenos a <Correo />: respondemos
          consultas en máximo 10 días hábiles y reclamos en máximo 15 días
          hábiles.
        </p>
        <p>
          Como el progreso de hoy vive en tu navegador, puedes borrarlo tú mismo
          eliminando los datos del sitio en la configuración de tu navegador.
        </p>
      </>
    ),
  },
  {
    id: "seguridad",
    title: "Seguridad",
    content: (
      <p>
        El sitio funciona siempre con conexión cifrada (HTTPS) y trabajamos con
        proveedores con estándares reconocidos de seguridad.
      </p>
    ),
  },
  {
    id: "cookies",
    title: "Cookies",
    content: (
      <p>
        Usamos almacenamiento necesario y, solo con tu permiso, cookies
        analíticas y de publicidad. Lee la <LinkCookies /> o cambia tu elección
        desde «Configurar cookies» en el pie de página.
      </p>
    ),
  },
  {
    id: "cambios",
    title: "Cambios",
    content: (
      <p>
        Si cambiamos esta política te lo contaremos en el sitio. Esta página es
        el aviso de privacidad y resume la <LinkTratamiento />, que es el
        documento completo. También aplican los{" "}
        <Link href="/terminos">Términos y condiciones</Link>.
      </p>
    ),
  },
];

export default function PoliticaPrivacidad() {
  return (
    <LegalPage
      path="/politica-de-privacidad"
      title="Política de privacidad"
      intro={
        <p>
          En {SITE.name} cuidamos tus datos. Aquí te contamos, en palabras
          sencillas, qué información usamos, para qué y cuáles son tus derechos
          según la Ley 1581 de 2012 de protección de datos personales.
        </p>
      }
      sections={sections}
    />
  );
}
