"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { hermesApi } from "@/lib/hermes/api";
import { useCrmSession } from "../_components/CrmSession";
import { EmptyState, ErrorState, LoadingState, PageHeader, Toast } from "../_components/Ui";

const statusText = { PROPOSED: "Propuesto", ACTIVE: "Aprobado (sin uso)", REJECTED: "Rechazado", RETIRED: "Retirado" };

export default function AprendizajesPage() {
  const { user } = useCrmSession();
  const [items, setItems] = useState([]);
  const [state, setState] = useState("loading");
  const [error, setError] = useState("");
  const [drafts, setDrafts] = useState({});
  const [busyId, setBusyId] = useState("");
  const [notice, setNotice] = useState("");
  const [noticeTone, setNoticeTone] = useState("success");
  const load = useCallback(async () => {
    setState("loading");
    try {
      const result = await hermesApi.learningCandidates();
      setItems(Array.isArray(result) ? result : []);
      setState("ready");
    } catch (cause) {
      setError(cause?.message || "No se pudieron cargar los candidatos.");
      setState("error");
    }
  }, []);

  useEffect(() => {
    if (user?.role !== "ADMIN") return undefined;
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [user?.role, load]);

  const updateDraft = (id, field, value) => {
    setDrafts((current) => ({ ...current, [id]: { ...current[id], [field]: value } }));
  };

  const decide = async (item, action) => {
    const draft = drafts[item.id] || {};
    if (!draft.reason?.trim() || draft.reason.trim().length < 10) {
      setNoticeTone("error");
      setNotice("Escribe un motivo de al menos 10 caracteres.");
      return;
    }
    if (action === "APPROVE" && !draft.validUntil) {
      setNoticeTone("error");
      setNotice("Selecciona la fecha de vencimiento antes de aprobar.");
      return;
    }
    setBusyId(item.id);
    try {
      await hermesApi.decideLearningCandidate(item.id, {
        action,
        reason: draft.reason.trim(),
        ...(action === "APPROVE" ? { validUntil: new Date(`${draft.validUntil}T23:59:59.000Z`).toISOString() } : {}),
      });
      setNoticeTone("success");
      setNotice(action === "APPROVE" ? "Pauta aprobada. La recuperación para respuestas sigue desactivada." : action === "RETIRE" ? "Pauta retirada." : "Candidato rechazado.");
      setDrafts((current) => ({ ...current, [item.id]: {} }));
      await load();
    } catch (cause) {
      setNoticeTone("error");
      setNotice(cause?.message || "No se pudo guardar la decisión.");
    } finally {
      setBusyId("");
    }
  };

  if (user?.role !== "ADMIN") {
    return <EmptyState title="Acceso restringido" description="Esta vista está disponible para administradores." />;
  }

  return (
    <section className="crm-learning-page">
      <PageHeader
        eyebrow="Revisión de calidad"
        title="Candidatos de aprendizaje"
        description="Revisa la evidencia y registra una decisión. Las pautas aprobadas aún no se incluyen en respuestas de Hermes."
        actions={<button className="crm-button is-secondary" type="button" onClick={load}>Actualizar</button>}
      />
      <Toast message={notice} tone={noticeTone} onDismiss={() => setNotice("")} />
      {state === "loading" ? <LoadingState label="Cargando candidatos…" /> : null}
      {state === "error" ? <ErrorState message={error} onRetry={load} /> : null}
      {state === "ready" && items.length === 0 ? (
        <EmptyState title="Sin candidatos" description="Aún no hay revisiones que propongan una pauta generalizable." />
      ) : null}
      {state === "ready" && items.length > 0 ? (
        <div className="crm-learning-grid">
          {items.map((item) => (
            <article className="crm-learning-card" key={item.id}>
              <div className="crm-learning-card-top">
                <span className="crm-eyebrow">{item.kind} · versión {item.version}</span>
                <span className="crm-status">{statusText[item.status] || item.status}</span>
              </div>
              <h2>{item.trigger}</h2>
              <p>{item.guidance}</p>
              <dl>
                <div><dt>Motivo</dt><dd>{item.sourceReview?.issueCode || "Sin código"}</dd></div>
                <div><dt>Resumen</dt><dd>{item.sourceReview?.summary || "Sin resumen"}</dd></div>
                <div><dt>Límite de evidencia</dt><dd>{item.sourceReview?.counterexample || "No registrado"}</dd></div>
                <div><dt>Conversaciones con evidencia</dt><dd>{item._count?.evidence || 0}</dd></div>
                <div><dt>Alcance</dt><dd>{[item.serviceCode, item.market].filter(Boolean).join(" · ") || "General"}</dd></div>
                <div><dt>Riesgo</dt><dd>{item.riskLevel === "NEEDS_REVIEW" ? "Requiere revisión" : item.riskLevel}</dd></div>
                {item.validUntil ? <div><dt>Vence</dt><dd>{new Date(item.validUntil).toLocaleDateString("es-EC")}</dd></div> : null}
              </dl>
              {item.evidence?.[0]?.conversationId ? (
                <Link className="crm-button is-secondary" href={`/admin/crm/inbox?conversationId=${encodeURIComponent(item.evidence[0].conversationId)}`}>
                  Ver conversación de origen
                </Link>
              ) : null}
              {(item.status === "PROPOSED" || item.status === "ACTIVE") ? (
                <div className="crm-learning-decision">
                  <label htmlFor={`reason-${item.id}`}>Motivo de la decisión</label>
                  <textarea id={`reason-${item.id}`} maxLength={500} rows={3} value={drafts[item.id]?.reason || ""} onChange={(event) => updateDraft(item.id, "reason", event.target.value)} placeholder="Fundamento verificable, alcance y posibles límites" />
                  {item.status === "PROPOSED" ? (
                    <>
                      <label htmlFor={`until-${item.id}`}>Vencimiento si se aprueba</label>
                      <input id={`until-${item.id}`} type="date" value={drafts[item.id]?.validUntil || ""} onChange={(event) => updateDraft(item.id, "validUntil", event.target.value)} />
                      <div className="crm-learning-actions">
                        <button className="crm-button is-primary" type="button" disabled={busyId === item.id || !item._count?.evidence} onClick={() => void decide(item, "APPROVE")}>Aprobar</button>
                        <button className="crm-button is-secondary" type="button" disabled={busyId === item.id} onClick={() => void decide(item, "REJECT")}>Rechazar</button>
                      </div>
                    </>
                  ) : (
                    <button className="crm-button is-danger" type="button" disabled={busyId === item.id} onClick={() => void decide(item, "RETIRE")}>Retirar pauta</button>
                  )}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
