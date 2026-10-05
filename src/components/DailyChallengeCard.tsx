import { useState } from "react";
import { Link } from "wouter";
import { BookOpenText, Check, ChevronRight, Flame, PenLine, ShieldCheck } from "lucide-react";
import { useProgress } from "@/contexts/ProgressContext";
import {
  ANSWERING_GOAL_MS,
  READING_GOAL_MS,
  formatMs,
  weekCalendar,
} from "@/lib/streaks";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Tarjeta principal del tablero: el reto diario (leer + practicar), la semana
 * de racha y el comodín semanal. Sin emoji: iconos lucide en cuadros de color.
 */
export default function DailyChallengeCard() {
  const { progress, useStreakFreeze, acknowledgeStreakCelebration } = useProgress();
  const { streakState } = progress;
  const today = streakState.today;
  const readingPct = Math.min(100, Math.round((today.readingMs / READING_GOAL_MS) * 100));
  const answeringPct = Math.min(100, Math.round((today.answeringMs / ANSWERING_GOAL_MS) * 100));
  const week = weekCalendar(streakState);
  const showCelebrate = today.completed && !today.celebrated;
  const [freezeMsg, setFreezeMsg] = useState<string | null>(null);
  const days = streakState.current;

  return (
    <section className="card overflow-hidden" aria-labelledby="reto-hoy">
      <div className="flex items-start justify-between gap-3 p-5 pb-4">
        <div>
          <p className="eyebrow">Reto de hoy</p>
          <h2 id="reto-hoy" className="section-title mt-1">
            {today.completed ? "Reto cumplido. Nos vemos mañana." : "Lee una lección y practica"}
          </h2>
        </div>
        <div
          className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1.5 text-sm font-semibold text-orange-700"
          aria-label={`Racha de ${days} ${days === 1 ? "día" : "días"}`}
        >
          <Flame className="h-4 w-4" aria-hidden="true" />
          {days} {days === 1 ? "día" : "días"}
        </div>
      </div>

      <ul className="divide-y divide-border border-y border-border">
        <TaskRow
          icon={<BookOpenText className="h-5 w-5" strokeWidth={1.75} />}
          tile="bg-amber-50 text-amber-700"
          label="Lectura activa"
          goal="2 minutos en una lección"
          pct={readingPct}
          done={today.readingDone}
          detail={`${formatMs(today.readingMs)} de ${formatMs(READING_GOAL_MS)}`}
          href="/matematicas"
        />
        <TaskRow
          icon={<PenLine className="h-5 w-5" strokeWidth={1.75} />}
          tile="bg-blue-50 text-blue-700"
          label="Práctica"
          goal="3 preguntas, mínimo 1:50"
          pct={answeringPct}
          done={today.answeringDone}
          detail={`${formatMs(today.answeringMs)} de ${formatMs(ANSWERING_GOAL_MS)} · ${today.questionsAnswered} ${today.questionsAnswered === 1 ? "pregunta" : "preguntas"}`}
          href="/practica"
        />
      </ul>

      <div className="space-y-4 p-5 pt-4">
        <ol className="grid grid-cols-7 gap-1" aria-label="Tu semana">
          {week.map(d => (
            <li key={d.date} className="flex flex-col items-center gap-1">
              <span className="text-[11px] font-medium text-muted-foreground">{d.label}</span>
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                  d.done
                    ? "bg-brand text-ink"
                    : d.isToday
                      ? "border-2 border-navy text-navy"
                      : "bg-muted text-muted-foreground"
                }`}
                title={d.date}
              >
                {d.done ? <Check className="h-4 w-4" strokeWidth={2.5} aria-label="Cumplido" /> : null}
              </span>
            </li>
          ))}
        </ol>

        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 text-xs text-muted-foreground">
          <span>
            Mejor racha: <strong className="text-foreground">{streakState.longest}</strong>
            <span className="mx-1.5" aria-hidden="true">·</span>
            Comodines: <strong className="text-foreground">{streakState.freezesAvailable}</strong>
          </span>
          <button
            type="button"
            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-border px-2.5 font-semibold text-navy hover:bg-muted"
            onClick={() => {
              const { error } = useStreakFreeze();
              setFreezeMsg(error ?? "Listo: usaste el comodín y tu racha sigue.");
            }}
          >
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" /> Usar comodín
          </button>
        </div>
        {freezeMsg ? (
          <p className="text-xs text-foreground" role="status">
            {freezeMsg}
          </p>
        ) : (
          <p className="text-xs leading-relaxed text-muted-foreground">
            El día cuenta cuando completas las dos partes. El tiempo se pausa si cambias de pestaña. Tienes un comodín por semana para no perder la racha.
          </p>
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
            <div className="w-full max-w-sm rounded-2xl bg-card p-6 text-center shadow-lg">
              <span className="icon-tile mx-auto h-14 w-14 rounded-2xl bg-orange-50 text-orange-600" aria-hidden="true">
                <Flame className="h-7 w-7" strokeWidth={1.75} />
              </span>
              <h3 id="racha-celebra" className="mt-4 font-['Lexend'] text-xl font-bold">
                Día {streakState.current} cumplido
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Terminaste el reto de hoy. Vuelve mañana para mantener la racha.
              </p>
              <button type="button" className="btn-primary mt-5 w-full" onClick={() => acknowledgeStreakCelebration()}>
                Seguir
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function TaskRow({
  icon,
  tile,
  label,
  goal,
  pct,
  done,
  detail,
  href,
}: {
  icon: React.ReactNode;
  tile: string;
  label: string;
  goal: string;
  pct: number;
  done: boolean;
  detail: string;
  href: string;
}) {
  return (
    <li>
      <Link href={href} className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-muted/50">
        <span className={`icon-tile ${done ? "bg-brand-soft text-green-700" : tile}`} aria-hidden="true">
          {done ? <Check className="h-5 w-5" strokeWidth={2.25} /> : icon}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-baseline justify-between gap-2">
            <span className="text-sm font-semibold text-foreground">{label}</span>
            <span className="text-xs tabular-nums text-muted-foreground">{done ? "Hecho" : `${pct}%`}</span>
          </span>
          <span className="block text-xs text-muted-foreground">{goal}</span>
          <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden="true">
            <span className="block h-full rounded-full bg-brand transition-all" style={{ width: `${pct}%` }} />
          </span>
          <span className="mt-1 block text-[11px] tabular-nums text-muted-foreground">{detail}</span>
        </span>
        <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" aria-hidden="true" />
      </Link>
    </li>
  );
}
