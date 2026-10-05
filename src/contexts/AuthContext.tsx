/**
 * Sesión y sincronización del progreso con la cuenta (Supabase).
 * Con las cuentas apagadas (config vacía) el proveedor no hace nada.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { useProgress, normalizeProgress, type UserProgress } from "./ProgressContext";
import {
  ACCOUNTS_ENABLED,
  authErrorMessage,
  callbackUrl,
  classifyAuthError,
  clearPendingSignup,
  getSupabase,
  profileRowFrom,
  readPendingSignup,
  resetCallbackUrl,
  savePendingSignup,
  validatePassword,
  type AuthErrorKind,
  type PendingSignup,
} from "@/lib/accounts";
import { readConsent } from "@/lib/consent";
import { SYNC_STORAGE_KEY, decideSync, parseSyncMeta, type SyncMeta } from "@/lib/progressMerge";
import { SIMULACRO_STORAGE_KEY } from "@/lib/simulacro";

export type AuthStatus =
  | "disabled"
  | "loading"
  | "signed-out"
  | "needs-profile"
  | "password-recovery"
  | "ready"
  | "error";

export interface SyncState {
  state: "idle" | "syncing" | "ok" | "error";
  at?: string;
  message?: string;
}

export type AuthActionResult = { error?: string; kind?: AuthErrorKind; needsConfirm?: boolean };

interface AuthContextType {
  enabled: boolean;
  status: AuthStatus;
  email: string | null;
  error: string | null;
  sync: SyncState;
  clearError: () => void;
  signInWithGoogle: (pending?: PendingSignup) => Promise<AuthActionResult>;
  /** Enlace mágico. `create` = permitir crear la cuenta. */
  signInWithEmail: (email: string, create: boolean, pending?: PendingSignup) => Promise<AuthActionResult>;
  signUpWithPassword: (email: string, password: string, pending: PendingSignup) => Promise<AuthActionResult>;
  signInWithPassword: (email: string, password: string) => Promise<AuthActionResult>;
  requestPasswordReset: (email: string) => Promise<AuthActionResult>;
  updatePassword: (password: string) => Promise<AuthActionResult>;
  resendConfirmation: (email: string) => Promise<AuthActionResult>;
  completeProfile: (pending: PendingSignup) => Promise<AuthActionResult>;
  syncNow: () => Promise<void>;
  signOut: (forgetDevice?: boolean) => Promise<void>;
}

const fail = async (): Promise<AuthActionResult> => ({ error: "Las cuentas aún no están disponibles.", kind: "generic" });
const DISABLED: AuthContextType = {
  enabled: false,
  status: "disabled",
  email: null,
  error: null,
  sync: { state: "idle" },
  clearError: () => {},
  signInWithGoogle: fail,
  signInWithEmail: fail,
  signUpWithPassword: fail,
  signInWithPassword: fail,
  requestPasswordReset: fail,
  updatePassword: fail,
  resendConfirmation: fail,
  completeProfile: fail,
  syncNow: async () => {},
  signOut: async () => {},
};

const AuthContext = createContext<AuthContextType>(DISABLED);

export function AuthProvider({ children }: { children: ReactNode }) {
  if (!ACCOUNTS_ENABLED) return <AuthContext.Provider value={DISABLED}>{children}</AuthContext.Provider>;
  return <EnabledAuthProvider>{children}</EnabledAuthProvider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

function readMeta(): SyncMeta | null {
  try {
    return parseSyncMeta(localStorage.getItem(SYNC_STORAGE_KEY));
  } catch {
    return null;
  }
}
function writeMeta(m: SyncMeta | null) {
  try {
    if (m) localStorage.setItem(SYNC_STORAGE_KEY, JSON.stringify(m));
    else localStorage.removeItem(SYNC_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

const PUSH_DELAY_MS = 4000;

function mapErr(e: { message: string } | null | undefined): AuthActionResult {
  if (!e) return {};
  const info = classifyAuthError(e.message);
  return { error: info.message, kind: info.kind };
}

function EnabledAuthProvider({ children }: { children: ReactNode }) {
  const { progress, loaded, replaceProgress, resetProgress } = useProgress();
  const [nudge, setNudge] = useState(0);
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const [sync, setSync] = useState<SyncState>({ state: "idle" });
  const [recovery, setRecovery] = useState(false);
  const sbRef = useRef<SupabaseClient | null>(null);
  const progressRef = useRef(progress);
  progressRef.current = progress;
  const syncedJson = useRef<string | null>(null);
  const syncing = useRef<Promise<void> | null>(null);
  const userId = session?.user.id ?? null;

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;
    getSupabase()!
      .then(async sb => {
        sbRef.current = sb;
        const params = new URLSearchParams(window.location.search);
        const urlError = params.get("error_description");
        const wantsReset = params.get("reset") === "1";
        const { data } = await sb.auth.getSession();
        if (cancelled) return;
        if (params.has("code") || urlError || wantsReset) {
          const keep = wantsReset && !urlError ? "?reset=1" : "";
          window.history.replaceState(null, "", window.location.pathname + keep + window.location.hash);
        }
        if (urlError) setError(authErrorMessage(urlError));
        setSession(data.session);
        if (wantsReset && data.session) setRecovery(true);
        if (!data.session) setStatus("signed-out");
        const { data: sub } = sb.auth.onAuthStateChange((event, s) => {
          setSession(s);
          if (event === "PASSWORD_RECOVERY") setRecovery(true);
          if (!s) {
            setRecovery(false);
            setStatus("signed-out");
          }
        });
        unsubscribe = () => sub.subscription.unsubscribe();
      })
      .catch(() => {
        if (!cancelled) {
          setStatus("error");
          setError("No pudimos conectar con el servicio de cuentas. Tu progreso sigue guardado en este navegador.");
        }
      });
    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  useEffect(() => {
    const sb = sbRef.current;
    if (!sb || !userId) return;
    if (recovery) {
      setStatus("password-recovery");
      return;
    }
    let cancelled = false;
    setStatus("loading");
    (async () => {
      const { data, error: e } = await sb.from("profiles").select("id").eq("id", userId).maybeSingle();
      if (cancelled) return;
      if (e) {
        setStatus("error");
        setError(authErrorMessage(e.message));
        return;
      }
      if (data) {
        clearPendingSignup();
        setStatus("ready");
        return;
      }
      const pending = readPendingSignup();
      if (!pending) {
        setStatus("needs-profile");
        return;
      }
      const { error: insertError } = await sb.from("profiles").insert(profileRowFrom(userId, pending, readConsent()));
      if (cancelled) return;
      if (insertError) {
        setStatus("needs-profile");
        setError(authErrorMessage(insertError.message));
      } else {
        clearPendingSignup();
        setStatus("ready");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, recovery]);

  const applyLocal = useCallback(
    (doc: UserProgress) => {
      const normalized = normalizeProgress(doc);
      syncedJson.current = JSON.stringify(normalized);
      replaceProgress(normalized);
    },
    [replaceProgress]
  );

  const uploadAttempts = useCallback(async (sb: SupabaseClient, uid: string, doc: UserProgress, meta: SyncMeta) => {
    const since = meta.attemptsUploadedUntil ? Date.parse(meta.attemptsUploadedUntil) : -Infinity;
    const fresh = doc.simulacroHistory.filter(r => Date.parse(r.finishedAt) > since);
    if (fresh.length === 0) return meta;
    const rows = fresh.map(r => ({
      user_id: uid,
      client_id: r.id,
      format: r.format,
      finished_at: r.finishedAt,
      global_score: r.global,
      percent: r.percent,
      correct: r.correct,
      total: r.total,
      per_area: r.perArea,
    }));
    const { error: e } = await sb.from("attempts").upsert(rows, { onConflict: "user_id,client_id", ignoreDuplicates: true });
    if (e) return meta;
    return { ...meta, attemptsUploadedUntil: fresh[fresh.length - 1].finishedAt };
  }, []);

  const runSync = useCallback(async () => {
    const sb = sbRef.current;
    if (!sb || !userId) return;
    if (syncing.current) return syncing.current;
    const job = (async () => {
      setSync(s => ({ ...s, state: "syncing" }));
      try {
        const { data: row, error: e } = await sb.from("progress").select("data, updated_at").eq("user_id", userId).maybeSingle();
        if (e) throw e;
        const local = progressRef.current;
        const decision = decideSync({
          userId,
          local,
          meta: readMeta(),
          remote: row ? { data: row.data as UserProgress, updatedAt: row.updated_at as string } : null,
        });
        const now = new Date().toISOString();
        let meta: SyncMeta = {
          ...(readMeta() ?? {}),
          userId,
          remoteUpdatedAt: row?.updated_at ?? null,
          syncedAt: now,
          localUpdatedAt: now,
        };
        if (decision.action === "push" || decision.action === "merge") {
          const doc = normalizeProgress(decision.doc);
          const { data: up, error: pe } = await sb
            .from("progress")
            .upsert({ user_id: userId, data: doc }, { onConflict: "user_id" })
            .select("updated_at")
            .single();
          if (pe) throw pe;
          meta = { ...meta, remoteUpdatedAt: up.updated_at as string };
          if (decision.action === "merge") applyLocal(doc);
          else syncedJson.current = JSON.stringify(doc);
        } else if (decision.action === "pull") {
          if (readMeta()?.userId !== userId) meta = { ...meta, attemptsUploadedUntil: undefined };
          applyLocal(decision.doc);
        } else {
          syncedJson.current = JSON.stringify(normalizeProgress(local));
        }
        meta = await uploadAttempts(sb, userId, decision.action === "none" ? local : "doc" in decision ? decision.doc : local, meta);
        writeMeta(meta);
        setSync({ state: "ok", at: new Date().toISOString() });
        if (JSON.stringify(normalizeProgress(progressRef.current)) !== syncedJson.current) setNudge(n => n + 1);
      } catch (err) {
        setSync({ state: "error", at: new Date().toISOString(), message: authErrorMessage((err as Error)?.message) });
      }
    })();
    syncing.current = job;
    try {
      await job;
    } finally {
      syncing.current = null;
    }
  }, [userId, applyLocal, uploadAttempts]);

  useEffect(() => {
    if (status !== "ready" || !loaded) return;
    void runSync();
    const onVisible = () => document.visibilityState === "visible" && void runSync();
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [status, loaded, runSync]);

  useEffect(() => {
    if (status !== "ready" || !loaded || syncedJson.current == null || !userId) return;
    const json = JSON.stringify(normalizeProgress(progress));
    if (json === syncedJson.current) return;
    const meta = readMeta();
    if (meta?.userId === userId) writeMeta({ ...meta, localUpdatedAt: new Date().toISOString() });
    const t = window.setTimeout(() => void runSync(), PUSH_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [progress, nudge, status, loaded, userId, runSync]);

  const signInWithGoogle = useCallback<AuthContextType["signInWithGoogle"]>(async pending => {
    const sb = await getSupabase()!;
    if (pending) savePendingSignup(pending);
    const { error: e } = await sb.auth.signInWithOAuth({ provider: "google", options: { redirectTo: callbackUrl() } });
    return mapErr(e);
  }, []);

  const signInWithEmail = useCallback<AuthContextType["signInWithEmail"]>(async (email, create, pending) => {
    const sb = await getSupabase()!;
    if (pending) savePendingSignup(pending);
    const { error: e } = await sb.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: callbackUrl(), shouldCreateUser: create },
    });
    return mapErr(e);
  }, []);

  const signUpWithPassword = useCallback<AuthContextType["signUpWithPassword"]>(async (email, password, pending) => {
    const weak = validatePassword(password);
    if (weak) return { error: weak, kind: "weak-password" };
    const sb = await getSupabase()!;
    savePendingSignup(pending);
    const { data, error: e } = await sb.auth.signUp({
      email: email.trim(),
      password,
      options: { emailRedirectTo: callbackUrl() },
    });
    if (e) return mapErr(e);
    // Sin sesión = hay que confirmar el correo.
    if (!data.session) return { needsConfirm: true };
    return {};
  }, []);

  const signInWithPassword = useCallback<AuthContextType["signInWithPassword"]>(async (email, password) => {
    const sb = await getSupabase()!;
    const { error: e } = await sb.auth.signInWithPassword({ email: email.trim(), password });
    return mapErr(e);
  }, []);

  const requestPasswordReset = useCallback<AuthContextType["requestPasswordReset"]>(async email => {
    const sb = await getSupabase()!;
    const { error: e } = await sb.auth.resetPasswordForEmail(email.trim(), { redirectTo: resetCallbackUrl() });
    return mapErr(e);
  }, []);

  const updatePassword = useCallback<AuthContextType["updatePassword"]>(async password => {
    const weak = validatePassword(password);
    if (weak) return { error: weak, kind: "weak-password" };
    const sb = sbRef.current ?? (await getSupabase()!);
    const { error: e } = await sb.auth.updateUser({ password });
    if (e) return mapErr(e);
    setRecovery(false);
    // Quita ?reset=1 de la URL.
    window.history.replaceState(null, "", window.location.pathname);
    return {};
  }, []);

  const resendConfirmation = useCallback<AuthContextType["resendConfirmation"]>(async email => {
    const sb = await getSupabase()!;
    const { error: e } = await sb.auth.resend({ type: "signup", email: email.trim(), options: { emailRedirectTo: callbackUrl() } });
    return mapErr(e);
  }, []);

  const completeProfile = useCallback<AuthContextType["completeProfile"]>(
    async pending => {
      const sb = sbRef.current;
      if (!sb || !userId) return { error: "Inicia sesión de nuevo.", kind: "generic" };
      const { error: e } = await sb.from("profiles").insert(profileRowFrom(userId, pending, readConsent()));
      if (e) return mapErr(e);
      setError(null);
      setStatus("ready");
      return {};
    },
    [userId]
  );

  const signOut = useCallback<AuthContextType["signOut"]>(
    async forgetDevice => {
      const sb = sbRef.current;
      if (syncing.current) await syncing.current;
      await sb?.auth.signOut();
      syncedJson.current = null;
      setRecovery(false);
      setSync({ state: "idle" });
      if (forgetDevice) {
        writeMeta(null);
        try {
          localStorage.removeItem(SIMULACRO_STORAGE_KEY);
        } catch {
          /* ignore */
        }
        resetProgress();
      }
    },
    [resetProgress]
  );

  const value = useMemo<AuthContextType>(
    () => ({
      enabled: true,
      status,
      email: session?.user.email ?? null,
      error,
      sync,
      clearError: () => setError(null),
      signInWithGoogle,
      signInWithEmail,
      signUpWithPassword,
      signInWithPassword,
      requestPasswordReset,
      updatePassword,
      resendConfirmation,
      completeProfile,
      syncNow: runSync,
      signOut,
    }),
    [
      status,
      session,
      error,
      sync,
      signInWithGoogle,
      signInWithEmail,
      signUpWithPassword,
      signInWithPassword,
      requestPasswordReset,
      updatePassword,
      resendConfirmation,
      completeProfile,
      runSync,
      signOut,
    ]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
