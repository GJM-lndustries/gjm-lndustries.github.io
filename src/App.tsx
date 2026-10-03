import { Suspense, lazy, useEffect } from "react";
import { Route, Switch, useLocation } from "wouter";
import { Toaster } from "@/components/ui/sonner";
import ErrorBoundary from "./components/ErrorBoundary";
import AppLayout from "./components/AppLayout";
import { ProgressProvider } from "./contexts/ProgressContext";
import { usePWA } from "./hooks/usePWA";
import { modules } from "./lib/appData";
import Home from "./pages/Home";
import ModulePage from "./pages/ModulePage";
import Practica from "./pages/Practica";
import Simulacro from "./pages/Simulacro";
import Logros from "./pages/Logros";
import Glosario from "./pages/Glosario";
import Tips from "./pages/Tips";
import Leaderboard from "./pages/Leaderboard";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";

// Las gráficas (recharts) pesan bastante: se cargan solo al abrir «Mi progreso».
const Analytics = lazy(() => import("./pages/Analytics"));

function PageLoading() {
  return <p className="text-sm text-muted-foreground py-10 text-center">Cargando…</p>;
}

/** GitHub Pages puede servir /ruta/ con barra final: la normalizamos a /ruta. */
function useTrailingSlashFix() {
  const [location, navigate] = useLocation();
  useEffect(() => {
    if (location.length > 1 && location.endsWith("/")) {
      navigate(location.replace(/\/+$/, "") + window.location.search + window.location.hash, { replace: true });
    }
  }, [location, navigate]);
}

function AppContent() {
  usePWA();
  useTrailingSlashFix();

  return (
    <Switch>
      {/* Meta personal: opcional, pantalla completa, nunca bloquea el resto de la app */}
      <Route path="/meta" component={Onboarding} />
      <Route>
        <AppLayout>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/practica" component={Practica} />
            <Route path="/simulacro" component={Simulacro} />
            <Route path="/logros" component={Logros} />
            <Route path="/glosario" component={Glosario} />
            <Route path="/tips" component={Tips} />
            <Route path="/leaderboard" component={Leaderboard} />
            <Route path="/analytics">
              <Suspense fallback={<PageLoading />}>
                <Analytics />
              </Suspense>
            </Route>
            {modules.map(module => (
              <Route key={module.id} path={`/${module.id}`}>
                <ModulePage key={module.id} module={module} />
              </Route>
            ))}
            <Route component={NotFound} />
          </Switch>
        </AppLayout>
      </Route>
    </Switch>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ProgressProvider>
        <Toaster />
        <AppContent />
      </ProgressProvider>
    </ErrorBoundary>
  );
}
