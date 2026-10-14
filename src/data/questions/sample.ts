/**
 * Pregunta de ejemplo de la portada. Es una copia de «math-1-q1» del banco (matematicas.json)
 * para que la portada no descargue todo el banco de preguntas (~200 KB).
 * sample.test.ts verifica que siga idéntica a la del banco.
 */
import type { Question } from "./types";

export const SAMPLE_QUESTION: Question = {
  "id": "math-1-q1",
  "area": "matematicas",
  "competencia": "Interpretación y representación",
  "afirmacion": "Comprende y transforma la información cuantitativa y esquemática presentada en distintos formatos.",
  "difficulty": 1,
  "enunciado": "En una heladería, cada vaso de helado cuesta $3.000. A cada vaso se le puede agregar acompañamientos por $1.000 cada uno. ¿Cuál expresión permite calcular el precio total de un vaso con varios acompañamientos?",
  "options": [
    {
      "id": "a",
      "text": "1.000 + (1.000 × número de acompañamientos)"
    },
    {
      "id": "b",
      "text": "3.000 + (1.000 × número de acompañamientos)"
    },
    {
      "id": "c",
      "text": "1.000 + (3.000 × número de acompañamientos)"
    },
    {
      "id": "d",
      "text": "3.000 + (3.000 × número de acompañamientos)"
    }
  ],
  "answer": "b",
  "explanation": "El precio base del helado es $3.000 (ese siempre va). Luego sumas $1.000 por cada acompañamiento que agregues. Por eso la fórmula es: 3.000 + (1.000 × número de acompañamientos).",
  "tip": "Identifica el valor fijo (3.000) y el valor que cambia (1.000 × n). El fijo siempre está, el variable depende de cuántos pidas.",
  "source": "proicfes-lecciones",
  "reviewed": false
};
