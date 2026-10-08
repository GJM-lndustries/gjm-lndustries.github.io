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
  ogImage: "/og-image-v2.jpg",
  ogImageAlt: "ProICFES: estudia gratis para el ICFES Saber 11",
  /** Creador del sitio (crédito en el pie de página y Organization en JSON-LD). */
  author: {
    name: "GJM lndustries",
  },
  /**
   * Servicios de terceros. Vacíos = desactivados: no se carga ningún script.
   * Aunque se llenen, solo se cargan después de que la persona acepte la categoría
   * de cookies correspondiente (ver src/lib/consent.ts y src/lib/thirdParty.ts).
   */
  integrations: {
    /** Google Analytics 4, p. ej. "G-XXXXXXXXXX" (categoría «analíticas»). */
    gaMeasurementId: "",
    /** Google AdSense, p. ej. "ca-pub-0000000000000000" (categoría «publicidad»). */
    adsenseClientId: "",
    /**
     * Cuentas (Supabase). La clave «anon» es pública por diseño (la seguridad la da RLS);
     * NUNCA pongas aquí la clave service_role/secret ni la contraseña de la base de datos.
     * Vacías = sin cuentas: la app funciona solo con el progreso local y /cuenta muestra «Próximamente».
     * `googleSignIn`: false hasta configurar el proveedor Google en Supabase (ver README).
     */
    supabaseUrl: "https://ycvsbjfwolnkyhvautyc.supabase.co",
    supabaseAnonKey:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InljdnNiamZ3b2xua3lodmF1dHljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEyMDYyMTksImV4cCI6MjEwNjc4MjIxOX0.jdx5_45rEsOTVncpkddLruW-Y3tIuXnz2zo-BzPRVQk",
    googleSignIn: false,
  },
} as const;

/** Convierte una ruta interna (/practica) en URL absoluta (https://…/practica). */
export function absoluteUrl(path = "/"): string {
  if (/^https?:\/\//.test(path)) return path;
  return (
    SITE.url + (path === "/" ? "/" : path.startsWith("/") ? path : `/${path}`)
  );
}
