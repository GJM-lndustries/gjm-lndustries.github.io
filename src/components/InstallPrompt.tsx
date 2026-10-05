import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/** Banner para instalar la PWA (Android) o instrucciones (iOS). */
export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [ios, setIos] = useState(false);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    try {
      if (localStorage.getItem("proicfes_install_dismissed") === "1") return;
    } catch {
      /* ignore */
    }
    const ua = navigator.userAgent;
    const isIos = /iphone|ipad|ipod/i.test(ua);
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || ("standalone" in navigator && (navigator as { standalone?: boolean }).standalone);
    if (isStandalone) return;
    if (isIos) {
      setIos(true);
      setHidden(false);
      return;
    }
    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setHidden(false);
    };
    window.addEventListener("beforeinstallprompt", onBip);
    return () => window.removeEventListener("beforeinstallprompt", onBip);
  }, []);

  if (hidden) return null;

  const dismiss = () => {
    setHidden(true);
    try {
      localStorage.setItem("proicfes_install_dismissed", "1");
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="fixed bottom-20 left-3 right-3 z-50 mx-auto max-w-md rounded-2xl border border-border bg-white p-4 shadow-lg lg:bottom-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#1e3a5f] text-[#4ade80]">
          <Download className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-['Lexend'] text-sm font-bold text-[#0f2040]">Instalar ProICFES</p>
          {ios ? (
            <p className="mt-1 text-xs text-muted-foreground">
              En iPhone: toca Compartir y luego «Añadir a pantalla de inicio».
            </p>
          ) : (
            <p className="mt-1 text-xs text-muted-foreground">Añádela a tu pantalla de inicio para abrirla como app.</p>
          )}
          <div className="mt-3 flex gap-2">
            {deferred && (
              <button
                type="button"
                className="rounded-xl bg-[#4ade80] px-3 py-2 text-xs font-bold text-[#0f2040]"
                onClick={async () => {
                  await deferred.prompt();
                  dismiss();
                }}
              >
                Instalar
              </button>
            )}
            <button type="button" className="rounded-xl px-3 py-2 text-xs font-semibold text-muted-foreground" onClick={dismiss}>
              Ahora no
            </button>
          </div>
        </div>
        <button type="button" aria-label="Cerrar" onClick={dismiss} className="text-muted-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
