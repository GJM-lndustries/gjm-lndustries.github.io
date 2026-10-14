import { useMemo, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Clock3, ExternalLink, Sparkles, Target } from "lucide-react";
import { useProgress } from "@/contexts/ProgressContext";
import BrandMark from "@/components/BrandMark";
import QuestionView from "@/components/QuestionView";
import AreaIcon from "@/components/AreaIcon";
import GoalBar from "@/components/GoalBar";
import { withMotion } from "@/components/withMotion";
import { AREA_INFO, getStimulus, questionsByArea, type Question } from "@/data/questions";
import {
  DAILY_MINUTES, GOAL_OPTIONS, NATIONAL_AVERAGE, REFERENCE_GOAL, SCORE_RANGES, STUDY_MOMENTS,
  diagnosticEstimate, examWindows, intentionSentence, pickDiagnostic, suggestedGoal, weeksUntil,
} from "@/lib/plan";
import { DEFAULT_WEEKLY_GOAL, WEEKLY_GOAL_OPTIONS } from "@/lib/streaks";

const CAREERS = [
  "Medicina", "Ingeniería", "Derecho", "Psicología", "Administración",
  "Licenciatura / Educación", "Arquitectura", "Comunicación", "Otra / aún no sé",
];

const STEPS = ["puntaje", "carrera", "fecha", "tiempo", "momento", "diagnostico"] as const;
type Step = (typeof STEPS)[number];

/** Botón de opción (radio visual) usado en todos los pasos. */
function Choice({ active, onClick, children, sub }: { active: boolean; onClick: () => void; children: React.ReactNode; sub?: string }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className={`flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
        active ? "border-navy bg-navy/5 ring-1 ring-navy" : "border-border bg-white hover:border-navy/30"
      }`}
    >
      <span>
        <span className="block text-[15px] font-semibold text-foreground">{children}</span>
        {sub && <span className="block text-xs text-muted-foreground">{sub}</span>}
      </span>
      <span className={`h-5 w-5 flex-shrink-0 rounded-full border-2 ${active ? "border-navy bg-navy shadow-[inset_0_0_0_3px_white]" : "border-border"}`} aria-hidden="true" />
    </button>
  );
}

function Onboarding() {
  const { completeOnboarding, savePlan, setWeeklyGoal, saveDiagnostic, recordAnswer, progress } = useProgress();
  const editing = progress.hasCompletedOnboarding;
  const [, setLocation] = useLocation();
  const params = new URLSearchParams(useSearch());
  const [step, setStep] = useState<Step>(params.get("paso") === "diagnostico" ? "diagnostico" : "puntaje");
  const plan = progress.plan;

  const [presented, setPresented] = useState(progress.presentedExam);
  const [range, setRange] = useState<string>(plan?.scoreRange ?? "");
  const [exact, setExact] = useState<string>(progress.presentedExam && progress.currentScore ? String(progress.currentScore) : "");
  const [career, setCareer] = useState(progress.career && CAREERS.includes(progress.career) ? progress.career : progress.career ? "Otra / aún no sé" : "");
  const [customCareer, setCustomCareer] = useState(progress.career && !CAREERS.includes(progress.career) && progress.career !== "Por definir" ? progress.career : "");
  const [target, setTarget] = useState<number | null>(editing ? progress.targetScore : null);
  const [exam, setExam] = useState<string>(plan?.examWindow ?? "");
  const [minutes, setMinutes] = useState<number>(plan?.dailyMinutes ?? 5);
  const [weekly, setWeekly] = useState<number>(progress.streakState.weeklyGoal ?? DEFAULT_WEEKLY_GOAL);
  const [moment, setMoment] = useState<string>(plan?.studyMoment ?? "");
  const [customMoment, setCustomMoment] = useState("");

  const windows = useMemo(() => examWindows(), []);
  const goal = target ?? suggestedGoal(range);
  const careerValue = career === "Otra / aún no sé" ? customCareer.trim() || "Por definir" : career;
  const momentValue = moment === "otro" ? customMoment.trim() : moment;
  const idx = STEPS.indexOf(step);
  const go = (s: Step) => { setStep(s); window.scrollTo({ top: 0 }); };

  const savePlanAndContinue = () => {
    const exactNum = Number(exact);
    completeOnboarding(
      presented && exactNum > 0 ? Math.min(500, exactNum) : 0,
      REFERENCE_GOAL,
      Math.min(500, Math.max(100, goal)),
      careerValue || progress.career || "",
      presented
    );
    savePlan({ scoreRange: range || "nose", examWindow: exam || "nose", dailyMinutes: minutes, studyMoment: momentValue });
    setWeeklyGoal(weekly);
    if (editing && progress.diagnostic) setLocation("/inicio");
    else go("diagnostico");
  };

  const skip = () => {
    if (!editing && !progress.hasCompletedOnboarding) {
      // Omitir también guarda lo que haya elegido; nada es obligatorio.
      completeOnboarding(0, REFERENCE_GOAL, goal, careerValue || "", presented);
    }
    setLocation("/inicio");
  };

  const title = "mt-1 font-['Lexend'] text-[26px] font-bold leading-tight tracking-tight text-foreground";
  const section = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -12 }, className: "space-y-5" };

  return (
    <div className="min-h-screen bg-canvas">
      <div className="mx-auto flex max-w-lg flex-col px-4 py-6">
        <div className="mb-5 flex items-center justify-between">
          <BrandMark compact />
          {step !== "diagnostico" && (
            <button type="button" onClick={skip} className="min-h-11 px-1 text-sm font-semibold text-muted-foreground underline-offset-2 hover:underline">
              {editing ? "Cancelar" : "Omitir"}
            </button>
          )}
        </div>

        <div className="mb-6 flex gap-1.5" aria-hidden="true">
          {STEPS.map((s, i) => (
            <div key={s} className={`h-1.5 flex-1 rounded-full ${i <= idx ? "bg-brand" : "bg-navy/15"}`} />
          ))}
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {step === "puntaje" && (
            <motion.section key="puntaje" {...section}>
              <div>
                <p className="eyebrow">Paso 1 de 6</p>
                <h1 className={title}>{presented ? "¿Cuánto sacaste en el ICFES?" : "¿Cuánto crees que sacarías en el ICFES?"}</h1>
                <p className="mt-2 text-sm text-muted-foreground">El puntaje global va de 0 a 500. No hay respuesta mala: es para saber de dónde partes.</p>
              </div>
              <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-border bg-white px-4 py-3">
                <input type="checkbox" className="h-5 w-5 accent-navy" checked={presented} onChange={e => setPresented(e.target.checked)} />
                <span className="text-sm font-medium">Ya lo presenté</span>
              </label>
              <div role="radiogroup" aria-label="Rango de puntaje" className="grid gap-2">
                {SCORE_RANGES.map(r => (
                  <Choice key={r.id} active={range === r.id} onClick={() => setRange(r.id)}>{r.label}</Choice>
                ))}
              </div>
              {presented && (
                <label className="block rounded-xl border border-border bg-white px-4 py-3">
                  <span className="block text-sm font-medium text-foreground">Puntaje exacto <span className="font-normal text-muted-foreground">(opcional)</span></span>
                  <input
                    type="number" inputMode="numeric" min={0} max={500} value={exact}
                    onChange={e => setExact(e.target.value.replace(/\D/g, "").slice(0, 3))}
                    className="mt-2 w-32 rounded-lg border border-border px-3 py-2 font-['Lexend'] text-xl font-semibold"
                    placeholder="Ej. 287" aria-label="Puntaje exacto"
                  />
                </label>
              )}
              <button type="button" disabled={!range} onClick={() => go("carrera")} className="btn-primary w-full disabled:opacity-50">
                Continuar <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </motion.section>
          )}

          {step === "carrera" && (
            <motion.section key="carrera" {...section}>
              <div>
                <p className="eyebrow">Paso 2 de 6</p>
                <h1 className={title}>¿Qué te gustaría estudiar?</h1>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {CAREERS.map(c => (
                  <button key={c} type="button" onClick={() => setCareer(c)} aria-pressed={career === c}
                    className={`min-h-12 rounded-xl border px-3 py-2 text-left text-sm font-semibold transition-colors ${career === c ? "border-navy bg-navy/5 text-navy ring-1 ring-navy" : "border-border bg-white hover:border-navy/30"}`}>
                    {c}
                  </button>
                ))}
              </div>
              {career === "Otra / aún no sé" && (
                <input className="min-h-11 w-full rounded-xl border border-border bg-white px-3 py-2 text-[15px]" placeholder="Escribe tu carrera (opcional)"
                  value={customCareer} onChange={e => setCustomCareer(e.target.value)} maxLength={80} aria-label="Tu carrera" />
              )}

              <div className="card p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-navy">
                  <Target className="h-4 w-4" aria-hidden="true" /> Tu meta de puntaje global
                </div>
                <div role="radiogroup" aria-label="Meta de puntaje" className="mt-3 flex flex-wrap gap-2">
                  {[...new Set([...GOAL_OPTIONS, suggestedGoal(range)])].sort((a, b) => a - b).map(g => (
                    <button key={g} type="button" role="radio" aria-checked={goal === g} onClick={() => setTarget(g)}
                      className={`min-h-11 rounded-xl border px-4 font-['Lexend'] text-[15px] font-semibold tabular-nums ${goal === g ? "border-navy bg-navy text-white" : "border-border bg-white text-foreground hover:border-navy/30"}`}>
                      {g}
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                  {target == null && <><strong className="font-semibold text-foreground">Te sugerimos {suggestedGoal(range)}</strong> como punto de referencia, no como requisito. </>}
                  No hay un puntaje único por carrera: cada universidad publica el puntaje de corte de cada programa y cambia cada semestre. Búscalo en la página de admisiones de la universidad que te interesa.
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {NATIONAL_AVERAGE.label}: <strong className="text-foreground">{NATIONAL_AVERAGE.value}</strong> de 500.{" "}
                  <a href={NATIONAL_AVERAGE.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 underline underline-offset-2">
                    Fuente: ICFES <ExternalLink className="h-3 w-3" aria-hidden="true" />
                  </a>
                </p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => go("puntaje")} className="btn-secondary flex-1">Atrás</button>
                <button type="button" onClick={() => go("fecha")} className="btn-primary flex-[2]">Continuar <ChevronRight className="h-5 w-5" aria-hidden="true" /></button>
              </div>
            </motion.section>
          )}

          {step === "fecha" && (
            <motion.section key="fecha" {...section}>
              <div>
                <p className="eyebrow">Paso 3 de 6</p>
                <h1 className={title}>¿Cuándo presentas el ICFES?</h1>
                <p className="mt-2 text-sm text-muted-foreground">Las fechas exactas las publica el ICFES en icfes.gov.co.</p>
              </div>
              <div role="radiogroup" aria-label="Fecha del examen" className="grid gap-2">
                {windows.map(w => (
                  <Choice key={w.id} active={exam === w.id} onClick={() => setExam(w.id)} sub={w.id === "nose" ? w.note : `${w.note} · faltan unas ${weeksUntil(w.id)} semanas`}>{w.label}</Choice>
                ))}
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => go("carrera")} className="btn-secondary flex-1">Atrás</button>
                <button type="button" disabled={!exam} onClick={() => go("tiempo")} className="btn-primary flex-[2] disabled:opacity-50">Continuar <ChevronRight className="h-5 w-5" aria-hidden="true" /></button>
              </div>
            </motion.section>
          )}

          {step === "tiempo" && (
            <motion.section key="tiempo" {...section}>
              <div>
                <p className="eyebrow">Paso 4 de 6</p>
                <h1 className={title}>¿Cuánto tiempo al día?</h1>
                <p className="mt-2 text-sm text-muted-foreground">Mejor poco y seguido que mucho de vez en cuando. Con 5 minutos ya cuenta para tu racha.</p>
              </div>
              <div role="radiogroup" aria-label="Minutos al día" className="grid grid-cols-3 gap-2">
                {DAILY_MINUTES.map(m => (
                  <button key={m} type="button" role="radio" aria-checked={minutes === m} onClick={() => setMinutes(m)}
                    className={`flex min-h-20 flex-col items-center justify-center rounded-xl border ${minutes === m ? "border-navy bg-navy/5 ring-1 ring-navy" : "border-border bg-white hover:border-navy/30"}`}>
                    <span className="font-['Lexend'] text-2xl font-bold tabular-nums text-foreground">{m}</span>
                    <span className="text-xs text-muted-foreground">minutos</span>
                  </button>
                ))}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">¿Cuántos días por semana?</p>
                <p className="text-xs text-muted-foreground">Tu meta es semanal: si un día no puedes, no pasa nada.</p>
                <div role="radiogroup" aria-label="Días por semana" className="mt-2 grid grid-cols-4 gap-2">
                  {WEEKLY_GOAL_OPTIONS.map(d => (
                    <button key={d} type="button" role="radio" aria-checked={weekly === d} onClick={() => setWeekly(d)}
                      className={`min-h-12 rounded-xl border text-sm font-semibold ${weekly === d ? "border-navy bg-navy text-white" : "border-border bg-white text-foreground hover:border-navy/30"}`}>
                      {d === 7 ? "Todos" : `${d} días`}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => go("fecha")} className="btn-secondary flex-1">Atrás</button>
                <button type="button" onClick={() => go("momento")} className="btn-primary flex-[2]">Continuar <ChevronRight className="h-5 w-5" aria-hidden="true" /></button>
              </div>
            </motion.section>
          )}

          {step === "momento" && (
            <motion.section key="momento" {...section}>
              <div>
                <p className="eyebrow">Paso 5 de 6</p>
                <h1 className={title}>¿En qué momento del día vas a estudiar?</h1>
                <p className="mt-2 text-sm text-muted-foreground">Amarrarlo a algo que ya haces todos los días ayuda a no olvidarlo.</p>
              </div>
              <div role="radiogroup" aria-label="Momento del día" className="grid gap-2">
                {STUDY_MOMENTS.map(m => (
                  <Choice key={m} active={moment === m} onClick={() => setMoment(m)}>{m}</Choice>
                ))}
                <Choice active={moment === "otro"} onClick={() => setMoment("otro")}>Otro momento</Choice>
              </div>
              {moment === "otro" && (
                <input className="min-h-11 w-full rounded-xl border border-border bg-white px-3 py-2 text-[15px]" placeholder="Ej. en el descanso del colegio"
                  value={customMoment} onChange={e => setCustomMoment(e.target.value)} maxLength={60} aria-label="Tu momento para estudiar" />
              )}
              {momentValue && (
                <div className="flex items-start gap-3 rounded-xl bg-brand-soft/70 p-4">
                  <Clock3 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-700" aria-hidden="true" />
                  <p className="text-[15px] font-semibold text-foreground">{intentionSentence(minutes, momentValue)}</p>
                </div>
              )}
              <div className="flex gap-2">
                <button type="button" onClick={() => go("tiempo")} className="btn-secondary flex-1">Atrás</button>
                <button type="button" onClick={savePlanAndContinue} className="btn-primary flex-[2]">
                  {editing && progress.diagnostic ? "Guardar" : "Guardar y seguir"} <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </motion.section>
          )}

          {step === "diagnostico" && (
            <motion.section key="diagnostico" {...section}>
              <Diagnostic
                onDone={(answers, questions) => {
                  for (let i = 0; i < questions.length; i++) recordAnswer(questions[i]!, answers[i]!);
                  const est = diagnosticEstimate(questions.map((q, i) => ({ area: q.area, correct: answers[i]! })));
                  saveDiagnostic({ finishedAt: new Date().toISOString(), answers: questions.map((q, i) => ({ questionId: q.id, area: q.area, correct: answers[i]! })), ...est });
                }}
                onExit={() => setLocation("/inicio")}
              />
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/** Mini prueba: 5 preguntas (una por área) con retroalimentación inmediata y un punto de partida. */
function Diagnostic({ onDone, onExit }: { onDone: (answers: boolean[], qs: Question[]) => void; onExit: () => void }) {
  const { progress } = useProgress();
  const questions = useMemo(() => pickDiagnostic(questionsByArea, id => getStimulus(id)?.text.length ?? 0), []);
  const [started, setStarted] = useState(false);
  const [i, setI] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [done, setDone] = useState(false);
  const q = questions[i]!;

  if (!started) {
    return (
      <>
        <div>
          <p className="eyebrow">Paso 6 de 6</p>
          <h1 className="mt-1 font-['Lexend'] text-[26px] font-bold leading-tight tracking-tight text-foreground">Mini prueba: 5 preguntas</h1>
          <p className="mt-2 text-[15px] text-muted-foreground">Una de cada área del ICFES. Así vemos tu punto de partida real y armamos tu plan. Toma unos 5 minutos.</p>
        </div>
        <ul className="card divide-y divide-border">
          {questions.map(x => (
            <li key={x.id} className="flex items-center gap-3 px-4 py-3">
              <AreaIcon area={x.area} size="sm" />
              <span className="text-sm font-medium text-foreground">{AREA_INFO[x.area].label}</span>
            </li>
          ))}
        </ul>
        <p className="text-xs text-muted-foreground">No cuenta como nota y no se comparte con nadie. Si no sabes una, elige la que te parezca: también sirve.</p>
        <div className="grid gap-2">
          <button type="button" onClick={() => setStarted(true)} className="btn-primary w-full">Empezar la mini prueba <ChevronRight className="h-5 w-5" aria-hidden="true" /></button>
          <button type="button" onClick={onExit} className="btn-secondary w-full">La hago después</button>
        </div>
      </>
    );
  }

  if (done) {
    const d = progress.diagnostic;
    const ok = answers.filter(Boolean).length;
    const gap = d ? progress.targetScore - d.estimate : null;
    return (
      <div data-testid="diagnostico-resultado" className="space-y-5">
        <div className="text-center">
          <span className="icon-tile anim-pop mx-auto h-14 w-14 rounded-2xl bg-brand-soft text-green-700" aria-hidden="true">
            <Sparkles className="h-7 w-7" strokeWidth={1.75} />
          </span>
          <h1 className="mt-4 font-['Lexend'] text-[26px] font-bold leading-tight tracking-tight text-foreground">Tu punto de partida</h1>
          <p className="mt-1 text-sm text-muted-foreground">Respondiste bien {ok} de 5.</p>
        </div>
        {d && (
          <div className="card p-5 text-center">
            <p className="text-sm text-muted-foreground">Puntaje global aproximado</p>
            <p className="mt-1 font-['Lexend'] text-5xl font-bold tabular-nums text-foreground">{d.estimate}</p>
            <p className="mt-1 text-sm text-muted-foreground">entre {d.low} y {d.high} · de 500</p>
            <GoalBar from={d.estimate} target={progress.targetScore} />
            <p className="mt-3 text-sm font-semibold text-foreground">
              {gap != null && gap > 0 ? `Te faltan unos ${gap} puntos para tu meta de ${progress.targetScore}.` : `Ya estás cerca de tu meta de ${progress.targetScore}. A afinar.`}
            </p>
          </div>
        )}
        <ul className="card divide-y divide-border">
          {questions.map((x, k) => (
            <li key={x.id} className="flex items-center gap-3 px-4 py-3">
              <AreaIcon area={x.area} size="sm" />
              <span className="flex-1 text-sm font-medium text-foreground">{AREA_INFO[x.area].label}</span>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${answers[k] ? "bg-brand-soft text-green-800" : "bg-amber-50 text-amber-900"}`}>{answers[k] ? "Bien" : "Para practicar"}</span>
            </li>
          ))}
        </ul>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Con 5 preguntas es solo una primera idea. Se vuelve más preciso con cada práctica. Es un estimado con la ponderación oficial, no un resultado del ICFES.
        </p>
        <button type="button" onClick={onExit} className="btn-primary w-full">Ver mi plan de hoy <ChevronRight className="h-5 w-5" aria-hidden="true" /></button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">Pregunta {i + 1} de 5</span>
        <span>{AREA_INFO[q.area].label}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden="true">
        <div className="progress-fill h-full rounded-full bg-brand" style={{ width: `${(i / 5) * 100}%` }} />
      </div>
      <QuestionView question={q} selected={selected} answered={selected != null} onSelect={id => { if (selected == null) setSelected(id); }} />
      {selected != null && (
        <button
          type="button"
          className="btn-primary w-full"
          onClick={() => {
            const next = [...answers, selected === q.answer];
            setAnswers(next);
            setSelected(null);
            window.scrollTo({ top: 0 });
            if (i < questions.length - 1) setI(i + 1);
            else { onDone(next, questions); setDone(true); }
          }}
        >
          {i < questions.length - 1 ? "Siguiente" : "Ver mi punto de partida"} <ChevronRight className="h-5 w-5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

export default withMotion(Onboarding);
