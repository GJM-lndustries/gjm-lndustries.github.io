const PHOTOS = [
  { src: "/images/landing/estudiante-800.webp", description: "Estudiante con uniforme estudiando en el patio del colegio", where: "Portada, «Pensado para estudiantes de grado 11»" },
  { src: "/images/landing/estudia-bus-480.webp", description: "Dos estudiantes revisando una pregunta en el celular en el bus", where: "Portada, «Estudia donde estés»" },
  { src: "/images/landing/estudia-casa-480.webp", description: "Estudiante tomando apuntes en la mesa de la cocina", where: "Portada, «Estudia donde estés»" },
  { src: "/images/landing/estudia-biblioteca-480.webp", description: "Estudiante escribiendo en una biblioteca pública", where: "Portada, «Estudia donde estés»" },
];

/** Créditos de las fotos y recursos gráficos usados en ProICFES. */
export default function Creditos() {
  return (
    <div className="max-w-3xl space-y-8">
      <header>
        <h1 className="page-title">Créditos de imágenes</h1>
        <p className="mt-1 text-[15px] text-muted-foreground">
          Las fotos de la portada son imágenes generadas con inteligencia artificial (Google Gemini) para ProICFES.
          No muestran a personas reales y se alojan en este mismo sitio.
        </p>
      </header>

      <section aria-labelledby="fotos">
        <h2 id="fotos" className="section-title mb-3">Imágenes de la portada</h2>
        <ul className="space-y-3">
          {PHOTOS.map(p => (
            <li key={p.src} className="card flex gap-4 p-4">
              <img src={p.src} alt="" width={96} height={72} loading="lazy" decoding="async" className="h-[72px] w-24 flex-shrink-0 rounded-lg object-cover" />
              <div className="min-w-0 text-sm">
                <p className="font-semibold text-foreground">{p.description}</p>
                <p className="mt-0.5 text-muted-foreground">
                  Imagen generada con IA (Google Gemini) para ProICFES · Se usa en: {p.where}
                </p>
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
        </ul>
      </section>
    </div>
  );
}
