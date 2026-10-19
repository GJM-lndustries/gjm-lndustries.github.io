import { useCallback, useEffect, useState } from "react";
import { Link } from "wouter";
import { Copy, Eye, LogOut, ShieldCheck, Trash2, UserMinus, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { AREA_INFO } from "@/data/questions/meta";
import {
  CODE_RE, DEMO_MEMBERS, DEMO_SUMMARY, createGroup, cursoError, deleteGroup, groupMembers, groupSummary, joinGroup,
  leaveGroup, myMemberships, myTeacherGroups, normalizeCode, removeMember, validAlias, weakest,
  type ClassGroup, type GroupSummary, type Membership,
} from "@/lib/curso";

type Tab = "estudiante" | "docente";

function Summary({ summary, members, onRemove }: { summary: GroupSummary | null; members: string[]; onRemove?: (i: number) => void }) {
  const weak = summary ? weakest(summary.rows) : [];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 text-center">
        <div className="rounded-xl bg-navy/5 p-3"><p className="text-2xl font-bold text-navy tabular-nums">{summary?.members ?? members.length}</p><p className="text-xs text-muted-foreground">estudiantes en el grupo</p></div>
        <div className="rounded-xl bg-navy/5 p-3"><p className="text-2xl font-bold text-navy tabular-nums">{summary?.withData ?? 0}</p><p className="text-xs text-muted-foreground">ya practicaron con su cuenta</p></div>
      </div>
      <div>
        <h3 className="font-semibold text-foreground">Lo que más le cuesta al curso</h3>
        {weak.length === 0 ? (
          <p className="mt-1 text-sm text-muted-foreground" data-testid="resumen-vacio">
            Aparece cuando al menos {summary?.minStudents ?? 5} estudiantes hayan practicado con su cuenta (y cada competencia tenga 20 respuestas o más). Así nadie queda identificado.
          </p>
        ) : (
          <ol className="mt-2 space-y-2.5" data-testid="debiles">
            {weak.map(r => (
              <li key={`${r.area}|${r.competencia}`}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span><span className="font-semibold text-foreground">{r.competencia}</span> <span className="text-muted-foreground">· {AREA_INFO[r.area]?.label ?? r.area}</span></span>
                  <span className="shrink-0 whitespace-nowrap tabular-nums font-semibold text-foreground">{r.pct} %</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-navy/10" aria-hidden="true"><div className="h-full rounded-full bg-navy" style={{ width: `${r.pct}%` }} /></div>
                <p className="mt-0.5 text-xs text-muted-foreground">{r.answered} respuestas de {r.students} estudiantes</p>
              </li>
            ))}
          </ol>
        )}
      </div>
      <div>
        <h3 className="font-semibold text-foreground">Quiénes se unieron</h3>
        {members.length === 0 ? <p className="mt-1 text-sm text-muted-foreground">Todavía nadie. Comparte el código.</p> : (
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {members.map((m, i) => (
              <li key={`${m}-${i}`} className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-sm">
                {m}
                {onRemove && <button type="button" onClick={() => onRemove(i)} aria-label={`Quitar a ${m} del grupo`} className="text-muted-foreground hover:text-foreground"><UserMinus className="h-3.5 w-3.5" /></button>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function NeedAccount({ who }: { who: Tab }) {
  return (
    <div className="rounded-xl bg-brand-soft/60 p-4 text-sm text-foreground" data-testid="curso-cuenta">
      <p>
        {who === "docente"
          ? "Para crear un grupo necesitas una cuenta de adulto."
          : "Para unirte necesitas una cuenta (si eres menor de edad, con permiso de tu mamá, papá o acudiente). Así tu práctica cuenta para el resumen del curso."}
      </p>
      <Link href="/cuenta" className="btn-primary mt-3">Entrar o crear cuenta</Link>
    </div>
  );
}

function Estudiante({ uid, sync }: { uid: string; sync: () => Promise<void> }) {
  const [code, setCode] = useState("");
  const [alias, setAlias] = useState("");
  const [mine, setMine] = useState<Membership[]>([]);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const load = useCallback(() => myMemberships(uid).then(setMine).catch(e => setMsg({ ok: false, text: cursoError(e) })), [uid]);
  useEffect(() => { void load(); }, [load]);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setMsg(null);
    try {
      await joinGroup(code, alias);
      await sync();
      setMsg({ ok: true, text: "Listo, ya estás en el grupo." });
      setCode("");
      await load();
    } catch (err) { setMsg({ ok: false, text: cursoError(err) }); }
    setBusy(false);
  };
  return (
    <div className="space-y-4">
      <form onSubmit={submit} className="space-y-3">
        <label className="block text-sm font-semibold text-foreground">Código del grupo
          <input value={code} onChange={e => setCode(normalizeCode(e.target.value))} placeholder="Ej.: K7PM3Q" autoComplete="off" className="input mt-1 w-full uppercase tracking-[0.3em]" />
        </label>
        <label className="block text-sm font-semibold text-foreground">¿Cómo quieres que te vea tu docente?
          <input value={alias} onChange={e => setAlias(e.target.value.slice(0, 30))} placeholder="Tu nombre o un apodo" className="input mt-1 w-full" />
          <span className="mt-1 block text-xs font-normal text-muted-foreground">No pongas apellidos, documento ni teléfono: no hacen falta.</span>
        </label>
        <button type="submit" className="btn-primary" disabled={busy || !CODE_RE.test(code) || !validAlias(alias)}>Unirme</button>
      </form>
      {msg && <p role="status" className={`text-sm ${msg.ok ? "text-emerald-700" : "text-red-700"}`}>{msg.text}</p>}
      {mine.length > 0 && (
        <div>
          <h3 className="font-semibold text-foreground">Tus grupos</h3>
          <ul className="mt-2 space-y-2">
            {mine.map(m => (
              <li key={m.group_id} className="flex items-center justify-between gap-3 rounded-lg bg-muted px-3 py-2 text-sm">
                <span><strong>{m.group?.name ?? "Grupo"}</strong> · como «{m.alias}»</span>
                <button type="button" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
                  onClick={async () => { try { await leaveGroup(m.group_id, uid); await load(); } catch (e) { setMsg({ ok: false, text: cursoError(e) }); } }}>
                  <LogOut className="h-4 w-4" aria-hidden="true" /> Salirme
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Docente({ uid }: { uid: string }) {
  const [groups, setGroups] = useState<ClassGroup[]>([]);
  const [sel, setSel] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [summary, setSummary] = useState<GroupSummary | null>(null);
  const [members, setMembers] = useState<{ user_id: string; alias: string }[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const load = useCallback(async () => {
    try { const g = await myTeacherGroups(uid); setGroups(g); setSel(s => s ?? g[0]?.id ?? null); } catch (e) { setMsg(cursoError(e)); }
  }, [uid]);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    if (!sel) return;
    Promise.all([groupSummary(sel), groupMembers(sel)]).then(([s, m]) => { setSummary(s); setMembers(m); }).catch(e => setMsg(cursoError(e)));
  }, [sel]);
  const group = groups.find(g => g.id === sel);
  return (
    <div className="space-y-4">
      <form className="flex flex-wrap items-end gap-2" onSubmit={async e => {
        e.preventDefault(); setMsg(null);
        try { const g = await createGroup(name); setName(""); setSel(g.id); await load(); } catch (err) { setMsg(cursoError(err)); }
      }}>
        <label className="min-w-0 flex-1 text-sm font-semibold text-foreground">Nombre del grupo
          <input value={name} onChange={e => setName(e.target.value.slice(0, 60))} placeholder="Ej.: 11-B Matemáticas" className="input mt-1 w-full" />
        </label>
        <button type="submit" className="btn-primary" disabled={name.trim().length < 2}>Crear grupo</button>
      </form>
      {msg && <p role="status" className="text-sm text-red-700">{msg}</p>}
      {groups.length > 1 && (
        <select className="input" value={sel ?? ""} onChange={e => setSel(e.target.value)} aria-label="Grupo">
          {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
      )}
      {group && (
        <div className="space-y-4 rounded-xl border border-border p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs text-muted-foreground">Código para tus estudiantes</p>
              <p className="font-mono text-2xl font-bold tracking-[0.3em] text-navy">{group.code}</p>
            </div>
            <button type="button" className="btn-secondary btn-sm" onClick={() => navigator.clipboard?.writeText(group.code)}>
              <Copy className="h-4 w-4" aria-hidden="true" /> Copiar
            </button>
          </div>
          <Summary summary={summary} members={members.map(m => m.alias)} onRemove={async i => {
            const m = members[i]; if (!m) return;
            try { await removeMember(group.id, m.user_id); setMembers(members.filter((_, j) => j !== i)); } catch (e) { setMsg(cursoError(e)); }
          }} />
          <button type="button" className="inline-flex items-center gap-1.5 text-sm text-red-700 hover:underline" onClick={async () => {
            if (!window.confirm(`¿Borrar el grupo «${group.name}»? Tus estudiantes no pierden su progreso.`)) return;
            try { await deleteGroup(group.id); setSel(null); setSummary(null); await load(); } catch (e) { setMsg(cursoError(e)); }
          }}>
            <Trash2 className="h-4 w-4" aria-hidden="true" /> Borrar grupo
          </button>
        </div>
      )}
    </div>
  );
}

export default function Curso() {
  const auth = useAuth();
  const [tab, setTab] = useState<Tab>("estudiante");
  const [demo, setDemo] = useState(false);
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (q.get("ejemplo") === "1") setDemo(true);
    if (q.get("rol") === "docente") setTab("docente");
  }, []);
  const ready = auth.status === "ready" && auth.userId;
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="page-title">ProICFES para tu curso</h1>
        <p className="mt-2 text-muted-foreground">El docente crea un grupo y comparte un código. Los estudiantes se unen y practican como siempre. El docente ve en qué competencias le cuesta más al curso, para saber qué repasar en clase.</p>
      </div>

      <section className="card flex items-start gap-3 p-4" aria-labelledby="privacidad" data-testid="curso-privacidad">
        <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-700" aria-hidden="true" />
        <div className="text-sm text-foreground/90">
          <h2 id="privacidad" className="font-semibold text-foreground">Qué ve el docente y qué no</h2>
          <ul className="mt-1 list-disc space-y-0.5 pl-5">
            <li>Ve el nombre o apodo que cada estudiante eligió al unirse, y nada más de su cuenta.</li>
            <li>Ve el porcentaje de aciertos del curso por competencia, sumando a todos. Nunca el puntaje, las respuestas ni la racha de alguien.</li>
            <li>El resumen solo aparece con 5 estudiantes o más, para que nadie quede identificado.</li>
            <li>Cualquier estudiante puede salirse cuando quiera.</li>
          </ul>
        </div>
      </section>

      <div className="card p-5">
        <div role="tablist" aria-label="Quién eres" className="mb-4 grid grid-cols-2 gap-1 rounded-xl bg-muted p-1">
          {(["estudiante", "docente"] as const).map(t => (
            <button key={t} role="tab" type="button" aria-selected={tab === t} onClick={() => setTab(t)}
              className={`rounded-lg py-2 text-sm font-semibold ${tab === t ? "bg-white text-navy shadow-sm" : "text-muted-foreground"}`}>
              {t === "estudiante" ? "Soy estudiante" : "Soy docente"}
            </button>
          ))}
        </div>
        <div role="tabpanel">
          {!ready ? <NeedAccount who={tab} /> : tab === "estudiante"
            ? <Estudiante uid={auth.userId!} sync={auth.syncNow} />
            : <Docente uid={auth.userId!} />}
        </div>
      </div>

      <section className="card p-5" aria-labelledby="ejemplo">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="ejemplo" className="flex items-center gap-2 font-semibold text-foreground"><Users className="h-5 w-5 text-navy" aria-hidden="true" /> Así se ve el panel del docente</h2>
          <button type="button" className="btn-secondary btn-sm" aria-expanded={demo} onClick={() => setDemo(d => !d)} data-testid="ver-ejemplo">
            <Eye className="h-4 w-4" aria-hidden="true" /> {demo ? "Ocultar ejemplo" : "Ver un ejemplo"}
          </button>
        </div>
        {demo && (
          <div className="mt-4 space-y-3" data-testid="demo">
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">Ejemplo con datos inventados. No es un curso real.</p>
            <p className="font-mono text-xl font-bold tracking-[0.3em] text-navy">K7PM3Q</p>
            <Summary summary={DEMO_SUMMARY} members={DEMO_MEMBERS} />
          </div>
        )}
      </section>
    </div>
  );
}
