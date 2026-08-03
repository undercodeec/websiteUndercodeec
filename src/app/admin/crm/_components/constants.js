export const LEAD_STAGES = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "PROPOSAL",
  "NEGOTIATION",
  "WON",
  "LOST",
];

export const STAGE_META = {
  NEW: { label: "Nuevos", short: "Nuevo", tone: "sky" },
  CONTACTED: { label: "Contactados", short: "Contactado", tone: "blue" },
  QUALIFIED: { label: "Calificados", short: "Calificado", tone: "violet" },
  PROPOSAL: { label: "Propuesta", short: "Propuesta", tone: "amber" },
  NEGOTIATION: { label: "Negociación", short: "Negociación", tone: "orange" },
  WON: { label: "Ganados", short: "Ganado", tone: "green" },
  LOST: { label: "Perdidos", short: "Perdido", tone: "red" },
};

export const CONVERSATION_STATUS = {
  ACTIVE: "Hermes activo",
  PAUSED: "Pausada",
  HANDED_OFF: "Control humano",
  CLOSED: "Cerrada",
};

export const OPEN_HANDOFF_STATUSES = [
  "PENDING",
  "ASSIGNED",
  "IN_PROGRESS",
];

export const HANDOFF_STATUS = {
  PENDING: "Pendiente",
  ASSIGNED: "Asignado",
  IN_PROGRESS: "En atención",
  RESOLVED: "Resuelto",
  CANCELLED: "Cancelado",
};

export const HANDOFF_REASON = {
  SPECIAL_DISCOUNT: "Descuento especial",
  COMPLAINT: "Reclamo",
  COMPLEX_QUOTE: "Cotización compleja",
  B2B_NEGOTIATION: "Negociación B2B",
  FRUSTRATED_USER: "Usuario frustrado",
  REPEATED_NO_PROGRESS: "Sin progreso",
  INFO_ERROR: "Error de información",
  PAYMENT_ISSUE: "Problema de pago",
  CUSTOM: "Atención solicitada",
};

export const SENDER_META = {
  CONTACT: { label: "Cliente", className: "contact" },
  HERMES: { label: "Hermes", className: "hermes" },
  HUMAN: { label: "Operador", className: "human" },
  SYSTEM: { label: "Sistema", className: "system" },
};

export function activeHandoff(conversation) {
  return conversation?.handoffs?.find((handoff) =>
    OPEN_HANDOFF_STATUSES.includes(handoff.status),
  );
}
