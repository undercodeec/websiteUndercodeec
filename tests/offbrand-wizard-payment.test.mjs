import assert from "node:assert/strict";
import test from "node:test";

import { isTrustedPaymentMessage, createPaymentPayload } from "../public/landing-primary/js/offbrand-wizard-payment.mjs";

test("creates a payment payload from the selected OFF+BRAND plan", () => {
  const payload = createPaymentPayload({
    project: "Sitio Web",
    price: { id: "web-launch", label: "Plan de Lanzamiento", price: 360 },
    data: { tipoPago: "total", email: "cliente@example.com" },
  });

  assert.equal(payload.planId, "web-launch");
  assert.equal(payload.amount, 378);
});

test("rejects a same-origin payment message that is not from the active popup", () => {
  const popup = {};
  assert.equal(
    isTrustedPaymentMessage({ origin: "https://undercodeec.com", source: {} }, popup, ["https://undercodeec.com"]),
    false,
  );
});
