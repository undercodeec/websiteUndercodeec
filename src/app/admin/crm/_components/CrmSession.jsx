"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAdminHumanActivity } from "@/lib/useAdminHumanActivity";
import { remainingAdminTime, watchAdminDeadline } from "@/lib/hermes/adminDeadline.mjs";
import {
  adminApi,
  clearHermesAccess,
  clearHermesSession,
  getAdminToken,
  getHermesAccessDeadline,
  getHermesDeadline,
  getHermesRefreshToken,
  HERMES_SESSION_EXPIRED_EVENT,
  hermesApi,
  parseHermesDeadline,
  refreshHermesWebSession,
  saveHermesSession,
} from "@/lib/hermes/api";

const CrmSessionContext = createContext(null);

export function CrmSessionProvider({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const normalizedPathname = pathname?.replace(/\/+$/, "") || "/";
  const isLoginRoute = normalizedPathname === "/admin/crm/login";
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("checking");
  const [expiresAt, setExpiresAt] = useState(null);

  const logout = useCallback(
    (reason = "") => {
      const token = getAdminToken();
      if (token) adminApi.logout().catch(() => {});
      // Wait for any in-flight CAS rotation before revoking the current refresh.
      void hermesApi.logoutWeb().catch(() => {}).finally(() => {
        if (!getAdminToken() || getAdminToken() === token) clearHermesSession();
      });
      window.localStorage.removeItem("adminToken");
      setUser(null);
      setExpiresAt(null);
      setStatus("guest");
      const query = reason ? `?reason=${encodeURIComponent(reason)}` : "";
      router.replace(`/admin/crm/login${query}`);
    },
    [router],
  );

  const recordActivity = useCallback(async () => {
    const token = getAdminToken();
    try {
      const result = await adminApi.activity();
      if (getAdminToken() !== token || !remainingAdminTime(result?.expiresAt)) throw new Error("Plazo administrativo invalido");
      const web = await hermesApi.webActivity();
      if (getAdminToken() !== token) return;
      const deadline = Math.min(result?.expiresAt, parseHermesDeadline(web?.expiresAt));
      if (!remainingAdminTime(deadline)) throw new Error("Plazo de sesiones invalido");
      setExpiresAt(deadline);
    } catch {
      if (getAdminToken() && getAdminToken() !== token) return;
      if (!getAdminToken()) logout("expired");
      else { setUser(null); setStatus("unavailable"); }
    }
  }, [logout]);
  useAdminHumanActivity(status === "authenticated", recordActivity);

  const refreshProfile = useCallback(async () => {
    const adminToken = getAdminToken();
    if (!adminToken) {
      setUser(null);
      setStatus("guest");
      if (!isLoginRoute) router.replace("/admin/crm/login");
      return null;
    }

    setStatus("checking");
    setUser(null);
    try {
      const admin = await adminApi.profile();
      if (getAdminToken() !== adminToken) return null;
      if (!remainingAdminTime(admin?.expiresAt) ||
          admin?.user?.email?.trim().toLowerCase() !== "gerencia@undercodeec.com") {
        throw new Error("Sesion administrativa invalida");
      }
      setExpiresAt(admin.expiresAt);
      // A missing refresh is NOT permission to create a new Hermes session.
      // A generic 401 may mean explicit revocation: never re-exchange an OTP
      // proof or create a new browser session on that path.
      if (!getHermesRefreshToken()) throw new Error("Sesion web Hermes no disponible");
      const web = await hermesApi.webSession();
      const webDeadline = parseHermesDeadline(web?.expiresAt);
      if (web?.active !== true || !remainingAdminTime(webDeadline) ||
          !remainingAdminTime(getHermesDeadline())) throw new Error("Sesion web Hermes no vigente");
      const profile = await hermesApi.profile();
      if (getAdminToken() !== adminToken) return null;
      const deadline = Math.min(admin.expiresAt, webDeadline);
      if (!remainingAdminTime(deadline)) throw new Error("Sesion expirada");
      setExpiresAt(deadline);
      window.sessionStorage.setItem("hermesCrmUser", JSON.stringify(profile));
      setUser(profile);
      setStatus("authenticated");
      if (isLoginRoute) router.replace("/admin/crm");
      return profile;
    } catch (error) {
      if (getAdminToken() && getAdminToken() !== adminToken) return null;
      if (!getAdminToken()) logout("expired");
      else {
        if (error?.status === 401) clearHermesAccess();
        setUser(null);
        setStatus("unavailable");
      }
      return null;
    }
  }, [isLoginRoute, logout, router]);

  useEffect(() => {
    if (!expiresAt || status === "guest") return;
    return watchAdminDeadline(window, expiresAt, () => logout("expired"));
  }, [status, expiresAt, logout]);

  useEffect(() => {
    if (status !== "authenticated") return;
    const accessDeadline = getHermesAccessDeadline();
    if (!accessDeadline) return;
    const timer = window.setTimeout(() => {
      void refreshHermesWebSession().catch(() => {
        setUser(null);
        setStatus("unavailable");
      });
    }, Math.max(0, accessDeadline - Date.now() - 60_000));
    const rotated = () => { void refreshProfile(); };
    window.addEventListener("hermes:token-rotated", rotated);
    return () => { window.clearTimeout(timer); window.removeEventListener("hermes:token-rotated", rotated); };
  }, [status, refreshProfile, expiresAt]);

  useEffect(() => {
    const timer = window.setTimeout(refreshProfile, 0);
    return () => window.clearTimeout(timer);
  }, [refreshProfile]);

  useEffect(() => {
    const handleExpired = () => { void refreshProfile(); };
    const handleResume = () => {
      if (document.hidden) return;
      if (expiresAt && !remainingAdminTime(expiresAt)) logout("expired");
      else void refreshProfile(); // Hide data until the server confirms the session.
    };
    window.addEventListener(HERMES_SESSION_EXPIRED_EVENT, handleExpired);
    window.addEventListener("focus", handleResume);
    document.addEventListener("visibilitychange", handleResume);
    return () => {
      window.removeEventListener(HERMES_SESSION_EXPIRED_EVENT, handleExpired);
      window.removeEventListener("focus", handleResume);
      document.removeEventListener("visibilitychange", handleResume);
    };
  }, [logout, refreshProfile, expiresAt]);

  const loginWithCode = useCallback(
    async (credentials) => {
      const session = await hermesApi.loginWithCode(credentials);
      saveHermesSession(session.accessToken, session.user, session.adminToken, session.refreshToken, session.expiresAt);
      return refreshProfile();
    },
    [refreshProfile],
  );

  const value = useMemo(
    () => ({ user, status, loginWithCode, logout, refreshProfile }),
    [loginWithCode, logout, refreshProfile, status, user],
  );

  if ((status === "checking" || status === "unavailable" ||
       (status === "authenticated" && !remainingAdminTime(expiresAt))) && !isLoginRoute) {
    return (
      <div className="crm-session-screen" role="status" aria-live="polite">
        <div className="crm-session-mark">H</div>
        <div>
          <strong>Preparando Hermes CRM</strong>
          <span>{status === "unavailable" ? "Sin conexión verificada. El CRM está oculto." : "Validando la sesión del operador…"}</span>
          {status === "unavailable" && <button type="button" onClick={() => void refreshProfile()}>Reintentar</button>}
          {status === "unavailable" && !getHermesRefreshToken() &&
            <button type="button" onClick={() => router.replace("/admin/crm/login")}>Solicitar nuevo código</button>}
        </div>
      </div>
    );
  }

  if (status === "guest" && !isLoginRoute) return null;

  return (
    <CrmSessionContext.Provider value={value}>
      {children}
    </CrmSessionContext.Provider>
  );
}

export function useCrmSession() {
  const value = useContext(CrmSessionContext);
  if (!value) {
    throw new Error("useCrmSession debe usarse dentro de CrmSessionProvider");
  }
  return value;
}
