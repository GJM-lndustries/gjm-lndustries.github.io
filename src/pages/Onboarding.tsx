import { useState } from 'react';
import { useProgress } from '@/contexts/ProgressContext';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Target, Zap, TrendingUp, Sparkles } from 'lucide-react';

type Step = 'welcome' | 'current' | 'minimum' | 'target' | 'career' | 'summary';

export default function Onboarding() {
  const { completeOnboarding, progress } = useProgress();
  const editing = progress.hasCompletedOnboarding;
  const [, setLocation] = useLocation();
  
  const [step, setStep] = useState<Step>('welcome');
  const [currentScore, setCurrentScore] = useState(progress.currentScore || 0);
  const [minimumScore, setMinimumScore] = useState(progress.minimumScore || 310);
  const [targetScore, setTargetScore] = useState(progress.targetScore || 360);
  const [career, setCareer] = useState(progress.career || '');

  const handleNext = () => {
    const steps: Step[] = ['welcome', 'current', 'minimum', 'target', 'career', 'summary'];
    const currentIdx = steps.indexOf(step);
    if (step === 'minimum' && targetScore < minimumScore) setTargetScore(minimumScore);
    if (currentIdx < steps.length - 1) {
      setStep(steps[currentIdx + 1]);
    }
  };

  const handleComplete = () => {
    completeOnboarding(currentScore, minimumScore, targetScore, career.trim());
    setLocation('/');
  };
  const handleSkip = () => setLocation('/');

  const suggestedTarget = Math.min(500, minimumScore + 10);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e3a5f] to-[#0f2040] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Skip */}
        <div className="flex justify-end mb-4">
          <button
            type="button"
            onClick={handleSkip}
            className="text-sm text-white/80 hover:text-white underline underline-offset-4"
          >
            {editing ? 'Cancelar' : 'Omitir por ahora'}
          </button>
        </div>

        {/* Progress bar */}
        <div className="mb-8" aria-hidden="true">
          <div className="flex gap-2">
            {['welcome', 'current', 'minimum', 'target', 'career', 'summary'].map((s, idx) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  ['welcome', 'current', 'minimum', 'target', 'career', 'summary'].indexOf(step) >= idx
                    ? 'bg-[#4ade80]'
                    : 'bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {/* Welcome */}
          {step === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center space-y-4">
                <div className="text-6xl mb-4">🎓</div>
                <h1 className="text-4xl font-bold font-['Lexend'] text-white">Define tu meta</h1>
                <p className="text-xl text-white/80">Es opcional y puedes cambiarla cuando quieras</p>
              </div>

              <div className="bg-white/10 rounded-2xl p-6 space-y-4 backdrop-blur-sm border border-white/20">
                <p className="text-white text-lg leading-relaxed">
                  Responde 4 preguntas rápidas para personalizar tu meta. Todo se guarda solo en este dispositivo.
                </p>
                <div className="space-y-3 text-white/80 text-sm">
                  <div className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-[#4ade80] flex-shrink-0 mt-0.5" />
                    <span>Tu puntaje actual (si ya presentaste el examen)</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Target className="w-5 h-5 text-[#4ade80] flex-shrink-0 mt-0.5" />
                    <span>El puntaje que pide tu carrera y tu objetivo</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <TrendingUp className="w-5 h-5 text-[#4ade80] flex-shrink-0 mt-0.5" />
                    <span>Verás cuánto te falta en tu tablero de progreso</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleNext}
                className="w-full bg-[#4ade80] text-[#0f2040] py-4 rounded-xl font-bold font-['Lexend'] text-lg hover:bg-[#22c55e] transition-colors flex items-center justify-center gap-2"
              >
                Empecemos <ChevronRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {/* Current Score */}
          {step === 'current' && (
            <motion.div
              key="current"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <h2 className="text-3xl font-bold font-['Lexend'] text-white">¿Cuál es tu puntaje actual?</h2>
                <p className="text-white/70">Si ya presentaste el ICFES, ingresa tu puntaje. Si no, déjalo en 0.</p>
                <label htmlFor="puntaje-actual" className="sr-only">Puntaje actual</label>
              </div>

              <div className="bg-white/10 rounded-2xl p-8 backdrop-blur-sm border border-white/20 space-y-6">
                <div className="text-center">
                  <div className="text-6xl font-bold font-['Lexend'] text-[#4ade80] mb-4">{currentScore}</div>
                  <p className="text-white/70">de 500 puntos</p>
                </div>

                <input
                  id="puntaje-actual"
                  type="range"
                  min="0"
                  max="500"
                  value={currentScore}
                  onChange={(e) => setCurrentScore(parseInt(e.target.value))}
                  className="w-full h-3 bg-white/20 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #4ade80 0%, #4ade80 ${(currentScore / 500) * 100}%, rgba(255,255,255,0.2) ${(currentScore / 500) * 100}%, rgba(255,255,255,0.2) 100%)`
                  }}
                />

                <div className="grid grid-cols-4 gap-2 text-xs text-white/60">
                  <button onClick={() => setCurrentScore(100)} className="p-2 bg-white/10 rounded hover:bg-white/20">100</button>
                  <button onClick={() => setCurrentScore(150)} className="p-2 bg-white/10 rounded hover:bg-white/20">150</button>
                  <button onClick={() => setCurrentScore(250)} className="p-2 bg-white/10 rounded hover:bg-white/20">250</button>
                  <button onClick={() => setCurrentScore(350)} className="p-2 bg-white/10 rounded hover:bg-white/20">350</button>
                </div>
              </div>

              <button
                onClick={handleNext}
                className="w-full bg-[#4ade80] text-[#0f2040] py-4 rounded-xl font-bold font-['Lexend'] text-lg hover:bg-[#22c55e] transition-colors flex items-center justify-center gap-2"
              >
                Continuar <ChevronRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {/* Minimum Score */}
          {step === 'minimum' && (
            <motion.div
              key="minimum"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <h2 className="text-3xl font-bold font-['Lexend'] text-white">¿Cuál es el puntaje mínimo de tu carrera?</h2>
                <p className="text-white/70">El puntaje que exige la universidad para tu programa</p>
              </div>

              <div className="bg-white/10 rounded-2xl p-8 backdrop-blur-sm border border-white/20 space-y-6">
                <div className="text-center">
                  <div className="text-6xl font-bold font-['Lexend'] text-[#4ade80] mb-4">{minimumScore}</div>
                  <p className="text-white/70">puntos mínimos</p>
                </div>

                <input
                  aria-label="Puntaje mínimo de la carrera"
                  type="range"
                  min="100"
                  max="500"
                  value={minimumScore}
                  onChange={(e) => setMinimumScore(parseInt(e.target.value))}
                  className="w-full h-3 bg-white/20 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #4ade80 0%, #4ade80 ${((minimumScore - 100) / 400) * 100}%, rgba(255,255,255,0.2) ${((minimumScore - 100) / 400) * 100}%, rgba(255,255,255,0.2) 100%)`
                  }}
                />

                <div className="grid grid-cols-4 gap-2 text-xs text-white/60">
                  <button onClick={() => setMinimumScore(250)} className="p-2 bg-white/10 rounded hover:bg-white/20">250</button>
                  <button onClick={() => setMinimumScore(300)} className="p-2 bg-white/10 rounded hover:bg-white/20">300</button>
                  <button onClick={() => setMinimumScore(350)} className="p-2 bg-white/10 rounded hover:bg-white/20">350</button>
                  <button onClick={() => setMinimumScore(400)} className="p-2 bg-white/10 rounded hover:bg-white/20">400</button>
                </div>
              </div>

              <button
                onClick={handleNext}
                className="w-full bg-[#4ade80] text-[#0f2040] py-4 rounded-xl font-bold font-['Lexend'] text-lg hover:bg-[#22c55e] transition-colors flex items-center justify-center gap-2"
              >
                Continuar <ChevronRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {/* Target Score */}
          {step === 'target' && (
            <motion.div
              key="target"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <h2 className="text-3xl font-bold font-['Lexend'] text-white">¿Cuál es tu objetivo?</h2>
                <p className="text-white/70">¿A cuántos puntos quieres llegar?</p>
              </div>

              <div className="bg-white/10 rounded-2xl p-8 backdrop-blur-sm border border-white/20 space-y-6">
                <div className="text-center">
                  <div className="text-6xl font-bold font-['Lexend'] text-[#4ade80] mb-4">{targetScore}</div>
                  <p className="text-white/70">puntos objetivo</p>
                </div>

                <input
                  aria-label="Puntaje objetivo"
                  type="range"
                  min={minimumScore}
                  max="500"
                  value={targetScore}
                  onChange={(e) => setTargetScore(parseInt(e.target.value))}
                  className="w-full h-3 bg-white/20 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #4ade80 0%, #4ade80 ${((targetScore - minimumScore) / (500 - minimumScore)) * 100}%, rgba(255,255,255,0.2) ${((targetScore - minimumScore) / (500 - minimumScore)) * 100}%, rgba(255,255,255,0.2) 100%)`
                  }}
                />

                <button
                  onClick={() => setTargetScore(suggestedTarget)}
                  className="w-full bg-white/20 hover:bg-white/30 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Sugerencia: {suggestedTarget} puntos (¿por qué no apuntar {suggestedTarget - minimumScore} puntos más?)
                </button>
              </div>

              <button
                onClick={handleNext}
                className="w-full bg-[#4ade80] text-[#0f2040] py-4 rounded-xl font-bold font-['Lexend'] text-lg hover:bg-[#22c55e] transition-colors flex items-center justify-center gap-2"
              >
                Continuar <ChevronRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {/* Career */}
          {step === 'career' && (
            <motion.div
              key="career"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <h2 className="text-3xl font-bold font-['Lexend'] text-white">¿Qué carrera quieres estudiar?</h2>
                <p className="text-white/70">Opcional: puedes dejarlo en blanco</p>
              </div>

              <label htmlFor="carrera" className="sr-only">Carrera</label>
              <input
                id="carrera"
                type="text"
                value={career}
                onChange={(e) => setCareer(e.target.value)}
                placeholder="Ej: Ingeniería de Sistemas, Medicina, Derecho..."
                className="w-full bg-white/10 border border-white/20 rounded-xl px-6 py-4 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#4ade80] text-lg"
              />

              <button
                onClick={handleNext}
                className="w-full bg-[#4ade80] text-[#0f2040] py-4 rounded-xl font-bold font-['Lexend'] text-lg hover:bg-[#22c55e] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continuar <ChevronRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {/* Summary */}
          {step === 'summary' && (
            <motion.div
              key="summary"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold font-['Lexend'] text-white">¡Perfecto!</h2>
                <p className="text-white/70">Aquí está tu plan personalizado</p>
              </div>

              <div className="bg-white/10 rounded-2xl p-8 backdrop-blur-sm border border-white/20 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-4 border-b border-white/20">
                    <span className="text-white/70">Tu carrera</span>
                    <span className="text-xl font-bold text-white">{career.trim() || 'Sin definir'}</span>
                  </div>
                  
                  <div className="flex items-center justify-between pb-4 border-b border-white/20">
                    <span className="text-white/70">Puntaje actual</span>
                    <span className="text-xl font-bold text-white">{currentScore}/500</span>
                  </div>
                  
                  <div className="flex items-center justify-between pb-4 border-b border-white/20">
                    <span className="text-white/70">Mínimo requerido</span>
                    <span className="text-xl font-bold text-white">{minimumScore}/500</span>
                  </div>
                  
                  <div className="flex items-center justify-between bg-[#4ade80]/20 rounded-xl p-4">
                    <span className="text-white font-semibold">Tu objetivo</span>
                    <span className="text-3xl font-bold text-[#4ade80]">{targetScore}/500</span>
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <p className="text-white/70 text-sm mb-2">Necesitas subir</p>
                  <p className="text-3xl font-bold text-[#4ade80]">{Math.max(0, targetScore - currentScore)} puntos</p>
                </div>
              </div>

              <button
                onClick={handleComplete}
                className="w-full bg-[#4ade80] text-[#0f2040] py-4 rounded-xl font-bold font-['Lexend'] text-lg hover:bg-[#22c55e] transition-colors flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Guardar mi meta
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
