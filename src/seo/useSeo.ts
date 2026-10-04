import { useEffect } from "react";
import { useLocation } from "wouter";
import { SITE, absoluteUrl } from "@/config/site";
import { buildJsonLd } from "./jsonld";
import { jsonForScript } from "./head";
import { NOT_FOUND_META, findRoute } from "./routes";

function setMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = content;
}

function setLink(selector: string, attrs: Record<string, string> | null) {
  const existing = document.head.querySelector<HTMLLinkElement>(selector);
  if (!attrs) {
    existing?.remove();
    return;
  }
  const el = existing ?? document.head.appendChild(document.createElement("link"));
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
}

/** Mantiene <title>, descripción, canonical, Open Graph y JSON-LD al navegar dentro de la app. */
export function useSeo() {
  const [location] = useLocation();
  useEffect(() => {
    const route = findRoute(location) ?? NOT_FOUND_META;
    const url = absoluteUrl(route.path);
    document.title = route.title;
    setMeta("name", "description", route.description);
    setMeta("name", "robots", route.noindex ? "noindex, follow" : "index, follow, max-image-preview:large");
    setMeta("property", "og:title", route.title);
    setMeta("property", "og:description", route.description);
    setMeta("property", "og:url", url);
    setMeta("name", "twitter:title", route.title);
    setMeta("name", "twitter:description", route.description);
    setLink('link[rel="canonical"]', route.noindex ? null : { rel: "canonical", href: url });
    setLink(`link[rel="alternate"][hreflang="${SITE.lang}"]`, route.noindex ? null : { rel: "alternate", hreflang: SITE.lang, href: url });
    setLink('link[rel="alternate"][hreflang="x-default"]', route.noindex ? null : { rel: "alternate", hreflang: "x-default", href: url });
    let ld = document.getElementById("ld-json");
    if (!ld) {
      ld = document.createElement("script");
      ld.id = "ld-json";
      ld.setAttribute("type", "application/ld+json");
      document.head.appendChild(ld);
    }
    ld.textContent = jsonForScript(buildJsonLd(route));
  }, [location]);
}
