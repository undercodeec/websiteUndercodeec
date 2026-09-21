const CATEGORY_LABELS = {
  POLICY_VIOLATION: "Política comercial",
  PROVIDER_ERROR: "Error del proveedor",
  INVALID_PROVIDER_RESPONSE: "Respuesta inválida del proveedor",
  OUTPUT_BLOCKED: "Respuesta bloqueada",
  CONTEXT_ERROR: "Error de contexto",
};

const TASK_STATUS_LABELS = {
  PENDING: "Pendiente",
  IN_PROGRESS: "En curso",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
};

export function presentHermesIncident(incident, reviewTask) {
  if (!incident || typeof incident !== "object") return null;

  const attempts = Number.isFinite(incident.attempts) ? incident.attempts : 0;
  const needsReview = Boolean(incident.requiresHumanReview);
  const recovered = Boolean(incident.recovered);

  return {
    categoryLabel: CATEGORY_LABELS[incident.category] || "Incidencia de Hermes",
    code: typeof incident.code === "string" ? incident.code : "",
    summary:
      typeof incident.summary === "string"
        ? incident.summary
        : "Hermes registró una incidencia sin resumen disponible.",
    attemptsLabel: `${attempts} ${attempts === 1 ? "intento" : "intentos"}`,
    occurredAt:
      typeof incident.occurredAt === "string" ? incident.occurredAt : "",
    tone: needsReview ? "review" : recovered ? "recovered" : "warning",
    statusLabel: needsReview
      ? "Revisión humana pendiente"
      : recovered
        ? "Recuperada automáticamente"
        : "Incidencia registrada",
    taskLabel: reviewTask?.title
      ? `${reviewTask.title} · ${TASK_STATUS_LABELS[reviewTask.status] || reviewTask.status || "Sin estado"}`
      : null,
  };
}
