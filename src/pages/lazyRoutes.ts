/**
 * Páginas en archivo JS aparte (ver src/lib/lazyPage.tsx). Salen completas en el HTML prerenderizado
 * y se cargan antes de hidratar cuando se abre su URL directamente.
 * - Legales: texto largo que casi nadie abre.
 * - Práctica, simulacro y módulos: necesitan el banco de preguntas (~200 KB), que así no pesa en el inicio.
 * - Páginas de la app con animaciones (framer-motion, ~125 KB): así la portada no descarga esa librería.
 */
import { lazyPage, type LazyPage } from "@/lib/lazyPage";
import { modules } from "@/lib/appData";
import { Cookies, PoliticaPrivacidad, Terminos, TratamientoDatos } from "./legal";

export const Practica = lazyPage(() => import("./Practica"));
export const Simulacro = lazyPage(() => import("./Simulacro"));
export const ModulePage = lazyPage(() => import("./ModulePage"));
export const Inicio = lazyPage(() => import("./Inicio"));
export const Logros = lazyPage(() => import("./Logros"));
export const Glosario = lazyPage(() => import("./Glosario"));
export const Tips = lazyPage(() => import("./Tips"));
export const Onboarding = lazyPage(() => import("./Onboarding"));
export const Analytics = lazyPage(() => import("./Analytics"));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const LAZY_ROUTES: Record<string, LazyPage<any>> = {
  "/inicio": Inicio,
  "/logros": Logros,
  "/glosario": Glosario,
  "/tips": Tips,
  "/meta": Onboarding,
  "/analytics": Analytics,
  "/practica": Practica,
  "/simulacro": Simulacro,
  ...Object.fromEntries(modules.map(m => [`/${m.id}`, ModulePage])),
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
