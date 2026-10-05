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
    icon: <Target className="w-5 h-5" />,
    title: 'Estrategia General',
    color: 'bg-blue-50 border-blue-200 text-blue-700',
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
        content: 'Cuando no estés seguro, elimina las opciones que claramente están mal. Si eliminas 2 de 4 opciones, tienes 50% de probabilidad de acertar. Esto mejora mucho tus chances.'
      }
    ]
  },
  {
    id: 'matematicas',
    icon: <Calculator className="w-5 h-5" />,
    title: 'Matemáticas',
    color: 'bg-indigo-50 border-indigo-200 text-indigo-700',
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
    icon: <BookOpen className="w-5 h-5" />,
    title: 'Lectura Crítica',
    color: 'bg-amber-50 border-amber-200 text-amber-700',
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
    icon: <Brain className="w-5 h-5" />,
    title: 'Ciencias Naturales',
    color: 'bg-teal-50 border-teal-200 text-teal-700',
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
    icon: <Clock className="w-5 h-5" />,
    title: 'El Día del Examen',
    color: 'bg-green-50 border-green-200 text-green-700',
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
    <div className={`rounded-xl border-2 overflow-hidden ${section.color}`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-3">
          {section.icon}
          <span className="font-bold font-['Lexend'] text-base">{section.title}</span>
          <span className="text-xs opacity-70">{section.tips.length} consejos</span>
        </div>
        {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>
      
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white/60 border-t border-current/10 p-3 space-y-2">
              {section.tips.map((tip, idx) => (
                <div key={idx} className="bg-white rounded-lg overflow-hidden border border-current/10">
                  <button
                    onClick={() => setOpenTip(openTip === idx ? null : idx)}
                    className="w-full flex items-center justify-between p-3 text-left"
                  >
                    <div className="flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-yellow-500 flex-shrink-0" />
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
      <div>
        <h1 className="text-2xl font-bold font-['Lexend'] text-foreground">Estrategias y Consejos</h1>
        <p className="text-muted-foreground mt-1">
          Los trucos que usan los que sacan más de 360 puntos
        </p>
      </div>

      <div className="bg-gradient-to-br from-[#1e3a5f] to-[#0f2040] rounded-2xl p-5 text-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="text-3xl">🎯</div>
          <div>
            <h2 className="font-bold font-['Lexend'] text-lg">El secreto del 360+</h2>
            <p className="text-white/70 text-sm">No es solo estudiar más, es estudiar mejor</p>
          </div>
        </div>
        <p className="text-white/80 text-sm leading-relaxed">
          Los estudiantes que sacan más de 360 puntos no son necesariamente los más inteligentes. 
          Son los que conocen las estrategias del examen, practican con preguntas tipo ICFES y 
          administran bien su tiempo. ¡Tú puedes lograrlo!
        </p>
      </div>

      <div className="space-y-3">
        {tipSections.map(section => (
          <TipCard key={section.id} section={section} />
        ))}
      </div>
    </div>
  );
}
