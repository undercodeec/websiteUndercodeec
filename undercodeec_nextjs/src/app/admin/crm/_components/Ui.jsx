"use client";

import {
  AlertCircle,
  CheckCircle2,
  Inbox,
  LoaderCircle,
  RefreshCw,
  Search,
} from "lucide-react";

export function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="crm-page-header">
      <div>
        {eyebrow && <span className="crm-eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="crm-page-actions">{actions}</div>}
    </div>
  );
}

export function LoadingState({ label = "Cargando información…" }) {
  return (
    <div className="crm-state-card" role="status" aria-live="polite">
      <LoaderCircle className="crm-spin" size={28} />
      <strong>{label}</strong>
      <span>Esto tomará sólo un momento.</span>
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="crm-state-card is-error" role="alert">
      <AlertCircle size={28} />
      <strong>No pudimos cargar esta sección</strong>
      <span>{message}</span>
      {onRetry && (
        <button type="button" className="crm-button is-secondary" onClick={onRetry}>
          <RefreshCw size={17} />
          Reintentar
        </button>
      )}
    </div>
  );
}

export function EmptyState({
  title = "No hay resultados",
  description = "Prueba con otros filtros o vuelve a revisar más tarde.",
  compact = false,
}) {
  return (
    <div className={`crm-empty-state ${compact ? "is-compact" : ""}`}>
      <Inbox size={compact ? 22 : 30} />
      <strong>{title}</strong>
      <span>{description}</span>
    </div>
  );
}

export function SearchField({ value, onChange, placeholder, label = "Buscar" }) {
  return (
    <label className="crm-search-field">
      <span className="crm-sr-only">{label}</span>
      <Search size={18} aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}

export function Toast({ message, tone = "success", onDismiss }) {
  if (!message) return null;
  return (
    <div className={`crm-toast is-${tone}`} role="status">
      {tone === "success" ? <CheckCircle2 size={19} /> : <AlertCircle size={19} />}
      <span>{message}</span>
      <button type="button" onClick={onDismiss} aria-label="Cerrar aviso">
        ×
      </button>
    </div>
  );
}

export function StageBadge({ stage, meta }) {
  const item = meta[stage] || { label: stage, tone: "neutral" };
  return (
    <span className={`crm-badge is-${item.tone}`}>
      <i aria-hidden="true" />
      {item.short || item.label}
    </span>
  );
}
