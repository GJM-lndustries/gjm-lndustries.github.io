import { Link } from 'wouter';
import { Trophy, TrendingUp, Flame, Target, PenLine } from 'lucide-react';
import { useProgress } from '@/contexts/ProgressContext';

/**
 * Antes esta página mostraba un ranking con nombres y puntajes inventados al azar.
 * No hay servidor ni cuentas de usuario, así que mostramos solo datos reales del estudiante
 * y dejamos el ranking marcado como «próximamente».
 */
export default function Leaderboard() {
  const { progress, estimate } = useProgress();
  const bestSim = progress.simulacroScores.length ? Math.max(...progress.simulacroScores) : null;
  const answered = estimate.totalAnswered;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="page-title">Ranking</h1>
        <p className="text-muted-foreground mt-1">Compite contra tu mejor versión</p>
      </div>

      <div className="rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-6 text-center space-y-2">
        <Trophy className="w-10 h-10 text-primary mx-auto" aria-hidden="true" />
        <h2 className="text-lg font-bold font-['Lexend'] text-foreground">Próximamente</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Estamos trabajando en un ranking real entre estudiantes. Por ahora tu progreso se guarda solo en este
          dispositivo, así que aquí ves tus propias marcas.
        </p>
      </div>

      <section aria-labelledby="mis-marcas" className="space-y-3">
        <h2 id="mis-marcas" className="font-bold font-['Lexend'] text-foreground">Tus marcas personales</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="card p-4">
            <Target className="w-5 h-5 text-primary mb-1" aria-hidden="true" />
            <p className="text-2xl font-bold font-['Lexend'] text-foreground">{bestSim == null ? '—' : `${bestSim}%`}</p>
            <p className="text-xs text-muted-foreground">Mejor simulacro</p>
          </div>
          <div className="card p-4">
            <Flame className="w-5 h-5 text-orange-500 mb-1" aria-hidden="true" />
            <p className="text-2xl font-bold font-['Lexend'] text-foreground">{progress.streak}</p>
            <p className="text-xs text-muted-foreground">Días seguidos estudiando</p>
          </div>
          <div className="card p-4">
            <PenLine className="w-5 h-5 text-green-600 mb-1" aria-hidden="true" />
            <p className="text-2xl font-bold font-['Lexend'] text-foreground">{answered}</p>
            <p className="text-xs text-muted-foreground">Preguntas respondidas</p>
          </div>
          <div className="card p-4">
            <TrendingUp className="w-5 h-5 text-primary mb-1" aria-hidden="true" />
            <p className="text-2xl font-bold font-['Lexend'] text-foreground">{estimate.global ?? '—'}</p>
            <p className="text-xs text-muted-foreground">Puntaje global estimado</p>
          </div>
        </div>
      </section>

      <Link
        href="/analytics"
        className="btn-primary w-full"
      >
        Ver mi progreso completo
      </Link>
    </div>
  );
}
