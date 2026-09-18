"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  Bot,
  BriefcaseBusiness,
  CalendarCheck2,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Mail,
  Megaphone,
  MessageSquareText,
  Phone,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
import { hermesApi } from "@/lib/hermes/api";
import { useCrmSession } from "../../_components/CrmSession";
import {
  HANDOFF_REASON,
  HANDOFF_STATUS,
  LEAD_STAGES,
  STAGE_META,
} from "../../_components/constants";
import {
  apiErrorMessage,
  contactName,
  contactPhone,
  formatDate,
  initials,
  money,
  percent,
} from "../../_components/format";
import {
  ErrorState,
  LoadingState,
  StageBadge,
  Toast,
} from "../../_components/Ui";

export default function LeadDetailPage() {
  const params = useParams();
  const id = String(params.id);
  const { user } = useCrmSession();
  const [lead, setLead] = useState(null);
  const [advertisingHistory, setAdvertisingHistory] = useState([]);
  const [advertisingError, setAdvertisingError] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const loadLead = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [leadResult, historyResult] = await Promise.allSettled([
        hermesApi.lead(id),
        hermesApi.advertisingLeadHistory(id),
      ]);
      if (leadResult.status === "rejected") throw leadResult.reason;
      setLead(leadResult.value);
      if (historyResult.status === "fulfilled") {
        setAdvertisingHistory(Array.isArray(historyResult.value) ? historyResult.value : []);
        setAdvertisingError("");
      } else {
        setAdvertisingHistory([]);
        setAdvertisingError(apiErrorMessage(
          historyResult.reason,
          "No se pudo consultar la atribución publicitaria.",
        ));
      }
    } catch (requestError) {
      setError(apiErrorMessage(requestError, "No se pudo cargar el lead."));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadLead();
  }, [loadLead]);

  const updateLead = async (changes, successMessage) => {
    setSaving(true);
    try {
      const updated = await hermesApi.updateLead(id, changes);
      setLead((value) => ({ ...value, ...updated }));
      setToast({ tone: "success", message: successMessage });
    } catch (requestError) {
      setToast({
        tone: "error",
        message: apiErrorMessage(requestError, "No se pudo actualizar el lead."),
      });
    } finally {
      setSaving(false);
    }
  };

  const handleStage = (event) => {
    const stage = event.target.value;
    if (stage === lead.stage) return;
    if (
      window.confirm(
        `¿Cambiar la etapa de este lead a “${STAGE_META[stage].short}”?`,
      )
    ) {
      updateLead({ stage }, `Etapa actualizada a ${STAGE_META[stage].short}.`);
    }
  };

  const handleNextAction = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    updateLead(
      { nextAction: String(form.get("nextAction") || "").trim() },
      "Próxima acción guardada.",
    );
  };

  if (loading) return <LoadingState label="Abriendo la ficha del lead…" />;
  if (error) return <ErrorState message={error} onRetry={loadLead} />;
  if (!lead) return null;

  const state = lead.conversation?.state;
  const openHandoff = lead.conversation?.handoffs?.find((handoff) =>
    ["PENDING", "ASSIGNED", "IN_PROGRESS"].includes(handoff.status),
  );

  return (
    <>
      <div className="crm-detail-back">
        <Link href="/admin/crm/leads"><ArrowLeft size={17} />Volver al pipeline</Link>
        <button type="button" onClick={loadLead} className="crm-icon-button" aria-label="Actualizar ficha">
          <RefreshCw size={17} />
        </button>
      </div>

      <header className="crm-lead-hero">
        <div className="crm-avatar is-large">{initials(contactName(lead.contact))}</div>
        <div className="crm-lead-hero-copy">
          <span className="crm-eyebrow">Ficha de oportunidad</span>
          <h1>{contactName(lead.contact)}</h1>
          <div>
            <span><Phone size={15} />{contactPhone(lead.contact)}</span>
            {lead.contact?.email && <span><Mail size={15} />{lead.contact.email}</span>}
            {lead.contact?.company && (
              <span><BriefcaseBusiness size={15} />{lead.contact.company}</span>
            )}
          </div>
        </div>
        <div className="crm-lead-stage-control">
          <label htmlFor="lead-stage">Etapa comercial</label>
          <select
            id="lead-stage"
            value={lead.stage}
            onChange={handleStage}
            disabled={saving}
          >
            {LEAD_STAGES.map((stage) => (
              <option key={stage} value={stage}>{STAGE_META[stage].short}</option>
            ))}
          </select>
          <StageBadge stage={lead.stage} meta={STAGE_META} />
        </div>
      </header>

      {openHandoff && (
        <section className="crm-handoff-banner">
          <ShieldCheck size={23} />
          <div>
            <strong>El operador tiene el control de esta conversación</strong>
            <span>
              {HANDOFF_REASON[openHandoff.reason] || openHandoff.reason}
              {openHandoff.reasonDetail ? ` · ${openHandoff.reasonDetail}` : ""}
            </span>
          </div>
          <Link href={`/admin/crm/inbox?conversationId=${lead.conversation.id}`}>
            Atender ahora <ArrowUpRight size={17} />
          </Link>
        </section>
      )}

      <div className="crm-detail-grid">
        <div className="crm-detail-main">
          <section className="crm-panel">
            <div className="crm-panel-header">
              <div>
                <span>Contexto de IA</span>
                <h2>Lo que entiende Hermes</h2>
              </div>
              <Bot size={22} className="crm-panel-icon" />
            </div>
            <div className="crm-hermes-summary">
              <div className="crm-summary-main">
                <span>Resumen de conversación</span>
                <p>{state?.summary || "Hermes todavía no ha generado un resumen para esta conversación."}</p>
              </div>
              <div className="crm-summary-facts">
                <Fact icon={Sparkles} label="Intención" value={state?.detectedIntent || "Sin detectar"} />
                <Fact icon={Target} label="Siguiente sugerencia" value={state?.nextSuggestedAction || "Sin sugerencia"} />
                <Fact icon={MessageSquareText} label="Objeción" value={lead.lastObjection || state?.lastObjection || "Ninguna detectada"} />
                <Fact icon={ShieldCheck} label="Riesgos" value={state?.detectedRisks || "Sin riesgos detectados"} />
              </div>
            </div>
          </section>

          <AdvertisingLeadPanel
            lead={lead}
            history={advertisingHistory}
            historyError={advertisingError}
            user={user}
            onRefresh={loadLead}
            onToast={setToast}
          />

          <section className="crm-panel">
            <div className="crm-panel-header">
              <div>
                <span>Seguimiento</span>
                <h2>Tareas y próxima acción</h2>
              </div>
              <CalendarCheck2 size={22} className="crm-panel-icon" />
            </div>
            <form className="crm-next-action-form" onSubmit={handleNextAction}>
              <label htmlFor="next-action">Próxima acción comercial</label>
              <div>
                <input
                  id="next-action"
                  name="nextAction"
                  defaultValue={lead.nextAction || ""}
                  placeholder="Ej. Enviar propuesta el viernes"
                  maxLength={500}
                />
                <button className="crm-button is-primary" disabled={saving}>
                  {saving ? "Guardando…" : "Guardar"}
                </button>
              </div>
            </form>
            {lead.tasks?.length ? (
              <div className="crm-task-list">
                {lead.tasks.map((task) => (
                  <article key={task.id}>
                    <span className={`crm-task-check is-${task.status.toLowerCase()}`}>
                      <CheckCircle2 size={17} />
                    </span>
                    <div>
                      <strong>{task.title}</strong>
                      <span>{task.description || task.type.replaceAll("_", " ")}</span>
                    </div>
                    <time>{task.dueAt ? formatDate(task.dueAt, { withYear: true }) : "Sin fecha"}</time>
                  </article>
                ))}
              </div>
            ) : (
              <div className="crm-inline-empty">No hay tareas registradas para este lead.</div>
            )}
          </section>

          <section className="crm-panel">
            <div className="crm-panel-header">
              <div>
                <span>Trazabilidad</span>
                <h2>Historial de actividad</h2>
              </div>
              <Clock3 size={22} className="crm-panel-icon" />
            </div>
            {lead.auditLogs?.length ? (
              <div className="crm-timeline">
                {lead.auditLogs.map((log) => (
                  <article key={log.id}>
                    <i aria-hidden="true" />
                    <div>
                      <strong>{auditLabel(log.action)}</strong>
                      <span>{log.user?.name || "Hermes / sistema"}</span>
                    </div>
                    <time>{formatDate(log.createdAt, { withYear: true })}</time>
                  </article>
                ))}
              </div>
            ) : (
              <div className="crm-inline-empty">Aún no hay movimientos auditados.</div>
            )}
          </section>
        </div>

        <aside className="crm-detail-aside">
          <section className="crm-panel">
            <div className="crm-panel-header">
              <div><span>Valor comercial</span><h2>Indicadores</h2></div>
            </div>
            <div className="crm-kpi-list">
              <Kpi icon={Target} label="Score" value={`${lead.score || 0}/100`} />
              <Kpi icon={CircleDollarSign} label="Presupuesto" value={money(lead.estimatedBudget)} />
              <Kpi icon={Sparkles} label="Probabilidad" value={percent(lead.closeProbability ?? state?.closeScore)} />
              <Kpi icon={BriefcaseBusiness} label="Interés" value={lead.productOfInterest || "Por definir"} />
            </div>
          </section>

          <section className="crm-panel">
            <div className="crm-panel-header">
              <div><span>Conversación</span><h2>WhatsApp</h2></div>
            </div>
            {lead.conversation ? (
              <>
                <div className="crm-conversation-mini">
                  <span>Estado</span>
                  <strong>{lead.conversation.status === "HANDED_OFF" ? "Control humano" : lead.conversation.status}</strong>
                  <small>Actualizada {formatDate(lead.conversation.updatedAt)}</small>
                </div>
                <Link
                  href={`/admin/crm/inbox?conversationId=${lead.conversation.id}`}
                  className="crm-button is-primary is-full"
                >
                  <MessageSquareText size={17} />Abrir conversación
                </Link>
              </>
            ) : (
              <div className="crm-inline-empty">Este lead no tiene una conversación vinculada.</div>
            )}
          </section>

          {lead.conversation?.handoffs?.length > 0 && (
            <section className="crm-panel">
              <div className="crm-panel-header">
                <div><span>Atención humana</span><h2>Handoffs</h2></div>
              </div>
              <div className="crm-handoff-history">
                {lead.conversation.handoffs.map((handoff) => (
                  <article key={handoff.id}>
                    <strong>{HANDOFF_STATUS[handoff.status] || handoff.status}</strong>
                    <span>{HANDOFF_REASON[handoff.reason] || handoff.reason}</span>
                    <time>{formatDate(handoff.createdAt, { withYear: true })}</time>
                  </article>
                ))}
              </div>
            </section>
          )}
        </aside>
      </div>

      <Toast
        message={toast?.message}
        tone={toast?.tone}
        onDismiss={() => setToast(null)}
      />
    </>
  );
}

function Fact({ icon: Icon, label, value }) {
  return (
    <div><Icon size={17} /><span>{label}</span><strong>{value}</strong></div>
  );
}

function Kpi({ icon: Icon, label, value }) {
  return (
    <div><span><Icon size={17} />{label}</span><strong>{value}</strong></div>
  );
}

function AdvertisingLeadPanel({ lead, history, historyError, user, onRefresh, onToast }) {
  const [saving, setSaving] = useState(false);
  const [eventType, setEventType] = useState("MEETING_CONFIRMED");
  const attribution = history.find((item) => item.attribution)?.attribution || null;
  const touch = attribution?.touch || history.find((item) => item.touch)?.touch || null;
  const clickId = touch?.gclid || touch?.gbraid || touch?.wbraid || null;
  const clickType = touch?.gclid ? "GCLID" : touch?.gbraid ? "GBRAID" : touch?.wbraid ? "WBRAID" : null;
  const isAdmin = user?.role === "ADMIN";

  const submitEvent = async (event) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const occurredAt = String(form.get("occurredAt") || "");
    const value = String(form.get("value") || "");
    const revenueReceived = String(form.get("revenueReceived") || "");
    const commercialReference = String(form.get("commercialReference") || "").trim();
    const serviceRequested = String(form.get("serviceRequested") || "").trim();
    const payload = {
      eventType,
      ...(occurredAt ? { occurredAt: new Date(occurredAt).toISOString() } : {}),
      ...(value ? { value: Number(value) } : {}),
      ...(revenueReceived ? { revenueReceived: Number(revenueReceived) } : {}),
      ...((value || eventType === "CONTRACT_WON") ? { currency: String(form.get("currency") || "EUR") } : {}),
      ...(commercialReference ? { commercialReference } : {}),
      ...(serviceRequested ? { serviceRequested } : {}),
    };

    setSaving(true);
    try {
      await hermesApi.recordAdvertisingEvent(lead.id, payload);
      onToast({ tone: "success", message: "Hito comercial registrado y auditado." });
      await onRefresh();
      formElement.reset();
      setEventType("MEETING_CONFIRMED");
    } catch (requestError) {
      onToast({
        tone: "error",
        message: apiErrorMessage(requestError, "No se pudo registrar el hito comercial."),
      });
    } finally {
      setSaving(false);
    }
  };

  const revokeConsent = async () => {
    const reason = window.prompt("Motivo de la revocación de consentimiento:");
    if (!reason?.trim()) return;
    if (!window.confirm("Se cancelarán exportaciones pendientes para este contacto. ¿Continuar?")) return;
    setSaving(true);
    try {
      await hermesApi.revokeAdvertisingConsent(lead.contactId, reason.trim());
      onToast({ tone: "success", message: "Consentimiento publicitario revocado." });
      await onRefresh();
    } catch (requestError) {
      onToast({ tone: "error", message: apiErrorMessage(requestError, "No se pudo revocar el consentimiento.") });
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="crm-panel crm-lead-advertising">
      <div className="crm-panel-header">
        <div><span>Publicidad</span><h2>Atribución e hitos verificables</h2></div>
        <Megaphone size={22} className="crm-panel-icon" />
      </div>

      {historyError ? (
        <div className="crm-feedback is-error">{historyError}</div>
      ) : (
        <div className="crm-attribution-summary">
          <div><span>Atribución</span><strong>{attribution?.status || "Sin atribución confirmada"}</strong></div>
          <div><span>Identificador</span><strong>{clickId ? `${clickType} · ${maskIdentifier(clickId)}` : "No disponible"}</strong></div>
          <div><span>Consentimiento Ads</span><strong>{touch?.adUserData || "No disponible"}</strong></div>
          <div><span>Referencia</span><strong>{touch?.referenceLast4 ? `UC-••••${touch.referenceLast4}` : "No disponible"}</strong></div>
        </div>
      )}

      <p className="crm-advertising-help">
        Cambiar la etapa a “Calificado” genera LEAD_QUALIFIED mediante las reglas de Hermes. El formulario registra únicamente hitos que requieren verificación del operador.
      </p>

      <form className="crm-commercial-event-form" onSubmit={submitEvent}>
        <label>
          <span>Hito comercial</span>
          <select value={eventType} onChange={(event) => setEventType(event.target.value)}>
            <option value="MEETING_CONFIRMED">Reunión confirmada</option>
            <option value="PROPOSAL_SENT">Propuesta enviada</option>
            <option value="CONTRACT_WON">Contrato ganado</option>
            <option value="CONTRACT_LOST">Contrato perdido</option>
          </select>
        </label>
        <label>
          <span>Fecha y hora</span>
          <input name="occurredAt" type="datetime-local" />
        </label>
        <label>
          <span>Servicio solicitado</span>
          <input name="serviceRequested" maxLength={300} placeholder="Ej. Software a medida" />
        </label>
        {!["MEETING_CONFIRMED", "CONTRACT_LOST"].includes(eventType) && (
          <label>
            <span>{eventType === "CONTRACT_WON" ? "Importe contratado" : "Valor de propuesta"}</span>
            <input name="value" type="number" min="0" step="0.01" required={eventType === "CONTRACT_WON"} />
          </label>
        )}
        {eventType === "CONTRACT_WON" && (
          <label>
            <span>Ingresos recibidos</span>
            <input name="revenueReceived" type="number" min="0" step="0.01" />
          </label>
        )}
        {!["MEETING_CONFIRMED", "CONTRACT_LOST"].includes(eventType) && (
          <label>
            <span>Moneda</span>
            <select name="currency" defaultValue="EUR"><option value="EUR">EUR</option><option value="USD">USD</option></select>
          </label>
        )}
        {["CONTRACT_WON", "CONTRACT_LOST"].includes(eventType) && (
          <label className="is-wide">
            <span>{eventType === "CONTRACT_WON" ? "Referencia verificable del contrato" : "Motivo o referencia de pérdida"}</span>
            <input name="commercialReference" maxLength={200} required={eventType === "CONTRACT_WON"} />
          </label>
        )}
        <div className="crm-commercial-event-actions">
          {isAdmin && attribution && (
            <button type="button" className="crm-button is-danger" onClick={revokeConsent} disabled={saving}>
              Revocar consentimiento
            </button>
          )}
          <button className="crm-button is-primary" disabled={saving}>
            {saving ? "Guardando…" : "Registrar hito"}
          </button>
        </div>
      </form>

      <div className="crm-conversion-history">
        {history.length === 0 ? (
          <div className="crm-inline-empty">No hay hitos publicitarios vinculados a este lead.</div>
        ) : history.map((item) => (
          <article key={item.id}>
            <i className={`is-${String(item.syncJob?.status || (item.verified ? "VERIFIED" : "PENDING")).toLowerCase()}`} />
            <div>
              <strong>{advertisingEventLabel(item.eventType)}</strong>
              <span>{item.source || "Hermes"}{item.syncJob?.validateOnly ? " · validateOnly" : ""}</span>
            </div>
            <div>
              <strong>{item.syncJob?.status || (item.verified ? "VERIFIED" : "PENDING")}</strong>
              <time>{formatDate(item.occurredAt, { withYear: true })}</time>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function maskIdentifier(value) {
  if (!value) return "";
  if (value.length <= 8) return "••••";
  return `${value.slice(0, 4)}••••${value.slice(-4)}`;
}

function advertisingEventLabel(type) {
  const labels = {
    WHATSAPP_CLICK: "Clic en WhatsApp",
    CONVERSATION_STARTED: "Conversación iniciada",
    LEAD_QUALIFIED: "Lead cualificado",
    MEETING_CONFIRMED: "Reunión confirmada",
    PROPOSAL_SENT: "Propuesta enviada",
    CONTRACT_WON: "Contrato ganado",
    CONTRACT_LOST: "Contrato perdido",
  };
  return labels[type] || type;
}

function auditLabel(action) {
  const labels = {
    LEAD_STAGE_CHANGED: "Etapa actualizada",
    LEAD_UPDATED: "Información actualizada",
    HANDOFF_CREATED: "Handoff solicitado",
    HUMAN_MESSAGE_SENT: "Mensaje humano enviado",
  };
  return labels[action] || action.replaceAll("_", " ").toLowerCase();
}
