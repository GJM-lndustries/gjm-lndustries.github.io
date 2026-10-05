import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  BarChart3,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Coffee,
  Flag,
  ListChecks,
  MinusCircle,
  RotateCcw,
  Target,
  XCircle,
} from "lucide-react";
import { useProgress, type SimulacroRecord } from "@/contexts/ProgressContext";
import {
  AREA_IDS,
  AREA_INFO,
  getQuestion,
  questionsByArea,
  type AreaId,
  type Question,
} from "@/data/questions";
import QuestionView from "@/components/QuestionView";
import {
  SIMULACRO_STORAGE_KEY,
  answerQuestion,
  buildAttempt,
  expireIfNeeded,
  finishSession,
  formatClock,
  formatMinutes,
  goTo,
  isRunning,
  nextSession,
  parseAttempt,
  planFormat,
  remainingMs,
  scoreAttempt,
  startSession,
  toggleMark,
  type SimulacroAttempt,
  type SimulacroFormat,
  type SimulacroResult,
} from "@/lib/simulacro";

const BANK_COUNTS = Object.fromEntries(
  AREA_IDS.map(a => [a, questionsByArea[a].length])
) as Record<AreaId, number>;
const PLANS: Record<SimulacroFormat, ReturnType<typeof planFormat>> = {
  corto: planFormat("corto", BANK_COUNTS),
  completo: planFormat("completo", BANK_COUNTS),
};
const countOf = (areas: Partial<Record<AreaId, number>>) =>
  Object.values(areas).reduce((s, n) => s + (n ?? 0), 0);
const FORMAT_LABEL: Record<SimulacroFormat, string> = {
  corto: "Simulacro corto",
  completo: "Simulacro completo por sesiones",
};

const exists = (id: string) => getQuestion(id) !== undefined;
const questionOf = (id: string) => getQuestion(id) as Question;

function loadAttempt(): SimulacroAttempt | null {
  try {
    const a = parseAttempt(localStorage.getItem(SIMULACRO_STORAGE_KEY), exists);
    return a ? expireIfNeeded(a, Date.now()) : null;
  } catch {
    return null;
  }
}

function newSeed(): number {
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto)
    return crypto.getRandomValues(new Uint32Array(1))[0];
  return Math.floor(Math.random() * 2 ** 32);
}

export default function Simulacro() {
  // Primer render igual en el prerender y en el navegador: el intento guardado se carga después.
  const [attempt, setAttempt] = useState<SimulacroAttempt | null>(null);
  const [loaded, setLoaded] = useState(false);
  const { progress, recordSimulacro } = useProgress();

  useEffect(() => {
    setAttempt(loadAttempt());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      if (attempt)
        localStorage.setItem(SIMULACRO_STORAGE_KEY, JSON.stringify(attempt));
      else localStorage.removeItem(SIMULACRO_STORAGE_KEY);
    } catch {
      /* almacenamiento lleno o bloqueado: el simulacro sigue en memoria */
    }
  }, [attempt, loaded]);

  // Al terminar, el resultado se guarda una sola vez en el progreso.
  useEffect(() => {
    if (!attempt || attempt.finishedAt == null || attempt.recorded) return;
    const result = scoreAttempt(attempt, getQuestion);
    const record: SimulacroRecord = {
      id: `${attempt.createdAt}-${attempt.seed}`,
      format: attempt.format,
      finishedAt: new Date(attempt.finishedAt).toISOString(),
      global: result.global,
      percent: result.percent,
      correct: result.correct,
      total: result.total,
      perArea: Object.fromEntries(
        Object.entries(result.perArea).map(([a, r]) => [a, r!.score])
      ),
    };
    const answers = attempt.sessions
      .flatMap(s => s.questionIds)
      .filter(id => attempt.answers[id] !== undefined)
      .map(id => {
        const q = questionOf(id);
        return { question: q, correct: attempt.answers[id] === q.answer };
      });
    recordSimulacro(record, answers);
    setAttempt({ ...attempt, recorded: true });
  }, [attempt, recordSimulacro]);

  const start = (format: SimulacroFormat) => {
    const now = Date.now();
    setAttempt(
      startSession(buildAttempt(format, questionsByArea, newSeed(), now), now)
    );
    window.scrollTo({ top: 0 });
  };

  const discard = () => setAttempt(null);

  if (!attempt)
    return <Intro onStart={start} history={progress.simulacroHistory} />;
  if (attempt.finishedAt != null)
    return <Results attempt={attempt} onNew={discard} />;
  if (isRunning(attempt))
    return <Exam attempt={attempt} setAttempt={setAttempt} />;
  const session = attempt.sessions[attempt.current];
  if (session.startedAt == null) {
    // Intento guardado sin empezar (no debería pasar, pero se puede retomar).
    return (
      <Intro
        onStart={start}
        history={progress.simulacroHistory}
        resume={attempt}
        onResume={() => setAttempt(startSession(attempt, Date.now()))}
        onDiscard={discard}
      />
    );
  }
  return (
    <Break
      attempt={attempt}
      onContinue={() => {
        const now = Date.now();
        setAttempt(startSession(nextSession(attempt), now));
        window.scrollTo({ top: 0 });
      }}
    />
  );
}

/* ------------------------------------------------------------------ Intro */

function Intro({
  onStart,
  history,
  resume,
  onResume,
  onDiscard,
}: {
  onStart: (f: SimulacroFormat) => void;
  history: SimulacroRecord[];
  resume?: SimulacroAttempt;
  onResume?: () => void;
  onDiscard?: () => void;
}) {
  const corto = PLANS.corto[0];
  const completo = PLANS.completo;
  const recent = history.slice(-5).reverse();
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-['Lexend'] text-foreground">
          Simulacro Saber 11
        </h1>
        <p className="text-muted-foreground mt-1">
          Preguntas del banco de ProICFES, con tiempo y reglas como en el examen
          real. Al final ves tu puntaje estimado y la explicación de cada
          pregunta.
        </p>
      </div>

      {resume && onResume && onDiscard && (
        <div className="rounded-xl border border-yellow-300 bg-yellow-50 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <p className="text-sm text-yellow-900 flex-1">
            Tienes un {FORMAT_LABEL[resume.format].toLowerCase()} sin empezar.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onResume}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold"
            >
              Empezar
            </button>
            <button
              type="button"
              onClick={onDiscard}
              className="px-4 py-2 rounded-lg border border-border text-sm font-semibold"
            >
              Descartar
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <section
          aria-labelledby="sim-corto"
          className="bg-gradient-to-br from-[#1e3a5f] to-[#0f2040] rounded-2xl p-5 text-white flex flex-col"
        >
          <h2
            id="sim-corto"
            className="text-lg font-bold font-['Lexend'] flex items-center gap-2"
          >
            <Target className="w-5 h-5 text-[#4ade80]" aria-hidden="true" />{" "}
            Simulacro corto
          </h2>
          <p className="text-white/75 text-sm mt-1">
            Una sesión con las cinco pruebas. Ideal para medirte entre semana.
          </p>
          <dl className="grid grid-cols-2 gap-3 my-4">
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <dt className="text-xs text-white/70">Preguntas</dt>
              <dd className="text-2xl font-bold">{countOf(corto.areas)}</dd>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <dt className="text-xs text-white/70">Tiempo</dt>
              <dd className="text-2xl font-bold">
                {formatMinutes(corto.minutes)}
              </dd>
            </div>
          </dl>
          <p className="text-xs text-white/70 mb-4">
            {Object.entries(corto.areas)
              .map(([a, n]) => `${AREA_INFO[a as AreaId].label} ${n}`)
              .join(" · ")}
          </p>
          <button
            type="button"
            onClick={() => onStart("corto")}
            className="mt-auto w-full bg-[#4ade80] text-[#0f2040] py-3 rounded-xl font-bold font-['Lexend'] hover:bg-[#22c55e] transition-colors"
          >
            Empezar simulacro corto
          </button>
        </section>

        <section
          aria-labelledby="sim-completo"
          className="bg-card rounded-2xl border border-border p-5 flex flex-col"
        >
          <h2
            id="sim-completo"
            className="text-lg font-bold font-['Lexend'] text-foreground flex items-center gap-2"
          >
            <ListChecks className="w-5 h-5 text-primary" aria-hidden="true" />{" "}
            Simulacro completo por sesiones
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Dos sesiones con la misma estructura del examen, a escala de nuestro
            banco.
          </p>
          <ol className="space-y-2 my-4">
            {completo.map((s, i) => (
              <li key={i} className="rounded-xl bg-muted/60 p-3">
                <p className="text-sm font-semibold text-foreground">
                  Sesión {i + 1}: {countOf(s.areas)} preguntas ·{" "}
                  {formatMinutes(s.minutes)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {Object.entries(s.areas)
                    .map(([a, n]) => `${AREA_INFO[a as AreaId].label} ${n}`)
                    .join(" · ")}
                </p>
              </li>
            ))}
          </ol>
          <button
            type="button"
            onClick={() => onStart("completo")}
            className="mt-auto w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold font-['Lexend'] hover:bg-primary/90 transition-colors"
          >
            Empezar simulacro completo
          </button>
        </section>
      </div>

      <section
        aria-labelledby="sim-reglas"
        className="bg-primary/5 rounded-xl border border-primary/20 p-4"
      >
        <h2
          id="sim-reglas"
          className="font-bold font-['Lexend'] text-primary text-sm mb-2"
        >
          Reglas, como en el examen real
        </h2>
        <ul className="space-y-1.5 text-sm text-foreground list-disc pl-5">
          <li>
            El tiempo corre sin pausa desde que empiezas una sesión, aunque
            cierres la página o cambies de pestaña.
          </li>
          <li>
            Dentro de la sesión puedes avanzar, volver a cualquier pregunta,
            cambiar tu respuesta y marcarla para revisarla.
          </li>
          <li>
            Cuando terminas una sesión (o se acaba el tiempo) ya no puedes
            volver a ella.
          </li>
          <li>
            En el simulacro completo hay un receso entre la sesión 1 y la 2:
            empiezas la segunda cuando estés listo.
          </li>
          <li>
            No se restan puntos por respuestas incorrectas: no dejes preguntas
            en blanco.
          </li>
          <li>
            No verás si acertaste hasta el final. Ahí tienes el puntaje por
            prueba y la explicación de cada pregunta.
          </li>
        </ul>
        <p className="text-xs text-muted-foreground mt-3">
          El examen real tiene dos sesiones de 4 horas y 30 minutos. Aquí se
          conserva el mismo ritmo (unos 2 minutos por pregunta). El puntaje es
          un estimado: el ICFES calcula el oficial con modelos estadísticos
          propios.
        </p>
      </section>

      {recent.length > 0 && (
        <section
          aria-labelledby="sim-historial"
          className="bg-card rounded-xl border border-border p-4"
        >
          <h2
            id="sim-historial"
            className="font-bold font-['Lexend'] text-foreground mb-3"
          >
            Tus simulacros anteriores
          </h2>
          <ul className="divide-y divide-border">
            {recent.map(r => (
              <li key={r.id} className="py-2 flex items-center gap-3 text-sm">
                <span className="text-muted-foreground w-28 shrink-0">
                  {new Date(r.finishedAt).toLocaleDateString("es-CO", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <span className="flex-1 text-foreground">
                  {r.format === "corto" ? "Corto" : "Completo"}
                </span>
                <span className="font-semibold text-foreground">
                  {r.global != null ? `${r.global}/500` : `${r.percent}%`}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------- Exam */

function Exam({
  attempt,
  setAttempt,
}: {
  attempt: SimulacroAttempt;
  setAttempt: (a: SimulacroAttempt) => void;
}) {
  const [now, setNow] = useState(() => Date.now());
  const [confirming, setConfirming] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const session = attempt.sessions[attempt.current];
  const ids = session.questionIds;
  const qid = ids[attempt.index];
  const question = questionOf(qid);
  const left = remainingMs(attempt, now);
  const answeredCount = ids.filter(
    id => attempt.answers[id] !== undefined
  ).length;
  const markedCount = ids.filter(id => attempt.marked.includes(id)).length;
  const isMarked = attempt.marked.includes(qid);

  // Reloj: el tiempo se calcula con la hora real, así que no se detiene aunque la pestaña esté en segundo plano.
  useEffect(() => {
    const tick = () => {
      const t = Date.now();
      setNow(t);
      const expired = expireIfNeeded(attempt, t);
      if (expired !== attempt) {
        toast.info(`Se acabó el tiempo de la sesión ${attempt.current + 1}.`);
        setAttempt(expired);
      }
    };
    const timer = window.setInterval(tick, 1000);
    document.addEventListener("visibilitychange", tick);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [attempt, setAttempt]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [attempt.index]);

  const select = (optionId: string) =>
    setAttempt(answerQuestion(attempt, qid, optionId, Date.now()));
  const move = (i: number) => setAttempt(goTo(attempt, i));
  const finish = () => {
    setConfirming(false);
    setAttempt(finishSession(attempt, Date.now()));
    window.scrollTo({ top: 0 });
  };

  const lowTime = left <= 5 * 60_000;
  const total = attempt.sessions.length;

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="sticky top-16 lg:top-0 z-20 -mx-4 px-4 py-2 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold font-['Lexend'] text-foreground truncate">
              {FORMAT_LABEL[attempt.format]}
              {total > 1 && ` · Sesión ${attempt.current + 1} de ${total}`}
            </h1>
            <p className="text-xs text-muted-foreground">
              Pregunta {attempt.index + 1} de {ids.length} · {answeredCount}{" "}
              respondidas
              {markedCount > 0 && ` · ${markedCount} marcadas`}
            </p>
          </div>
          <div
            role="timer"
            aria-label={`Tiempo restante de la sesión: ${formatClock(left)}`}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-sm font-bold ${
              lowTime ? "bg-red-100 text-red-800" : "bg-muted text-foreground"
            }`}
          >
            <Clock className="w-4 h-4" aria-hidden="true" />
            {formatClock(left)}
          </div>
        </div>
        <div
          className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden"
          aria-hidden="true"
        >
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${(answeredCount / ids.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="score-badge bg-primary/10 text-primary border border-primary/20 text-xs">
          {AREA_INFO[question.area].icon} {AREA_INFO[question.area].label}
        </span>
        <button
          type="button"
          onClick={() => setShowGrid(v => !v)}
          aria-expanded={showGrid}
          aria-controls="sim-navegador"
          className="text-xs font-semibold text-primary underline underline-offset-2"
        >
          {showGrid ? "Ocultar preguntas" : "Ver todas las preguntas"}
        </button>
      </div>

      {showGrid && (
        <nav
          id="sim-navegador"
          aria-label="Preguntas de la sesión"
          className="bg-card rounded-xl border border-border p-3"
        >
          <ul className="grid grid-cols-8 sm:grid-cols-10 gap-1.5">
            {ids.map((id, i) => {
              const answered = attempt.answers[id] !== undefined;
              const marked = attempt.marked.includes(id);
              const current = i === attempt.index;
              const label = `Pregunta ${i + 1}${answered ? ", respondida" : ", sin responder"}${marked ? ", marcada para revisar" : ""}`;
              return (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => move(i)}
                    aria-label={label}
                    aria-current={current ? "step" : undefined}
                    className={`relative w-full aspect-square rounded-md text-xs font-semibold border ${
                      answered
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-foreground border-border"
                    } ${current ? "ring-2 ring-offset-1 ring-[#4ade80]" : ""}`}
                  >
                    {i + 1}
                    {marked && (
                      <span
                        className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-yellow-400 border border-white"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="text-[11px] text-muted-foreground mt-2">
            Azul: respondida · Blanco: sin responder · Punto amarillo: marcada
            para revisar
          </p>
        </nav>
      )}

      <QuestionView
        key={qid}
        question={question}
        selected={attempt.answers[qid] ?? null}
        answered={false}
        onSelect={select}
      />

      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => move(attempt.index - 1)}
          disabled={attempt.index === 0}
          className="flex items-center justify-center gap-1 py-3 rounded-xl border border-border font-semibold text-sm disabled:opacity-40"
        >
          <ChevronLeft className="w-4 h-4" aria-hidden="true" /> Anterior
        </button>
        <button
          type="button"
          onClick={() => setAttempt(toggleMark(attempt, qid))}
          aria-pressed={isMarked}
          className={`flex items-center justify-center gap-1 py-3 rounded-xl border font-semibold text-sm ${
            isMarked
              ? "bg-yellow-50 border-yellow-400 text-yellow-900"
              : "border-border"
          }`}
        >
          <Flag className="w-4 h-4" aria-hidden="true" />{" "}
          {isMarked ? "Marcada" : "Marcar para revisar"}
        </button>
        {attempt.index < ids.length - 1 ? (
          <button
            type="button"
            onClick={() => move(attempt.index + 1)}
            className="flex items-center justify-center gap-1 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm"
          >
            Siguiente <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="flex items-center justify-center gap-1 py-3 rounded-xl bg-[#1e3a5f] text-white font-semibold text-sm"
          >
            Terminar sesión
          </button>
        )}
      </div>

      {attempt.index < ids.length - 1 && (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="w-full text-sm font-semibold text-muted-foreground underline underline-offset-2 py-2"
        >
          Terminar sesión {total > 1 ? attempt.current + 1 : ""} ahora
        </button>
      )}

      <p className="text-xs text-muted-foreground text-center">
        El reloj sigue corriendo aunque salgas de esta página.
      </p>

      {confirming && (
        <ConfirmFinish
          unanswered={ids.length - answeredCount}
          marked={markedCount}
          last={attempt.current === total - 1}
          onCancel={() => setConfirming(false)}
          onConfirm={finish}
        />
      )}
    </div>
  );
}

function ConfirmFinish({
  unanswered,
  marked,
  last,
  onCancel,
  onConfirm,
}: {
  unanswered: number;
  marked: number;
  last: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onCancel]);
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="sim-confirm-title"
        className="bg-card rounded-2xl border border-border p-5 w-full max-w-md space-y-3"
      >
        <h2
          id="sim-confirm-title"
          className="font-bold font-['Lexend'] text-foreground text-lg"
        >
          ¿Terminar la sesión?
        </h2>
        <ul className="text-sm text-foreground space-y-1">
          <li>
            Sin responder: <strong>{unanswered}</strong>
          </li>
          <li>
            Marcadas para revisar: <strong>{marked}</strong>
          </li>
        </ul>
        <p className="text-sm text-muted-foreground">
          {last
            ? "Después verás tus resultados."
            : "Después tendrás un receso y no podrás volver a esta sesión."}
          {unanswered > 0 &&
            " Recuerda que una pregunta en blanco cuenta como incorrecta."}
        </p>
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-border font-semibold text-sm"
            autoFocus
          >
            Seguir respondiendo
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm"
          >
            Sí, terminar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ Break */

function Break({
  attempt,
  onContinue,
}: {
  attempt: SimulacroAttempt;
  onContinue: () => void;
}) {
  const done = attempt.sessions[attempt.current];
  const next = attempt.sessions[attempt.current + 1];
  const answered = done.questionIds.filter(
    id => attempt.answers[id] !== undefined
  ).length;
  const nextAreas = Array.from(
    new Set(next.questionIds.map(id => questionOf(id).area))
  );
  return (
    <div className="max-w-xl mx-auto space-y-5 text-center py-6">
      <Coffee className="w-12 h-12 text-primary mx-auto" aria-hidden="true" />
      <h1 className="text-2xl font-bold font-['Lexend'] text-foreground">
        Receso: terminaste la sesión {attempt.current + 1}
      </h1>
      <p className="text-muted-foreground">
        Respondiste {answered} de {done.questionIds.length} preguntas. Los
        resultados se muestran al final del simulacro.
      </p>
      <div className="bg-card rounded-xl border border-border p-4 text-left">
        <h2 className="font-bold font-['Lexend'] text-foreground">
          Sesión {attempt.current + 2}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {next.questionIds.length} preguntas · {formatMinutes(next.minutes)} ·{" "}
          {nextAreas.map(a => AREA_INFO[a].label).join(", ")}
        </p>
        <p className="text-sm text-foreground mt-2">
          Toma agua, estira las piernas y empieza cuando estés listo. El reloj
          arranca al pulsar el botón.
        </p>
      </div>
      <button
        type="button"
        onClick={onContinue}
        className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold font-['Lexend'] hover:bg-primary/90 transition-colors"
      >
        Empezar sesión {attempt.current + 2}
      </button>
    </div>
  );
}

/* ---------------------------------------------------------------- Results */

type ReviewFilter = "todas" | "incorrectas" | "sin-responder" | "marcadas";

function Results({
  attempt,
  onNew,
}: {
  attempt: SimulacroAttempt;
  onNew: () => void;
}) {
  const result: SimulacroResult = useMemo(
    () => scoreAttempt(attempt, getQuestion),
    [attempt]
  );
  const [filter, setFilter] = useState<ReviewFilter>("todas");
  const all = useMemo(
    () =>
      attempt.sessions.flatMap((s, si) =>
        s.questionIds.map(id => ({ id, session: si }))
      ),
    [attempt]
  );
  const statusOf = useCallback(
    (id: string) =>
      attempt.answers[id] === undefined
        ? "blank"
        : attempt.answers[id] === questionOf(id).answer
          ? "ok"
          : "wrong",
    [attempt]
  );
  const filtered = all.filter(({ id }) =>
    filter === "todas"
      ? true
      : filter === "incorrectas"
        ? statusOf(id) === "wrong"
        : filter === "sin-responder"
          ? statusOf(id) === "blank"
          : attempt.marked.includes(id)
  );
  const counts: Record<ReviewFilter, number> = {
    todas: all.length,
    incorrectas: all.filter(x => statusOf(x.id) === "wrong").length,
    "sin-responder": all.filter(x => statusOf(x.id) === "blank").length,
    marcadas: all.filter(x => attempt.marked.includes(x.id)).length,
  };
  const g = result.global;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-3xl mx-auto space-y-6"
    >
      <div className="text-center pt-4">
        <p className="text-sm font-semibold text-muted-foreground">
          {FORMAT_LABEL[attempt.format]}
        </p>
        <h1 className="text-2xl font-bold font-['Lexend'] text-foreground">
          Resultados del simulacro
        </h1>
      </div>

      <section
        aria-labelledby="sim-global"
        className="bg-gradient-to-br from-[#1e3a5f] to-[#0f2040] rounded-2xl p-6 text-white text-center"
      >
        <h2 id="sim-global" className="text-sm font-semibold text-white/80">
          Puntaje global estimado
        </h2>
        <p className="text-5xl font-bold font-['Lexend'] mt-1">
          {g != null ? g : "—"}
          <span className="text-xl text-white/70"> / 500</span>
        </p>
        <p className="text-sm text-white/80 mt-2">
          {result.correct} de {result.total} correctas ({result.percent}%) ·{" "}
          {result.total - result.answered} sin responder
        </p>
        <p className="text-xs text-white/60 mt-3 max-w-md mx-auto">
          Estimado con la ponderación oficial: Matemáticas, Lectura Crítica,
          Sociales y Ciudadanas y Ciencias Naturales valen 3 cada una e Inglés
          vale 1; la suma se divide entre 13 y se multiplica por 5. No es el
          puntaje oficial del ICFES.
        </p>
      </section>

      <section
        aria-labelledby="sim-areas"
        className="bg-card rounded-xl border border-border p-4"
      >
        <h2
          id="sim-areas"
          className="font-bold font-['Lexend'] text-foreground mb-3 flex items-center gap-2"
        >
          <BarChart3 className="w-5 h-5 text-primary" aria-hidden="true" />{" "}
          Puntaje por prueba (0 a 100, estimado)
        </h2>
        <ul className="space-y-3">
          {AREA_IDS.filter(a => result.perArea[a]).map(a => {
            const r = result.perArea[a]!;
            return (
              <li key={a}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-foreground font-medium">
                    {AREA_INFO[a].icon} {AREA_INFO[a].label}
                  </span>
                  <span className="text-foreground">
                    <strong>{r.score}</strong>
                    <span className="text-muted-foreground">
                      {" "}
                      · {r.correct} de {r.total}
                    </span>
                  </span>
                </div>
                <div
                  className="h-2.5 bg-muted rounded-full overflow-hidden"
                  role="meter"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={r.score}
                  aria-label={`${AREA_INFO[a].label}: ${r.score} de 100`}
                >
                  <div
                    className={`h-full rounded-full ${r.score >= 70 ? "bg-green-500" : r.score >= 50 ? "bg-yellow-500" : "bg-red-500"}`}
                    style={{ width: `${r.score}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
        {attempt.sessions.length > 1 && (
          <p className="text-xs text-muted-foreground mt-3">
            Tiempo usado:{" "}
            {attempt.sessions
              .map(
                (s, i) =>
                  `sesión ${i + 1}, ${formatMinutes(Math.max(1, Math.round(((s.finishedAt ?? 0) - (s.startedAt ?? 0)) / 60_000)))}`
              )
              .join(" · ")}
          </p>
        )}
      </section>

      <section aria-labelledby="sim-revision">
        <h2
          id="sim-revision"
          className="font-bold font-['Lexend'] text-foreground mb-3"
        >
          Revisa tus respuestas
        </h2>
        <div
          className="flex flex-wrap gap-2 mb-3"
          role="group"
          aria-label="Filtrar preguntas"
        >
          {(
            [
              ["todas", "Todas"],
              ["incorrectas", "Incorrectas"],
              ["sin-responder", "Sin responder"],
              ["marcadas", "Marcadas"],
            ] as [ReviewFilter, string][]
          ).map(([f, label]) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
              className={`px-3 py-1.5 rounded-full text-sm font-semibold border ${
                filter === f
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-foreground"
              }`}
            >
              {label} ({counts[f]})
            </button>
          ))}
        </div>
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No hay preguntas en este filtro.
          </p>
        ) : (
          <ul className="space-y-2">
            {filtered.map(({ id, session }) => (
              <ReviewItem
                key={id}
                number={all.findIndex(x => x.id === id) + 1}
                session={attempt.sessions.length > 1 ? session + 1 : null}
                question={questionOf(id)}
                selected={attempt.answers[id] ?? null}
                status={statusOf(id)}
                marked={attempt.marked.includes(id)}
              />
            ))}
          </ul>
        )}
      </section>

      <div className="grid sm:grid-cols-2 gap-3">
        <Link
          href="/practica?repaso=1"
          className="flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-xl font-bold font-['Lexend'] hover:bg-primary/90 transition-colors"
        >
          Repasar mis errores
        </Link>
        <button
          type="button"
          onClick={() => {
            onNew();
            window.scrollTo({ top: 0 });
          }}
          className="flex items-center justify-center gap-2 border-2 border-primary text-primary py-3 rounded-xl font-bold font-['Lexend'] hover:bg-primary/5 transition-colors"
        >
          <RotateCcw className="w-5 h-5" aria-hidden="true" /> Hacer otro
          simulacro
        </button>
      </div>
    </motion.div>
  );
}

function ReviewItem({
  number,
  session,
  question,
  selected,
  status,
  marked,
}: {
  number: number;
  session: number | null;
  question: Question;
  selected: string | null;
  status: "ok" | "wrong" | "blank";
  marked: boolean;
}) {
  const [open, setOpen] = useState(false);
  const Icon =
    status === "ok" ? CheckCircle2 : status === "wrong" ? XCircle : MinusCircle;
  const color =
    status === "ok"
      ? "text-green-600"
      : status === "wrong"
        ? "text-red-600"
        : "text-muted-foreground";
  const statusLabel =
    status === "ok"
      ? "Correcta"
      : status === "wrong"
        ? "Incorrecta"
        : "Sin responder";
  const panelId = `rev-${question.id}`;
  return (
    <li className="bg-card rounded-xl border border-border">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-controls={panelId}
        className="w-full flex items-start gap-3 p-3 text-left"
      >
        <Icon
          className={`w-5 h-5 mt-0.5 shrink-0 ${color}`}
          aria-hidden="true"
        />
        <span className="flex-1 min-w-0">
          <span className="block text-sm font-semibold text-foreground">
            Pregunta {number} · {AREA_INFO[question.area].label}
            {session != null && (
              <span className="text-muted-foreground font-normal">
                {" "}
                · sesión {session}
              </span>
            )}
          </span>
          <span className="block text-xs text-muted-foreground line-clamp-2">
            {question.enunciado}
          </span>
        </span>
        <span className="shrink-0 flex items-center gap-1 text-xs">
          {marked && (
            <Flag
              className="w-3.5 h-3.5 text-yellow-600"
              aria-label="Marcada para revisar"
            />
          )}
          <span className={`font-semibold ${color}`}>{statusLabel}</span>
        </span>
      </button>
      {open && (
        <div id={panelId} className="px-3 pb-4">
          <QuestionView
            question={question}
            selected={selected}
            answered
            onSelect={() => {}}
            showMeta
          />
        </div>
      )}
    </li>
  );
}
