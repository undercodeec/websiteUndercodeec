import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { advertisingEventPayload, advertisingEventSuccessMessage } from "../src/lib/hermes/advertising-event.mjs";

function form(values) {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
}

test("won without commercial details omits optional facts, including currency", () => {
  assert.deepEqual(advertisingEventPayload("CONTRACT_WON", form({ value: "", currency: "EUR", commercialReference: "  " })), { eventType: "CONTRACT_WON" });
});

test("won with complete commercial details retains the provided value", () => {
  assert.deepEqual(advertisingEventPayload("CONTRACT_WON", form({ value: "100", revenueReceived: "12.50", currency: "USD", commercialReference: " ref " })), {
    eventType: "CONTRACT_WON", value: 100, revenueReceived: 12.5, currency: "USD", commercialReference: "ref",
  });
  assert.deepEqual(advertisingEventPayload("PROPOSAL_SENT", form({ value: "15", currency: "EUR" })), { eventType: "PROPOSAL_SENT", value: 15, currency: "EUR" });
});

test("won rejects zero, invalid and incomplete commercial details", () => {
  for (const values of [
    { value: "0", currency: "USD", commercialReference: "ref" },
    { value: "10" }, { revenueReceived: "12" }, { commercialReference: "ref" },
    { value: "10", currency: "USD" }, { value: "10", commercialReference: "ref" },
    { value: "10", currency: "eur", commercialReference: "ref" },
    { value: "10", currency: "ZZZ", commercialReference: "ref" },
  ]) {
    assert.throws(() => advertisingEventPayload("CONTRACT_WON", form(values)), /importe contratado mayor que cero/);
  }
  for (const value of ["-1", "Infinity"]) {
    assert.throws(() => advertisingEventPayload("CONTRACT_WON", form({ value, currency: "USD", commercialReference: "ref" })), /números válidos/);
  }
  assert.throws(() => advertisingEventPayload("PROPOSAL_SENT", form({ value: "10" })), /Selecciona una moneda/);
});

test("commercial form permits a won event without value or reference", async () => {
  const page = await readFile("src/app/admin/crm/leads/[id]/page.jsx", "utf8");
  assert.match(page, /advertisingEventPayload\(eventType, form\)/);
  assert.match(page, /<input name="value" type="number" min="0" step="0\.01" aria-describedby=/);
  assert.match(page, /<input name="commercialReference" maxLength=\{200\} aria-describedby=/);
  assert.match(page, /required=\{Boolean\(amounts\.value \|\| amounts\.revenueReceived\)\}/);
  assert.match(page, /<option value="">Selecciona una moneda<\/option>/);
  assert.match(page, /role="alert"/);
});

test("reports an already recorded first purchase without claiming another conversion", async () => {
  assert.match(advertisingEventSuccessMessage({ conversionCreated: false, reason: "FIRST_PURCHASE_ALREADY_RECORDED" }), /Compra registrada; no se creó otra conversión/);
  for (const result of [undefined, {}, { conversionCreated: true }, { conversionCreated: false, reason: "OTHER" }]) {
    assert.equal(advertisingEventSuccessMessage(result), "Hito comercial registrado y auditado.");
  }
  const page = await readFile("src/app/admin/crm/leads/[id]/page.jsx", "utf8");
  assert.match(page, /const result = await hermesApi\.recordAdvertisingEvent\(lead\.id, payload\);\s*onToast\(\{ tone: "success", message: advertisingEventSuccessMessage\(result\) \}\);\s*await onRefresh\(\)/);
});
