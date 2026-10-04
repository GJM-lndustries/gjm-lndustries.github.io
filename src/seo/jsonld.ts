/**
 * Datos estructurados (schema.org, JSON-LD) por ruta. Se insertan en el HTML prerenderizado
 * (scripts/postbuild.mjs) y se actualizan al navegar (src/seo/useSeo.ts).
 */
import { SITE, absoluteUrl } from "@/config/site";
import { FAQ } from "@/data/faq";
import { AREA_INFO, allQuestions } from "@/data/questions";
import { modules, allGlossaryTerms } from "@/lib/appData";
import type { RouteMeta } from "./routes";

type Node = Record<string, unknown>;

const ORG_ID = `${SITE.url}/#organization`;
const SITE_ID = `${SITE.url}/#website`;
const EDUCATIONAL_LEVEL = "Grado 11 (educación media), Colombia";
const SABER_11 = { "@type": "Thing", name: "Examen Saber 11 (ICFES)" };

function organization(): Node {
  return {
    "@type": "Organization",
    "@id": ORG_ID,
    name: SITE.author.name,
    url: absoluteUrl("/"),
  };
}

function website(): Node {
  return {
    "@type": "WebSite",
    "@id": SITE_ID,
    url: absoluteUrl("/"),
    name: SITE.name,
    alternateName: "Pro ICFES",
    description: "Preicfes gratis para el Saber 11: lecciones, preguntas tipo ICFES con explicación y simulacros.",
    inLanguage: SITE.lang,
    publisher: { "@id": ORG_ID },
  };
}

function breadcrumb(route: RouteMeta): Node {
  return {
    "@type": "BreadcrumbList",
    "@id": `${absoluteUrl(route.path)}#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: route.name, item: absoluteUrl(route.path) },
    ],
  };
}

function freeOffer(): Node {
  return { "@type": "Offer", price: 0, priceCurrency: "COP", category: "Gratis", availability: "https://schema.org/InStock" };
}

/** Nodo principal de la página según su tipo. */
function mainEntity(route: RouteMeta): Node | null {
  const url = absoluteUrl(route.path);
  switch (route.kind) {
    case "course": {
      const mod = modules.find(m => m.area === route.area);
      if (!mod) return null;
      return {
        "@type": "Course",
        "@id": `${url}#course`,
        name: `${mod.title} para el ICFES Saber 11`,
        description: route.description,
        url,
        inLanguage: SITE.lang,
        isAccessibleForFree: true,
        educationalLevel: EDUCATIONAL_LEVEL,
        about: SABER_11,
        teaches: mod.lessons.map(l => l.title),
        provider: { "@id": ORG_ID },
        offers: freeOffer(),
        hasCourseInstance: {
          "@type": "CourseInstance",
          courseMode: "online",
          courseWorkload: `PT${mod.lessons.reduce((s, l) => s + l.duration, 0)}M`,
        },
      };
    }
    case "practice":
      return {
        "@type": "LearningResource",
        "@id": `${url}#recurso`,
        name: "Preguntas tipo ICFES para practicar",
        description: route.description,
        url,
        inLanguage: SITE.lang,
        isAccessibleForFree: true,
        learningResourceType: "Preguntas de práctica",
        interactivityType: "active",
        educationalLevel: EDUCATIONAL_LEVEL,
        about: Object.values(AREA_INFO).map(a => ({ "@type": "Thing", name: `${a.label} (Saber 11)` })),
        author: { "@id": ORG_ID },
        hasPart: { "@type": "Quiz", name: `${allQuestions.length} preguntas con explicación`, educationalLevel: EDUCATIONAL_LEVEL },
      };
    case "quiz":
      return {
        "@type": "Quiz",
        "@id": `${url}#simulacro`,
        name: "Mini simulacro tipo ICFES Saber 11",
        description: route.description,
        url,
        inLanguage: SITE.lang,
        isAccessibleForFree: true,
        educationalLevel: EDUCATIONAL_LEVEL,
        about: SABER_11,
        author: { "@id": ORG_ID },
      };
    case "faq":
      return {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        mainEntity: FAQ.map(item => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer.join(" ") },
        })),
      };
    case "glossary":
      return {
        "@type": "DefinedTermSet",
        "@id": `${url}#glosario`,
        name: "Glosario del ICFES Saber 11",
        inLanguage: SITE.lang,
        hasDefinedTerm: allGlossaryTerms().map(t => ({ "@type": "DefinedTerm", name: t.term, description: t.simple })),
      };
    default:
      return null;
  }
}

/** Grafo JSON-LD completo de una ruta. */
export function buildJsonLd(route: RouteMeta): Node {
  const url = absoluteUrl(route.path);
  const isHome = route.kind === "home";
  const main = mainEntity(route);
  const webpage: Node = {
    "@type": route.kind === "faq" ? ["WebPage", "FAQPage"] : "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: route.title,
    description: route.description,
    inLanguage: SITE.lang,
    isPartOf: { "@id": SITE_ID },
    publisher: { "@id": ORG_ID },
    ...(isHome ? { about: SABER_11, primaryImageOfPage: absoluteUrl(SITE.ogImage) } : { breadcrumb: { "@id": `${url}#breadcrumb` } }),
  };
  let graph: Node[];
  if (route.kind === "faq" && main) {
    // La página misma es la FAQPage: se fusionan los nodos.
    graph = [organization(), website(), { ...webpage, mainEntity: main.mainEntity }, breadcrumb(route)];
  } else {
    if (main) webpage.mainEntity = { "@id": main["@id"] };
    graph = [organization(), website(), webpage];
    if (main) graph.push(main);
    if (!isHome) graph.push(breadcrumb(route));
  }
  return { "@context": "https://schema.org", "@graph": graph };
}
