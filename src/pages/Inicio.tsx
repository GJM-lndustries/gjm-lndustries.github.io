import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { useProgress } from '@/contexts/ProgressContext';
import { useAuth } from '@/contexts/AuthContext';
import { modules } from '@/lib/appData';
import { AREA_INFO } from '@/data/questions/meta';
import { AREA_IDS } from '@/data/questions/types';
import { ChevronDown, ChevronRight, ClipboardList, PenLine, RotateCcw, Shuffle, Sparkles, Star, CloudUpload, X } from 'lucide-react';
import DailyChallengeCard, { WeekCard } from '@/components/DailyChallengeCard';
import CalendarReminder from '@/components/CalendarReminder';
import { CountdownChip } from '@/components/AppLayout';
import AreaIcon from '@/components/AreaIcon';
import GoalBar from '@/components/GoalBar';
import { withMotion } from '@/components/withMotion';
import { ACCOUNTS_ENABLED } from '@/lib/accounts';
import { intentionSentence } from '@/lib/plan';
import { DAILY_XP_CAP, xpToday } from '@/lib/xp';

/** «Te faltan X»: distancia a la meta con el estimado (o el punto de partida de la mini prueba). */
function GoalCard() {
  const { estimate, progress } = useProgress();
  const target = progress.targetScore;
  const from = estimate.global ?? progress.diagnostic?.estimate ?? null;
  const source = estimate.global != null ? 'estimado con tus respuestas' : 'punto de partida de tu mini prueba';
  const gap = from == null ? null : target - from;
  const xp = xpToday(progress.xpDay);
  const areasWithData = AREA_IDS.filter(a => estimate.perArea[a] != null);

  return (
    <section aria-labelledby="meta-titulo" className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="eyebrow">Tu meta: {target} puntos</p>
        <Link href="/meta" className="btn-link -mt-1">Editar</Link>
      </div>
      {from == null ? (
        <>
          <h2 id="meta-titulo" className="section-title mt-1">¿Dónde estás hoy?</h2>
          <p className="mt-1 text-sm text-muted-foreground">Haz la mini prueba de 5 preguntas y te mostramos cuánto te falta para tu meta.</p>
          <Link href="/meta?paso=diagnostico" className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-navy underline-offset-2 hover:underline">
            <Sparkles className="h-4 w-4" aria-hidden="true" /> Hacer la mini prueba (5 min)
          </Link>
        </>
      ) : (
        <>
          <h2 id="meta-titulo" className="section-title mt-1" data-testid="te-faltan">
            {gap! > 0 ? <>Te faltan <span className="tabular-nums">{gap}</span> puntos</> : 'Ya llegaste a tu meta'}
          </h2>
          <GoalBar from={from} target={target} className="mt-3" />
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Vas en <strong className="text-foreground tabular-nums">{from}</strong> de 500 ({source}). Es un estimado con la ponderación oficial, no un resultado del ICFES.
          </p>
          {areasWithData.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {areasWithData.map(a => (
                <li key={a} className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs text-foreground">
                  {AREA_INFO[a].short} <strong className="tabular-nums">{estimate.perArea[a]}%</strong>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
      {(progress.totalXp > 0 || xp > 0) && (
        <div className="mt-4 border-t border-border pt-3">
          <div className="flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1 text-muted-foreground"><Star className="h-3.5 w-3.5" aria-hidden="true" /> XP de hoy</span>
            <span className="tabular-nums text-foreground"><strong>{xp}</strong> de {DAILY_XP_CAP} · total {progress.totalXp}</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden="true">
            <div className="progress-fill h-full rounded-full bg-amber-400" style={{ width: `${Math.min(100, (xp / DAILY_XP_CAP) * 100)}%` }} />
          </div>
          {xp >= DAILY_XP_CAP && <p className="mt-1.5 text-xs text-muted-foreground">Ya ganaste todo el XP de hoy. Descansa: mañana hay más.</p>}
        </div>
      )}
    </section>
  );
}

/** Invitación a crear cuenta en el momento en que tiene valor: cuando ya hay una racha que guardar. */
function AccountPrompt() {
  const { progress, loaded, dismissAccountPrompt } = useProgress();
  const auth = useAuth();
  const signedIn = auth.status === 'ready' || auth.status === 'needs-profile' || auth.status === 'password-recovery';
  const days = progress.streakState.days.length;
  const dismissed = progress.accountPromptDismissed;
  const recentlyDismissed = dismissed && (Date.now() - new Date(dismissed).getTime()) / 86400000 < 7;
  if (!ACCOUNTS_ENABLED || !loaded || signedIn || auth.status === 'loading' || days < 1 || recentlyDismissed) return null;
  const n = Math.max(progress.streakState.current, 1);
  return (
    <section className="card flex items-start gap-3 p-4" aria-labelledby="cuenta-invita" data-testid="cuenta-invita">
      <span className="icon-tile bg-navy/5 text-navy" aria-hidden="true"><CloudUpload className="h-5 w-5" strokeWidth={1.75} /></span>
      <div className="min-w-0 flex-1">
        <h2 id="cuenta-invita" className="text-[15px] font-semibold text-foreground">
          {n === 1 ? 'Ya tienes tu primer día. ¿Lo guardamos?' : `Llevas ${n} días. ¿Guardamos tu racha?`}
        </h2>
        <p className="mt-0.5 text-sm text-muted-foreground">Con una cuenta gratis no pierdes tu progreso si cambias de celular. Es opcional.</p>
        <Link href="/cuenta" className="mt-2 inline-flex min-h-10 items-center gap-1 text-sm font-semibold text-navy underline-offset-2 hover:underline">
          Crear cuenta <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
      <button type="button" onClick={dismissAccountPrompt} className="-m-1 rounded-lg p-2 text-muted-foreground hover:bg-muted" aria-label="Ahora no">
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </section>
  );
}

function AreaCard({ module }: { module: typeof modules[0] }) {
  const { getModuleProgress } = useProgress();
  const pct = getModuleProgress(module.id, module.lessons.map(l => l.id));
  return (
    <Link href={`/${module.id}`} className="card group flex items-center gap-3 p-4 transition-colors hover:border-navy/30">
      <AreaIcon area={module.area} />
      <span className="min-w-0 flex-1">
        <span className="block font-['Lexend'] text-[15px] font-semibold text-foreground">{module.title}</span>
        <span className="block text-xs text-muted-foreground">{pct > 0 ? `${pct}% de las lecciones` : `${module.lessons.length} lecciones cortas`}</span>
      </span>
      <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" aria-hidden="true" />
    </Link>
  );
}

function Inicio() {
  const { progress } = useProgress();
  const missedCount = Object.keys(progress.missedQuestions).length;
  const plan = progress.plan;

  // La fecha se pone después de montar para que el HTML prerenderizado coincida.
  const [today, setToday] = useState('');
  useEffect(() => {
    setToday(new Intl.DateTimeFormat('es-CO', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'America/Bogota' }).format(new Date()));
  }, []);

  return (
    <div className="mx-auto max-w-2xl space-y-5 lg:grid lg:max-w-none lg:grid-cols-[minmax(0,1fr)_21rem] lg:items-start lg:gap-x-6 lg:gap-y-5 lg:space-y-0 xl:grid-cols-[minmax(0,1fr)_23rem]">
      <div className="space-y-5 lg:col-start-1">
        <header>
          <p className="eyebrow min-h-4 first-letter:uppercase">{today}</p>
          <h1 className="page-title mt-1">Tu plan de hoy</h1>
          <p className="mt-1 text-[15px] text-muted-foreground">
            {plan?.studyMoment ? intentionSentence(plan.dailyMinutes, plan.studyMoment) : 'Unos 5 minutos entre lectura y práctica.'}
          </p>
          {/* En móvil la cuenta regresiva vive aquí (el encabezado móvil se queda compacto). */}
          <div className="mt-2 min-h-9 lg:hidden"><CountdownChip className="-ml-3" /></div>
        </header>
        <DailyChallengeCard />
      </div>

      <aside className="space-y-5 lg:sticky lg:top-20 lg:col-start-2 lg:row-span-2 lg:row-start-1" aria-label="Tu meta y tu semana" data-testid="inicio-lateral">
        <GoalCard />
        <WeekCard />
        <CalendarReminder />
      </aside>

      <div className="space-y-5 lg:col-start-1">
        <AccountPrompt />

      {missedCount > 0 && (
        <Link href="/practica?repaso=1" className="card flex items-center gap-3 p-4 transition-colors hover:border-navy/30">
          <span className="icon-tile bg-amber-50 text-amber-700" aria-hidden="true">
            <RotateCcw className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-foreground">Repasar lo que fallaste</span>
            <span className="block text-xs text-muted-foreground">
              {missedCount} {missedCount === 1 ? 'pregunta' : 'preguntas'} para volver a intentar
            </span>
          </span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        </Link>
      )}

      <details className="group" aria-labelledby="areas-titulo">
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between rounded-xl px-1 [&::-webkit-details-marker]:hidden">
          <h2 id="areas-titulo" className="section-title">Más para practicar</h2>
          <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden="true" />
        </summary>
        <div className="mt-2 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Link href="/practica" className="btn-secondary"><PenLine className="h-4 w-4" aria-hidden="true" /> Práctica libre</Link>
            <Link href="/simulacro" className="btn-secondary"><ClipboardList className="h-4 w-4" aria-hidden="true" /> Simulacro</Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {modules.map(module => <AreaCard key={module.id} module={module} />)}
            <Link href="/practica?area=todas" className="card group flex items-center gap-3 p-4 transition-colors hover:border-navy/30">
              <span className="icon-tile bg-navy/5 text-navy" aria-hidden="true"><Shuffle className="h-5 w-5" strokeWidth={1.75} /></span>
              <span className="min-w-0 flex-1">
                <span className="block font-['Lexend'] text-[15px] font-semibold text-foreground">Práctica mixta</span>
                <span className="block text-xs text-muted-foreground">Las cinco áreas, como en el examen</span>
              </span>
              <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </details>
      </div>
    </div>
  );
}

export default withMotion(Inicio);
