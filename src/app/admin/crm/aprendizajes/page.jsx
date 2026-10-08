"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { hermesApi } from "@/lib/hermes/api";
import { useCrmSession } from "../_components/CrmSession";
import { EmptyState, ErrorState, LoadingState, PageHeader } from "../_components/Ui";

export default function AprendizajesPage() {
  const { user } = useCrmSession();
  const [items, setItems] = useState([]);
  const [state, setState] = useState("loading");
  const [error, setError] = useState("");
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

  if (user?.role !== "ADMIN") {
    return <EmptyState title="Acceso restringido" description="Esta vista está disponible para administradores." />;
  }

  return (
    <section className="crm-learning-page">
      <PageHeader
        eyebrow="Revisión de calidad"
        title="Candidatos de aprendizaje"
        description="Pautas propuestas por el revisor. Ninguna se aplica a respuestas de Hermes en esta fase."
        actions={<button className="crm-button is-secondary" type="button" onClick={load}>Actualizar</button>}
      />
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
                <span className="crm-status">Propuesto</span>
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
              </dl>
              {item.evidence?.[0]?.conversationId ? (
                <Link className="crm-button is-secondary" href={`/admin/crm/inbox?conversationId=${encodeURIComponent(item.evidence[0].conversationId)}`}>
                  Ver conversación de origen
                </Link>
              ) : null}
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
