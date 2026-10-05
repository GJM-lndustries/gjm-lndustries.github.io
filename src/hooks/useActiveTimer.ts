import { useEffect, useRef } from "react";

/**
 * Acumula milisegundos solo mientras `active` y la pestaña está visible.
 * Llama `onTick(deltaMs)` ~ cada `intervalMs`.
 */
export function useActiveTimer(
  active: boolean,
  onTick: (deltaMs: number) => void,
  intervalMs = 1000
) {
  const cb = useRef(onTick);
  cb.current = onTick;

  useEffect(() => {
    if (!active || typeof document === "undefined") return;
    let last = performance.now();
    const id = window.setInterval(() => {
      if (document.visibilityState !== "visible") {
        last = performance.now();
        return;
      }
      const now = performance.now();
      const delta = Math.max(0, Math.min(intervalMs * 2, now - last));
      last = now;
      if (delta > 0) cb.current(delta);
    }, intervalMs);
    const onVis = () => {
      last = performance.now();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [active, intervalMs]);
}
