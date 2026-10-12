import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { canMoveLeadStage } from "../src/lib/hermes/lead-stage-transitions.mjs";
import {
  correctionPayload,
  correctionTargets,
  correctionWarning,
  runLeadStageCorrection,
} from "../src/lib/hermes/lead-stage-correction.mjs";

test("ADMIN alone can correct QUALIFIED to CONTACTED; drag/drop cannot", () => {
  assert.deepEqual(correctionTargets("QUALIFIED", "ADMIN"), ["CONTACTED"]);
  assert.deepEqual(correctionTargets("QUALIFIED", "SALES_AGENT"), []);
  assert.deepEqual(correctionTargets("CONTACTED", "ADMIN"), []);
  assert.equal(canMoveLeadStage({ stage: "QUALIFIED" }, "CONTACTED"), false);
  assert.equal(canMoveLeadStage({ stage: "CONTACTED" }, "QUALIFIED"), true);
});

test("correction payload and advertising warning follow the existing contract", () => {
  const input = {
    targetStage: "CONTACTED", expectedCurrentStage: "QUALIFIED",
    reasonCode: "TEST_CORRECTION", reason: "  Motivo sintético  ",
    requestKey: "synthetic-request-key",
  };
  assert.deepEqual(correctionPayload(input), {
    ...input, reason: "Motivo sintético",
  });
  assert.match(correctionWarning("EXTERNAL_RECONCILIATION_REQUIRED"), /conciliación/);
  assert.match(correctionWarning("AMBIGUOUS"), /ambiguo/);
  assert.equal(correctionWarning("PENDING_CANCELLED"), "");
});

test("Pipeline card action and lead detail reuse the same validated modal", () => {
  const pipeline = readFileSync(new URL("../src/app/admin/crm/leads/page.jsx", import.meta.url), "utf8");
  const detail = readFileSync(new URL("../src/app/admin/crm/leads/[id]/page.jsx", import.meta.url), "utf8");
  const modal = readFileSync(new URL("../src/app/admin/crm/leads/_components/LeadStageCorrectionModal.jsx", import.meta.url), "utf8");
  assert.match(pipeline, /const canCorrect = correctionTargets\(lead\.stage, role\)\.length > 0/);
  assert.match(pipeline, /\{role === "ADMIN" && !updating && \(/);
  assert.match(pipeline, /disabled=\{!canCorrect\}/);
  assert.match(pipeline, /<summary aria-label=\{\x60Acciones de/);
  assert.match(pipeline, /Corregir etapa/);
  assert.match(pipeline, /onCorrect=\{\(\) => setCorrectionLead\(lead\)\}/);
  assert.match(pipeline, /<LeadStageCorrectionModal/);
  assert.match(detail, /correctionTargets\(lead\.stage, user\?\.role\)\.length > 0/);
  assert.match(detail, /<LeadStageCorrectionModal/);
  assert.match(modal, /runLeadStageCorrection/);
  assert.match(modal, /contactName\(lead\.contact\)/);
  assert.match(modal, /No es una transición comercial normal/);
  assert.match(modal, /minLength=\{8\} maxLength=\{500\} required/);
  assert.match(modal, /reason\.trim\(\)\.length < 8/);
  assert.match(modal, /setRequestKey\(crypto\.randomUUID\(\)\)/);
  assert.match(modal, /correctStage: hermesApi\.correctLeadStage/);
  assert.match(pipeline, /canMoveLeadStage\(draggedLead, stage\)/);
  assert.doesNotMatch(pipeline, /onDrop=\{[^]*?correctLeadStage/);
});

test("201 correction refreshes Pipeline only after backend confirmation", async () => {
  const lead = { id: "synthetic-lead", stage: "QUALIFIED" };
  let serverStage = "QUALIFIED";
  let visibleStage = "QUALIFIED";
  let resolveRequest;
  const request = new Promise((resolve) => { resolveRequest = resolve; });
  const events = [];
  const operation = runLeadStageCorrection({
    lead, targetStage: "CONTACTED", reasonCode: "DATA_ENTRY_ERROR",
    reason: "Etapa incorrecta", requestKey: "synthetic-key",
  }, {
    correctStage: async (id, payload) => {
      assert.equal(id, lead.id);
      assert.deepEqual(payload, {
        targetStage: "CONTACTED", expectedCurrentStage: "QUALIFIED",
        reasonCode: "DATA_ENTRY_ERROR", reason: "Etapa incorrecta", requestKey: "synthetic-key",
      });
      events.push("request");
      await request;
      serverStage = "CONTACTED";
      return { advertisingReconciliation: "PENDING_CANCELLED" };
    },
    onClose: () => events.push("close"),
    onRefresh: async () => { events.push("refresh"); visibleStage = serverStage; },
    onToast: (toast) => {
      events.push("toast");
      assert.match(toast.message, /QUALIFIED a CONTACTED/);
      assert.match(toast.message, /evento publicitario pendiente fue neutralizado/);
    },
    errorMessage: () => "network error",
  });
  assert.equal(visibleStage, "QUALIFIED");
  assert.deepEqual(events, ["request"]);
  resolveRequest();
  const outcome = await operation;
  assert.equal(outcome.status, "success");
  assert.equal(visibleStage, "CONTACTED");
  assert.deepEqual(events, ["request", "close", "refresh", "toast"]);
});

test("409 closes, explains conflict, and refreshes without retry", async () => {
  let requests = 0;
  let refreshes = 0;
  let closed = false;
  let toast;
  const outcome = await runLeadStageCorrection({
    lead: { id: "synthetic-lead", stage: "QUALIFIED" }, targetStage: "CONTACTED",
    reasonCode: "OTHER", reason: "Motivo válido", requestKey: "synthetic-key",
  }, {
    correctStage: async () => { requests++; throw { status: 409 }; },
    onClose: () => { closed = true; },
    onRefresh: async () => { refreshes++; },
    onToast: (value) => { toast = value; },
    errorMessage: () => "network error",
  });
  assert.equal(outcome.status, "conflict");
  assert.equal(requests, 1);
  assert.equal(refreshes, 1);
  assert.equal(closed, true);
  assert.equal(toast.tone, "error");
  assert.match(toast.message, /La etapa del lead cambió/);
});

test("network retry preserves requestKey and external warning is shown", async () => {
  const keys = [];
  const toasts = [];
  const input = {
    lead: { id: "synthetic-lead", stage: "QUALIFIED" }, targetStage: "CONTACTED",
    reasonCode: "OTHER", reason: "Motivo válido", requestKey: "synthetic-key",
  };
  const dependencies = {
    correctStage: async (_id, payload) => {
      keys.push(payload.requestKey);
      if (keys.length === 1) throw new Error("Network lost");
      return { advertisingReconciliation: "EXTERNAL_RECONCILIATION_REQUIRED" };
    },
    onClose: () => {},
    onRefresh: async () => {},
    onToast: (toast) => toasts.push(toast),
    errorMessage: () => "Error de red",
  };
  assert.equal((await runLeadStageCorrection(input, dependencies)).status, "error");
  assert.equal((await runLeadStageCorrection(input, dependencies)).status, "success");
  assert.deepEqual(keys, ["synthetic-key", "synthetic-key"]);
  assert.equal(toasts[0].tone, "error");
  assert.equal(toasts[1].tone, "warning");
  assert.match(toasts[1].message, /conciliación administrativa/);
});
