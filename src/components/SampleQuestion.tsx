import { useState } from "react";
import type { Question } from "@/data/questions/types";
import { Check, X } from "lucide-react";
import RichText from "@/components/RichText";
import { haptic } from "@/lib/feedback";

/** Pregunta interactiva para la portada (sin guardar progreso). */
export default function SampleQuestion({ question }: { question: Question }) {
  const [choice, setChoice] = useState<string | null>(null);
  const answered = choice != null;
  const correct = answered && choice === question.answer;

  return (
    <div className="card p-5 sm:p-6">
      <p className="eyebrow">Ejemplo · Matemáticas</p>
      <div className="mt-2 text-base font-medium text-foreground">
        <RichText text={question.enunciado} />
      </div>
      <ul className="mt-4 space-y-2">
        {question.options.map(opt => {
          const selected = choice === opt.id;
          const isAnswer = answered && opt.id === question.answer;
          const isWrong = answered && selected && opt.id !== question.answer;
          let cls = "border-border bg-white hover:border-navy/40";
          if (isAnswer) cls = "border-green-600 bg-green-50";
          else if (isWrong) cls = "border-red-500 bg-red-50 anim-shake";
          else if (selected) cls = "border-navy bg-navy/5";
          return (
            <li key={opt.id}>
              <button
                type="button"
                disabled={answered}
                onClick={() => {
                  setChoice(opt.id);
                  haptic(opt.id === question.answer ? 12 : [24, 50, 24]);
                }}
                className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left text-[15px] transition-colors min-h-12 ${cls}`}
              >
                <span className="inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-border bg-white text-xs font-semibold text-navy">
                  {opt.id.toUpperCase()}
                </span>
                <span className="min-w-0 flex-1 pt-0.5"><RichText text={opt.text} inline /></span>
                {isAnswer ? <Check className="anim-pop mt-0.5 h-5 w-5 flex-shrink-0 text-green-700" aria-label="Respuesta correcta" /> : null}
                {isWrong ? <X className="anim-pop mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" aria-label="Tu respuesta (incorrecta)" /> : null}
              </button>
            </li>
          );
        })}
      </ul>
      {answered && (
        <div
          className={`anim-rise mt-4 rounded-xl p-4 text-sm ${correct ? "bg-green-50 text-green-900" : "bg-amber-50 text-amber-950"}`}
          role="status"
        >
          <p className="font-semibold">{correct ? "Correcto" : "No es esa. Mira la explicación"}</p>
          <div className="mt-1 opacity-90">
            <RichText text={question.explanation} />
          </div>
          <p className="mt-3 text-xs opacity-80">
            En ProICFES practicas cientos de preguntas como esta y tu progreso queda guardado.
          </p>
        </div>
      )}
    </div>
  );
}
