import { Flame, Footprints, BookMarked, Medal, Gem, Trophy, CalendarCheck, Mountain, Lock, CircleCheckBig, type LucideIcon } from 'lucide-react';
import type { UserProgress } from '@/contexts/ProgressContext';
import { modules } from '@/lib/appData';

type BadgeTone = 'navy' | 'orange' | 'green' | 'violet';

export interface Badge {
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

export const allBadges: Badge[] = [
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

export function BadgeCard({ badge, earned }: { badge: Badge; earned: boolean }) {
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


/** Insignias ganadas: las guardadas más las que se deducen del progreso. */
export function earnedBadgeIds(progress: UserProgress): Set<string> {
  const ids = new Set(progress.badges);
  if (progress.simulacroScores.some(s => s >= 70)) ids.add('simulacro_70');
  if (progress.totalXp >= 500) ids.add('xp_500');
  modules.forEach(m => {
    const lessonIds = m.lessons.map(l => l.id);
    if (lessonIds.length > 0 && lessonIds.every(id => progress.completedLessons.some(l => l.lessonId === id && l.completed))) ids.add('modulo_completo');
  });
  return ids;
}
