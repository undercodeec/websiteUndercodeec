import assert from "node:assert/strict";
import test from "node:test";

import { isTrustedPaymentMessage } from "../src/lib/payment-message.mjs";

const allowedOrigins = ["https://pay.payphonetodoesposible.com", "https://undercodeec.com"];
const paymentWindow = {};

test("accepts a payment message only from the active popup and an allowed origin", () => {
  assert.equal(
    isTrustedPaymentMessage(
      { origin: "https://pay.payphonetodoesposible.com", source: paymentWindow },
      paymentWindow,
      allowedOrigins,
    ),
    true,
  );
});

test("rejects same-origin messages from anything other than the payment popup", () => {
  assert.equal(
    isTrustedPaymentMessage(
      { origin: "https://undercodeec.com", source: {} },
      paymentWindow,
      allowedOrigins,
    ),
    false,
  );
});

test("rejects messages from unapproved origins", () => {
  assert.equal(
    isTrustedPaymentMessage(
      { origin: "https://untrusted.example", source: paymentWindow },
      paymentWindow,
      allowedOrigins,
    ),
    false,
  );
});
