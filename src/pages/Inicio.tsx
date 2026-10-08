import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { useProgress } from '@/contexts/ProgressContext';
import { modules } from '@/lib/appData';
import { AREA_INFO, BANK_TOTAL } from '@/data/questions/meta';
import { AREA_IDS } from '@/data/questions/types';
import {
  ChevronRight, Target, PenLine, ClipboardList, RotateCcw, Library, Lightbulb, CircleHelp,
  ListChecks, Gauge, Scale, CircleCheck, Shuffle,
} from 'lucide-react';
import DailyChallengeCard from '@/components/DailyChallengeCard';
import AreaIcon from '@/components/AreaIcon';
import { withMotion } from '@/components/withMotion';

/** Puntaje estimado frente a la meta, con el detalle por área. */
function GoalCard() {
  const { estimate, progress } = useProgress();
  const score = estimate.global;
  const target = progress.targetScore;
  const pct = score == null ? 0 : Math.min(100, (score / 500) * 100);
  const targetPct = (target / 500) * 100;
  const gap = score == null ? null : target - score;
  const completedCount = progress.completedLessons.filter(l => l.completed).length;

  return (
    <section aria-labelledby="meta-titulo" className="card flex flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="icon-tile bg-brand-soft text-green-700" aria-hidden="true">
            <Target className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <div>
            <p className="eyebrow">Tu meta</p>
            <h2 id="meta-titulo" className="section-title">{target} puntos</h2>
          </div>
        </div>
        <Link href="/meta" className="btn-link">Editar</Link>
      </div>

      <div className="mt-5 flex items-end gap-2">
        <span className={`font-['Lexend'] text-4xl font-bold tracking-tight tabular-nums ${score == null ? 'text-muted-foreground/60' : 'text-foreground'}`}>{score ?? '–'}</span>
        <span className="mb-1 text-sm text-muted-foreground">de 500 · puntaje estimado</span>
      </div>

      <div className="relative mt-3 h-2 rounded-full bg-muted" aria-hidden="true">
        <div className="progress-fill h-full rounded-full bg-navy" style={{ width: `${pct}%` }} />
        <span className="absolute -top-1 h-4 w-0.5 rounded-full bg-brand" style={{ left: `${targetPct}%` }} />
      </div>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
        {score == null
          ? estimate.totalAnswered === 0
            ? 'Responde preguntas de las cinco áreas y aquí verás tu estimado.'
            : `Para estimarlo faltan datos de ${estimate.missingAreas.map(a => AREA_INFO[a].label).join(', ')}.`
          : gap != null && gap > 0
            ? `Te faltan ${gap} puntos para tu meta. Es un estimado con la ponderación oficial, no un resultado del ICFES.`
            : 'Vas por encima de tu meta. Es un estimado con la ponderación oficial, no un resultado del ICFES.'}
      </p>

      <ul className="mt-4 grid grid-cols-5 gap-2 border-t border-border pt-4">
        {AREA_IDS.map(a => (
          <li key={a} className="flex flex-col items-center gap-1 text-center">
            <AreaIcon area={a} size="sm" />
            <span className="text-sm font-semibold tabular-nums text-foreground">
              {estimate.perArea[a] == null ? '—' : `${estimate.perArea[a]}%`}
            </span>
            <span className="text-[10px] leading-tight text-muted-foreground">{AREA_INFO[a].short}</span>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-xs text-muted-foreground">
        {progress.totalXp} XP · {completedCount} {completedCount === 1 ? 'lección completada' : 'lecciones completadas'}
      </p>
    </section>
  );
}

function AreaCard({ module }: { module: typeof modules[0] }) {
  const { getModuleProgress } = useProgress();
  const pct = getModuleProgress(module.id, module.lessons.map(l => l.id));

  return (
    <Link href={`/${module.id}`} className="card group flex flex-col p-4 transition-colors hover:border-navy/30">
      <div className="flex items-start gap-3">
        <AreaIcon area={module.area} />
        <div className="min-w-0 flex-1">
          <h3 className="font-['Lexend'] text-[15px] font-semibold text-foreground">{module.title}</h3>
          <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{module.subtitle}</p>
        </div>
        <ChevronRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </div>
      <div className="mt-4 flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted" aria-hidden="true">
          <div className="progress-fill h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
        </div>
        <span className="text-xs tabular-nums text-muted-foreground">
          {pct > 0 ? `${pct}%` : `${module.lessons.length} lecciones`}
        </span>
      </div>
    </Link>
  );
}

const FACTS = [
  { icon: ListChecks, title: '254 preguntas con puntaje', text: 'En dos sesiones de 4 h 30 min.' },
  { icon: Gauge, title: 'Puntaje global de 0 a 500', text: 'Cada prueba va de 0 a 100.' },
  { icon: Scale, title: 'Inglés pesa menos', text: 'Las otras cuatro pruebas pesan el triple.' },
  { icon: CircleCheck, title: 'Sin penalización', text: 'Una respuesta incorrecta no resta.' },
];

function Inicio() {
  const { progress } = useProgress();
  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const completedCount = progress.completedLessons.filter(l => l.completed).length;
  const missedCount = Object.keys(progress.missedQuestions).length;
  const isNew = progress.totalXp === 0 && completedCount === 0;

  // La fecha se pone después de montar para que el HTML prerenderizado coincida.
  const [today, setToday] = useState('');
  useEffect(() => {
    setToday(new Intl.DateTimeFormat('es-CO', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'America/Bogota' }).format(new Date()));
  }, []);

  return (
    <div className="space-y-8">
      <header>
        <p className="eyebrow min-h-4 first-letter:uppercase">{today}</p>
        <h1 className="page-title mt-1">Tu plan de hoy</h1>
        <p className="mt-1 text-[15px] text-muted-foreground">
          {isNew
            ? 'Empieza por el reto: son unos cinco minutos entre lectura y práctica.'
            : `Llevas ${completedCount} de ${totalLessons} lecciones. Sigue con el reto de hoy.`}
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-5 lg:items-start">
        <div className="lg:col-span-3">
          <DailyChallengeCard />
        </div>
        <div className="space-y-4 lg:col-span-2">
          <GoalCard />
          <div className="grid grid-cols-2 gap-3">
            <Link href="/practica" className="btn-primary">
              <PenLine className="h-4 w-4" aria-hidden="true" /> Practicar
            </Link>
            <Link href="/simulacro" className="btn-secondary">
              <ClipboardList className="h-4 w-4" aria-hidden="true" /> Simulacro
            </Link>
          </div>
          {missedCount > 0 && (
            <Link href="/practica?repaso=1" className="card flex items-center gap-3 p-4 transition-colors hover:border-navy/30">
              <span className="icon-tile bg-red-50 text-red-700" aria-hidden="true">
                <RotateCcw className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-foreground">Repasar errores</span>
                <span className="block text-xs text-muted-foreground">
                  {missedCount} {missedCount === 1 ? 'pregunta pendiente' : 'preguntas pendientes'}
                </span>
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </Link>
          )}
        </div>
      </div>

      <section aria-labelledby="areas-titulo">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 id="areas-titulo" className="section-title">Áreas del Saber 11</h2>
          <Link href="/practica" className="btn-link">{BANK_TOTAL} preguntas</Link>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map(module => (
            <AreaCard key={module.id} module={module} />
          ))}
          <Link href="/practica?area=todas" className="card group flex flex-col p-4 transition-colors hover:border-navy/30">
            <div className="flex items-start gap-3">
              <span className="icon-tile bg-navy/5 text-navy" aria-hidden="true">
                <Shuffle className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="font-['Lexend'] text-[15px] font-semibold text-foreground">Práctica mixta</h3>
                <p className="mt-0.5 text-sm text-muted-foreground">Preguntas de las cinco áreas, como en el examen</p>
              </div>
              <ChevronRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </div>
          </Link>
        </div>
      </section>

      <section aria-labelledby="recursos-titulo">
        <h2 id="recursos-titulo" className="section-title mb-3">Recursos</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { href: '/glosario', icon: Library, title: 'Glosario', text: 'Términos explicados con palabras sencillas' },
            { href: '/tips', icon: Lightbulb, title: 'Estrategias', text: 'Cómo manejar el tiempo el día del examen' },
            { href: '/preguntas-frecuentes', icon: CircleHelp, title: 'Preguntas frecuentes', text: 'Fechas, puntajes y cómo funciona el examen' },
          ].map(({ href, icon: Icon, title, text }) => (
            <Link key={href} href={href} className="card flex items-center gap-3 p-4 transition-colors hover:border-navy/30">
              <span className="icon-tile bg-navy/5 text-navy" aria-hidden="true">
                <Icon className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-foreground">{title}</span>
                <span className="block text-xs text-muted-foreground">{text}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="saber-titulo" className="card p-5">
        <h2 id="saber-titulo" className="section-title">Así es el Saber 11</h2>
        <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {FACTS.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex items-start gap-3">
              <Icon className="mt-0.5 h-5 w-5 flex-shrink-0 text-navy" strokeWidth={1.75} aria-hidden="true" />
              <span>
                <span className="block text-sm font-semibold text-foreground">{title}</span>
                <span className="block text-xs text-muted-foreground">{text}</span>
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[11px] text-muted-foreground">
          Fuente: Guía de orientación Saber 11.° del ICFES. Consulta siempre la guía vigente en icfes.gov.co.
        </p>
      </section>
    </div>
  );
}

export default withMotion(Inicio);
