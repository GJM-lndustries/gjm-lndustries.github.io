import { ExternalLink } from "lucide-react";

const PHOTOS = [
  {
    src: "/images/landing/estudiante-800.webp",
    description: "Estudiante de bachillerato escribiendo en su cuaderno, en casa",
    author: "Vitaly Gariev",
    url: "https://unsplash.com/photos/young-woman-writing-at-a-desk-with-books-7Wf684C9nwU",
    where: "Portada",
  },
];

/** Créditos de las fotos y recursos gráficos usados en ProICFES. */
export default function Creditos() {
  return (
    <div className="max-w-3xl space-y-8">
      <header>
        <h1 className="page-title">Créditos de imágenes</h1>
        <p className="mt-1 text-[15px] text-muted-foreground">
          Las fotos que usamos tienen licencia libre y se alojan en este mismo sitio.
        </p>
      </header>

      <section aria-labelledby="fotos">
        <h2 id="fotos" className="section-title mb-3">Fotografías</h2>
        <ul className="space-y-3">
          {PHOTOS.map(p => (
            <li key={p.src} className="card flex gap-4 p-4">
              <img src={p.src} alt="" width={120} height={90} loading="lazy" className="h-[72px] w-24 flex-shrink-0 rounded-lg object-cover" />
              <div className="min-w-0 text-sm">
                <p className="font-semibold text-foreground">{p.description}</p>
                <p className="mt-0.5 text-muted-foreground">
                  Foto de {p.author} en Unsplash · Licencia de Unsplash · Se usa en: {p.where}
                </p>
                <a href={p.url} target="_blank" rel="noopener noreferrer" className="btn-link mt-1">
                  Ver la foto original <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="graficos" className="card p-5 text-sm leading-relaxed text-muted-foreground">
        <h2 id="graficos" className="section-title mb-2">Logo, íconos e ilustraciones</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>El logo, el ícono de la app y la maqueta del celular de la portada son diseños propios de ProICFES.</li>
          <li>
            Los íconos de la interfaz son de{" "}
            <a href="https://lucide.dev" target="_blank" rel="noopener noreferrer" className="font-semibold text-navy underline underline-offset-2">
              Lucide
            </a>{" "}
            (licencia ISC).
          </li>
          <li>
            Licencia de Unsplash:{" "}
            <a href="https://unsplash.com/license" target="_blank" rel="noopener noreferrer" className="font-semibold text-navy underline underline-offset-2">
              unsplash.com/license
            </a>
            .
          </li>
        </ul>
      </section>
    </div>
  );
}
