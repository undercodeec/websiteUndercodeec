import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { isTrustedPaymentMessage, createPaymentPayload, getRecaptchaToken, openPayment } from "../public/landing-primary/js/offbrand-wizard-payment.mjs";

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

test("records a purchase only after a trusted successful PayPhone callback", async (t) => {
  const originalWindow = globalThis.window;
  const originalFetch = globalThis.fetch;
  const dataLayer = [];
  const listeners = new Map();
  const popup = { close() {} };
  const consent = {
    policyVersion: "2026-09-17",
    analytics: true,
    advertising: false,
  };

  globalThis.window = {
    location: { origin: "https://undercodeec.com" },
    localStorage: { getItem: () => JSON.stringify(consent) },
    dataLayer,
    open: () => popup,
    addEventListener: (type, listener) => listeners.set(type, listener),
    removeEventListener: (type) => listeners.delete(type),
  };
  globalThis.fetch = async () => ({
    ok: true,
    json: async () => ({
      paymentUrl: "https://pay.payphonetodoesposible.com/checkout",
      clientTransactionId: "tx-confirmed-123",
    }),
  });
  t.after(() => {
    globalThis.window = originalWindow;
    globalThis.fetch = originalFetch;
  });

  await openPayment({
    project: "Sitio Web",
    price: { id: "web-launch", label: "Plan de Lanzamiento", price: 360 },
    data: { tipoPago: "total" },
  }, () => {}, (error) => { throw error; });

  assert.deepEqual(dataLayer, []);
  listeners.get("message")({
    origin: "https://pay.payphonetodoesposible.com",
    source: popup,
    data: { type: "PAYMENT_COMPLETED", success: false },
  });
  assert.deepEqual(dataLayer, []);

  listeners.get("message")({
    origin: "https://pay.payphonetodoesposible.com",
    source: popup,
    data: { type: "PAYMENT_COMPLETED", success: true },
  });
  assert.deepEqual(dataLayer, [{
    event: "purchase",
    ecommerce: {
      transaction_id: "tx-confirmed-123",
      value: 378,
      currency: "USD",
      items: [{
        item_id: "web-launch",
        item_name: "Plan de Lanzamiento",
        price: 378,
        quantity: 1,
      }],
    },
  }]);
});

test("closes the PayPhone popup only after backend polling confirms approval", async (t) => {
  const originalWindow = globalThis.window;
  const originalFetch = globalThis.fetch;
  const listeners = new Map();
  const popup = { closed: false, close() { this.closed = true; } };
  let statusRequest;
  let completed = 0;

  globalThis.window = {
    location: { origin: "https://undercodeec.com" },
    localStorage: { getItem: () => null },
    open: () => popup,
    addEventListener: (type, listener) => listeners.set(type, listener),
    removeEventListener: (type) => listeners.delete(type),
  };
  globalThis.fetch = async (url, options = {}) => {
    if (url.endsWith("/api/create-payment")) {
      return {
        ok: true,
        json: async () => ({
          paymentUrl: "https://pay.payphonetodoesposible.com/checkout",
          clientTransactionId: "tx-approved-123",
          paymentSessionToken: "session-token",
        }),
      };
    }
    statusRequest = { url, options };
    return { ok: true, json: async () => ({ success: true, status: "Approved" }) };
  };
  t.after(() => {
    globalThis.window = originalWindow;
    globalThis.fetch = originalFetch;
  });

  await openPayment({
    project: "Sitio Web",
    price: { id: "web-launch", label: "Plan de Lanzamiento", price: 360 },
    data: { tipoPago: "total" },
  }, () => { completed += 1; }, (error) => { throw error; });
  await new Promise((resolve) => setTimeout(resolve, 0));

  assert.match(statusRequest.url, /\/api\/check-payment-status\/tx-approved-123$/);
  assert.equal(statusRequest.options.headers.Authorization, "Bearer session-token");
  assert.equal(popup.closed, true);
  assert.equal(completed, 1);
});

test("transfer flow includes reCAPTCHA and uploads a voucher before registering the order", async () => {
  const source = await readFile("public/landing-primary/js/offbrand-wizard-payment.mjs", "utf8");

  assert.match(source, /getRecaptchaToken\("TRANSFERENCIA"\)/);
  assert.match(source, /\/api\/upload-voucher/);
  assert.match(source, /JSON\.stringify\(\{ recaptchaToken, orderData:/);
});

test("waits for the Enterprise runtime after the loader script fires", async (t) => {
  const originalWindow = globalThis.window;
  const originalDocument = globalThis.document;
  const listeners = new Map();

  globalThis.window = { __OFFBRAND_RECAPTCHA_SITE_KEY: "public-site-key" };
  globalThis.document = {
    getElementById: () => null,
    createElement: () => ({
      isConnected: false,
      addEventListener: (event, callback) => listeners.set(event, callback),
    }),
    head: {
      append: () => {
        globalThis.window.grecaptcha = {
          enterprise: {
            ready(callback) {
              this.execute = async () => "enterprise-token";
              callback();
            },
          },
        };
        listeners.get("load")();
      },
    },
  };
  t.after(() => {
    globalThis.window = originalWindow;
    globalThis.document = originalDocument;
  });

  assert.equal(await getRecaptchaToken("WIZARD_GENERIC"), "enterprise-token");
});
