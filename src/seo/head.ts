/** Etiquetas SEO del <head> para el HTML prerenderizado de cada ruta. */
import { SITE, absoluteUrl } from "@/config/site";
import { buildJsonLd } from "./jsonld";
import type { RouteMeta } from "./routes";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** JSON seguro para incrustar en <script> (evita cerrar la etiqueta con "</"). */
export const jsonForScript = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");

export function renderHeadTags(route: RouteMeta): string {
  const url = absoluteUrl(route.path);
  const image = absoluteUrl(SITE.ogImage);
  const tags = [
    `<title>${esc(route.title)}</title>`,
    `<meta name="description" content="${esc(route.description)}" />`,
    route.noindex
      ? `<meta name="robots" content="noindex, follow" />`
      : `<meta name="robots" content="index, follow, max-image-preview:large" />`,
  ];
  if (!route.noindex) {
    tags.push(
      `<link rel="canonical" href="${url}" />`,
      `<link rel="alternate" hreflang="${SITE.lang}" href="${url}" />`,
      `<link rel="alternate" hreflang="x-default" href="${url}" />`,
    );
  }
  tags.push(
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${esc(SITE.name)}" />`,
    `<meta property="og:locale" content="${SITE.ogLocale}" />`,
    `<meta property="og:title" content="${esc(route.title)}" />`,
    `<meta property="og:description" content="${esc(route.description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${image}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${esc(SITE.ogImageAlt)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(route.title)}" />`,
    `<meta name="twitter:description" content="${esc(route.description)}" />`,
    `<meta name="twitter:image" content="${image}" />`,
    `<script type="application/ld+json" id="ld-json">${jsonForScript(buildJsonLd(route))}</script>`,
  );
  return tags.join("\n    ");
}
