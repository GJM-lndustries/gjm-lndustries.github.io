import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Lightbulb, Target } from "lucide-react";
import {
  AREA_INFO,
  DIFFICULTY_LABEL,
  INGLES_PARTES,
  getStimulus,
  type Question,
} from "@/data/questions";
import { TRAPS } from "@/data/questions/types";
import RichText from "./RichText";
import AreaIcon from "@/components/AreaIcon";
import { haptic } from "@/lib/feedback";

interface QuestionViewProps {
  question: Question;
  selected: string | null;
  answered: boolean;
  onSelect: (optionId: string) => void;
  /** Muestra área, competencia y nivel */
  showMeta?: boolean;
}

export default function QuestionView({
  question,
  selected,
  answered,
  onSelect,
  showMeta = false,
}: QuestionViewProps) {
  const stimulus = getStimulus(question.stimulusId);
  const isCorrect = selected === question.answer;
  const chosen = question.options.find(o => o.id === selected);
  const trap = !isCorrect && chosen?.trampa ? TRAPS[chosen.trampa] : null;

  // Vibración corta al ver la retroalimentación (solo Android; nada con «reducir movimiento»).
  useEffect(() => {
    if (answered && selected != null) haptic(isCorrect ? 12 : [24, 50, 24]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answered]);

  return (
    <div className="space-y-4" data-qid={question.id}>
      {showMeta && (
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="score-badge gap-1.5 border border-border bg-card pl-1 text-foreground">
            <AreaIcon area={question.area} size="sm" className="!h-5 !w-5 !rounded-md" />
            {AREA_INFO[question.area].label}
          </span>
          <span className="score-badge bg-muted text-muted-foreground border border-border">
            {question.competencia}
          </span>
          {question.componente && (
            <span className="score-badge bg-muted text-muted-foreground border border-border">
              Componente {question.componente.toLowerCase()}
            </span>
          )}
          {question.parte && (
            <span className="score-badge bg-muted text-muted-foreground border border-border">
              Parte {question.parte}:{" "}
              {INGLES_PARTES[question.parte].nombre.toLowerCase()}
            </span>
          )}
          <span className="score-badge bg-yellow-50 text-yellow-800 border border-yellow-200">
            Nivel {DIFFICULTY_LABEL[question.difficulty].toLowerCase()}
          </span>
        </div>
      )}

      {stimulus && (
        <section
          aria-label="Texto de la pregunta"
          className="bg-muted/50 rounded-xl p-4 border border-border"
        >
          <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
            {stimulus.title ?? "Lee este texto:"}
          </p>
          <RichText text={stimulus.text} className="text-sm text-foreground" />
        </section>
      )}

      <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
        <p className="text-sm font-semibold text-foreground leading-relaxed">
          {question.enunciado}
        </p>
      </div>

      <div
        className="space-y-2"
        role="group"
        aria-label="Opciones de respuesta"
      >
        {question.options.map(option => {
          let className = "answer-option";
          if (answered) {
            if (option.id === question.answer) className += " correct";
            else if (option.id === selected) className += " incorrect";
          } else if (option.id === selected) {
            className += " selected";
          }
          const markCorrect = answered && option.id === question.answer;
          const markWrong =
            answered && option.id === selected && option.id !== question.answer;
          if (option.ejemplo) {
            // Inglés parte 1: la palabra del ejemplo se ve, pero no se puede elegir (como en el cuadernillo).
            return (
              <div key={option.id} className="answer-option w-full cursor-default opacity-60" aria-disabled="true" data-ejemplo="true">
                <span className="w-7 h-7 rounded-full border-2 border-current flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {option.id.toUpperCase()}
                </span>
                <span className="text-sm line-through">{option.text}</span>
                <span className="ml-auto flex-shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                  Usada en el ejemplo
                </span>
              </div>
            );
          }
          return (
            <motion.button
              key={option.id}
              type="button"
              whileTap={!answered ? { scale: 0.98 } : {}}
              className={`w-full text-left ${className}`}
              onClick={() => onSelect(option.id)}
              disabled={answered}
              aria-pressed={option.id === selected}
            >
              <span
                className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  markCorrect
                    ? "border-green-500 bg-green-500 text-white"
                    : markWrong
                      ? "border-amber-500 bg-amber-100 text-amber-900"
                      : "border-current"
                }`}
              >
                {option.id.toUpperCase()}
              </span>
              <span className="text-sm">{option.text}</span>
              {markCorrect && (
                <CheckCircle2
                  className="anim-pop w-5 h-5 text-green-500 ml-auto flex-shrink-0"
                  aria-label="Respuesta correcta"
                />
              )}
              {markWrong && (
                <span className="ml-auto flex-shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-900">
                  Tu respuesta
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {answered && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            role="status"
            className={`rounded-xl p-4 border ${isCorrect ? "bg-green-50 border-green-200" : selected == null ? "bg-muted/60 border-border" : "bg-amber-50/80 border-amber-200"}`}
          >
            <div className="flex items-start gap-2 mb-2">
              {isCorrect ? (
                <CheckCircle2 className="anim-pop mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" aria-hidden="true" />
              ) : (
                <Lightbulb className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" aria-hidden="true" />
              )}
              <p className="text-sm">
                <span className={`font-bold ${isCorrect ? "text-green-800" : "text-foreground"}`}>
                  {isCorrect
                    ? "¡Bien! Esa es."
                    : selected == null
                      ? "No respondiste esta pregunta."
                      : "Casi. Mira el truco:"}
                </span>
                {!isCorrect && (
                  <span className="text-muted-foreground"> la correcta es la {question.answer.toUpperCase()}.</span>
                )}
              </p>
            </div>
            {trap && chosen && (
              <div className="mb-3 rounded-lg border border-amber-200 bg-white/70 p-3" data-testid="trampa">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">Por qué tu opción ({chosen.id.toUpperCase()}) no es</p>
                <p className="mt-1 text-sm text-foreground">
                  <span className="mr-1.5 inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900">{trap.nombre}</span>
                  {chosen.porQueNo}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{trap.idea}</p>
              </div>
            )}
            {!isCorrect && selected != null && (
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Por qué la {question.answer.toUpperCase()} sí</p>
            )}
            <p className="text-sm text-foreground">{question.explanation}</p>
            {question.tip && (
              <div className="mt-3 rounded-lg bg-white/70 p-2.5">
                <p className="text-xs text-foreground">
                  <span className="font-semibold">El truco: </span>
                  {question.tip}
                </p>
              </div>
            )}
            <p className="mt-3 flex items-start gap-1.5 border-t border-black/5 pt-2.5 text-xs text-muted-foreground" data-testid="que-evalua">
              <Target className="mt-px h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
              <span>
                <span className="font-semibold text-foreground">Qué evalúa: </span>
                {question.competencia}
                {question.componente ? ` · componente ${question.componente.toLowerCase()}` : ""}
                {question.tipoTexto ? ` · texto ${question.tipoTexto.toLowerCase()}` : ""}
                {question.categoria ? ` · ${question.categoria.toLowerCase()}` : ""}. {question.afirmacion}
              </span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
