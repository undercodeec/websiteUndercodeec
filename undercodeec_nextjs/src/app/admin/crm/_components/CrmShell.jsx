"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BellRing,
  Bot,
  ChevronRight,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Rows3,
  X,
} from "lucide-react";
import { useState } from "react";
import { useCrmSession } from "./CrmSession";
import { initials } from "./format";

const NAV_ITEMS = [
  { href: "/admin/crm", label: "Resumen", icon: LayoutDashboard, exact: true },
  { href: "/admin/crm/leads", label: "Pipeline", icon: Rows3 },
  { href: "/admin/crm/inbox", label: "Inbox", icon: Inbox },
];

function navIsActive(pathname, item) {
  return item.exact
    ? pathname === item.href
    : pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export default function CrmShell({ children }) {
  const pathname = usePathname();
  const { user, logout } = useCrmSession();
  const [menuOpen, setMenuOpen] = useState(false);

  if (pathname === "/admin/crm/login") return children;

  const current =
    NAV_ITEMS.find((item) => navIsActive(pathname, item)) || NAV_ITEMS[0];

  return (
    <div className="crm-root">
      <aside className={`crm-sidebar ${menuOpen ? "is-open" : ""}`}>
        <div className="crm-brand">
          <div className="crm-brand-mark">
            <Bot size={22} aria-hidden="true" />
          </div>
          <div>
            <strong>Hermes</strong>
            <span>CRM conversacional</span>
          </div>
          <button
            type="button"
            className="crm-icon-button crm-mobile-close"
            onClick={() => setMenuOpen(false)}
            aria-label="Cerrar navegación"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="crm-nav" aria-label="Navegación principal del CRM">
          <span className="crm-nav-label">Espacio de trabajo</span>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = navIsActive(pathname, item);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={active ? "is-active" : ""}
                aria-current={active ? "page" : undefined}
                onClick={() => setMenuOpen(false)}
              >
                <Icon size={19} aria-hidden="true" />
                <span>{item.label}</span>
                <ChevronRight size={16} className="crm-nav-chevron" />
              </Link>
            );
          })}
        </nav>

        <div className="crm-sidebar-note">
          <BellRing size={18} aria-hidden="true" />
          <div>
            <strong>WhatsApp conectado</strong>
            <span>Hermes sigue atendiendo las conversaciones activas.</span>
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
            className="crm-icon-button"
            onClick={() => logout()}
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {menuOpen && (
        <button
          type="button"
          className="crm-sidebar-backdrop"
          aria-label="Cerrar navegación"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <main className="crm-main">
        <header className="crm-topbar">
          <button
            type="button"
            className="crm-icon-button crm-menu-button"
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir navegación"
          >
            <Menu size={21} />
          </button>
          <div>
            <span>Hermes CRM</span>
            <strong>{current.label}</strong>
          </div>
          <div className="crm-live-status">
            <i aria-hidden="true" />
            Operación activa
          </div>
        </header>
        <div className="crm-content">{children}</div>
      </main>
    </div>
  );
}
