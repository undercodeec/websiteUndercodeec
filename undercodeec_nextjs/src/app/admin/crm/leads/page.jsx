"use client";

import Link from "next/link";
import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ArrowUpRight,
  Bot,
  CalendarDays,
  Filter,
  GripVertical,
  MessageSquareText,
  Phone,
  RefreshCw,
  UserRoundCheck,
} from "lucide-react";
import { hermesApi } from "@/lib/hermes/api";
import {
  activeHandoff,
  LEAD_STAGES,
  STAGE_META,
} from "../_components/constants";
import {
  apiErrorMessage,
  contactName,
  contactPhone,
  initials,
  relativeDate,
} from "../_components/format";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
  SearchField,
  Toast,
} from "../_components/Ui";

const INITIAL_FILTERS = {
  stage: "",
  intent: "",
  hasHandoff: "",
  hermesReplied: "",
  period: "",
};

function periodStart(period) {
  if (!period) return "";
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  if (period === "7d") date.setDate(date.getDate() - 7);
  if (period === "30d") date.setDate(date.getDate() - 30);
  if (period === "today") return date.toISOString();
  return date.toISOString();
}

export default function LeadsPipelinePage() {
  const [leads, setLeads] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.trim());
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState("");
  const [draggedId, setDraggedId] = useState("");
  const [dragOverStage, setDragOverStage] = useState("");
  const [toast, setToast] = useState(null);

  const loadLeads = useCallback(
    async (refresh = false) => {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError("");
      try {
        const result = await hermesApi.leads({
          page: 1,
          limit: 100,
          query: deferredSearch,
          stage: filters.stage,
          intent: filters.intent.trim(),
          hasHandoff: filters.hasHandoff,
          hermesReplied: filters.hermesReplied,
          from: periodStart(filters.period),
        });
        setLeads(result?.data || []);
        setTotal(result?.total || 0);
      } catch (requestError) {
        setError(apiErrorMessage(requestError, "No se pudieron cargar los leads."));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [deferredSearch, filters],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => loadLeads(), 120);
    return () => window.clearTimeout(timer);
  }, [loadLeads]);

  const leadsByStage = useMemo(() => {
    const grouped = Object.fromEntries(LEAD_STAGES.map((stage) => [stage, []]));
    leads.forEach((lead) => grouped[lead.stage]?.push(lead));
    return grouped;
  }, [leads]);

  const changeStage = useCallback(
    async (leadId, nextStage) => {
      const current = leads.find((lead) => lead.id === leadId);
      if (!current || current.stage === nextStage || updatingId) return;
      const nextLabel = STAGE_META[nextStage]?.short || nextStage;
      if (
        !window.confirm(
          `¿Mover a ${contactName(current.contact)} a la etapa “${nextLabel}”?`,
        )
      ) {
        return;
      }

      const previousStage = current.stage;
      setUpdatingId(leadId);
      setLeads((items) =>
        items.map((lead) =>
          lead.id === leadId
            ? { ...lead, stage: nextStage, updatedAt: new Date().toISOString() }
            : lead,
        ),
      );
      try {
        const updated = await hermesApi.updateLead(leadId, { stage: nextStage });
        setLeads((items) =>
          items.map((lead) =>
            lead.id === leadId ? { ...lead, ...updated } : lead,
          ),
        );
        setToast({ tone: "success", message: `Lead movido a ${nextLabel}.` });
      } catch (requestError) {
        setLeads((items) =>
          items.map((lead) =>
            lead.id === leadId ? { ...lead, stage: previousStage } : lead,
          ),
        );
        setToast({
          tone: "error",
          message: apiErrorMessage(
            requestError,
            "No se pudo cambiar la etapa; restauramos el estado anterior.",
          ),
        });
      } finally {
        setUpdatingId("");
      }
    },
    [leads, updatingId],
  );

  const clearFilters = () => {
    setSearch("");
    setFilters(INITIAL_FILTERS);
  };

  if (loading) return <LoadingState label="Organizando el pipeline…" />;
  if (error) return <ErrorState message={error} onRetry={loadLeads} />;

  return (
    <>
      <PageHeader
        eyebrow="Pipeline comercial"
        title="Leads y oportunidades"
        description={`${total} contactos observados en esta vista. NEW reúne conversaciones todavía sin señal comercial confirmada.`}
        actions={
          <button
            type="button"
            className="crm-button is-secondary"
            onClick={() => loadLeads(true)}
            disabled={refreshing}
          >
            <RefreshCw size={17} className={refreshing ? "crm-spin" : ""} />
            {refreshing ? "Actualizando…" : "Actualizar"}
          </button>
        }
      />

      <section className="crm-filter-bar" aria-label="Filtros del pipeline">
        <SearchField
          value={search}
          onChange={setSearch}
          placeholder="Nombre, teléfono, producto o intención…"
          label="Buscar leads"
        />
        <div className="crm-filter-controls">
          <label>
            <span className="crm-sr-only">Etapa</span>
            <select
              value={filters.stage}
              onChange={(event) =>
                setFilters((value) => ({ ...value, stage: event.target.value }))
              }
            >
              <option value="">Todas las etapas</option>
              {LEAD_STAGES.map((stage) => (
                <option key={stage} value={stage}>{STAGE_META[stage].short}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="crm-sr-only">Periodo</span>
            <select
              value={filters.period}
              onChange={(event) =>
                setFilters((value) => ({ ...value, period: event.target.value }))
              }
            >
              <option value="">Cualquier periodo</option>
              <option value="today">Hoy</option>
              <option value="7d">Últimos 7 días</option>
              <option value="30d">Últimos 30 días</option>
            </select>
          </label>
          <label>
            <span className="crm-sr-only">Handoff</span>
            <select
              value={filters.hasHandoff}
              onChange={(event) =>
                setFilters((value) => ({
                  ...value,
                  hasHandoff: event.target.value,
                }))
              }
            >
              <option value="">Todos los handoffs</option>
              <option value="true">Con handoff</option>
              <option value="false">Sin handoff</option>
            </select>
          </label>
          <label>
            <span className="crm-sr-only">Respuesta de Hermes</span>
            <select
              value={filters.hermesReplied}
              onChange={(event) =>
                setFilters((value) => ({
                  ...value,
                  hermesReplied: event.target.value,
                }))
              }
            >
              <option value="">Respuesta de Hermes</option>
              <option value="true">Hermes respondió</option>
              <option value="false">Sin respuesta de Hermes</option>
            </select>
          </label>
          <label className="crm-intent-filter">
            <span className="crm-sr-only">Intención exacta</span>
            <input
              value={filters.intent}
              onChange={(event) =>
                setFilters((value) => ({ ...value, intent: event.target.value }))
              }
              placeholder="Intención exacta"
            />
          </label>
          <button type="button" className="crm-filter-clear" onClick={clearFilters}>
            <Filter size={16} />
            Limpiar
          </button>
        </div>
      </section>

      {leads.length === 0 ? (
        <EmptyState
          title="No hay leads para estos filtros"
          description="Limpia los filtros o espera una nueva conversación de WhatsApp."
        />
      ) : (
        <>
          <section className="crm-kanban" aria-label="Pipeline Kanban">
            {LEAD_STAGES.map((stage) => (
              <div
                key={stage}
                className={`crm-kanban-column is-${STAGE_META[stage].tone} ${
                  dragOverStage === stage ? "is-drag-over" : ""
                }`}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragOverStage(stage);
                }}
                onDragLeave={() => setDragOverStage("")}
                onDrop={(event) => {
                  event.preventDefault();
                  setDragOverStage("");
                  if (draggedId) changeStage(draggedId, stage);
                  setDraggedId("");
                }}
              >
                <header>
                  <div>
                    <i aria-hidden="true" />
                    <strong>{STAGE_META[stage].label}</strong>
                  </div>
                  <span>{leadsByStage[stage].length}</span>
                </header>
                <div className="crm-kanban-stack">
                  {leadsByStage[stage].length === 0 ? (
                    <div className="crm-kanban-empty">Suelta un lead aquí</div>
                  ) : (
                    leadsByStage[stage].map((lead) => (
                      <LeadCard
                        key={lead.id}
                        lead={lead}
                        updating={updatingId === lead.id}
                        onDragStart={() => setDraggedId(lead.id)}
                        onDragEnd={() => {
                          setDraggedId("");
                          setDragOverStage("");
                        }}
                      />
                    ))
                  )}
                </div>
              </div>
            ))}
          </section>

          <section className="crm-lead-mobile-list" aria-label="Lista de leads">
            {leads.map((lead) => (
              <article key={lead.id}>
                <LeadCard lead={lead} updating={updatingId === lead.id} />
                <label>
                  <span>Mover etapa</span>
                  <select
                    value={lead.stage}
                    disabled={updatingId === lead.id}
                    onChange={(event) => changeStage(lead.id, event.target.value)}
                  >
                    {LEAD_STAGES.map((stage) => (
                      <option key={stage} value={stage}>
                        {STAGE_META[stage].short}
                      </option>
                    ))}
                  </select>
                </label>
              </article>
            ))}
          </section>
        </>
      )}

      <Toast
        message={toast?.message}
        tone={toast?.tone}
        onDismiss={() => setToast(null)}
      />
    </>
  );
}

function LeadCard({ lead, updating, onDragStart, onDragEnd }) {
  const handoff = activeHandoff(lead.conversation);
  const latestMessage = lead.conversation?.messages?.[0];
  return (
    <article
      className={`crm-lead-card ${updating ? "is-updating" : ""}`}
      draggable={Boolean(onDragStart) && !updating}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div className="crm-lead-card-top">
        <div className="crm-avatar">{initials(contactName(lead.contact))}</div>
        <div className="crm-lead-card-name">
          <strong>{contactName(lead.contact)}</strong>
          <span><Phone size={13} />{contactPhone(lead.contact)}</span>
        </div>
        {onDragStart && <GripVertical size={18} className="crm-drag-handle" />}
      </div>

      <div className="crm-lead-card-tags">
        {lead.conversation?.state?.detectedIntent && (
          <span><Bot size={13} />{lead.conversation.state.detectedIntent}</span>
        )}
        {handoff && (
          <span className="is-priority"><UserRoundCheck size={13} />Handoff</span>
        )}
      </div>

      <p>{lead.productOfInterest || "Interés todavía no definido"}</p>

      <div className="crm-lead-card-meta">
        <span>
          <MessageSquareText size={14} />
          {latestMessage?.content
            ? latestMessage.content.slice(0, 52)
            : lead.conversation?.state?.summary || "Sin resumen todavía"}
        </span>
        <span>
          <CalendarDays size={14} />
          {lead.nextAction || "Sin próxima acción"}
        </span>
      </div>

      <footer>
        <time>{relativeDate(lead.updatedAt)}</time>
        <Link
          href={`/admin/crm/leads/${lead.id}`}
          aria-label={`Abrir lead de ${contactName(lead.contact)}`}
        >
          Abrir <ArrowUpRight size={15} />
        </Link>
      </footer>
    </article>
  );
}
