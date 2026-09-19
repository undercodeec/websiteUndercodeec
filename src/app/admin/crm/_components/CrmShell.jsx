"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  BellRing,
  BarChart3,
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
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  HERMES_CONVERSATION_READ_EVENT,
  HERMES_CUSTOMER_MESSAGE_EVENT,
  hermesApi,
  subscribeHermesEvents,
} from "@/lib/hermes/api";
import { useCrmSession } from "./CrmSession";
import { activeHandoff } from "./constants";
import { contactName, initials, relativeDate } from "./format";

const NAV_ITEMS = [
  { href: "/admin/crm", label: "Resumen", icon: LayoutDashboard, exact: true },
  { href: "/admin/crm/publicidad", label: "Publicidad y atribución", icon: BarChart3 },
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
  const [recentCustomerMessages, setRecentCustomerMessages] = useState([]);
  const [unreadMessageIds, setUnreadMessageIds] = useState([]);
  const [liveAlert, setLiveAlert] = useState(null);
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const notificationRef = useRef(null);
  const previousPriorityIds = useRef(null);
  const previousPriorityMessageIds = useRef(null);
  const receivedMessageIds = useRef(new Set());

  useEffect(() => {
    try {
      setSidebarCollapsed(window.localStorage.getItem("hermes-crm-sidebar-collapsed") === "true");
    } catch {
      // La navegación sigue funcionando si el almacenamiento no está disponible.
    }
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed((collapsed) => {
      const next = !collapsed;
      try {
        window.localStorage.setItem("hermes-crm-sidebar-collapsed", String(next));
      } catch {
        // No se requiere almacenamiento para contraer o expandir durante la sesión.
      }
      return next;
    });
  };

  const handleCustomerMessage = useCallback((message) => {
    if (!message?.messageId || receivedMessageIds.current.has(message.messageId)) return;
    receivedMessageIds.current.add(message.messageId);

    window.dispatchEvent(
      new CustomEvent(HERMES_CUSTOMER_MESSAGE_EVENT, { detail: message }),
    );
    setRecentCustomerMessages((items) => [
      message,
      ...items.filter((item) => item.messageId !== message.messageId),
    ].slice(0, 8));

    const openConversationId = new URLSearchParams(window.location.search).get(
      "conversationId",
    );
    const isReadingConversation =
      document.visibilityState === "visible" &&
      normalizedPathname === "/admin/crm/inbox" &&
      openConversationId === message.conversationId;

    if (isReadingConversation) return;
    setUnreadMessageIds((ids) =>
      ids.includes(message.messageId) ? ids : [...ids, message.messageId],
    );
    setLiveAlert(message);

    if ("Notification" in window && window.Notification.permission === "granted") {
      const notification = new window.Notification(
        `Nuevo mensaje de ${message.contactName || "un cliente"}`,
        {
          body: message.content || "El cliente respondió en WhatsApp.",
          tag: `hermes-message-${message.messageId}`,
        },
      );
      notification.onclick = () => {
        window.focus();
        window.location.assign(
          `/admin/crm/inbox?conversationId=${encodeURIComponent(message.conversationId)}`,
        );
        notification.close();
      };
    }
  }, [normalizedPathname]);

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

      if (showDesktopAlerts && previousPriorityMessageIds.current) {
        items.forEach((conversation) => {
          const latest = conversation.messages?.[0];
          if (
            latest?.sender === "CONTACT" &&
            previousPriorityMessageIds.current.get(conversation.id) !== latest.id
          ) {
            handleCustomerMessage({
              messageId: latest.id,
              conversationId: conversation.id,
              contactId: conversation.contactId,
              contactName: contactName(conversation.contact),
              content: latest.content || `[${latest.type || "Mensaje"}]`,
              messageType: latest.type || "UNKNOWN",
              createdAt: latest.createdAt,
            });
          }
        });
      }

      previousPriorityIds.current = new Set(items.map((conversation) => conversation.id));
      previousPriorityMessageIds.current = new Map(
        items.map((conversation) => [conversation.id, conversation.messages?.[0]?.id]),
      );
      setNotificationItems(items);
      setNotificationTotal(result?.total || items.length);
    } catch {
      setNotificationError("No se pudieron actualizar las alertas.");
    } finally {
      setNotificationLoading(false);
    }
  }, [handleCustomerMessage]);

  useEffect(() => {
    if (normalizedPathname === "/admin/crm/login") return undefined;
    loadNotifications();
    const interval = window.setInterval(() => loadNotifications(true), 15000);
    return () => window.clearInterval(interval);
  }, [loadNotifications, normalizedPathname]);

  useEffect(() => {
    if (normalizedPathname === "/admin/crm/login" || !user) return undefined;

    return subscribeHermesEvents(
      (event) => {
        if (event.type !== "customer_message" || !event.data?.messageId) return;
        handleCustomerMessage(event.data);
        void loadNotifications(true);
      },
      setRealtimeConnected,
    );
  }, [handleCustomerMessage, loadNotifications, normalizedPathname, user]);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotificationPermission(window.Notification.permission);
    }
  }, []);

  useEffect(() => {
    const markConversationRead = (event) => {
      const conversationId = event.detail?.conversationId;
      if (!conversationId) return;
      const messageIds = new Set(
        recentCustomerMessages
          .filter((message) => message.conversationId === conversationId)
          .map((message) => message.messageId),
      );
      setUnreadMessageIds((ids) => ids.filter((id) => !messageIds.has(id)));
      setLiveAlert((message) =>
        message?.conversationId === conversationId ? null : message,
      );
    };
    window.addEventListener(HERMES_CONVERSATION_READ_EVENT, markConversationRead);
    return () => {
      window.removeEventListener(HERMES_CONVERSATION_READ_EVENT, markConversationRead);
    };
  }, [recentCustomerMessages]);

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

  const markCustomerMessageRead = (messageId) => {
    setUnreadMessageIds((ids) => ids.filter((id) => id !== messageId));
    setLiveAlert((message) =>
      message?.messageId === messageId ? null : message,
    );
  };

  if (normalizedPathname === "/admin/crm/login") return children;

  const current =
    NAV_ITEMS.find((item) => navIsActive(normalizedPathname, item)) || NAV_ITEMS[0];
  const notificationBadgeTotal = notificationTotal + unreadMessageIds.length;

  return (
    <div className={`crm-root ${sidebarCollapsed ? "is-sidebar-collapsed" : ""}`}>
      <a className="crm-skip-link" href="#crm-content">Saltar al contenido</a>

      <aside
        id="crm-sidebar"
        className="crm-sidebar"
        aria-label="Navegación principal del CRM"
        aria-hidden={sidebarCollapsed}
        inert={sidebarCollapsed ? "" : undefined}
      >
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
          <button
            type="button"
            className="crm-sidebar-toggle"
            onClick={toggleSidebar}
            aria-label={sidebarCollapsed ? "Mostrar navegación lateral" : "Ocultar navegación lateral"}
            aria-expanded={!sidebarCollapsed}
            aria-controls="crm-sidebar"
            title={sidebarCollapsed ? "Mostrar menú" : "Ocultar menú"}
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen size={19} aria-hidden="true" />
            ) : (
              <PanelLeftClose size={19} aria-hidden="true" />
            )}
            <span>{sidebarCollapsed ? "Mostrar menú" : "Ocultar menú"}</span>
          </button>
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
              aria-label={`Notificaciones: ${notificationBadgeTotal} pendientes`}
              aria-expanded={notificationsOpen}
              aria-controls="crm-notification-panel"
            >
              {notificationBadgeTotal > 0 ? <BellRing size={19} /> : <Bell size={19} />}
              {notificationBadgeTotal > 0 && (
                <span className="crm-notification-badge">
                  {notificationBadgeTotal > 99 ? "99+" : notificationBadgeTotal}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <section className="crm-notification-panel" id="crm-notification-panel" aria-label="Centro de notificaciones">
                <header>
                  <div>
                    <span>Notificaciones</span>
                    <strong>Mensajes y atención pendiente</strong>
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
                  ) : notificationItems.length === 0 && recentCustomerMessages.length === 0 ? (
                    <div className="crm-notification-empty">
                      <Bell size={21} />
                      <strong>Sin alertas pendientes</strong>
                      <span>No hay mensajes nuevos ni handoffs pendientes.</span>
                    </div>
                  ) : (
                    <>
                      {recentCustomerMessages.length > 0 && (
                        <div className="crm-notification-group-label">Mensajes recientes</div>
                      )}
                      {recentCustomerMessages.map((message) => (
                        <Link
                          key={message.messageId}
                          href={`/admin/crm/inbox?conversationId=${message.conversationId}`}
                          className={`crm-notification-item ${unreadMessageIds.includes(message.messageId) ? "is-unread" : ""}`}
                          onClick={() => {
                            markCustomerMessageRead(message.messageId);
                            setNotificationsOpen(false);
                          }}
                        >
                          <div className="crm-avatar">{initials(message.contactName)}</div>
                          <div>
                            <strong>{message.contactName || "Cliente"}</strong>
                            <span>{message.content || "Nuevo mensaje de WhatsApp"}</span>
                            <time>{relativeDate(message.createdAt)}</time>
                          </div>
                        </Link>
                      ))}
                      {notificationItems.length > 0 && (
                        <div className="crm-notification-group-label">Handoffs pendientes</div>
                      )}
                      {notificationItems.map((conversation) => {
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
                      })}
                    </>
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

          <div
            className={`crm-live-status ${realtimeConnected ? "is-realtime" : "is-reconnecting"}`}
            role="status"
            aria-label={realtimeConnected ? "Inbox en tiempo real activo" : "Reconectando Inbox"}
          >
            <i aria-hidden="true" />
            <span>{realtimeConnected ? "Tiempo real activo" : "Reconectando…"}</span>
          </div>
        </header>
        <div className="crm-content">{children}</div>
      </main>
      {liveAlert && (
        <aside className="crm-live-alert" role="status" aria-live="polite">
          <Link
            href={`/admin/crm/inbox?conversationId=${liveAlert.conversationId}`}
            onClick={() => markCustomerMessageRead(liveAlert.messageId)}
          >
            <BellRing size={18} />
            <span>
              <strong>{liveAlert.contactName || "Cliente"}</strong>
              <small>{liveAlert.content || "Nuevo mensaje de WhatsApp"}</small>
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setLiveAlert(null)}
            aria-label="Cerrar aviso"
          >
            <X size={15} />
          </button>
        </aside>
      )}
    </div>
  );
}
