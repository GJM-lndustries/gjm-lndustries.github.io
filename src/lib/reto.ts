/** Qué toca hoy: área recomendada y siguiente lección, a partir del progreso. */
import { modules, type Lesson, type Module } from "./appData";
import { AREA_IDS, type AreaId } from "@/data/questions/types";
import type { AreaStats } from "./score";

interface RetoInput {
  diagnostic?: { answers: { area: AreaId; correct: boolean }[] };
  areaStats: AreaStats;
  completedLessonIds: string[];
  /** Días ya completados: sirve para rotar de área si no hay datos. */
  daysDone: number;
}

/** Área para practicar hoy: la más floja según lo respondido; si no hay datos, rota. */
export function recommendedArea({ diagnostic, areaStats, daysDone }: RetoInput): AreaId {
  const scored = AREA_IDS.map(a => {
    const st = areaStats[a];
    const acc = st && st.answered >= 2 ? st.correct / st.answered : null;
    const diagWrong = diagnostic?.answers.some(x => x.area === a && !x.correct) ?? false;
    return { a, acc, diagWrong };
  });
  const withAcc = scored.filter(x => x.acc != null).sort((p, q) => p.acc! - q.acc!);
  if (withAcc.length >= 2 && withAcc[0]!.acc! < 0.8) return withAcc[0]!.a;
  // Inglés pesa 1 de 13: se recomienda solo si es lo único flojo.
  const weak = scored.filter(x => x.diagWrong);
  const weakMain = weak.filter(x => x.a !== "ingles");
  if (weakMain.length) return weakMain[daysDone % weakMain.length]!.a;
  if (weak.length) return weak[0]!.a;
  return AREA_IDS[daysDone % AREA_IDS.length]!;
}

export function moduleFor(area: AreaId): Module {
  return modules.find(m => m.area === area) ?? modules[0]!;
}

/** Siguiente lección sin terminar del área (o, si ya terminó todas, la primera para repasar). */
export function nextLesson(area: AreaId, completedLessonIds: string[]): { module: Module; lesson: Lesson } {
  const mod = moduleFor(area);
  const pending = mod.lessons.find(l => !completedLessonIds.includes(l.id));
  if (pending) return { module: mod, lesson: pending };
  for (const m of modules) {
    const p = m.lessons.find(l => !completedLessonIds.includes(l.id));
    if (p) return { module: m, lesson: p };
  }
  return { module: mod, lesson: mod.lessons[0]! };
}
