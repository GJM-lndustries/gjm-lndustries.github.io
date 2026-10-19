import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Lightbulb, Target, Clock, Brain, BookOpen, Calculator } from 'lucide-react';
import { withMotion } from '@/components/withMotion';

interface TipSection {
  id: string;
  icon: React.ReactNode;
  title: string;
  color: string;
  tips: { title: string; content: string }[];
  /** Fuente oficial de la sección. */
  source?: { label: string; href: string };
}

const tipSections: TipSection[] = [
  {
    id: 'general',
    icon: <Target className="w-5 h-5" strokeWidth={1.75} />,
    title: 'Estrategia general',
    color: 'bg-navy/5 text-navy',
    tips: [
      {
        title: 'Responde todas: una mala no resta más que una en blanco',
        content: 'Una pregunta en blanco nunca suma, y una respuesta equivocada no te quita más que dejarla en blanco. Por eso, responde todas. Si no sabes, descarta lo que puedas y elige la opción que más te convenza (en Inglés varias partes tienen 3 opciones, no 4). El ICFES calcula el puntaje con un modelo estadístico (TRI de 3 parámetros), no sumando aciertos.'
      },
      {
        title: 'Administra tu tiempo: unos 2 minutos por pregunta',
        content: 'Cada sesión dura 4 horas y 30 minutos. La primera tiene 143 preguntas (120 con puntaje) y la segunda 159 (134 con puntaje), contando dos cuestionarios cortos que no dan puntaje (socioeconómico y de clima escolar). Eso da unos 2 minutos por pregunta, y la segunda sesión es un poco más apretada. Si una pregunta te toma más de 3 minutos, márcala y vuelve al final.'
      },
      {
        title: 'Lee las preguntas antes del texto',
        content: 'En Lectura crítica, lee primero las preguntas y luego el texto. Así sabes exactamente qué buscar y no pierdes tiempo leyendo lo que no necesitas.'
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
        title: 'Practica sin calculadora',
        content: 'En el examen no se permite calculadora: solo tienes la hoja de operaciones que entrega el ICFES (no se califica, pero se devuelve). Haz tus cuentas a mano desde ya y dibuja un esquema rápido en los problemas de geometría o distancias.'
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
    title: 'Lectura crítica',
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
        content: '"Sin embargo", "pero" y "aunque" indican contraste. "Por lo tanto", "entonces" y "así que" indican conclusión. "Porque", "ya que" y "puesto que" indican causa. Identificar el conector te dice la relación entre las ideas.'
      }
    ]
  },
  {
    id: 'ciencias',
    icon: <Brain className="w-5 h-5" strokeWidth={1.75} />,
    title: 'Ciencias naturales',
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
    source: { label: 'ICFES: guía de orientación Saber 11 2026 y Resolución 103 de 2025', href: 'https://www.icfes.gov.co/wp-content/uploads/2026/03/17-marzo-guia-de-orientacion-saber-11-2026-2.pdf' },
    tips: [
      {
        title: 'La noche anterior: descansa bien',
        content: 'No estudies hasta las 2am el día antes. Dormir bien es más importante que repasar una hora más. Tu cerebro necesita descanso para funcionar bien. Duerme al menos 7-8 horas.'
      },
      {
        title: 'Come bien antes del examen',
        content: 'Desayuna bien: proteínas y carbohidratos (huevos, arepa, fruta). Evita el exceso de azúcar que te da energía rápida pero luego te baja. Entre la sesión 1 y la 2 tienes que salir del sitio y volver, así que planea dónde vas a almorzar cerca.'
      },
      {
        title: 'Lleva lo obligatorio y llega temprano',
        content: 'Obligatorio: documento de identidad original (si es digital, desde la app de la Registraduría; fotos o impresiones no sirven), lápiz de mina No. 2, borrador de nata y tajalápiz. Sin documento válido no puedes presentar. La sesión 1 empieza a las 7:00 a. m. y el ICFES pide llegar al menos 15 minutos antes. Consulta tu citación (sitio, salón y horario) en icfes.gov.co, opción Citaciones: no llega al correo.'
      },
      {
        title: 'Lo que está prohibido',
        content: 'Celular, reloj inteligente, calculadora, audífonos y cualquier aparato electrónico. Tampoco puedes hablar con otros en el salón ni tomar o subir fotos del cuadernillo a redes: si pasa, el ICFES termina tu examen en el acto y no obtienes resultados. Si llevas el celular, lo guardas en la bolsa de seguridad hasta el final.'
      },
      {
        title: 'Ve a las dos sesiones',
        content: 'Solo hay resultados para quienes asisten a todas las sesiones. No te vayas después de la mañana aunque sientas que te fue bien o estés cansado.'
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
        <span className="flex items-center gap-3">
          <span className={`icon-tile ${section.color}`} aria-hidden="true">{section.icon}</span>
          <span>
            <span className="block font-['Lexend'] text-[15px] font-semibold text-foreground">{section.title}</span>
            <span className="block text-xs text-muted-foreground">{section.tips.length} consejos</span>
          </span>
        </span>
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
                    aria-expanded={openTip === idx}
                    className="w-full flex items-center justify-between p-3 text-left"
                  >
                    <span className="flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-600 flex-shrink-0" strokeWidth={1.75} aria-hidden="true" />
                      <span className="text-sm font-semibold text-foreground">{tip.title}</span>
                    </span>
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
              {section.source && (
                <p className="px-1 pt-1 text-xs text-muted-foreground">
                  Fuente:{' '}
                  <a href={section.source.href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-foreground">
                    {section.source.label}
                  </a>
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Tips() {
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

export default withMotion(Tips);
