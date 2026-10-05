import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Link, useSearch } from "wouter";
import { CheckCircle2, Eye, EyeOff, Loader2, LogOut, Mail, RefreshCw, UserCircle } from "lucide-react";
import DataAuthorization from "@/components/DataAuthorization";
import { useAuth } from "@/contexts/AuthContext";
import { LEGAL } from "@/config/legal";
import { SITE } from "@/config/site";
import { PASSWORD_MIN_LENGTH, type AuthErrorKind, type PendingSignup } from "@/lib/accounts";
import {
  ageOn,
  buildAuthorizationRecord,
  isAuthorizationComplete,
  variantForBirthDate,
  type AuthorizationValue,
} from "@/lib/authorization";

const card = "bg-card rounded-xl border border-border p-5";
const input =
  "w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-primary";
const primaryBtn =
  "w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
const outlineBtn =
  "w-full flex items-center justify-center gap-2 border-2 border-border py-3 rounded-xl font-bold text-sm hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

type Tab = "entrar" | "registro";

export default function Cuenta() {
  const auth = useAuth();
  const search = useSearch();
  const params = useMemo(() => new URLSearchParams(search.startsWith("?") ? search.slice(1) : search), [search]);
  const initialTab: Tab = params.get("tab") === "registro" ? "registro" : "entrar";
  const [tab, setTab] = useState<Tab>(initialTab);
  const [prefillEmail, setPrefillEmail] = useState(params.get("email") ?? "");

  useEffect(() => {
    if (params.get("tab") === "registro") setTab("registro");
    const e = params.get("email");
    if (e) setPrefillEmail(e);
  }, [params]);

  const goRegistro = (email?: string) => {
    if (email) setPrefillEmail(email);
    setTab("registro");
    auth.clearError();
  };

  return (
    <div className="max-w-xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold font-['Lexend'] text-foreground">Tu cuenta</h1>
        <p className="text-muted-foreground mt-1">Guarda tu progreso en la nube y sigue desde cualquier dispositivo.</p>
      </div>
      {!auth.enabled ? (
        <Proximamente />
      ) : auth.status === "loading" ? (
        <p className="flex items-center gap-2 text-muted-foreground" role="status">
          <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> Cargando…
        </p>
      ) : auth.status === "password-recovery" ? (
        <ResetPasswordForm />
      ) : auth.status === "needs-profile" ? (
        <>
          {auth.error && <Alert>{auth.error}</Alert>}
          <CompleteProfile />
        </>
      ) : auth.status === "ready" ? (
        <SignedIn />
      ) : (
        <>
          {auth.error && <Alert>{auth.error}</Alert>}
          <div role="tablist" aria-label="Cuenta" className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1">
            {(
              [
                ["entrar", "Iniciar sesión"],
                ["registro", "Crear cuenta"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                role="tab"
                id={`tab-${id}`}
                aria-selected={tab === id}
                aria-controls={`panel-${id}`}
                onClick={() => {
                  setTab(id);
                  auth.clearError();
                }}
                className={`py-2 rounded-lg text-sm font-semibold ${tab === id ? "bg-card shadow text-foreground" : "text-muted-foreground"}`}
              >
                {label}
              </button>
            ))}
          </div>
          {tab === "entrar" ? (
            <SignIn initialEmail={prefillEmail} onNeedSignup={goRegistro} />
          ) : (
            <SignUp initialEmail={prefillEmail} />
          )}
        </>
      )}
    </div>
  );
}

function Alert({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
      {children}
    </p>
  );
}

function Ok({ children }: { children: ReactNode }) {
  return (
    <p role="status" className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-900">
      <CheckCircle2 className="inline w-4 h-4 mr-1" aria-hidden="true" />
      {children}
    </p>
  );
}

function Proximamente() {
  return (
    <section className={`${card} space-y-3`}>
      <h2 className="font-bold font-['Lexend']">Próximamente</h2>
      <p className="text-sm text-muted-foreground">Las cuentas aún no están configuradas en este entorno.</p>
    </section>
  );
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="text-xs font-medium">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? "text" : "password"}
          className={`${input} pr-10`}
          autoComplete={autoComplete}
          required
          minLength={PASSWORD_MIN_LENGTH}
          value={value}
          onChange={e => onChange(e.target.value)}
        />
        <button
          type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground"
          onClick={() => setShow(s => !s)}
          aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

function GoogleButton({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={outlineBtn}>
      <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
        <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.2-2.1 3.5-5.1 3.5-8.7z" />
        <path fill="#34A853" d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9h-4v3.1A12 12 0 0 0 12 24z" />
        <path fill="#FBBC05" d="M5.4 14.4a7.2 7.2 0 0 1 0-4.7V6.6h-4a12 12 0 0 0 0 10.9l4-3.1z" />
        <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.4 6.6l4 3.1C6.3 6.9 8.9 4.8 12 4.8z" />
      </svg>
      Continuar con Google
    </button>
  );
}

function useRegistro(initialEmail = "") {
  const [birthDate, setBirthDate] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState(initialEmail);
  const [authorization, setAuthorization] = useState<AuthorizationValue>({ accepted: false });
  const [today, setToday] = useState("");
  useEffect(() => setToday(new Date().toISOString().slice(0, 10)), []);
  useEffect(() => {
    if (initialEmail) setEmail(initialEmail);
  }, [initialEmail]);
  const date = birthDate ? new Date(`${birthDate}T12:00:00`) : null;
  const age = date && !Number.isNaN(date.getTime()) ? ageOn(date) : null;
  const validDate = age != null && age >= 0 && age <= 100;
  const variant = validDate ? variantForBirthDate(date!) : null;
  const complete = variant != null && isAuthorizationComplete(variant, authorization);
  const pending = (): PendingSignup => ({
    birthYear: date!.getFullYear(),
    variant: variant!,
    authorization: buildAuthorizationRecord(variant!, authorization),
    displayName: displayName.trim() || undefined,
    createdAt: new Date().toISOString(),
  });
  return {
    birthDate,
    setBirthDate,
    displayName,
    setDisplayName,
    email,
    setEmail,
    authorization,
    setAuthorization,
    today,
    validDate,
    variant,
    complete,
    pending,
  };
}

function RegistroFields({ r }: { r: ReturnType<typeof useRegistro> }) {
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
            max={r.today || undefined}
            value={r.birthDate}
            onChange={e => {
              r.setBirthDate(e.target.value);
              r.setAuthorization({ accepted: false });
            }}
          />
          <p className="text-[11px] text-muted-foreground">
            Solo guardamos el año. Si eres menor de 18, te pediremos confirmar el permiso de tu acudiente.
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
            value={r.displayName}
            onChange={e => r.setDisplayName(e.target.value)}
          />
        </div>
      </div>
      {r.birthDate && !r.validDate && <Alert>Revisa la fecha de nacimiento.</Alert>}
      {r.variant && <DataAuthorization variant={r.variant} value={r.authorization} onChange={r.setAuthorization} />}
    </div>
  );
}

function SignIn({ initialEmail, onNeedSignup }: { initialEmail: string; onNeedSignup: (email: string) => void }) {
  const auth = useAuth();
  const google = SITE.integrations.googleSignIn;
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [kind, setKind] = useState<AuthErrorKind | null>(null);
  const [magicSent, setMagicSent] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [resent, setResent] = useState(false);

  useEffect(() => {
    if (initialEmail) setEmail(initialEmail);
  }, [initialEmail]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setKind(null);
    setMagicSent(false);
    const res = await auth.signInWithPassword(email, password);
    setBusy(false);
    if (res.error) {
      setError(res.error);
      setKind(res.kind ?? "generic");
    }
  };

  return (
    <section id="panel-entrar" role="tabpanel" aria-labelledby="tab-entrar" className={`${card} space-y-4`}>
      {google && (
        <GoogleButton
          onClick={async () => {
            const res = await auth.signInWithGoogle();
            if (res.error) {
              setError(res.error);
              setKind(res.kind ?? "generic");
            }
          }}
        />
      )}
      <form onSubmit={onSubmit} className="space-y-3">
        <div className="space-y-1">
          <label htmlFor="login-email" className="text-xs font-medium">
            Correo electrónico
          </label>
          <input
            id="login-email"
            type="email"
            required
            autoComplete="email"
            className={input}
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>
        <PasswordField id="login-pass" label="Contraseña" value={password} onChange={setPassword} autoComplete="current-password" />
        <button type="submit" className={primaryBtn} disabled={busy}>
          {busy ? "Entrando…" : "Iniciar sesión"}
        </button>
      </form>

      {error && (
        <div className="space-y-2">
          <Alert>{error}</Alert>
          {(kind === "no-account" || kind === "invalid-credentials") && (
            <button type="button" className={outlineBtn} onClick={() => onNeedSignup(email.trim())}>
              Crear cuenta con este correo
            </button>
          )}
          {kind === "unconfirmed" && (
            <button
              type="button"
              className={outlineBtn}
              disabled={busy || resent}
              onClick={async () => {
                setBusy(true);
                const res = await auth.resendConfirmation(email);
                setBusy(false);
                if (res.error) {
                  setError(res.error);
                  setKind(res.kind ?? "generic");
                } else {
                  setResent(true);
                  setError(null);
                }
              }}
            >
              Reenviar correo de confirmación
            </button>
          )}
        </div>
      )}
      {resent && <Ok>Te reenviamos el correo de confirmación. Revisa tu bandeja y spam.</Ok>}

      <div className="flex flex-col gap-2 pt-1">
        <button type="button" className="text-sm text-primary font-semibold underline underline-offset-2" onClick={() => setShowForgot(v => !v)}>
          Olvidé mi contraseña
        </button>
        {showForgot && (
          <div className="space-y-2 rounded-lg border border-border p-3">
            <p className="text-xs text-muted-foreground">Te enviamos un enlace para elegir una contraseña nueva.</p>
            <button
              type="button"
              className={outlineBtn}
              disabled={busy || !email.trim() || resetSent}
              onClick={async () => {
                setBusy(true);
                setError(null);
                const res = await auth.requestPasswordReset(email);
                setBusy(false);
                if (res.error) {
                  setError(res.error);
                  setKind(res.kind ?? "generic");
                } else setResetSent(true);
              }}
            >
              Enviar enlace de recuperación
            </button>
            {resetSent && <Ok>Si ese correo tiene cuenta, te enviamos el enlace. Ábrelo en este navegador.</Ok>}
          </div>
        )}
        <button
          type="button"
          className="text-sm text-muted-foreground underline underline-offset-2"
          disabled={busy || magicSent || !email.trim()}
          onClick={async () => {
            setBusy(true);
            setError(null);
            const res = await auth.signInWithEmail(email, false);
            setBusy(false);
            if (res.error) {
              setError(res.error);
              setKind(res.kind ?? "generic");
            } else setMagicSent(true);
          }}
        >
          <Mail className="inline w-3.5 h-3.5 mr-1" aria-hidden="true" />
          Recibir enlace por correo (sin contraseña)
        </button>
        {magicSent && <Ok>Te enviamos un enlace a {email}. Ábrelo en este mismo navegador.</Ok>}
      </div>
    </section>
  );
}

function SignUp({ initialEmail }: { initialEmail: string }) {
  const auth = useAuth();
  const google = SITE.integrations.googleSignIn;
  const r = useRegistro(initialEmail);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmSent, setConfirmSent] = useState(false);
  const [magicSent, setMagicSent] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!r.complete) return;
    setBusy(true);
    setError(null);
    const res = await auth.signUpWithPassword(r.email, password, r.pending());
    setBusy(false);
    if (res.error) setError(res.error);
    else if (res.needsConfirm) setConfirmSent(true);
  };

  return (
    <section id="panel-registro" role="tabpanel" aria-labelledby="tab-registro" className={`${card} space-y-4`}>
      <RegistroFields r={r} />
      {!r.complete && r.variant && <p className="text-xs text-muted-foreground">Completa la autorización para continuar.</p>}

      {google && (
        <GoogleButton
          disabled={!r.complete}
          onClick={async () => {
            const res = await auth.signInWithGoogle(r.pending());
            if (res.error) setError(res.error);
          }}
        />
      )}

      <form onSubmit={onSubmit} className="space-y-3">
        <div className="space-y-1">
          <label htmlFor="reg-email" className="text-xs font-medium">
            Correo electrónico
          </label>
          <input
            id="reg-email"
            type="email"
            required
            autoComplete="email"
            className={input}
            value={r.email}
            onChange={e => r.setEmail(e.target.value)}
            disabled={!r.complete}
          />
        </div>
        <PasswordField id="reg-pass" label={`Contraseña (mín. ${PASSWORD_MIN_LENGTH} caracteres)`} value={password} onChange={setPassword} autoComplete="new-password" />
        <button type="submit" className={primaryBtn} disabled={!r.complete || busy || password.length < PASSWORD_MIN_LENGTH}>
          {busy ? "Creando…" : "Crear cuenta"}
        </button>
      </form>

      <button
        type="button"
        className="text-sm text-muted-foreground underline underline-offset-2"
        disabled={!r.complete || busy || magicSent || !r.email.trim()}
        onClick={async () => {
          setBusy(true);
          setError(null);
          const res = await auth.signInWithEmail(r.email, true, r.pending());
          setBusy(false);
          if (res.error) setError(res.error);
          else setMagicSent(true);
        }}
      >
        Recibir enlace por correo (sin contraseña)
      </button>

      {error && <Alert>{error}</Alert>}
      {confirmSent && (
        <Ok>
          Revisa tu correo ({r.email}) y confirma la cuenta. Después vuelve aquí e inicia sesión. Si no llega, mira en spam.
        </Ok>
      )}
      {magicSent && <Ok>Te enviamos un enlace a {r.email}. Ábrelo en este mismo navegador.</Ok>}

      <p className="text-[11px] text-muted-foreground">
        Al crear la cuenta aceptas los{" "}
        <Link href="/terminos" className="underline">
          Términos
        </Link>
        . Guardamos la autorización con la versión de la política ({LEGAL.version}) y la fecha.
      </p>
    </section>
  );
}

function ResetPasswordForm() {
  const auth = useAuth();
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  return (
    <section className={`${card} space-y-4`} aria-labelledby="reset-title">
      <h2 id="reset-title" className="font-bold font-['Lexend'] text-foreground">
        Elige una contraseña nueva
      </h2>
      <p className="text-sm text-muted-foreground">Sesión de recuperación para {auth.email}.</p>
      <PasswordField id="new-pass" label={`Nueva contraseña (mín. ${PASSWORD_MIN_LENGTH})`} value={password} onChange={setPassword} autoComplete="new-password" />
      <PasswordField id="new-pass2" label="Repite la contraseña" value={password2} onChange={setPassword2} autoComplete="new-password" />
      <button
        type="button"
        className={primaryBtn}
        disabled={busy || password.length < PASSWORD_MIN_LENGTH}
        onClick={async () => {
          if (password !== password2) {
            setError("Las contraseñas no coinciden.");
            return;
          }
          setBusy(true);
          setError(null);
          const res = await auth.updatePassword(password);
          setBusy(false);
          if (res.error) setError(res.error);
          else setDone(true);
        }}
      >
        Guardar contraseña
      </button>
      {error && <Alert>{error}</Alert>}
      {done && <Ok>Contraseña actualizada. Ya puedes usar tu cuenta con normalidad.</Ok>}
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
      <h2 id="cuenta-completar" className="font-bold font-['Lexend'] text-foreground text-lg">
        Completa tu registro
      </h2>
      <p className="text-sm text-muted-foreground">
        Entraste como <strong>{auth.email}</strong>. Antes de guardar tu progreso en la nube necesitamos tu fecha de
        nacimiento y la autorización de tratamiento de datos.
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
      <button type="button" onClick={() => auth.signOut()} className="text-sm text-muted-foreground underline">
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
      <section className={`${card} space-y-3`}>
        <h2 className="font-bold font-['Lexend'] text-foreground flex items-center gap-2">
          <UserCircle className="w-5 h-5 text-primary" aria-hidden="true" /> Sesión iniciada
        </h2>
        <p className="text-sm">
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
        <button type="button" onClick={() => auth.syncNow()} className={outlineBtn} disabled={sync.state === "syncing"}>
          <RefreshCw className="w-4 h-4" aria-hidden="true" /> Sincronizar ahora
        </button>
      </section>
      <section className={`${card} space-y-3`}>
        <h2 className="font-bold font-['Lexend']">Cerrar sesión</h2>
        <button type="button" onClick={() => auth.signOut()} className={outlineBtn}>
          <LogOut className="w-4 h-4" aria-hidden="true" /> Cerrar sesión
        </button>
        <button type="button" onClick={() => auth.signOut(true)} className="w-full text-sm text-muted-foreground underline py-1">
          Cerrar sesión y borrar el progreso de este navegador
        </button>
        <p className="text-xs text-muted-foreground">
          Para eliminar tu cuenta, escribe a{" "}
          <a href={`mailto:${LEGAL.responsable.correo}`} className="underline">
            {LEGAL.responsable.correo}
          </a>
          .
        </p>
      </section>
    </div>
  );
}

// silence unused import if wouter's useLocation not needed
