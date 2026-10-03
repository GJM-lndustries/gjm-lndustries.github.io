import { useState } from 'react';
import { Link } from 'wouter';
import { useProgress } from '@/contexts/ProgressContext';
import { AREA_INFO, getQuestions } from '@/data/questions';
import { SIMULACRO_QUESTION_IDS } from '@/data/simulacro';
import QuestionView from '@/components/QuestionView';
import { CheckCircle2, XCircle, ChevronRight, Target, BarChart3, Lightbulb, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const simulacroQuestions = getQuestions(SIMULACRO_QUESTION_IDS);
const simulacroAreas = Array.from(new Set(simulacroQuestions.map(q => q.area)));

type SimState = 'intro' | 'running' | 'results';

export default function Simulacro() {
  const [state, setState] = useState<SimState>('intro');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const { addSimulacroScore, recordAnswer, progress } = useProgress();

  const question = simulacroQuestions[currentQ];

  const handleSelect = (optionId: string) => {
    if (answered) return;
    setSelected(optionId);
    setAnswered(true);
    setAnswers(prev => ({ ...prev, [question.id]: optionId }));
    recordAnswer(question, optionId === question.answer);
  };

  const handleNext = () => {
    if (currentQ < simulacroQuestions.length - 1) {
      setCurrentQ(c => c + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      // Calculate results
      window.scrollTo({ top: 0 });
      const correctCount = simulacroQuestions.filter(q => answers[q.id] === q.answer).length;
      const score = Math.round((correctCount / simulacroQuestions.length) * 100);
      addSimulacroScore(score);
      setState('results');
      toast.success('¡Simulacro completado!');
    }
  };

  const handleRestart = () => {
    setState('intro');
    setCurrentQ(0);
    setAnswers({});
    setSelected(null);
    setAnswered(false);
  };

  const correctCount = simulacroQuestions.filter(q => answers[q.id] === q.answer).length;
  const finalScore = Math.round((correctCount / simulacroQuestions.length) * 100);

  if (state === 'intro') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold font-['Lexend'] text-foreground">Simulacro ICFES</h1>
          <p className="text-muted-foreground mt-1">Practica como en el examen real</p>
        </div>

        {/* Hero */}
        <div className="bg-gradient-to-br from-[#1e3a5f] to-[#0f2040] rounded-2xl p-6 text-white">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-3xl">
              🎯
            </div>
            <div>
              <h2 className="text-xl font-bold font-['Lexend']">Mini Simulacro</h2>
              <p className="text-white/70 text-sm">
                {simulacroQuestions.length} preguntas de {simulacroAreas.map(a => AREA_INFO[a].label).join(', ')}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold">{simulacroQuestions.length}</p>
              <p className="text-xs text-white/60">Preguntas</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold">{simulacroAreas.length}</p>
              <p className="text-xs text-white/60">Áreas</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold">~{Math.max(5, simulacroQuestions.length * 2)}</p>
              <p className="text-xs text-white/60">Minutos</p>
            </div>
          </div>
          <button
            onClick={() => setState('running')}
            className="w-full bg-[#4ade80] text-[#0f2040] py-3 rounded-xl font-bold font-['Lexend'] hover:bg-[#22c55e] transition-colors flex items-center justify-center gap-2"
          >
            <Target className="w-5 h-5" />
            Empezar simulacro
          </button>
        </div>

        {/* Previous scores */}
        {progress.simulacroScores.length > 0 && (
          <div className="bg-card rounded-xl border border-border p-4">
            <h3 className="font-bold font-['Lexend'] text-foreground mb-3">Tus simulacros anteriores</h3>
            <div className="space-y-2">
              {progress.simulacroScores.slice(-5).reverse().map((score, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-16">Intento {progress.simulacroScores.length - idx}</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${score >= 70 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                  <span className={`text-sm font-bold w-10 text-right ${score >= 70 ? 'text-green-600' : score >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {score}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="bg-primary/5 rounded-xl border border-primary/20 p-4 space-y-2">
          <h3 className="font-bold font-['Lexend'] text-primary text-sm">Consejos para el simulacro:</h3>
          <ul className="space-y-1.5 text-sm text-foreground">
            <li className="flex items-start gap-2"><span>✅</span> Lee cada pregunta con calma antes de responder</li>
            <li className="flex items-start gap-2"><span>✅</span> Si no sabes, elimina las opciones que claramente están mal</li>
            <li className="flex items-start gap-2"><span>✅</span> En el Saber 11 no se restan puntos por respuesta incorrecta: nunca dejes preguntas en blanco</li>
            <li className="flex items-start gap-2"><span>✅</span> Después de cada respuesta verás la explicación</li>
          </ul>
        </div>
      </div>
    );
  }

  if (state === 'results') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-2xl mx-auto space-y-6"
      >
        <div className="text-center py-6">
          <div className="text-6xl mb-4">{finalScore >= 70 ? '🎉' : finalScore >= 50 ? '💪' : '📚'}</div>
          <h1 className="text-2xl font-bold font-['Lexend'] text-foreground">
            {finalScore >= 70 ? '¡Excelente resultado!' : finalScore >= 50 ? '¡Buen intento!' : '¡Sigue practicando!'}
          </h1>
          <div className="text-5xl font-bold text-primary font-['Lexend'] mt-3">{finalScore}%</div>
          <p className="text-muted-foreground mt-2">{correctCount} de {simulacroQuestions.length} preguntas correctas</p>
        </div>

        {/* Score interpretation */}
        <div className={`rounded-xl p-4 border ${
          finalScore >= 70 ? 'bg-green-50 border-green-200' : 
          finalScore >= 50 ? 'bg-yellow-50 border-yellow-200' : 
          'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className={`w-5 h-5 ${finalScore >= 70 ? 'text-green-600' : finalScore >= 50 ? 'text-yellow-600' : 'text-red-600'}`} />
            <span className="font-bold text-sm font-['Lexend']">Análisis de tu resultado</span>
          </div>
          <p className="text-sm text-foreground">
            {finalScore >= 70 
              ? '¡Vas muy bien! Sigue practicando en el modo práctica para afianzar todas las áreas.'
              : finalScore >= 50 
              ? 'Estás progresando bien. Te recomendamos repasar las lecciones de los temas donde fallaste.'
              : 'Necesitas más práctica. No te desanimes: vuelve a las lecciones básicas y practica más antes del siguiente simulacro.'
            }
          </p>
        </div>

        {/* Question review */}
        <div>
          <h2 className="font-bold font-['Lexend'] text-foreground mb-3">Revisión de preguntas</h2>
          <div className="space-y-3">
            {simulacroQuestions.map((q, idx) => {
              const userAnswer = answers[q.id];
              const isCorrect = userAnswer === q.answer;
              
              return (
                <div key={q.id} className={`rounded-xl border p-4 ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex items-start gap-2">
                    {isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">Pregunta {idx + 1}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{q.enunciado}</p>
                      {!isCorrect && (
                        <div className="mt-2 flex items-start gap-1.5">
                          <Lightbulb className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-foreground">{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <Link
          href="/practica?repaso=1"
          className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-xl font-bold font-['Lexend'] hover:bg-primary/90 transition-colors"
        >
          Repasar mis errores en el modo práctica
        </Link>

        <button
          onClick={handleRestart}
          className="w-full flex items-center justify-center gap-2 border-2 border-primary text-primary py-3 rounded-xl font-bold font-['Lexend'] hover:bg-primary/5 transition-colors"
        >
          <RotateCcw className="w-5 h-5" />
          Intentar de nuevo
        </button>
      </motion.div>
    );
  }

  // Running state
  const progress_pct = ((currentQ) / simulacroQuestions.length) * 100;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold font-['Lexend'] text-foreground">Simulacro ICFES</h1>
        <span className="text-sm text-muted-foreground">{currentQ + 1}/{simulacroQuestions.length}</span>
      </div>

      {/* Progress */}
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          animate={{ width: `${progress_pct}%` }}
          className="h-full bg-primary rounded-full"
        />
      </div>

      <QuestionView question={question} selected={selected} answered={answered} onSelect={handleSelect} showMeta />

      {answered && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleNext}
          className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold font-['Lexend'] hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
        >
          {currentQ < simulacroQuestions.length - 1 ? (
            <>Siguiente <ChevronRight className="w-5 h-5" /></>
          ) : (
            <>Ver resultados 🎯</>
          )}
        </motion.button>
      )}
    </div>
  );
}
