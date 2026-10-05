import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useProgress } from '@/contexts/ProgressContext';
import {
  Home, BookOpen, FlaskConical, Globe, Map,
  Calculator, Trophy, BarChart3, Menu, X, Star, Library, Lightbulb, TrendingUp, PenLine, Target, UserCircle
} from 'lucide-react';
import { ACCOUNTS_ENABLED } from '@/lib/accounts';
import { SITE } from '@/config/site';
import { useConsent } from '@/contexts/ConsentContext';

const navItems = [
  { path: '/', label: 'Inicio', icon: Home },
  { path: '/practica', label: 'Practicar', icon: PenLine },
  { path: '/matematicas', label: 'Matemáticas', icon: Calculator },
  { path: '/lectura', label: 'Lectura Crítica', icon: BookOpen },
  { path: '/ciencias', label: 'Ciencias Naturales', icon: FlaskConical },
  { path: '/sociales', label: 'Sociales y Ciudadanas', icon: Map },
  { path: '/ingles', label: 'Inglés', icon: Globe },
  { path: '/simulacro', label: 'Simulacro', icon: BarChart3 },
  { path: '/analytics', label: 'Mi progreso', icon: TrendingUp },
  { path: '/logros', label: 'Logros', icon: Trophy },
  { path: '/glosario', label: 'Glosario', icon: Library },
  { path: '/tips', label: 'Estrategias', icon: Lightbulb },
  // «Mi cuenta» solo aparece cuando hay cuentas configuradas (SITE.integrations.supabase*).
  ...(ACCOUNTS_ENABLED ? [{ path: '/cuenta', label: 'Mi cuenta', icon: UserCircle }] : []),
];

const bottomNavItems = [
  { path: '/', label: 'Inicio', icon: Home },
  { path: '/practica', label: 'Practicar', icon: PenLine },
  { path: '/simulacro', label: 'Simulacro', icon: BarChart3 },
  { path: '/analytics', label: 'Progreso', icon: TrendingUp },
  { path: '/logros', label: 'Logros', icon: Trophy },
];

const footerLinks = [
  { path: '/practica', label: 'Preguntas tipo ICFES' },
  { path: '/simulacro', label: 'Simulacro gratis' },
  { path: '/preguntas-frecuentes', label: 'Preguntas frecuentes' },
  { path: '/glosario', label: 'Glosario' },
  { path: '/tips', label: 'Estrategias' },
];

const legalLinks = [
  { path: '/politica-de-privacidad', label: 'Privacidad' },
  { path: '/tratamiento-de-datos', label: 'Tratamiento de datos' },
  { path: '/terminos', label: 'Términos' },
  { path: '/cookies', label: 'Cookies' },
];

function SiteFooter() {
  const { openSettings } = useConsent();
  return (
    <footer className="mt-12 border-t border-border pt-5 pb-2 text-xs text-muted-foreground space-y-3">
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
        {SITE.name} es un proyecto independiente y gratuito; no está afiliado al ICFES. Para información oficial
        consulta{' '}
        <a href="https://www.icfes.gov.co/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-foreground">
          icfes.gov.co
        </a>.
      </p>
      <p>
        Hecho por <span className="font-semibold text-foreground">{SITE.author.name}</span>
      </p>
    </footer>
  );
}

function ScoreMeter() {
  const { estimate } = useProgress();
  const score = estimate.global;
  const percentage = score == null ? 0 : (score / 500) * 100;
  const color = score == null ? 'text-sidebar-foreground/60'
    : score >= 360 ? 'text-green-400' : score >= 300 ? 'text-yellow-400' : score >= 250 ? 'text-orange-400' : 'text-red-400';

  return (
    <div className="mx-4 mb-4 p-3 rounded-xl bg-sidebar-accent/50 border border-sidebar-border">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-sidebar-foreground/70 font-medium">Puntaje global estimado</span>
        <span className={`text-lg font-bold ${color} font-['Lexend']`}>{score ?? '—'}</span>
      </div>
      <div className="h-2 bg-sidebar-border rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-orange-400 via-yellow-400 to-green-400 transition-all duration-700"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-[11px] leading-snug text-sidebar-foreground/60 mt-1.5">
        {score == null
          ? `Responde preguntas de las 5 áreas para calcularlo (faltan ${estimate.missingAreas.length}).`
          : 'Escala 0–500. Es un estimado según tus aciertos, no un resultado oficial.'}
      </p>
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { progress, estimate } = useProgress();

  // Cierra el menú al navegar y vuelve al inicio de la página
  useEffect(() => {
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0 });
  }, [location]);

  const isActive = (path: string) => location === path;

  return (
    <div className="min-h-screen bg-background flex">
      <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:bg-card focus:text-foreground focus:px-3 focus:py-2 focus:rounded-lg">
        Saltar al contenido
      </a>

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 h-screen bg-sidebar fixed left-0 top-0 z-40">
        <div className="p-5 border-b border-sidebar-border">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center text-xl" aria-hidden="true">
              🎓
            </div>
            <div>
              <p className="text-sidebar-foreground font-bold text-lg font-['Lexend'] leading-tight">ProICFES</p>
              <p className="text-sidebar-foreground/60 text-xs">Prepárate y Triunfa</p>
            </div>
          </Link>
        </div>

        <div className="px-4 py-3 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" aria-hidden="true" />
            <span className="text-sidebar-foreground/80 text-sm" title="Puntos de experiencia por lecciones completadas">{progress.totalXp} XP</span>
            {progress.streak > 0 && (
              <span className="ml-auto text-xs bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded-full">
                🔥 {progress.streak} {progress.streak === 1 ? 'día' : 'días'}
              </span>
            )}
          </div>
        </div>

        <nav aria-label="Navegación principal" className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              href={path}
              className={`nav-item ${isActive(path) ? 'active' : ''}`}
              aria-current={isActive(path) ? 'page' : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
              <span className="text-sm">{label}</span>
            </Link>
          ))}
        </nav>

        <ScoreMeter />
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-sidebar border-b border-sidebar-border">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl" aria-hidden="true">🎓</span>
            <span className="text-sidebar-foreground font-bold text-lg font-['Lexend']">ProICFES</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/analytics"
              className="flex items-center gap-1.5 bg-sidebar-accent/60 px-3 py-1.5 rounded-full"
              aria-label={estimate.global == null ? 'Puntaje global estimado: sin datos todavía' : `Puntaje global estimado: ${estimate.global} de 500`}
              title="Puntaje global estimado (0–500)"
            >
              <Target className="w-3.5 h-3.5 text-[#4ade80]" aria-hidden="true" />
              <span className="text-sidebar-foreground/70 text-xs">Puntaje est.</span>
              <span className="text-sidebar-foreground text-sm font-semibold">{estimate.global ?? '—'}</span>
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(o => !o)}
              className="text-sidebar-foreground p-1"
              aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={mobileMenuOpen}
              aria-controls="menu-movil"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/60" onClick={() => setMobileMenuOpen(false)}>
          <div
            id="menu-movil"
            className="absolute top-14 left-0 right-0 max-h-[calc(100vh-3.5rem)] overflow-y-auto bg-sidebar border-b border-sidebar-border p-4"
            onClick={e => e.stopPropagation()}
          >
            <nav aria-label="Menú" className="space-y-1">
              {navItems.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  href={path}
                  className={`nav-item ${isActive(path) ? 'active' : ''}`}
                  aria-current={isActive(path) ? 'page' : undefined}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon className="w-5 h-5" aria-hidden="true" />
                  <span>{label}</span>
                </Link>
              ))}
            </nav>
            <div className="mt-4 -mx-4">
              <ScoreMeter />
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main id="contenido" className="flex-1 lg:ml-64 min-h-screen pb-24 lg:pb-0 pt-16 lg:pt-0">
        <div className="max-w-5xl mx-auto px-4 py-6">
          {children}
          <SiteFooter />
        </div>
      </main>

      {/* Bottom Navigation - Mobile */}
      <nav
        aria-label="Navegación rápida"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-sidebar border-t border-sidebar-border pb-[env(safe-area-inset-bottom)]"
      >
        <div className="grid grid-cols-5">
          {bottomNavItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              href={path}
              aria-current={isActive(path) ? 'page' : undefined}
              className={`flex flex-col items-center justify-center gap-1 px-1 py-2 min-h-[56px] transition-colors ${
                isActive(path) ? 'text-sidebar-primary' : 'text-sidebar-foreground/70 hover:text-sidebar-foreground'
              }`}
            >
              <Icon className="w-5 h-5" aria-hidden="true" />
              <span className="text-[11px] font-medium leading-tight text-center">{label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
