import { Link } from 'wouter';
import FaqList from '@/components/FaqList';
import { FAQ } from '@/data/faq';

const OFICIAL = [
  { label: 'Caja de herramientas Saber 11', note: 'ejemplos de preguntas explicados para las cinco pruebas', url: 'https://www.icfes.gov.co/caja-de-herramientas-saber-11/' },
  { label: 'Cuadernillo de preguntas de Lectura crítica 2026 (PDF)', note: 'preguntas oficiales de práctica', url: 'https://www.icfes.gov.co/wp-content/uploads/2026/03/16-feb-cuadernillo-de-preguntas-lectura-critica-saber-11-2026.pdf' },
  { label: 'Cuadernillo de preguntas de Matemáticas 2026 (PDF)', note: 'preguntas oficiales de práctica', url: 'https://www.icfes.gov.co/wp-content/uploads/2026/04/09-Marzo_Cuadernillo-de-Preguntas-Matematicas-Saber-11-2026.pdf' },
  { label: 'Guía de orientación Saber 11 2026 (PDF)', note: 'cómo es el examen y qué evalúa cada prueba', url: 'https://www.icfes.gov.co/wp-content/uploads/2026/03/17-marzo-guia-de-orientacion-saber-11-2026-2.pdf' },
  { label: 'Familiarízate con el examen Saber 11', note: 'página oficial con todo el material', url: 'https://www.icfes.gov.co/evaluaciones-icfes/saber-11/familiarizate-con-el-examen-saber-11/' },
];

export default function PreguntasFrecuentes() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="page-title">Preguntas frecuentes sobre el Saber 11</h1>
        <p className="text-muted-foreground mt-1">
          Qué es el examen, cómo se calcula el puntaje global del ICFES y cómo sacarle provecho a ProICFES.
        </p>
      </div>

      <FaqList items={FAQ} />

      <section className="card space-y-3 p-5" aria-labelledby="material-oficial" id="material-oficial-icfes">
        <h2 id="material-oficial" className="font-bold font-['Lexend'] text-foreground">Material oficial gratis del ICFES</h2>
        <p className="text-sm text-foreground">
          Úsalo también: es del ICFES y es gratis. ProICFES te ayuda a practicar todos los días y a ver en qué fallas.
        </p>
        <ul className="list-disc space-y-1.5 pl-5 text-sm">
          {OFICIAL.map(o => (
            <li key={o.url}>
              <a href={o.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-navy underline underline-offset-2">{o.label}</a>
              <span className="text-muted-foreground"> · {o.note}</span>
            </li>
          ))}
        </ul>
        <p className="text-xs text-muted-foreground">Enlaces de icfes.gov.co revisados el 19 de octubre de 2026.</p>
      </section>

      <section className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-2">
        <h2 className="font-bold font-['Lexend'] text-foreground">¿Listo para practicar?</h2>
        <p className="text-sm text-foreground">
          Responde preguntas tipo ICFES con explicación en el{' '}
          <Link href="/practica" className="text-primary font-semibold underline underline-offset-2">modo práctica</Link>{' '}
          o mídete con el <Link href="/simulacro" className="text-primary font-semibold underline underline-offset-2">simulacro</Link>.
        </p>
      </section>

      <p className="text-xs text-muted-foreground">
        Fuentes: Guía de orientación Saber 11.° y Resolución 268 de 2020 del ICFES. Para información oficial
        (fechas, inscripciones y resultados) consulta{' '}
        <a href="https://www.icfes.gov.co/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">icfes.gov.co</a>.
      </p>
    </div>
  );
}
