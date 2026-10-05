import { Link } from "wouter";
import { CheckCircle2, Flame, Snowflake } from "lucide-react";
import { useProgress } from "@/contexts/ProgressContext";
import {
  ANSWERING_GOAL_MS,
  READING_GOAL_MS,
  formatMs,
  weekCalendar,
} from "@/lib/streaks";
import { motion, AnimatePresence } from "framer-motion";

export default function DailyChallengeCard() {
  const { progress, useStreakFreeze, acknowledgeStreakCelebration } = useProgress();
  const { streakState } = progress;
  const today = streakState.today;
  const readingPct = Math.min(100, Math.round((today.readingMs / READING_GOAL_MS) * 100));
  const answeringPct = Math.min(100, Math.round((today.answeringMs / ANSWERING_GOAL_MS) * 100));
  const week = weekCalendar(streakState);
  const showCelebrate = today.completed && !today.celebrated;

  return (
    <section className="space-y-3" aria-labelledby="reto-hoy">
      <div className="flex items-center justify-between gap-3">
        <h2 id="reto-hoy" className="font-['Lexend'] text-lg font-bold text-foreground">
          Reto de hoy
        </h2>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/10 px-3 py-1 text-sm font-bold text-orange-600">
          <Flame className="h-4 w-4" aria-hidden="true" />
          {streakState.current}
          <span className="font-medium text-muted-foreground">día{streakState.current === 1 ? "" : "s"}</span>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 space-y-4">
        <ol className="grid grid-cols-7 gap-1.5" aria-label="Semana de racha">
          {week.map(d => (
            <li key={d.date} className="text-center">
              <span className="text-[10px] font-semibold text-muted-foreground">{d.label}</span>
              <div
                className={`mx-auto mt-1 flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                  d.done
                    ? "bg-[#4ade80] text-[#0f2040]"
                    : d.isToday
                      ? "border-2 border-[#1e3a5f] text-[#1e3a5f]"
                      : "bg-muted text-muted-foreground"
                }`}
                title={d.date}
              >
                {d.done ? "✓" : ""}
              </div>
            </li>
          ))}
        </ol>

        <div className="space-y-3">
          <ProgressRow
            label="Leer una lección (2 min activos)"
            pct={readingPct}
            done={today.readingDone}
            detail={`${formatMs(today.readingMs)} / ${formatMs(READING_GOAL_MS)}`}
            href="/matematicas"
          />
          <ProgressRow
            label="Practicar (≥ 1:50 y 3 preguntas)"
            pct={answeringPct}
            done={today.answeringDone}
            detail={`${formatMs(today.answeringMs)} / ${formatMs(ANSWERING_GOAL_MS)} · ${today.questionsAnswered} preg.`}
            href="/practica"
          />
        </div>

        {today.completed ? (
          <p className="text-sm font-semibold text-green-700" role="status">
            ¡Reto del día completado! Tu racha sigue viva.
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            El día solo cuenta cuando terminas ambas partes. El temporizador se pausa si cambias de pestaña.
          </p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-xs text-muted-foreground">
          <span>
            Mejor racha: <strong className="text-foreground">{streakState.longest}</strong> · Congelamientos:{" "}
            <strong className="text-foreground">{streakState.freezesAvailable}</strong>
          </span>
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1.5 font-semibold hover:bg-muted"
            onClick={() => {
              const { error } = useStreakFreeze();
              if (error) alert(error);
            }}
          >
            <Snowflake className="h-3.5 w-3.5" aria-hidden="true" /> Usar freeze
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showCelebrate && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="racha-celebra"
          >
            <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-xl">
              <Flame className="mx-auto h-12 w-12 text-orange-500" aria-hidden="true" />
              <h3 id="racha-celebra" className="mt-3 font-['Lexend'] text-xl font-bold">
                ¡Día {streakState.current} conseguido!
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Completaste el reto de hoy. Vuelve mañana para seguir la racha.
              </p>
              <button
                type="button"
                className="mt-5 min-h-11 w-full rounded-2xl bg-[#1e3a5f] font-bold text-white"
                onClick={() => acknowledgeStreakCelebration()}
              >
                Seguir
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function ProgressRow({
  label,
  pct,
  done,
  detail,
  href,
}: {
  label: string;
  pct: number;
  done: boolean;
  detail: string;
  href: string;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
          {done ? <CheckCircle2 className="h-4 w-4 text-green-600" aria-hidden="true" /> : null}
          {label}
        </p>
        <Link href={href} className="text-xs font-semibold text-primary hover:underline">
          Ir
        </Link>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-[#4ade80] transition-all" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-1 text-[11px] text-muted-foreground">{detail}</p>
    </div>
  );
}
