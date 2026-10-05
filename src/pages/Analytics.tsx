import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { AlertCircle, Zap, Target, TrendingUp, PenLine } from 'lucide-react';
import { useProgress } from '@/contexts/ProgressContext';
import { modules } from '@/lib/appData';
import { AREA_INFO } from '@/data/questions/meta';
import { AREA_IDS } from '@/data/questions/types';
import { MIN_ANSWERS_PER_AREA } from '@/lib/score';

export default function Analytics() {
  const { progress, estimate, getModuleProgress } = useProgress();
  // Las gráficas miden el contenedor: se dibujan solo en el navegador (no en el prerender).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const accuracyData = AREA_IDS.map(a => ({
    name: AREA_INFO[a].short,
    aciertos: estimate.perArea[a] ?? 0,
    sinDatos: estimate.perArea[a] == null,
    respondidas: progress.areaStats[a]?.answered ?? 0,
  }));

  const simulacroData = progress.simulacroScores.map((score, idx) => ({
    simulacro: `#${idx + 1}`,
    aciertos: Math.round(score),
  }));

  const recommendations: { type: 'warning' | 'info' | 'success'; text: string; icon: typeof AlertCircle }[] = [];
  if (estimate.missingAreas.length > 0) {
    recommendations.push({
      type: 'info',
      icon: PenLine,
      text: `Para calcular tu puntaje global estimado responde al menos ${MIN_ANSWERS_PER_AREA} preguntas en: ${estimate.missingAreas.map(a => AREA_INFO[a].label).join(', ')}.`,
    });
  }
  const withData = AREA_IDS.filter(a => estimate.perArea[a] != null);
  if (withData.length > 0) {
    const weakest = withData.reduce((w, a) => (estimate.perArea[a]! < estimate.perArea[w]! ? a : w));
    if (estimate.perArea[weakest]! < 70) {
      recommendations.push({
        type: 'warning',
        icon: AlertCircle,
        text: `Tu área con menos aciertos es ${AREA_INFO[weakest].label} (${estimate.perArea[weakest]}%). Dedícale tu próxima sesión de práctica.`,
      });
    }
  }
  if (estimate.global != null) {
    recommendations.push(
      estimate.global >= progress.targetScore
        ? { type: 'success', icon: Zap, text: '¡Tu estimado ya alcanza tu meta! Sigue practicando para mantener el nivel.' }
        : { type: 'info', icon: Target, text: `Tu estimado está ${progress.targetScore - estimate.global} puntos por debajo de tu meta de ${progress.targetScore}. ¡Tú puedes!` }
    );
  }
  if (progress.streak >= 3) {
    recommendations.push({ type: 'success', icon: TrendingUp, text: `¡Llevas ${progress.streak} días seguidos estudiando! Sigue así.` });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-['Lexend'] text-foreground">Mi progreso</h1>
        <p className="text-muted-foreground mt-1">Tus aciertos por área, tu puntaje estimado y recomendaciones</p>
      </div>

      {/* Puntaje estimado */}
      <section className="bg-gradient-to-br from-[#1e3a5f] to-[#0f2040] rounded-2xl p-6 text-white">
        <h2 className="text-white/70 text-sm font-medium">Puntaje global estimado</h2>
        <p className="text-5xl font-bold font-['Lexend'] text-[#4ade80] mt-1">
          {estimate.global ?? '—'}
          <span className="text-white/50 text-lg ml-1">/500</span>
        </p>
        <p className="text-xs text-white/70 mt-2 max-w-xl">
          Se calcula con la ponderación oficial del Saber 11: (3 × Lectura + 3 × Matemáticas + 3 × Sociales + 3 × Ciencias + 1 × Inglés) ÷ 13 × 5,
          usando tu porcentaje de aciertos en cada área. Es una referencia para estudiar, no un resultado oficial.
        </p>
      </section>

      {recommendations.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-bold font-['Lexend'] text-foreground">Recomendaciones</h2>
          {recommendations.map((rec, idx) => {
            const Icon = rec.icon;
            const styles = rec.type === 'success' ? 'bg-green-50 border-green-200 text-green-800'
              : rec.type === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
              : 'bg-blue-50 border-blue-200 text-blue-800';
            return (
              <div key={idx} className={`rounded-xl p-4 border-2 flex items-start gap-3 ${styles}`}>
                <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-sm font-medium">{rec.text}</p>
              </div>
            );
          })}
        </section>
      )}

      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl border border-border p-6">
        <h2 className="font-bold font-['Lexend'] text-foreground mb-1">Aciertos por área</h2>
        <p className="text-xs text-muted-foreground mb-4">Incluye lecciones, modo práctica y simulacros.</p>
        {mounted ? (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={accuracyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
            <YAxis stroke="#6b7280" domain={[0, 100]} unit="%" fontSize={12} />
            <Tooltip formatter={(value: number, _n, item) => (item.payload.sinDatos ? 'Sin datos suficientes' : `${value}%`)} />
            <Bar dataKey="aciertos" radius={[8, 8, 0, 0]}>
              {accuracyData.map(d => <Cell key={d.name} fill={d.sinDatos ? '#cbd5e1' : '#4ade80'} />)}
            </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[260px]" aria-hidden="true" />
        )}
        <ul className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-3 text-xs text-muted-foreground">
          {accuracyData.map(d => (
            <li key={d.name}>{d.name}: {d.respondidas} {d.respondidas === 1 ? 'respuesta' : 'respuestas'}</li>
          ))}
        </ul>
      </motion.section>

      {simulacroData.length > 0 && (
        <section className="bg-card rounded-2xl border border-border p-6">
          <h2 className="font-bold font-['Lexend'] text-foreground mb-4">Tus simulacros (% de aciertos)</h2>
          {mounted && (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={simulacroData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="simulacro" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" domain={[0, 100]} unit="%" fontSize={12} />
              <Tooltip formatter={(v: number) => `${v}%`} />
              <Line type="monotone" dataKey="aciertos" stroke="#16a34a" strokeWidth={2} dot={{ fill: '#16a34a' }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </section>
      )}

      <section className="bg-card rounded-2xl border border-border p-6">
        <h2 className="font-bold font-['Lexend'] text-foreground mb-4">Lecciones completadas</h2>
        <div className="space-y-3">
          {modules.map(m => {
            const pct = getModuleProgress(m.id, m.lessons.map(l => l.id));
            const done = Math.round((pct / 100) * m.lessons.length);
            return (
              <div key={m.id}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-foreground">{m.icon} {m.title}</span>
                  <span className="font-semibold text-foreground">{done}/{m.lessons.length}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-green-500 rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl border border-primary/20 p-6">
        <div className="flex items-center justify-between gap-3 mb-3">
          <h2 className="font-bold font-['Lexend'] text-foreground">Tu meta</h2>
          <Link href="/meta" className="text-sm font-semibold text-primary hover:underline">
            {progress.hasCompletedOnboarding ? 'Editar' : 'Definir meta'}
          </Link>
        </div>
        <div className="space-y-1 text-sm text-foreground">
          <p><span className="font-semibold">Carrera:</span> {progress.career || 'No especificada'}</p>
          <p><span className="font-semibold">Puntaje mínimo de la carrera:</span> {progress.minimumScore ? `${progress.minimumScore}/500` : 'No especificado'}</p>
          <p><span className="font-semibold">Tu objetivo:</span> {progress.targetScore}/500</p>
        </div>
      </section>
    </div>
  );
}
