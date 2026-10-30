"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, ChevronDown, RefreshCw, Tags, X } from "lucide-react";
import { hermesApi } from "@/lib/hermes/api";
import { updatePromotionAndVerify } from "@/lib/hermes/promotion-workflow.mjs";
import { useCrmSession } from "../../_components/CrmSession";
import { EmptyState, ErrorState, LoadingState, PageHeader, Toast } from "../../_components/Ui";
import { formatDate } from "../../_components/format";

const TYPE_LABELS = {
  FIXED: "Precio fijo",
  FROM: "Desde",
  QUOTE_REQUIRED: "Cotización requerida",
};

function formatPrice(price) {
  if (price.price === null || price.price === undefined) return "Cotización requerida";
  const amount = Number(price.price);
  if (!Number.isFinite(amount)) return "Precio no disponible";
  try {
    return new Intl.NumberFormat("es-EC", {
      style: "currency",
      currency: price.currency || "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${price.currency || "USD"} ${amount.toFixed(2)}`;
  }
}

function requestError(error, fallback) {
  if (error?.status === 403) return "No tienes permiso de administrador para consultar o cambiar tarifas.";
  if (error?.status === 401) return "Tu sesión venció. Vuelve a iniciar sesión.";
  return error?.message || fallback;
}

function AuditLine({ entries, loading }) {
  if (loading) return <span role="status">Consultando auditoría…</span>;
  if (!entries?.length) return <span>No hay cambios auditados disponibles.</span>;
  const entry = entries[0];
  const before = entry.changes?.before?.isActive;
  const after = entry.changes?.after?.isActive;
  return (
    <span>
      Último cambio: {formatDate(entry.createdAt, { withYear: true })} · {entry.user?.name || entry.user?.email || "Administrador no disponible"}
      {typeof before === "boolean" && typeof after === "boolean" ? ` · ${before ? "Activa" : "Inactiva"} → ${after ? "Activa" : "Inactiva"}` : ""}
    </span>
  );
}

export default function TariffsPage() {
  const { user } = useCrmSession();
  const [tariffs, setTariffs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);
  const [audit, setAudit] = useState({});
  const [auditLoading, setAuditLoading] = useState({});
  const [expanded, setExpanded] = useState("");
  const confirmRef = useRef(null);

  const loadTariffs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await hermesApi.priceLists();
      if (!Array.isArray(result)) throw new Error("Hermes devolvió un formato de tarifas inesperado.");
      setTariffs(result);
    } catch (requestFailure) {
      setError(requestError(requestFailure, "No se pudieron cargar las tarifas."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === "ADMIN") void loadTariffs();
  }, [loadTariffs, user?.role]);

  useEffect(() => {
    if (!selected) return undefined;
    confirmRef.current?.focus();
    const onEscape = (event) => {
      if (event.key === "Escape" && !busy) setSelected(null);
    };
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [selected, busy]);

  const showDetails = async (price) => {
    const nextId = expanded === price.id ? "" : price.id;
    setExpanded(nextId);
    if (!nextId || audit[price.id] || auditLoading[price.id]) return;
    setAuditLoading((current) => ({ ...current, [price.id]: true }));
    try {
      const entries = await hermesApi.priceListAudit(price.id);
      setAudit((current) => ({ ...current, [price.id]: Array.isArray(entries) ? entries : [] }));
    } catch (requestFailure) {
      setAudit((current) => ({ ...current, [price.id]: [] }));
      setError(requestError(requestFailure, "No se pudo consultar la auditoría."));
    } finally {
      setAuditLoading((current) => ({ ...current, [price.id]: false }));
    }
  };

  const confirmChange = async () => {
    if (!selected || busy || user?.role !== "ADMIN") return;
    const nextState = !selected.isActive;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const saved = await updatePromotionAndVerify(hermesApi, selected, nextState);
      setTariffs((current) => current.map((item) => item.id === saved.id ? { ...item, ...saved } : item));
      setAudit((current) => { const next = { ...current }; delete next[saved.id]; return next; });
      setNotice(`${saved.name} quedó ${saved.isActive ? "activa" : "inactiva"}. Estado verificado en Hermes.`);
      setSelected(null);
    } catch (requestFailure) {
      const message = requestError(requestFailure, "No se pudo guardar el cambio.");
      setSelected(null);
      await loadTariffs();
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  if (user?.role !== "ADMIN") {
    return <ErrorState message="Esta sección requiere el rol ADMIN." />;
  }

  return (
    <>
      <PageHeader
        eyebrow="Configuración"
        title="Tarifas y promociones"
        description="Consulta las tarifas autorizadas y controla la vigencia comercial de las promociones que puede utilizar Nous."
        actions={<button type="button" className="crm-button is-secondary" onClick={loadTariffs} disabled={loading || busy}><RefreshCw size={16} /> Actualizar</button>}
      />

      {notice && <Toast message={notice} onDismiss={() => setNotice("")} />}
      {error && <div className="crm-inline-alert is-error" role="alert">{error}</div>}
      {loading ? <LoadingState label="Cargando tarifas…" /> : error && tariffs.length === 0 ? (
        <ErrorState message={error} onRetry={loadTariffs} />
      ) : tariffs.length === 0 ? (
        <EmptyState title="No hay tarifas" description="Aún no hay tarifas registradas en Hermes." />
      ) : (
        <section className="crm-panel crm-tariffs-panel" aria-label="Tarifas comerciales">
          <div className="crm-tariffs-summary">
            <div><Tags size={18} aria-hidden="true" /><strong>{tariffs.length} tarifas</strong></div>
            <span>{tariffs.filter((item) => item.isPromotion && item.isActive).length} promociones activas</span>
          </div>
          <div className="crm-tariffs-list">
            {tariffs.map((price) => (
              <article className="crm-tariff-card" key={price.id}>
                <div className="crm-tariff-heading">
                  <div>
                    <span className="crm-tariff-product">{price.product?.name || "Producto no disponible"}</span>
                    <h2>{price.name}</h2>
                    <span className="crm-tariff-meta">{TYPE_LABELS[price.priceType] || price.priceType || "Tipo no indicado"} · {price.currency || "USD"}</span>
                  </div>
                  <div className="crm-tariff-value"><strong>{formatPrice(price)}</strong><span className={price.isActive ? "crm-tariff-status is-active" : "crm-tariff-status"}>{price.isActive ? "Activa" : "Inactiva"}</span></div>
                </div>
                <div className="crm-tariff-actions">
                  {price.isPromotion ? <span className="crm-tariff-promo">Promoción</span> : <span className="crm-tariff-base">Tarifa base</span>}
                  <button type="button" className="crm-button is-secondary" aria-expanded={expanded === price.id} onClick={() => showDetails(price)}>
                    Características <ChevronDown size={15} aria-hidden="true" />
                  </button>
                  {price.isPromotion && <button type="button" className={`crm-button ${price.isActive ? "is-danger" : "is-primary"}`} onClick={() => setSelected(price)} disabled={busy}>
                    {price.isActive ? "Desactivar promoción" : "Activar promoción"}
                  </button>}
                </div>
                {expanded === price.id && (
                  <div className="crm-tariff-details">
                    <dl>
                      <div><dt>Alcance</dt><dd>{price.scope || "No indicado"}</dd></div>
                      <div><dt>Mercado</dt><dd>{price.market || "Global"}</dd></div>
                      <div><dt>Vigencia</dt><dd>{formatDate(price.validFrom, { withYear: true, withTime: false })} — {price.validUntil ? formatDate(price.validUntil, { withYear: true, withTime: false }) : "Sin vencimiento"}</dd></div>
                      <div><dt>Restricciones</dt><dd>{price.restrictions || "No indicadas"}</dd></div>
                      <div><dt>Notas</dt><dd>{price.notes || "No indicadas"}</dd></div>
                    </dl>
                    <div className="crm-tariff-audit"><AuditLine entries={audit[price.id]} loading={auditLoading[price.id]} /></div>
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {selected && <div className="crm-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) setSelected(null); }}>
        <section className="crm-modal crm-tariff-modal" role="dialog" aria-modal="true" aria-labelledby="tariff-confirm-title">
          <header><h2 id="tariff-confirm-title">{selected.isActive ? "Desactivar" : "Activar"} promoción</h2><button type="button" className="crm-icon-button" aria-label="Cerrar" onClick={() => setSelected(null)} disabled={busy}><X size={18} /></button></header>
          <p>Confirma el cambio de estado de esta oferta comercial.</p>
          <dl>
            <div><dt>Promoción</dt><dd>{selected.name}</dd></div>
            <div><dt>Precio</dt><dd>{formatPrice(selected)}</dd></div>
            <div><dt>Estado actual</dt><dd>{selected.isActive ? "Activa" : "Inactiva"}</dd></div>
            <div><dt>Nuevo estado</dt><dd>{selected.isActive ? "Inactiva" : "Activa"}</dd></div>
          </dl>
          {!selected.isActive && <p className="crm-tariff-warning"><AlertTriangle size={18} aria-hidden="true" /> Nous podrá utilizar el precio promocional si la oferta cumple sus condiciones de vigencia.</p>}
          <footer>
            <button type="button" className="crm-button is-secondary" onClick={() => setSelected(null)} disabled={busy}>Cancelar</button>
            <button ref={confirmRef} type="button" className={`crm-button ${selected.isActive ? "is-danger" : "is-primary"}`} onClick={confirmChange} disabled={busy}>{busy ? "Guardando y verificando…" : selected.isActive ? "Confirmar desactivación" : "Confirmar activación"}</button>
          </footer>
        </section>
      </div>}
    </>
  );
}
