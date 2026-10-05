import { useEffect, useState, type FormEvent } from "react";
import { Link } from "wouter";
import {
  CheckCircle2,
  Cloud,
  Loader2,
  LogOut,
  Mail,
  RefreshCw,
  UserCircle,
} from "lucide-react";
import DataAuthorization from "@/components/DataAuthorization";
import { useAuth } from "@/contexts/AuthContext";
import { LEGAL } from "@/config/legal";
import { SITE } from "@/config/site";
import {
  ageOn,
  buildAuthorizationRecord,
  isAuthorizationComplete,
  variantForBirthDate,
  type AuthorizationValue,
} from "@/lib/authorization";
import type { PendingSignup } from "@/lib/accounts";

const card = "bg-card rounded-xl border border-border p-5";
const input =
  "w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-primary";
const primaryBtn =
  "w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
const outlineBtn =
  "w-full flex items-center justify-center gap-2 border-2 border-border py-3 rounded-xl font-bold text-sm hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

export default function Cuenta() {
  const auth = useAuth();
  return (
    <div className="max-w-xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold font-['Lexend'] text-foreground">
          Tu cuenta
        </h1>
        <p className="text-muted-foreground mt-1">
          Guarda tu progreso en la nube y sigue desde cualquier dispositivo.
        </p>
      </div>
      {!auth.enabled ? (
        <Proximamente />
      ) : auth.status === "loading" ? (
        <p
          className="flex items-center gap-2 text-muted-foreground"
          role="status"
        >
          <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />{" "}
          Cargando…
        </p>
      ) : auth.status === "signed-out" || auth.status === "error" ? (
        <>
          {auth.error && <Alert>{auth.error}</Alert>}
          <SignedOut />
        </>
      ) : auth.status === "needs-profile" ? (
        <>
          {auth.error && <Alert>{auth.error}</Alert>}
          <CompleteProfile />
        </>
      ) : (
        <SignedIn />
      )}
    </div>
  );
}

function Alert({ children }: { children: React.ReactNode }) {
  return (
    <p
      role="alert"
      className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
    >
      {children}
    </p>
  );
}

function Proximamente() {
  return (
    <section className={`${card} space-y-3`} aria-labelledby="cuenta-pronto">
      <h2
        id="cuenta-pronto"
        className="font-bold font-['Lexend'] text-foreground flex items-center gap-2"
      >
        <Cloud className="w-5 h-5 text-primary" aria-hidden="true" />{" "}
        Próximamente
      </h2>
      <p className="text-sm text-foreground">
        Pronto podrás crear una cuenta (con Google o con un enlace a tu correo)
        para guardar tu progreso en la nube y seguir desde el celular o el
        computador.
      </p>
      <p className="text-sm text-muted-foreground">
        Mientras tanto no necesitas cuenta: tu progreso se guarda solo en este
        navegador. Si borras los datos del sitio, se pierde.
      </p>
      <Link
        href="/practica"
        className="inline-block text-sm font-semibold text-primary underline underline-offset-2"
      >
        Seguir practicando
      </Link>
    </section>
  );
}

/* ----------------------------------------------------- formulario de registro */

interface RegistroState {
  birthDate: string;
  displayName: string;
  authorization: AuthorizationValue;
}

function useRegistro() {
  const [state, setState] = useState<RegistroState>({
    birthDate: "",
    displayName: "",
    authorization: { accepted: false },
  });
  const [today, setToday] = useState("");
  useEffect(() => setToday(new Date().toISOString().slice(0, 10)), []);
  const date = state.birthDate ? new Date(`${state.birthDate}T12:00:00`) : null;
  const age = date && !Number.isNaN(date.getTime()) ? ageOn(date) : null;
  const validDate = age != null && age >= 0 && age <= 100;
  const variant = validDate ? variantForBirthDate(date!) : null;
  const complete =
    variant != null && isAuthorizationComplete(variant, state.authorization);
  const pending = (): PendingSignup => ({
    birthYear: date!.getFullYear(),
    variant: variant!,
    authorization: buildAuthorizationRecord(variant!, state.authorization),
    displayName: state.displayName.trim() || undefined,
    createdAt: new Date().toISOString(),
  });
  return { state, setState, today, validDate, variant, complete, pending };
}

function RegistroFields({ r }: { r: ReturnType<typeof useRegistro> }) {
  const { state, setState, today, validDate, variant } = r;
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="cuenta-nacimiento" className="text-xs font-medium">
            Fecha de nacimiento
          </label>
          <input
            id="cuenta-nacimiento"
            type="date"
            className={input}
            required
            min="1926-01-01"
            max={today || undefined}
            value={state.birthDate}
            onChange={e =>
              setState(s => ({
                ...s,
                birthDate: e.target.value,
                authorization: { accepted: false },
              }))
            }
            aria-describedby="cuenta-nacimiento-ayuda"
          />
          <p
            id="cuenta-nacimiento-ayuda"
            className="text-[11px] text-muted-foreground"
          >
            Solo guardamos el año. Si eres menor de 18, te pediremos confirmar
            el permiso de tu acudiente.
          </p>
        </div>
        <div className="space-y-1">
          <label htmlFor="cuenta-nombre" className="text-xs font-medium">
            Nombre o apodo (opcional)
          </label>
          <input
            id="cuenta-nombre"
            className={input}
            maxLength={80}
            autoComplete="nickname"
            value={state.displayName}
            onChange={e =>
              setState(s => ({ ...s, displayName: e.target.value }))
            }
          />
        </div>
      </div>
      {state.birthDate && !validDate && (
        <Alert>Revisa la fecha de nacimiento.</Alert>
      )}
      {variant && (
        <DataAuthorization
          variant={variant}
          value={state.authorization}
          onChange={authorization => setState(s => ({ ...s, authorization }))}
        />
      )}
    </div>
  );
}

function GoogleButton({
  onClick,
  disabled,
}: {
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={outlineBtn}
    >
      <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
        <path
          fill="#4285F4"
          d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.2-2.1 3.5-5.1 3.5-8.7z"
        />
        <path
          fill="#34A853"
          d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9h-4v3.1A12 12 0 0 0 12 24z"
        />
        <path
          fill="#FBBC05"
          d="M5.4 14.4a7.2 7.2 0 0 1 0-4.7V6.6h-4a12 12 0 0 0 0 10.9l4-3.1z"
        />
        <path
          fill="#EA4335"
          d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.4 6.6l4 3.1C6.3 6.9 8.9 4.8 12 4.8z"
        />
      </svg>
      Continuar con Google
    </button>
  );
}

function EmailForm({
  cta,
  disabled,
  onSend,
}: {
  cta: string;
  disabled?: boolean;
  onSend: (email: string) => Promise<{ error?: string }>;
}) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setState("sending");
    setError(null);
    const r = await onSend(email);
    if (r.error) {
      setError(r.error);
      setState("idle");
    } else setState("sent");
  };
  if (state === "sent")
    return (
      <p
        role="status"
        className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-900"
      >
        <CheckCircle2 className="inline w-4 h-4 mr-1" aria-hidden="true" />
        Te enviamos un enlace a <strong>{email}</strong>. Ábrelo{" "}
        <strong>en este mismo navegador</strong> para entrar. Si no llega en
        unos minutos, revisa la carpeta de spam.
      </p>
    );
  return (
    <form onSubmit={submit} className="space-y-2">
      <label htmlFor={`email-${cta}`} className="text-xs font-medium">
        Correo electrónico
      </label>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          id={`email-${cta}`}
          type="email"
          required
          autoComplete="email"
          className={input}
          value={email}
          onChange={e => setEmail(e.target.value)}
          disabled={disabled}
        />
        <button
          type="submit"
          disabled={disabled || state === "sending"}
          className="shrink-0 flex items-center justify-center gap-1 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50"
        >
          <Mail className="w-4 h-4" aria-hidden="true" />{" "}
          {state === "sending" ? "Enviando…" : cta}
        </button>
      </div>
      {error && <Alert>{error}</Alert>}
    </form>
  );
}

function SignedOut() {
  const [tab, setTab] = useState<"registro" | "entrar">("registro");
  return (
    <div className="space-y-4">
      <div
        role="tablist"
        aria-label="Cuenta"
        className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1"
      >
        {(
          [
            ["registro", "Crear cuenta"],
            ["entrar", "Ya tengo cuenta"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            id={`tab-${id}`}
            aria-selected={tab === id}
            aria-controls={`panel-${id}`}
            onClick={() => setTab(id)}
            className={`py-2 rounded-lg text-sm font-semibold ${tab === id ? "bg-card shadow text-foreground" : "text-muted-foreground"}`}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === "registro" ? <SignUp /> : <SignIn />}
    </div>
  );
}

function SignUp() {
  const auth = useAuth();
  const r = useRegistro();
  const [error, setError] = useState<string | null>(null);
  const google = SITE.integrations.googleSignIn;
  return (
    <section
      id="panel-registro"
      role="tabpanel"
      aria-labelledby="tab-registro"
      className={`${card} space-y-4`}
    >
      <RegistroFields r={r} />
      {!r.complete && r.variant && (
        <p className="text-xs text-muted-foreground">
          Completa la autorización para continuar.
        </p>
      )}
      <div className="space-y-3">
        {google ? (
          <>
            <GoogleButton
              disabled={!r.complete}
              onClick={async () => {
                const res = await auth.signInWithGoogle(r.pending());
                if (res.error) setError(res.error);
              }}
            />
            <div
              className="flex items-center gap-2 text-xs text-muted-foreground"
              aria-hidden="true"
            >
              <span className="h-px flex-1 bg-border" /> o con un enlace a tu
              correo <span className="h-px flex-1 bg-border" />
            </div>
          </>
        ) : (
          <p className="text-xs text-muted-foreground">
            Te enviamos un enlace a tu correo (sin contraseña). Continuar con
            Google llegará pronto.
          </p>
        )}
        <EmailForm
          cta="Crear cuenta"
          disabled={!r.complete}
          onSend={email => auth.signInWithEmail(email, true, r.pending())}
        />
        {error && <Alert>{error}</Alert>}
      </div>
      <p className="text-[11px] text-muted-foreground">
        Al crear la cuenta aceptas los{" "}
        <Link href="/terminos" className="underline">
          Términos
        </Link>
        . Guardamos la autorización con la versión de la política (
        {LEGAL.version}) y la fecha.
      </p>
    </section>
  );
}

function SignIn() {
  const auth = useAuth();
  const [error, setError] = useState<string | null>(null);
  const google = SITE.integrations.googleSignIn;
  return (
    <section
      id="panel-entrar"
      role="tabpanel"
      aria-labelledby="tab-entrar"
      className={`${card} space-y-3`}
    >
      {google ? (
        <GoogleButton
          onClick={async () => {
            const res = await auth.signInWithGoogle();
            if (res.error) setError(res.error);
          }}
        />
      ) : (
        <p className="text-xs text-muted-foreground">
          Te enviamos un enlace a tu correo (sin contraseña). Continuar con
          Google llegará pronto.
        </p>
      )}
      <EmailForm
        cta="Entrar"
        onSend={email => auth.signInWithEmail(email, false)}
      />
      {error && <Alert>{error}</Alert>}
    </section>
  );
}

function CompleteProfile() {
  const auth = useAuth();
  const r = useRegistro();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  return (
    <section className={`${card} space-y-4`} aria-labelledby="cuenta-completar">
      <h2
        id="cuenta-completar"
        className="font-bold font-['Lexend'] text-foreground"
      >
        Completa tu registro
      </h2>
      <p className="text-sm text-muted-foreground">
        Entraste como <strong>{auth.email}</strong>. Antes de guardar tu
        progreso necesitamos tu fecha de nacimiento y la autorización de
        tratamiento de datos.
      </p>
      <RegistroFields r={r} />
      <button
        type="button"
        className={primaryBtn}
        disabled={!r.complete || saving}
        onClick={async () => {
          setSaving(true);
          const res = await auth.completeProfile(r.pending());
          setSaving(false);
          if (res.error) setError(res.error);
        }}
      >
        Guardar y continuar
      </button>
      {error && <Alert>{error}</Alert>}
      <button
        type="button"
        onClick={() => auth.signOut()}
        className="text-sm text-muted-foreground underline"
      >
        Cancelar y cerrar sesión
      </button>
    </section>
  );
}

function SignedIn() {
  const auth = useAuth();
  const { sync } = auth;
  return (
    <div className="space-y-4">
      <section className={`${card} space-y-3`} aria-labelledby="cuenta-sesion">
        <h2
          id="cuenta-sesion"
          className="font-bold font-['Lexend'] text-foreground flex items-center gap-2"
        >
          <UserCircle className="w-5 h-5 text-primary" aria-hidden="true" />{" "}
          Sesión iniciada
        </h2>
        <p className="text-sm text-foreground">
          Correo: <strong>{auth.email}</strong>
        </p>
        <p className="text-sm text-muted-foreground" role="status">
          {sync.state === "syncing"
            ? "Sincronizando tu progreso…"
            : sync.state === "error"
              ? `No se pudo sincronizar: ${sync.message}`
              : sync.state === "ok"
                ? `Progreso sincronizado a las ${new Date(sync.at!).toLocaleTimeString("es-CO", { hour: "numeric", minute: "2-digit" })}.`
                : "Tu progreso se sincroniza automáticamente."}
        </p>
        <button
          type="button"
          onClick={() => auth.syncNow()}
          className={outlineBtn}
          disabled={sync.state === "syncing"}
        >
          <RefreshCw className="w-4 h-4" aria-hidden="true" /> Sincronizar ahora
        </button>
      </section>
      <section className={`${card} space-y-3`} aria-labelledby="cuenta-salir">
        <h2
          id="cuenta-salir"
          className="font-bold font-['Lexend'] text-foreground"
        >
          Cerrar sesión
        </h2>
        <button
          type="button"
          onClick={() => auth.signOut()}
          className={outlineBtn}
        >
          <LogOut className="w-4 h-4" aria-hidden="true" /> Cerrar sesión
        </button>
        <button
          type="button"
          onClick={() => auth.signOut(true)}
          className="w-full text-sm text-muted-foreground underline py-1"
        >
          Cerrar sesión y borrar el progreso de este navegador (computador
          compartido)
        </button>
        <p className="text-xs text-muted-foreground">
          Para consultar, corregir o eliminar tus datos y tu cuenta, escribe a{" "}
          <a href={`mailto:${LEGAL.responsable.correo}`} className="underline">
            {LEGAL.responsable.correo}
          </a>{" "}
          (ver{" "}
          <Link href="/tratamiento-de-datos" className="underline">
            tratamiento de datos
          </Link>
          ).
        </p>
      </section>
    </div>
  );
}
