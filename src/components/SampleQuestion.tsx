import { useState } from "react";
import type { Question } from "@/data/questions/types";
import RichText from "@/components/RichText";

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
          let cls = "border-border bg-white hover:border-navy/40";
          if (answered && opt.id === question.answer) cls = "border-green-600 bg-green-50";
          else if (answered && selected) cls = "border-red-500 bg-red-50";
          else if (selected) cls = "border-navy bg-navy/5";
          return (
            <li key={opt.id}>
              <button
                type="button"
                disabled={answered}
                onClick={() => setChoice(opt.id)}
                className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left text-[15px] transition-colors min-h-12 ${cls}`}
              >
                <span className="inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-border bg-white text-xs font-semibold text-navy">
                  {opt.id.toUpperCase()}
                </span>
                <span className="min-w-0 pt-0.5"><RichText text={opt.text} /></span>
              </button>
            </li>
          );
        })}
      </ul>
      {answered && (
        <div
          className={`mt-4 rounded-xl p-4 text-sm ${correct ? "bg-green-50 text-green-900" : "bg-amber-50 text-amber-950"}`}
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
