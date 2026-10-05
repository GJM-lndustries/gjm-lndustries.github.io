import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useProgress } from "@/contexts/ProgressContext";
import { useAuth } from "@/contexts/AuthContext";
import { Home, PenLine, ClipboardList, CircleUserRound, Star, Flame, BarChart3, Trophy, Library, Lightbulb } from "lucide-react";
import { AREA_STYLE } from "@/components/AreaIcon";
import { modules } from "@/lib/appData";
import { ACCOUNTS_ENABLED, accountInitial } from "@/lib/accounts";
import { SITE } from "@/config/site";
import { useConsent } from "@/contexts/ConsentContext";
import InstallPrompt from "@/components/InstallPrompt";

const mainNav = [
  { path: "/inicio", label: "Inicio", icon: Home },
  { path: "/practica", label: "Practicar", icon: PenLine },
  { path: "/simulacro", label: "Simulacro", icon: ClipboardList },
  { path: "/yo", label: "Yo", icon: CircleUserRound },
];

const areaNav = modules.map(m => ({ path: `/${m.id}`, label: m.title, icon: AREA_STYLE[m.area].icon }));

const moreNav = [
  { path: "/analytics", label: "Mi progreso", icon: BarChart3 },
  { path: "/logros", label: "Logros", icon: Trophy },
  { path: "/glosario", label: "Glosario", icon: Library },
  { path: "/tips", label: "Estrategias", icon: Lightbulb },
];

/** En móvil la barra inferior cubre la navegación; lo secundario vive en «Yo». */
const bottomNav = mainNav;

const footerLinks = [
  { path: "/practica", label: "Preguntas tipo ICFES" },
  { path: "/simulacro", label: "Simulacro gratis" },
  { path: "/preguntas-frecuentes", label: "Preguntas frecuentes" },
  { path: "/glosario", label: "Glosario" },
  { path: "/tips", label: "Estrategias" },
  { path: "/creditos", label: "Créditos de imágenes" },
];

const legalLinks = [
  { path: "/politica-de-privacidad", label: "Privacidad" },
  { path: "/tratamiento-de-datos", label: "Tratamiento de datos" },
  { path: "/terminos", label: "Términos" },
  { path: "/cookies", label: "Cookies" },
];

function SiteFooter() {
  const { openSettings } = useConsent();
  return (
    <footer className="mt-12 space-y-3 border-t border-border pt-5 pb-2 text-xs text-muted-foreground">
      <nav aria-label="Enlaces del sitio" className="flex flex-wrap gap-x-4 gap-y-2">
        {footerLinks.map(({ path, label }) => (
          <Link key={path} href={path} className="hover:text-foreground hover:underline underline-offset-2">
            {label}
          </Link>
        ))}
      </nav>
      <nav aria-label="Información legal" className="flex flex-wrap gap-x-4 gap-y-2">
        {legalLinks.map(({ path, label }) => (
          <Link key={path} href={path} className="hover:text-foreground hover:underline underline-offset-2">
            {label}
          </Link>
        ))}
        <button type="button" onClick={openSettings} className="hover:text-foreground hover:underline underline-offset-2">
          Configurar cookies
        </button>
      </nav>
      <p>
        {SITE.name} es un proyecto independiente y gratuito; no está afiliado al ICFES.{" "}
        <a href="https://www.icfes.gov.co/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-foreground">
          icfes.gov.co
        </a>
        .
      </p>
      <p>
        Hecho por <span className="font-semibold text-foreground">{SITE.author.name}</span>
      </p>
    </footer>
  );
}

function AccountChip() {
  const auth = useAuth();
  if (!ACCOUNTS_ENABLED) return null;
  const signedIn = auth.status === "ready" || auth.status === "needs-profile" || auth.status === "password-recovery";
  if (signedIn) {
    return (
      <Link
        href="/cuenta"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-navy text-sm font-semibold text-white"
        aria-label="Mi cuenta"
        title={auth.email ?? "Mi cuenta"}
      >
        {accountInitial(auth.email)}
      </Link>
    );
  }
  return (
    <Link
      href="/cuenta"
      className="inline-flex min-h-9 items-center rounded-full border border-border bg-card px-3.5 text-[13px] font-semibold text-navy hover:bg-muted"
      data-testid="header-login"
    >
      Iniciar sesión
    </Link>
  );
}

function StreakChip() {
  const { progress } = useProgress();
  const n = progress.streakState?.current ?? progress.streak;
  return (
    <Link
      href="/yo"
      className="inline-flex min-h-9 items-center gap-1 rounded-full bg-orange-50 px-3 text-[13px] font-semibold text-orange-700 hover:bg-orange-100"
      aria-label={`Racha de ${n} ${n === 1 ? "día" : "días"}`}
    >
      <Flame className="h-4 w-4" aria-hidden="true" />
      {n}
    </Link>
  );
}

function SideLink({ path, label, icon: Icon, active }: { path: string; label: string; icon: typeof Home; active: boolean }) {
  return (
    <Link href={path} className={`nav-item ${active ? "active" : ""}`} aria-current={active ? "page" : undefined}>
      <Icon className="h-[18px] w-[18px] flex-shrink-0" strokeWidth={1.75} aria-hidden="true" />
      <span>{label}</span>
    </Link>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { progress, estimate } = useProgress();

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [location]);

  const isActive = (path: string) => location === path || (path !== "/inicio" && location.startsWith(path + "/"));

  return (
    <div className="flex min-h-screen bg-background">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-[60] focus:rounded-lg focus:bg-card focus:px-3 focus:py-2 focus:text-foreground"
      >
        Saltar al contenido
      </a>

      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col bg-sidebar lg:flex">
        <div className="px-5 pb-4 pt-5">
          <Link href="/inicio" className="flex items-center gap-2.5">
            <img src="/icon.svg" alt="" width={32} height={32} className="h-8 w-8" />
            <span className="font-['Lexend'] text-lg font-bold text-sidebar-foreground">ProICFES</span>
          </Link>
        </div>
        <nav aria-label="Navegación principal" className="flex-1 overflow-y-auto px-3 pb-3">
          <div className="space-y-0.5">
            {mainNav.map(item => (
              <SideLink key={item.path} {...item} active={isActive(item.path)} />
            ))}
          </div>
          <p className="mb-1 mt-5 px-3 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/65">Áreas</p>
          <div className="space-y-0.5">
            {areaNav.map(item => (
              <SideLink key={item.path} {...item} active={isActive(item.path)} />
            ))}
          </div>
          <p className="mb-1 mt-5 px-3 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/65">Más</p>
          <div className="space-y-0.5">
            {moreNav.map(item => (
              <SideLink key={item.path} {...item} active={isActive(item.path)} />
            ))}
          </div>
        </nav>
        <div className="mx-3 mb-4 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-sidebar-border bg-sidebar-border">
          <div className="bg-sidebar px-3 py-2.5">
            <p className="text-[11px] text-sidebar-foreground/70">Puntaje estimado</p>
            <p className="font-['Lexend'] text-xl font-semibold text-sidebar-foreground">{estimate.global ?? "—"}</p>
          </div>
          <div className="bg-sidebar px-3 py-2.5">
            <p className="flex items-center gap-1 text-[11px] text-sidebar-foreground/70">
              <Star className="h-3 w-3" aria-hidden="true" /> Experiencia
            </p>
            <p className="font-['Lexend'] text-xl font-semibold text-sidebar-foreground">{progress.totalXp} XP</p>
          </div>
        </div>
      </aside>

      <header className="fixed left-0 right-0 top-0 z-50 border-b border-border bg-card/95 backdrop-blur lg:hidden">
        <div className="flex h-14 items-center justify-between gap-2 px-4">
          <Link href="/inicio" className="flex min-h-11 items-center gap-2" aria-label="ProICFES, ir al inicio">
            <img src="/icon.svg" alt="" width={28} height={28} className="h-7 w-7" />
            <span className="font-['Lexend'] text-[17px] font-bold text-ink">ProICFES</span>
          </Link>
          <div className="flex items-center gap-2">
            <StreakChip />
            <AccountChip />
          </div>
        </div>
      </header>

      <main id="contenido" className="min-h-screen min-w-0 flex-1 pb-24 pt-16 lg:ml-64 lg:pb-0 lg:pt-0">
        <div className="sticky top-0 z-30 hidden h-14 items-center justify-end gap-2 border-b border-border bg-background/90 px-6 backdrop-blur lg:flex">
          <StreakChip />
          <AccountChip />
        </div>
        <div className="mx-auto max-w-5xl px-4 py-6 lg:px-8 lg:py-8">
          {children}
          <SiteFooter />
        </div>
      </main>

      <nav
        aria-label="Navegación rápida"
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
      >
        <div className="grid grid-cols-4">
          {bottomNav.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              href={path}
              aria-current={isActive(path) ? "page" : undefined}
              className={`relative flex min-h-[56px] flex-col items-center justify-center gap-1 px-1 py-2 transition-colors ${
                isActive(path) ? "text-navy" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {isActive(path) && <span className="absolute top-0 h-0.5 w-8 rounded-full bg-brand" aria-hidden="true" />}
              <Icon className="h-5 w-5" strokeWidth={isActive(path) ? 2.25 : 1.75} aria-hidden="true" />
              <span className={`text-center text-[11px] leading-tight ${isActive(path) ? "font-semibold" : "font-medium"}`}>{label}</span>
            </Link>
          ))}
        </div>
      </nav>

      <InstallPrompt />
    </div>
  );
}
