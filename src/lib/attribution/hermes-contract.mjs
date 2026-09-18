const CONSENT_STATE = Object.freeze({
  granted: "GRANTED",
  denied: "DENIED",
});

function optionalFields(entries) {
  return Object.fromEntries(entries.filter(([, value]) => typeof value === "string" && value));
}

export function toHermesContactIntent(intent, siteOrigin) {
  let landingPage;
  try {
    const url = new URL(intent.landingPath, siteOrigin);
    if (url.protocol === "https:") landingPage = url.toString();
  } catch {
    landingPage = undefined;
  }

  return {
    ...optionalFields([
      ["gclid", intent.clickIds.gclid],
      ["gbraid", intent.clickIds.gbraid],
      ["wbraid", intent.clickIds.wbraid],
      ["utmSource", intent.utm.source],
      ["utmMedium", intent.utm.medium],
      ["utmCampaign", intent.utm.campaign],
      ["utmContent", intent.utm.content],
      ["utmTerm", intent.utm.term],
      ["landingPage", landingPage],
      ["visitedAt", intent.occurredAt],
    ]),
    consent: {
      adStorage: CONSENT_STATE[intent.consent.adStorage],
      analyticsStorage: CONSENT_STATE[intent.consent.analyticsStorage],
      adUserData: CONSENT_STATE[intent.consent.adUserData],
      adPersonalization: CONSENT_STATE[intent.consent.adPersonalization],
      source: `UNDERCODEEC_WEB:${intent.consent.policyVersion}`.slice(0, 100),
      recordedAt: intent.consent.capturedAt,
    },
  };
}
