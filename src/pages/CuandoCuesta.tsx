import { Link } from "wouter";
import { CalendarDays, ExternalLink, Info, School, Wallet } from "lucide-react";
import CalendarReminder from "@/components/CalendarReminder";
import { CALENDARIO_2026, CHECKED_LABEL, FEES_2026, SOURCES, formatCOP } from "@/data/examInfo";

function Fuente({ s }: { s: { label: string; url: string } }) {
  return (
    <a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 underline underline-offset-2">
      {s.label} <ExternalLink className="h-3 w-3" aria-hidden="true" />
    </a>
  );
}

export default function CuandoCuesta() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="page-title">¿Cuándo es mi ICFES y cuánto cuesta?</h1>
        <p className="mt-2 text-muted-foreground">Fechas y tarifas oficiales del Saber 11, tomadas de icfes.gov.co. Revisado el {CHECKED_LABEL}.</p>
      </div>

      <section className="card border-amber-300/60 bg-amber-50/60 p-5" aria-labelledby="b2027" data-testid="aviso-2027">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-700" aria-hidden="true" />
          <div>
            <h2 id="b2027" className="font-['Lexend'] text-base font-bold text-foreground">Las fechas de 2027 todavía no son oficiales</h2>
            <p className="mt-1 text-sm text-foreground/90">
              Al {CHECKED_LABEL}, el ICFES no ha publicado el calendario B 2027 (examen de marzo) ni el calendario A 2027. Tampoco la resolución de tarifas 2027, que en 2025 salió el 11 de noviembre. Hasta entonces, abajo están las fechas y tarifas oficiales de 2026 como referencia.
            </p>
            <p className="mt-2 text-sm text-foreground/90">
              Como guía: el calendario B suele presentarse en marzo, y el calendario A presentó el 26 de julio en 2026. Confirma siempre en el <Fuente s={SOURCES.cronograma} />.
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="fechas" className="space-y-3">
        <h2 id="fechas" className="flex items-center gap-2 font-['Lexend'] text-lg font-bold text-foreground">
          <CalendarDays className="h-5 w-5 text-navy" aria-hidden="true" /> Fechas oficiales 2026
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {CALENDARIO_2026.map(c => (
            <article key={c.id} className="card p-4" data-testid={`fechas-${c.id}`}>
              <h3 className="font-semibold text-foreground">{c.nombre}</h3>
              <dl className="mt-2 space-y-1.5 text-sm">
                {([
                  ["Inscripción ordinaria", c.registroOrdinario],
                  ["Inscripción extraordinaria", c.registroExtraordinario],
                  ["Citaciones", c.citaciones],
                  ["Examen", c.aplicacion],
                  ["Resultados", c.resultados],
                ] as const).map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className={`text-right ${k === "Examen" ? "font-semibold text-foreground" : "text-foreground"}`}>{v}</dd>
                  </div>
                ))}
              </dl>
            </article>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Fuentes: <Fuente s={SOURCES.cronograma} /> y <Fuente s={SOURCES.calendarioA2026} />.
        </p>
      </section>

      <section aria-labelledby="tarifas" className="space-y-3">
        <h2 id="tarifas" className="flex items-center gap-2 font-['Lexend'] text-lg font-bold text-foreground">
          <Wallet className="h-5 w-5 text-navy" aria-hidden="true" /> Cuánto cuesta (tarifas 2026)
        </h2>
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-sm" data-testid="tabla-tarifas">
            <caption className="sr-only">Tarifas del examen Saber 11 en 2026, en pesos colombianos</caption>
            <thead>
              <tr className="bg-navy/5 text-left">
                <th scope="col" className="px-4 py-2.5 font-semibold">Quién presenta</th>
                <th scope="col" className="px-3 py-2.5 text-right font-semibold">Ordinaria</th>
                <th scope="col" className="px-4 py-2.5 text-right font-semibold">Extraordinaria</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {FEES_2026.map((f, i) => (
                <tr key={i}>
                  <th scope="row" className="px-4 py-2.5 text-left font-medium text-foreground">
                    {f.poblacion}
                    {f.detalle && <span className="block text-xs font-normal text-muted-foreground">{f.detalle}</span>}
                  </th>
                  <td className="px-3 py-2.5 text-right tabular-nums">{formatCOP(f.ordinaria)}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">{formatCOP(f.extraordinaria)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-foreground/90">
          Si la inscripción se paga en el plazo <strong>extraordinario</strong>, cuesta un 50 % más. Vale la pena recordarle al colegio las fechas del ordinario.
        </p>
        <p className="text-xs text-muted-foreground">
          Fuente: <Fuente s={SOURCES.tarifas} /> (<Fuente s={SOURCES.resolucionTarifas} />). Las tarifas de 2027 se fijan con una resolución nueva y pueden cambiar.
        </p>
      </section>

      <section aria-labelledby="quien" className="card space-y-2 p-5">
        <h2 id="quien" className="flex items-center gap-2 font-['Lexend'] text-base font-bold text-foreground">
          <School className="h-5 w-5 text-navy" aria-hidden="true" /> ¿Quién me inscribe?
        </h2>
        <p className="text-sm text-foreground/90">
          Si estás en grado 11, <strong>te inscribe tu colegio</strong> en la plataforma PRISMA del ICFES. El colegio registra un correo tuyo, que es el canal oficial para citaciones y avisos: revisa que esté bien escrito.
        </p>
        <p className="text-sm text-foreground/90">
          Si ya eres bachiller, te inscribes tú mismo como «individual». Pre Saber (para 9.° y 10.°) y Validación del Bachillerato (desde los 18 años, si no estás en un colegio) se presentan el mismo día que el Saber 11.
        </p>
        <p className="text-xs text-muted-foreground">
          Fuentes: <Fuente s={SOURCES.inscripcion} />, <Fuente s={SOURCES.preSaber} /> y <Fuente s={SOURCES.validacion} />.
        </p>
      </section>

      <CalendarReminder examOnly />

      <p className="text-sm text-muted-foreground">
        ¿Cómo se usa tu puntaje para entrar a estudiar? Mira <Link href="/lo-que-mas-pesa" className="font-semibold text-navy underline underline-offset-2">lo que más pesa para tu carrera</Link>.
      </p>
    </div>
  );
}
