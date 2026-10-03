import { useEffect } from "react";

/** Registra el service worker (solo en producción) para que la app funcione como PWA. */
export function usePWA() {
  useEffect(() => {
    if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* sin service worker la app sigue funcionando en línea */
    });
  }, []);
}
