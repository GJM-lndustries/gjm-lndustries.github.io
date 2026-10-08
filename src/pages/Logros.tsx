import { Link } from 'wouter';
import { useProgress } from '@/contexts/ProgressContext';
import { modules } from '@/lib/appData';
import {
  Star, Flame, BookOpen, Target, Footprints, BookMarked, Medal, Gem, Trophy, CalendarCheck, Mountain, Lock, CircleCheckBig,
  type LucideIcon,
} from 'lucide-react';
import { motion } from 'framer-motion';
import AreaIcon from '@/components/AreaIcon';
import { withMotion } from '@/components/withMotion';

type BadgeTone = 'navy' | 'orange' | 'green' | 'violet';

interface Badge {
  id: string;
  icon: LucideIcon;
  tone: BadgeTone;
  title: string;
  description: string;
  condition: string;
}

/** Mismo diseño para todas las insignias: icono lucide en un cuadro redondeado del color de su categoría. */
const TONES: Record<BadgeTone, string> = {
  navy: 'bg-navy/5 text-navy ring-navy/15',
  orange: 'bg-orange-50 text-orange-700 ring-orange-200',
  green: 'bg-brand-soft text-green-700 ring-green-200',
  violet: 'bg-violet-50 text-violet-700 ring-violet-200',
};

const allBadges: Badge[] = [
  { id: 'primer_paso', icon: Footprints, tone: 'navy', title: 'Primer paso', description: 'Completaste tu primera lección', condition: 'Completa 1 lección' },
  { id: 'cinco_lecciones', icon: BookMarked, tone: 'navy', title: 'Constancia', description: 'Completaste 5 lecciones', condition: 'Completa 5 lecciones' },
  { id: 'modulo_completo', icon: Trophy, tone: 'navy', title: 'Área completa', description: 'Terminaste todas las lecciones de un área', condition: 'Completa un área' },
  { id: 'racha_3', icon: Flame, tone: 'orange', title: 'En racha', description: 'Cumpliste el reto 3 días seguidos', condition: '3 días de racha' },
  { id: 'racha_7', icon: CalendarCheck, tone: 'orange', title: 'Semana completa', description: 'Cumpliste el reto 7 días seguidos', condition: '7 días de racha' },
  { id: 'racha_30', icon: Mountain, tone: 'orange', title: 'Un mes sin parar', description: 'Cumpliste el reto 30 días seguidos', condition: '30 días de racha' },
  { id: 'perfecto', icon: CircleCheckBig, tone: 'green', title: 'Sin errores', description: 'Sacaste 100 % en la práctica de una lección', condition: '100 % en una lección' },
  { id: 'simulacro_70', icon: Medal, tone: 'green', title: 'Buen simulacro', description: 'Sacaste 70 % o más en un simulacro', condition: '70 % en un simulacro' },
  { id: 'xp_500', icon: Gem, tone: 'violet', title: '500 XP', description: 'Acumulaste 500 puntos de experiencia', condition: 'Llega a 500 XP' },
];

function BadgeCard({ badge, earned }: { badge: Badge; earned: boolean }) {
  const Icon = badge.icon;
  return (
    <li className={`card flex flex-col items-center p-4 text-center ${earned ? '' : 'bg-muted/40 shadow-none'}`}>
      <span className="relative">
        <span
          className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl ring-1 ring-inset ${
            earned ? TONES[badge.tone] : 'bg-muted text-muted-foreground/60 ring-border'
          }`}
          aria-hidden="true"
        >
          <Icon className="h-7 w-7" strokeWidth={1.75} />
        </span>
        {!earned && (
          <span className="absolute -bottom-1 -right-1 inline-flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground" aria-hidden="true">
            <Lock className="h-3 w-3" />
          </span>
        )}
      </span>
      <h3 className={`mt-3 font-['Lexend'] text-sm font-semibold ${earned ? 'text-foreground' : 'text-muted-foreground'}`}>
        {badge.title}
      </h3>
      <p className="mt-1 text-xs text-muted-foreground">{earned ? badge.description : badge.condition}</p>
      <span className="sr-only">{earned ? 'Insignia ganada' : 'Insignia bloqueada'}</span>
    </li>
  );
}

function Logros() {
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
  
  
  // Check module completion
  modules.forEach(module => {
    const lessonIds = module.lessons.map(l => l.id);
    const allCompleted = lessonIds.every(id => progress.completedLessons.some(l => l.lessonId === id && l.completed));
    if (allCompleted && lessonIds.length > 0) earnedBadgeIds.add('modulo_completo');
  });

  const earnedCount = allBadges.filter(b => earnedBadgeIds.has(b.id)).length;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="page-title">Logros</h1>
        <p className="mt-1 text-[15px] text-muted-foreground">Tus insignias y tu avance en ProICFES.</p>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={Target} tile="bg-brand-soft text-green-700" label="Puntaje estimado" value={`${estimate.global ?? '—'}`} note={estimate.global == null ? 'Responde en las 5 áreas' : 'de 500'} />
        <StatCard icon={Star} tile="bg-violet-50 text-violet-700" label="Experiencia" value={`${progress.totalXp}`} note="XP" />
        <StatCard icon={BookOpen} tile="bg-navy/5 text-navy" label="Lecciones" value={`${completedLessons}`} note={`de ${totalLessons}`} />
        <StatCard icon={Flame} tile="bg-orange-50 text-orange-700" label="Racha" value={`${progress.streakState?.current ?? progress.streak}`} note="días seguidos" />
      </div>

      {/* Progress by module */}
      <div className="card p-5">
        <h2 className="section-title mb-4">Progreso por área</h2>
        <div className="space-y-3">
          {modules.map(module => {
            const lessonIds = module.lessons.map(l => l.id);
            const completed = lessonIds.filter(id => progress.completedLessons.some(l => l.lessonId === id && l.completed)).length;
            const pct = lessonIds.length > 0 ? Math.round((completed / lessonIds.length) * 100) : 0;
            
            return (
              <div key={module.id}>
                <div className="flex items-center justify-between mb-1">
                  <span className="flex items-center gap-2 text-sm font-medium text-foreground"><AreaIcon area={module.area} size="sm" />{module.title}</span>
                  <span className="text-xs text-muted-foreground">{completed}/{lessonIds.length}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    className="h-full rounded-full bg-brand"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Average score */}
      {avgScore > 0 && (
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="section-title">Promedio en las lecciones</h2>
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
          <h2 className="section-title">Insignias</h2>
          <span className="text-sm text-muted-foreground">{earnedCount}/{allBadges.length} ganadas</span>
        </div>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {allBadges.map(badge => (
            <BadgeCard key={badge.id} badge={badge} earned={earnedBadgeIds.has(badge.id)} />
          ))}
        </ul>
      </div>

      {/* Simulacro history */}
      {progress.simulacroScores.length > 0 && (
        <div className="card p-5">
          <h2 className="section-title mb-3">Historial de simulacros</h2>
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
        <div className="card p-5">
          <h2 className="section-title">Tu primera insignia está a una lección</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Completa una lección para ganarla. Tu puntaje estimado se calcula con lo que respondes en lecciones, práctica y simulacros.
          </p>
          <Link href="/matematicas" className="btn-primary btn-sm mt-4">Empezar una lección</Link>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, tile, label, value, note }: { icon: LucideIcon; tile: string; label: string; value: string; note: string }) {
  return (
    <div className="card p-4">
      <span className={`icon-tile h-9 w-9 rounded-lg ${tile}`} aria-hidden="true">
        <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
      </span>
      <p className="mt-3 text-xs text-muted-foreground">{label}</p>
      <p className="font-['Lexend'] text-2xl font-semibold tabular-nums text-foreground">{value}</p>
      <p className="text-[11px] text-muted-foreground">{note}</p>
    </div>
  );
}

export default withMotion(Logros);
