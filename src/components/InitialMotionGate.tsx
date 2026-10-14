import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

/**
 * `true` solo durante la hidratación del HTML prerenderizado (primer montaje en el navegador).
 * No depende de framer-motion, así la portada no descarga esa librería: las páginas que la usan
 * leen este valor con `withMotion` (src/components/withMotion.tsx).
 */
const HydrationGateContext = createContext(false);

export function useHydrationGate(): boolean {
  return useContext(HydrationGateContext);
}

/**
 * Mientras `active`, las animaciones de entrada se omiten: así el HTML prerenderizado es visible
 * sin JavaScript y la hidratación no lo «parpadea». Tras el primer montaje en el navegador se
 * desactiva y las animaciones de lo que aparezca después funcionan normalmente.
 * El árbol es idéntico con o sin `active` (solo cambia el valor del contexto).
 */
export default function InitialMotionGate({ active, children }: { active: boolean; children: ReactNode }) {
  const [blocking, setBlocking] = useState(active);
  useEffect(() => {
    if (blocking) setBlocking(false);
  }, [blocking]);
  return <HydrationGateContext.Provider value={blocking}>{children}</HydrationGateContext.Provider>;
}
