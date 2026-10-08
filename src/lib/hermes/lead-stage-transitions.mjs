// Keep normal CRM moves aligned with ALLOWED_STAGE_TRANSITIONS in Hermes LeadsService.
const NORMAL_TRANSITIONS = {
  NEW: ["CONTACTED", "QUALIFIED", "LOST"],
  CONTACTED: ["QUALIFIED", "LOST"],
  QUALIFIED: ["PROPOSAL", "NEGOTIATION", "PAYMENT_PENDING", "LOST"],
  PROPOSAL: ["NEGOTIATION", "PAYMENT_PENDING", "WON", "LOST"],
  NEGOTIATION: ["PROPOSAL", "PAYMENT_PENDING", "WON", "LOST"],
  PAYMENT_PENDING: ["NEGOTIATION", "LOST"],
};

const ACTIVE_TRANSFER_STATUSES = new Set([
  "INSTRUCTIONS_PREPARED",
  "INSTRUCTIONS_SENT",
  "PROOF_RECEIVED",
  "UNDER_REVIEW",
]);

export function canMoveLeadStage(lead, nextStage, transfer) {
  if (!lead || !NORMAL_TRANSITIONS[lead.stage]?.includes(nextStage)) return false;
  // Payment initiation and review have their own Inbox/WhatsApp workflows.
  if (nextStage === "PAYMENT_PENDING" || nextStage === "PAYMENT_REVIEW") return false;
  if (nextStage !== "WON") return true;
  return transfer !== undefined &&
    Number(lead.contractedAmount) > 0 &&
    /^[A-Z]{3}$/.test(lead.commercialCurrency || "") &&
    Boolean(lead.contractReference?.trim()) &&
    !ACTIVE_TRANSFER_STATUSES.has(transfer?.status);
}
