import { Link } from "wouter";
import {
  BarChart3, BookOpenText, ChevronRight, CircleHelp, CircleUserRound, CloudUpload, Flame, Library, Lightbulb,
  Pencil, Star, Target, type LucideIcon,
} from "lucide-react";
import { useProgress } from "@/contexts/ProgressContext";
import { useAuth } from "@/contexts/AuthContext";
import { ACCOUNTS_ENABLED, accountInitial } from "@/lib/accounts";
import { modules } from "@/lib/appData";
import { AREA_INFO } from "@/data/questions/meta";
import AreaIcon from "@/components/AreaIcon";
import GoalBar from "@/components/GoalBar";
import { allBadges, BadgeCard, earnedBadgeIds } from "@/components/Badges";
import { weekProgress } from "@/lib/streaks";
import { useNow } from "@/hooks/useNow";
import { TRAPS, type TrapType } from "@/data/questions/types";

/** «Yo»: racha, meta, avance por área e insignias en una sola pantalla (antes: Yo + Mi progreso + Logros). */
export default function Yo() {
  const { progress, estimate } = useProgress();
  const auth = useAuth();
  const now = useNow();
  const signedIn = auth.status === "ready" || auth.status === "needs-profile" || auth.status === "password-recovery";
  const s = progress.streakState;
  const wp = weekProgress(s, now ?? undefined);
  const from = estimate.global ?? progress.diagnostic?.estimate ?? null;
  const gap = from != null ? Math.max(0, progress.targetScore - from) : null;
  const earned = earnedBadgeIds(progress);
  // Ganadas primero; de las bloqueadas solo se muestran las dos más cercanas (sin muro de candados).
  const badges = [...allBadges.filter(b => earned.has(b.id)), ...allBadges.filter(b => !earned.has(b.id)).slice(0, earned.size === 0 ? 3 : 2)];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="page-title">Yo</h1>
        <p className="mt-1 text-[15px] text-muted-foreground">Tu meta, tu semana y lo que llevas.</p>
      </header>

      <section className="card p-5" aria-labelledby="yo-meta" data-testid="yo-meta">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="eyebrow">Tu meta{progress.career ? ` · ${progress.career}` : ""}</p>
            <h2 id="yo-meta" className="mt-1 font-['Lexend'] text-xl font-semibold text-foreground">
              {gap == null ? `${progress.targetScore} puntos` : gap === 0 ? "Ya alcanzas tu meta" : `Te faltan ${gap} puntos`}
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {from == null ? "Haz la mini prueba para saber desde dónde partes." : `Vas en unos ${from} de ${progress.targetScore}.`}
            </p>
          </div>
          <Link href="/meta" className="-mr-2 inline-flex min-h-10 flex-shrink-0 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-navy hover:bg-muted" aria-label="Editar meta">
            <Pencil className="h-4 w-4" aria-hidden="true" /> Editar
          </Link>
        </div>
        {from != null ? (
          <GoalBar from={from} target={progress.targetScore} />
        ) : (
          <Link href="/meta?paso=diagnostico" className="btn-secondary btn-sm mt-4">Hacer la mini prueba (5 min)</Link>
        )}
      </section>

      <section aria-label="Resumen" className="grid grid-cols-3 gap-3">
        <Stat icon={Flame} tile="bg-orange-50 text-orange-700" label="Esta semana" value={`${wp.done}/${wp.goal}`} note={`Racha: ${s.current} ${s.current === 1 ? "día" : "días"}`} />
        <Stat icon={Star} tile="bg-violet-50 text-violet-700" label="Experiencia" value={`${progress.totalXp}`} note="XP" />
        <Stat icon={Target} tile="bg-brand-soft text-green-700" label="Lecciones" value={`${progress.completedLessons.filter(l => l.completed).length}`} note={`de ${modules.reduce((n, m) => n + m.lessons.length, 0)}`} />
      </section>

      <section aria-labelledby="yo-areas">
        <h2 id="yo-areas" className="eyebrow mb-2 px-1">Tu avance por área</h2>
        <ul className="card divide-y divide-border overflow-hidden">
          {modules.map(m => {
            const ids = m.lessons.map(l => l.id);
            const done = ids.filter(id => progress.completedLessons.some(l => l.lessonId === id && l.completed)).length;
            const acc = estimate.perArea[m.area];
            const answered = progress.areaStats[m.area]?.answered ?? 0;
            return (
              <li key={m.id}>
                <Link href={`/${m.id}`} className="flex min-h-14 items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50">
                  <AreaIcon area={m.area} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-[15px] font-semibold text-foreground">{AREA_INFO[m.area].label}</span>
                      <span className="flex-shrink-0 text-xs tabular-nums text-muted-foreground">{done}/{ids.length} lecciones</span>
                    </span>
                    <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden="true">
                      <span className="progress-fill block h-full rounded-full bg-brand" style={{ width: `${ids.length ? (done / ids.length) * 100 : 0}%` }} />
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {acc != null ? `${acc} % de aciertos` : answered > 0 ? `${answered} ${answered === 1 ? "respuesta" : "respuestas"}, aún sin estimado` : "Aún sin práctica"}
                    </span>
                  </span>
                  <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <TrapsCard />

      <section aria-labelledby="yo-insignias">
        <div className="mb-2 flex items-baseline justify-between px-1">
          <h2 id="yo-insignias" className="eyebrow">Insignias</h2>
          <span className="text-xs text-muted-foreground">{earned.size} de {allBadges.length}</span>
        </div>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {badges.map(b => <BadgeCard key={b.id} badge={b} earned={earned.has(b.id)} />)}
        </ul>
      </section>

      {progress.simulacroScores.length > 0 && (
        <section aria-labelledby="yo-simulacros">
          <h2 id="yo-simulacros" className="eyebrow mb-2 px-1">Simulacros</h2>
          <div className="card space-y-2 p-4">
            {progress.simulacroScores.slice(-5).map((score, i, arr) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-24 text-xs text-muted-foreground">Simulacro {progress.simulacroScores.length - arr.length + i + 1}</span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted" aria-hidden="true">
                  <span className="block h-full rounded-full bg-navy" style={{ width: `${score}%` }} />
                </span>
                <span className="w-12 text-right text-sm font-semibold tabular-nums">{Math.round(score)} %</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {ACCOUNTS_ENABLED && (
        <Link href="/cuenta" className="card flex items-center gap-4 p-4 transition-colors hover:border-navy/30" data-testid="yo-cuenta">
          {signedIn ? (
            <span className="inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-navy font-['Lexend'] text-lg font-semibold text-white">
              {accountInitial(auth.email)}
            </span>
          ) : (
            <span className="icon-tile h-12 w-12 rounded-full bg-muted text-muted-foreground" aria-hidden="true">
              {progress.streakState.days.length > 0 ? <CloudUpload className="h-6 w-6" strokeWidth={1.75} /> : <CircleUserRound className="h-6 w-6" strokeWidth={1.75} />}
            </span>
          )}
          <span className="min-w-0 flex-1">
            <span className="block font-semibold text-foreground">{signedIn ? "Mi cuenta" : "Guardar mi progreso"}</span>
            <span className="block truncate text-sm text-muted-foreground">
              {signedIn ? auth.email : "Opcional: crea una cuenta o inicia sesión"}
            </span>
          </span>
          <ChevronRight className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
        </Link>
      )}

      <LinkGroup title="Recursos">
        <HubLink href="/analytics" icon={BarChart3} title="Detalle de aciertos" subtitle="Gráficas por área y simulacros" />
        <HubLink href="/glosario" icon={Library} title="Glosario" subtitle="Términos con palabras sencillas" />
        <HubLink href="/tips" icon={Lightbulb} title="Estrategias" subtitle="Consejos para el día del examen" />
        <HubLink href="/preguntas-frecuentes" icon={CircleHelp} title="Preguntas frecuentes" subtitle="Fechas, puntajes y resultados" />
        <HubLink href="/" icon={BookOpenText} title="Qué es ProICFES" subtitle="Cómo funciona y quién lo hace" />
      </LinkGroup>
    </div>
  );
}

function Stat({ icon: Icon, tile, label, value, note }: { icon: LucideIcon; tile: string; label: string; value: string; note: string }) {
  return (
    <div className="card min-w-0 p-3">
      <span className={`icon-tile h-8 w-8 rounded-lg ${tile}`} aria-hidden="true">
        <Icon className="h-4 w-4" strokeWidth={1.75} />
      </span>
      <p className="mt-2 truncate text-xs text-muted-foreground">{label}</p>
      <p className="font-['Lexend'] text-2xl font-semibold tabular-nums text-foreground">{value}</p>
      <p className="truncate text-[11px] text-muted-foreground">{note}</p>
    </div>
  );
}

function LinkGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="eyebrow mb-2 px-1">{title}</h2>
      <nav aria-label={title} className="card divide-y divide-border overflow-hidden">
        {children}
      </nav>
    </section>
  );
}

function HubLink({ href, icon: Icon, title, subtitle }: { href: string; icon: LucideIcon; title: string; subtitle: string }) {
  return (
    <Link href={href} className="flex min-h-14 items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50">
      <span className="icon-tile bg-navy/5 text-navy" aria-hidden="true">
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold text-foreground">{title}</span>
        <span className="block truncate text-xs text-muted-foreground">{subtitle}</span>
      </span>
      <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" aria-hidden="true" />
    </Link>
  );
}

/** «Tus trampas más comunes»: en qué tipo de opción equivocada cae más. Solo aparece con datos. */
function TrapsCard() {
  const { progress } = useProgress();
  const top = (Object.entries(progress.trapStats ?? {}) as [TrapType, number][])
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  if (top.length === 0) return null;
  return (
    <section aria-labelledby="yo-trampas" data-testid="yo-trampas">
      <h2 id="yo-trampas" className="eyebrow mb-2 px-1">Tus trampas más comunes</h2>
      <ul className="card divide-y divide-border overflow-hidden">
        {top.map(([t, n]) => (
          <li key={t} className="flex items-start gap-3 px-4 py-3">
            <span className="min-w-0 flex-1">
              <span className="flex items-baseline justify-between gap-2">
                <span className="text-[15px] font-semibold text-foreground">{TRAPS[t].nombre}</span>
                <span className="flex-shrink-0 text-xs tabular-nums text-muted-foreground">{n} {n === 1 ? "vez" : "veces"}</span>
              </span>
              <span className="mt-0.5 block text-xs text-muted-foreground">{TRAPS[t].idea}</span>
              <Link href={`/practica?trampa=${t}`} className="mt-1.5 inline-flex min-h-9 items-center gap-1 text-sm font-semibold text-navy underline-offset-2 hover:underline">
                Practicar 5 con esta trampa <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
