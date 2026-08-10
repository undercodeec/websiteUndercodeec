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
import {
  adminApi,
  clearHermesSession,
  getAdminToken,
  getHermesToken,
  getStoredHermesUser,
  HERMES_SESSION_EXPIRED_EVENT,
  hermesApi,
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

  const logout = useCallback(
    (reason = "") => {
      if (getAdminToken()) adminApi.logout().catch(() => {});
      clearHermesSession();
      setUser(null);
      setStatus("guest");
      const query = reason ? `?reason=${encodeURIComponent(reason)}` : "";
      router.replace(`/admin/crm/login${query}`);
    },
    [router],
  );

  const refreshProfile = useCallback(async () => {
    const hermesToken = getHermesToken();
    const adminToken = getAdminToken();
    if (!hermesToken || !adminToken) {
      setUser(null);
      setStatus("guest");
      if (!isLoginRoute) router.replace("/admin/crm/login");
      return null;
    }

    setStatus("checking");
    try {
      const [profile] = await Promise.all([
        hermesApi.profile(),
        adminApi.profile(),
      ]);
      window.sessionStorage.setItem("hermesCrmUser", JSON.stringify(profile));
      setUser(profile);
      setStatus("authenticated");
      if (isLoginRoute) router.replace("/admin/crm");
      return profile;
    } catch (error) {
      if (error?.status !== 401) {
        const storedUser = getStoredHermesUser();
        if (storedUser) {
          setUser(storedUser);
          setStatus("authenticated");
          if (isLoginRoute) router.replace("/admin/crm");
          return storedUser;
        }
      }
      logout("expired");
      return null;
    }
  }, [isLoginRoute, logout, router]);

  useEffect(() => {
    const timer = window.setTimeout(refreshProfile, 0);
    const handleExpired = () => logout("expired");
    window.addEventListener(HERMES_SESSION_EXPIRED_EVENT, handleExpired);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(HERMES_SESSION_EXPIRED_EVENT, handleExpired);
    };
  }, [logout, refreshProfile]);

  const loginWithCode = useCallback(
    async (credentials) => {
      const session = await hermesApi.loginWithCode(credentials);
      saveHermesSession(session.accessToken, session.user, session.adminToken);
      setUser(session.user);
      setStatus("authenticated");
      router.replace("/admin/crm");
      return session.user;
    },
    [router],
  );

  const value = useMemo(
    () => ({ user, status, loginWithCode, logout, refreshProfile }),
    [loginWithCode, logout, refreshProfile, status, user],
  );

  if (status === "checking" && !isLoginRoute) {
    return (
      <div className="crm-session-screen" role="status" aria-live="polite">
        <div className="crm-session-mark">H</div>
        <div>
          <strong>Preparando Hermes CRM</strong>
          <span>Validando la sesión del operador…</span>
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
