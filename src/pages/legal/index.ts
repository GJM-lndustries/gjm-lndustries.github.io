import { lazyPage, type LazyPage } from "@/lib/lazyPage";

// Las páginas legales son texto largo que casi nadie abre: cada una va en su propio archivo.
export const PoliticaPrivacidad = lazyPage(() => import("./PoliticaPrivacidad"));
export const TratamientoDatos = lazyPage(() => import("./TratamientoDatos"));
export const Terminos = lazyPage(() => import("./Terminos"));
export const Cookies = lazyPage(() => import("./Cookies"));
