import { useEffect, useMemo, useState } from 'react';
import { useActiveTimer } from '@/hooks/useActiveTimer';
import { Link, useSearch } from 'wouter';
import { motion } from 'framer-motion';
import { ChevronRight, RotateCcw, CheckCircle2, XCircle, PenLine, Flag, Home as HomeIcon } from 'lucide-react';
import { useProgress } from '@/contexts/ProgressContext';
import QuestionView from '@/components/QuestionView';
import {
  AREA_IDS, AREA_INFO, COMPETENCIAS, DIFFICULTY_LABEL, allQuestions, questionsByArea,
  type AreaId, type Question,
} from '@/data/questions';

type Phase = 'setup' | 'running' | 'summary';
type AreaFilter = AreaId | 'todas';
const SIZES = [5, 10, 0] as const; // 0 = todas

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Arma la sesión: primero hace resurgir preguntas falladas antes y luego completa con nuevas. */
function buildSession(pool: Question[], missed: Set<string>, size: number, onlyMissed: boolean): Question[] {
  const failed = shuffle(pool.filter(q => missed.has(q.id)));
  if (onlyMissed) return size ? failed.slice(0, size) : failed;
  const fresh = shuffle(pool.filter(q => !missed.has(q.id)));
  if (!size) return shuffle([...failed, ...fresh]);
  const fromFailed = failed.slice(0, Math.ceil(size / 2));
  const picked = [...fromFailed, ...fresh.slice(0, size - fromFailed.length)];
  if (picked.length < size) picked.push(...failed.slice(fromFailed.length, fromFailed.length + size - picked.length));
  return shuffle(picked);
}

function isAreaId(v: string | null): v is AreaId {
  return !!v && (AREA_IDS as string[]).includes(v);
}

export default function Practica() {
  const params = new URLSearchParams(useSearch());
  const areaParam = params.get('area');
  const repasoParam = params.get('repaso') === '1';
  const { progress, recordAnswer, trackChallengeTime, trackChallengeQuestion } = useProgress();
  const missedIds = useMemo(() => new Set(Object.keys(progress.missedQuestions)), [progress.missedQuestions]);

  const [phase, setPhase] = useState<Phase>('setup');
  useActiveTimer(phase === 'running', ms => trackChallengeTime('answering', ms));
  const [area, setArea] = useState<AreaFilter>(isAreaId(areaParam) ? areaParam : repasoParam ? 'todas' : 'matematicas');
  const [difficulty, setDifficulty] = useState<0 | 1 | 2 | 3>(0);
  const [competencia, setCompetencia] = useState('');
  const [size, setSize] = useState<number>(10);
  const [session, setSession] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const areaPool = area === 'todas' ? allQuestions : questionsByArea[area];
  const competencias = area === 'todas' ? [] : COMPETENCIAS[area].filter(c => areaPool.some(q => q.competencia === c));
  const pool = areaPool.filter(
    q => (!difficulty || q.difficulty === difficulty) && (!competencia || q.competencia === competencia)
  );
  const missedInPool = pool.filter(q => missedIds.has(q.id)).length;
  const missedTotal = missedIds.size;

  const start = (questions: Question[]) => {
    if (questions.length === 0) return;
    setSession(questions);
    setIndex(0);
    setAnswers({});
    setPhase('running');
    window.scrollTo({ top: 0 });
  };

  // Enlace directo /practica?repaso=1: arranca el repaso de errores de una vez
  useEffect(() => {
    if (repasoParam && missedTotal > 0 && phase === 'setup' && session.length === 0) {
      start(buildSession(allQuestions, missedIds, 0, true));
    }
  }, []);

  const question = session[index];
  const selected = question ? answers[question.id] ?? null : null;
  const answered = selected !== null;

  const select = (optionId: string) => {
    if (!question || answered) return;
    setAnswers(prev => ({ ...prev, [question.id]: optionId }));
    recordAnswer(question, optionId === question.answer);
    trackChallengeQuestion();
  };

  const next = () => {
    if (index < session.length - 1) {
      setIndex(i => i + 1);
      window.scrollTo({ top: 0 });
    } else {
      setPhase('summary');
      window.scrollTo({ top: 0 });
    }
  };

  // Atajos de teclado: A–D o 1–4 para responder, Enter para seguir
  useEffect(() => {
    if (phase !== 'running' || !question) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;
      const k = e.key.toLowerCase();
      const byLetter = question.options.find(o => o.id === k);
      const byNumber = /^[1-9]$/.test(k) ? question.options[Number(k) - 1] : undefined;
      if (!answered && (byLetter || byNumber)) select((byLetter ?? byNumber)!.id);
      else if (answered && e.key === 'Enter') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  // ---------- Resumen ----------
  if (phase === 'summary') {
    const done = session.filter(q => answers[q.id] !== undefined);
    const correct = done.filter(q => answers[q.id] === q.answer);
    const wrong = done.filter(q => answers[q.id] !== q.answer);
    const pct = done.length ? Math.round((correct.length / done.length) * 100) : 0;
    const byComp = new Map<string, { ok: number; total: number }>();
    for (const q of done) {
      const c = byComp.get(q.competencia) ?? { ok: 0, total: 0 };
      c.total++;
      if (answers[q.id] === q.answer) c.ok++;
      byComp.set(q.competencia, c);
    }

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center py-4">
          <div className="text-6xl mb-3" aria-hidden="true">{pct >= 70 ? '🎉' : pct >= 50 ? '💪' : '📚'}</div>
          <h1 className="text-2xl font-bold font-['Lexend'] text-foreground">Resumen de la sesión</h1>
          <div className="text-5xl font-bold text-primary font-['Lexend'] mt-3">{pct}%</div>
          <p className="text-muted-foreground mt-2">
            {correct.length} de {done.length} correctas{done.length < session.length ? ` (respondiste ${done.length} de ${session.length})` : ''}
          </p>
        </div>

        {byComp.size > 0 && (
          <section className="bg-card rounded-xl border border-border p-4">
            <h2 className="font-bold font-['Lexend'] text-foreground mb-3">Por competencia</h2>
            <div className="space-y-3">
              {[...byComp.entries()].map(([comp, v]) => (
                <div key={comp}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-foreground">{comp}</span>
                    <span className="font-semibold text-foreground">{v.ok}/{v.total}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary to-green-500 rounded-full" style={{ width: `${(v.ok / v.total) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="font-bold font-['Lexend'] text-foreground mb-3">
            {wrong.length ? `Repasa tus errores (${wrong.length})` : '¡Sin errores en esta sesión!'}
          </h2>
          {wrong.length > 0 && (
            <p className="text-sm text-muted-foreground mb-3">
              Estas preguntas quedaron guardadas y volverán a aparecer en tus próximas sesiones hasta que las respondas bien.
            </p>
          )}
          <div className="space-y-3">
            {wrong.map(q => {
              const yours = q.options.find(o => o.id === answers[q.id]);
              const right = q.options.find(o => o.id === q.answer);
              return (
                <details key={q.id} className="rounded-xl border border-red-200 bg-red-50 p-4 group">
                  <summary className="cursor-pointer list-none flex items-start gap-2">
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <span className="text-sm font-semibold text-foreground">{q.enunciado}</span>
                  </summary>
                  <div className="mt-3 space-y-2 text-sm pl-7">
                    <p><span className="font-semibold text-red-700">Tu respuesta:</span> {yours?.id.toUpperCase()}. {yours?.text}</p>
                    <p><span className="font-semibold text-green-700">Correcta:</span> {right?.id.toUpperCase()}. {right?.text}</p>
                    <p className="text-foreground">{q.explanation}</p>
                    <p className="text-xs text-muted-foreground"><span className="font-semibold">Tip:</span> {q.tip}</p>
                  </div>
                </details>
              );
            })}
          </div>
        </section>

        <div className="grid gap-3">
          {wrong.length > 0 && (
            <button
              type="button"
              onClick={() => start(shuffle(wrong))}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-xl font-bold font-['Lexend'] hover:bg-primary/90 transition-colors"
            >
              <RotateCcw className="w-5 h-5" aria-hidden="true" /> Volver a intentar mis errores
            </button>
          )}
          <button
            type="button"
            onClick={() => setPhase('setup')}
            className="w-full flex items-center justify-center gap-2 border-2 border-primary text-primary py-3 rounded-xl font-bold font-['Lexend'] hover:bg-primary/5 transition-colors"
          >
            <PenLine className="w-5 h-5" aria-hidden="true" /> Nueva sesión
          </button>
          <Link href="/" className="w-full flex items-center justify-center gap-2 text-muted-foreground py-2 text-sm hover:text-foreground">
            <HomeIcon className="w-4 h-4" aria-hidden="true" /> Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  // ---------- Pregunta ----------
  if (phase === 'running' && question) {
    const correctSoFar = session.filter(q => answers[q.id] === q.answer).length;
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-lg font-bold font-['Lexend'] text-foreground">Modo práctica</h1>
          <button
            type="button"
            onClick={() => setPhase('summary')}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <Flag className="w-4 h-4" aria-hidden="true" /> Terminar
          </button>
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Pregunta {index + 1} de {session.length}</span>
          <span className="font-semibold">{correctSoFar} correctas</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={session.length} aria-valuenow={index}>
          <motion.div animate={{ width: `${(index / session.length) * 100}%` }} className="h-full bg-primary rounded-full" />
        </div>
        {progress.missedQuestions[question.id] && !answered && (
          <p className="text-xs font-semibold text-orange-700 bg-orange-50 border border-orange-200 rounded-lg px-3 py-1.5 inline-block">
            🔁 Esta pregunta la fallaste antes. ¡Ahora sí!
          </p>
        )}

        <QuestionView question={question} selected={selected} answered={answered} onSelect={select} showMeta />

        {answered && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            type="button"
            onClick={next}
            className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold font-['Lexend'] hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            {index < session.length - 1 ? <>Siguiente pregunta <ChevronRight className="w-5 h-5" /></> : <>Ver resumen <CheckCircle2 className="w-5 h-5" /></>}
          </motion.button>
        )}
      </div>
    );
  }

  // ---------- Configuración ----------
  const chip = (active: boolean) =>
    `px-3 py-2 rounded-xl border text-sm font-medium transition-colors ${
      active ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-foreground border-border hover:border-primary/40'
    }`;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-['Lexend'] text-foreground">Modo práctica</h1>
        <p className="text-muted-foreground mt-1">
          Elige un área y responde una pregunta a la vez. Verás si acertaste, la explicación y un tip al instante.
        </p>
      </div>

      {missedTotal > 0 && (
        <div className="flex items-center justify-between gap-3 bg-orange-50 border border-orange-200 rounded-xl p-4">
          <div>
            <p className="font-semibold text-sm text-orange-900">Tienes {missedTotal} {missedTotal === 1 ? 'pregunta' : 'preguntas'} por repasar</p>
            <p className="text-xs text-orange-800">Preguntas que fallaste en lecciones, práctica o simulacro.</p>
          </div>
          <button
            type="button"
            onClick={() => start(buildSession(allQuestions, missedIds, 0, true))}
            className="flex-shrink-0 inline-flex items-center gap-1 bg-orange-600 text-white px-3 py-2 rounded-xl text-sm font-bold hover:bg-orange-700"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" /> Repasar
          </button>
        </div>
      )}

      <fieldset className="space-y-2">
        <legend className="font-bold font-['Lexend'] text-foreground mb-2">1. Área</legend>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {AREA_IDS.map(a => (
            <button
              key={a}
              type="button"
              aria-pressed={area === a}
              onClick={() => { setArea(a); setCompetencia(''); }}
              className={`${chip(area === a)} text-left`}
            >
              <span aria-hidden="true">{AREA_INFO[a].icon}</span> {AREA_INFO[a].label}
              <span className="block text-xs opacity-75">{questionsByArea[a].length} preguntas</span>
            </button>
          ))}
          <button type="button" aria-pressed={area === 'todas'} onClick={() => { setArea('todas'); setCompetencia(''); }} className={`${chip(area === 'todas')} text-left`}>
            🎲 Todas las áreas
            <span className="block text-xs opacity-75">{allQuestions.length} preguntas</span>
          </button>
        </div>
      </fieldset>

      <fieldset>
        <legend className="font-bold font-['Lexend'] text-foreground mb-2">2. Nivel (opcional)</legend>
        <div className="flex flex-wrap gap-2">
          {([0, 1, 2, 3] as const).map(d => (
            <button key={d} type="button" aria-pressed={difficulty === d} onClick={() => setDifficulty(d)} className={chip(difficulty === d)}>
              {d === 0 ? 'Todos' : DIFFICULTY_LABEL[d]}
            </button>
          ))}
        </div>
      </fieldset>

      {competencias.length > 1 && (
        <div>
          <label htmlFor="competencia" className="font-bold font-['Lexend'] text-foreground block mb-2">3. Competencia (opcional)</label>
          <select
            id="competencia"
            value={competencia}
            onChange={e => setCompetencia(e.target.value)}
            className="w-full bg-card border border-border rounded-xl px-3 py-2.5 text-sm text-foreground"
          >
            <option value="">Todas las competencias</option>
            {competencias.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      )}

      <fieldset>
        <legend className="font-bold font-['Lexend'] text-foreground mb-2">Preguntas por sesión</legend>
        <div className="flex flex-wrap gap-2">
          {SIZES.map(s => (
            <button key={s} type="button" aria-pressed={size === s} onClick={() => setSize(s)} className={chip(size === s)}>
              {s === 0 ? 'Todas' : s}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="bg-muted/50 rounded-xl p-4 border border-border text-sm text-foreground">
        {pool.length === 0 ? (
          <p>No hay preguntas con esos filtros. Prueba con otro nivel o competencia.</p>
        ) : (
          <p>
            Hay <strong>{pool.length}</strong> {pool.length === 1 ? 'pregunta disponible' : 'preguntas disponibles'} con estos filtros
            {missedInPool > 0 && <> (incluye {missedInPool} que fallaste antes y saldrán primero)</>}.
          </p>
        )}
      </div>

      <button
        type="button"
        disabled={pool.length === 0}
        onClick={() => start(buildSession(pool, missedIds, size, false))}
        className="w-full bg-[#4ade80] text-[#0f2040] py-3 rounded-xl font-bold font-['Lexend'] hover:bg-[#22c55e] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <PenLine className="w-5 h-5" aria-hidden="true" /> Empezar práctica
      </button>

      <p className="text-xs text-muted-foreground">
        Las preguntas son originales de ProICFES o vienen de nuestras lecciones; están alineadas con las competencias del Saber 11, pero no son preguntas oficiales del ICFES.
      </p>
    </div>
  );
}

