import type { ReactNode } from 'react';
import { Link } from 'wouter';
import { LEGAL, PLACEHOLDER_RE } from '@/config/legal';

/** Muestra un dato de src/config/legal.ts; si aún es un [MARCADOR], lo resalta para que se vea que falta. */
export function Dato({ children }: { children: string }) {
  if (PLACEHOLDER_RE.test(children)) {
    return (
      <mark className="bg-yellow-200 text-yellow-950 px-1 rounded" title="Dato pendiente por completar">
        {children}
      </mark>
    );
  }
  return <>{children}</>;
}

export interface LegalSection {
  id: string;
  title: string;
  content: ReactNode;
}

const related = [
  { path: '/politica-de-privacidad', label: 'Política de privacidad' },
  { path: '/tratamiento-de-datos', label: 'Tratamiento de datos personales' },
  { path: '/terminos', label: 'Términos y condiciones' },
  { path: '/cookies', label: 'Política de cookies' },
];

/** Plantilla común de las páginas legales: título, vigencia, índice y secciones numeradas. */
export default function LegalPage({ path, title, intro, sections }: { path: string; title: string; intro: ReactNode; sections: LegalSection[] }) {
  return (
    <article className="max-w-3xl space-y-6 legal">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold font-['Lexend'] text-foreground">{title}</h1>
        <p className="text-xs text-muted-foreground">
          Versión {LEGAL.version} · Vigente desde: <Dato>{LEGAL.fechaVigencia}</Dato>
        </p>
        <div className="text-sm text-foreground/90 leading-relaxed space-y-2">{intro}</div>
      </header>

      <nav aria-label="Contenido" className="bg-muted/50 rounded-xl p-4">
        <p className="text-sm font-semibold text-foreground mb-2">Contenido</p>
        <ol className="list-decimal pl-5 space-y-1 text-sm columns-1 sm:columns-2 gap-6">
          {sections.map(s => (
            <li key={s.id}>
              <a href={`#${s.id}`} className="text-primary hover:underline underline-offset-2">{s.title}</a>
            </li>
          ))}
        </ol>
      </nav>

      {sections.map((s, i) => (
        <section key={s.id} id={s.id} aria-labelledby={`${s.id}-titulo`} className="scroll-mt-20 space-y-2">
          <h2 id={`${s.id}-titulo`} className="text-lg font-bold font-['Lexend'] text-foreground">
            {i + 1}. {s.title}
          </h2>
          <div className="text-sm text-foreground/90 leading-relaxed space-y-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1 [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2">
            {s.content}
          </div>
        </section>
      ))}

      <footer className="border-t border-border pt-4 text-xs text-muted-foreground space-y-2">
        <p>Documentos relacionados:</p>
        <ul className="flex flex-wrap gap-x-4 gap-y-1">
          {related.filter(r => r.path !== path).map(r => (
            <li key={r.path}><Link href={r.path} className="text-primary hover:underline underline-offset-2">{r.label}</Link></li>
          ))}
        </ul>
      </footer>
    </article>
  );
}
