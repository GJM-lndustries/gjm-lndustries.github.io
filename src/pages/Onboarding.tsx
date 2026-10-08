import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Target } from "lucide-react";
import { useProgress } from "@/contexts/ProgressContext";
import BrandMark from "@/components/BrandMark";
import { withMotion } from '@/components/withMotion';

const CAREERS = [
  "Medicina",
  "Ingeniería",
  "Derecho",
  "Psicología",
  "Administración",
  "Licenciatura / Educación",
  "Arquitectura",
  "Comunicación",
  "Otra / aún no sé",
];

type Step = "score" | "career";

function Onboarding() {
  const { completeOnboarding, progress } = useProgress();
  const editing = progress.hasCompletedOnboarding;
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<Step>("score");
  const [presented, setPresented] = useState(progress.presentedExam);
  const [score, setScore] = useState(progress.currentScore || 280);
  const [career, setCareer] = useState(progress.career || "");
  const [customCareer, setCustomCareer] = useState("");
  const [target, setTarget] = useState(progress.targetScore || 300);

  const careerValue = useMemo(() => {
    if (career === "Otra / aún no sé" || career === "Otra") return customCareer.trim() || "Por definir";
    return career.trim();
  }, [career, customCareer]);

  const finish = (skip = false) => {
    if (!skip) {
      completeOnboarding(
        presented ? score : 0,
        300,
        Math.min(500, Math.max(0, target)),
        careerValue || progress.career || "",
        presented
      );
    }
    setLocation("/inicio");
  };

  return (
    <div className="min-h-screen bg-canvas">
      <div className="mx-auto flex max-w-lg flex-col px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <BrandMark compact />
          <button type="button" onClick={() => finish(true)} className="text-sm font-semibold text-muted-foreground underline-offset-2 hover:underline">
            {editing ? "Cancelar" : "Omitir"}
          </button>
        </div>

        <div className="mb-6 flex gap-2" aria-hidden="true">
          {(["score", "career"] as Step[]).map((s, i) => (
            <div key={s} className={`h-1.5 flex-1 rounded-full ${step === s || (step === "career" && i === 0) ? "bg-brand" : "bg-navy/15"}`} />
          ))}
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {step === "score" && (
            <motion.section
              key="score"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="space-y-6"
            >
              <div>
                <p className="eyebrow">Paso 1 de 2</p>
                <h1 className="page-title mt-1">
                  ¿Qué puntaje crees que sacarías en el ICFES?
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Si ya lo presentaste, marca la casilla e indica cuánto sacaste. La escala oficial va de 0 a 500.
                </p>
              </div>

              <label className="flex min-h-12 cursor-pointer items-center gap-3 card px-4 py-3">
                <input
                  type="checkbox"
                  className="h-5 w-5 accent-navy"
                  checked={presented}
                  onChange={e => setPresented(e.target.checked)}
                />
                <span className="text-sm font-medium">Ya lo presenté</span>
              </label>

              <div className="card p-5">
                <div className="flex items-end justify-between gap-3">
                  <label htmlFor="score-range" className="text-sm font-medium text-muted-foreground">
                    {presented ? "Tu puntaje global" : "Tu estimación"}
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={500}
                    value={score}
                    onChange={e => setScore(Math.min(500, Math.max(0, Number(e.target.value) || 0)))}
                    className="w-24 rounded-xl border border-border px-3 py-2 text-center font-['Lexend'] text-2xl font-bold text-navy"
                    aria-label="Puntaje"
                  />
                </div>
                <input
                  id="score-range"
                  type="range"
                  min={0}
                  max={500}
                  step={5}
                  value={score}
                  onChange={e => setScore(Number(e.target.value))}
                  className="mt-4 w-full accent-green-600"
                />
                <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                  <span>0</span>
                  <span>500</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep("career")}
                className="btn-primary w-full"
              >
                Continuar <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </motion.section>
          )}

          {step === "career" && (
            <motion.section
              key="career"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="space-y-6"
            >
              <div>
                <p className="eyebrow">Paso 2 de 2</p>
                <h1 className="page-title mt-1">
                  ¿Qué carrera quieres estudiar?
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Elige un área de interés y tu meta de puntaje. Cada universidad publica sus propios puntajes de corte.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {CAREERS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCareer(c)}
                    aria-pressed={career === c}
                    className={`min-h-12 rounded-xl border px-3 py-2 text-left text-sm font-semibold transition-colors ${
                      career === c ? "border-navy bg-navy/5 text-navy ring-1 ring-navy" : "border-border bg-white hover:border-navy/30"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
              {(career === "Otra / aún no sé" || career.startsWith("Otra")) && (
                <input
                  className="w-full min-h-11 rounded-xl border border-border bg-white px-3 py-2 text-[15px]"
                  placeholder="Escribe tu carrera (opcional)"
                  value={customCareer}
                  onChange={e => setCustomCareer(e.target.value)}
                  maxLength={80}
                />
              )}

              <div className="card p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-navy">
                  <Target className="h-4 w-4" aria-hidden="true" /> Meta sugerida
                </div>
                <div className="mt-3 flex items-end justify-between gap-3">
                  <p className="text-sm text-muted-foreground">Puntaje global que quieres alcanzar</p>
                  <input
                    type="number"
                    min={0}
                    max={500}
                    value={target}
                    onChange={e => setTarget(Math.min(500, Math.max(0, Number(e.target.value) || 0)))}
                    className="w-24 rounded-xl border border-border px-3 py-2 text-center font-['Lexend'] text-2xl font-bold"
                    aria-label="Meta de puntaje"
                  />
                </div>
                <input
                  type="range"
                  min={0}
                  max={500}
                  step={5}
                  value={target}
                  onChange={e => setTarget(Number(e.target.value))}
                  className="mt-4 w-full accent-green-600"
                />
                <p className="mt-3 text-xs text-muted-foreground">
                  300 es una meta general de partida. Consulta el puntaje de corte de tu universidad; no hay un mínimo único para todo el país.
                </p>
              </div>

              <div className="flex gap-2">
                <button type="button" onClick={() => setStep("score")} className="btn-secondary flex-1">
                  Atrás
                </button>
                <button
                  type="button"
                  onClick={() => finish(false)}
                  className="btn-primary flex-[2]"
                >
                  Guardar y entrar
                </button>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default withMotion(Onboarding);
