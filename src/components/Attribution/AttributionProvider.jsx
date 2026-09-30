"use client";

import {
  Suspense,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useConsent } from "@/components/Consent/ConsentManager";
import { CONSENT_POLICY_VERSION } from "@/lib/consent/config.mjs";
import {
  captureAttributionSession,
  parseStoredAttributionSession,
  toIntentTouch,
} from "@/lib/attribution/params.mjs";

const STORAGE_KEY = "undercodeec_attribution_v2";
const LEGACY_STORAGE_KEY = "undercodeec_attribution_v1";
const AttributionContext = createContext(null);

function readStoredAttribution(consentUpdatedAt) {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    const stored = parseStoredAttributionSession(raw);
    if (stored && Date.parse(consentUpdatedAt) <= Date.parse(stored.lastActivityAt)) return stored;
    if (raw !== null) window.sessionStorage.removeItem(STORAGE_KEY);
    return null;
  } catch {
    return null;
  }
}

function saveAttribution(value) {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Keep the in-memory touch when browser storage is unavailable.
  }
}

function AttributionNavigation({ onCapture }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams?.toString() || "";
  useEffect(() => {
    let active = true;
    window.queueMicrotask(() => {
      if (active) onCapture(pathname, search);
    });
    return () => { active = false; };
  }, [onCapture, pathname, search]);
  return null;
}

export function useAttribution() {
  const context = useContext(AttributionContext);
  if (!context) {
    throw new Error("useAttribution debe utilizarse dentro de AttributionProvider.");
  }
  return context;
}

export default function AttributionProvider({ children }) {
  const { preferences } = useConsent();
  const [session, setSession] = useState(null);

  const captureNavigation = useCallback((currentPathname, search) => {
    if (!preferences?.advertising) return;
    const stored = readStoredAttribution(preferences.updatedAt);
    setSession((previous) => {
      const reusable = previous && Date.parse(preferences.updatedAt) <= Date.parse(previous.lastActivityAt)
        ? previous : null;
      return captureAttributionSession(stored || reusable, search, currentPathname, new Date());
    });
  }, [preferences]);

  useEffect(() => {
    if (preferences && !preferences.advertising) {
      let active = true;
      window.queueMicrotask(() => { if (active) setSession(null); });
      try {
        window.sessionStorage.removeItem(STORAGE_KEY);
        window.sessionStorage.removeItem(LEGACY_STORAGE_KEY);
      } catch {
        // No new attribution is persisted while consent is denied.
      }
      return () => { active = false; };
    } else if (preferences?.advertising && session) {
      saveAttribution(session);
    }
    return undefined;
  }, [preferences, session]);

  const buildIntent = useCallback(() => {
    const advertisingAllowed = Boolean(preferences?.advertising);
    const active = advertisingAllowed && session
      && Date.parse(preferences.updatedAt) <= Date.parse(session.lastActivityAt)
      ? parseStoredAttributionSession(JSON.stringify(session), new Date())
      : null;
    const advertisingState = advertisingAllowed ? "granted" : "denied";
    const contactedAt = new Date().toISOString();

    return {
      source: "undercodeec_web",
      schemaVersion: 2,
      occurredAt: contactedAt,
      firstTouch: toIntentTouch(active?.firstTouch),
      lastTouch: toIntentTouch(active?.lastTouch),
      consent: {
        analyticsStorage: preferences?.analytics ? "granted" : "denied",
        adStorage: advertisingState,
        adUserData: advertisingState,
        adPersonalization: advertisingState,
        capturedAt: preferences?.updatedAt || new Date().toISOString(),
        policyVersion: preferences?.policyVersion || CONSENT_POLICY_VERSION,
      },
    };
  }, [preferences, session]);

  const value = useMemo(() => ({ buildIntent }), [buildIntent]);

  return (
    <AttributionContext.Provider value={value}>
      <Suspense fallback={null}>
        <AttributionNavigation onCapture={captureNavigation} />
      </Suspense>
      {children}
    </AttributionContext.Provider>
  );
}
