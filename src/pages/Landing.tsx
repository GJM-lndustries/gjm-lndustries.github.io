import { useMemo } from "react";
import { Link } from "wouter";
import {
  BookOpenText, ChartNoAxesColumn, Check, ClipboardList, ListChecks, ShieldCheck, Smartphone, Target, Timer,
} from "lucide-react";
import FaqList from "@/components/FaqList";
import { FAQ } from "@/data/faq";
import { BANK_TOTAL } from "@/data/questions/meta";
import { questionsByArea } from "@/data/questions";
import { useProgress } from "@/contexts/ProgressContext";
import { SITE } from "@/config/site";
import SampleQuestion from "@/components/SampleQuestion";
import InstallPrompt from "@/components/InstallPrompt";
import BrandMark from "@/components/BrandMark";
import PhoneMockup from "@/components/PhoneMockup";

const BENEFITS = [
  {
    icon: BookOpenText,
    title: "Lecciones cortas",
    text: "Cada tema en pocos minutos, con ejemplos y las palabras clave que aparecen en el examen.",
  },
  {
    icon: ListChecks,
    title: "Preguntas con explicación",
    text: `${BANK_TOTAL} preguntas originales tipo Saber 11. Al responder ves por qué cada opción es correcta o no.`,
  },
  {
    icon: Timer,
    title: "Simulacros con reloj",
    text: "Versión corta o completa, por sesiones, con un puntaje global estimado de 0 a 500.",
  },
  {
    icon: ChartNoAxesColumn,
    title: "Tu avance a la vista",
    text: "Aciertos por área, tu meta de puntaje y una racha diaria que te ayuda a mantener el hábito.",
  },
];

const STEPS = [
  { title: "Define tu meta", text: "Elige la carrera que te interesa y el puntaje al que apuntas. Toma un minuto." },
  { title: "Cumple el reto diario", text: "Lee una lección y responde unas preguntas. Son unos cinco minutos al día." },
  { title: "Mide tu avance", text: "Presenta un simulacro y ajusta tu plan con el puntaje estimado." },
];

const FOR_YOU = [
  "Explicaciones en español claro, sin tecnicismos de más",
  "Funciona en cualquier celular y puedes instalarla como app",
  "Las preguntas que fallas vuelven en el repaso hasta que las domines",
  "Tu progreso se guarda en el dispositivo; con una cuenta, también en la nube",
];

export default function Landing() {
  const { progress, loaded } = useProgress();
  const hasProgress =
    loaded &&
    (progress.totalXp > 0 ||
      progress.completedLessons.length > 0 ||
      progress.hasCompletedOnboarding ||
      progress.streakState.current > 0);
  const ctaHref = hasProgress ? "/inicio" : "/meta";
  const ctaLabel = hasProgress ? "Continuar estudiando" : "Empezar gratis";

  const sample = useMemo(() => questionsByArea.matematicas.find(q => !q.stimulusId) ?? questionsByArea.matematicas[0], []);

  return (
    <div className="min-h-screen bg-canvas text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-canvas/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <BrandMark />
          <div className="flex items-center gap-2">
            <Link href="/cuenta" className="btn-secondary btn-sm">
              Iniciar sesión
            </Link>
            <Link href={ctaHref} className="btn-primary btn-sm hidden sm:inline-flex">
              {ctaLabel}
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Portada */}
        <section className="overflow-hidden">
          <div className="mx-auto grid max-w-6xl gap-12 px-4 pb-16 pt-10 sm:px-6 md:grid-cols-[1.1fr_0.9fr] md:items-center md:pb-24 md:pt-16">
            <div>
              <p className="eyebrow text-navy">Preicfes gratis para el Saber 11</p>
              <h1 className="mt-3 font-['Lexend'] text-[34px] font-bold leading-[1.1] tracking-tight text-ink sm:text-5xl md:text-[54px]">
                Prepárate para el ICFES con un plan diario y gratuito
              </h1>
              <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-muted-foreground">
                Lecciones cortas, preguntas tipo Saber 11 con explicación y simulacros que estiman tu puntaje.
                Todo en español y desde el celular.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href={ctaHref} className="btn-primary px-7">
                  {ctaLabel}
                </Link>
                <a href="#ejemplo" className="btn-secondary px-7">
                  Probar una pregunta
                </a>
              </div>
              <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                {["Gratis", "Empiezas sin registrarte", "Hecho en Colombia"].map(t => (
                  <li key={t} className="inline-flex items-center gap-1.5">
                    <Check className="h-4 w-4 text-green-700" strokeWidth={2.25} aria-hidden="true" /> {t}
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative">
              <div className="absolute inset-x-6 bottom-6 top-10 -z-0 rounded-[3rem] bg-brand-soft md:inset-x-0" aria-hidden="true" />
              <div className="relative">
                <PhoneMockup />
              </div>
            </div>
          </div>
        </section>

        {/* Qué incluye */}
        <section className="border-y border-border bg-white" aria-labelledby="beneficios">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
            <div className="max-w-2xl">
              <h2 id="beneficios" className="font-['Lexend'] text-[26px] font-bold tracking-tight text-ink md:text-[32px]">
                Todo lo que necesitas para el Saber 11
              </h2>
              <p className="mt-3 text-[17px] leading-relaxed text-muted-foreground">
                Las cinco pruebas del examen, con la misma escala de 0 a 500 que usa el ICFES.
              </p>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {BENEFITS.map(({ icon: Icon, title, text }) => (
                <article key={title} className="card flex gap-4 p-5 sm:block">
                  <span className="icon-tile bg-navy/5 text-navy" aria-hidden="true">
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  <div>
                    <h3 className="font-['Lexend'] text-[17px] font-semibold text-ink sm:mt-4">{title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Para quién */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20" aria-labelledby="para-ti">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <div className="overflow-hidden rounded-2xl border border-border bg-white">
              <img
                src="/images/landing/estudiante-800.webp"
                srcSet="/images/landing/estudiante-800.webp 800w, /images/landing/estudiante-1200.webp 1200w"
                sizes="(min-width: 768px) 560px, 100vw"
                alt="Estudiante de bachillerato estudiando en casa con su cuaderno"
                width={800}
                height={600}
                loading="lazy"
                decoding="async"
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
            <div>
              <h2 id="para-ti" className="font-['Lexend'] text-[26px] font-bold tracking-tight text-ink md:text-[32px]">
                Pensado para estudiantes de grado 11
              </h2>
              <p className="mt-3 text-[17px] leading-relaxed text-muted-foreground">
                Estudia en ratos cortos entre el colegio y tus otras cosas. Dos minutos de lectura y tres preguntas al día
                ya cuentan para tu racha.
              </p>
              <ul className="mt-6 space-y-3">
                {FOR_YOU.map(t => (
                  <li key={t} className="flex items-start gap-3 text-[15px] text-foreground">
                    <span className="mt-0.5 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-brand-soft text-green-700" aria-hidden="true">
                      <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Cómo funciona */}
        <section className="border-y border-border bg-white" aria-labelledby="como">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
            <h2 id="como" className="font-['Lexend'] text-[26px] font-bold tracking-tight text-ink md:text-[32px]">
              Cómo funciona
            </h2>
            <ol className="mt-10 grid gap-4 md:grid-cols-3">
              {STEPS.map((s, i) => (
                <li key={s.title} className="card flex gap-4 p-5 md:block">
                  <span className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-navy font-['Lexend'] text-sm font-semibold text-white">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-['Lexend'] text-[17px] font-semibold text-ink md:mt-4">{s.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Pregunta de ejemplo */}
        <section id="ejemplo" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6 md:py-20" aria-labelledby="ejemplo-titulo">
          <div className="grid gap-10 md:grid-cols-[0.8fr_1.2fr]">
            <div>
              <h2 id="ejemplo-titulo" className="font-['Lexend'] text-[26px] font-bold tracking-tight text-ink md:text-[32px]">
                Prueba una pregunta
              </h2>
              <p className="mt-3 text-[17px] leading-relaxed text-muted-foreground">
                Elige una opción y mira la explicación. Así funciona la práctica en ProICFES, y no necesitas cuenta.
              </p>
            </div>
            <div>{sample ? <SampleQuestion question={sample} /> : null}</div>
          </div>
        </section>

        {/* Transparencia */}
        <section className="border-y border-border bg-white" aria-labelledby="confianza">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
            <h2 id="confianza" className="font-['Lexend'] text-[26px] font-bold tracking-tight text-ink md:text-[32px]">
              Claro desde el principio
            </h2>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="card flex gap-4 p-5">
                <span className="icon-tile bg-navy/5 text-navy" aria-hidden="true">
                  <ShieldCheck className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <p className="text-[15px] leading-relaxed text-muted-foreground">
                  ProICFES es un proyecto independiente y gratuito. <strong className="text-foreground">No está afiliado al ICFES.</strong>{" "}
                  Las preguntas son originales: entrenan las mismas competencias del examen, pero no copian ítems oficiales.
                </p>
              </div>
              <div className="card flex gap-4 p-5">
                <span className="icon-tile bg-navy/5 text-navy" aria-hidden="true">
                  <Target className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <p className="text-[15px] leading-relaxed text-muted-foreground">
                  Tu puntaje es un <strong className="text-foreground">estimado</strong> calculado con la ponderación pública del Saber 11.
                  Para fechas, inscripciones y resultados oficiales, consulta{" "}
                  <a className="font-semibold text-navy underline underline-offset-2" href="https://www.icfes.gov.co/" rel="noopener noreferrer" target="_blank">
                    icfes.gov.co
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Preguntas frecuentes */}
        <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 md:py-20" aria-labelledby="faq-landing">
          <div className="mb-6 flex items-end justify-between gap-3">
            <h2 id="faq-landing" className="font-['Lexend'] text-[26px] font-bold tracking-tight text-ink md:text-[32px]">
              Preguntas frecuentes
            </h2>
            <Link href="/preguntas-frecuentes" className="btn-link">
              Ver todas
            </Link>
          </div>
          <FaqList
            items={FAQ.filter(f => ["que-es-saber-11", "como-se-calcula-el-puntaje", "como-usar-proicfes"].includes(f.id))}
            headingLevel="h3"
          />
        </section>

        {/* Llamado final */}
        <section className="px-4 pb-16 sm:px-6 md:pb-20">
          <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 rounded-3xl bg-navy px-6 py-10 text-white md:flex-row md:items-center md:justify-between md:px-12 md:py-14">
            <div>
              <h2 className="font-['Lexend'] text-[26px] font-bold tracking-tight md:text-[32px]">Empieza hoy tu preparación</h2>
              <p className="mt-2 max-w-lg text-[17px] text-white/80">
                Define tu meta en un minuto y haz tu primer reto. Tu progreso queda guardado en este dispositivo.
              </p>
            </div>
            <Link href={ctaHref} className="btn-primary flex-shrink-0 px-7">
              {ctaLabel}
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 text-sm text-muted-foreground sm:px-6 md:grid-cols-[1fr_auto]">
          <div className="space-y-2">
            <BrandMark compact />
            <p className="max-w-sm">
              Hecho en Colombia por {SITE.author.name}. Proyecto independiente, sin afiliación con el ICFES.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-10 gap-y-8 sm:grid-cols-3">
            <nav aria-label="Estudiar" className="flex flex-col gap-2">
              <span className="font-semibold text-foreground">Estudiar</span>
              <Link href="/practica" className="hover:text-foreground">Practicar</Link>
              <Link href="/simulacro" className="hover:text-foreground">Simulacro</Link>
              <Link href="/glosario" className="hover:text-foreground">Glosario</Link>
            </nav>
            <nav aria-label="Ayuda" className="flex flex-col gap-2">
              <span className="font-semibold text-foreground">Ayuda</span>
              <Link href="/preguntas-frecuentes" className="hover:text-foreground">Preguntas frecuentes</Link>
              <Link href="/tips" className="hover:text-foreground">Estrategias</Link>
              <Link href="/creditos" className="hover:text-foreground">Créditos de imágenes</Link>
            </nav>
            <nav aria-label="Legal" className="flex flex-col gap-2">
              <span className="font-semibold text-foreground">Legal</span>
              <Link href="/politica-de-privacidad" className="hover:text-foreground">Privacidad</Link>
              <Link href="/tratamiento-de-datos" className="hover:text-foreground">Tratamiento de datos</Link>
              <Link href="/terminos" className="hover:text-foreground">Términos</Link>
              <Link href="/cookies" className="hover:text-foreground">Cookies</Link>
            </nav>
          </div>
        </div>
      </footer>

      <InstallPrompt />
    </div>
  );
}
