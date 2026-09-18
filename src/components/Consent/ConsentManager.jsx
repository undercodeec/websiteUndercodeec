"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  CONSENT_STORAGE_KEY,
  DENIED_CONSENT,
  GRANTED_CONSENT,
  createConsentPreferences,
  parseStoredConsent,
  toGoogleConsent,
} from "@/lib/consent/config.mjs";
import styles from "./ConsentManager.module.css";

const ConsentContext = createContext(null);

function applyGoogleConsent(preferences) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag("consent", "update", toGoogleConsent(preferences));
}

function persistPreferences(selection) {
  const preferences = createConsentPreferences(selection);
  window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(preferences));
  applyGoogleConsent(preferences);
  if (typeof window.fbq === "function") {
    window.fbq("consent", preferences.advertising ? "grant" : "revoke");
  }
  window.dispatchEvent(
    new CustomEvent("undercodeec:consent-updated", { detail: preferences }),
  );
  return preferences;
}

export function useConsent() {
  const context = useContext(ConsentContext);
  if (!context) throw new Error("useConsent debe utilizarse dentro de ConsentManager.");
  return context;
}

export default function ConsentManager({ children }) {
  const pathname = usePathname();
  const [preferences, setPreferences] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [preloaderFinished, setPreloaderFinished] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [draft, setDraft] = useState(DENIED_CONSENT);

  useEffect(() => {
    const stored = parseStoredConsent(
      window.localStorage.getItem(CONSENT_STORAGE_KEY),
    );
    if (stored) applyGoogleConsent(stored);
    let active = true;
    window.queueMicrotask(() => {
      if (!active) return;
      if (stored) {
        setPreferences(stored);
        setDraft(stored);
      }
      setMounted(true);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let fallbackTimer;
    let frame;
    const revealBanner = () => setPreloaderFinished(true);
    const waitForPreloader = () => {
      if (!document.body.classList.contains("primary-preloading")) {
        revealBanner();
        return;
      }
      window.addEventListener("preloaderDone", revealBanner, { once: true });
      fallbackTimer = window.setTimeout(revealBanner, 3000);
    };

    frame = window.requestAnimationFrame(waitForPreloader);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(fallbackTimer);
      window.removeEventListener("preloaderDone", revealBanner);
    };
  }, []);

  useEffect(() => {
    if (!settingsOpen) return undefined;
    const onEscape = (event) => {
      if (event.key === "Escape") setSettingsOpen(false);
    };
    document.addEventListener("keydown", onEscape);
    return () => document.removeEventListener("keydown", onEscape);
  }, [settingsOpen]);

  const save = useCallback((selection) => {
    const next = persistPreferences(selection);
    setPreferences(next);
    setDraft(next);
    setSettingsOpen(false);
  }, []);

  const openSettings = useCallback(() => {
    setDraft(preferences || DENIED_CONSENT);
    setSettingsOpen(true);
  }, [preferences]);

  const value = useMemo(
    () => ({
      preferences,
      hasDecision: Boolean(preferences),
      openSettings,
    }),
    [openSettings, preferences],
  );

  const excludedPath = ["/admin", "/contratos", "/undercodeec"]
    .some((prefix) => pathname === prefix || pathname?.startsWith(`${prefix}/`));
  const analyticsAllowed = !excludedPath && Boolean(preferences?.analytics);
  const advertisingAllowed = !excludedPath && Boolean(preferences?.advertising);
  const googleTagsAllowed = analyticsAllowed || advertisingAllowed;

  return (
    <ConsentContext.Provider value={value}>
      {children}

      {googleTagsAllowed && (
        <Script id="gtm-consented" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-WX7HLGTV');`}
        </Script>
      )}

      {advertisingAllowed && (
        <Script id="meta-pixel-consented" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window,document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('consent','grant');fbq('init','1528924045213380');fbq('track','PageView');`}
        </Script>
      )}

      {mounted && preloaderFinished && !excludedPath && !preferences && (
        <section
          className={styles.banner}
          role="region"
          aria-label="Preferencias de privacidad"
        >
          <div className={styles.copy}>
            <strong>Tu privacidad, bajo tu control</strong>
            <p>
              Usamos medición para entender qué contenidos funcionan y publicidad
              solo si la autorizas. Las funciones necesarias permanecen activas.
            </p>
          </div>
          <div className={styles.actions}>
            <button className={styles.button} type="button" onClick={() => save(DENIED_CONSENT)}>
              Rechazar opcionales
            </button>
            <button className={styles.button} type="button" onClick={openSettings}>
              Configurar
            </button>
            <button
              className={`${styles.button} ${styles.buttonPrimary}`}
              type="button"
              onClick={() => save(GRANTED_CONSENT)}
            >
              Aceptar todas
            </button>
          </div>
        </section>
      )}

      {mounted && !excludedPath && settingsOpen && (
        <>
          <div className={styles.backdrop} aria-hidden="true" onClick={() => setSettingsOpen(false)} />
          <section
            className={styles.panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby="consent-settings-title"
          >
            <header className={styles.panelHeader}>
              <div>
                <h2 id="consent-settings-title">Preferencias de privacidad</h2>
                <p>Puedes cambiar o retirar tu consentimiento en cualquier momento.</p>
              </div>
              <button
                className={styles.closeButton}
                type="button"
                aria-label="Cerrar preferencias"
                onClick={() => setSettingsOpen(false)}
              >
                ×
              </button>
            </header>

            <div className={styles.choice}>
              <div>
                <strong>Necesarias</strong>
                <span>Permiten seguridad, navegación y recordar esta elección.</span>
              </div>
              <span className={styles.required}>Siempre activas</span>
            </div>

            <label className={styles.choice}>
              <div>
                <strong>Analítica</strong>
                <span>Ayuda a medir visitas y mejorar el sitio mediante Google Analytics.</span>
              </div>
              <input
                type="checkbox"
                checked={Boolean(draft.analytics)}
                onChange={(event) => setDraft((current) => ({ ...current, analytics: event.target.checked }))}
              />
            </label>

            <label className={styles.choice}>
              <div>
                <strong>Publicidad</strong>
                <span>Permite medir campañas y activar Meta Pixel.</span>
              </div>
              <input
                type="checkbox"
                checked={Boolean(draft.advertising)}
                onChange={(event) => setDraft((current) => ({ ...current, advertising: event.target.checked }))}
              />
            </label>

            <div className={styles.panelActions}>
              <button
                className={`${styles.button} ${styles.buttonPrimary}`}
                type="button"
                onClick={() => save(draft)}
              >
                Guardar preferencias
              </button>
            </div>
          </section>
        </>
      )}
    </ConsentContext.Provider>
  );
}
