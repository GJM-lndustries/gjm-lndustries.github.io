/**
 * Preguntas frecuentes. Se muestran en /preguntas-frecuentes (y las primeras en el inicio)
 * y alimentan el JSON-LD FAQPage. Información verificada con la Guía de orientación
 * Saber 11.° del ICFES y la Resolución 268 de 2020 del ICFES (cálculo de puntajes).
 */
export interface FaqItem {
  id: string;
  question: string;
  /** Párrafos de la respuesta (texto plano). */
  answer: string[];
}

export const FAQ: FaqItem[] = [
  {
    id: "que-es-saber-11",
    question: "¿Qué es el examen Saber 11?",
    answer: [
      "Es el examen de Estado que aplica el ICFES a quienes terminan la educación media (grado 11) en Colombia. Tiene cinco pruebas: Lectura crítica, Matemáticas, Sociales y ciudadanas, Ciencias naturales e Inglés, además de dos cuestionarios cortos (socioeconómico y de clima escolar) que no afectan tu puntaje.",
      "Sus resultados se usan, entre otras cosas, en los procesos de admisión a la educación superior y para acceder a becas y créditos educativos.",
      "Es obligatorio: presentarlo es requisito para recibir tu título de bachiller y para entrar a la educación superior (Ley 1324 de 2009, art. 7, modificado por la Ley 2294 de 2023, art. 129). Pero no se gana ni se pierde: para graduarte basta con presentarlo; tu puntaje es lo que te abre puertas después.",
    ],
  },
  {
    id: "como-es-el-examen",
    question: "¿Cómo es el examen y cuánto dura?",
    answer: [
      "Se presenta en dos sesiones de 4 horas y 30 minutos cada una. Las preguntas son de selección múltiple con única respuesta: lees una situación, un texto, una tabla o una gráfica y eliges la opción correcta.",
      "Una respuesta equivocada no te resta más que una en blanco, y una en blanco nunca suma: responde todas.",
      "Además de las cinco pruebas hay dos cuestionarios que no se califican: uno socioeconómico y uno de clima escolar (cómo vives el ambiente de tu colegio). Ninguno afecta tu puntaje.",
    ],
  },
  {
    id: "como-se-calcula-el-puntaje",
    question: "¿Cómo se calcula el puntaje global del ICFES?",
    answer: [
      "Cada prueba se califica de 0 a 100 y el puntaje global va de 0 a 500. Se obtiene con un promedio ponderado: Lectura crítica, Matemáticas, Sociales y ciudadanas y Ciencias naturales pesan 3 cada una, e Inglés pesa 1.",
      "La fórmula oficial es: puntaje global = (3 × Lectura crítica + 3 × Matemáticas + 3 × Sociales + 3 × Ciencias + 1 × Inglés) ÷ 13 × 5, redondeado al entero más cercano.",
      "Ejemplo: con 60 en las cuatro primeras pruebas y 50 en Inglés, (720 + 50) ÷ 13 × 5 = 296,2, es decir, 296 puntos.",
    ],
  },
  {
    id: "puntaje-por-prueba",
    question: "¿El puntaje de cada prueba es mi porcentaje de respuestas correctas?",
    answer: [
      "No exactamente. El ICFES calcula el puntaje de cada prueba con un modelo estadístico (teoría de respuesta al ítem) que tiene en cuenta, entre otras cosas, la dificultad de cada pregunta. La escala está construida para que el promedio de los evaluados quede alrededor de 50 puntos.",
      "Por eso dos personas con el mismo número de aciertos pueden obtener puntajes un poco distintos.",
    ],
  },
  {
    id: "puntaje-estimado-proicfes",
    question: "¿Cómo calcula ProICFES mi puntaje estimado?",
    answer: [
      "Tomamos tu porcentaje de aciertos en cada área (en lecciones, modo práctica y simulacro) como aproximación al puntaje de 0 a 100 de cada prueba y le aplicamos la ponderación oficial. Para verlo necesitas responder al menos 2 preguntas de cada una de las 5 áreas.",
      "Es una guía para saber dónde reforzar, no un resultado oficial ni una predicción exacta.",
    ],
  },
  {
    id: "como-usar-proicfes",
    question: "¿Cómo uso ProICFES para prepararme?",
    answer: [
      "Empieza por las lecciones del área que más te cuesta. Luego usa el modo práctica: eliges área, nivel y competencia, y después de cada pregunta ves la explicación y un tip.",
      "Las preguntas que fallas se guardan y vuelven a salir en tus siguientes sesiones para que las repases. Cuando te sientas listo, haz el simulacro y revisa «Yo» para ver tus aciertos por área.",
    ],
  },
  {
    id: "es-gratis",
    question: "¿ProICFES es gratis? ¿Necesito crear una cuenta?",
    answer: [
      "Sí, es gratis y no necesitas cuenta: tu progreso se guarda en tu navegador. Si quieres no perderlo al cambiar de celular, puedes crear una cuenta gratis (es opcional).",
    ],
  },
  {
    id: "percentil-y-puesto",
    question: "¿Qué es el percentil del ICFES? ¿Me dan un puesto?",
    answer: [
      "Tu reporte trae, para cada prueba y para el puntaje global, un percentil: el porcentaje de estudiantes que presentaron el examen y sacaron un puntaje más bajo que el tuyo. Por ejemplo, percentil 70 quiere decir que superaste al 70 % de quienes presentaron.",
      "El ICFES no te da un «puesto»: la Resolución 268 de 2020 (art. 7) dice que no publica listados de mejores resultados ni incluye puestos en los resultados individuales.",
    ],
  },
  {
    id: "puntaje-se-vence",
    question: "¿El puntaje del ICFES se vence?",
    answer: [
      "No. El Decreto 869 de 2010 (art. 7) dice que los resultados del Saber 11 tienen vigencia indefinida. Cada universidad sí puede decidir en su convocatoria de qué años acepta resultados, así que revisa la de la tuya.",
      "Los resultados anteriores se consultan en icfes.gov.co, en la sección Resultados.",
    ],
  },
  {
    id: "no-puedo-presentar",
    question: "¿Qué pasa si no puedo presentar el ICFES o falto a una sesión?",
    answer: [
      "Solo hay resultados para quienes asisten a todas las sesiones, así que ve a la mañana y a la tarde.",
      "No hay aplazamiento ni devolución por no ir. Pero si no pudiste asistir por fuerza mayor o caso fortuito (por ejemplo, una incapacidad médica, una calamidad doméstica grave o la muerte de un familiar cercano), puedes pedir que lo que pagaste se abone a otro examen del mismo tipo, este año o el siguiente. Tienes 15 días hábiles desde la fecha del examen para pedirlo, con pruebas, por el canal de PQRSDF del ICFES (Resolución ICFES 675 de 2019, art. 19).",
      "Recuerda que presentarlo es requisito para graduarte de bachiller. Si sabes que vas a faltar, avísale a tu colegio lo antes posible.",
    ],
  },
  {
    id: "consultar-resultados",
    question: "¿Cómo consulto mis resultados y qué hago si perdí el número de registro?",
    answer: [
      "Entra solo desde icfes.gov.co, en la sección Resultados. Puedes consultar con tu documento de identidad y fecha de nacimiento, o con tu número de registro. Desconfía de enlaces o «filtraciones» que circulen antes de la fecha oficial.",
      "El PDF que descargas es tu certificado oficial: tiene plena autenticidad y validez (Resolución ICFES 675 de 2019), así que no le pagues a nadie por un «certificado». Lo puedes descargar cuando quieras.",
      "Si perdiste el número de registro (lo piden universidades, el SENA y las becas), recupéralo gratis en la misma sección Resultados, en «Consulta el número de registro», con el tipo y número de documento con el que presentaste y tu fecha de nacimiento.",
    ],
  },
  {
    id: "preguntas-oficiales",
    question: "¿Las preguntas son del ICFES?",
    answer: [
      "No. Son preguntas de práctica tipo ICFES, escritas para ProICFES siguiendo las competencias que describe la guía oficial del Saber 11. ProICFES es un proyecto independiente y no está afiliado al ICFES.",
      "Para información oficial (fechas, inscripciones y resultados) consulta siempre icfes.gov.co.",
    ],
  },
];
