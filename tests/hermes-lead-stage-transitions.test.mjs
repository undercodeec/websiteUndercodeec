import assert from "node:assert/strict";
import test from "node:test";
import { canMoveLeadStage } from "../src/lib/hermes/lead-stage-transitions.mjs";

test("normal CRM moves match Hermes stage rules without offering rollback", () => {
  assert.equal(canMoveLeadStage({ stage: "NEW" }, "QUALIFIED"), true);
  assert.equal(canMoveLeadStage({ stage: "QUALIFIED" }, "CONTACTED"), false);
  assert.equal(canMoveLeadStage({ stage: "QUALIFIED" }, "NEW"), false);
  assert.equal(canMoveLeadStage({ stage: "QUALIFIED" }, "PROPOSAL"), true);
  assert.equal(canMoveLeadStage({ stage: "PAYMENT_PENDING" }, "NEGOTIATION"), true);
  assert.equal(canMoveLeadStage({ stage: "WON" }, "CONTACTED"), false);
});

test("payment stages and WON respect their separate workflows", () => {
  const lead = {
    stage: "PROPOSAL",
    contractedAmount: 100,
    commercialCurrency: "USD",
    contractReference: "ACME-001",
  };
  assert.equal(canMoveLeadStage(lead, "PAYMENT_PENDING"), false);
  assert.equal(canMoveLeadStage(lead, "PAYMENT_REVIEW"), false);
  assert.equal(canMoveLeadStage(lead, "WON"), false);
  assert.equal(canMoveLeadStage(lead, "WON", { status: "UNDER_REVIEW" }), false);
  assert.equal(canMoveLeadStage(lead, "WON", null), true);
  assert.equal(canMoveLeadStage({ ...lead, contractReference: "" }, "WON", null), false);
});
