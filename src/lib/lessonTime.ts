import type { Lesson } from "./appData";

/** Ritmo de lectura cómodo para contenido de estudio en el celular (palabras por minuto). */
const WPM = 130;

/** Minutos de lectura de las tarjetas (sin la práctica). */
export function readingMinutes(lesson: Pick<Lesson, "content">): number {
  const words = lesson.content.reduce((n, c) => n + `${c.title ?? ""} ${c.text} ${c.highlight ?? ""}`.split(/\s+/).filter(Boolean).length, 0);
  return words / WPM;
}

/** Duración honesta de la lección: tarjetas + ~1 minuto por pregunta, redondeada. */
export function lessonMinutes(lesson: Pick<Lesson, "content" | "questionIds">): number {
  return Math.max(2, Math.round(readingMinutes(lesson) + lesson.questionIds.length));
}
