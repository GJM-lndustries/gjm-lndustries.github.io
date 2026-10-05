import { Suspense, lazy, useEffect } from "react";
import { Route, Switch, useLocation } from "wouter";
import { Toaster } from "@/components/ui/sonner";
import ErrorBoundary from "./components/ErrorBoundary";
import AppLayout from "./components/AppLayout";
import InitialMotionGate from "./components/InitialMotionGate";
import { ProgressProvider } from "./contexts/ProgressContext";
import { AuthProvider } from "./contexts/AuthContext";
import { usePWA } from "./hooks/usePWA";
import { modules } from "./lib/appData";
import Home from "./pages/Home";
import Logros from "./pages/Logros";
import Glosario from "./pages/Glosario";
import Tips from "./pages/Tips";
import Leaderboard from "./pages/Leaderboard";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";
import PreguntasFrecuentes from "./pages/PreguntasFrecuentes";
import Cuenta from "./pages/Cuenta";
import CookieConsent from "./components/CookieConsent";
import { ConsentProvider } from "./contexts/ConsentContext";
import { useSeo } from "./seo/useSeo";
import { PageLoading } from "./lib/lazyPage";
import { Cookies, PoliticaPrivacidad, Terminos, TratamientoDatos } from "./pages/legal";
import { ModulePage, Practica, Simulacro } from "./pages/lazyRoutes";

// Las gráficas (recharts) pesan bastante: se cargan solo al abrir «Mi progreso».
const Analytics = lazy(() => import("./pages/Analytics"));


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
  useSeo();

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
            <Route path="/preguntas-frecuentes" component={PreguntasFrecuentes} />
            <Route path="/politica-de-privacidad" component={PoliticaPrivacidad} />
            <Route path="/tratamiento-de-datos" component={TratamientoDatos} />
            <Route path="/terminos" component={Terminos} />
            <Route path="/cookies" component={Cookies} />
            <Route path="/leaderboard" component={Leaderboard} />
            <Route path="/cuenta" component={Cuenta} />
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

/** `hydrating`: la app arranca sobre HTML prerenderizado (ver main.tsx y entry-server.tsx). */
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
