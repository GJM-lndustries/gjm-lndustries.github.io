import { useEffect } from "react";
import { Link } from "wouter";
import { Check, ChevronRight, Flame, ShieldCheck } from "lucide-react";
import { useProgress } from "@/contexts/ProgressContext";
import { weekCalendar, weekProgress, DEFAULT_WEEKLY_GOAL } from "@/lib/streaks";
import { AREA_INFO } from "@/data/questions/meta";
import { nextLesson, recommendedArea } from "@/lib/reto";
import { motion, AnimatePresence } from "framer-motion";
import { haptic, useCountUp } from "@/lib/feedback";
import { useNow } from "@/hooks/useNow";

const WEEKDAY = new Intl.DateTimeFormat("es-CO", { weekday: "long", timeZone: "UTC" });

/**
 * Tarjeta principal de /inicio: un solo botón para el reto de hoy, los pasos con
 * progreso de entrada (definir la meta ya cuenta el primer día), la semana con la meta
 * flexible de días y el comodín automático. Sin contadores en cero.
 */
export default function DailyChallengeCard() {
  const { progress, acknowledgeStreakCelebration, dismissFreezeNotice } = useProgress();
  const { streakState } = progress;
  const today = streakState.today;
  const now = useNow();
  const week = weekCalendar(streakState, now);
  const wp = now ? weekProgress(streakState, now) : { done: week.filter(d => d.done).length, goal: streakState.weeklyGoal ?? DEFAULT_WEEKLY_GOAL, met: false };
  const showCelebrate = today.completed && !today.celebrated;
  const days = streakState.current;
  const firstStreak = days === 0 && streakState.longest === 0 && streakState.days.length === 0;
  const shownDay = useCountUp(streakState.current, Math.max(0, streakState.current - 1), showCelebrate);
  useEffect(() => {
    if (showCelebrate) haptic([18, 60, 18]);
  }, [showCelebrate]);

  const completedIds = progress.completedLessons.map(l => l.lessonId);
  const area = recommendedArea({ diagnostic: progress.diagnostic, areaStats: progress.areaStats, completedLessonIds: completedIds, daysDone: streakState.days.length });
  const { module, lesson } = nextLesson(area, completedIds);
  const areaLabel = AREA_INFO[area].label.toLowerCase();
  const minutes = progress.plan?.dailyMinutes ?? 5;

  // El primer día, haber definido la meta ya es un paso hecho (progreso real, no inflado).
  const steps = [
    ...(firstStreak && progress.hasCompletedOnboarding ? [{ id: "meta", label: "Definiste tu meta", sub: `${progress.targetScore} puntos`, done: true }] : []),
    { id: "lectura", label: "Lee una lección corta", sub: `${lesson.title} · ~2 min`, done: today.readingDone },
    { id: "practica", label: "Responde 3 preguntas", sub: `De ${areaLabel} · ~2 min`, done: today.answeringDone },
  ];
  const doneSteps = steps.filter(s => s.done).length;
  const started = today.readingMs > 0 || today.answeringMs > 0 || today.questionsAnswered > 0;
  const href = !today.readingDone ? `/${module.id}?leccion=${lesson.id}&reto=1` : "/practica?reto=1";
  const notice = streakState.freezeNotice;

  return (
    <section className="card overflow-hidden" aria-labelledby="reto-hoy">
      <div className="flex items-start justify-between gap-3 p-5 pb-4">
        <div>
          <p className="eyebrow">Reto de hoy{!today.completed && ` · ${doneSteps} de ${steps.length} listo`}</p>
          <h2 id="reto-hoy" className="section-title mt-1">
            {today.completed ? "Reto cumplido. Nos vemos mañana." : "Una lección corta y 3 preguntas"}
          </h2>
        </div>
        {!firstStreak && (
          <Link
            href="/yo"
            className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1.5 text-sm font-semibold text-orange-700"
            aria-label={`Racha de ${days} ${days === 1 ? "día" : "días"}`}
          >
            <Flame className="h-4 w-4" aria-hidden="true" />
            {days} {days === 1 ? "día" : "días"}
          </Link>
        )}
      </div>

      {notice && (
        <div className="mx-5 mb-4 flex items-start gap-3 rounded-xl bg-sky-50 p-3" role="status">
          <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-sky-700" aria-hidden="true" />
          <p className="flex-1 text-sm text-foreground">
            Usamos tu comodín para cubrir el {WEEKDAY.format(new Date(`${notice}T12:00:00Z`))}. Tu racha sigue en {days}.
          </p>
          <button type="button" onClick={dismissFreezeNotice} className="text-sm font-semibold text-sky-800 underline-offset-2 hover:underline">
            Entendido
          </button>
        </div>
      )}

      <ol className="space-y-1 px-5" aria-label="Pasos del reto">
        {steps.map((s, i) => (
          <li key={s.id} className="flex items-center gap-3 py-2">
            <span
              className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold ${s.done ? "bg-brand text-ink" : "border-2 border-border text-muted-foreground"}`}
              aria-hidden="true"
            >
              {s.done ? <Check className="h-4 w-4" strokeWidth={2.75} /> : i + 1}
            </span>
            <span className="min-w-0 flex-1">
              <span className={`block text-[15px] font-semibold ${s.done ? "text-muted-foreground line-through decoration-1" : "text-foreground"}`}>{s.label}</span>
              <span className="block truncate text-xs text-muted-foreground">{s.sub}</span>
            </span>
            <span className="sr-only">{s.done ? "Hecho" : "Pendiente"}</span>
          </li>
        ))}
      </ol>

      <div className="px-5 pb-5 pt-3">
        {today.completed ? (
          <Link href="/practica" className="btn-secondary w-full">Practicar más (opcional)</Link>
        ) : (
          <Link href={href} className="btn-primary w-full" data-testid="reto-boton">
            {started ? "Seguir con el reto" : "Empezar el reto de hoy"} <span className="font-normal opacity-80">· {minutes} min</span>
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </Link>
        )}
      </div>

      <AnimatePresence>
        {showCelebrate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/40 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="racha-celebra"
          >
            <motion.div
              initial={{ scale: 0.96, y: 8 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
              className="w-full max-w-sm rounded-2xl bg-card p-6 text-center shadow-lg"
            >
              <span className="icon-tile anim-pop mx-auto h-14 w-14 rounded-2xl bg-orange-50 text-orange-600" aria-hidden="true">
                <Flame className="h-7 w-7" strokeWidth={1.75} />
              </span>
              <h3 id="racha-celebra" className="mt-4 font-['Lexend'] text-xl font-bold">
                Día <span className="tabular-nums">{shownDay}</span> cumplido
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Esta semana llevas {wp.done} de {wp.goal} días. {wp.met ? "Meta de la semana cumplida." : "Mañana sigues con otro reto corto."}
              </p>
              <button type="button" className="btn-primary mt-5 w-full" onClick={() => acknowledgeStreakCelebration()}>
                Seguir
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

/** «Esta semana»: días cumplidos frente a la meta flexible, con el comodín. Tarjeta propia (columna derecha en escritorio). */
export function WeekCard() {
  const { progress } = useProgress();
  const { streakState } = progress;
  const now = useNow();
  const week = weekCalendar(streakState, now);
  const wp = now ? weekProgress(streakState, now) : { done: week.filter(d => d.done).length, goal: streakState.weeklyGoal ?? DEFAULT_WEEKLY_GOAL, met: false };
  const firstStreak = streakState.current === 0 && streakState.longest === 0 && streakState.days.length === 0;
  return (
    <section className="card space-y-3 p-5" aria-labelledby="semana-titulo" data-testid="semana">
        <div className="flex items-baseline justify-between gap-3">
          <h2 id="semana-titulo" className="text-sm font-semibold text-foreground">Esta semana</h2>
          <p className="text-sm tabular-nums text-muted-foreground">
            <strong className="text-foreground">{wp.done}</strong> de {wp.goal} días
          </p>
        </div>
        <ol className="grid grid-cols-7 gap-1" aria-label="Tu semana" data-today={week.find(d => d.isToday)?.date ?? ""}>
          {week.map(d => (
            <li key={d.date} className="flex flex-col items-center gap-1">
              <span className="text-[11px] font-medium text-muted-foreground">{d.label}</span>
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                  d.done ? "bg-brand text-ink" : d.frozen ? "bg-sky-100 text-sky-700" : d.isToday ? "border-2 border-navy text-navy" : "bg-muted text-muted-foreground"
                }`}
                title={d.date}
              >
                {d.done ? <Check className="h-4 w-4" strokeWidth={2.5} aria-label="Cumplido" /> : d.frozen ? <ShieldCheck className="h-4 w-4" aria-label="Cubierto con comodín" /> : null}
              </span>
            </li>
          ))}
        </ol>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {firstStreak
            ? `Tu meta es de ${wp.goal} días por semana. Si un día no puedes, no pasa nada: cuenta la semana.`
            : wp.met
              ? "Cumpliste tu meta de la semana. Lo que hagas de más es ganancia."
              : `Si un día no puedes, tu comodín semanal cubre ese día y la racha sigue (${streakState.freezeUsedWeek && streakState.freezesAvailable === 0 ? "ya lo usaste esta semana" : "te queda 1"}).`}
        </p>
      </section>
  );
}
