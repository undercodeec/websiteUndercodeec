import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { canMoveLeadStage } from "../src/lib/hermes/lead-stage-transitions.mjs";
import {
  correctionPayload,
  correctionTargets,
  correctionWarning,
} from "../src/lib/hermes/lead-stage-correction.mjs";

test("only ADMIN can correct QUALIFIED to CONTACTED outside the normal stage selector", () => {
  assert.deepEqual(correctionTargets("QUALIFIED", "ADMIN"), ["CONTACTED"]);
  assert.deepEqual(correctionTargets("QUALIFIED", "SALES_AGENT"), []);
  assert.deepEqual(correctionTargets("CONTACTED", "ADMIN"), []);
  assert.equal(canMoveLeadStage({ stage: "QUALIFIED" }, "CONTACTED"), false);
  assert.equal(canMoveLeadStage({ stage: "CONTACTED" }, "QUALIFIED"), true);
});

test("correction payload keeps the logical request key across retries", () => {
  const input = {
    targetStage: "CONTACTED",
    expectedCurrentStage: "QUALIFIED",
    reasonCode: "TEST_CORRECTION",
    reason: "  Prueba de Pipeline  ",
    requestKey: "6d215b6f-8338-4f3c-9899-1defed0875a5",
  };
  assert.deepEqual(correctionPayload(input), correctionPayload(input));
  assert.equal(correctionPayload(input).reason, "Prueba de Pipeline");
  assert.equal(correctionPayload(input).requestKey, input.requestKey);
});

test("external advertising outcomes receive an administrative warning", () => {
  assert.match(correctionWarning("EXTERNAL_RECONCILIATION_REQUIRED"), /conciliación/);
  assert.match(correctionWarning("AMBIGUOUS"), /ambiguo/);
  assert.equal(correctionWarning("PENDING_CANCELLED"), "");
});

test("lead detail wires a distinct audited modal, refresh, and conflict response", () => {
  const page = readFileSync(new URL("../src/app/admin/crm/leads/[id]/page.jsx", import.meta.url), "utf8");
  assert.match(page, /correctionTargets\(lead\.stage, user\?\.role\)\.length > 0/);
  assert.match(page, /Corregir etapa/);
  assert.match(page, /No es una transición comercial normal/);
  assert.match(page, /minLength=\{8\} maxLength=\{500\} required/);
  assert.match(page, /hermesApi\.correctLeadStage\(id, correctionPayload/);
  assert.match(page, /setCorrectionRequestKey\(crypto\.randomUUID\(\)\)/);
  assert.match(page, /await loadLead\(\)/);
  assert.match(page, /requestError\?\.status === 409/);
  assert.match(page, /correctionWarning\(result\.advertisingReconciliation\)/);
});
