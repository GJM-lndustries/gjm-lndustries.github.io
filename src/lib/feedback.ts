import { useEffect, useState } from "react";

/** true si la persona pidió reducir el movimiento en su sistema. */
export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Vibración corta (solo Android/Chrome; iOS la ignora). Se omite si la persona
 * pidió menos movimiento.
 */
export function haptic(pattern: number | number[] = 12): void {
  if (typeof navigator === "undefined" || prefersReducedMotion()) return;
  // Chrome bloquea (y avisa en consola) si la persona aún no ha tocado la página.
  const activation = (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }).userActivation;
  if (activation && !activation.hasBeenActive) return;
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* sin soporte */
  }
}

/** Cuenta de `from` a `to` en `ms`; con movimiento reducido muestra `to` de una vez. */
export function useCountUp(to: number, from: number, active: boolean, ms = 700): number {
  const [value, setValue] = useState(active ? from : to);
  useEffect(() => {
    if (!active || prefersReducedMotion() || from === to) {
      setValue(to);
      return;
    }
    setValue(from);
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / ms);
      const eased = 1 - Math.pow(1 - k, 3);
      setValue(Math.round(from + (to - from) * eased));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    const delay = window.setTimeout(() => (raf = requestAnimationFrame(tick)), 250);
    return () => {
      window.clearTimeout(delay);
      cancelAnimationFrame(raf);
    };
  }, [to, from, active, ms]);
  return value;
}
