import { Link } from "wouter";
import {
  BarChart3, BookOpenText, ChevronRight, CircleHelp, CircleUserRound, Flame, Library, Lightbulb,
  LogIn, Target, Trophy, type LucideIcon,
} from "lucide-react";
import { useProgress } from "@/contexts/ProgressContext";
import { useAuth } from "@/contexts/AuthContext";
import { ACCOUNTS_ENABLED, accountInitial } from "@/lib/accounts";
import { modules } from "@/lib/appData";
import AreaIcon from "@/components/AreaIcon";

export default function Yo() {
  const { progress, estimate } = useProgress();
  const auth = useAuth();
  const signedIn = auth.status === "ready" || auth.status === "needs-profile" || auth.status === "password-recovery";
  const s = progress.streakState;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="page-title">Yo</h1>
        <p className="mt-1 text-[15px] text-muted-foreground">Tu racha, tu meta y tu cuenta.</p>
      </header>

      {ACCOUNTS_ENABLED && (
        <Link href="/cuenta" className="card flex items-center gap-4 p-4 transition-colors hover:border-navy/30">
          {signedIn ? (
            <span className="inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-navy font-['Lexend'] text-lg font-semibold text-white">
              {accountInitial(auth.email)}
            </span>
          ) : (
            <span className="icon-tile h-12 w-12 rounded-full bg-muted text-muted-foreground" aria-hidden="true">
              <CircleUserRound className="h-6 w-6" strokeWidth={1.75} />
            </span>
          )}
          <span className="min-w-0 flex-1">
            <span className="block font-semibold text-foreground">{signedIn ? "Mi cuenta" : "Iniciar sesión"}</span>
            <span className="block truncate text-sm text-muted-foreground">
              {signedIn ? auth.email : "Guarda tu progreso y úsalo en cualquier dispositivo"}
            </span>
          </span>
          {signedIn ? (
            <ChevronRight className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          ) : (
            <LogIn className="h-5 w-5 text-navy" aria-hidden="true" />
          )}
        </Link>
      )}

      <section aria-label="Resumen" className="grid grid-cols-3 gap-3">
        <Stat icon={Flame} tile="bg-orange-50 text-orange-700" label="Racha" value={`${s.current}`} note={`Mejor: ${s.longest}`} />
        <Stat icon={Target} tile="bg-brand-soft text-green-700" label="Meta" value={`${progress.targetScore}`} note={progress.career ?? "Puntaje"} />
        <Stat icon={BarChart3} tile="bg-navy/5 text-navy" label="Estimado" value={`${estimate.global ?? "—"}`} note="de 500" />
      </section>

      <LinkGroup title="Tu avance">
        <HubLink href="/analytics" icon={BarChart3} title="Mi progreso" subtitle="Aciertos y lecciones por área" />
        <HubLink href="/logros" icon={Trophy} title="Logros" subtitle={`${progress.badges.length} ${progress.badges.length === 1 ? "insignia" : "insignias"}`} />
        <HubLink href="/meta" icon={Target} title="Editar meta" subtitle="Carrera y puntaje objetivo" />
      </LinkGroup>

      <LinkGroup title="Áreas">
        {modules.map(m => (
          <HubLink key={m.id} href={`/${m.id}`} tile={<AreaIcon area={m.area} />} title={m.title} subtitle={`${m.lessons.length} lecciones`} />
        ))}
      </LinkGroup>

      <LinkGroup title="Recursos">
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
      <p className="mt-2 text-xs text-muted-foreground">{label}</p>
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

function HubLink({
  href,
  icon: Icon,
  tile,
  title,
  subtitle,
}: {
  href: string;
  icon?: LucideIcon;
  tile?: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <Link href={href} className="flex min-h-14 items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50">
      {tile ?? (
        <span className="icon-tile bg-navy/5 text-navy" aria-hidden="true">
          {Icon ? <Icon className="h-5 w-5" strokeWidth={1.75} /> : null}
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold text-foreground">{title}</span>
        <span className="block truncate text-xs text-muted-foreground">{subtitle}</span>
      </span>
      <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" aria-hidden="true" />
    </Link>
  );
}
