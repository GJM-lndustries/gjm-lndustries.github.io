import { useState } from 'react';
import { useProgress } from '@/contexts/ProgressContext';
import type { Module } from '@/lib/appData';
import LessonView from '@/components/LessonView';
import { ChevronLeft, CheckCircle2, Lock, Clock, Star, ChevronRight, X } from 'lucide-react';
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
  const levelNames = { basico: '🟢 Nivel Básico', intermedio: '🟡 Nivel Intermedio', avanzado: '🔴 Nivel Avanzado', experto: '⭐ Nivel Experto' };
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
      <div className="flex items-center gap-3">
        <Link href="/" aria-label="Volver al inicio" className="p-2 rounded-xl hover:bg-muted transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold font-['Lexend'] text-foreground">
            {module.icon} {module.title}
          </h1>
          <p className="text-sm text-muted-foreground">{module.subtitle}</p>
        </div>
      </div>

      {/* Module Hero */}
      <div className="relative rounded-2xl overflow-hidden h-40">
        <img src={module.image} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30 flex items-end p-4">
          <div className="flex-1">
            <p className="text-white/80 text-sm">{module.description}</p>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1 text-white text-sm">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span>{module.totalXp} XP disponibles</span>
              </div>
              <div className="text-white/60 text-sm">•</div>
              <div className="text-white/80 text-sm">{module.lessons.length} lecciones</div>
            </div>
          </div>
        </div>
      </div>

      {/* Practice CTA */}
      <Link
        href={`/practica?area=${module.area}`}
        className="flex items-center justify-between gap-3 bg-primary text-primary-foreground rounded-xl p-4 hover:bg-primary/90 transition-colors"
      >
        <div>
          <p className="font-bold font-['Lexend'] text-sm">Practicar {module.title}</p>
          <p className="text-xs opacity-80">{practiceCount} preguntas en el banco, con explicación y tips</p>
        </div>
        <ChevronRight className="w-5 h-5 flex-shrink-0" />
      </Link>

      {/* Progress */}
      {moduleProgress > 0 && (
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-foreground">Tu progreso en este módulo</span>
            <span className="text-sm font-bold text-primary">{moduleProgress}%</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${moduleProgress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-primary to-green-500 rounded-full"
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
            <div key={level} className="rounded-xl border border-dashed border-border bg-muted/30 p-4" aria-disabled="true">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold font-['Lexend'] text-muted-foreground">{levelNames[level]}</h2>
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
              <h2 className="text-base font-bold font-['Lexend'] text-foreground">{levelNames[level]}</h2>
              <p className="text-xs text-muted-foreground">{levelDescs[level]}</p>
            </div>
            <div className="space-y-3">
              {levelLessons.map((lesson, idx) => {
                const completed = isLessonCompleted(lesson.id);
                const lessonProg = getLessonProgress(lesson.id);
                
                return (
                  <motion.button
                    key={lesson.id}
                    whileHover={{ x: 3 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => openLesson(lesson.id)}
                    className="w-full text-left bg-card rounded-xl border border-border p-4 hover:shadow-md transition-all hover:border-primary/30"
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
                              {lessonProg.score}% en quiz
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
        <div className="bg-muted/30 rounded-xl p-4 border border-border">
          <h3 className="font-bold font-['Lexend'] text-foreground mb-2">📖 Glosario del módulo</h3>
          <p className="text-xs text-muted-foreground mb-3">
            Estas palabras técnicas las encontrarás en las lecciones. Tócalas para ver qué significan en palabras simples.
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
            className="bg-card rounded-2xl border border-border p-6 max-w-md w-full"
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
