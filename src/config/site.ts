/**
 * Configuración central del sitio. Para cambiar de dominio, edita SOLO `url`:
 * de aquí salen el canonical, Open Graph, hreflang, JSON-LD, sitemap.xml y robots.txt
 * (ver scripts/postbuild.mjs y src/seo/).
 */
export const SITE = {
  /** URL pública, sin barra final. */
  url: "https://proicfes.com.co",
  name: "ProICFES",
  tagline: "Preicfes gratis para el Saber 11",
  /** Idioma y región del contenido (BCP 47) y su forma para Open Graph. */
  lang: "es-CO",
  ogLocale: "es_CO",
  themeColor: "#1e3a5f",
  /** Imagen por defecto para compartir en redes (1200×630). */
  ogImage: "/og-image.jpg",
  ogImageAlt: "ProICFES: estudia gratis para el ICFES Saber 11",
  /** Creador del sitio (crédito en el pie de página y Organization en JSON-LD). */
  author: {
    name: "GJM lndustries",
  },
} as const;

/** Convierte una ruta interna (/practica) en URL absoluta (https://…/practica). */
export function absoluteUrl(path = "/"): string {
  if (/^https?:\/\//.test(path)) return path;
  return SITE.url + (path === "/" ? "/" : path.startsWith("/") ? path : `/${path}`);
}
