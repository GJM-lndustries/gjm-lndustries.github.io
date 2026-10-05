import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useProgress } from "@/contexts/ProgressContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  Home,
  PenLine,
  BarChart3,
  User,
  Menu,
  X,
  Star,
  Flame,
  BookOpen,
  Library,
  Lightbulb,
  Trophy,
  Calculator,
  FlaskConical,
  Map,
  Globe,
} from "lucide-react";
import { ACCOUNTS_ENABLED, accountInitial } from "@/lib/accounts";
import { SITE } from "@/config/site";
import { useConsent } from "@/contexts/ConsentContext";
import InstallPrompt from "@/components/InstallPrompt";

const sideNav = [
  { path: "/inicio", label: "Inicio", icon: Home },
  { path: "/practica", label: "Practicar", icon: PenLine },
  { path: "/matematicas", label: "Matemáticas", icon: Calculator },
  { path: "/lectura", label: "Lectura Crítica", icon: BookOpen },
  { path: "/ciencias", label: "Ciencias Naturales", icon: FlaskConical },
  { path: "/sociales", label: "Sociales y Ciudadanas", icon: Map },
  { path: "/ingles", label: "Inglés", icon: Globe },
  { path: "/simulacro", label: "Simulacro", icon: BarChart3 },
  { path: "/yo", label: "Yo", icon: User },
  { path: "/analytics", label: "Mi progreso", icon: Trophy },
  { path: "/logros", label: "Logros", icon: Star },
  { path: "/glosario", label: "Glosario", icon: Library },
  { path: "/tips", label: "Estrategias", icon: Lightbulb },
  ...(ACCOUNTS_ENABLED ? [{ path: "/cuenta", label: "Cuenta", icon: User }] : []),
];

const bottomNav = [
  { path: "/inicio", label: "Inicio", icon: Home },
  { path: "/practica", label: "Practicar", icon: PenLine },
  { path: "/simulacro", label: "Simulacro", icon: BarChart3 },
  { path: "/yo", label: "Yo", icon: User },
];

const footerLinks = [
  { path: "/practica", label: "Preguntas tipo ICFES" },
  { path: "/simulacro", label: "Simulacro gratis" },
  { path: "/preguntas-frecuentes", label: "Preguntas frecuentes" },
  { path: "/glosario", label: "Glosario" },
  { path: "/tips", label: "Estrategias" },
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
        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#4ade80] text-sm font-bold text-[#0f2040]"
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
      className="inline-flex min-h-9 items-center rounded-full bg-[#4ade80] px-3 text-xs font-bold text-[#0f2040]"
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
      className="inline-flex items-center gap-1 rounded-full bg-orange-500/15 px-2.5 py-1.5 text-xs font-bold text-orange-600"
      aria-label={`Racha de ${n} días`}
    >
      <Flame className="h-3.5 w-3.5" aria-hidden="true" />
      {n}
    </Link>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { progress, estimate } = useProgress();

  useEffect(() => {
    setMobileMenuOpen(false);
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
        <div className="border-b border-sidebar-border p-4">
          <Link href="/inicio" className="flex items-center gap-2.5">
            <img src="/icon.svg" alt="" width={36} height={36} className="h-9 w-9" />
            <span className="font-['Lexend'] text-lg font-bold text-sidebar-foreground">ProICFES</span>
          </Link>
        </div>
        <div className="flex items-center gap-2 border-b border-sidebar-border px-4 py-3 text-sidebar-foreground/80">
          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" aria-hidden="true" />
          <span className="text-sm">{progress.totalXp} XP</span>
          <span className="ml-auto inline-flex items-center gap-1 text-xs font-bold text-orange-300">
            <Flame className="h-3.5 w-3.5" aria-hidden="true" />
            {progress.streakState?.current ?? progress.streak}
          </span>
        </div>
        <nav aria-label="Navegación principal" className="flex-1 space-y-1 overflow-y-auto p-3">
          {sideNav.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              href={path}
              className={`nav-item ${isActive(path) ? "active" : ""}`}
              aria-current={isActive(path) ? "page" : undefined}
            >
              <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
              <span className="text-sm">{label}</span>
            </Link>
          ))}
        </nav>
        <div className="mx-4 mb-4 rounded-xl border border-sidebar-border bg-sidebar-accent/50 p-3">
          <p className="text-xs text-sidebar-foreground/70">Puntaje estimado</p>
          <p className="font-['Lexend'] text-2xl font-bold text-sidebar-foreground">{estimate.global ?? "—"}</p>
        </div>
      </aside>

      <header className="fixed left-0 right-0 top-0 z-50 border-b border-sidebar-border bg-sidebar lg:hidden">
        <div className="flex items-center justify-between gap-2 px-3 py-2.5">
          <Link href="/inicio" className="flex min-h-11 items-center gap-2">
            <img src="/icon.svg" alt="" width={32} height={32} className="h-8 w-8" />
            <span className="font-['Lexend'] text-lg font-bold text-sidebar-foreground">ProICFES</span>
          </Link>
          <div className="flex items-center gap-2">
            <StreakChip />
            <AccountChip />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(o => !o)}
              className="p-2 text-sidebar-foreground"
              aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={mobileMenuOpen}
              aria-controls="menu-movil"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div
            id="menu-movil"
            className="absolute left-0 right-0 top-14 max-h-[calc(100vh-3.5rem)] overflow-y-auto border-b border-sidebar-border bg-sidebar p-4"
            onClick={e => e.stopPropagation()}
          >
            <nav aria-label="Menú" className="space-y-1">
              {sideNav.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  href={path}
                  className={`nav-item ${isActive(path) ? "active" : ""}`}
                  aria-current={isActive(path) ? "page" : undefined}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  <span>{label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      <main id="contenido" className="min-h-screen flex-1 pb-24 pt-16 lg:ml-64 lg:pb-0 lg:pt-0">
        <div className="sticky top-0 z-30 hidden items-center justify-end gap-3 border-b border-border/60 bg-background/90 px-4 py-3 backdrop-blur lg:flex">
          <StreakChip />
          <AccountChip />
        </div>
        <div className="mx-auto max-w-5xl px-4 py-6">
          {children}
          <SiteFooter />
        </div>
      </main>

      <nav
        aria-label="Navegación rápida"
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-sidebar-border bg-sidebar pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        <div className="grid grid-cols-4">
          {bottomNav.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              href={path}
              aria-current={isActive(path) ? "page" : undefined}
              className={`flex min-h-[56px] flex-col items-center justify-center gap-1 px-1 py-2 transition-colors ${
                isActive(path) ? "text-sidebar-primary" : "text-sidebar-foreground/70 hover:text-sidebar-foreground"
              }`}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span className="text-center text-[11px] font-medium leading-tight">{label}</span>
            </Link>
          ))}
        </div>
      </nav>

      <InstallPrompt />
    </div>
  );
}
