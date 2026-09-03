"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  BellRing,
  Bot,
  BriefcaseBusiness,
  ChevronRight,
  DatabaseZap,
  Inbox,
  Send,
  LayoutDashboard,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Rows3,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { hermesApi } from "@/lib/hermes/api";
import { useCrmSession } from "./CrmSession";
import { activeHandoff } from "./constants";
import { contactName, initials, relativeDate } from "./format";

const NAV_ITEMS = [
  { href: "/admin/crm", label: "Resumen", icon: LayoutDashboard, exact: true },
  { href: "/admin/crm/leads", label: "Pipeline", icon: Rows3 },
  { href: "/admin/crm/inbox", label: "Inbox", icon: Inbox },
  { href: "/admin/crm/campanas", label: "CampaÃ±as", icon: Send },
  { href: "/admin/crm/administracion", label: "Administración", icon: BriefcaseBusiness },
];

function navIsActive(pathname, item) {
  return item.exact
    ? pathname === item.href
    : pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export default function CrmShell({ children }) {
  const pathname = usePathname();
  const normalizedPathname = pathname?.replace(/\/+$/, "") || "/";
  const { user, logout } = useCrmSession();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationItems, setNotificationItems] = useState([]);
  const [notificationTotal, setNotificationTotal] = useState(0);
  const [notificationLoading, setNotificationLoading] = useState(true);
  const [notificationError, setNotificationError] = useState("");
  const [notificationPermission, setNotificationPermission] = useState("unsupported");
  const notificationRef = useRef(null);
  const previousPriorityIds = useRef(null);

  const loadNotifications = useCallback(async (showDesktopAlerts = false) => {
    if (!showDesktopAlerts) setNotificationLoading(true);
    setNotificationError("");
    try {
      const result = await hermesApi.conversations({
        page: 1,
        limit: 6,
        priorityOnly: true,
      });
      const items = result?.data || [];

      if (
        showDesktopAlerts
        && previousPriorityIds.current
        && "Notification" in window
        && window.Notification.permission === "granted"
      ) {
        const newItems = items.filter(
          (conversation) => !previousPriorityIds.current.has(conversation.id),
        );
        newItems.slice(0, 3).forEach((conversation) => {
          const handoff = activeHandoff(conversation);
          new window.Notification(`Nuevo handoff: ${contactName(conversation.contact)}`, {
            body: handoff?.reasonDetail || "La conversación requiere atención humana.",
            tag: `hermes-handoff-${conversation.id}`,
          });
        });
      }

      previousPriorityIds.current = new Set(items.map((conversation) => conversation.id));
      setNotificationItems(items);
      setNotificationTotal(result?.total || items.length);
    } catch {
      setNotificationError("No se pudieron actualizar las alertas.");
    } finally {
      setNotificationLoading(false);
    }
  }, []);

  useEffect(() => {
    if (normalizedPathname === "/admin/crm/login") return undefined;
    loadNotifications();
    const interval = window.setInterval(() => loadNotifications(true), 60000);
    return () => window.clearInterval(interval);
  }, [loadNotifications, normalizedPathname]);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotificationPermission(window.Notification.permission);
    }
  }, []);

  useEffect(() => {
    if (!notificationsOpen) return undefined;
    const closeNotifications = (event) => {
      if (!notificationRef.current?.contains(event.target)) setNotificationsOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setNotificationsOpen(false);
    };
    document.addEventListener("pointerdown", closeNotifications);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeNotifications);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [notificationsOpen]);

  const enableBrowserNotifications = async () => {
    if (!("Notification" in window)) return;
    const permission = await window.Notification.requestPermission();
    setNotificationPermission(permission);
  };

  if (normalizedPathname === "/admin/crm/login") return children;

  const current =
    NAV_ITEMS.find((item) => navIsActive(normalizedPathname, item)) || NAV_ITEMS[0];

  return (
    <div className={`crm-root ${sidebarCollapsed ? "is-sidebar-collapsed" : ""}`}>
      <a className="crm-skip-link" href="#crm-content">Saltar al contenido</a>

      <aside className="crm-sidebar" aria-label="Navegación principal del CRM">
        <div className="crm-brand">
          <div className="crm-brand-mark">
            <Bot size={22} aria-hidden="true" />
          </div>
          <div className="crm-brand-copy">
            <strong>Hermes</strong>
            <span>CRM conversacional</span>
          </div>
        </div>

        <nav className="crm-nav">
          <span className="crm-nav-label">Espacio de trabajo</span>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = navIsActive(normalizedPathname, item);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`crm-nav-entry ${active ? "is-active" : ""}`}
                aria-current={active ? "page" : undefined}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon size={19} aria-hidden="true" />
                <span>{item.label}</span>
                <ChevronRight size={16} className="crm-nav-chevron" />
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          className="crm-sidebar-toggle"
          onClick={() => setSidebarCollapsed((collapsed) => !collapsed)}
          aria-label={sidebarCollapsed ? "Expandir navegación" : "Comprimir navegación"}
          aria-pressed={sidebarCollapsed}
          title={sidebarCollapsed ? "Expandir navegación" : "Comprimir navegación"}
        >
          {sidebarCollapsed ? (
            <PanelLeftOpen size={19} aria-hidden="true" />
          ) : (
            <PanelLeftClose size={19} aria-hidden="true" />
          )}
          <span>{sidebarCollapsed ? "Expandir" : "Comprimir"}</span>
        </button>

        <div className="crm-sidebar-note">
          <DatabaseZap size={18} aria-hidden="true" />
          <div>
            <strong>Fuente Hermes</strong>
            <span>Información obtenida desde el servicio CRM configurado.</span>
          </div>
        </div>

        <div className="crm-user-card">
          <div className="crm-avatar">{initials(user?.name || user?.email)}</div>
          <div className="crm-user-copy">
            <strong>{user?.name || "Operador"}</strong>
            <span>{user?.role === "ADMIN" ? "Administrador" : "Agente de ventas"}</span>
          </div>
          <button
            type="button"
            className="crm-icon-button crm-logout-button"
            onClick={() => logout()}
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      <main className="crm-main" id="crm-content" tabIndex={-1}>
        <header className="crm-topbar">
          <div className="crm-topbar-context">
            <span>Hermes CRM</span>
            <strong>{current.label}</strong>
          </div>

          <div className="crm-notification-center" ref={notificationRef}>
            <button
              type="button"
              className={`crm-notification-trigger ${notificationsOpen ? "is-open" : ""}`}
              onClick={() => {
                setNotificationsOpen((open) => !open);
                if (!notificationsOpen) loadNotifications();
              }}
              aria-label={`Notificaciones: ${notificationTotal} atenciones pendientes`}
              aria-expanded={notificationsOpen}
              aria-controls="crm-notification-panel"
            >
              {notificationTotal > 0 ? <BellRing size={19} /> : <Bell size={19} />}
              {notificationTotal > 0 && (
                <span className="crm-notification-badge">
                  {notificationTotal > 99 ? "99+" : notificationTotal}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <section className="crm-notification-panel" id="crm-notification-panel" aria-label="Centro de notificaciones">
                <header>
                  <div>
                    <span>Notificaciones</span>
                    <strong>Atención humana pendiente</strong>
                  </div>
                  <button type="button" onClick={() => loadNotifications()} disabled={notificationLoading}>
                    Actualizar
                  </button>
                </header>

                <div className="crm-notification-list">
                  {notificationLoading ? (
                    <div className="crm-notification-empty">Consultando handoffs…</div>
                  ) : notificationError ? (
                    <div className="crm-notification-empty is-error">{notificationError}</div>
                  ) : notificationItems.length === 0 ? (
                    <div className="crm-notification-empty">
                      <Bell size={21} />
                      <strong>Sin alertas pendientes</strong>
                      <span>Hermes no requiere intervención humana.</span>
                    </div>
                  ) : (
                    notificationItems.map((conversation) => {
                      const handoff = activeHandoff(conversation);
                      return (
                        <Link
                          key={conversation.id}
                          href={`/admin/crm/inbox?conversationId=${conversation.id}&priorityOnly=true`}
                          className="crm-notification-item"
                          onClick={() => setNotificationsOpen(false)}
                        >
                          <div className="crm-avatar">{initials(contactName(conversation.contact))}</div>
                          <div>
                            <strong>{contactName(conversation.contact)}</strong>
                            <span>{handoff?.reasonDetail || "Requiere atención humana"}</span>
                            <time>{relativeDate(conversation.updatedAt)}</time>
                          </div>
                        </Link>
                      );
                    })
                  )}
                </div>

                <footer>
                  {notificationPermission === "default" && (
                    <button type="button" onClick={enableBrowserNotifications}>
                      <BellRing size={15} /> Activar avisos del navegador
                    </button>
                  )}
                  {notificationPermission === "granted" && (
                    <span className="is-enabled"><i /> Avisos del navegador activos</span>
                  )}
                  {notificationPermission === "denied" && (
                    <span>Los avisos están bloqueados en el navegador.</span>
                  )}
                  {notificationPermission === "unsupported" && (
                    <span>Alertas disponibles mientras el CRM esté abierto.</span>
                  )}
                </footer>
              </section>
            )}
          </div>

          <div className="crm-live-status" role="status" aria-label="Sesión protegida y activa">
            <i aria-hidden="true" />
            <span>Sesión protegida</span>
          </div>
        </header>
        <div className="crm-content">{children}</div>
      </main>
    </div>
  );
}
