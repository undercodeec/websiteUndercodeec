"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Bot,
  CheckCircle2,
  CircleDot,
  Inbox,
  MessageSquareText,
  RefreshCw,
  Trophy,
  Users,
} from "lucide-react";
import { hermesApi } from "@/lib/hermes/api";
import { LEAD_STAGES, STAGE_META } from "./_components/constants";
import {
  contactName,
  contactPhone,
  formatDate,
  initials,
  relativeDate,
  apiErrorMessage,
} from "./_components/format";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
  StageBadge,
} from "./_components/Ui";

const EMPTY_OVERVIEW = {
  totalObserved: 0,
  qualified: 0,
  open: 0,
  won: 0,
  lost: 0,
  pendingHandoffs: 0,
};

export default function CrmOverviewPage() {
  const [data, setData] = useState({
    overview: EMPTY_OVERVIEW,
    funnel: [],
    leads: [],
    priorities: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadOverview = useCallback(async (refresh = false) => {
    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError("");
    try {
      const [overview, funnel, leadsResult, conversationsResult] =
        await Promise.all([
          hermesApi.overview(),
          hermesApi.funnel(),
          hermesApi.leads({ page: 1, limit: 5 }),
          hermesApi.conversations({ page: 1, limit: 5, priorityOnly: true }),
        ]);
      setData({
        overview: { ...EMPTY_OVERVIEW, ...overview },
        funnel: Array.isArray(funnel) ? funnel : [],
        leads: leadsResult?.data || [],
        priorities: conversationsResult?.data || [],
      });
    } catch (requestError) {
      setError(apiErrorMessage(requestError, "No se pudo cargar el resumen."));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  const funnel = useMemo(() => {
    const counts = new Map(data.funnel.map((item) => [item.stage, item.count]));
    const maximum = Math.max(1, ...data.funnel.map((item) => item.count));
    return LEAD_STAGES.map((stage) => ({
      stage,
      count: counts.get(stage) || 0,
      width: ((counts.get(stage) || 0) / maximum) * 100,
    }));
  }, [data.funnel]);

  if (loading) return <LoadingState label="Preparando el panorama comercial…" />;
  if (error) return <ErrorState message={error} onRetry={loadOverview} />;

  const cards = [
    {
      label: "Total observado",
      value: data.overview.totalObserved,
      note: "Todas las conversaciones",
      icon: Users,
      tone: "blue",
    },
    {
      label: "Calificados",
      value: data.overview.qualified,
      note: "Interés comercial detectado",
      icon: CircleDot,
      tone: "violet",
    },
    {
      label: "Handoffs pendientes",
      value: data.overview.pendingHandoffs,
      note: "Necesitan atención humana",
      icon: Inbox,
      tone: "orange",
    },
    {
      label: "Ganados",
      value: data.overview.won,
      note: `${data.overview.open} oportunidades abiertas`,
      icon: Trophy,
      tone: "green",
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Vista general"
        title="Pulso de la operación"
        description="Separa el volumen que Hermes observa de las oportunidades que ya muestran intención comercial."
        actions={
          <button
            type="button"
            className="crm-button is-secondary"
            onClick={() => loadOverview(true)}
            disabled={refreshing}
          >
            <RefreshCw size={17} className={refreshing ? "crm-spin" : ""} />
            {refreshing ? "Actualizando…" : "Actualizar"}
          </button>
        }
      />

      <section className="crm-metric-grid" aria-label="Métricas principales">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <article key={card.label} className={`crm-metric-card is-${card.tone}`}>
              <div className="crm-metric-icon"><Icon size={20} /></div>
              <span>{card.label}</span>
              <strong>{card.value}</strong>
              <small>{card.note}</small>
            </article>
          );
        })}
      </section>

      <div className="crm-dashboard-grid">
        <section className="crm-panel crm-funnel-panel">
          <div className="crm-panel-header">
            <div>
              <span>Embudo comercial</span>
              <h2>Leads por etapa</h2>
            </div>
            <Link href="/admin/crm/leads" className="crm-text-link">
              Abrir pipeline <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="crm-funnel-list">
            {funnel.map((item) => (
              <div className="crm-funnel-row" key={item.stage}>
                <span>{STAGE_META[item.stage].short}</span>
                <div className="crm-funnel-track">
                  <i
                    className={`is-${STAGE_META[item.stage].tone}`}
                    style={{ width: `${Math.max(item.width, item.count ? 6 : 0)}%` }}
                  />
                </div>
                <strong>{item.count}</strong>
              </div>
            ))}
          </div>
          <div className="crm-funnel-foot">
            <div><Bot size={18} /><span>Hermes calificó <strong>{data.overview.qualified}</strong></span></div>
            <div><CheckCircle2 size={18} /><span>Cerrados <strong>{data.overview.won + data.overview.lost}</strong></span></div>
          </div>
        </section>

        <section className="crm-panel">
          <div className="crm-panel-header">
            <div>
              <span>Atención prioritaria</span>
              <h2>Handoffs abiertos</h2>
            </div>
            <Link href="/admin/crm/inbox?priorityOnly=true" className="crm-text-link">
              Ver inbox <ArrowUpRight size={16} />
            </Link>
          </div>
          {data.priorities.length === 0 ? (
            <EmptyState
              compact
              title="Todo bajo control"
              description="No hay conversaciones esperando atención humana."
            />
          ) : (
            <div className="crm-priority-list">
              {data.priorities.map((conversation) => (
                <Link
                  href={`/admin/crm/inbox?conversationId=${conversation.id}`}
                  key={conversation.id}
                  className="crm-priority-item"
                >
                  <div className="crm-avatar">{initials(contactName(conversation.contact))}</div>
                  <div>
                    <strong>{contactName(conversation.contact)}</strong>
                    <span>{conversation.handoffs?.[0]?.reasonDetail || "Solicita atención humana"}</span>
                  </div>
                  <time>{relativeDate(conversation.updatedAt)}</time>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="crm-panel crm-recent-panel">
        <div className="crm-panel-header">
          <div>
            <span>Actividad reciente</span>
            <h2>Últimos leads observados</h2>
          </div>
          <Link href="/admin/crm/leads" className="crm-text-link">
            Ver todos <ArrowUpRight size={16} />
          </Link>
        </div>
        {data.leads.length === 0 ? (
          <EmptyState
            title="Aún no hay leads"
            description="El primer mensaje recibido por WhatsApp aparecerá aquí como un lead nuevo."
          />
        ) : (
          <div className="crm-table-wrap">
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Contacto</th>
                  <th>Interés / intención</th>
                  <th>Etapa</th>
                  <th>Última actividad</th>
                  <th><span className="crm-sr-only">Abrir</span></th>
                </tr>
              </thead>
              <tbody>
                {data.leads.map((lead) => (
                  <tr key={lead.id}>
                    <td>
                      <div className="crm-table-contact">
                        <div className="crm-avatar">{initials(contactName(lead.contact))}</div>
                        <div>
                          <strong>{contactName(lead.contact)}</strong>
                          <span>{contactPhone(lead.contact)}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <strong>{lead.productOfInterest || "Sin producto definido"}</strong>
                      <span>{lead.conversation?.state?.detectedIntent || "Sin intención detectada"}</span>
                    </td>
                    <td><StageBadge stage={lead.stage} meta={STAGE_META} /></td>
                    <td>
                      <strong>{relativeDate(lead.updatedAt)}</strong>
                      <span>{formatDate(lead.updatedAt)}</span>
                    </td>
                    <td>
                      <Link
                        href={`/admin/crm/leads/${lead.id}`}
                        className="crm-icon-button"
                        aria-label={`Abrir lead de ${contactName(lead.contact)}`}
                      >
                        <ArrowUpRight size={17} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="crm-operation-note">
        <MessageSquareText size={21} />
        <div>
          <strong>Hermes atiende automáticamente mientras observas.</strong>
          <span>
            Sólo las conversaciones con handoff abierto pasan a control humano y
            bloquean la respuesta automática.
          </span>
        </div>
      </section>
    </>
  );
}
