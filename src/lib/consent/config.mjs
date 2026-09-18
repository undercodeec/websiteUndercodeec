export const CONSENT_STORAGE_KEY = "undercodeec_consent_v1";
export const CONSENT_POLICY_VERSION =
  process.env.NEXT_PUBLIC_CONSENT_POLICY_VERSION || "2026-09-17";

export const DENIED_CONSENT = Object.freeze({
  analytics: false,
  advertising: false,
});

export const GRANTED_CONSENT = Object.freeze({
  analytics: true,
  advertising: true,
});

export function normalizeConsentPreferences(value) {
  if (!value || typeof value !== "object") return null;
  if (value.policyVersion !== CONSENT_POLICY_VERSION) return null;
  if (typeof value.analytics !== "boolean") return null;
  if (typeof value.advertising !== "boolean") return null;

  return {
    analytics: value.analytics,
    advertising: value.advertising,
    policyVersion: value.policyVersion,
    updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : null,
  };
}

export function parseStoredConsent(rawValue) {
  if (!rawValue) return null;
  try {
    return normalizeConsentPreferences(JSON.parse(rawValue));
  } catch {
    return null;
  }
}

export function createConsentPreferences(selection, now = new Date()) {
  return {
    analytics: Boolean(selection?.analytics),
    advertising: Boolean(selection?.advertising),
    policyVersion: CONSENT_POLICY_VERSION,
    updatedAt: now.toISOString(),
  };
}

export function toGoogleConsent(preferences) {
  const analytics = preferences?.analytics ? "granted" : "denied";
  const advertising = preferences?.advertising ? "granted" : "denied";

  return {
    analytics_storage: analytics,
    ad_storage: advertising,
    ad_user_data: advertising,
    ad_personalization: advertising,
  };
}
