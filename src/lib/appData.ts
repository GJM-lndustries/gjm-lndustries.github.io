// ProICFES - Contenido de las lecciones
// Las preguntas viven en el banco JSON (src/data/questions); aquí solo se referencian por id.

import type { AreaId } from '@/data/questions/types';

export type Difficulty = 'facil' | 'medio' | 'dificil';
export type Level = 'basico' | 'intermedio' | 'avanzado' | 'experto';

export interface GlossaryTerm {
  term: string;
  simple: string; // Explicación en lenguaje cotidiano
  technical: string; // Definición técnica
}

export interface Lesson {
  id: string;
  title: string;
  subtitle: string;
  level: Level;
  difficulty: Difficulty;
  duration: number; // minutos
  xp: number;
  content: LessonContent[];
  questionIds: string[]; // ids del banco de preguntas (src/data/questions)
  glossary: GlossaryTerm[];
}

export interface LessonContent {
  type: 'intro' | 'explanation' | 'example' | 'tip' | 'warning';
  title?: string;
  text: string;
  highlight?: string; // Texto destacado
}

export interface Module {
  id: string;
  area: AreaId; // área del banco de preguntas
  title: string;
  subtitle: string;
  description: string;
  color: string;
  bgColor: string;
  icon: string;
  image: string;
  lessons: Lesson[];
  totalXp: number;
}

// ============================================================
// DATOS DE LECCIONES - MATEMÁTICAS
// ============================================================

const mathLessons: Lesson[] = [
  {
    id: 'math-1',
    title: 'Números y Operaciones Básicas',
    subtitle: 'Suma, resta, multiplicación y división',
    level: 'basico',
    difficulty: 'facil',
    duration: 15,
    xp: 50,
    glossary: [
      {
        term: 'Operación aritmética',
        simple: 'Es hacer cuentas: sumar, restar, multiplicar o dividir números.',
        technical: 'Proceso matemático que combina dos o más números para obtener un resultado.'
      },
      {
        term: 'Cociente',
        simple: 'El resultado de dividir un número entre otro. Si divides 10 entre 2, el cociente es 5.',
        technical: 'Resultado de una operación de división.'
      }
    ],
    content: [
      {
        type: 'intro',
        title: '¿Para qué sirve esto en el ICFES?',
        text: 'En el ICFES siempre hay preguntas donde tienes que hacer cuentas básicas. Pero no te preocupes: no te piden memorizar fórmulas raras, sino entender cómo usar los números en situaciones de la vida real, como calcular precios, promedios o comparar cantidades.'
      },
      {
        type: 'explanation',
        title: 'Las 4 operaciones que debes dominar',
        text: 'Suma (+): juntar cantidades. Resta (-): quitar o comparar. Multiplicación (×): sumar varias veces lo mismo. División (÷): repartir en partes iguales.',
        highlight: 'Truco: Cuando el ICFES te dé un problema, primero identifica qué operación necesitas. ¿Están juntando? Suma. ¿Están quitando? Resta. ¿Repitiendo? Multiplica. ¿Repartiendo? Divide.'
      },
      {
        type: 'example',
        title: 'Ejemplo tipo ICFES',
        text: 'En una heladería, cada vaso de helado cuesta $3.000. A cada vaso se le puede agregar acompañamientos por $1.000 cada uno. Si quieres saber el precio total, necesitas: precio base + (precio del acompañamiento × número de acompañamientos). Eso se escribe como: 3.000 + (1.000 × n), donde n es el número de acompañamientos.'
      },
      {
        type: 'tip',
        title: '💡 Consejo para el examen',
        text: 'Cuando veas una expresión como "3.000 + (1.000 × n)", léela como una receta: primero el precio fijo (3.000), luego lo que cambia según cuántos acompañamientos pidas. El ICFES siempre pone problemas de la vida cotidiana, así que piensa en situaciones reales.'
      }
    ],
    questionIds: ['math-1-q1', 'math-1-q2']
  },
  {
    id: 'math-2',
    title: 'Promedio, Moda y Mediana',
    subtitle: 'Las tres medidas más importantes del ICFES',
    level: 'basico',
    difficulty: 'facil',
    duration: 20,
    xp: 60,
    glossary: [
      {
        term: 'Promedio (Media)',
        simple: 'Es el valor "del medio" cuando sumas todos los datos y los divides entre cuántos son. Como cuando calculas tu promedio de notas.',
        technical: 'Medida de tendencia central que se calcula sumando todos los valores y dividiendo entre el número total de datos.'
      },
      {
        term: 'Moda',
        simple: 'Es el dato que más se repite. Como la talla de zapatos que más se vende en una tienda.',
        technical: 'Valor que aparece con mayor frecuencia en un conjunto de datos.'
      },
      {
        term: 'Mediana',
        simple: 'Es el valor del medio cuando ordenas todos los datos de menor a mayor. La mitad está por encima y la mitad por debajo.',
        technical: 'Valor que divide un conjunto de datos ordenados en dos partes iguales.'
      }
    ],
    content: [
      {
        type: 'intro',
        title: '¿Por qué el ICFES pregunta tanto esto?',
        text: 'El ICFES ama las estadísticas porque son útiles en la vida real. Cuando ves noticias sobre salarios, temperaturas o resultados de elecciones, siempre usan promedio, moda o mediana. El examen te da una tabla o gráfica y te pregunta cuál de estas tres usar.'
      },
      {
        type: 'explanation',
        title: 'Cómo calcular el Promedio',
        text: 'Suma todos los valores y divide entre cuántos hay. Ejemplo: Las notas de Juan son 3, 4, 5, 4, 4. Suma: 3+4+5+4+4 = 20. Divide: 20 ÷ 5 = 4. El promedio de Juan es 4.',
        highlight: 'El promedio es sensible a valores extremos. Un dato muy alto o muy bajo puede "jalar" el promedio.'
      },
      {
        type: 'explanation',
        title: 'Cómo encontrar la Moda',
        text: 'Mira cuál número se repite más veces. En las notas de Juan: 3 aparece 1 vez, 4 aparece 3 veces, 5 aparece 1 vez. La moda es 4 porque es la que más se repite.',
        highlight: 'Puede haber más de una moda si dos valores se repiten la misma cantidad de veces.'
      },
      {
        type: 'explanation',
        title: 'Cómo encontrar la Mediana',
        text: 'Ordena los datos de menor a mayor: 3, 4, 4, 4, 5. El dato del medio (posición 3 de 5) es 4. La mediana es 4. Si hay un número par de datos, promedia los dos del medio.',
        highlight: 'La mediana no se afecta por valores extremos, por eso se usa para salarios o precios de casas.'
      },
      {
        type: 'tip',
        title: '💡 Truco para el ICFES',
        text: 'Cuando el ICFES pregunte sobre "el valor que más se repite" → Moda. "El valor central" → Mediana. "El valor típico calculado" → Promedio. Lee bien la pregunta, estas palabras clave son tu guía.'
      }
    ],
    questionIds: ['math-2-q1', 'math-2-q2']
  },
  {
    id: 'math-3',
    title: 'Interpretación de Gráficas y Tablas',
    subtitle: 'Leer datos sin confundirte',
    level: 'basico',
    difficulty: 'facil',
    duration: 20,
    xp: 60,
    glossary: [
      {
        term: 'Gráfica de barras',
        simple: 'Una imagen con barras (como columnas) donde la altura de cada barra muestra cuánto es algo.',
        technical: 'Representación visual de datos categóricos mediante rectángulos proporcionales a los valores.'
      },
      {
        term: 'Gráfica circular (torta)',
        simple: 'Un círculo dividido en pedazos, como una pizza. Cada pedazo muestra qué parte del total representa algo.',
        technical: 'Diagrama que muestra proporciones de un todo mediante sectores circulares.'
      },
      {
        term: 'Rango',
        simple: 'La diferencia entre el valor más grande y el más pequeño de un conjunto de datos.',
        technical: 'Medida de dispersión calculada como la diferencia entre el valor máximo y mínimo.'
      }
    ],
    content: [
      {
        type: 'intro',
        title: '¿Por qué el ICFES usa tantas gráficas?',
        text: 'El ICFES quiere saber si puedes leer información presentada de forma visual, como la que ves en periódicos, noticias o informes del trabajo. No tienes que hacer cálculos complicados, solo leer bien la gráfica y responder lo que te preguntan.'
      },
      {
        type: 'explanation',
        title: 'Cómo leer una gráfica de barras',
        text: 'Paso 1: Lee el título (¿de qué trata?). Paso 2: Lee los ejes (¿qué mide el eje vertical? ¿qué categorías hay en el horizontal?). Paso 3: Identifica la barra más alta, la más baja, y compara. Paso 4: Responde lo que preguntan.',
        highlight: 'El error más común es confundir los ejes. Siempre lee las etiquetas antes de responder.'
      },
      {
        type: 'example',
        title: 'Ejemplo tipo ICFES',
        text: 'Una gráfica muestra medios de transporte usados por 900 personas: Bicicleta=225, Automóvil=300, Tren=100, Metro=275. Si preguntan "¿cuáles tienen más usuarios que la mediana?", primero ordenas: 100, 225, 275, 300. La mediana de 4 datos es el promedio de los dos del medio: (225+275)/2 = 250. Entonces los que tienen más de 250 son: Automóvil (300) y Metro (275).'
      },
      {
        type: 'tip',
        title: '💡 Consejo clave',
        text: 'En gráficas circulares, recuerda que el total es 100%. Si un sector ocupa más de la mitad del círculo, representa más del 50%. Si el ICFES te da porcentajes, verifica que sumen 100%.'
      }
    ],
    questionIds: ['math-3-q1']
  },
  {
    id: 'math-4',
    title: 'Álgebra Básica: Variables y Expresiones',
    subtitle: 'Las letras en matemáticas no dan miedo',
    level: 'intermedio',
    difficulty: 'medio',
    duration: 25,
    xp: 80,
    glossary: [
      {
        term: 'Variable',
        simple: 'Una letra (como x o n) que representa un número que no conocemos todavía. Es como decir "cierto número" sin saber cuál es.',
        technical: 'Símbolo que representa un valor desconocido o que puede cambiar en una expresión matemática.'
      },
      {
        term: 'Expresión algebraica',
        simple: 'Una combinación de números y letras con operaciones. Por ejemplo: 2x + 5 significa "el doble de un número más 5".',
        technical: 'Combinación de variables, constantes y operaciones matemáticas sin signo de igualdad.'
      },
      {
        term: 'Ecuación',
        simple: 'Una expresión con signo igual (=) que dice que dos cosas son iguales. Como una balanza: lo que hay a la izquierda pesa igual que lo de la derecha.',
        technical: 'Igualdad matemática que contiene una o más variables y se resuelve encontrando el valor de dichas variables.'
      }
    ],
    content: [
      {
        type: 'intro',
        title: '¿Para qué sirven las letras en matemáticas?',
        text: 'Las letras en matemáticas son como "comodines": representan un número que no sabemos todavía. Esto nos permite escribir reglas generales. Por ejemplo, en vez de decir "si compras 3 cosas de $2.000 pagas $6.000, si compras 4 pagas $8.000...", simplemente decimos: precio = 2.000 × n (donde n es la cantidad que compras).'
      },
      {
        type: 'explanation',
        title: 'Cómo leer una expresión algebraica',
        text: '3x + 5 se lee: "tres veces un número más cinco". Si x = 2, entonces 3(2) + 5 = 6 + 5 = 11. Si x = 4, entonces 3(4) + 5 = 12 + 5 = 17. La letra cambia, el resultado cambia.',
        highlight: 'En el ICFES, las expresiones algebraicas siempre vienen de situaciones reales. Traduce el problema a palabras primero.'
      },
      {
        type: 'example',
        title: 'Ejemplo del ICFES',
        text: 'Helado: $3.000 fijo + $1.000 por cada acompañamiento. Si llamas "n" al número de acompañamientos, el precio es: 3.000 + 1.000n. Si n=2: 3.000 + 1.000(2) = 5.000. Si n=3: 3.000 + 1.000(3) = 6.000.'
      },
      {
        type: 'tip',
        title: '💡 Estrategia para el ICFES',
        text: 'Cuando veas opciones con expresiones algebraicas, reemplaza un número sencillo (como n=1 o n=2) en cada opción y verifica cuál da el resultado correcto según el problema. Esto te ahorra tiempo y evita errores.'
      }
    ],
    questionIds: ['math-4-q1']
  },
  {
    id: 'math-5',
    title: 'Probabilidad y Combinatoria',
    subtitle: 'Contar posibilidades y calcular chances',
    level: 'avanzado',
    difficulty: 'dificil',
    duration: 30,
    xp: 100,
    glossary: [
      {
        term: 'Probabilidad',
        simple: 'La posibilidad de que algo pase. Se expresa como fracción: casos favorables dividido entre casos totales posibles.',
        technical: 'Medida numérica entre 0 y 1 que indica la posibilidad de ocurrencia de un evento.'
      },
      {
        term: 'Permutación',
        simple: 'Ordenar cosas donde el orden importa. Si tienes 3 personas para 3 puestos, el orden en que los ubicas importa.',
        technical: 'Arreglo ordenado de elementos donde el orden de selección es relevante. P(n,r) = n!/(n-r)!'
      },
      {
        term: 'Combinación',
        simple: 'Elegir cosas donde el orden NO importa. Si eliges 3 personas de un grupo de 10 para un equipo, no importa en qué orden las eliges.',
        technical: 'Selección de elementos sin considerar el orden. C(n,r) = n!/(r!(n-r)!)'
      }
    ],
    content: [
      {
        type: 'intro',
        title: 'Probabilidad en la vida real',
        text: 'La probabilidad está en todas partes: en el pronóstico del tiempo, en los juegos de azar, en los seguros, en la medicina. El ICFES te pregunta sobre esto porque quiere saber si puedes razonar sobre posibilidades.'
      },
      {
        type: 'explanation',
        title: 'Cómo calcular una probabilidad',
        text: 'Probabilidad = (Casos favorables) ÷ (Casos totales). Ejemplo: En una bolsa hay 3 bolas rojas y 7 azules. La probabilidad de sacar una roja es 3/10 = 0.3 = 30%.',
        highlight: 'La probabilidad siempre está entre 0 (imposible) y 1 (seguro). Si da más de 1, algo está mal en tu cálculo.'
      },
      {
        type: 'explanation',
        title: 'Permutaciones vs Combinaciones',
        text: 'Permutación (orden importa): ¿De cuántas formas puedo ordenar 3 libros en un estante? 3 × 2 × 1 = 6 formas. Combinación (orden no importa): ¿De cuántas formas puedo elegir 2 libros de 5? 5!/(2!×3!) = 10 formas.',
        highlight: 'La clave: ¿importa el orden? Si sí → permutación. Si no → combinación.'
      },
      {
        type: 'example',
        title: 'Ejemplo tipo ICFES',
        text: 'Una biblioteca identifica libros con placas de 3 dígitos usando los dígitos 1, 2, 3, 4 sin repetir. El asistente 1 dice que hay 4 posibilidades. El asistente 2 dice que hay 4×3×2=24. El asistente 2 tiene razón: es una permutación porque el orden importa (123 ≠ 321 son libros diferentes).'
      }
    ],
    questionIds: ['math-5-q1']
  }
];

// ============================================================
// DATOS DE LECCIONES - LECTURA CRÍTICA
// ============================================================

const readingLessons: Lesson[] = [
  {
    id: 'read-1',
    title: '¿Qué dice el texto? Comprensión Literal',
    subtitle: 'Encontrar la información que está escrita directamente',
    level: 'basico',
    difficulty: 'facil',
    duration: 15,
    xp: 50,
    glossary: [
      {
        term: 'Comprensión literal',
        simple: 'Entender exactamente lo que dice el texto, sin interpretar ni adivinar. Es como responder: "¿qué dice aquí?"',
        technical: 'Nivel básico de comprensión lectora que implica identificar información explícita en el texto.'
      },
      {
        term: 'Idea principal',
        simple: 'El tema más importante del texto. Si tuvieras que resumir el texto en una sola oración, esa sería la idea principal.',
        technical: 'Proposición central que organiza y da sentido a las demás ideas del texto.'
      },
      {
        term: 'Idea secundaria',
        simple: 'Información adicional que apoya o explica la idea principal, pero no es lo más importante.',
        technical: 'Proposición que complementa, ejemplifica o desarrolla la idea principal.'
      }
    ],
    content: [
      {
        type: 'intro',
        title: '¿Por qué el ICFES pone textos tan largos?',
        text: 'El ICFES quiere saber si puedes leer y entender textos de diferentes tipos: noticias, ensayos, cuentos, artículos científicos. No tienes que saber todo sobre el tema del texto, solo leerlo bien y responder con base en lo que dice.'
      },
      {
        type: 'explanation',
        title: 'Estrategia para leer textos del ICFES',
        text: 'Paso 1: Lee las preguntas ANTES de leer el texto (así sabes qué buscar). Paso 2: Lee el texto completo una vez rápido para entender de qué trata. Paso 3: Vuelve al texto para buscar la respuesta específica. Paso 4: Verifica que tu respuesta esté basada en el texto, no en lo que tú crees.',
        highlight: 'El error más común: responder con lo que tú piensas o sabes, no con lo que dice el texto. ¡Siempre basa tu respuesta en el texto!'
      },
      {
        type: 'tip',
        title: '💡 Truco para preguntas literales',
        text: 'Las preguntas literales usan frases como: "Según el texto...", "De acuerdo con el texto...", "El autor afirma que...". La respuesta siempre está escrita directamente en el texto. Busca las palabras clave de la pregunta en el texto.'
      }
    ],
    questionIds: ['read-1-q1']
  },
  {
    id: 'read-2',
    title: '¿Qué quiere decir el texto? Comprensión Inferencial',
    subtitle: 'Entender lo que el texto dice entre líneas',
    level: 'intermedio',
    difficulty: 'medio',
    duration: 25,
    xp: 80,
    glossary: [
      {
        term: 'Inferencia',
        simple: 'Sacar conclusiones que el texto no dice directamente pero que se pueden deducir de lo que sí dice. Como cuando ves nubes oscuras y concluyes que va a llover.',
        technical: 'Proceso cognitivo de derivar información implícita a partir de información explícita en el texto.'
      },
      {
        term: 'Implicación',
        simple: 'Lo que se desprende o se sigue de una afirmación. Si el texto dice "todos los estudiantes aprobaron", se implica que ninguno reprobó.',
        technical: 'Consecuencia lógica que se deriva de una proposición o conjunto de proposiciones.'
      },
      {
        term: 'Contraejemplo',
        simple: 'Un ejemplo que demuestra que algo NO es verdad. Si alguien dice "todos los pájaros vuelan" y yo digo "el pingüino no vuela", el pingüino es un contraejemplo.',
        technical: 'Caso específico que refuta o contradice una afirmación general.'
      }
    ],
    content: [
      {
        type: 'intro',
        title: '¿Qué es leer entre líneas?',
        text: 'A veces los textos no dicen todo directamente. El autor da pistas y tú tienes que usar tu razonamiento para llegar a conclusiones que el texto no dice explícitamente. Esto es inferir. El ICFES tiene muchas preguntas de este tipo porque es la habilidad más importante para la universidad y el trabajo.'
      },
      {
        type: 'explanation',
        title: 'Tipos de preguntas inferenciales en el ICFES',
        text: '1. "¿Qué se puede concluir del texto?" → Busca qué se desprende lógicamente de lo que dice. 2. "¿Cuál sería una continuación adecuada?" → El texto debe seguir la misma línea de argumentación. 3. "¿Qué relación hay entre estos fragmentos?" → Identifica si uno apoya, contradice o ejemplifica al otro.',
        highlight: 'La respuesta correcta siempre se puede justificar con algo del texto. Si no puedes justificarla con el texto, probablemente está mal.'
      },
      {
        type: 'example',
        title: 'Ejemplo del ICFES',
        text: 'Fragmento 1: "La aporofobia alimenta el rechazo a inmigrantes por ser pobres." Fragmento 2: "Los yates atracan sin problemas en el Mediterráneo mientras las embarcaciones pequeñas se hunden." Pregunta: ¿Qué relación hay? El fragmento 2 es un EJEMPLO de lo que dice el 1: los ricos (yates) son bienvenidos, los pobres (embarcaciones pequeñas) no.'
      },
      {
        type: 'tip',
        title: '💡 Estrategia para preguntas inferenciales',
        text: 'Elimina las opciones que: (1) contradigan el texto, (2) no tengan relación con el texto, (3) sean demasiado extremas o absolutas. La respuesta correcta siempre es moderada y se puede justificar.'
      }
    ],
    questionIds: ['read-2-q1']
  },
  {
    id: 'read-3',
    title: 'Propósito del Autor y Estrategias Argumentativas',
    subtitle: '¿Por qué escribió esto y cómo lo defiende?',
    level: 'avanzado',
    difficulty: 'dificil',
    duration: 30,
    xp: 100,
    glossary: [
      {
        term: 'Tesis',
        simple: 'La idea principal que el autor quiere defender o demostrar. Es como la "posición" del autor sobre un tema.',
        technical: 'Proposición central que el autor sostiene y que busca defender mediante argumentos.'
      },
      {
        term: 'Argumento',
        simple: 'Una razón que el autor da para apoyar su tesis. Los argumentos son las "pruebas" que usa para convencerte.',
        technical: 'Razonamiento o evidencia que el autor emplea para sustentar su tesis.'
      },
      {
        term: 'Propósito comunicativo',
        simple: '¿Para qué escribió el autor este texto? ¿Para informar, convencer, entretener, criticar?',
        technical: 'Intención o finalidad que el autor persigue al producir el texto.'
      },
      {
        term: 'Estrategia argumentativa',
        simple: 'La forma en que el autor organiza sus ideas para convencerte. Puede usar ejemplos, estadísticas, citas de expertos, comparaciones, etc.',
        technical: 'Recurso retórico o discursivo empleado para persuadir al lector de la validez de la tesis.'
      }
    ],
    content: [
      {
        type: 'intro',
        title: '¿Por qué el ICFES pregunta sobre el propósito del autor?',
        text: 'Saber por qué alguien escribió algo es fundamental para entender el texto completo. Un periodista escribe para informar, un publicista para vender, un político para convencer. Cuando entiendes el propósito, entiendes mejor cada parte del texto.'
      },
      {
        type: 'explanation',
        title: 'Cómo identificar el propósito del autor',
        text: 'Pregúntate: ¿El autor está dando información neutral? → Informar. ¿Está defendiendo una posición? → Argumentar/Convencer. ¿Está contando una historia? → Narrar. ¿Está describiendo algo? → Describir. La mayoría de textos del ICFES son argumentativos: el autor defiende una idea.',
        highlight: 'En textos argumentativos, busca la tesis (qué defiende) y los argumentos (cómo lo defiende).'
      },
      {
        type: 'explanation',
        title: 'Estrategias argumentativas más comunes en el ICFES',
        text: '1. Citar expertos: "Según el filósofo X..." 2. Dar ejemplos concretos 3. Usar estadísticas o datos 4. Comparar situaciones 5. Contar una anécdota personal 6. Presentar y refutar el argumento contrario.',
        highlight: 'El ICFES pregunta: "¿Qué estrategia usa el autor para..." → Identifica cuál de estas está usando.'
      }
    ],
    questionIds: ['read-3-q1']
  }
];

// ============================================================
// DATOS DE LECCIONES - CIENCIAS NATURALES
// ============================================================

const scienceLessons: Lesson[] = [
  {
    id: 'sci-1',
    title: 'La Célula: La Unidad de la Vida',
    subtitle: 'El "ladrillo" con el que está hecho todo ser vivo',
    level: 'basico',
    difficulty: 'facil',
    duration: 20,
    xp: 60,
    glossary: [
      {
        term: 'Célula',
        simple: 'La parte más pequeña de un ser vivo que puede vivir por sí sola. Es como el "ladrillo" con el que están hechos todos los seres vivos.',
        technical: 'Unidad estructural y funcional básica de todos los organismos vivos.'
      },
      {
        term: 'Membrana celular',
        simple: 'La "piel" de la célula. Controla qué entra y qué sale, como un portero de discoteca.',
        technical: 'Bicapa lipídica que delimita la célula y regula el transporte de sustancias.'
      },
      {
        term: 'Núcleo',
        simple: 'El "cerebro" de la célula. Contiene el ADN con toda la información para que la célula funcione.',
        technical: 'Orgánulo que contiene el material genético (ADN) y controla las actividades celulares.'
      },
      {
        term: 'ADN',
        simple: 'Las "instrucciones" de la célula. Es como el manual de usuario de un ser vivo, escrito en un código químico.',
        technical: 'Ácido desoxirribonucleico: molécula que contiene la información genética de los organismos.'
      }
    ],
    content: [
      {
        type: 'intro',
        title: '¿Qué pregunta el ICFES sobre células?',
        text: 'El ICFES no te pide memorizar cada parte de la célula. Te da un experimento o situación y te pregunta si puedes razonar sobre cómo funciona. Por ejemplo: "Si se daña la membrana celular, ¿qué pasaría?" o "¿Qué célula tiene más mitocondrias y por qué?"'
      },
      {
        type: 'explanation',
        title: 'Las partes principales que debes conocer',
        text: 'Membrana celular: la "piel", controla entradas y salidas. Núcleo: el "cerebro", tiene el ADN. Mitocondria: la "fábrica de energía", produce energía para la célula. Ribosoma: la "fábrica de proteínas". Vacuola: el "almacén" de la célula.',
        highlight: 'Truco para recordar: Piensa en la célula como una fábrica. La membrana es la cerca, el núcleo es la oficina del jefe, las mitocondrias son los generadores de energía.'
      },
      {
        type: 'explanation',
        title: 'Células animales vs vegetales',
        text: 'Las células vegetales tienen algo extra: pared celular (una capa rígida exterior, como una caja de madera), cloroplastos (para hacer fotosíntesis, capturan la luz solar) y vacuola grande central. Las animales no tienen estos.',
        highlight: 'Pregunta frecuente del ICFES: ¿Por qué las plantas pueden hacer su propio alimento y los animales no? Por los cloroplastos.'
      }
    ],
    questionIds: ['sci-1-q1']
  },
  {
    id: 'sci-2',
    title: 'Leyes del Movimiento de Newton',
    subtitle: 'Por qué las cosas se mueven o se quedan quietas',
    level: 'intermedio',
    difficulty: 'medio',
    duration: 25,
    xp: 80,
    glossary: [
      {
        term: 'Fuerza',
        simple: 'Un empujón o jalón que puede cambiar el movimiento de un objeto. Se mide en Newtons (N).',
        technical: 'Interacción que puede cambiar el estado de movimiento o la forma de un cuerpo. F = ma'
      },
      {
        term: 'Inercia',
        simple: 'La "pereza" de los objetos: los que están quietos quieren seguir quietos, y los que se mueven quieren seguir moviéndose.',
        technical: 'Propiedad de los cuerpos de resistir cambios en su estado de movimiento.'
      },
      {
        term: 'Aceleración',
        simple: 'El cambio en la velocidad. Si un carro va más rápido, está acelerando. Si frena, también está acelerando (pero negativo).',
        technical: 'Variación de la velocidad por unidad de tiempo. a = Δv/Δt'
      }
    ],
    content: [
      {
        type: 'intro',
        title: 'Las 3 leyes que explican el movimiento',
        text: 'Isaac Newton describió tres leyes que explican por qué los objetos se mueven como lo hacen. Estas leyes funcionan para todo: desde una pelota de fútbol hasta los planetas. El ICFES te da situaciones cotidianas y te pregunta cuál ley aplica.'
      },
      {
        type: 'explanation',
        title: '1ª Ley: La Ley de la Inercia',
        text: 'Un objeto quieto sigue quieto, y uno en movimiento sigue moviéndose, a menos que una fuerza lo cambie. Ejemplo: Cuando el bus frena de golpe, tú sigues hacia adelante (tu cuerpo quería seguir moviéndose). Por eso existen los cinturones de seguridad.',
        highlight: 'Clave: Si no hay fuerza neta, el movimiento no cambia.'
      },
      {
        type: 'explanation',
        title: '2ª Ley: F = ma',
        text: 'La fuerza necesaria para mover algo depende de su masa y de cuánto quieres que acelere. F = masa × aceleración. Ejemplo: Es más difícil empujar un bus que una bicicleta (más masa = necesitas más fuerza para la misma aceleración).',
        highlight: 'F = ma es la fórmula más importante de física en el ICFES.'
      },
      {
        type: 'explanation',
        title: '3ª Ley: Acción y Reacción',
        text: 'Por cada fuerza que ejerces, hay una fuerza igual pero en dirección contraria. Ejemplo: Cuando saltas, empujas el suelo hacia abajo y el suelo te empuja hacia arriba. Los cohetes funcionan así: expulsan gas hacia abajo y el cohete sube.',
        highlight: 'Las fuerzas de acción y reacción actúan sobre objetos DIFERENTES, no sobre el mismo.'
      }
    ],
    questionIds: ['sci-2-q1']
  }
];

// ============================================================
// DATOS DE LECCIONES - SOCIALES Y CIUDADANAS
// ============================================================

const socialLessons: Lesson[] = [
  {
    id: 'soc-1',
    title: 'La Constitución de 1991: Tus Derechos',
    subtitle: 'Lo que la ley dice que tienes derecho a tener',
    level: 'basico',
    difficulty: 'facil',
    duration: 20,
    xp: 60,
    glossary: [
      {
        term: 'Constitución',
        simple: 'El libro de reglas más importante del país. Dice cómo funciona el gobierno y cuáles son los derechos de todos los colombianos.',
        technical: 'Norma jurídica suprema que establece los principios fundamentales del Estado y los derechos de los ciudadanos.'
      },
      {
        term: 'Derechos fundamentales',
        simple: 'Los derechos más básicos que tiene toda persona por el simple hecho de ser humano. Nadie te los puede quitar.',
        technical: 'Derechos consagrados en el Título II de la Constitución de 1991, de aplicación inmediata y protegidos por tutela.'
      },
      {
        term: 'Acción de tutela',
        simple: 'Un mecanismo legal para proteger tus derechos fundamentales cuando alguien los viola. Es como una "queja urgente" ante un juez.',
        technical: 'Mecanismo constitucional de protección inmediata de derechos fundamentales. Art. 86 C.P.'
      },
      {
        term: 'Estado Social de Derecho',
        simple: 'La forma de gobierno de Colombia donde el Estado tiene que garantizar no solo las leyes sino también el bienestar de los ciudadanos.',
        technical: 'Modelo estatal que combina el Estado de Derecho con obligaciones de garantía de derechos sociales, económicos y culturales.'
      }
    ],
    content: [
      {
        type: 'intro',
        title: 'La Constitución del 91: Un antes y un después',
        text: 'En 1991, Colombia cambió su Constitución. Antes había una del 1886 que era muy vieja y no protegía bien a los ciudadanos. La nueva Constitución fue escrita con participación de muchos grupos, incluyendo indígenas y exguerrilleros. Es considerada una de las más avanzadas del mundo en derechos humanos.'
      },
      {
        type: 'explanation',
        title: 'Los derechos fundamentales más importantes',
        text: 'Artículo 11: Derecho a la vida. Artículo 13: Igualdad (todos somos iguales ante la ley). Artículo 16: Libre desarrollo de la personalidad. Artículo 18: Libertad de conciencia. Artículo 20: Libertad de expresión. Artículo 44: Derechos de los niños (prevalecen sobre los demás).',
        highlight: 'El ICFES pregunta: ¿Cuál derecho aplica en esta situación? Aprende los más importantes y en qué situaciones aplican.'
      },
      {
        type: 'explanation',
        title: 'La Tutela: Tu herramienta más poderosa',
        text: 'Si alguien viola tus derechos fundamentales, puedes poner una tutela. El juez tiene 10 días para responder. Ejemplo: Si una EPS te niega un medicamento urgente, puedes poner tutela. Si un colegio te expulsa sin proceso, puedes poner tutela.',
        highlight: 'La tutela solo protege derechos FUNDAMENTALES (los del Título II). Para otros derechos hay otras acciones.'
      }
    ],
    questionIds: ['soc-1-q1']
  },
  {
    id: 'soc-2',
    title: 'Historia de Colombia: Los Momentos Clave',
    subtitle: 'Lo que pasó y por qué importa hoy',
    level: 'intermedio',
    difficulty: 'medio',
    duration: 25,
    xp: 80,
    glossary: [
      {
        term: 'El Bogotazo',
        simple: 'El 9 de abril de 1948, asesinaron al político Jorge Eliécer Gaitán en Bogotá. Esto desató una ola de violencia enorme en todo el país que cambió la historia de Colombia.',
        technical: 'Período de violencia urbana desencadenado el 9 de abril de 1948 tras el asesinato de Jorge Eliécer Gaitán, líder del Partido Liberal.'
      },
      {
        term: 'La Violencia',
        simple: 'Un período entre 1948 y 1958 donde liberales y conservadores se mataban entre sí en Colombia. Murieron más de 200.000 personas.',
        technical: 'Conflicto bipartidista colombiano (1948-1958) caracterizado por enfrentamientos armados entre liberales y conservadores.'
      },
      {
        term: 'Frente Nacional',
        simple: 'Un acuerdo entre liberales y conservadores (1958-1974) para turnarse el poder y acabar con La Violencia. Funcionó para parar la guerra, pero excluyó a otros partidos.',
        technical: 'Acuerdo político colombiano por el cual liberales y conservadores se alternaron la presidencia durante 16 años.'
      }
    ],
    content: [
      {
        type: 'intro',
        title: '¿Por qué estudiar historia para el ICFES?',
        text: 'El ICFES no te pide memorizar fechas. Te da un texto histórico y te pregunta si lo entiendes: causas, consecuencias, contexto. La historia de Colombia es especialmente importante porque explica muchos problemas actuales del país.'
      },
      {
        type: 'explanation',
        title: 'La línea del tiempo que debes conocer',
        text: '1810: Independencia de España. 1886: Primera Constitución moderna. 1948: El Bogotazo y inicio de La Violencia. 1958: Frente Nacional (acuerdo de paz bipartidista). 1991: Nueva Constitución. 2016: Acuerdo de paz con las FARC.',
        highlight: 'El ICFES conecta eventos históricos con problemas actuales. Pregunta: ¿Por qué Colombia tiene conflicto armado? La respuesta está en la historia.'
      },
      {
        type: 'example',
        title: 'Ejemplo tipo ICFES',
        text: 'El examen puede darte una crónica sobre El Bogotazo y preguntarte: "¿Cuál es el tema general del texto?" La respuesta no es "la muerte de Gaitán" (eso es demasiado específico) sino "las consecuencias violentas inmediatas al asesinato de Gaitán" (más amplio y preciso).'
      }
    ],
    questionIds: ['soc-2-q1']
  }
];

// ============================================================
// DATOS DE LECCIONES - INGLÉS
// ============================================================

const englishLessons: Lesson[] = [
  {
    id: 'eng-1',
    title: 'Vocabulario Básico: Las Palabras Más Comunes',
    subtitle: 'Las 200 palabras en inglés que más aparecen en el ICFES',
    level: 'basico',
    difficulty: 'facil',
    duration: 20,
    xp: 50,
    glossary: [
      {
        term: 'Cognados',
        simple: 'Palabras en inglés que se parecen al español y significan lo mismo. Como "information" (información), "important" (importante), "national" (nacional). ¡Son tus aliados!',
        technical: 'Palabras de dos idiomas que tienen origen etimológico común y significado similar.'
      },
      {
        term: 'Falsos cognados',
        simple: 'Palabras en inglés que parecen español pero significan algo diferente. "Actually" no significa "actualmente" sino "en realidad". ¡Cuidado con estos!',
        technical: 'Palabras de apariencia similar en dos idiomas pero con significados diferentes.'
      }
    ],
    content: [
      {
        type: 'intro',
        title: '¿Cómo es el inglés del ICFES?',
        text: 'El ICFES evalúa inglés en 3 niveles: A1 (básico), A2 (elemental) y B1 (intermedio). La mayoría de preguntas son de A1 y A2. No necesitas hablar inglés perfecto, solo leer y entender textos sencillos. ¡Tú puedes!'
      },
      {
        type: 'explanation',
        title: 'Tu superpoder: Los cognados',
        text: 'Muchas palabras en inglés se parecen al español: information=información, important=importante, national=nacional, president=presidente, education=educación, technology=tecnología, communication=comunicación. Si ves una palabra larga en inglés que termina en -tion, -sion, -ity, probablemente tiene un equivalente en español.',
        highlight: 'Regla de oro: Palabras que terminan en -tion en inglés → -ción en español. Nation → Nación. Action → Acción.'
      },
      {
        type: 'explanation',
        title: 'Palabras básicas que debes memorizar',
        text: 'Verbos: is/are (es/son), have/has (tiene), can (puede), go (ir), come (venir), make (hacer), take (tomar), give (dar), know (saber), think (pensar). Conectores: and (y), but (pero), because (porque), however (sin embargo), therefore (por lo tanto).',
        highlight: 'Los conectores son clave para entender la relación entre ideas en un texto en inglés.'
      },
      {
        type: 'tip',
        title: '💡 Estrategia para el inglés del ICFES',
        text: 'Si no entiendes una palabra, usa el contexto. Lee la oración completa y las de alrededor. El significado muchas veces se puede deducir. Además, las preguntas del ICFES en inglés siempre tienen las opciones en español, así que solo necesitas entender el texto en inglés.'
      }
    ],
    questionIds: ['eng-1-q1']
  },
  {
    id: 'eng-2',
    title: 'Gramática Básica: Tiempos Verbales',
    subtitle: 'Presente, pasado y futuro en inglés',
    level: 'intermedio',
    difficulty: 'medio',
    duration: 25,
    xp: 80,
    glossary: [
      {
        term: 'Simple Present',
        simple: 'El tiempo presente en inglés. Se usa para hábitos, hechos y verdades generales. "She works every day" = Ella trabaja todos los días.',
        technical: 'Tiempo verbal que expresa acciones habituales, verdades generales o estados permanentes.'
      },
      {
        term: 'Simple Past',
        simple: 'El tiempo pasado en inglés. Se usa para acciones que ya terminaron. "He worked yesterday" = Él trabajó ayer.',
        technical: 'Tiempo verbal que expresa acciones completadas en un momento específico del pasado.'
      },
      {
        term: 'Present Perfect',
        simple: 'Un tiempo que conecta el pasado con el presente. "She has lived here for 5 years" = Ella ha vivido aquí por 5 años (y todavía vive aquí).',
        technical: 'Tiempo verbal que expresa acciones pasadas con relevancia en el presente, formado con have/has + participio pasado.'
      }
    ],
    content: [
      {
        type: 'intro',
        title: 'Los tiempos verbales en el ICFES',
        text: 'El ICFES te puede preguntar qué tiempo verbal se usa en una oración, o pedirte completar un texto con el tiempo correcto. No necesitas memorizar reglas complicadas, solo entender cuándo se usa cada uno.'
      },
      {
        type: 'explanation',
        title: 'Simple Present: El presente de siempre',
        text: 'Uso: hábitos ("I eat breakfast every day"), hechos ("Water boils at 100°C"), horarios ("The bus leaves at 8am"). Forma: sujeto + verbo (+ s para he/she/it). "She works, He plays, It rains."',
        highlight: 'Palabras clave del Simple Present: always, usually, often, sometimes, never, every day/week/month.'
      },
      {
        type: 'explanation',
        title: 'Simple Past: Lo que ya pasó',
        text: 'Uso: acciones terminadas en el pasado. Forma: sujeto + verbo-ed (regulares) o forma especial (irregulares). "worked, played, went, came, made". Palabras clave: yesterday, last week, in 1990, ago.',
        highlight: 'Los verbos irregulares más comunes: go→went, come→came, make→made, take→took, have→had, be→was/were.'
      }
    ],
    questionIds: ['eng-2-q1']
  }
];

// ============================================================
// MÓDULOS COMPLETOS
// ============================================================

export const modules: Module[] = [
  {
    id: 'matematicas',
    area: 'matematicas',
    title: 'Matemáticas',
    subtitle: 'Números, álgebra y estadística',
    description: 'Aprende desde las operaciones básicas hasta estadística y probabilidad. El ICFES siempre pone problemas de la vida real, ¡y tú los vas a resolver!',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    icon: '📐',
    image: '/images/modulo-matematicas.webp',
    lessons: mathLessons,
    totalXp: mathLessons.reduce((sum, l) => sum + l.xp, 0)
  },
  {
    id: 'lectura',
    area: 'lectura-critica',
    title: 'Lectura Crítica',
    subtitle: 'Comprensión y análisis de textos',
    description: 'Aprende a leer textos de todo tipo y a responder preguntas sobre lo que dicen, lo que implican y el propósito del autor.',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    icon: '📖',
    image: '/images/modulo-lectura.webp',
    lessons: readingLessons,
    totalXp: readingLessons.reduce((sum, l) => sum + l.xp, 0)
  },
  {
    id: 'ciencias',
    area: 'ciencias-naturales',
    title: 'Ciencias Naturales',
    subtitle: 'Biología, química y física',
    description: 'Desde la célula hasta las leyes del movimiento. Aprende ciencias con ejemplos de la vida cotidiana colombiana.',
    color: 'text-teal-700',
    bgColor: 'bg-teal-50',
    icon: '🔬',
    image: '/images/modulo-ciencias.webp',
    lessons: scienceLessons,
    totalXp: scienceLessons.reduce((sum, l) => sum + l.xp, 0)
  },
  {
    id: 'sociales',
    area: 'sociales-ciudadanas',
    title: 'Sociales y Ciudadanas',
    subtitle: 'Historia, geografía y constitución',
    description: 'Conoce la historia de Colombia, tus derechos como ciudadano y cómo funciona el país. ¡Es tu historia!',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    icon: '🗺️',
    image: '/images/modulo-sociales.webp',
    lessons: socialLessons,
    totalXp: socialLessons.reduce((sum, l) => sum + l.xp, 0)
  },
  {
    id: 'ingles',
    area: 'ingles',
    title: 'Inglés',
    subtitle: 'Vocabulario, gramática y comprensión',
    description: 'Aprende el inglés que necesitas para el ICFES. Empezamos desde cero con vocabulario básico hasta leer textos completos.',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    icon: '🌎',
    image: '/images/modulo-ingles.webp',
    lessons: englishLessons,
    totalXp: englishLessons.reduce((sum, l) => sum + l.xp, 0)
  }
];

// ============================================================
// GLOSARIO GENERAL
// ============================================================

export const generalGlossary: GlossaryTerm[] = [
  {
    term: 'Hipótesis',
    simple: 'Una suposición o idea que se quiere comprobar. Es como decir "creo que esto pasa porque..." y luego hacer un experimento para verificarlo.',
    technical: 'Proposición provisional que se formula para ser verificada o refutada mediante evidencia empírica.'
  },
  {
    term: 'Variable',
    simple: 'Algo que puede cambiar o variar. En un experimento, es lo que cambias o lo que mides.',
    technical: 'Característica o atributo que puede tomar diferentes valores en una investigación.'
  },
  {
    term: 'Argumento',
    simple: 'Una razón que das para apoyar una idea. No es pelear, es dar razones lógicas.',
    technical: 'Razonamiento que se emplea para demostrar o justificar una proposición.'
  },
  {
    term: 'Contexto',
    simple: 'Las circunstancias que rodean algo. Para entender una frase, necesitas saber el contexto: ¿quién lo dijo? ¿cuándo? ¿por qué?',
    technical: 'Conjunto de circunstancias que rodean un hecho o enunciado y que contribuyen a su significado.'
  },
  {
    term: 'Inferir',
    simple: 'Sacar una conclusión que no está dicha directamente, usando la lógica y la información disponible.',
    technical: 'Proceso de derivar conclusiones a partir de premisas o evidencias mediante razonamiento lógico.'
  },
  {
    term: 'Síntesis',
    simple: 'Resumir las ideas principales de algo en pocas palabras. No es copiar, es entender y reescribir con tus propias palabras.',
    technical: 'Elaboración de un resumen que integra las ideas principales de un texto o conjunto de información.'
  }
];

export default modules;
