import { sanitizeLandingPath } from "./params.mjs";

export const ATTRIBUTION_REFERENCE_PATTERN = /^UC-[A-Z2-7]{22}$/;

const CLICK_ID_PATTERN = /^[A-Za-z0-9._~-]+$/;
const CONTROL_CHARACTERS = /[\u0000-\u001F\u007F]/;
const CONSENT_VALUES = new Set(["granted", "denied"]);

function hasOnlyKeys(value, allowedKeys) {
  return Object.keys(value).every((key) => allowedKeys.includes(key));
}

function optionalString(value, maxLength, pattern) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "string" || value.length > maxLength) return undefined;
  if (CONTROL_CHARACTERS.test(value)) return undefined;
  if (pattern && !pattern.test(value)) return undefined;
  return value;
}

function validDate(value) {
  if (typeof value !== "string" || value.length > 64) return false;
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return false;
  const now = Date.now();
  return timestamp <= now + 5 * 60_000 && timestamp >= now - 90 * 24 * 60 * 60_000;
}

export function validateAttributionIntent(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { ok: false, error: "invalid_payload" };
  }
  if (!hasOnlyKeys(input, ["source", "landingPath", "occurredAt", "clickIds", "utm", "consent"])) {
    return { ok: false, error: "unknown_field" };
  }
  if (input.source !== "undercodeec_web") {
    return { ok: false, error: "invalid_source" };
  }
  if (sanitizeLandingPath(input.landingPath) !== input.landingPath) {
    return { ok: false, error: "invalid_landing_path" };
  }
  if (!validDate(input.occurredAt)) {
    return { ok: false, error: "invalid_occurred_at" };
  }

  if (!input.clickIds || typeof input.clickIds !== "object" || Array.isArray(input.clickIds)) {
    return { ok: false, error: "invalid_click_ids" };
  }
  if (!hasOnlyKeys(input.clickIds, ["gclid", "gbraid", "wbraid"])) {
    return { ok: false, error: "unknown_click_id" };
  }
  const clickIds = {};
  for (const name of ["gclid", "gbraid", "wbraid"]) {
    const value = optionalString(input.clickIds?.[name], 512, CLICK_ID_PATTERN);
    if (value === undefined) return { ok: false, error: `invalid_${name}` };
    clickIds[name] = value;
  }

  if (!input.utm || typeof input.utm !== "object" || Array.isArray(input.utm)) {
    return { ok: false, error: "invalid_utm" };
  }
  if (!hasOnlyKeys(input.utm, ["source", "medium", "campaign", "content", "term"])) {
    return { ok: false, error: "unknown_utm" };
  }
  const utm = {};
  for (const name of ["source", "medium", "campaign", "content", "term"]) {
    const value = optionalString(input.utm?.[name], 256);
    if (value === undefined) return { ok: false, error: `invalid_utm_${name}` };
    utm[name] = value;
  }

  const consent = input.consent;
  if (!consent || typeof consent !== "object") {
    return { ok: false, error: "invalid_consent" };
  }
  if (!hasOnlyKeys(consent, [
    "analyticsStorage",
    "adStorage",
    "adUserData",
    "adPersonalization",
    "capturedAt",
    "policyVersion",
  ])) {
    return { ok: false, error: "unknown_consent_field" };
  }
  for (const name of [
    "analyticsStorage",
    "adStorage",
    "adUserData",
    "adPersonalization",
  ]) {
    if (!CONSENT_VALUES.has(consent[name])) {
      return { ok: false, error: `invalid_consent_${name}` };
    }
  }
  if (!validDate(consent.capturedAt)) {
    return { ok: false, error: "invalid_consent_captured_at" };
  }
  const policyVersion = optionalString(consent.policyVersion, 64);
  if (!policyVersion) return { ok: false, error: "invalid_policy_version" };

  const adStorageGranted = consent.adStorage === "granted";
  const safeClickIds = adStorageGranted
    ? clickIds
    : { gclid: null, gbraid: null, wbraid: null };
  const safeUtm = adStorageGranted
    ? utm
    : { source: null, medium: null, campaign: null, content: null, term: null };

  return {
    ok: true,
    value: {
      source: "undercodeec_web",
      landingPath: input.landingPath,
      occurredAt: new Date(input.occurredAt).toISOString(),
      clickIds: safeClickIds,
      utm: safeUtm,
      consent: {
        analyticsStorage: consent.analyticsStorage,
        adStorage: consent.adStorage,
        adUserData: consent.adUserData,
        adPersonalization: consent.adPersonalization,
        capturedAt: new Date(consent.capturedAt).toISOString(),
        policyVersion,
      },
    },
  };
}

export function validateAttributionReference(input) {
  if (!input || typeof input !== "object") return null;
  if (!ATTRIBUTION_REFERENCE_PATTERN.test(input.reference || "")) return null;
  if (
    typeof input.expiresAt !== "string"
    || !Number.isFinite(Date.parse(input.expiresAt))
    || Date.parse(input.expiresAt) <= Date.now()
  ) {
    return null;
  }
  return {
    reference: input.reference,
    expiresAt: new Date(input.expiresAt).toISOString(),
  };
}
