import { Link } from 'wouter';
import FaqList from '@/components/FaqList';
import { FAQ } from '@/data/faq';

export default function PreguntasFrecuentes() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold font-['Lexend'] text-foreground">Preguntas frecuentes sobre el Saber 11</h1>
        <p className="text-muted-foreground mt-1">
          Qué es el examen, cómo se calcula el puntaje global del ICFES y cómo sacarle provecho a ProICFES.
        </p>
      </div>

      <FaqList items={FAQ} />

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
