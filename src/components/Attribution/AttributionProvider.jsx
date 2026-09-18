"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import { useConsent } from "@/components/Consent/ConsentManager";
import { CONSENT_POLICY_VERSION } from "@/lib/consent/config.mjs";
import {
  hasAttributionParams,
  parseAttributionParams,
  sanitizeLandingPath,
  toIntentAttribution,
} from "@/lib/attribution/params.mjs";

const STORAGE_KEY = "undercodeec_attribution_v1";
const AttributionContext = createContext(null);

function readStoredAttribution() {
  try {
    const value = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) || "null");
    if (!value || !hasAttributionParams(value.params)) return null;
    return {
      params: parseAttributionParams(new URLSearchParams(value.params)),
      landingPath: sanitizeLandingPath(value.landingPath),
      capturedAt: value.capturedAt,
    };
  } catch {
    return null;
  }
}

function saveAttribution(value) {
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}

export function useAttribution() {
  const context = useContext(AttributionContext);
  if (!context) {
    throw new Error("useAttribution debe utilizarse dentro de AttributionProvider.");
  }
  return context;
}

export default function AttributionProvider({ children }) {
  const pathname = usePathname();
  const { preferences } = useConsent();
  const [touch, setTouch] = useState(null);

  useEffect(() => {
    const captured = parseAttributionParams(window.location.search);
    const canPersist = Boolean(preferences?.advertising);
    let active = true;

    if (hasAttributionParams(captured)) {
      const next = {
        params: captured,
        landingPath: sanitizeLandingPath(pathname),
        capturedAt: new Date().toISOString(),
      };
      if (canPersist) saveAttribution(next);
      window.queueMicrotask(() => {
        if (active) setTouch(next);
      });
      return () => {
        active = false;
      };
    }

    if (canPersist) {
      const stored = readStoredAttribution();
      if (stored) {
        window.queueMicrotask(() => {
          if (active) setTouch(stored);
        });
      }
    }
    return () => {
      active = false;
    };
  }, [pathname, preferences?.advertising]);

  useEffect(() => {
    if (preferences && !preferences.advertising) {
      window.sessionStorage.removeItem(STORAGE_KEY);
    } else if (preferences?.advertising && touch) {
      saveAttribution(touch);
    }
  }, [preferences, touch]);

  const buildIntent = useCallback(() => {
    const advertisingAllowed = Boolean(preferences?.advertising);
    const attribution = advertisingAllowed
      ? toIntentAttribution(touch?.params)
      : toIntentAttribution();
    const advertisingState = advertisingAllowed ? "granted" : "denied";

    return {
      source: "undercodeec_web",
      landingPath: sanitizeLandingPath(touch?.landingPath || pathname),
      occurredAt: new Date().toISOString(),
      ...attribution,
      consent: {
        analyticsStorage: preferences?.analytics ? "granted" : "denied",
        adStorage: advertisingState,
        adUserData: advertisingState,
        adPersonalization: advertisingState,
        capturedAt: preferences?.updatedAt || new Date().toISOString(),
        policyVersion: preferences?.policyVersion || CONSENT_POLICY_VERSION,
      },
    };
  }, [pathname, preferences, touch]);

  const value = useMemo(() => ({ buildIntent }), [buildIntent]);

  return (
    <AttributionContext.Provider value={value}>
      {children}
    </AttributionContext.Provider>
  );
}
