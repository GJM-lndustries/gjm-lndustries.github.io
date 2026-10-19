import { Link } from "wouter";
import { ChevronRight, RotateCcw } from "lucide-react";
import type { Question } from "@/data/questions";

/** Minutos estimados para repasar N preguntas (unos 90 s cada una, con la explicación). */
export function recoveryMinutes(n: number): number {
  return Math.max(1, Math.round(n * 1.5));
}

const SOURCE = "https://normograma.icfes.gov.co/compilacion/docs/resolucion_icfes_0268_2020.htm";

/**
 * «Puntos fáciles por recuperar»: las preguntas de nivel básico que se escaparon, primero.
 * Sin miedo ni cifras inventadas: solo que en el modelo del ICFES fallar una fácil pesa más.
 */
export default function EasyRecovery({ questions, onStart, href }: { questions: Question[]; onStart?: () => void; href?: string }) {
  const n = questions.length;
  if (n === 0) return null;
  const label = <>Recupéralas en {recoveryMinutes(n)} {recoveryMinutes(n) === 1 ? "minuto" : "minutos"} <ChevronRight className="h-5 w-5" aria-hidden="true" /></>;
  return (
    <section className="card border-brand/40 p-5" aria-labelledby="puntos-faciles" data-testid="puntos-faciles">
      <div className="flex items-start gap-3">
        <span className="icon-tile bg-brand-soft text-green-700" aria-hidden="true"><RotateCcw className="h-5 w-5" strokeWidth={1.75} /></span>
        <div className="min-w-0 flex-1">
          <h2 id="puntos-faciles" className="section-title">
            {n === 1 ? "Tienes 1 punto fácil por recuperar" : `Tienes ${n} puntos fáciles por recuperar`}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {n === 1 ? "Es una pregunta de nivel básico que se te escapó." : `Son ${n} preguntas de nivel básico que se te escaparon.`} En el ICFES, fallar una fácil pesa más que fallar una difícil, porque el puntaje tiene en cuenta la dificultad de cada pregunta.{" "}
            <a href={SOURCE} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-foreground">Fuente: Resolución ICFES 268 de 2020</a>.
          </p>
        </div>
      </div>
      {href ? (
        <Link href={href} className="btn-primary mt-4 w-full">{label}</Link>
      ) : (
        <button type="button" onClick={onStart} className="btn-primary mt-4 w-full">{label}</button>
      )}
    </section>
  );
}
