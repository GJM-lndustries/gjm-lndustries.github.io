import { describe, expect, it } from "vitest";
import { SITE, absoluteUrl } from "@/config/site";
import { FAQ } from "@/data/faq";
import { weightedGlobalScore } from "@/lib/score";
import { buildJsonLd } from "./jsonld";
import { renderHeadTags } from "./head";
import { ROUTES, findRoute } from "./routes";

describe("SEO de rutas", () => {
  it("cada ruta tiene título y descripción únicos y de longitud razonable", () => {
    const titles = new Set(ROUTES.map(r => r.title));
    const descriptions = new Set(ROUTES.map(r => r.description));
    expect(titles.size).toBe(ROUTES.length);
    expect(descriptions.size).toBe(ROUTES.length);
    for (const r of ROUTES.filter(r => !r.noindex)) {
      expect(r.title.length, r.path).toBeLessThanOrEqual(65);
      expect(r.description.length, r.path).toBeGreaterThanOrEqual(110);
      expect(r.description.length, r.path).toBeLessThanOrEqual(165);
    }
  });

  it("usa la URL central del sitio sin barra final", () => {
    expect(SITE.url).toMatch(/^https:\/\/[^/]+$/);
    expect(absoluteUrl("/")).toBe(`${SITE.url}/`);
    expect(absoluteUrl("/practica")).toBe(`${SITE.url}/practica`);
    expect(findRoute("/practica/")?.path).toBe("/practica");
  });

  it("genera canonical, hreflang y JSON-LD válido para cada ruta", () => {
    for (const r of ROUTES) {
      const head = renderHeadTags(r);
      if (r.noindex) {
        expect(head).toContain('content="noindex, follow"');
        expect(head).not.toContain('rel="canonical"');
      } else {
        expect(head).toContain(`<link rel="canonical" href="${absoluteUrl(r.path)}" />`);
        expect(head).toContain(`hreflang="${SITE.lang}"`);
      }
      const ld = JSON.parse(JSON.stringify(buildJsonLd(r)));
      expect(ld["@context"]).toBe("https://schema.org");
      expect(Array.isArray(ld["@graph"])).toBe(true);
    }
  });

  it("la FAQPage incluye todas las preguntas frecuentes", () => {
    const faq = ROUTES.find(r => r.kind === "faq")!;
    const graph = buildJsonLd(faq)["@graph"] as Record<string, unknown>[];
    const page = graph.find(n => Array.isArray(n["@type"]) && (n["@type"] as string[]).includes("FAQPage"))!;
    expect((page.mainEntity as unknown[]).length).toBe(FAQ.length);
  });

  it("el ejemplo de cálculo de la FAQ coincide con la fórmula oficial", () => {
    const global = weightedGlobalScore({
      matematicas: 60,
      "lectura-critica": 60,
      "ciencias-naturales": 60,
      "sociales-ciudadanas": 60,
      ingles: 50,
    });
    expect(global).toBe(296);
    expect(FAQ.find(f => f.id === "como-se-calcula-el-puntaje")!.answer.join(" ")).toContain("296");
  });
});
