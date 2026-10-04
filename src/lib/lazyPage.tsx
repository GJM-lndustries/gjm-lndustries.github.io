import { Suspense, lazy, useState, type ComponentType } from "react";

export function PageLoading() {
  return <p className="text-sm text-muted-foreground py-10 text-center">Cargando…</p>;
}

export interface LazyPage<P extends object = object> {
  (props: P): React.JSX.Element;
  /** Carga el módulo; después, la página se renderiza sin <Suspense>. */
  preload: () => Promise<void>;
}

/**
 * Página en su propio archivo JS que igual sale completa en el HTML prerenderizado.
 *
 * Con `lazy()` + `<Suspense>` normal, React saca el contenido grande fuera de su lugar
 * (oculto hasta que corre un script), así que sin JavaScript no se vería. Aquí:
 * - en el prerender se llama `preload()` antes de renderizar, así que no hay <Suspense>;
 * - en el navegador, main.tsx llama `preload()` de la ruta actual antes de hidratar
 *   (mismo árbol que el HTML);
 * - al navegar dentro de la app se usa `lazy()` con «Cargando…» mientras baja el archivo.
 */
export function lazyPage<P extends object = object>(
  loader: () => Promise<{ default: ComponentType<P> }>
): LazyPage<P> {
  let Loaded: ComponentType<P> | null = null;
  let pending: Promise<void> | null = null;
  const preload = () => (pending ??= loader().then(m => { Loaded = m.default; }));
  const Lazy = lazy(() => preload().then(() => ({ default: Loaded! })));

  function Page(props: P) {
    // Se decide al montar, para no cambiar de árbol (y remontar) cuando termina de cargar.
    const [Ready] = useState(() => Loaded);
    if (Ready) return <Ready {...props} />;
    return (
      <Suspense fallback={<PageLoading />}>
        <Lazy {...props} />
      </Suspense>
    );
  }
  Page.preload = preload;
  return Page;
}
