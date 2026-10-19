import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { BellRing, CalendarPlus } from "lucide-react";
import { useProgress } from "@/contexts/ProgressContext";
import { dailyReminderIcs, defaultTimeFor, downloadIcs, examReminderIcs } from "@/lib/ics";
import { examWindowLabel, intentionSentence } from "@/lib/plan";

/**
 * «Agregar a mi calendario»: descarga un .ics con el reto diario y otro con el mes del examen.
 * Todo se arma en el navegador; no pedimos permisos de notificaciones ni guardamos nada.
 */
export default function CalendarReminder({ examOnly = false }: { examOnly?: boolean }) {
  const { progress } = useProgress();
  const plan = progress.plan;
  const minutes = plan?.dailyMinutes ?? 5;
  const [time, setTime] = useState(() => defaultTimeFor(plan?.studyMoment));
  const touched = useRef(false);
  // El progreso guardado llega después del primer render: ajusta la hora sugerida si no la ha cambiado.
  useEffect(() => { if (!touched.current) setTime(defaultTimeFor(plan?.studyMoment)); }, [plan?.studyMoment]);
  const [done, setDone] = useState<"" | "diario" | "examen">("");
  const exam = plan?.examWindow && plan.examWindow !== "nose" ? plan.examWindow : null;
  const examLabel = examWindowLabel(exam ?? undefined);

  const addDaily = () => {
    downloadIcs("reto-diario-proicfes.ics", dailyReminderIcs({ minutes, time, examWindow: exam ?? undefined, intention: plan?.studyMoment ? intentionSentence(minutes, plan.studyMoment) : undefined }));
    setDone("diario");
  };
  const addExam = () => {
    const ics = exam && examReminderIcs(exam);
    if (ics) downloadIcs("mi-icfes-proicfes.ics", ics);
    setDone("examen");
  };

  return (
    <section className="card p-5" aria-labelledby="calendario-titulo" data-testid="calendario">
      <div className="flex items-center gap-2">
        <CalendarPlus className="h-5 w-5 text-navy" aria-hidden="true" />
        <h2 id="calendario-titulo" className="font-['Lexend'] text-base font-bold text-foreground">Agregar a mi calendario</h2>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        {examOnly ? "Guarda el mes de tu examen en el calendario del celular." : "Un aviso a la hora que elijas y la fecha de tu examen, en el calendario de tu celular."} No necesitas cuenta.
      </p>

      {!examOnly && (
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <label className="block">
            <span className="block text-xs font-semibold text-foreground">Hora del reto ({minutes} min)</span>
            <input type="time" value={time} onChange={e => { touched.current = true; setTime(e.target.value || "18:00"); }} className="mt-1 min-h-11 rounded-lg border border-border bg-white px-3 font-['Lexend'] text-[15px] tabular-nums" aria-label="Hora del recordatorio diario" />
          </label>
          <button type="button" onClick={addDaily} className="btn-secondary btn-sm flex-1" data-testid="ics-diario">
            <BellRing className="h-4 w-4" aria-hidden="true" /> Aviso diario
          </button>
        </div>
      )}

      <div className="mt-3">
        {exam ? (
          <button type="button" onClick={addExam} className="btn-secondary btn-sm w-full" data-testid="ics-examen">
            <CalendarPlus className="h-4 w-4" aria-hidden="true" /> Mi examen: {examLabel}
          </button>
        ) : (
          <p className="text-xs text-muted-foreground">
            Para agregar tu examen, <Link href="/meta?paso=fecha" className="font-semibold text-navy underline underline-offset-2">elige cuándo lo presentas</Link>.
          </p>
        )}
      </div>

      <p className="mt-3 text-xs text-muted-foreground" role="status">
        {done === "diario" && "Listo. Abre el archivo y tócalo en «Agregar» para guardarlo en tu calendario."}
        {done === "examen" && "Listo. La fecha de 2027 es aproximada: cuando el ICFES publique el día exacto, cámbiala en tu calendario."}
        {!done && exam && <>La fecha exacta la publica el ICFES. <Link href="/cuando-y-cuanto-cuesta" className="underline underline-offset-2">Fechas y costos</Link></>}
      </p>
    </section>
  );
}
