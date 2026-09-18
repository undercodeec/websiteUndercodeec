import {
  CONSENT_STORAGE_KEY,
  parseStoredConsent,
} from "@/lib/consent/config.mjs";

function measurementConsentIsGranted() {
  if (typeof window === "undefined") return false;

  const preferences = parseStoredConsent(
    window.localStorage.getItem(CONSENT_STORAGE_KEY),
  );
  return Boolean(preferences?.analytics || preferences?.advertising);
}

/**
 * Sends a privacy-safe event for GTM only after the visitor accepts analytics
 * or advertising measurement.
 * Event parameters must never contain names, emails, phones, IDs or free text.
 */
export function pushAnalyticsEvent(event, parameters = {}) {
  if (!measurementConsentIsGranted()) return false;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...parameters });
  return true;
}
