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
  if (input.schemaVersion === 2) return validateV2Intent(input);
  if (!hasOnlyKeys(input, ["source", "landingPath", "occurredAt", "visitedAt", "clickIds", "utm", "consent"])) {
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
  if (input.visitedAt !== undefined && !validDate(input.visitedAt)) {
    return { ok: false, error: "invalid_visited_at" };
  }
  if (input.visitedAt !== undefined && Date.parse(input.visitedAt) > Date.parse(input.occurredAt)) {
    return { ok: false, error: "visit_after_contact" };
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
      ...(input.visitedAt !== undefined ? {
        visitedAt: adStorageGranted ? new Date(input.visitedAt).toISOString() : new Date(input.occurredAt).toISOString(),
      } : {}),
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

function validateV2Intent(input) {
  if (!hasOnlyKeys(input, ["schemaVersion", "source", "occurredAt", "firstTouch", "lastTouch", "consent"])) {
    return { ok: false, error: "unknown_field" };
  }
  if ((input.firstTouch === null) !== (input.lastTouch === null)
    || input.firstTouch === undefined || input.lastTouch === undefined) {
    return { ok: false, error: "invalid_touch_pair" };
  }
  const empty = {
    landingPath: "/", visitedAt: input.occurredAt,
    clickIds: { gclid: null, gbraid: null, wbraid: null },
    utm: { source: null, medium: null, campaign: null, content: null, term: null },
  };
  const validateTouch = (touch) => {
    if (touch === null) return { ok: true, value: null };
    if (!touch || typeof touch !== "object" || Array.isArray(touch)
      || !hasOnlyKeys(touch, ["landingPath", "visitedAt", "clickIds", "utm"])) {
      return { ok: false, error: "invalid_touch" };
    }
    if (touch.visitedAt === undefined) return { ok: false, error: "invalid_visited_at" };
    if (!touch.utm || typeof touch.utm !== "object" || Array.isArray(touch.utm)
      || !hasOnlyKeys(touch.utm, ["id", "source", "medium", "campaign", "content", "term"])) {
      return { ok: false, error: "invalid_utm" };
    }
    const id = optionalString(touch.utm.id, 256);
    if (id === undefined) return { ok: false, error: "invalid_utm_id" };
    const legacyUtm = { ...touch.utm };
    delete legacyUtm.id;
    const normalized = validateAttributionIntent({
      source: input.source, landingPath: touch.landingPath, occurredAt: input.occurredAt,
      visitedAt: touch.visitedAt, clickIds: touch.clickIds, utm: legacyUtm, consent: input.consent,
    });
    if (!normalized.ok) return normalized;
    return {
      ok: true,
      value: {
        landingPath: normalized.value.landingPath,
        visitedAt: normalized.value.visitedAt,
        clickIds: normalized.value.clickIds,
        utm: { id: input.consent.adStorage === "granted" ? id : null, ...normalized.value.utm },
      },
    };
  };
  const base = validateAttributionIntent({
    source: input.source, landingPath: empty.landingPath, occurredAt: input.occurredAt,
    visitedAt: empty.visitedAt, clickIds: empty.clickIds, utm: empty.utm, consent: input.consent,
  });
  if (!base.ok) return base;
  const first = validateTouch(input.firstTouch);
  if (!first.ok) return first;
  const last = validateTouch(input.lastTouch);
  if (!last.ok) return last;
  if (first.value && Date.parse(first.value.visitedAt) > Date.parse(last.value.visitedAt)) {
    return { ok: false, error: "first_after_last" };
  }
  const allowed = input.consent.adStorage === "granted";
  return {
    ok: true,
    value: {
      schemaVersion: 2, source: base.value.source, occurredAt: base.value.occurredAt,
      firstTouch: allowed ? first.value : null,
      lastTouch: allowed ? last.value : null,
      consent: base.value.consent,
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
