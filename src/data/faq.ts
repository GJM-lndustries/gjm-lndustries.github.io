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
      "Es el examen de Estado que aplica el ICFES a quienes terminan la educación media (grado 11) en Colombia. Tiene cinco pruebas: Lectura crítica, Matemáticas, Sociales y ciudadanas, Ciencias naturales e Inglés, además de un cuestionario socioeconómico.",
      "Sus resultados se usan, entre otras cosas, en los procesos de admisión a la educación superior y para acceder a becas y créditos educativos.",
    ],
  },
  {
    id: "como-es-el-examen",
    question: "¿Cómo es el examen y cuánto dura?",
    answer: [
      "Se presenta en dos sesiones de 4 horas y 30 minutos cada una. Las preguntas son de selección múltiple con única respuesta: lees una situación, un texto, una tabla o una gráfica y eliges la opción correcta.",
      "Las respuestas incorrectas no restan puntos, así que vale la pena no dejar preguntas en blanco.",
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
      "Las preguntas que fallas se guardan y vuelven a salir en tus siguientes sesiones para que las repases. Cuando te sientas listo, haz el simulacro y revisa «Mi progreso» para ver tus aciertos por área.",
    ],
  },
  {
    id: "es-gratis",
    question: "¿ProICFES es gratis? ¿Necesito crear una cuenta?",
    answer: [
      "Sí, es gratis y no necesitas cuenta. Tu progreso se guarda solo en tu navegador, en este dispositivo: si borras los datos del navegador o cambias de celular, empezarás de cero.",
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
