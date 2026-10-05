import LegalPage, { type LegalSection } from "@/components/LegalPage";
import { SITE } from "@/config/site";
import {
  Correo,
  FichaResponsable,
  LinkCookies,
  LinkPrivacidad,
  LinkSIC,
  TablaTerceros,
} from "@/legal/shared";

const sections: LegalSection[] = [
  {
    id: "responsable",
    title: "Responsable del Tratamiento",
    content: <FichaResponsable />,
  },
  {
    id: "marco-legal",
    title: "Marco legal",
    content: (
      <p>
        Esta política se expide en cumplimiento del artículo 15 de la
        Constitución Política, la Ley Estatutaria 1581 de 2012 y el Decreto 1377
        de 2013, compilado en el Capítulo 25 del Título 2 de la Parte 2 del
        Libro 2 del Decreto Único Reglamentario 1074 de 2015, y demás normas que
        los modifiquen o complementen.
      </p>
    ),
  },
  {
    id: "definiciones",
    title: "Definiciones",
    content: (
      <ul>
        <li>
          <strong>Titular:</strong> persona natural cuyos datos personales son
          objeto de Tratamiento.
        </li>
        <li>
          <strong>Dato personal:</strong> cualquier información vinculada o que
          pueda asociarse a una persona natural determinada o determinable.
        </li>
        <li>
          <strong>Dato sensible:</strong> el que afecta la intimidad del Titular
          o cuyo uso indebido puede generar discriminación (por ejemplo, salud,
          origen étnico u orientación política).
        </li>
        <li>
          <strong>Autorización:</strong> consentimiento previo, expreso e
          informado del Titular para el Tratamiento de sus datos.
        </li>
        <li>
          <strong>Tratamiento:</strong> cualquier operación sobre datos
          personales, como recolección, almacenamiento, uso, circulación o
          supresión.
        </li>
        <li>
          <strong>Responsable:</strong> quien decide sobre la base de datos y el
          Tratamiento. <strong>Encargado:</strong> quien trata los datos por
          cuenta del Responsable.
        </li>
        <li>
          <strong>Transmisión:</strong> comunicación de datos a un Encargado,
          dentro o fuera de Colombia, para que los trate por cuenta del
          Responsable. <strong>Transferencia:</strong> envío de datos a otro
          Responsable, dentro o fuera del país.
        </li>
      </ul>
    ),
  },
  {
    id: "principios",
    title: "Principios",
    content: (
      <p>
        Aplicamos los principios del artículo 4 de la Ley 1581 de 2012:
        legalidad, finalidad, libertad, veracidad o calidad, transparencia,
        acceso y circulación restringida, seguridad y confidencialidad. Solo
        recogemos los datos necesarios para las finalidades informadas.
      </p>
    ),
  },
  {
    id: "datos",
    title: "Datos que tratamos",
    content: (
      <>
        <p>
          <strong>Sin cuenta:</strong> tu progreso (respuestas, puntajes, meta)
          se guarda únicamente en el almacenamiento local de tu navegador y no
          se envía a nuestros servidores. El proveedor de alojamiento puede
          registrar datos técnicos de la conexión (dirección IP, navegador,
          fecha y página solicitada) por seguridad y funcionamiento.
        </p>
        <p>
          <strong>Con cuenta</strong> (opcional, en{" "}
          <a href="/cuenta">/cuenta</a>), además tratamos:
        </p>
        <ul>
          <li>
            Datos de cuenta: nombre o apodo (opcional), correo electrónico,
            inicio de sesión con enlace al correo o con un tercero (p. ej.
            Google, cuando esté disponible), y año de nacimiento.
          </li>
          <li>
            Datos del representante legal, si el usuario es menor de 18 años:
            nombre, documento y correo, más la constancia de haber escuchado al
            menor.
          </li>
          <li>
            Prueba de la autorización de tratamiento de datos (versión de la
            política y fecha) y, si aplica, la versión y fecha de la elección de
            cookies al crear la cuenta.
          </li>
          <li>
            Datos de uso educativo sincronizados: lecciones, respuestas,
            aciertos por área, simulacros y metas.
          </li>
          <li>
            Datos técnicos de autenticación que procesa el proveedor de cuentas
            (Supabase).
          </li>
          <li>
            Datos técnicos y de navegación: identificadores de cookies, tipo de
            dispositivo y páginas visitadas (solo con tu consentimiento para
            cookies analíticas o de publicidad).
          </li>
          <li>
            Datos de pago, si en el futuro hay planes de pago: los procesa
            directamente la pasarela de pagos; no almacenamos números de
            tarjeta.
          </li>
        </ul>
        <p>
          No solicitamos datos sensibles. Si alguna vez se pidieran,
          responderlos será siempre opcional.
        </p>
      </>
    ),
  },
  {
    id: "finalidades",
    title: "Finalidades",
    content: (
      <ol>
        <li>
          Prestar el servicio educativo: guardar y mostrar tu progreso, puntaje
          estimado y preguntas por repasar.
        </li>
        <li>
          Crear y administrar cuentas, autenticar usuarios y sincronizar el
          progreso entre dispositivos.
        </li>
        <li>
          Atender consultas, reclamos y solicitudes, y enviar comunicaciones
          sobre el servicio (cambios, seguridad).
        </li>
        <li>
          Con tu consentimiento, medir el uso del sitio de forma agregada para
          mejorar los contenidos (analítica).
        </li>
        <li>
          Con tu consentimiento, mostrar publicidad que ayude a mantener el
          servicio gratuito.
        </li>
        <li>Gestionar pagos y facturación si se ofrecen planes de pago.</li>
        <li>
          Garantizar la seguridad del sitio, prevenir fraudes y cumplir
          obligaciones legales o requerimientos de autoridades.
        </li>
      </ol>
    ),
  },
  {
    id: "autorizacion",
    title: "Autorización del Titular",
    content: (
      <>
        <p>
          Pediremos tu autorización previa, expresa e informada antes de tratar
          tus datos, mediante una casilla de aceptación al crear la cuenta o al
          activar una función. Conservaremos prueba de esa autorización (fecha,
          versión de esta política y medio). Las cookies analíticas y de
          publicidad se activan solo con tu consentimiento en el aviso de
          cookies.
        </p>
        <p>
          La autorización no es necesaria en los casos del artículo 10 de la Ley
          1581 de 2012 (por ejemplo, requerimientos de una autoridad en
          ejercicio de sus funciones, datos de naturaleza pública o urgencias
          médicas).
        </p>
      </>
    ),
  },
  {
    id: "menores",
    title: "Datos de niños, niñas y adolescentes",
    content: (
      <>
        <p>
          Muchos usuarios de {SITE.name} son estudiantes menores de 18 años.
          Según el artículo 7 de la Ley 1581 de 2012 y el artículo 2.2.2.25.2.9
          del Decreto 1074 de 2015, solo trataremos sus datos cuando el
          Tratamiento responda a su interés superior y asegure el respeto de sus
          derechos fundamentales.
        </p>
        <ul>
          <li>
            Para crear una cuenta de un menor de 18 años se exigirá la{" "}
            <strong>
              autorización de su padre, madre o representante legal
            </strong>
            , después de que el menor haya sido escuchado y su opinión valorada
            según su madurez.
          </li>
          <li>
            Pediremos solo los datos mínimos necesarios para el servicio
            educativo.
          </li>
          <li>
            No usaremos los datos de menores para publicidad personalizada ni
            para perfiles comerciales.
          </li>
          <li>
            El representante legal puede ejercer en cualquier momento los
            derechos del menor descritos en esta política.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "derechos",
    title: "Derechos de los Titulares",
    content: (
      <>
        <p>
          De acuerdo con el artículo 8 de la Ley 1581 de 2012, como Titular
          puedes:
        </p>
        <ol>
          <li>Conocer, actualizar y rectificar tus datos personales.</li>
          <li>Solicitar prueba de la autorización otorgada.</li>
          <li>
            Ser informado, previa solicitud, sobre el uso que se ha dado a tus
            datos.
          </li>
          <li>
            Presentar quejas ante la <LinkSIC /> por infracciones a la ley, una
            vez agotado el trámite de consulta o reclamo ante nosotros.
          </li>
          <li>
            Revocar la autorización y/o solicitar la supresión de tus datos
            cuando no se respeten los principios, derechos y garantías legales.
            No procede cuando exista un deber legal o contractual de
            conservarlos.
          </li>
          <li>Acceder en forma gratuita a tus datos personales.</li>
        </ol>
      </>
    ),
  },
  {
    id: "canales",
    title: "Área responsable y canales de atención",
    content: (
      <p>
        El Responsable atiende directamente las peticiones, consultas y reclamos
        a través del correo <Correo />. Indica tu nombre, documento de
        identidad, la descripción de tu solicitud, la dirección o correo donde
        quieres recibir respuesta y, si actúas por otra persona, el documento
        que acredite tu representación. Los derechos pueden ejercerlos el
        Titular, sus causahabientes, su representante o apoderado, y los
        representantes de menores de edad.
      </p>
    ),
  },
  {
    id: "consultas",
    title: "Procedimiento de consultas",
    content: (
      <p>
        Puedes consultar la información personal que tengamos sobre ti.
        Responderemos en un término máximo de{" "}
        <strong>diez (10) días hábiles</strong> contados a partir de la fecha de
        recibo. Si no es posible atenderla en ese plazo, te informaremos los
        motivos y la nueva fecha de respuesta, que no superará cinco (5) días
        hábiles siguientes al vencimiento del primer término (artículo 14 de la
        Ley 1581 de 2012).
      </p>
    ),
  },
  {
    id: "reclamos",
    title: "Procedimiento de reclamos",
    content: (
      <>
        <p>
          Si consideras que tus datos deben ser corregidos, actualizados o
          suprimidos, o que hay un incumplimiento de la ley, puedes presentar un
          reclamo (artículo 15 de la Ley 1581 de 2012):
        </p>
        <ol>
          <li>
            Si el reclamo está incompleto, te pediremos dentro de los cinco (5)
            días siguientes a su recibo que lo completes. Si pasan dos (2) meses
            sin que lo hagas, se entenderá que desististe.
          </li>
          <li>
            Una vez completo, incluiremos en la base de datos la leyenda
            «reclamo en trámite» en un término no mayor a dos (2) días hábiles.
          </li>
          <li>
            Responderemos en un término máximo de{" "}
            <strong>quince (15) días hábiles</strong> contados a partir del día
            siguiente a su recibo. Si no es posible, te informaremos los motivos
            y la nueva fecha, que no superará ocho (8) días hábiles siguientes
            al vencimiento del primer término.
          </li>
        </ol>
        <p>
          <strong>Requisito de procedibilidad:</strong> solo podrás elevar una
          queja ante la SIC después de haber agotado el trámite de consulta o
          reclamo ante nosotros (artículo 16 de la Ley 1581 de 2012).
        </p>
      </>
    ),
  },
  {
    id: "terceros",
    title: "Encargados, transmisiones y transferencias internacionales",
    content: (
      <>
        <p>
          Para operar el servicio usamos proveedores que pueden tratar datos por
          nuestra cuenta (Encargados) y cuyos servidores pueden estar fuera de
          Colombia, principalmente en Estados Unidos:
        </p>
        <TablaTerceros />
        <p>
          Las transmisiones a Encargados se hacen bajo contratos o condiciones
          de servicio que les obligan a tratar los datos solo para las
          finalidades autorizadas, con seguridad y confidencialidad (artículo
          2.2.2.25.5.2 del Decreto 1074 de 2015). Las transferencias
          internacionales se harán a países que la SIC reconozca con un nivel
          adecuado de protección o, en su defecto, con tu autorización expresa e
          inequívoca, conforme al artículo 26 de la Ley 1581 de 2012. Al aceptar
          esta política autorizas la transmisión y transferencia internacional
          descritas en esta sección.
        </p>
        <p>No vendemos tus datos personales.</p>
      </>
    ),
  },
  {
    id: "seguridad",
    title: "Seguridad de la información",
    content: (
      <p>
        Adoptamos medidas técnicas, humanas y administrativas razonables para
        proteger los datos: conexiones cifradas (HTTPS), acceso restringido,
        contraseñas cifradas y proveedores con estándares reconocidos de
        seguridad. Ningún sistema es infalible; si ocurre un incidente que
        afecte tus datos, lo informaremos a la SIC y a los afectados según la
        ley.
      </p>
    ),
  },
  {
    id: "vigencia",
    title: "Vigencia y conservación de los datos",
    content: (
      <>
        <p>
          Esta política rige desde la fecha indicada al inicio. Los datos se
          conservarán mientras sean necesarios para las finalidades descritas,
          mientras tengas una cuenta activa o hasta que solicites su supresión,
          salvo que una norma exija conservarlos por más tiempo.
        </p>
        <p>
          Cuando la ley lo exija (Decreto 090 de 2018), las bases de datos se
          inscribirán en el Registro Nacional de Bases de Datos administrado por
          la SIC.
        </p>
      </>
    ),
  },
  {
    id: "cambios",
    title: "Cambios a esta política",
    content: (
      <p>
        Si cambiamos esta política de forma sustancial, te lo informaremos en el
        sitio antes de aplicar los cambios o al momento de hacerlo. Si el cambio
        se refiere a la finalidad del Tratamiento, pediremos una nueva
        autorización. Consulta también nuestra <LinkPrivacidad /> y la{" "}
        <LinkCookies />.
      </p>
    ),
  },
  {
    id: "autoridad",
    title: "Autoridad de protección de datos",
    content: (
      <p>
        La autoridad de protección de datos personales en Colombia es la{" "}
        <LinkSIC />, a través de su Delegatura para la Protección de Datos
        Personales.
      </p>
    ),
  },
];

export default function TratamientoDatos() {
  return (
    <LegalPage
      path="/tratamiento-de-datos"
      title="Política de Tratamiento de Datos Personales"
      intro={
        <p>
          Esta política explica cómo {SITE.name} recoge, usa, guarda y protege
          los datos personales, y cómo puedes ejercer tus derechos de habeas
          data conforme a la Ley 1581 de 2012.
        </p>
      }
      sections={sections}
    />
  );
}
