import { Link } from "wouter";
import { BarChart3, Flame, LogIn, Settings2, Target, Trophy } from "lucide-react";
import { useProgress } from "@/contexts/ProgressContext";
import { useAuth } from "@/contexts/AuthContext";
import DailyChallengeCard from "@/components/DailyChallengeCard";
import { ACCOUNTS_ENABLED } from "@/lib/accounts";

export default function Yo() {
  const { progress, estimate } = useProgress();
  const auth = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-['Lexend'] text-2xl font-bold text-foreground">Tu espacio</h1>
        <p className="mt-1 text-muted-foreground">Racha, meta y cuenta en un solo lugar.</p>
      </div>

      <DailyChallengeCard />

      <section className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Puntaje estimado</p>
          <p className="font-['Lexend'] text-3xl font-bold">{estimate.global ?? "—"}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Meta</p>
          <p className="font-['Lexend'] text-3xl font-bold">{progress.targetScore}</p>
          {progress.career ? <p className="mt-1 truncate text-xs text-muted-foreground">{progress.career}</p> : null}
        </div>
      </section>

      <nav className="space-y-2" aria-label="Accesos personales">
        <HubLink href="/analytics" icon={BarChart3} title="Mi progreso" subtitle="Aciertos por área" />
        <HubLink href="/logros" icon={Trophy} title="Logros" subtitle={`${progress.badges.length} insignias`} />
        <HubLink href="/meta" icon={Target} title="Editar meta" subtitle="Carrera y puntaje objetivo" />
        {ACCOUNTS_ENABLED && (
          <HubLink
            href="/cuenta"
            icon={auth.status === "ready" ? Settings2 : LogIn}
            title={auth.status === "ready" ? "Mi cuenta" : "Iniciar sesión"}
            subtitle={auth.email ?? "Guarda tu progreso en la nube"}
          />
        )}
        <HubLink href="/tips" icon={Flame} title="Estrategias" subtitle="Consejos para el día del examen" />
      </nav>
    </div>
  );
}

function HubLink({
  href,
  icon: Icon,
  title,
  subtitle,
}: {
  href: string;
  icon: typeof Flame;
  title: string;
  subtitle: string;
}) {
  return (
    <Link
      href={href}
      className="flex min-h-14 items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 hover:border-primary/30"
    >
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#1e3a5f]/8 text-[#1e3a5f]">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block font-semibold text-foreground">{title}</span>
        <span className="block truncate text-xs text-muted-foreground">{subtitle}</span>
      </span>
    </Link>
  );
}
