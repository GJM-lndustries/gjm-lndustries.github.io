import { useState } from "react";
import type { Question } from "@/data/questions/types";
import RichText from "@/components/RichText";

/** Pregunta interactiva para la portada (sin guardar progreso). */
export default function SampleQuestion({ question }: { question: Question }) {
  const [choice, setChoice] = useState<string | null>(null);
  const answered = choice != null;
  const correct = answered && choice === question.answer;

  return (
    <div className="rounded-2xl border border-border bg-[#f7f8fa] p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#1e3a5f]/70">Ejemplo · Matemáticas</p>
      <div className="mt-2 text-base font-medium text-foreground">
        <RichText text={question.enunciado} />
      </div>
      <ul className="mt-4 space-y-2">
        {question.options.map(opt => {
          const selected = choice === opt.id;
          let cls = "border-border bg-white hover:border-[#1e3a5f]/40";
          if (answered && opt.id === question.answer) cls = "border-green-600 bg-green-50";
          else if (answered && selected) cls = "border-red-500 bg-red-50";
          else if (selected) cls = "border-[#1e3a5f] bg-[#1e3a5f]/5";
          return (
            <li key={opt.id}>
              <button
                type="button"
                disabled={answered}
                onClick={() => setChoice(opt.id)}
                className={`w-full rounded-xl border-2 px-4 py-3 text-left text-sm transition-colors min-h-12 ${cls}`}
              >
                <span className="mr-2 font-bold text-[#1e3a5f]">{opt.id.toUpperCase()}.</span>
                <RichText text={opt.text} />
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
          <p className="font-semibold">{correct ? "Correcto" : "Casi — mira la explicación"}</p>
          <div className="mt-1 opacity-90">
            <RichText text={question.explanation} />
          </div>
          <p className="mt-3 text-xs opacity-80">
            En la app guardamos tu progreso y puedes practicar cientos de preguntas así.
          </p>
        </div>
      )}
    </div>
  );
}
