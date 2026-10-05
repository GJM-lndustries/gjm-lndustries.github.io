/**
 * Sesión y sincronización del progreso con la cuenta (Supabase).
 * Con las cuentas apagadas (config vacía) el proveedor no hace nada: ni descarga, ni peticiones.
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
import {
  useProgress,
  normalizeProgress,
  type UserProgress,
} from "./ProgressContext";
import {
  ACCOUNTS_ENABLED,
  authErrorMessage,
  callbackUrl,
  clearPendingSignup,
  getSupabase,
  profileRowFrom,
  readPendingSignup,
  savePendingSignup,
  type PendingSignup,
} from "@/lib/accounts";
import { readConsent } from "@/lib/consent";
import {
  SYNC_STORAGE_KEY,
  decideSync,
  parseSyncMeta,
  type SyncMeta,
} from "@/lib/progressMerge";
import { SIMULACRO_STORAGE_KEY } from "@/lib/simulacro";

export type AuthStatus =
  "disabled" | "loading" | "signed-out" | "needs-profile" | "ready" | "error";

export interface SyncState {
  state: "idle" | "syncing" | "ok" | "error";
  at?: string;
  message?: string;
}

interface AuthContextType {
  enabled: boolean;
  status: AuthStatus;
  email: string | null;
  error: string | null;
  sync: SyncState;
  /** Guarda el registro pendiente (si lo hay) y abre Google. */
  signInWithGoogle: (pending?: PendingSignup) => Promise<{ error?: string }>;
  /** Envía el enlace mágico. `create` = permitir crear la cuenta (solo desde «Crear cuenta»). */
  signInWithEmail: (
    email: string,
    create: boolean,
    pending?: PendingSignup
  ) => Promise<{ error?: string }>;
  /** Crea el perfil cuando la persona entró sin pasar por el registro (p. ej. con Google). */
  completeProfile: (pending: PendingSignup) => Promise<{ error?: string }>;
  syncNow: () => Promise<void>;
  signOut: (forgetDevice?: boolean) => Promise<void>;
}

const noop = async () => ({ error: "Las cuentas aún no están disponibles." });
const DISABLED: AuthContextType = {
  enabled: false,
  status: "disabled",
  email: null,
  error: null,
  sync: { state: "idle" },
  signInWithGoogle: noop,
  signInWithEmail: noop,
  completeProfile: noop,
  syncNow: async () => {},
  signOut: async () => {},
};

const AuthContext = createContext<AuthContextType>(DISABLED);

export function AuthProvider({ children }: { children: ReactNode }) {
  if (!ACCOUNTS_ENABLED)
    return (
      <AuthContext.Provider value={DISABLED}>{children}</AuthContext.Provider>
    );
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
    /* sin almacenamiento: se reintenta en la próxima visita */
  }
}

const PUSH_DELAY_MS = 4000;

function EnabledAuthProvider({ children }: { children: ReactNode }) {
  const { progress, loaded, replaceProgress, resetProgress } = useProgress();
  /** Se incrementa cuando hubo cambios locales durante una sincronización (para volver a subir). */
  const [nudge, setNudge] = useState(0);
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const [sync, setSync] = useState<SyncState>({ state: "idle" });
  const sbRef = useRef<SupabaseClient | null>(null);
  const progressRef = useRef(progress);
  progressRef.current = progress;
  /** JSON del último progreso que quedó igual en local y en la cuenta. */
  const syncedJson = useRef<string | null>(null);
  const syncing = useRef<Promise<void> | null>(null);
  const userId = session?.user.id ?? null;

  // 1. Sesión
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;
    getSupabase()!
      .then(async sb => {
        sbRef.current = sb;
        const params = new URLSearchParams(window.location.search);
        const urlError = params.get("error_description");
        const { data } = await sb.auth.getSession();
        if (cancelled) return;
        if (params.has("code") || urlError) {
          // Limpia ?code=… / ?error=… de la barra de direcciones.
          window.history.replaceState(
            null,
            "",
            window.location.pathname + window.location.hash
          );
        }
        if (urlError) setError(authErrorMessage(urlError));
        setSession(data.session);
        if (!data.session) setStatus("signed-out");
        const { data: sub } = sb.auth.onAuthStateChange((_event, s) => {
          setSession(s);
          if (!s) setStatus("signed-out");
        });
        unsubscribe = () => sub.subscription.unsubscribe();
      })
      .catch(() => {
        if (!cancelled) {
          setStatus("error");
          setError(
            "No pudimos conectar con el servicio de cuentas. Tu progreso sigue guardado en este navegador."
          );
        }
      });
    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  // 2. Perfil: si no existe, se crea con el registro pendiente o se pide completar el registro.
  useEffect(() => {
    const sb = sbRef.current;
    if (!sb || !userId) return;
    let cancelled = false;
    setStatus("loading");
    (async () => {
      const { data, error: e } = await sb
        .from("profiles")
        .select("id")
        .eq("id", userId)
        .maybeSingle();
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
      const { error: insertError } = await sb
        .from("profiles")
        .insert(profileRowFrom(userId, pending, readConsent()));
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
  }, [userId]);

  const applyLocal = useCallback(
    (doc: UserProgress) => {
      const normalized = normalizeProgress(doc);
      syncedJson.current = JSON.stringify(normalized);
      replaceProgress(normalized);
    },
    [replaceProgress]
  );

  const uploadAttempts = useCallback(
    async (
      sb: SupabaseClient,
      uid: string,
      doc: UserProgress,
      meta: SyncMeta
    ) => {
      const since = meta.attemptsUploadedUntil
        ? Date.parse(meta.attemptsUploadedUntil)
        : -Infinity;
      const fresh = doc.simulacroHistory.filter(
        r => Date.parse(r.finishedAt) > since
      );
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
      const { error: e } = await sb
        .from("attempts")
        .upsert(rows, {
          onConflict: "user_id,client_id",
          ignoreDuplicates: true,
        });
      if (e) return meta;
      return {
        ...meta,
        attemptsUploadedUntil: fresh[fresh.length - 1].finishedAt,
      };
    },
    []
  );

  // 3. Sincronización
  const runSync = useCallback(async () => {
    const sb = sbRef.current;
    if (!sb || !userId) return;
    if (syncing.current) return syncing.current;
    const job = (async () => {
      setSync(s => ({ ...s, state: "syncing" }));
      try {
        const { data: row, error: e } = await sb
          .from("progress")
          .select("data, updated_at")
          .eq("user_id", userId)
          .maybeSingle();
        if (e) throw e;
        const local = progressRef.current;
        const decision = decideSync({
          userId,
          local,
          meta: readMeta(),
          remote: row
            ? {
                data: row.data as UserProgress,
                updatedAt: row.updated_at as string,
              }
            : null,
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
          if (readMeta()?.userId !== userId)
            meta = { ...meta, attemptsUploadedUntil: undefined };
          applyLocal(decision.doc);
        } else {
          syncedJson.current = JSON.stringify(normalizeProgress(local));
        }
        meta = await uploadAttempts(
          sb,
          userId,
          decision.action === "none"
            ? local
            : "doc" in decision
              ? decision.doc
              : local,
          meta
        );
        writeMeta(meta);
        setSync({ state: "ok", at: new Date().toISOString() });
        // Si hubo cambios mientras se sincronizaba, se programan para la próxima subida.
        if (
          JSON.stringify(normalizeProgress(progressRef.current)) !==
          syncedJson.current
        )
          setNudge(n => n + 1);
      } catch (err) {
        setSync({
          state: "error",
          at: new Date().toISOString(),
          message: authErrorMessage((err as Error)?.message),
        });
      }
    })();
    syncing.current = job;
    try {
      await job;
    } finally {
      syncing.current = null;
    }
  }, [userId, applyLocal, uploadAttempts]);

  // Sincroniza al entrar (cuando ya se leyó el progreso local) y al volver a la pestaña.
  useEffect(() => {
    if (status !== "ready" || !loaded) return;
    void runSync();
    const onVisible = () =>
      document.visibilityState === "visible" && void runSync();
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [status, loaded, runSync]);

  // Cambios locales: se marcan y se suben unos segundos después.
  useEffect(() => {
    if (status !== "ready" || !loaded || syncedJson.current == null || !userId)
      return;
    const json = JSON.stringify(normalizeProgress(progress));
    if (json === syncedJson.current) return;
    const meta = readMeta();
    if (meta?.userId === userId)
      writeMeta({ ...meta, localUpdatedAt: new Date().toISOString() });
    const t = window.setTimeout(() => void runSync(), PUSH_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [progress, nudge, status, loaded, userId, runSync]);

  const signInWithGoogle = useCallback<AuthContextType["signInWithGoogle"]>(
    async pending => {
      const sb = await getSupabase()!;
      if (pending) savePendingSignup(pending);
      const { error: e } = await sb.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: callbackUrl() },
      });
      return e ? { error: authErrorMessage(e.message) } : {};
    },
    []
  );

  const signInWithEmail = useCallback<AuthContextType["signInWithEmail"]>(
    async (email, create, pending) => {
      const sb = await getSupabase()!;
      if (pending) savePendingSignup(pending);
      const { error: e } = await sb.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: callbackUrl(), shouldCreateUser: create },
      });
      return e ? { error: authErrorMessage(e.message) } : {};
    },
    []
  );

  const completeProfile = useCallback<AuthContextType["completeProfile"]>(
    async pending => {
      const sb = sbRef.current;
      if (!sb || !userId) return { error: "Inicia sesión de nuevo." };
      const { error: e } = await sb
        .from("profiles")
        .insert(profileRowFrom(userId, pending, readConsent()));
      if (e) return { error: authErrorMessage(e.message) };
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
      setSync({ state: "idle" });
      if (forgetDevice) {
        writeMeta(null);
        try {
          localStorage.removeItem(SIMULACRO_STORAGE_KEY);
        } catch {
          /* nada que borrar */
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
      signInWithGoogle,
      signInWithEmail,
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
      completeProfile,
      runSync,
      signOut,
    ]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
