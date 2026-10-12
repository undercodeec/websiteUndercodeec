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

export async function runLeadStageCorrection({ lead, targetStage, reasonCode, reason, requestKey }, {
  correctStage,
  onClose,
  onRefresh,
  onToast,
  errorMessage,
}) {
  let result;
  try {
    result = await correctStage(lead.id, correctionPayload({
      targetStage,
      expectedCurrentStage: lead.stage,
      reasonCode,
      reason,
      requestKey,
    }));
  } catch (error) {
    if (error?.status === 409) {
      onClose();
      await onRefresh();
      onToast({
        tone: "error",
        message: "La etapa del lead cambió o existe un conflicto publicitario. Actualiza los datos antes de intentar corregirla.",
      });
      return { status: "conflict" };
    }
    onToast({
      tone: "error",
      message: errorMessage(error, "No se pudo corregir la etapa. Puede reintentar con la misma solicitud."),
    });
    return { status: "error" };
  }

  onClose();
  await onRefresh();
  const warning = correctionWarning(result?.advertisingReconciliation);
  const pendingCancelled = result?.advertisingReconciliation === "PENDING_CANCELLED"
    ? " El evento publicitario pendiente fue neutralizado."
    : "";
  onToast({
    tone: warning ? "warning" : "success",
    message: `Etapa corregida de ${lead.stage} a ${targetStage}. La corrección quedó auditada.${pendingCancelled}${warning ? ` ${warning}` : ""}`,
  });
  return { status: "success", result };
}
