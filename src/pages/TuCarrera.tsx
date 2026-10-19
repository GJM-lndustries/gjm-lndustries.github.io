import { Link } from "wouter";
import { ExternalLink, Scale } from "lucide-react";
import { useProgress } from "@/contexts/ProgressContext";
import { ADMISIONES_CHECKED, INSTITUCIONES, USO_LABEL, promedioPolicia, type Institucion } from "@/data/admisiones";
import { AREA_INFO } from "@/data/questions/meta";

function Card({ inst, destacada, policia }: { inst: Institucion; destacada: boolean; policia: number | null }) {
  return (
    <article id={inst.id} className={`card p-5 ${destacada ? "ring-2 ring-navy" : ""}`} data-testid={`inst-${inst.id}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-['Lexend'] text-lg font-bold text-foreground">{inst.nombre}</h2>
        {inst.ciudad && <span className="text-xs text-muted-foreground">{inst.ciudad}</span>}
      </div>
      {destacada && <p className="mt-1 text-xs font-semibold text-navy">Es la meta que elegiste</p>}
      <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Cómo usa el ICFES">
        {inst.usos.map(u => (
          <li key={u} className="rounded-full bg-navy/5 px-2.5 py-0.5 text-xs font-semibold text-navy">{USO_LABEL[u]}</li>
        ))}
      </ul>
      <p className="mt-3 text-[15px] font-semibold text-foreground">{inst.resumen}</p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-foreground/90">
        {inst.puntos.map(p => <li key={p}>{p}</li>)}
      </ul>
      {inst.areas && (
        <p className="mt-3 text-sm text-foreground">
          <span className="font-semibold">Áreas que cuentan:</span> {inst.areas.map(a => AREA_INFO[a].label).join(", ")}.
        </p>
      )}
      {inst.id === "policia" && policia != null && (
        <p className="mt-2 rounded-lg bg-brand-soft/70 px-3 py-2 text-sm text-foreground" data-testid="promedio-policia">
          Con lo que llevas practicado, tu promedio estimado en esas cuatro áreas es <strong>{policia}</strong> de 100. Es un estimado de práctica, no tu resultado.
        </p>
      )}
      <p className="mt-3 text-sm text-muted-foreground"><span className="font-semibold text-foreground">Para estudiar:</span> {inst.consejo}</p>
      <p className="mt-3 text-xs text-muted-foreground">
        Fuente{inst.fuentes.length > 1 ? "s" : ""}:{" "}
        {inst.fuentes.map((f, i) => (
          <span key={f.url}>
            {i > 0 && " · "}
            <a href={f.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 underline underline-offset-2">
              {f.label} <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </a>
          </span>
        ))}
      </p>
    </article>
  );
}

export default function TuCarrera() {
  const { progress, estimate } = useProgress();
  const meta = progress.career;
  const lista = [...INSTITUCIONES].sort((a, b) => Number(Boolean(b.metas?.includes(meta))) - Number(Boolean(a.metas?.includes(meta))));
  const pol = promedioPolicia(Object.fromEntries(Object.entries(estimate.perArea).filter(([, v]) => v != null)) as never);
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="page-title">Lo que más pesa para tu carrera</h1>
        <p className="mt-2 text-muted-foreground">
          Cada institución usa el ICFES a su manera: unas piden un mínimo para inscribirte, otras ponderan tus áreas, otras dan becas desde cierto puntaje, y algunas, como la Nacional o la de Antioquia, admiten con su propio examen.
        </p>
      </div>
      <div className="flex items-start gap-3 rounded-xl bg-navy/5 p-4 text-sm text-foreground">
        <Scale className="mt-0.5 h-5 w-5 flex-shrink-0 text-navy" aria-hidden="true" />
        <p>
          Solo ponemos lo que dicen las páginas oficiales de cada institución, consultadas el {ADMISIONES_CHECKED}. Las reglas cambian con cada convocatoria: antes de decidir, revisa la página de admisiones de la tuya. En las públicas la matrícula puede ser gratis para estratos 1, 2 y 3 si cumples los requisitos (Ley 2307 de 2023), pero primero tienes que ser admitido.
        </p>
      </div>
      {lista.map(inst => (
        <Card key={inst.id} inst={inst} destacada={Boolean(inst.metas?.includes(meta))} policia={inst.id === "policia" ? pol : null} />
      ))}
      <p className="text-sm text-muted-foreground">
        ¿Cuándo es el examen y cuánto cuesta? Mira <Link href="/cuando-y-cuanto-cuesta" className="font-semibold text-navy underline underline-offset-2">fechas y tarifas</Link>.
      </p>
    </div>
  );
}
