import { lazyPage, type LazyPage } from "@/lib/lazyPage";

// Las páginas legales son texto largo que casi nadie abre: cada una va en su propio archivo.
export const PoliticaPrivacidad = lazyPage(() => import("./PoliticaPrivacidad"));
export const TratamientoDatos = lazyPage(() => import("./TratamientoDatos"));
export const Terminos = lazyPage(() => import("./Terminos"));
export const Cookies = lazyPage(() => import("./Cookies"));

export const LAZY_ROUTES: Record<string, LazyPage> = {
  "/politica-de-privacidad": PoliticaPrivacidad,
  "/tratamiento-de-datos": TratamientoDatos,
  "/terminos": Terminos,
  "/cookies": Cookies,
};

/** Carga la página de la ruta (si es una de estas) antes de hidratar. */
export function preloadRoute(path: string): Promise<void> {
  return LAZY_ROUTES[path]?.preload() ?? Promise.resolve();
}

export function preloadAllLazyRoutes(): Promise<unknown> {
  return Promise.all(Object.values(LAZY_ROUTES).map(p => p.preload()));
}
