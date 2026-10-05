import { useProgress } from '@/contexts/ProgressContext';
import { modules } from '@/lib/appData';
import { Star, Flame, BookOpen, Target } from 'lucide-react';
import { motion } from 'framer-motion';

interface Badge {
  id: string;
  icon: string;
  title: string;
  description: string;
  condition: string;
}

const allBadges: Badge[] = [
  {
    id: 'primer_paso',
    icon: '👣',
    title: 'Primer Paso',
    description: 'Completaste tu primera lección',
    condition: 'Completa 1 lección'
  },
  {
    id: 'cinco_lecciones',
    icon: '📚',
    title: 'Estudiante Dedicado',
    description: 'Completaste 5 lecciones',
    condition: 'Completa 5 lecciones'
  },
  {
    id: 'racha_3',
    icon: '🔥',
    title: 'En Racha',
    description: 'Estudiaste 3 días seguidos',
    condition: '3 días de racha'
  },
  {
    id: 'perfecto',
    icon: '⭐',
    title: 'Perfecto',
    description: 'Obtuviste 100% en un quiz',
    condition: '100% en un quiz'
  },
  {
    id: 'simulacro_70',
    icon: '🎯',
    title: 'Buen Simulacro',
    description: 'Obtuviste 70%+ en un simulacro',
    condition: '70%+ en simulacro'
  },
  {
    id: 'xp_500',
    icon: '💎',
    title: 'Acumulador',
    description: 'Acumulaste 500 XP',
    condition: '500 XP totales'
  },
  {
    id: 'modulo_completo',
    icon: '🏆',
    title: 'Módulo Completo',
    description: 'Completaste todas las lecciones de un módulo',
    condition: 'Completa un módulo'
  },
  {
    id: 'racha_7',
    icon: '🌟',
    title: 'Semana Perfecta',
    description: 'Estudiaste 7 días seguidos',
    condition: '7 días de racha'
  }
];

function BadgeCard({ badge, earned }: { badge: Badge; earned: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`rounded-xl border p-4 text-center transition-all ${
        earned 
          ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 shadow-md' 
          : 'bg-muted/30 border-border opacity-50'
      }`}
    >
      <div className={`text-4xl mb-2 ${!earned ? 'grayscale' : ''}`}>
        {earned ? badge.icon : '🔒'}
      </div>
      <h3 className={`font-bold text-sm font-['Lexend'] ${earned ? 'text-foreground' : 'text-muted-foreground'}`}>
        {badge.title}
      </h3>
      <p className={`text-xs mt-1 ${earned ? 'text-muted-foreground' : 'text-muted-foreground/60'}`}>
        {earned ? badge.description : badge.condition}
      </p>
      {earned && (
        <div className="mt-2 inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full">
          <Star className="w-3 h-3 fill-current" />
          Ganada
        </div>
      )}
    </motion.div>
  );
}

export default function Logros() {
  const { progress, estimate } = useProgress();
  
  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const completedLessons = progress.completedLessons.filter(l => l.completed).length;
  const avgScore = progress.completedLessons.length > 0
    ? Math.round(progress.completedLessons.reduce((sum, l) => sum + l.score, 0) / progress.completedLessons.length)
    : 0;

  // Check which badges are earned
  const earnedBadgeIds = new Set(progress.badges);
  
  // Dynamic badge checks
  if (progress.simulacroScores.some(s => s >= 70)) earnedBadgeIds.add('simulacro_70');
  if (progress.totalXp >= 500) earnedBadgeIds.add('xp_500');
  if (progress.streak >= 7) earnedBadgeIds.add('racha_7');
  
  // Check module completion
  modules.forEach(module => {
    const lessonIds = module.lessons.map(l => l.id);
    const allCompleted = lessonIds.every(id => progress.completedLessons.some(l => l.lessonId === id && l.completed));
    if (allCompleted && lessonIds.length > 0) earnedBadgeIds.add('modulo_completo');
  });

  const earnedCount = allBadges.filter(b => earnedBadgeIds.has(b.id)).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-['Lexend'] text-foreground">Mis Logros</h1>
        <p className="text-muted-foreground mt-1">Tu progreso en ProICFES</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-[#1e3a5f] to-[#0f2040] rounded-xl p-4 text-white">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-5 h-5 text-[#4ade80]" />
            <span className="text-sm text-white/80">Puntaje global estimado</span>
          </div>
          <p className="text-3xl font-bold font-['Lexend'] text-[#4ade80]">{estimate.global ?? '—'}</p>
          <p className="text-xs text-white/70 mt-1">{estimate.global == null ? 'Responde preguntas de las 5 áreas' : 'de 500 (estimado)'}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl p-4 text-white">
          <div className="flex items-center gap-2 mb-1">
            <Star className="w-5 h-5 text-white fill-white" />
            <span className="text-sm text-white/80">XP Totales</span>
          </div>
          <p className="text-3xl font-bold font-['Lexend']">{progress.totalXp}</p>
          <p className="text-xs text-white/70 mt-1">puntos de experiencia</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">Lecciones</span>
          </div>
          <p className="text-3xl font-bold font-['Lexend'] text-foreground">{completedLessons}</p>
          <p className="text-xs text-muted-foreground mt-1">de {totalLessons} completadas</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 mb-1">
            <Flame className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-muted-foreground">Racha</span>
          </div>
          <p className="text-3xl font-bold font-['Lexend'] text-foreground">{progress.streak}</p>
          <p className="text-xs text-muted-foreground mt-1">días seguidos</p>
        </div>
      </div>

      {/* Progress by module */}
      <div className="bg-card rounded-xl border border-border p-4">
        <h2 className="font-bold font-['Lexend'] text-foreground mb-4">Progreso por área</h2>
        <div className="space-y-3">
          {modules.map(module => {
            const lessonIds = module.lessons.map(l => l.id);
            const completed = lessonIds.filter(id => progress.completedLessons.some(l => l.lessonId === id && l.completed)).length;
            const pct = lessonIds.length > 0 ? Math.round((completed / lessonIds.length) * 100) : 0;
            
            return (
              <div key={module.id}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">{module.icon} {module.title}</span>
                  <span className="text-xs text-muted-foreground">{completed}/{lessonIds.length}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    className="h-full bg-gradient-to-r from-primary to-green-500 rounded-full"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Average score */}
      {avgScore > 0 && (
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold font-['Lexend'] text-foreground">Promedio en quizzes</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Basado en {completedLessons} lecciones</p>
            </div>
            <div className="text-right">
              <span className={`text-3xl font-bold font-['Lexend'] ${avgScore >= 70 ? 'text-green-600' : avgScore >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                {avgScore}%
              </span>
            </div>
          </div>
          <div className="mt-3 h-3 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${avgScore}%` }}
              className={`h-full rounded-full ${avgScore >= 70 ? 'bg-green-500' : avgScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
            />
          </div>
        </div>
      )}

      {/* Badges */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold font-['Lexend'] text-foreground">Insignias</h2>
          <span className="text-sm text-muted-foreground">{earnedCount}/{allBadges.length} ganadas</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {allBadges.map(badge => (
            <BadgeCard 
              key={badge.id} 
              badge={badge} 
              earned={earnedBadgeIds.has(badge.id)} 
            />
          ))}
        </div>
      </div>

      {/* Simulacro history */}
      {progress.simulacroScores.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-4">
          <h2 className="font-bold font-['Lexend'] text-foreground mb-3">Historial de simulacros</h2>
          <div className="space-y-2">
            {progress.simulacroScores.map((score, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-20">Simulacro {idx + 1}</span>
                <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${score >= 70 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${score}%` }}
                  />
                </div>
                <span className={`text-sm font-bold w-12 text-right ${score >= 70 ? 'text-green-600' : score >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {score}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Motivation */}
      {completedLessons === 0 && (
        <div className="bg-primary/5 rounded-xl border border-primary/20 p-5 text-center">
          <div className="text-4xl mb-3">🚀</div>
          <h3 className="font-bold font-['Lexend'] text-foreground">¡Empieza tu viaje!</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Completa tu primera lección para ganar tu primera insignia. Tu puntaje estimado se calcula con lo que respondas en lecciones, práctica y simulacros.
          </p>
        </div>
      )}
    </div>
  );
}
