import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Lightbulb, Target, Clock, Brain, BookOpen, Calculator } from 'lucide-react';

interface TipSection {
  id: string;
  icon: React.ReactNode;
  title: string;
  color: string;
  tips: { title: string; content: string }[];
}

const tipSections: TipSection[] = [
  {
    id: 'general',
    icon: <Target className="w-5 h-5" strokeWidth={1.75} />,
    title: 'Estrategia general',
    color: 'bg-navy/5 text-navy',
    tips: [
      {
        title: 'El ICFES no penaliza respuestas incorrectas',
        content: 'A diferencia de otros exámenes, en el ICFES NO te quitan puntos por responder mal. Esto significa que SIEMPRE debes responder todas las preguntas, aunque no estés seguro. Si no sabes, adivina: tienes 25% de probabilidad de acertar.'
      },
      {
        title: 'Administra tu tiempo: 2.5 minutos por pregunta',
        content: 'Cada sesión dura 4 horas y 30 minutos. En la primera hay 120 preguntas con puntaje y en la segunda 134, además de unos cuestionarios cortos: calcula unos 2 minutos por pregunta. Si una pregunta te toma más de 3 minutos, márcala y pasa a la siguiente. Vuelve al final si te queda tiempo.'
      },
      {
        title: 'Lee las preguntas antes del texto',
        content: 'En Lectura Crítica, lee primero las preguntas y luego el texto. Así sabes exactamente qué buscar y no pierdes tiempo leyendo lo que no necesitas.'
      },
      {
        title: 'Elimina opciones incorrectas',
        content: 'Cuando no estés seguro, elimina las opciones que claramente están mal. Si eliminas 2 de 4 opciones, tienes 50% de probabilidad de acertar. Así mejoras mucho tus probabilidades.'
      }
    ]
  },
  {
    id: 'matematicas',
    icon: <Calculator className="w-5 h-5" strokeWidth={1.75} />,
    title: 'Matemáticas',
    color: 'bg-blue-50 text-blue-700',
    tips: [
      {
        title: 'Reemplaza números para verificar expresiones',
        content: 'Cuando tengas opciones con expresiones algebraicas (como 2x+5 o 3n-1), reemplaza un número sencillo (como x=2 o n=3) en cada opción y verifica cuál da el resultado correcto según el problema. Esto es más rápido que resolver la ecuación completa.'
      },
      {
        title: 'En estadística: identifica qué piden',
        content: '"El valor que más se repite" = Moda. "El valor del medio" = Mediana. "El promedio" = Media. Lee bien la pregunta: estas palabras clave te dicen exactamente qué calcular.'
      },
      {
        title: 'Dibuja cuando sea posible',
        content: 'Para problemas de geometría, áreas o distancias, haz un dibujo rápido en el papel de borrador. Un dibujo puede ahorrarte mucho tiempo de cálculo.'
      },
      {
        title: 'Verifica con el sentido común',
        content: 'Después de calcular, pregúntate: ¿tiene sentido este resultado? Si el problema dice que hay 30 estudiantes y tu respuesta da 150, algo está mal. El sentido común es tu mejor verificador.'
      }
    ]
  },
  {
    id: 'lectura',
    icon: <BookOpen className="w-5 h-5" strokeWidth={1.75} />,
    title: 'Lectura Crítica',
    color: 'bg-amber-50 text-amber-700',
    tips: [
      {
        title: 'La respuesta siempre está en el texto',
        content: 'En preguntas literales ("Según el texto..."), la respuesta está escrita directamente. No uses tu conocimiento previo ni lo que tú crees. Busca las palabras clave de la pregunta en el texto.'
      },
      {
        title: 'Cuidado con las opciones "casi correctas"',
        content: 'El ICFES pone opciones que parecen correctas pero tienen una pequeña diferencia. Lee cada opción completamente. Una sola palabra puede hacer que una opción sea incorrecta.'
      },
      {
        title: 'Identifica el tipo de pregunta',
        content: '"Según el texto..." = literal (busca en el texto). "Se puede concluir..." = inferencial (razona con el texto). "El propósito del autor..." = crítico (analiza por qué escribió esto). Cada tipo requiere una estrategia diferente.'
      },
      {
        title: 'Los conectores son clave',
        content: '"Sin embargo", "pero", "aunque" → contraste. "Por lo tanto", "entonces", "así que" → conclusión. "Porque", "ya que", "puesto que" → causa. Identificar el conector te dice la relación entre las ideas.'
      }
    ]
  },
  {
    id: 'ciencias',
    icon: <Brain className="w-5 h-5" strokeWidth={1.75} />,
    title: 'Ciencias Naturales',
    color: 'bg-teal-50 text-teal-700',
    tips: [
      {
        title: 'El ICFES evalúa razonamiento, no memorización',
        content: 'No necesitas memorizar tablas periódicas ni fórmulas complicadas. El ICFES te da un experimento o situación y te pregunta si puedes razonar sobre qué pasaría. Practica el pensamiento científico: observar, hipotetizar, concluir.'
      },
      {
        title: 'En experimentos: identifica variables',
        content: 'Variable independiente = lo que el científico cambia. Variable dependiente = lo que se mide. Variable controlada = lo que se mantiene igual. Estas son las preguntas más frecuentes en Ciencias.'
      },
      {
        title: 'Conecta con la vida cotidiana',
        content: 'El ICFES siempre usa ejemplos cotidianos. La fotosíntesis = las plantas hacen su comida con luz solar. La inercia = por qué te vas hacia adelante cuando el bus frena. Conecta los conceptos con lo que ya conoces.'
      }
    ]
  },
  {
    id: 'tiempo',
    icon: <Clock className="w-5 h-5" strokeWidth={1.75} />,
    title: 'El día del examen',
    color: 'bg-green-50 text-green-700',
    tips: [
      {
        title: 'La noche anterior: descansa bien',
        content: 'No estudies hasta las 2am el día antes. Dormir bien es más importante que repasar una hora más. Tu cerebro necesita descanso para funcionar bien. Duerme al menos 7-8 horas.'
      },
      {
        title: 'Come bien antes del examen',
        content: 'Desayuna bien: proteínas y carbohidratos (huevos, arepa, fruta). Evita el exceso de azúcar que te da energía rápida pero luego te baja. Lleva agua y algo para comer en el descanso.'
      },
      {
        title: 'Llega temprano y con todo listo',
        content: 'Llega 30 minutos antes. Lleva: documento de identidad, lápiz y borrador (si permiten), agua. Revisa el día anterior dónde queda el lugar del examen para no estresarte el día del examen.'
      },
      {
        title: 'Mantén la calma',
        content: 'Si te bloqueas en una pregunta, respira profundo y pasa a la siguiente. No te quedes atascado. Al final, vuelve a las que dejaste. El estrés es el peor enemigo del desempeño en un examen.'
      }
    ]
  }
];

function TipCard({ section }: { section: TipSection }) {
  const [expanded, setExpanded] = useState(false);
  const [openTip, setOpenTip] = useState<number | null>(null);

  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        className="w-full flex items-center justify-between gap-3 p-4 text-left"
      >
        <div className="flex items-center gap-3">
          <span className={`icon-tile ${section.color}`} aria-hidden="true">{section.icon}</span>
          <span>
            <span className="block font-['Lexend'] text-[15px] font-semibold text-foreground">{section.title}</span>
            <span className="block text-xs text-muted-foreground">{section.tips.length} consejos</span>
          </span>
        </div>
        {expanded ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
      </button>
      
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-2 border-t border-border bg-muted/40 p-3">
              {section.tips.map((tip, idx) => (
                <div key={idx} className="overflow-hidden rounded-xl border border-border bg-card">
                  <button
                    onClick={() => setOpenTip(openTip === idx ? null : idx)}
                    className="w-full flex items-center justify-between p-3 text-left"
                  >
                    <div className="flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-600 flex-shrink-0" strokeWidth={1.75} aria-hidden="true" />
                      <span className="text-sm font-semibold text-foreground">{tip.title}</span>
                    </div>
                    {openTip === idx ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    )}
                  </button>
                  <AnimatePresence>
                    {openTip === idx && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        <p className="px-3 pb-3 text-sm text-muted-foreground leading-relaxed border-t border-border pt-2">
                          {tip.content}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Tips() {
  return (
    <div className="space-y-5">
      <header>
        <h1 className="page-title">Estrategias para el examen</h1>
        <p className="mt-1 text-[15px] text-muted-foreground">
          Cómo leer las preguntas, manejar el tiempo y descartar opciones.
        </p>
      </header>

      <div className="card flex items-start gap-4 p-5">
        <span className="icon-tile bg-brand-soft text-green-700" aria-hidden="true">
          <Target className="h-5 w-5" strokeWidth={1.75} />
        </span>
        <div>
          <h2 className="section-title">Estudiar mejor, no solo más</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Conocer el formato del examen, practicar con preguntas tipo ICFES y llevar un buen ritmo
            pesa tanto como saber los temas. Estas estrategias te ayudan con las tres cosas.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {tipSections.map(section => (
          <TipCard key={section.id} section={section} />
        ))}
      </div>
    </div>
  );
}
