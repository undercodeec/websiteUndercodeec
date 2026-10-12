// Keep this narrow list aligned with CORRECTION_SAFE_TRANSITIONS in LeadsService.
export const CORRECTION_SAFE_TRANSITIONS = Object.freeze({
  QUALIFIED: Object.freeze(["CONTACTED"]),
});

export const CORRECTION_REASONS = Object.freeze({
  TEST_CORRECTION: "Corrección de prueba",
  DATA_ENTRY_ERROR: "Error de registro",
  BUSINESS_REASSESSMENT: "Reevaluación comercial",
  OTHER: "Otro motivo",
});

export function correctionTargets(stage, role) {
  return role === "ADMIN" ? CORRECTION_SAFE_TRANSITIONS[stage] || [] : [];
}

export function correctionPayload({ targetStage, expectedCurrentStage, reasonCode, reason, requestKey }) {
  return { targetStage, expectedCurrentStage, reasonCode, reason: reason.trim(), requestKey };
}

export function correctionWarning(reconciliation) {
  if (reconciliation === "EXTERNAL_RECONCILIATION_REQUIRED") {
    return "El hito publicitario pudo tener efecto externo. Requiere conciliación administrativa.";
  }
  if (reconciliation === "AMBIGUOUS") {
    return "El resultado publicitario es ambiguo. Revise el job antes de cualquier reintento.";
  }
  return "";
}
