import { useMemo } from "react";
import { Link } from "wouter";
import { BookOpen, CheckCircle2, Clock, Flame, GraduationCap, LineChart, Play, Shield, Sparkles } from "lucide-react";
import FaqList from "@/components/FaqList";
import { FAQ } from "@/data/faq";
import { BANK_TOTAL } from "@/data/questions/meta";
import { questionsByArea } from "@/data/questions";
import { useProgress } from "@/contexts/ProgressContext";
import { SITE } from "@/config/site";
import SampleQuestion from "@/components/SampleQuestion";
import InstallPrompt from "@/components/InstallPrompt";
import BrandMark from "@/components/BrandMark";

const BENEFITS = [
  {
    icon: BookOpen,
    title: "Lecciones claras",
    text: "Temas cortos, en español colombiano, alineados a las competencias del Saber 11.",
  },
  {
    icon: CheckCircle2,
    title: "Preguntas originales",
    text: `Más de ${BANK_TOTAL} ítems tipo ICFES con explicación al instante. No son copias del examen oficial.`,
  },
  {
    icon: Clock,
    title: "Simulacro real",
    text: "Modo corto o completo con reloj, sesiones y puntaje global estimado 0–500.",
  },
  {
    icon: LineChart,
    title: "Progreso que se ve",
    text: "Aciertos por área, meta personal y racha diaria para no perder el ritmo.",
  },
];

const STEPS = [
  { n: "1", title: "Elige un área", text: "Matemáticas, Lectura, Ciencias, Sociales o Inglés." },
  { n: "2", title: "Lee y practica", text: "Lección breve + preguntas con feedback inmediato." },
  { n: "3", title: "Mide tu nivel", text: "Haz un simulacro y ajusta tu plan según el estimado." },
];

export default function Landing() {
  const { progress, loaded } = useProgress();
  const hasProgress =
    loaded &&
    (progress.totalXp > 0 ||
      progress.completedLessons.length > 0 ||
      progress.hasCompletedOnboarding ||
      progress.streakState.current > 0);

  const sample = useMemo(() => questionsByArea.matematicas.find(q => !q.stimulusId) ?? questionsByArea.matematicas[0], []);

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-[#f7f8fa]/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <BrandMark />
          <div className="flex items-center gap-2">
            <Link
              href="/cuenta"
              className="hidden sm:inline-flex rounded-full px-3 py-2 text-sm font-semibold text-[#1e3a5f] hover:bg-[#1e3a5f]/5"
            >
              Iniciar sesión
            </Link>
            <Link
              href={hasProgress ? "/inicio" : "/meta"}
              className="inline-flex items-center justify-center rounded-full bg-[#1e3a5f] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#16304f] min-h-11"
            >
              {hasProgress ? "Continuar estudiando" : "Empezar a estudiar"}
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 md:grid-cols-2 md:items-center md:py-16">
            <div className="space-y-5">
              <p className="inline-flex items-center gap-2 rounded-full bg-[#1e3a5f]/8 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#1e3a5f]">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                Preicfes gratis · Colombia
              </p>
              <h1 className="font-['Lexend'] text-3xl font-bold leading-tight text-[#0f2040] sm:text-4xl md:text-5xl">
                Prepárate para el ICFES con calma, método y práctica real
              </h1>
              <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                ProICFES es una plataforma gratuita para el Saber 11: lecciones cortas, preguntas tipo examen con
                explicación y simulacros que estiman tu puntaje global. Sin cuentos, sin paywalls.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href={hasProgress ? "/inicio" : "/meta"}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#4ade80] px-6 text-base font-bold text-[#0f2040] hover:bg-[#22c55e]"
                >
                  <Play className="h-5 w-5" aria-hidden="true" />
                  {hasProgress ? "Continuar estudiando" : "Empezar a estudiar"}
                </Link>
                <Link
                  href="/cuenta"
                  className="inline-flex min-h-12 items-center justify-center rounded-2xl border-2 border-[#1e3a5f]/15 px-6 text-base font-semibold text-[#1e3a5f] hover:bg-white"
                >
                  Iniciar sesión
                </Link>
              </div>
              <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                <li className="inline-flex items-center gap-1.5">
                  <Shield className="h-4 w-4 text-[#1e3a5f]" aria-hidden="true" /> 100% gratis
                </li>
                <li className="inline-flex items-center gap-1.5">
                  <GraduationCap className="h-4 w-4 text-[#1e3a5f]" aria-hidden="true" /> Competencias ICFES
                </li>
                <li className="inline-flex items-center gap-1.5">
                  <Flame className="h-4 w-4 text-[#1e3a5f]" aria-hidden="true" /> Rachas diarias
                </li>
              </ul>
            </div>
            <div className="relative">
              <div className="overflow-hidden rounded-3xl border border-border bg-white shadow-[0_20px_50px_-24px_rgba(15,32,64,0.45)]">
                <img
                  src="/images/landing/hero-study.jpg"
                  alt="Estudiantes colaborando en una mesa de estudio"
                  width={800}
                  height={600}
                  className="aspect-[4/3] w-full object-cover"
                  fetchPriority="high"
                />
              </div>
              <p className="mt-2 text-center text-[11px] text-muted-foreground">Foto: Unsplash · créditos en /images/credits</p>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="border-y border-border bg-white" aria-labelledby="beneficios">
          <div className="mx-auto max-w-5xl px-4 py-12 md:py-16">
            <h2 id="beneficios" className="font-['Lexend'] text-2xl font-bold text-[#0f2040] md:text-3xl">
              Por qué estudiar con ProICFES
            </h2>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Pensado para bachilleres colombianos: directo, usable en el celular y con la misma escala 0–500 del Saber 11.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {BENEFITS.map(({ icon: Icon, title, text }) => (
                <article key={title} className="rounded-2xl border border-border bg-[#f7f8fa] p-5">
                  <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#1e3a5f] text-[#4ade80]">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h3 className="font-['Lexend'] text-lg font-bold text-[#0f2040]">{title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="mx-auto max-w-5xl px-4 py-12 md:py-16" aria-labelledby="como">
          <h2 id="como" className="font-['Lexend'] text-2xl font-bold text-[#0f2040] md:text-3xl">
            Cómo funciona
          </h2>
          <ol className="mt-8 grid gap-4 md:grid-cols-3">
            {STEPS.map(s => (
              <li key={s.n} className="rounded-2xl border border-border bg-white p-5">
                <span className="font-['Lexend'] text-3xl font-bold text-[#4ade80]">{s.n}</span>
                <h3 className="mt-2 font-['Lexend'] text-lg font-bold">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
              </li>
            ))}
          </ol>
          <div className="mt-8 overflow-hidden rounded-3xl border border-border">
            <img
              src="/images/landing/practice.jpg"
              alt="Persona estudiando con cuaderno y computador"
              width={1200}
              height={700}
              className="max-h-72 w-full object-cover"
              loading="lazy"
            />
          </div>
        </section>

        {/* Sample question */}
        <section className="border-y border-border bg-white" aria-labelledby="ejemplo">
          <div className="mx-auto max-w-5xl px-4 py-12 md:py-16">
            <h2 id="ejemplo" className="font-['Lexend'] text-2xl font-bold text-[#0f2040] md:text-3xl">
              Prueba una pregunta
            </h2>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Así se siente practicar: eliges una opción y ves la explicación al momento. Sin crear cuenta.
            </p>
            <div className="mt-6">{sample ? <SampleQuestion question={sample} /> : null}</div>
          </div>
        </section>

        {/* Trust */}
        <section className="mx-auto max-w-5xl px-4 py-12 md:py-16" aria-labelledby="confianza">
          <h2 id="confianza" className="font-['Lexend'] text-2xl font-bold text-[#0f2040]">
            Transparencia
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-white p-5 text-sm leading-relaxed text-muted-foreground">
              <p>
                ProICFES es un proyecto independiente y gratuito. <strong className="text-foreground">No está afiliado al ICFES</strong>.
                Las preguntas son originales y se diseñan para entrenar las mismas competencias del examen; no reproducen ítems oficiales.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-white p-5 text-sm leading-relaxed text-muted-foreground">
              <p>
                El puntaje que ves es un <strong className="text-foreground">estimado</strong> con la ponderación pública del Saber 11.
                Para fechas, inscripción y resultados oficiales visita{" "}
                <a className="font-semibold text-[#1e3a5f] underline" href="https://www.icfes.gov.co/" rel="noopener noreferrer" target="_blank">
                  icfes.gov.co
                </a>
                .
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-border bg-white" aria-labelledby="faq-landing">
          <div className="mx-auto max-w-5xl px-4 py-12 md:py-16">
            <div className="mb-4 flex items-end justify-between gap-3">
              <h2 id="faq-landing" className="font-['Lexend'] text-2xl font-bold text-[#0f2040]">
                Preguntas frecuentes
              </h2>
              <Link href="/preguntas-frecuentes" className="text-sm font-semibold text-[#1e3a5f] hover:underline">
                Ver todas
              </Link>
            </div>
            <FaqList
              items={FAQ.filter(f => ["que-es-saber-11", "como-se-calcula-el-puntaje", "como-usar-proicfes"].includes(f.id))}
              headingLevel="h3"
            />
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-[#1e3a5f] text-white">
          <div className="mx-auto flex max-w-5xl flex-col items-start gap-5 px-4 py-12 md:flex-row md:items-center md:justify-between md:py-16">
            <div>
              <h2 className="font-['Lexend'] text-2xl font-bold md:text-3xl">¿Listo para empezar?</h2>
              <p className="mt-2 max-w-lg text-white/80">Define tu meta en un minuto o entra directo a practicar. Tu progreso se guarda en este dispositivo.</p>
            </div>
            <Link
              href={hasProgress ? "/inicio" : "/meta"}
              className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-[#4ade80] px-6 text-base font-bold text-[#0f2040] hover:bg-[#22c55e]"
            >
              {hasProgress ? "Continuar estudiando" : "Empezar a estudiar"}
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-[#f7f8fa]">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <BrandMark compact />
            <p>
              Hecho por {SITE.author.name}. Independiente del ICFES.
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-4 gap-y-2" aria-label="Legal">
            <Link href="/politica-de-privacidad" className="hover:text-foreground hover:underline">
              Privacidad
            </Link>
            <Link href="/tratamiento-de-datos" className="hover:text-foreground hover:underline">
              Datos
            </Link>
            <Link href="/terminos" className="hover:text-foreground hover:underline">
              Términos
            </Link>
            <Link href="/cookies" className="hover:text-foreground hover:underline">
              Cookies
            </Link>
            <Link href="/preguntas-frecuentes" className="hover:text-foreground hover:underline">
              FAQ
            </Link>
          </nav>
        </div>
      </footer>

      <InstallPrompt />
    </div>
  );
}
