import type { ComponentType, ContextType } from 'react';
import { MotionConfig, PresenceContext } from 'framer-motion';
import { useHydrationGate } from './InitialMotionGate';

type Presence = ContextType<typeof PresenceContext>;
const base = { id: 'app', isPresent: true, custom: undefined, onExitComplete: () => {}, register: () => () => {} };
/** `initial: false`: los componentes `motion` se montan ya en su estado final (sin animación de entrada). */
const NO_INITIAL_ANIMATION = { ...base, initial: false } as unknown as Presence;
/** Comportamiento normal. Nunca se usa `null`: framer-motion llama hooks distintos si el contexto es nulo. */
const NORMAL = { ...base, initial: undefined } as unknown as Presence;

/**
 * Envuelve una página que usa framer-motion:
 * - sin animaciones de entrada mientras se hidrata el HTML prerenderizado;
 * - respeta «reducir movimiento» del sistema (`reducedMotion="user"`).
 * Vive fuera del bundle principal para que la portada no cargue framer-motion.
 */
export function withMotion<P extends object>(Page: ComponentType<P>): ComponentType<P> {
  function WithMotion(props: P) {
    const blocking = useHydrationGate();
    return (
      <MotionConfig reducedMotion="user">
        <PresenceContext.Provider value={blocking ? NO_INITIAL_ANIMATION : NORMAL}>
          <Page {...props} />
        </PresenceContext.Provider>
      </MotionConfig>
    );
  }
  WithMotion.displayName = `withMotion(${Page.displayName ?? Page.name ?? 'Page'})`;
  return WithMotion;
}
