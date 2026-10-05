import LegalPage, { Dato, type LegalSection } from "@/components/LegalPage";
import { LEGAL } from "@/config/legal";
import { SITE } from "@/config/site";
import {
  Correo,
  FichaResponsable,
  LinkCookies,
  LinkPrivacidad,
  LinkSIC,
  LinkTratamiento,
} from "@/legal/shared";

const sections: LegalSection[] = [
  {
    id: "aceptacion",
    title: "Aceptación",
    content: (
      <p>
        Al usar {SITE.name} aceptas estos términos. Si no estás de acuerdo, no
        uses el sitio. Si eres menor de 18 años, úsalo con permiso de tu papá,
        mamá o acudiente.
      </p>
    ),
  },
  {
    id: "quien",
    title: "Quién ofrece el servicio",
    content: <FichaResponsable />,
  },
  {
    id: "servicio",
    title: "Qué es ProICFES",
    content: (
      <p>
        {SITE.name} es una herramienta educativa gratuita para practicar y
        prepararse para el examen Saber 11: lecciones, preguntas de práctica
        tipo ICFES con explicación, simulacros y un puntaje estimado. Es un
        complemento al estudio y no reemplaza la orientación de docentes ni la
        información oficial.
      </p>
    ),
  },
  {
    id: "icfes",
    title: "Sin afiliación con el ICFES",
    content: (
      <p>
        {SITE.name} es un proyecto independiente. No está afiliado, avalado ni
        patrocinado por el Instituto Colombiano para la Evaluación de la
        Educación (ICFES). «ICFES» y «Saber 11» se mencionan solo para describir
        el examen al que se refiere el contenido. Las preguntas son de práctica
        y no son preguntas oficiales del examen. La información oficial (fechas,
        inscripción, resultados) está en icfes.gov.co.
      </p>
    ),
  },
  {
    id: "resultados",
    title: "Sin garantía de resultados",
    content: (
      <p>
        El puntaje que muestra {SITE.name} es un <strong>estimado</strong>{" "}
        calculado con tus aciertos y la ponderación oficial del puntaje global;
        no es un resultado oficial ni una predicción. No garantizamos un
        puntaje, un cupo universitario ni una beca. Procuramos que el contenido
        sea correcto, pero puede contener errores: si encuentras uno, escríbenos
        a <Correo />.
      </p>
    ),
  },
  {
    id: "uso",
    title: "Uso permitido y conducta",
    content: (
      <>
        <p>
          Te comprometes a usar el sitio de forma lícita y respetuosa. No está
          permitido:
        </p>
        <ul>
          <li>
            Copiar, descargar masivamente o revender el contenido, o usarlo para
            crear un servicio competidor.
          </li>
          <li>
            Intentar acceder sin autorización a sistemas o datos, afectar el
            funcionamiento del sitio o usar robots que lo sobrecarguen.
          </li>
          <li>
            Publicar o enviar contenido ilegal, ofensivo, discriminatorio o que
            vulnere derechos de terceros (cuando haya funciones para hacerlo).
          </li>
          <li>Suplantar a otra persona o crear cuentas con datos falsos.</li>
        </ul>
        <p>Podemos suspender el acceso de quien incumpla estas reglas.</p>
      </>
    ),
  },
  {
    id: "cuentas",
    title: "Cuentas de usuario",
    content: (
      <p>
        Puedes usar {SITE.name} sin cuenta. Si creas una, debes dar información
        veraz y cuidar el acceso a tu correo. Si eres menor de 18 años,
        confirmas con una casilla que tienes permiso de tu papá, mamá o
        acudiente, en los términos de la <LinkTratamiento />. Puedes pedir la
        eliminación de tu cuenta escribiendo al correo del Responsable.
      </p>
    ),
  },
  {
    id: "propiedad",
    title: "Propiedad intelectual",
    content: (
      <p>
        Los textos, preguntas, explicaciones, diseño, código y marca {SITE.name}{" "}
        pertenecen a su Responsable o se usan con autorización, y están
        protegidos por la Ley 23 de 1982, la Decisión Andina 351 de 1993 y demás
        normas de derecho de autor y propiedad industrial. Puedes usar el
        contenido para tu estudio personal; cualquier otro uso requiere
        autorización previa y escrita. Si crees que algún contenido infringe tus
        derechos, escríbenos a <Correo /> y lo revisaremos.
      </p>
    ),
  },
  {
    id: "pagos",
    title: "Planes de pago futuros",
    content: (
      <>
        <p>
          {SITE.name} es gratis. Si en el futuro se ofrecen planes o contenidos
          de pago, aplicará la Ley 1480 de 2011 (Estatuto del Consumidor) y,
          antes de pagar, te informaremos con claridad el precio total con
          impuestos, qué incluye, su duración, las condiciones de renovación y
          cómo cancelar. Además:
        </p>
        <ul>
          <li>
            <strong>Derecho de retracto:</strong> en las compras en línea podrás
            retractarte dentro de los <strong>cinco (5) días hábiles</strong>{" "}
            siguientes a la celebración del contrato (artículo 47 de la Ley 1480
            de 2011), salvo las excepciones de la ley, como los servicios cuya
            prestación ya comenzó con tu acuerdo. Si procede, devolveremos el
            dinero en un plazo máximo de treinta (30) días calendario.
          </li>
          <li>
            <strong>Reversión del pago:</strong> cuando se cumplan los supuestos
            del artículo 51 de la Ley 1480 de 2011 (por ejemplo, fraude u
            operación no solicitada), podrás pedir la reversión del pago
            conforme a la ley.
          </li>
          <li>
            Las compras deberá hacerlas una persona mayor de edad o con la
            autorización de su representante legal.
          </li>
          <li>
            Tus peticiones, quejas y reclamos como consumidor puedes enviarlos a{" "}
            <Correo /> o presentarlos ante la <LinkSIC />.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "disponibilidad",
    title: "Disponibilidad y cambios del servicio",
    content: (
      <p>
        Trabajamos para que el sitio esté disponible, pero puede haber
        interrupciones por mantenimiento o causas ajenas. Podemos agregar,
        cambiar o retirar funciones y contenidos. Como hoy el progreso se guarda
        en tu navegador, si borras sus datos o cambias de dispositivo lo
        perderás.
      </p>
    ),
  },
  {
    id: "responsabilidad",
    title: "Limitación de responsabilidad",
    content: (
      <p>
        En la medida permitida por la ley, no respondemos por daños derivados
        del uso del sitio, de decisiones tomadas con base en el puntaje estimado
        o de interrupciones del servicio. Nada de lo anterior limita los
        derechos que te otorga la Ley 1480 de 2011 como consumidor.
      </p>
    ),
  },
  {
    id: "enlaces",
    title: "Enlaces y servicios de terceros",
    content: (
      <p>
        El sitio puede tener enlaces a páginas de terceros (por ejemplo,
        icfes.gov.co) o, con tu consentimiento, anuncios. No controlamos esos
        sitios ni respondemos por su contenido o sus políticas.
      </p>
    ),
  },
  {
    id: "datos",
    title: "Datos personales y cookies",
    content: (
      <p>
        El tratamiento de tus datos se rige por la <LinkTratamiento />, la{" "}
        <LinkPrivacidad /> y la <LinkCookies />.
      </p>
    ),
  },
  {
    id: "modificaciones",
    title: "Modificaciones",
    content: (
      <p>
        Podemos actualizar estos términos. Publicaremos la nueva versión en esta
        página con su fecha de vigencia; si el cambio es importante, lo
        avisaremos en el sitio. Seguir usando {SITE.name} después de la
        publicación implica que aceptas la nueva versión.
      </p>
    ),
  },
  {
    id: "ley",
    title: "Ley aplicable y jurisdicción",
    content: (
      <p>
        Estos términos se rigen por las leyes de la República de Colombia.
        Cualquier controversia se intentará resolver primero de forma directa
        escribiendo a <Correo />; si no es posible, la conocerán los jueces
        competentes de <Dato>{LEGAL.responsable.ciudad}</Dato>, Colombia, sin
        perjuicio de tu derecho como consumidor a acudir a la <LinkSIC /> o a
        los jueces de tu domicilio.
      </p>
    ),
  },
];

export default function Terminos() {
  return (
    <LegalPage
      path="/terminos"
      title="Términos y condiciones de uso"
      intro={
        <p>
          Estas son las reglas para usar {SITE.name}. Las escribimos de la forma
          más clara posible.
        </p>
      }
      sections={sections}
    />
  );
}
