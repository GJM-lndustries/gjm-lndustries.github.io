import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { useProgress } from '@/contexts/ProgressContext';
import { modules } from '@/lib/appData';
import { AREA_INFO, allQuestions } from '@/data/questions';
import { AREA_IDS } from '@/data/questions/types';
import { ChevronRight, Star, Zap, Target, BookOpen, Trophy, Flame, PenLine, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import FaqList from '@/components/FaqList';
import { FAQ } from '@/data/faq';

function ScoreGauge() {
  const { estimate, progress } = useProgress();
  const score = estimate.global;
  const target = progress.targetScore;
  const percentage = score == null ? 0 : (score / 500) * 100;
  const targetPercentage = (target / 500) * 100;
  const color = score == null ? '#94a3b8'
    : score >= target ? '#4ade80' : score >= target - 50 ? '#fbbf24' : score >= target - 100 ? '#f97316' : '#ef4444';

  return (
    <section aria-labelledby="puntaje-titulo" className="bg-gradient-to-br from-[#1e3a5f] to-[#0f2040] rounded-2xl p-6 text-white">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2 id="puntaje-titulo" className="text-white/70 text-sm font-medium">Tu puntaje global estimado</h2>
          <div className="flex items-end gap-2 mt-1">
            <span className="text-5xl font-bold font-['Lexend']" style={{ color }}>{score ?? '—'}</span>
            <span className="text-white/50 text-lg mb-1">/500</span>
          </div>
          <p className="text-sm mt-1 text-white/70 max-w-md">
            {score == null
              ? estimate.totalAnswered === 0
                ? 'Todavía no hay datos. Responde preguntas en las 5 áreas y aquí verás tu estimado.'
                : `Te faltan datos de: ${estimate.missingAreas.map(a => AREA_INFO[a].label).join(', ')}.`
              : 'Estimado con la ponderación oficial del Saber 11 a partir de tus aciertos. No es un resultado oficial.'}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-white/60 text-xs mb-1">Tu meta: {target}</div>
          <div className="text-2xl" aria-hidden="true">🎯</div>
        </div>
      </div>

      <div className="relative h-4 bg-white/10 rounded-full overflow-hidden" aria-hidden="true">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: `linear-gradient(to right, #ef4444, #f97316, #fbbf24, ${color})` }}
        />
        <div className="absolute top-0 bottom-0 w-0.5 bg-white/70" style={{ left: `${targetPercentage}%` }} />
      </div>
      <div className="flex justify-between text-xs text-white/50 mt-1">
        <span>0</span>
        <span className="text-white/70">↑ Meta {target}</span>
        <span>500</span>
      </div>

      {/* Aciertos por área */}
      <div className="grid grid-cols-5 gap-2 mt-4">
        {AREA_IDS.map(a => (
          <div key={a} className="bg-white/10 rounded-lg p-2 text-center">
            <div className="text-base" aria-hidden="true">{AREA_INFO[a].icon}</div>
            <div className="text-sm font-bold">{estimate.perArea[a] == null ? '—' : `${estimate.perArea[a]}%`}</div>
            <div className="text-[10px] text-white/60 leading-tight">{AREA_INFO[a].short}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ModuleCard({ module }: { module: typeof modules[0] }) {
  const { getModuleProgress } = useProgress();
  const progressPct = getModuleProgress(module.id, module.lessons.map(l => l.id));

  return (
    <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }}>
      <Link
        href={`/${module.id}`}
        className="block bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-shadow"
      >
        <div className="relative h-32 overflow-hidden">
          <img
            src={module.image}
            alt=""
            width={module.imageSize[0]}
            height={module.imageSize[1]}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3">
            <div className="flex items-center justify-between">
              <span className="text-2xl" aria-hidden="true">{module.icon}</span>
              {progressPct > 0 && (
                <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full font-semibold">
                  {progressPct}% completado
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-bold text-foreground font-['Lexend'] text-base">{module.title}</h3>
          <p className="text-muted-foreground text-sm mt-0.5">{module.subtitle}</p>
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-muted-foreground">{module.lessons.length} lecciones</span>
            <span className="flex items-center gap-1 text-xs text-primary font-semibold">
              {progressPct > 0 ? 'Continuar' : 'Empezar'}
              <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
            </span>
          </div>
          {progressPct > 0 && (
            <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

export default function Home() {
  const { progress } = useProgress();
  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const completedCount = progress.completedLessons.filter(l => l.completed).length;
  const missedCount = Object.keys(progress.missedQuestions).length;
  const isNew = progress.totalXp === 0 && completedCount === 0;

  const tips = [
    '💡 El Saber 11 tiene dos sesiones de 4 horas y 30 minutos. ¡Practica tu ritmo!',
    '📖 En Lectura Crítica, lee primero la pregunta y luego busca la evidencia en el texto.',
    '📐 En Matemáticas, reemplaza números sencillos para verificar expresiones algebraicas.',
    '🔬 En Ciencias, el ICFES evalúa razonamiento, no memorización.',
    '🗺️ En Sociales, conecta los eventos históricos con la situación actual de Colombia.',
    '🌎 En Inglés, usa los cognados (palabras parecidas al español) a tu favor.',
  ];
  // El consejo cambia cada día; se elige después de montar para que el HTML prerenderizado coincida.
  const [dailyTip, setDailyTip] = useState(tips[0]);
  useEffect(() => setDailyTip(tips[Math.floor(Date.now() / 86400000) % tips.length]), []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-['Lexend'] text-foreground">
          {isNew ? 'Prepárate gratis para el ICFES Saber 11' : '¡Qué bueno verte de nuevo!'}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isNew
            ? 'ProICFES es un preicfes gratis y en línea: lecciones cortas, preguntas tipo ICFES con explicación y simulacros para que llegues con confianza al examen.'
            : `Llevas ${completedCount} de ${totalLessons} lecciones completadas. ¡Sigue así!`}
        </p>
      </div>

      {isNew && (
        <div className="relative rounded-2xl overflow-hidden min-h-48">
          <img
            src="/images/hero-icfes.webp"
            srcSet="/images/hero-icfes-640.webp 640w, /images/hero-icfes-800.webp 800w, /images/hero-icfes.webp 1200w"
            sizes="(min-width: 1024px) 960px, 100vw"
            alt="Estudiante colombiano preparándose para el ICFES"
            width={1200}
            height={800}
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="relative bg-gradient-to-r from-[#1e3a5f]/95 via-[#1e3a5f]/75 to-transparent min-h-48 flex items-center">
            <div className="p-5">
              <h2 className="text-white font-bold text-xl font-['Lexend'] leading-tight">
                Paso a paso<br />hacia tu meta
              </h2>
              <p className="text-white/85 text-sm mt-1">En tu idioma y a tu ritmo</p>
              <div className="flex flex-col sm:flex-row items-start gap-2 mt-3">
                <Link
                  href="/practica"
                  className="inline-flex items-center gap-1.5 bg-[#4ade80] text-[#0f2040] px-4 py-2 rounded-xl text-sm font-bold hover:bg-[#22c55e] transition-colors"
                >
                  <Zap className="w-4 h-4" aria-hidden="true" />
                  Empezar a practicar
                </Link>
                <Link
                  href="/meta"
                  className="inline-flex items-center gap-1.5 bg-[#0f2040]/70 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#0f2040]/90 transition-colors"
                >
                  Definir mi meta (opcional)
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <ScoreGauge />

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card rounded-xl border border-border p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" aria-hidden="true" />
            <span className="text-lg font-bold font-['Lexend'] text-foreground">{progress.totalXp}</span>
          </div>
          <p className="text-xs text-muted-foreground">XP de experiencia</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Flame className="w-4 h-4 text-orange-500" aria-hidden="true" />
            <span className="text-lg font-bold font-['Lexend'] text-foreground">{progress.streak}</span>
          </div>
          <p className="text-xs text-muted-foreground">Días seguidos</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <BookOpen className="w-4 h-4 text-primary" aria-hidden="true" />
            <span className="text-lg font-bold font-['Lexend'] text-foreground">{completedCount}</span>
          </div>
          <p className="text-xs text-muted-foreground">Lecciones</p>
        </div>
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
        <p className="text-sm font-semibold text-primary mb-1">Consejo del día</p>
        <p className="text-sm text-foreground">{dailyTip}</p>
      </div>

      <div>
        <h2 className="text-lg font-bold font-['Lexend'] text-foreground mb-3">Acciones rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            href="/practica"
            className="flex items-center gap-3 bg-gradient-to-br from-green-600 to-green-700 text-white rounded-xl p-4 hover:opacity-90 transition-opacity"
          >
            <PenLine className="w-8 h-8 flex-shrink-0" aria-hidden="true" />
            <div>
              <p className="font-bold text-sm font-['Lexend']">Modo práctica</p>
              <p className="text-xs opacity-90">{allQuestions.length} preguntas con explicación</p>
            </div>
          </Link>
          <Link
            href="/simulacro"
            className="flex items-center gap-3 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-xl p-4 hover:opacity-90 transition-opacity"
          >
            <Target className="w-8 h-8 flex-shrink-0" aria-hidden="true" />
            <div>
              <p className="font-bold text-sm font-['Lexend']">Simulacro</p>
              <p className="text-xs opacity-90">Mide tu nivel en varias áreas</p>
            </div>
          </Link>
          {missedCount > 0 ? (
            <Link
              href="/practica?repaso=1"
              className="flex items-center gap-3 bg-gradient-to-br from-red-500 to-orange-500 text-white rounded-xl p-4 hover:opacity-90 transition-opacity"
            >
              <RotateCcw className="w-8 h-8 flex-shrink-0" aria-hidden="true" />
              <div>
                <p className="font-bold text-sm font-['Lexend']">Repasar errores</p>
                <p className="text-xs opacity-90">{missedCount} {missedCount === 1 ? 'pregunta pendiente' : 'preguntas pendientes'}</p>
              </div>
            </Link>
          ) : (
            <Link
              href="/logros"
              className="flex items-center gap-3 bg-gradient-to-br from-yellow-500 to-orange-500 text-white rounded-xl p-4 hover:opacity-90 transition-opacity"
            >
              <Trophy className="w-8 h-8 flex-shrink-0" aria-hidden="true" />
              <div>
                <p className="font-bold text-sm font-['Lexend']">Mis logros</p>
                <p className="text-xs opacity-90">{progress.badges.length} insignias ganadas</p>
              </div>
            </Link>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold font-['Lexend'] text-foreground">Áreas del Saber 11</h2>
          <span className="text-xs text-muted-foreground">{modules.length} áreas</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {modules.map(module => (
            <ModuleCard key={module.id} module={module} />
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold font-['Lexend'] text-foreground mb-3">Recursos extra</h2>
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/glosario"
            className="flex items-center gap-3 bg-card border border-border rounded-xl p-4 hover:shadow-md hover:border-primary/30 transition-all"
          >
            <span className="text-2xl" aria-hidden="true">📖</span>
            <div>
              <p className="font-bold text-sm font-['Lexend'] text-foreground">Glosario</p>
              <p className="text-xs text-muted-foreground">Palabras técnicas explicadas</p>
            </div>
          </Link>
          <Link
            href="/tips"
            className="flex items-center gap-3 bg-card border border-border rounded-xl p-4 hover:shadow-md hover:border-primary/30 transition-all"
          >
            <span className="text-2xl" aria-hidden="true">💡</span>
            <div>
              <p className="font-bold text-sm font-['Lexend'] text-foreground">Estrategias</p>
              <p className="text-xs text-muted-foreground">Trucos para el examen</p>
            </div>
          </Link>
        </div>
      </div>

      <section className="bg-muted/50 rounded-2xl p-5 space-y-3">
        <h2 className="font-bold font-['Lexend'] text-foreground">¿Cómo es el Saber 11?</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-card rounded-xl p-3 border border-border">
            <p className="font-semibold text-foreground">📝 254 preguntas con puntaje</p>
            <p className="text-muted-foreground text-xs mt-0.5">En 2 sesiones de 4 h 30 min</p>
          </div>
          <div className="bg-card rounded-xl p-3 border border-border">
            <p className="font-semibold text-foreground">📊 Puntaje global 0–500</p>
            <p className="text-muted-foreground text-xs mt-0.5">Cada prueba va de 0 a 100</p>
          </div>
          <div className="bg-card rounded-xl p-3 border border-border">
            <p className="font-semibold text-foreground">⚖️ Inglés pesa menos</p>
            <p className="text-muted-foreground text-xs mt-0.5">Las otras 4 pruebas pesan el triple</p>
          </div>
          <div className="bg-card rounded-xl p-3 border border-border">
            <p className="font-semibold text-foreground">🎯 Sin penalización</p>
            <p className="text-muted-foreground text-xs mt-0.5">No restan por respuesta incorrecta</p>
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Fuente: Guía de orientación Saber 11.° del ICFES. Consulta siempre la guía vigente en icfes.gov.co.
        </p>
      </section>
      <section aria-labelledby="faq-titulo" className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 id="faq-titulo" className="text-lg font-bold font-['Lexend'] text-foreground">Preguntas frecuentes</h2>
          <Link href="/preguntas-frecuentes" className="text-sm text-primary font-semibold hover:underline">
            Ver todas
          </Link>
        </div>
        <FaqList items={FAQ.filter(f => ['que-es-saber-11', 'como-se-calcula-el-puntaje', 'como-usar-proicfes'].includes(f.id))} headingLevel="h3" />
      </section>
    </div>
  );
}
