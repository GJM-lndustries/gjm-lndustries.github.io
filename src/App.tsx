import { useEffect } from "react";
import { Route, Switch, useLocation } from "wouter";
import { Toaster } from "@/components/ui/sonner";
import ErrorBoundary from "./components/ErrorBoundary";
import AppLayout from "./components/AppLayout";
import InitialMotionGate from "./components/InitialMotionGate";
import { ProgressProvider } from "./contexts/ProgressContext";
import { AuthProvider } from "./contexts/AuthContext";
import { usePWA } from "./hooks/usePWA";
import { modules } from "./lib/appData";
import Landing from "./pages/Landing";
import Leaderboard from "./pages/Leaderboard";
import NotFound from "./pages/NotFound";
import PreguntasFrecuentes from "./pages/PreguntasFrecuentes";
import Cuenta from "./pages/Cuenta";
import Yo from "./pages/Yo";
import Creditos from "./pages/Creditos";
import CookieConsent from "./components/CookieConsent";
import { ConsentProvider } from "./contexts/ConsentContext";
import { useSeo } from "./seo/useSeo";
import { PageLoading } from "./lib/lazyPage";
import { Cookies, PoliticaPrivacidad, Terminos, TratamientoDatos } from "./pages/legal";
import { Analytics, Glosario, Inicio, Logros, ModulePage, Onboarding, Practica, Simulacro, Tips } from "./pages/lazyRoutes";



function Redirect({ to }: { to: string }) {
  const [, nav] = useLocation();
  useEffect(() => {
    nav(to, { replace: true });
  }, [nav, to]);
  return <PageLoading />;
}

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
  useSeo();

  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/meta" component={Onboarding} />
      <Route>
        <AppLayout>
          <Switch>
            <Route path="/inicio" component={Inicio} />
            <Route path="/app">
              <Redirect to="/inicio" />
            </Route>
            <Route path="/yo" component={Yo} />
            <Route path="/practica" component={Practica} />
            <Route path="/simulacro" component={Simulacro} />
            <Route path="/logros" component={Logros} />
            <Route path="/glosario" component={Glosario} />
            <Route path="/tips" component={Tips} />
            <Route path="/preguntas-frecuentes" component={PreguntasFrecuentes} />
            <Route path="/politica-de-privacidad" component={PoliticaPrivacidad} />
            <Route path="/tratamiento-de-datos" component={TratamientoDatos} />
            <Route path="/terminos" component={Terminos} />
            <Route path="/cookies" component={Cookies} />
            <Route path="/creditos" component={Creditos} />
            <Route path="/leaderboard" component={Leaderboard} />
            <Route path="/cuenta" component={Cuenta} />
            <Route path="/analytics" component={Analytics} />
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

export default function App({ hydrating = false }: { hydrating?: boolean }) {
  return (
    <ErrorBoundary>
      <InitialMotionGate active={hydrating}>
        <ConsentProvider>
          <ProgressProvider deferLoad={hydrating}>
            <AuthProvider>
              <Toaster />
              <AppContent />
              <CookieConsent />
            </AuthProvider>
          </ProgressProvider>
        </ConsentProvider>
      </InitialMotionGate>
    </ErrorBoundary>
  );
}
