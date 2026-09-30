import assert from "node:assert/strict";
import test from "node:test";
import {
  captureAttributionTouch,
  captureAttributionSession,
  parseStoredAttributionSession,
  hasAttributionParams,
  parseAttributionParams,
  parseStoredAttribution,
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
    "?gclid=AbC_123-xy&utm_source=Google&utm_campaign=campana-prueba&email=no%40example.com",
  );
  assert.deepEqual(result, {
    gclid: "AbC_123-xy",
    utm_source: "Google",
    utm_campaign: "campana-prueba",
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
      campaign: "campana-prueba",
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
      utmCampaign: "campana-prueba",
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

test("preserves the visit timestamp while recording a later contact", () => {
  const input = validIntent({ visitedAt: new Date(Date.now() - 60_000).toISOString() });
  const result = validateAttributionIntent(input);
  assert.equal(result.ok, true);
  assert.equal(toHermesContactIntent(result.value, "https://undercodeec.com").visitedAt, input.visitedAt);
  assert.notEqual(result.value.occurredAt, result.value.visitedAt);
});

test("legacy intent without visitedAt keeps the existing Hermes fallback", () => {
  const input = validIntent();
  const result = validateAttributionIntent(input);
  assert.equal(result.ok, true);
  assert.equal(toHermesContactIntent(result.value, "https://undercodeec.com").visitedAt, input.occurredAt);
});

test("rejects malformed visit time and a visit after contact", () => {
  assert.equal(validateAttributionIntent(validIntent({ visitedAt: "invalid" })).error, "invalid_visited_at");
  assert.equal(validateAttributionIntent(validIntent({ visitedAt: new Date(Date.now() + 30_000).toISOString() })).error, "visit_after_contact");
});

test("denied ad storage drops the prior advertising visit time as well as identifiers", () => {
  const input = validIntent({ visitedAt: new Date(Date.now() - 60_000).toISOString() });
  input.consent.adStorage = "denied";
  const result = validateAttributionIntent(input);
  assert.equal(result.ok, true);
  assert.equal(result.value.visitedAt, result.value.occurredAt);
  assert.equal(result.value.clickIds.gclid, null);
});

test("a partial new campaign replaces the legacy snapshot without mixing identifiers", () => {
  const first = captureAttributionTouch(null, "?gclid=A&utm_campaign=alpha", "/", new Date("2026-09-17T12:00:00Z"));
  const next = captureAttributionTouch(first, "?utm_campaign=beta", "/", new Date("2026-09-17T12:01:00Z"));
  assert.deepEqual(next.params, { utm_campaign: "beta" });
  assert.equal(first.params.gclid, "A");
  assert.equal(captureAttributionTouch(next, "?tab=details", "/servicios"), next);
});

test("reload preserves a valid stored touch and its original visit time", () => {
  const input = { params: { gclid: "A", email: "drop@example.invalid" }, landingPath: "/es", capturedAt: "2026-09-17T12:00:00Z" };
  const stored = parseStoredAttribution(JSON.stringify(input));
  assert.deepEqual(stored.params, { gclid: "A" });
  assert.equal(captureAttributionTouch(stored, "?gclid=A", "/es"), stored);
  assert.equal(stored.capturedAt, "2026-09-17T12:00:00.000Z");
  assert.equal(parseStoredAttribution("{"), null);
  assert.equal(parseStoredAttribution(JSON.stringify({ ...input, capturedAt: "invalid" })), null);
});

test("v2 keeps the first eligible campaign and replaces last with an independent partial campaign", () => {
  const a = captureAttributionSession(null, "?gclid=A&utm_campaign=alpha&utm_id=ID_A", "/", new Date("2026-09-29T12:00:00Z"));
  const b = captureAttributionSession(a, "?utm_campaign=beta", "/servicios", new Date("2026-09-29T12:01:00Z"));
  assert.equal(b.firstTouch.params.gclid, "A");
  assert.equal(b.firstTouch.params.utm_id, "ID_A");
  assert.deepEqual(b.lastTouch.params, { utm_campaign: "beta" });
  assert.equal(b.lastTouch.landingPath, "/servicios");
  assert.deepEqual(captureAttributionSession(b, "?tab=details", "/servicios", new Date("2026-09-29T12:02:00Z")).lastTouch, b.lastTouch);
});

test("v2 storage expires after thirty minutes without activity and rejects malformed history", () => {
  const first = captureAttributionSession(null, "?gclid=A", "/", new Date("2026-09-29T12:00:00Z"));
  assert.equal(parseStoredAttributionSession(JSON.stringify(first), new Date("2026-09-29T12:29:59Z")).firstTouch.params.gclid, "A");
  assert.equal(parseStoredAttributionSession(JSON.stringify(first), new Date("2026-09-29T12:30:01Z")), null);
  assert.equal(parseStoredAttributionSession(JSON.stringify({ ...first, firstTouch: { params: { email: "x" } } }), new Date("2026-09-29T12:01:00Z")), null);
});

test("v2 validates both touches and strips them when advertising consent is denied", () => {
  const now = new Date();
  const earlier = new Date(now.getTime() - 60_000).toISOString();
  const touch = { landingPath: "/es", visitedAt: earlier, clickIds: { gclid: "A", gbraid: null, wbraid: null }, utm: { id: "ID_A", source: "google", medium: null, campaign: "alpha", content: null, term: null } };
  const input = { schemaVersion: 2, source: "undercodeec_web", occurredAt: now.toISOString(), firstTouch: touch, lastTouch: touch, consent: validIntent().consent };
  const accepted = validateAttributionIntent(input);
  assert.equal(accepted.ok, true);
  assert.equal(accepted.value.lastTouch.utm.id, "ID_A");
  assert.equal(validateAttributionIntent({ ...input, lastTouch: { ...touch, visitedAt: new Date(now.getTime() + 60_000).toISOString() } }).error, "visit_after_contact");
  const withoutVisit = { ...touch };
  delete withoutVisit.visitedAt;
  assert.equal(validateAttributionIntent({ ...input, lastTouch: withoutVisit }).error, "invalid_visited_at");
  input.consent.adStorage = "denied";
  const denied = validateAttributionIntent(input);
  assert.equal(denied.ok, true);
  assert.equal(denied.value.firstTouch, null);
  assert.equal(denied.value.lastTouch, null);
});

test("v2 mapper sends separate first and last touches to Hermes", () => {
  const now = new Date();
  const first = { landingPath: "/", visitedAt: new Date(now.getTime() - 60_000).toISOString(), clickIds: { gclid: "A", gbraid: null, wbraid: null }, utm: { id: "ID_A", source: "google", medium: "cpc", campaign: "alpha", content: null, term: null } };
  const last = { landingPath: "/servicios", visitedAt: new Date(now.getTime() - 30_000).toISOString(), clickIds: { gclid: null, gbraid: null, wbraid: null }, utm: { id: null, source: null, medium: null, campaign: "beta", content: null, term: null } };
  const result = validateAttributionIntent({ schemaVersion: 2, source: "undercodeec_web", occurredAt: now.toISOString(), firstTouch: first, lastTouch: last, consent: validIntent().consent });
  assert.equal(result.ok, true);
  const mapped = toHermesContactIntent(result.value, "https://undercodeec.com");
  assert.equal(mapped.schemaVersion, 2);
  assert.equal(mapped.firstTouch.gclid, "A");
  assert.equal(mapped.firstTouch.utmId, "ID_A");
  assert.equal(mapped.lastTouch.gclid, undefined);
  assert.equal(mapped.lastTouch.utmCampaign, "beta");
  assert.equal(mapped.lastTouch.landingPage, "https://undercodeec.com/servicios");
});
