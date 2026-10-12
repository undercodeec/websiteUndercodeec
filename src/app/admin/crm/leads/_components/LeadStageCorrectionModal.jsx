"use client";

import { useId, useState } from "react";
import { hermesApi } from "@/lib/hermes/api";
import {
  CORRECTION_REASONS,
  correctionTargets,
  runLeadStageCorrection,
} from "@/lib/hermes/lead-stage-correction.mjs";
import { STAGE_META } from "../../_components/constants";
import { apiErrorMessage, contactName } from "../../_components/format";

export default function LeadStageCorrectionModal({ lead, role, onClose, onRefresh, onToast }) {
  const titleId = useId();
  const targets = correctionTargets(lead.stage, role);
  const [targetStage, setTargetStage] = useState(targets[0] || "");
  const [reasonCode, setReasonCode] = useState("TEST_CORRECTION");
  const [reason, setReason] = useState("");
  const [requestKey, setRequestKey] = useState(() => crypto.randomUUID());
  const [saving, setSaving] = useState(false);

  const newAttempt = (setter, value) => {
    setter(value);
    setRequestKey(crypto.randomUUID());
  };

  const submit = async (event) => {
    event.preventDefault();
    if (saving || !targets.includes(targetStage) || reason.trim().length < 8) return;

    setSaving(true);
    try {
      await runLeadStageCorrection({
        lead,
        targetStage,
        reasonCode,
        reason,
        requestKey,
      }, {
        correctStage: hermesApi.correctLeadStage,
        onClose,
        onRefresh,
        onToast,
        errorMessage: apiErrorMessage,
      });
    } finally {
      setSaving(false);
    }
  };

  if (targets.length === 0) return null;

  return (
    <div className="crm-modal-backdrop" role="presentation">
      <div className="crm-modal" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <header>
          <h2 id={titleId}>Corregir etapa</h2>
          <button type="button" className="crm-icon-button" onClick={onClose} disabled={saving} aria-label="Cerrar corrección">×</button>
        </header>
        <form className="crm-stage-correction-form" onSubmit={submit}>
          <p className="crm-stage-correction-lead">Lead: <strong>{contactName(lead.contact)}</strong></p>
          <p className="crm-stage-correction-note">Esta acción corrige una etapa registrada previamente. No es una transición comercial normal y quedará auditada.</p>
          <label>Etapa actual<input value={STAGE_META[lead.stage]?.short || lead.stage} readOnly /></label>
          <label>Etapa corregida
            <select value={targetStage} onChange={(event) => newAttempt(setTargetStage, event.target.value)}>
              {targets.map((stage) => (
                <option key={stage} value={stage}>{STAGE_META[stage]?.short || stage}</option>
              ))}
            </select>
          </label>
          <label>Tipo de corrección
            <select value={reasonCode} onChange={(event) => newAttempt(setReasonCode, event.target.value)}>
              {Object.entries(CORRECTION_REASONS).map(([code, label]) => <option key={code} value={code}>{label}</option>)}
            </select>
          </label>
          <label>Motivo interno
            <textarea value={reason} onChange={(event) => newAttempt(setReason, event.target.value)} minLength={8} maxLength={500} required placeholder="Explique por qué la etapa anterior era incorrecta" />
          </label>
          <footer>
            <button type="button" className="crm-button is-secondary" onClick={onClose} disabled={saving}>Cancelar</button>
            <button type="submit" className="crm-button is-primary" disabled={saving || reason.trim().length < 8}>
              {saving ? "Corrigiendo…" : "Confirmar corrección"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
