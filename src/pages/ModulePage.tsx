import { useState } from 'react';
import { useProgress } from '@/contexts/ProgressContext';
import type { Module } from '@/lib/appData';
import LessonView from '@/components/LessonView';
import { ChevronLeft, CheckCircle2, Lock, Clock, Star, ChevronRight, X, BookMarked, PenLine } from 'lucide-react';
import AreaIcon from '@/components/AreaIcon';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { questionsByArea } from '@/data/questions';

interface ModulePageProps {
  module: Module;
}

export default function ModulePage({ module }: ModulePageProps) {
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [selectedTerm, setSelectedTerm] = useState<{ term: string; simple: string; technical: string } | null>(null);
  const { getModuleProgress, isLessonCompleted, getLessonProgress } = useProgress();
  
  const lessonIds = module.lessons.map(l => l.id);
  const moduleProgress = getModuleProgress(module.id, lessonIds);

  const lesson = selectedLesson ? module.lessons.find(l => l.id === selectedLesson) : null;
  const practiceCount = questionsByArea[module.area].length;

  if (lesson) {
    return (
      <LessonView 
        lesson={lesson} 
        onBack={() => setSelectedLesson(null)} 
      />
    );
  }

  const difficultyLabel = { facil: 'Fácil', medio: 'Medio', dificil: 'Difícil' };
  const difficultyColor = {
    facil: 'bg-green-100 text-green-700 border-green-200',
    medio: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    dificil: 'bg-red-100 text-red-700 border-red-200'
  };

  // Group lessons by level
  const levels = ['basico', 'intermedio', 'avanzado', 'experto'] as const;
  const levelNames = { basico: 'Nivel básico', intermedio: 'Nivel intermedio', avanzado: 'Nivel avanzado', experto: 'Nivel experto' };
  const levelRank = { basico: 1, intermedio: 2, avanzado: 3, experto: 4 };
  /** Indicador de nivel en barras (sustituye los emoji de colores). */
  const LevelBars = ({ level }: { level: keyof typeof levelRank }) => (
    <span className="inline-flex items-end gap-0.5" aria-hidden="true">
      {[1, 2, 3, 4].map(i => (
        <span
          key={i}
          className={`w-1 rounded-sm ${i <= levelRank[level] ? 'bg-navy' : 'bg-border'}`}
          style={{ height: `${4 + i * 3}px` }}
        />
      ))}
    </span>
  );
  // Al abrir una lección, volvemos arriba para que se vea el título
  const openLesson = (id: string) => {
    setSelectedLesson(id);
    window.scrollTo({ top: 0 });
  };
  const levelDescs = {
    basico: 'Empieza aquí si no sabes nada del tema',
    intermedio: 'Para quienes ya conocen lo básico',
    avanzado: 'Para llegar a 300+ puntos',
    experto: 'Para superar los 360 puntos'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Link href="/inicio" aria-label="Volver al inicio" className="-ml-2 mt-1 rounded-xl p-2 transition-colors hover:bg-muted">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div className="min-w-0">
          <p className="eyebrow">Área del ICFES</p>
          <h1 className="page-title mt-1">
            {module.title} <span className="font-semibold text-muted-foreground">para el ICFES</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{module.subtitle}</p>
        </div>
      </div>

      {/* Resumen del área (sin imagen decorativa) */}
      <section className="card p-5">
        <div className="flex items-start gap-4">
          <AreaIcon area={module.area} size="lg" />
          <div className="min-w-0 flex-1">
            <p className="text-[15px] leading-relaxed text-foreground">{module.description}</p>
            <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <dt className="sr-only">Lecciones</dt>
                <BookMarked className="h-4 w-4" aria-hidden="true" />
                <dd>{module.lessons.length} lecciones</dd>
              </div>
              <div className="flex items-center gap-1.5">
                <dt className="sr-only">Preguntas de práctica</dt>
                <PenLine className="h-4 w-4" aria-hidden="true" />
                <dd>{practiceCount} preguntas</dd>
              </div>
              <div className="flex items-center gap-1.5">
                <dt className="sr-only">Experiencia</dt>
                <Star className="h-4 w-4" aria-hidden="true" />
                <dd>{module.totalXp} XP</dd>
              </div>
            </dl>
          </div>
        </div>
        <Link href={`/practica?area=${module.area}`} className="btn-primary mt-5 w-full sm:w-auto">
          <PenLine className="h-4 w-4" aria-hidden="true" />
          Practicar {module.title}
        </Link>
      </section>

      {/* Progress */}
      {moduleProgress > 0 && (
        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-foreground">Tu progreso en esta área</span>
            <span className="text-sm font-bold text-foreground">{moduleProgress}%</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${moduleProgress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full rounded-full bg-brand"
            />
          </div>
        </div>
      )}

      {/* Lessons by level */}
      {levels.map(level => {
        const levelLessons = module.lessons.filter(l => l.level === level);
        if (levelLessons.length === 0) {
          // Niveles sin lecciones: solo mostramos «Experto» marcado como próximamente.
          if (level !== 'experto') return null;
          return (
            <div key={level} className="rounded-2xl border border-dashed border-border bg-muted/30 p-4" aria-disabled="true">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="flex items-center gap-2 text-base font-semibold font-['Lexend'] text-muted-foreground"><LevelBars level={level} />{levelNames[level]}</h2>
                  <p className="text-xs text-muted-foreground">{levelDescs[level]}</p>
                </div>
                <span className="score-badge bg-muted text-muted-foreground border border-border flex-shrink-0">
                  <Lock className="w-3 h-3 mr-1" /> Próximamente
                </span>
              </div>
            </div>
          );
        }

        return (
          <div key={level}>
            <div className="mb-3">
              <h2 className="section-title flex items-center gap-2"><LevelBars level={level} />{levelNames[level]}</h2>
              <p className="text-xs text-muted-foreground">{levelDescs[level]}</p>
            </div>
            <div className="space-y-3">
              {levelLessons.map((lesson, idx) => {
                const completed = isLessonCompleted(lesson.id);
                const lessonProg = getLessonProgress(lesson.id);
                
                return (
                  <motion.button
                    key={lesson.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => openLesson(lesson.id)}
                    className="card w-full p-4 text-left transition-colors hover:border-navy/30"
                  >
                    <div className="flex items-start gap-3">
                      {/* Number/Check */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        completed ? 'bg-green-100' : 'bg-primary/10'
                      }`}>
                        {completed ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        ) : (
                          <span className="text-primary font-bold text-sm font-['Lexend']">{idx + 1}</span>
                        )}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm font-['Lexend'] text-foreground leading-tight">{lesson.title}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{lesson.subtitle}</p>
                        
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${difficultyColor[lesson.difficulty]}`}>
                            {difficultyLabel[lesson.difficulty]}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {lesson.duration} min
                          </span>
                          <span className="flex items-center gap-1 text-xs text-yellow-600">
                            <Star className="w-3 h-3 fill-current" />
                            {lesson.xp} XP
                          </span>
                          {completed && lessonProg && (
                            <span className="text-xs text-green-600 font-semibold">
                              {lessonProg.score} % en la práctica
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Glossary section */}
      {module.lessons.some(l => l.glossary.length > 0) && (
        <div className="card p-5">
          <h2 className="section-title mb-1 flex items-center gap-2"><BookMarked className="h-5 w-5 text-muted-foreground" aria-hidden="true" />Glosario del área</h2>
          <p className="text-xs text-muted-foreground mb-3">
            Términos que aparecen en las lecciones. Toca uno para ver qué significa en palabras sencillas.
          </p>
          <div className="flex flex-wrap gap-2">
            {module.lessons.flatMap(l => l.glossary).map((term, idx) => (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedTerm(term)}
                className="text-xs bg-card border border-border px-3 py-1.5 rounded-lg text-primary font-medium hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-colors"
              >
                {term.term}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Term definition modal */}
      {selectedTerm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedTerm(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="card p-6 max-w-md w-full"
          >
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-xl font-bold font-['Lexend'] text-foreground">{selectedTerm.term}</h2>
              <button
                onClick={() => setSelectedTerm(null)}
                aria-label="Cerrar"
                className="p-1 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">En palabras simples:</p>
                <p className="text-foreground leading-relaxed">{selectedTerm.simple}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">Definición técnica:</p>
                <p className="text-foreground leading-relaxed text-sm">{selectedTerm.technical}</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
