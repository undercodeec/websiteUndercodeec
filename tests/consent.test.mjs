import assert from "node:assert/strict";
import test from "node:test";
import {
  CONSENT_POLICY_VERSION,
  createConsentPreferences,
  parseStoredConsent,
  toGoogleConsent,
} from "../src/lib/consent/config.mjs";

test("creates versioned consent preferences", () => {
  const now = new Date("2026-09-17T12:00:00.000Z");
  assert.deepEqual(createConsentPreferences({ analytics: true, advertising: false }, now), {
    analytics: true,
    advertising: false,
    policyVersion: CONSENT_POLICY_VERSION,
    updatedAt: now.toISOString(),
  });
});

test("ignores corrupt or obsolete stored preferences", () => {
  assert.equal(parseStoredConsent("not-json"), null);
  assert.equal(
    parseStoredConsent(JSON.stringify({
      analytics: true,
      advertising: true,
      policyVersion: "obsolete",
    })),
    null,
  );
});

test("maps consent choices to all Consent Mode v2 signals", () => {
  assert.deepEqual(toGoogleConsent({ analytics: true, advertising: false }), {
    analytics_storage: "granted",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
});
