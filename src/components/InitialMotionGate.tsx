import { useEffect, useState, type ContextType, type ReactNode } from 'react';
import { PresenceContext } from 'framer-motion';

type Presence = ContextType<typeof PresenceContext>;
const base = { id: 'app', isPresent: true, custom: undefined, onExitComplete: () => {}, register: () => () => {} };
/** `initial: false`: los componentes `motion` se montan ya en su estado final (sin animación de entrada). */
const NO_INITIAL_ANIMATION = { ...base, initial: false } as unknown as Presence;
/** Comportamiento normal. Nunca se usa `null`: framer-motion llama hooks distintos si el contexto es nulo. */
const NORMAL = { ...base, initial: undefined } as unknown as Presence;

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
  return <PresenceContext.Provider value={blocking ? NO_INITIAL_ANIMATION : NORMAL}>{children}</PresenceContext.Provider>;
}
