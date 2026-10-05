import { BookOpenText, Calculator, Check, FlaskConical, Flame, Landmark, Languages, PenLine, Target } from "lucide-react";

/**
 * Maqueta estática de la app en un celular para la portada. Reproduce la interfaz
 * real (reto de hoy, meta, áreas) con HTML/CSS propio: no es una foto ni una imagen generada.
 */
export default function PhoneMockup() {
  const week = ["L", "M", "M", "J", "V", "S", "D"];
  return (
    <figure className="relative mx-auto w-full max-w-[300px]" aria-label="Vista de la app ProICFES en un celular: reto de hoy, meta de puntaje y áreas">
      <div className="rounded-[2.75rem] bg-ink p-2.5 shadow-[0_30px_60px_-30px_rgba(15,32,64,0.55)]">
        <div className="relative overflow-hidden rounded-[2.25rem] bg-canvas" aria-hidden="true">
          {/* Barra superior */}
          <div className="flex items-center justify-between border-b border-border bg-white px-4 pb-2.5 pt-6">
            <div className="flex items-center gap-1.5">
              <img src="/icon.svg" alt="" width={18} height={18} className="h-[18px] w-[18px]" />
              <span className="font-['Lexend'] text-[13px] font-bold text-ink">ProICFES</span>
            </div>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-semibold text-orange-700">
              <Flame className="h-3 w-3" /> 5
            </span>
          </div>

          <div className="space-y-2.5 p-3">
            <div>
              <p className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">Lunes, 5 de octubre</p>
              <p className="font-['Lexend'] text-[15px] font-bold text-ink">Tu plan de hoy</p>
            </div>

            {/* Reto de hoy */}
            <div className="rounded-xl border border-border bg-white">
              <div className="flex items-center justify-between px-3 pb-2 pt-2.5">
                <div>
                  <p className="text-[7px] font-semibold uppercase tracking-wider text-muted-foreground">Reto de hoy</p>
                  <p className="text-[11px] font-semibold text-ink">Lee una lección y practica</p>
                </div>
                <span className="inline-flex items-center gap-0.5 rounded-full bg-orange-50 px-1.5 py-0.5 text-[9px] font-semibold text-orange-700">
                  <Flame className="h-2.5 w-2.5" /> 5 días
                </span>
              </div>
              <div className="divide-y divide-border border-y border-border">
                <MiniTask icon={<Check className="h-3.5 w-3.5" strokeWidth={2.5} />} tile="bg-brand-soft text-green-700" label="Lectura activa" pct={100} note="Hecho" />
                <MiniTask icon={<PenLine className="h-3.5 w-3.5" />} tile="bg-blue-50 text-blue-700" label="Práctica" pct={60} note="60%" />
              </div>
              <div className="grid grid-cols-7 gap-0.5 px-3 py-2.5">
                {week.map((d, i) => (
                  <div key={i} className="flex flex-col items-center gap-0.5">
                    <span className="text-[7px] text-muted-foreground">{d}</span>
                    <span
                      className={`flex h-[18px] w-[18px] items-center justify-center rounded-full ${
                        i < 4 ? "bg-brand text-ink" : i === 4 ? "border-[1.5px] border-navy" : "bg-muted"
                      }`}
                    >
                      {i < 4 ? <Check className="h-2.5 w-2.5" strokeWidth={3} /> : null}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Meta */}
            <div className="rounded-xl border border-border bg-white p-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-brand-soft text-green-700">
                  <Target className="h-3.5 w-3.5" />
                </span>
                <div>
                  <p className="text-[7px] font-semibold uppercase tracking-wider text-muted-foreground">Tu meta</p>
                  <p className="text-[11px] font-semibold text-ink">320 puntos</p>
                </div>
              </div>
              <p className="mt-2 font-['Lexend'] text-xl font-bold text-ink">
                284 <span className="text-[9px] font-normal text-muted-foreground">de 500 · estimado</span>
              </p>
              <div className="relative mt-1.5 h-1.5 rounded-full bg-muted">
                <div className="h-full w-[57%] rounded-full bg-navy" />
                <span className="absolute -top-0.5 left-[64%] h-2.5 w-0.5 rounded-full bg-brand" />
              </div>
            </div>

            {/* Áreas */}
            <div className="grid grid-cols-5 gap-1.5 pb-1">
              {[
                { I: Calculator, c: "bg-blue-50 text-blue-700", l: "Mat." },
                { I: BookOpenText, c: "bg-amber-50 text-amber-700", l: "Lect." },
                { I: FlaskConical, c: "bg-teal-50 text-teal-700", l: "Cien." },
                { I: Landmark, c: "bg-orange-50 text-orange-700", l: "Soc." },
                { I: Languages, c: "bg-violet-50 text-violet-700", l: "Ingl." },
              ].map(({ I, c, l }) => (
                <div key={l} className="flex flex-col items-center gap-0.5 rounded-lg border border-border bg-white py-1.5">
                  <span className={`inline-flex h-5 w-5 items-center justify-center rounded-md ${c}`}>
                    <I className="h-3 w-3" />
                  </span>
                  <span className="text-[7px] text-muted-foreground">{l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </figure>
  );
}

function MiniTask({ icon, tile, label, pct, note }: { icon: React.ReactNode; tile: string; label: string; pct: number; note: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2">
      <span className={`inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md ${tile}`}>{icon}</span>
      <div className="flex-1">
        <div className="flex justify-between">
          <span className="text-[10px] font-semibold text-ink">{label}</span>
          <span className="text-[8px] text-muted-foreground">{note}</span>
        </div>
        <div className="mt-1 h-1 rounded-full bg-muted">
          <div className="h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}
