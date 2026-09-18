import assert from "node:assert/strict";
import test from "node:test";
import {
  hasAttributionParams,
  parseAttributionParams,
  sanitizeLandingPath,
  toIntentAttribution,
} from "../src/lib/attribution/params.mjs";
import {
  validateAttributionIntent,
  validateAttributionReference,
} from "../src/lib/attribution/schema.mjs";
import {
  appendReferenceToWhatsAppUrl,
  isCommercialWhatsAppUrl,
} from "../src/lib/attribution/whatsapp-client.mjs";
import { toHermesContactIntent } from "../src/lib/attribution/hermes-contract.mjs";

test("captures only supported advertising parameters without rewriting values", () => {
  const result = parseAttributionParams(
    "?gclid=AbC_123-xy&utm_source=Google&utm_campaign=Espa%C3%B1a&email=no%40example.com",
  );
  assert.deepEqual(result, {
    gclid: "AbC_123-xy",
    utm_source: "Google",
    utm_campaign: "España",
  });
  assert.equal(hasAttributionParams(result), true);
});

test("rejects invalid click identifiers and oversized UTM values", () => {
  const result = parseAttributionParams(
    `?gclid=${encodeURIComponent("contains spaces")}&utm_term=${"x".repeat(257)}`,
  );
  assert.deepEqual(result, {});
  assert.equal(hasAttributionParams(result), false);
});

test("maps missing attribution values to explicit nulls", () => {
  assert.deepEqual(toIntentAttribution({ utm_source: "google" }), {
    clickIds: { gclid: null, gbraid: null, wbraid: null },
    utm: {
      source: "google",
      medium: null,
      campaign: null,
      content: null,
      term: null,
    },
  });
});

test("sanitizes landing paths and excludes query strings", () => {
  assert.equal(sanitizeLandingPath("/es"), "/es");
  assert.equal(sanitizeLandingPath("/es?gclid=secret"), "/");
  assert.equal(sanitizeLandingPath("https://example.com/es"), "/");
});

function validIntent(overrides = {}) {
  const now = new Date().toISOString();
  return {
    source: "undercodeec_web",
    landingPath: "/es",
    occurredAt: now,
    clickIds: { gclid: "abc_123", gbraid: null, wbraid: null },
    utm: {
      source: "google",
      medium: "cpc",
      campaign: "spain",
      content: null,
      term: null,
    },
    consent: {
      analyticsStorage: "granted",
      adStorage: "granted",
      adUserData: "granted",
      adPersonalization: "denied",
      capturedAt: now,
      policyVersion: "2026-09-17",
    },
    ...overrides,
  };
}

test("validates an allowed attribution intent", () => {
  const result = validateAttributionIntent(validIntent());
  assert.equal(result.ok, true);
  assert.equal(result.value.clickIds.gclid, "abc_123");
});

test("strips advertising data when ad storage consent is denied", () => {
  const input = validIntent();
  input.consent.adStorage = "denied";
  const result = validateAttributionIntent(input);
  assert.equal(result.ok, true);
  assert.deepEqual(result.value.clickIds, { gclid: null, gbraid: null, wbraid: null });
  assert.deepEqual(result.value.utm, {
    source: null,
    medium: null,
    campaign: null,
    content: null,
    term: null,
  });
});

test("rejects payloads with personal or unknown top-level sources", () => {
  const result = validateAttributionIntent(validIntent({ source: "browser_supplied" }));
  assert.deepEqual(result, { ok: false, error: "invalid_source" });
});

test("rejects unknown fields instead of forwarding them to Hermes", () => {
  const result = validateAttributionIntent(validIntent({ email: "private@example.com" }));
  assert.deepEqual(result, { ok: false, error: "unknown_field" });
});

test("accepts only opaque Hermes references", () => {
  const expiresAt = new Date(Date.now() + 60_000).toISOString();
  assert.deepEqual(
    validateAttributionReference({ reference: "UC-ABCDEFGHJKLMNPQRSTUVWX", expiresAt }),
    { reference: "UC-ABCDEFGHJKLMNPQRSTUVWX", expiresAt },
  );
  assert.equal(
    validateAttributionReference({ reference: "UC-gclid-secret", expiresAt }),
    null,
  );
  assert.equal(
    validateAttributionReference({
      reference: "UC-ABCDEFGHJKLMNPQRSTUVWX",
      expiresAt: new Date(Date.now() - 60_000).toISOString(),
    }),
    null,
  );
});

test("attributes commercial WhatsApp links without intercepting blog sharing", () => {
  const commercial = "https://wa.me/593999739534?text=Quiero%20cotizar";
  const sharing = "https://wa.me/?text=Compartir%20art%C3%ADculo";

  assert.equal(isCommercialWhatsAppUrl(commercial), true);
  assert.equal(isCommercialWhatsAppUrl(sharing), false);
  assert.equal(
    appendReferenceToWhatsAppUrl(commercial, "UC-7K4M9Q2X"),
    commercial,
  );
  assert.equal(
    appendReferenceToWhatsAppUrl(commercial, "UC-ABCDEFGHJKLMNPQRSTUVWX"),
    "https://wa.me/593999739534?text=Quiero+cotizar+Referencia%3A+UC-ABCDEFGHJKLMNPQRSTUVWX",
  );
  assert.equal(appendReferenceToWhatsAppUrl(commercial, "invalid"), commercial);
});

test("maps the browser payload to the deployed Hermes contact-intent contract", () => {
  const result = validateAttributionIntent(validIntent());
  assert.equal(result.ok, true);
  assert.deepEqual(
    toHermesContactIntent(result.value, "https://undercodeec.com"),
    {
      gclid: "abc_123",
      utmSource: "google",
      utmMedium: "cpc",
      utmCampaign: "spain",
      landingPage: "https://undercodeec.com/es",
      visitedAt: result.value.occurredAt,
      consent: {
        adStorage: "GRANTED",
        analyticsStorage: "GRANTED",
        adUserData: "GRANTED",
        adPersonalization: "DENIED",
        source: "UNDERCODEEC_WEB:2026-09-17",
        recordedAt: result.value.consent.capturedAt,
      },
    },
  );
});
