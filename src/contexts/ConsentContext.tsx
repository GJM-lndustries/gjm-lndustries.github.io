import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { makeConsent, readConsent, writeConsent, type ConsentChoices, type StoredConsent } from "@/lib/consent";
import { loadAds, loadAnalytics, loadedThirdParties, updateGoogleConsent } from "@/lib/thirdParty";

interface ConsentContextType {
  /** null = todavía no ha decidido (o la decisión es de una versión anterior). */
  consent: StoredConsent | null;
  /** false durante el prerender y la hidratación: el aviso solo aparece en el navegador. */
  ready: boolean;
  settingsOpen: boolean;
  save: (choices: ConsentChoices) => void;
  openSettings: () => void;
  closeSettings: () => void;
}

const ConsentContext = createContext<ConsentContextType | null>(null);

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<StoredConsent | null>(null);
  const [ready, setReady] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    setConsent(readConsent());
    setReady(true);
  }, []);

  // Con consentimiento (y solo entonces) se cargan los servicios configurados.
  useEffect(() => {
    if (!consent) return;
    loadAnalytics(consent);
    loadAds(consent);
  }, [consent]);

  const save = useCallback((choices: ConsentChoices) => {
    const next = makeConsent(choices);
    const revoked = loadedThirdParties().some(id => (id === "analytics" && !next.analytics) || (id === "ads" && !next.ads));
    writeConsent(next);
    updateGoogleConsent(next);
    setConsent(next);
    setSettingsOpen(false);
    // Un script ya cargado no se puede «descargar»: recargamos para que deje de ejecutarse.
    if (revoked) window.location.reload();
  }, []);

  const openSettings = useCallback(() => setSettingsOpen(true), []);
  const closeSettings = useCallback(() => setSettingsOpen(false), []);

  const value = useMemo(
    () => ({ consent, ready, settingsOpen, save, openSettings, closeSettings }),
    [consent, ready, settingsOpen, save, openSettings, closeSettings]
  );
  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

export function useConsent() {
  const ctx = useContext(ConsentContext);
  if (!ctx) throw new Error("useConsent debe usarse dentro de ConsentProvider");
  return ctx;
}
