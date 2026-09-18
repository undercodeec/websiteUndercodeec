"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BadgeDollarSign,
  BarChart3,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  FileText,
  Handshake,
  MessageCircle,
  RefreshCw,
  Save,
  ShieldAlert,
  Target,
  Users,
} from "lucide-react";
import { hermesApi } from "@/lib/hermes/api";
import { useCrmSession } from "../_components/CrmSession";
import { PageHeader, Toast } from "../_components/Ui";
import { apiErrorMessage } from "../_components/format";

const EVENT_TYPES = [
  "WHATSAPP_CLICK",
  "CONVERSATION_STARTED",
  "LEAD_QUALIFIED",
  "MEETING_CONFIRMED",
  "PROPOSAL_SENT",
  "CONTRACT_WON",
  "CONTRACT_LOST",
];

const EVENT_LABELS = {
  WHATSAPP_CLICK: "Clic en WhatsApp",
  CONVERSATION_STARTED: "Conversación iniciada",
  LEAD_QUALIFIED: "Lead cualificado",
  MEETING_CONFIRMED: "Reunión confirmada",
  PROPOSAL_SENT: "Propuesta enviada",
  CONTRACT_WON: "Contrato ganado",
  CONTRACT_LOST: "Contrato perdido",
};

const METRIC_DEFINITIONS = [
  { key: "investment", label: "Inversión publicitaria", icon: CircleDollarSign, type: "money" },
  { key: "conversations", label: "Conversaciones vinculadas", icon: MessageCircle },
  { key: "qualifiedLeads", label: "Leads cualificados", icon: Users },
  { key: "meetings", label: "Reuniones confirmadas", icon: Target },
  { key: "proposals", label: "Propuestas enviadas", icon: FileText },
  { key: "wonContracts", label: "Contratos ganados", icon: Handshake },
  { key: "contractedRevenue", label: "Ingresos contratados", icon: BadgeDollarSign, type: "money" },
];

const INDICATOR_DEFINITIONS = [
  { key: "costPerConversation", label: "Coste por conversación", type: "money" },
  { key: "costPerQualifiedLead", label: "Coste por lead cualificado", type: "money" },
  { key: "costPerContract", label: "Coste por contrato", type: "money" },
  { key: "contractedRevenueOnSpend", label: "Ingresos / inversión", type: "ratio" },
  { key: "estimatedMargin", label: "Margen estimado", type: "percent" },
];

function isoDateInput(date) {
  return date.toISOString().slice(0, 10);
}

function defaultRange() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 29);
  return { from: isoDateInput(from), to: isoDateInput(to) };
}

function formatValue(value, type, currency = "EUR") {
  if (typeof value !== "number" || !Number.isFinite(value)) return "No disponible";
  if (type === "money") {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(value);
  }
  if (type === "ratio") return `${value.toLocaleString("es-ES")}×`;
  if (type === "percent") return `${value.toLocaleString("es-ES")} %`;
  return value.toLocaleString("es-ES");
}

function maskAccount(value) {
  if (!value) return "No configurada";
  return value.length > 4 ? `••••••${value.slice(-4)}` : value;
}

function groupCampaignMetrics(rows) {
  const groups = new Map();
  rows.forEach((row) => {
    const id = row.campaignId || "unknown";
    const current = groups.get(id) || {
      id,
      name: row.campaignName || id,
      status: row.campaignStatus || "UNKNOWN",
      currency: row.currency || "EUR",
      impressions: 0,
      clicks: 0,
      cost: 0,
      updatedAt: row.syncedAt || row.updatedAt || null,
    };
    current.impressions += Number(row.impressions || 0);
    current.clicks += Number(row.clicks || 0);
    current.cost += Number(row.cost || 0);
    if (row.syncedAt || row.updatedAt) current.updatedAt = row.syncedAt || row.updatedAt;
    groups.set(id, current);
  });
  return [...groups.values()];
}

function mappingDraft(type, mappings) {
  const current = mappings.find((item) => item.eventType === type);
  return {
    eventType: type,
    conversionActionId: current?.conversionActionId || "",
    exportEnabled: Boolean(current?.exportEnabled),
    isPrimary: Boolean(current?.isPrimary),
  };
}

export default function AdvertisingAttributionPage() {
  const { user } = useCrmSession();
  const isAdmin = user?.role === "ADMIN";
  const [range, setRange] = useState(defaultRange);
  const [data, setData] = useState({
    dashboard: null,
    status: null,
    mappings: [],
    metrics: [],
  });
  const [integrationForm, setIntegrationForm] = useState({
    accountId: "",
    loginAccountId: "",
    conversionSyncEnabled: false,
    metricsSyncEnabled: false,
  });
  const [mappingForm, setMappingForm] = useState(() => mappingDraft("LEAD_QUALIFIED", []));
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState("");
  const [loadError, setLoadError] = useState("");
  const [toast, setToast] = useState(null);

  const load = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    setLoadError("");

    const query = { from: range.from, to: range.to };
    const [dashboardResult, statusResult, mappingsResult, metricsResult] =
      await Promise.allSettled([
        hermesApi.advertisingDashboard(query),
        hermesApi.advertisingStatus(),
        hermesApi.advertisingMappings(),
        hermesApi.advertisingMetrics(query),
      ]);

    const dashboard = dashboardResult.status === "fulfilled" ? dashboardResult.value : null;
    const status = statusResult.status === "fulfilled" ? statusResult.value : null;
    const mappings = mappingsResult.status === "fulfilled" ? mappingsResult.value || [] : [];
    const metrics = metricsResult.status === "fulfilled" ? metricsResult.value || [] : [];

    setData({ dashboard, status, mappings, metrics });
    if (status) {
      setIntegrationForm({
        accountId: status.accountId || "",
        loginAccountId: status.loginAccountId || "",
        conversionSyncEnabled: Boolean(status.conversionSyncEnabled),
        metricsSyncEnabled: Boolean(status.metricsSyncEnabled),
      });
    }
    setMappingForm((current) => mappingDraft(current.eventType, mappings));

    if (!dashboard && !status) {
      const rejected = dashboardResult.status === "rejected"
        ? dashboardResult.reason
        : statusResult.status === "rejected"
          ? statusResult.reason
          : null;
      setLoadError(apiErrorMessage(rejected, "Hermes no expone todavía el módulo publicitario."));
    }
    setLoading(false);
    setRefreshing(false);
  }, [range.from, range.to]);

  useEffect(() => {
    let active = true;
    window.queueMicrotask(() => {
      if (active) load();
    });
    return () => {
      active = false;
    };
  }, [load]);

  const campaigns = useMemo(() => groupCampaignMetrics(data.metrics), [data.metrics]);
  const dashboard = data.dashboard;
  const status = data.status;
  const currency = dashboard?.advertising?.currency || status?.accountCurrency || "EUR";
  const metricValues = {
    investment: dashboard?.advertising?.spend ?? null,
    conversations: dashboard?.verified?.conversations ?? null,
    qualifiedLeads: dashboard?.verified?.qualifiedLeads ?? null,
    meetings: dashboard?.verified?.meetings ?? null,
    proposals: dashboard?.verified?.proposals ?? null,
    wonContracts: dashboard?.verified?.wonContracts ?? null,
    contractedRevenue: dashboard?.verified?.contractedRevenue ?? null,
  };

  const saveIntegration = async (event) => {
    event.preventDefault();
    setSaving("integration");
    try {
      await hermesApi.updateAdvertisingIntegration({
        accountId: integrationForm.accountId.replaceAll("-", ""),
        ...(integrationForm.loginAccountId
          ? { loginAccountId: integrationForm.loginAccountId.replaceAll("-", "") }
          : {}),
        conversionSyncEnabled: integrationForm.conversionSyncEnabled,
        metricsSyncEnabled: integrationForm.metricsSyncEnabled,
      });
      setToast({ tone: "success", message: "Configuración publicitaria guardada." });
      await load(true);
    } catch (error) {
      setToast({ tone: "error", message: apiErrorMessage(error, "No se pudo guardar la integración.") });
    } finally {
      setSaving("");
    }
  };

  const saveMapping = async (event) => {
    event.preventDefault();
    setSaving("mapping");
    try {
      await hermesApi.updateAdvertisingMapping({
        ...mappingForm,
        conversionActionId: mappingForm.conversionActionId.replaceAll("-", ""),
      });
      setToast({ tone: "success", message: "Mapeo de conversión guardado." });
      await load(true);
    } catch (error) {
      setToast({ tone: "error", message: apiErrorMessage(error, "No se pudo guardar el mapeo.") });
    } finally {
      setSaving("");
    }
  };

  const syncMetrics = async () => {
    if (!window.confirm("¿Sincronizar ahora las métricas de solo lectura para este período?")) return;
    setSaving("metrics");
    try {
      const result = await hermesApi.syncAdvertisingMetrics(range);
      setToast({
        tone: "success",
        message: `Métricas sincronizadas: ${result?.synchronizedRows ?? 0} filas.`,
      });
      await load(true);
    } catch (error) {
      setToast({ tone: "error", message: apiErrorMessage(error, "No se pudieron sincronizar las métricas.") });
    } finally {
      setSaving("");
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Medición publicitaria"
        title="Publicidad y atribución"
        description="Controla la conexión, atribución, conversiones verificadas y diagnósticos entregados por Hermes."
        actions={
          <div className="crm-advertising-actions">
            <label>
              <span>Desde</span>
              <input
                type="date"
                value={range.from}
                max={range.to}
                onChange={(event) => setRange((current) => ({ ...current, from: event.target.value }))}
              />
            </label>
            <label>
              <span>Hasta</span>
              <input
                type="date"
                value={range.to}
                min={range.from}
                max={isoDateInput(new Date())}
                onChange={(event) => setRange((current) => ({ ...current, to: event.target.value }))}
              />
            </label>
            <button
              type="button"
              className="crm-button is-secondary"
              onClick={() => load(true)}
              disabled={refreshing}
            >
              <RefreshCw size={16} className={refreshing ? "crm-spin" : ""} />
              {refreshing ? "Actualizando…" : "Actualizar"}
            </button>
          </div>
        }
      />

      {loadError && (
        <section className="crm-advertising-connection is-error" role="alert">
          <AlertCircle size={21} />
          <div><strong>Módulo de Hermes no disponible</strong><span>{loadError}</span></div>
        </section>
      )}

      <section className={`crm-advertising-safety ${status?.realSendsEnabled ? "is-danger" : "is-safe"}`}>
        {status?.realSendsEnabled ? <ShieldAlert size={23} /> : <CheckCircle2 size={23} />}
        <div>
          <strong>
            {status?.realSendsEnabled
              ? "Atención: los envíos reales a Google están habilitados"
              : "Modo seguro: los envíos reales a Google están desactivados"}
          </strong>
          <span>
            {status?.realSendsEnabled
              ? "No ejecutes una prueba hasta confirmar explícitamente el alcance y la cuenta."
              : "Las pruebas pueden mantenerse en validación mientras Hermes conserve validateOnly."}
          </span>
        </div>
      </section>

      <section className="crm-advertising-metrics" aria-label="Resumen publicitario" aria-busy={loading}>
        {METRIC_DEFINITIONS.map((definition) => {
          const Icon = definition.icon;
          const value = metricValues[definition.key];
          const available = typeof value === "number";
          return (
            <article key={definition.key} className="crm-advertising-card">
              <div className="crm-advertising-card-head">
                <Icon size={19} />
                <span className={`crm-data-status is-${available ? "verified" : "unavailable"}`}>
                  {available ? "Verificado" : "No disponible"}
                </span>
              </div>
              <span>{definition.label}</span>
              <strong>{loading ? "—" : formatValue(value, definition.type, currency)}</strong>
              <small>{definition.key === "investment" ? "Fuente: Google Ads / Hermes" : "Fuente: Hermes"}</small>
            </article>
          );
        })}
      </section>

      <div className="crm-advertising-grid">
        <section className="crm-panel">
          <div className="crm-panel-header">
            <div><span>Indicadores calculados</span><h2>Eficiencia del período</h2></div>
            <BarChart3 className="crm-panel-icon" size={20} />
          </div>
          <div className="crm-advertising-indicators">
            {INDICATOR_DEFINITIONS.map((definition) => {
              const value = dashboard?.calculated?.[definition.key] ?? null;
              return (
                <div key={definition.key}>
                  <span>{definition.label}</span>
                  <strong>{formatValue(value, definition.type, currency)}</strong>
                  <span className={`crm-data-status is-${typeof value === "number" ? "estimated" : "unavailable"}`}>
                    {typeof value === "number" ? "Calculado" : "No disponible"}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="crm-panel">
          <div className="crm-panel-header">
            <div><span>Diagnóstico</span><h2>Estado de integración</h2></div>
            <Clock3 className="crm-advertising-sync-icon" size={21} />
          </div>
          <dl className="crm-advertising-sync">
            <div><dt>Métricas</dt><dd>{dashboard?.connectionStatus || "PENDING_CONNECTION"}</dd></div>
            <div><dt>Cuenta</dt><dd>{maskAccount(status?.accountId)}</dd></div>
            <div><dt>Credenciales Google</dt><dd>{status?.credentialsConfigured ? "Configuradas" : "Pendientes"}</dd></div>
            <div><dt>Conversión habilitada</dt><dd>{status?.conversionSyncEnabled ? "Sí" : "No"}</dd></div>
            <div><dt>Última conversión</dt><dd>{status?.lastConversionSyncAt ? new Date(status.lastConversionSyncAt).toLocaleString("es-ES") : "No disponible"}</dd></div>
          </dl>
          {status?.syncCounts?.length > 0 && (
            <div className="crm-sync-counts">
              {status.syncCounts.map((item) => (
                <span key={item.status}><strong>{item._count?.id ?? 0}</strong>{item.status}</span>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="crm-advertising-grid">
        <section className="crm-panel">
          <div className="crm-panel-header">
            <div><span>Administración</span><h2>Cuenta e interruptores</h2></div>
          </div>
          {!isAdmin ? (
            <div className="crm-inline-empty">Solo un administrador puede modificar esta configuración.</div>
          ) : (
            <form className="crm-advertising-form" onSubmit={saveIntegration}>
              <label>
                <span>ID de cuenta de Google Ads</span>
                <input
                  value={integrationForm.accountId}
                  onChange={(event) => setIntegrationForm((current) => ({ ...current, accountId: event.target.value }))}
                  inputMode="numeric"
                  pattern="[0-9-]{1,32}"
                  required
                />
              </label>
              <label>
                <span>ID de cuenta administradora (opcional)</span>
                <input
                  value={integrationForm.loginAccountId}
                  onChange={(event) => setIntegrationForm((current) => ({ ...current, loginAccountId: event.target.value }))}
                  inputMode="numeric"
                  pattern="[0-9-]{0,32}"
                />
              </label>
              <label className="crm-advertising-check">
                <input
                  type="checkbox"
                  checked={integrationForm.conversionSyncEnabled}
                  onChange={(event) => setIntegrationForm((current) => ({ ...current, conversionSyncEnabled: event.target.checked }))}
                />
                <span>Preparar conversiones verificadas para sincronización</span>
              </label>
              <label className="crm-advertising-check">
                <input
                  type="checkbox"
                  checked={integrationForm.metricsSyncEnabled}
                  onChange={(event) => setIntegrationForm((current) => ({ ...current, metricsSyncEnabled: event.target.checked }))}
                />
                <span>Habilitar métricas de solo lectura</span>
              </label>
              <p className="crm-advertising-help">
                Estos controles no cambian las variables de entorno ni habilitan por sí solos envíos reales.
              </p>
              <button className="crm-button is-primary" disabled={saving === "integration"}>
                <Save size={16} />{saving === "integration" ? "Guardando…" : "Guardar configuración"}
              </button>
            </form>
          )}
        </section>

        <section className="crm-panel">
          <div className="crm-panel-header">
            <div><span>Google Data Manager</span><h2>Mapeo de conversiones</h2></div>
          </div>
          {!isAdmin ? (
            <div className="crm-mapping-list">
              {data.mappings.map((item) => (
                <div key={item.eventType}><strong>{EVENT_LABELS[item.eventType] || item.eventType}</strong><span>{item.exportEnabled ? "Exportación habilitada" : "Deshabilitada"}</span></div>
              ))}
            </div>
          ) : (
            <form className="crm-advertising-form" onSubmit={saveMapping}>
              <label>
                <span>Evento de Hermes</span>
                <select
                  value={mappingForm.eventType}
                  onChange={(event) => setMappingForm(mappingDraft(event.target.value, data.mappings))}
                >
                  {EVENT_TYPES.map((type) => <option key={type} value={type}>{EVENT_LABELS[type]}</option>)}
                </select>
              </label>
              <label>
                <span>ID de acción de conversión</span>
                <input
                  value={mappingForm.conversionActionId}
                  onChange={(event) => setMappingForm((current) => ({ ...current, conversionActionId: event.target.value }))}
                  inputMode="numeric"
                  pattern="[0-9-]{1,32}"
                  required
                />
              </label>
              <label className="crm-advertising-check">
                <input
                  type="checkbox"
                  checked={mappingForm.exportEnabled}
                  onChange={(event) => setMappingForm((current) => ({ ...current, exportEnabled: event.target.checked }))}
                />
                <span>Exportar este evento</span>
              </label>
              <label className="crm-advertising-check">
                <input
                  type="checkbox"
                  checked={mappingForm.isPrimary}
                  onChange={(event) => setMappingForm((current) => ({ ...current, isPrimary: event.target.checked }))}
                />
                <span>Marcar como acción principal en la configuración</span>
              </label>
              <button className="crm-button is-primary" disabled={saving === "mapping"}>
                <Save size={16} />{saving === "mapping" ? "Guardando…" : "Guardar mapeo"}
              </button>
            </form>
          )}
        </section>
      </div>

      <section className="crm-panel crm-advertising-campaigns">
        <div className="crm-panel-header">
          <div><span>Google Ads</span><h2>Métricas por campaña</h2></div>
          {isAdmin && (
            <button
              type="button"
              className="crm-button is-secondary"
              onClick={syncMetrics}
              disabled={!status?.metricsSyncEnabled || saving === "metrics"}
              title={!status?.metricsSyncEnabled ? "La sincronización de métricas está desactivada" : undefined}
            >
              <RefreshCw size={16} className={saving === "metrics" ? "crm-spin" : ""} />
              {saving === "metrics" ? "Sincronizando…" : "Sincronizar métricas"}
            </button>
          )}
        </div>
        {campaigns.length === 0 ? (
          <div className="crm-inline-empty">No hay métricas disponibles para este período.</div>
        ) : (
          <div className="crm-table-wrap">
            <table className="crm-table">
              <thead><tr><th>Campaña</th><th>Estado</th><th>Impresiones</th><th>Clics</th><th>Inversión</th><th>Actualización</th></tr></thead>
              <tbody>
                {campaigns.map((campaign) => (
                  <tr key={campaign.id}>
                    <td><strong>{campaign.name}</strong></td>
                    <td>{campaign.status}</td>
                    <td>{campaign.impressions.toLocaleString("es-ES")}</td>
                    <td>{campaign.clicks.toLocaleString("es-ES")}</td>
                    <td>{formatValue(campaign.cost, "money", campaign.currency)}</td>
                    <td>{campaign.updatedAt ? new Date(campaign.updatedAt).toLocaleString("es-ES") : "No disponible"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Toast message={toast?.message} tone={toast?.tone} onDismiss={() => setToast(null)} />
    </>
  );
}
