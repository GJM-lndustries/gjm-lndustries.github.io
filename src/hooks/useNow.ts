import { useEffect, useState } from "react";

/**
 * Fecha actual solo después de montar. El HTML prerenderizado se genera el día del build,
 * así que lo que dependa de «hoy» no puede salir en el primer render: React no corrige
 * atributos distintos al hidratar y el día quedaría marcado mal. Se actualiza al volver
 * a la pestaña (por si cambió el día con la app abierta).
 */
export function useNow(): Date | null {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const onVisible = () => {
      if (document.visibilityState === "visible") setNow(new Date());
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);
  return now;
}
