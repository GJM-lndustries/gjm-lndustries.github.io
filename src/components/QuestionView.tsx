import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Lightbulb } from "lucide-react";
import {
  AREA_INFO,
  DIFFICULTY_LABEL,
  INGLES_PARTES,
  getStimulus,
  type Question,
} from "@/data/questions";
import RichText from "./RichText";
import AreaIcon from "@/components/AreaIcon";

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

  return (
    <div className="space-y-4">
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
                      ? "border-red-500 bg-red-500 text-white"
                      : "border-current"
                }`}
              >
                {option.id.toUpperCase()}
              </span>
              <span className="text-sm">{option.text}</span>
              {markCorrect && (
                <CheckCircle2
                  className="w-5 h-5 text-green-500 ml-auto flex-shrink-0"
                  aria-label="Respuesta correcta"
                />
              )}
              {markWrong && (
                <XCircle
                  className="w-5 h-5 text-red-500 ml-auto flex-shrink-0"
                  aria-label="Tu respuesta (incorrecta)"
                />
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
            className={`rounded-xl p-4 border ${isCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
          >
            <div className="flex items-center gap-2 mb-2">
              {isCorrect ? (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
              <span
                className={`font-bold text-sm ${isCorrect ? "text-green-800" : "text-red-800"}`}
              >
                {isCorrect
                  ? "¡Correcto!"
                  : selected == null
                    ? `No respondiste esta pregunta. La correcta es la ${question.answer.toUpperCase()}.`
                    : `Respuesta incorrecta. La correcta es la ${question.answer.toUpperCase()}.`}
              </span>
            </div>
            <p className="text-sm text-foreground">{question.explanation}</p>
            {question.tip && (
              <div className="mt-3 flex items-start gap-2 bg-white/60 rounded-lg p-2">
                <Lightbulb className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-foreground">
                  <span className="font-semibold">Consejo: </span>
                  {question.tip}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
