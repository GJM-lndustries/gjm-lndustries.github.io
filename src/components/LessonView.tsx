import { useMemo, useState } from 'react';
import { useActiveTimer } from '@/hooks/useActiveTimer';
import { Link } from 'wouter';
import { useProgress } from '@/contexts/ProgressContext';
import type { Lesson, GlossaryTerm } from '@/lib/appData';
import { getQuestions } from '@/data/questions';
import QuestionView from '@/components/QuestionView';
import {
  ChevronRight, ChevronLeft, CheckCircle2,
  Lightbulb, BookOpen, AlertCircle, Star, X, HelpCircle, Clock, PenLine, Trophy, TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

// Glossary tooltip component
function GlossaryTooltip({ term, children }: { term: GlossaryTerm; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  
  return (
    <span className="relative inline">
      <button
        type="button"
        className="glossary-term"
        onClick={() => setOpen(true)}
      >
        {children}
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              className="absolute bottom-full left-0 mb-2 w-72 bg-popover text-popover-foreground rounded-xl shadow-xl border border-border p-4 z-50"
            >
              <button
                onClick={() => setOpen(false)}
                aria-label="Cerrar definición"
                className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2 mb-2">
                <HelpCircle className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="font-bold text-sm font-['Lexend']">{term.term}</span>
              </div>
              <p className="text-sm text-foreground mb-2">
                <span className="font-semibold text-primary">En palabras simples:</span> {term.simple}
              </p>
              <p className="text-xs text-muted-foreground border-t border-border pt-2">
                <span className="font-semibold">Técnico:</span> {term.technical}
              </p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </span>
  );
}

// Content block renderer
function ContentBlock({ content, glossary }: { content: Lesson['content'][0]; glossary: GlossaryTerm[] }) {
  // Un solo estilo de tarjeta; el tipo de bloque se distingue por el icono y su color.
  const icons = {
    intro: <BookOpen className="h-4 w-4" strokeWidth={1.75} />,
    explanation: <Lightbulb className="h-4 w-4" strokeWidth={1.75} />,
    example: <CheckCircle2 className="h-4 w-4" strokeWidth={1.75} />,
    tip: <Star className="h-4 w-4" strokeWidth={1.75} />,
    warning: <AlertCircle className="h-4 w-4" strokeWidth={1.75} />
  };

  const tiles = {
    intro: 'bg-navy/5 text-navy',
    explanation: 'bg-amber-50 text-amber-700',
    example: 'bg-brand-soft text-green-700',
    tip: 'bg-violet-50 text-violet-700',
    warning: 'bg-red-50 text-red-700'
  };

  // Replace glossary terms with tooltips
  const renderTextWithGlossary = (text: string) => {
    let parts: (string | React.ReactNode)[] = [text];
    
    glossary.forEach(term => {
      const newParts: (string | React.ReactNode)[] = [];
      parts.forEach((part, idx) => {
        if (typeof part === 'string') {
          const splitParts = part.split(new RegExp(`(${term.term})`, 'gi'));
          splitParts.forEach((sp, spIdx) => {
            if (sp.toLowerCase() === term.term.toLowerCase()) {
              newParts.push(
                <GlossaryTooltip key={`${idx}-${spIdx}`} term={term}>{sp}</GlossaryTooltip>
              );
            } else {
              newParts.push(sp);
            }
          });
        } else {
          newParts.push(part);
        }
      });
      parts = newParts;
    });
    
    return parts;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-4 sm:p-5"
    >
      {content.title && (
        <div className="mb-2 flex items-center gap-2.5">
          <span className={`icon-tile h-7 w-7 rounded-lg ${tiles[content.type]}`} aria-hidden="true">{icons[content.type]}</span>
          <h2 className="font-['Lexend'] text-[15px] font-semibold text-foreground">{content.title}</h2>
        </div>
      )}
      <div className="text-[15px] leading-relaxed text-foreground">
        {renderTextWithGlossary(content.text)}
      </div>
      {content.highlight && (
        <div className="mt-3 rounded-xl border-l-4 border-brand bg-brand-soft/60 px-3 py-2.5">
          <p className="text-sm font-semibold text-foreground">{content.highlight}</p>
        </div>
      )}
    </motion.div>
  );
}

// Quiz component (preguntas del banco)
function QuizSection({ lesson, onComplete }: { lesson: Lesson; onComplete: (score: number) => void }) {
  const { recordAnswer, trackChallengeQuestion, trackChallengeTime } = useProgress();
  useActiveTimer(true, ms => trackChallengeTime("answering", ms));
  const questions = useMemo(() => getQuestions(lesson.questionIds), [lesson.questionIds]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);

  if (questions.length === 0) {
    return <p className="text-sm text-muted-foreground">Esta lección todavía no tiene preguntas de práctica.</p>;
  }

  const question = questions[currentQ];

  const handleSelect = (optionId: string) => {
    if (answered) return;
    const correct = optionId === question.answer;
    setSelected(optionId);
    setAnswered(true);
    if (correct) setCorrectCount(c => c + 1);
    recordAnswer(question, correct);
    trackChallengeQuestion();
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(c => c + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      // correctCount ya incluye la última respuesta (se suma al seleccionar)
      setFinished(true);
      onComplete(Math.round((correctCount / questions.length) * 100));
    }
  };

  if (finished) {
    const finalScore = Math.round((correctCount / questions.length) * 100);
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-8 space-y-4"
      >
        <span className={`icon-tile h-14 w-14 rounded-2xl ${finalScore >= 70 ? 'bg-brand-soft text-green-700' : 'bg-navy/10 text-navy'}`} aria-hidden="true">
          {finalScore >= 70 ? <Trophy className="h-7 w-7" strokeWidth={1.75} /> : <TrendingUp className="h-7 w-7" strokeWidth={1.75} />}
        </span>
        <h2 className="page-title">
          {finalScore >= 70 ? 'Muy bien hecho' : 'Vas por buen camino'}
        </h2>
        <div className="font-['Lexend'] text-5xl font-bold tabular-nums text-foreground">{finalScore}%</div>
        <p className="text-muted-foreground">
          {correctCount} de {questions.length} preguntas correctas
        </p>
        <div className="flex items-center justify-center gap-2 text-yellow-600">
          <Star className="w-5 h-5 fill-current" />
          <span className="font-bold">+{lesson.xp} XP ganados</span>
        </div>
        <Link
          href={`/practica?area=${questions[0].area}`}
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
        >
          Seguir practicando esta área <ChevronRight className="w-4 h-4" />
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Pregunta {currentQ + 1} de {questions.length}</span>
        <span className="font-semibold">{correctCount} correctas</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-brand rounded-full transition-all"
          style={{ width: `${(currentQ / questions.length) * 100}%` }}
        />
      </div>

      <QuestionView question={question} selected={selected} answered={answered} onSelect={handleSelect} />

      {answered && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleNext}
          className="btn-primary w-full"
        >
          {currentQ < questions.length - 1 ? (
            <>Siguiente pregunta <ChevronRight className="w-5 h-5" /></>
          ) : (
            <>Ver resultados <Star className="w-5 h-5" /></>
          )}
        </motion.button>
      )}
    </div>
  );
}

interface LessonViewProps {
  lesson: Lesson;
  onBack: () => void;
}

export default function LessonView({ lesson, onBack }: LessonViewProps) {
  const [phase, setPhase] = useState<'content' | 'quiz' | 'done'>('content');
  const [contentStep, setContentStep] = useState(0);
  const { completeLesson, isLessonCompleted, trackChallengeTime } = useProgress();
  useActiveTimer(phase === 'content', ms => trackChallengeTime('reading', ms));
  const alreadyCompleted = isLessonCompleted(lesson.id);

  const handleCompleteQuiz = (score: number) => {
    completeLesson(lesson.id, score, lesson.xp);
    setPhase('done');
    if (score >= 70) {
      toast.success(`Lección completada · +${lesson.xp} XP`, { duration: 3000 });
    } else {
      toast.info('Lección completada. Practica un poco más para afianzarla.', { duration: 3000 });
    }
  };

  const difficultyLabel = { facil: 'Fácil', medio: 'Medio', dificil: 'Difícil' };
  const levelLabel = { basico: 'Básico', intermedio: 'Intermedio', avanzado: 'Avanzado', experto: 'Experto' } as const;
  const difficultyColor = { facil: 'difficulty-easy', medio: 'difficulty-medium', dificil: 'difficulty-hard' };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} aria-label="Volver al módulo" className="p-2 rounded-xl hover:bg-muted transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="font-['Lexend'] text-xl font-bold leading-tight tracking-tight text-foreground">{lesson.title}</h1>
          <p className="text-sm text-muted-foreground">{lesson.subtitle}</p>
        </div>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`score-badge border ${difficultyColor[lesson.difficulty]}`}>
          {difficultyLabel[lesson.difficulty]}
        </span>
        <span className="score-badge bg-primary/10 text-primary border border-primary/20">
          {levelLabel[lesson.level]}
        </span>
        <span className="score-badge bg-muted text-muted-foreground border border-border">
          <Clock className="mr-1 h-3.5 w-3.5" aria-hidden="true" />{lesson.duration} min
        </span>
        <span className="score-badge bg-yellow-50 text-yellow-700 border border-yellow-200">
          <Star className="mr-1 h-3.5 w-3.5" aria-hidden="true" />{lesson.xp} XP
        </span>
        {alreadyCompleted && (
          <span className="score-badge bg-green-50 text-green-700 border border-green-200">
            <CheckCircle2 className="mr-1 h-3.5 w-3.5" aria-hidden="true" />Completada
          </span>
        )}
      </div>

      {/* Phase Tabs */}
      <div className="flex gap-1 bg-muted rounded-xl p-1">
        <button
          onClick={() => setPhase('content')}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
            phase === 'content' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
          }`}
        >
          <span className="inline-flex items-center justify-center gap-1.5"><BookOpen className="h-4 w-4" aria-hidden="true" />Lección</span>
        </button>
        <button
          onClick={() => setPhase('quiz')}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
            phase === 'quiz' || phase === 'done' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
          }`}
        >
          <span className="inline-flex items-center justify-center gap-1.5"><PenLine className="h-4 w-4" aria-hidden="true" />Práctica</span>
        </button>
      </div>

      {/* Content Phase */}
      {phase === 'content' && (
        <div className="space-y-4">
          {/* Glossary preview */}
          {lesson.glossary.length > 0 && (
            <div className="bg-muted/50 rounded-xl p-3 border border-border">
              <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                Palabras clave · toca una para ver su significado
              </p>
              <div className="flex flex-wrap gap-2">
                {lesson.glossary.map(term => (
                  <GlossaryTooltip key={term.term} term={term}>
                    <span className="text-sm">{term.term}</span>
                  </GlossaryTooltip>
                ))}
              </div>
            </div>
          )}

          {/* Content blocks */}
          <AnimatePresence mode="wait">
            {lesson.content.slice(0, contentStep + 1).map((block, idx) => (
              <ContentBlock key={idx} content={block} glossary={lesson.glossary} />
            ))}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex gap-3">
            {contentStep < lesson.content.length - 1 ? (
              <button
                onClick={() => setContentStep(s => s + 1)}
                className="btn-primary flex-1"
              >
                Continuar <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={() => setPhase('quiz')}
                className="btn-primary flex-1"
              >
                Ir a practicar <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
          
          {contentStep < lesson.content.length - 1 && (
            <p className="text-center text-xs text-muted-foreground">
              {contentStep + 1} de {lesson.content.length} secciones
            </p>
          )}
        </div>
      )}

      {/* Quiz Phase */}
      {(phase === 'quiz' || phase === 'done') && (
        <QuizSection lesson={lesson} onComplete={handleCompleteQuiz} />
      )}

      {/* Done - back button */}
      {phase === 'done' && (
        <button
          onClick={onBack}
          className="btn-secondary w-full"
        >
          Volver al módulo
        </button>
      )}
    </div>
  );
}
