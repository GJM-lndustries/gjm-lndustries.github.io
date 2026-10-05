import { useMemo, useState } from 'react';
import { Link } from 'wouter';
import { useProgress } from '@/contexts/ProgressContext';
import type { Lesson, GlossaryTerm } from '@/lib/appData';
import { getQuestions } from '@/data/questions';
import QuestionView from '@/components/QuestionView';
import {
  ChevronRight, ChevronLeft, CheckCircle2,
  Lightbulb, BookOpen, AlertCircle, Star, X, HelpCircle
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
  const icons = {
    intro: <BookOpen className="w-5 h-5 text-primary" />,
    explanation: <Lightbulb className="w-5 h-5 text-yellow-500" />,
    example: <CheckCircle2 className="w-5 h-5 text-green-500" />,
    tip: <Star className="w-5 h-5 text-orange-500" />,
    warning: <AlertCircle className="w-5 h-5 text-red-500" />
  };

  const bgColors = {
    intro: 'bg-primary/5 border-primary/20',
    explanation: 'bg-yellow-50 border-yellow-200',
    example: 'bg-green-50 border-green-200',
    tip: 'bg-orange-50 border-orange-200',
    warning: 'bg-red-50 border-red-200'
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
      className={`rounded-xl border p-4 ${bgColors[content.type]}`}
    >
      {content.title && (
        <div className="flex items-center gap-2 mb-2">
          {icons[content.type]}
          <h4 className="font-bold text-sm font-['Lexend'] text-foreground">{content.title}</h4>
        </div>
      )}
      <div className="text-sm text-foreground leading-relaxed">
        {renderTextWithGlossary(content.text)}
      </div>
      {content.highlight && (
        <div className="mt-3 p-3 bg-white/60 rounded-lg border border-current/10">
          <p className="text-sm font-semibold text-foreground">{content.highlight}</p>
        </div>
      )}
    </motion.div>
  );
}

// Quiz component (preguntas del banco)
function QuizSection({ lesson, onComplete }: { lesson: Lesson; onComplete: (score: number) => void }) {
  const questions = useMemo(() => getQuestions(lesson.questionIds), [lesson.questionIds]);
  const { recordAnswer } = useProgress();
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
        <div className="text-6xl">{finalScore >= 70 ? '🎉' : '💪'}</div>
        <h2 className="text-2xl font-bold font-['Lexend']">
          {finalScore >= 70 ? '¡Excelente trabajo!' : '¡Sigue practicando!'}
        </h2>
        <div className="text-5xl font-bold text-primary font-['Lexend']">{finalScore}%</div>
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
          className="h-full bg-primary rounded-full transition-all"
          style={{ width: `${(currentQ / questions.length) * 100}%` }}
        />
      </div>

      <QuestionView question={question} selected={selected} answered={answered} onSelect={handleSelect} />

      {answered && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleNext}
          className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold font-['Lexend'] hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
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
  const { completeLesson, isLessonCompleted } = useProgress();
  const alreadyCompleted = isLessonCompleted(lesson.id);

  const handleCompleteQuiz = (score: number) => {
    completeLesson(lesson.id, score, lesson.xp);
    setPhase('done');
    if (score >= 70) {
      toast.success(`¡Lección completada! +${lesson.xp} XP`, { duration: 3000 });
    } else {
      toast.info('Lección completada. ¡Practica más para mejorar!', { duration: 3000 });
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
          <h1 className="text-lg font-bold font-['Lexend'] text-foreground leading-tight">{lesson.title}</h1>
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
          ⏱ {lesson.duration} min
        </span>
        <span className="score-badge bg-yellow-50 text-yellow-700 border border-yellow-200">
          ⭐ {lesson.xp} XP
        </span>
        {alreadyCompleted && (
          <span className="score-badge bg-green-50 text-green-700 border border-green-200">
            ✅ Completada
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
          📚 Lección
        </button>
        <button
          onClick={() => setPhase('quiz')}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
            phase === 'quiz' || phase === 'done' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
          }`}
        >
          ✏️ Práctica
        </button>
      </div>

      {/* Content Phase */}
      {phase === 'content' && (
        <div className="space-y-4">
          {/* Glossary preview */}
          {lesson.glossary.length > 0 && (
            <div className="bg-muted/50 rounded-xl p-3 border border-border">
              <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                📖 Palabras clave de esta lección (toca para ver qué significan):
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
                className="flex-1 bg-primary text-primary-foreground py-3 rounded-xl font-bold font-['Lexend'] hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                Continuar <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={() => setPhase('quiz')}
                className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold font-['Lexend'] hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                ¡Ir a practicar! ✏️
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
          className="w-full border-2 border-primary text-primary py-3 rounded-xl font-bold font-['Lexend'] hover:bg-primary/5 transition-colors"
        >
          ← Volver al módulo
        </button>
      )}
    </div>
  );
}
