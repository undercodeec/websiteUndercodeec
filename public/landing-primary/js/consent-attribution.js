(() => {
  const CONSENT_KEY = "undercodeec_consent_v1";
  const ATTRIBUTION_KEY = "undercodeec_attribution_v1";
  const POLICY_VERSION = "2026-09-17";
  const WHATSAPP_NUMBER = "593999739534";
  const ATTRIBUTION_PARAMS = [
    "gclid", "gbraid", "wbraid", "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term",
  ];

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() { window.dataLayer.push(arguments); };
  window.gtag("consent", "default", {
    ad_storage: "denied",
    analytics_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    wait_for_update: 500,
  });

  const validPreferences = (value) => value
    && value.policyVersion === POLICY_VERSION
    && typeof value.analytics === "boolean"
    && typeof value.advertising === "boolean";

  const readPreferences = () => {
    try {
      const value = JSON.parse(window.localStorage.getItem(CONSENT_KEY) || "null");
      return validPreferences(value) ? value : null;
    } catch {
      return null;
    }
  };

  const updateGoogleConsent = (preferences) => {
    const advertising = preferences?.advertising ? "granted" : "denied";
    window.gtag("consent", "update", {
      analytics_storage: preferences?.analytics ? "granted" : "denied",
      ad_storage: advertising,
      ad_user_data: advertising,
      ad_personalization: advertising,
    });
  };

  const loadScript = (id, source) => {
    if (document.getElementById(id)) return;
    const script = document.createElement("script");
    script.id = id;
    script.async = true;
    script.src = source;
    document.head.append(script);
  };

  const loadConsentedTags = (preferences) => {
    if (preferences.analytics || preferences.advertising) {
      window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
      loadScript("gtm-consented", "https://www.googletagmanager.com/gtm.js?id=GTM-WX7HLGTV");
    }
    if (preferences.advertising && !window.fbq) {
      const fbq = function fbq() {
        fbq.callMethod ? fbq.callMethod.apply(fbq, arguments) : fbq.queue.push(arguments);
      };
      fbq.queue = [];
      fbq.loaded = true;
      fbq.version = "2.0";
      window.fbq = fbq;
      window._fbq = fbq;
      fbq("consent", "grant");
      fbq("init", "1528924045213380");
      fbq("track", "PageView");
      loadScript("meta-pixel-consented", "https://connect.facebook.net/en_US/fbevents.js");
    }
  };

  let preferences = readPreferences();
  if (preferences) {
    updateGoogleConsent(preferences);
    loadConsentedTags(preferences);
  }

  const captureParams = () => {
    const values = {};
    const query = new URLSearchParams(window.location.search);
    ATTRIBUTION_PARAMS.forEach((name) => {
      const value = query.get(name);
      if (value && value.length <= (name.startsWith("utm_") ? 256 : 512) && !/[\u0000-\u001F\u007F]/.test(value)) {
        values[name] = value;
      }
    });
    return values;
  };

  const attributionFromSession = () => {
    try {
      const value = JSON.parse(window.sessionStorage.getItem(ATTRIBUTION_KEY) || "null");
      return value?.params || {};
    } catch {
      return {};
    }
  };

  const capturedParams = captureParams();
  if (preferences?.advertising && Object.keys(capturedParams).length) {
    window.sessionStorage.setItem(ATTRIBUTION_KEY, JSON.stringify({
      params: capturedParams,
      landingPath: window.location.pathname || "/",
      capturedAt: new Date().toISOString(),
    }));
  }

  const buildIntent = () => {
    const advertisingAllowed = Boolean(preferences?.advertising);
    const params = advertisingAllowed
      ? (Object.keys(capturedParams).length ? capturedParams : attributionFromSession())
      : {};
    const adStorage = advertisingAllowed ? "granted" : "denied";
    return {
      source: "undercodeec_web",
      landingPath: window.location.pathname || "/",
      occurredAt: new Date().toISOString(),
      clickIds: {
        gclid: params.gclid || null,
        gbraid: params.gbraid || null,
        wbraid: params.wbraid || null,
      },
      utm: {
        source: params.utm_source || null,
        medium: params.utm_medium || null,
        campaign: params.utm_campaign || null,
        content: params.utm_content || null,
        term: params.utm_term || null,
      },
      consent: {
        analyticsStorage: preferences?.analytics ? "granted" : "denied",
        adStorage,
        adUserData: adStorage,
        adPersonalization: adStorage,
        capturedAt: preferences?.updatedAt || new Date().toISOString(),
        policyVersion: preferences?.policyVersion || POLICY_VERSION,
      },
    };
  };

  const attributedWhatsAppUrl = async (href) => {
    try {
      const response = await fetch("/api/attribution/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildIntent()),
        cache: "no-store",
        signal: AbortSignal.timeout(3000),
      });
      const result = response.ok ? await response.json() : null;
      if (!/^UC-[A-Z2-7]{22}$/.test(result?.reference || "")) return href;
      const destination = new URL(href);
      const message = destination.searchParams.get("text") || "Hola, quisiera obtener información.";
      destination.searchParams.set("text", `${message} Referencia: ${result.reference}`);
      return destination.toString();
    } catch {
      return href;
    }
  };

  document.addEventListener("click", async (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const anchor = event.target.closest?.("a[href]");
    if (!anchor || anchor.dataset.attributionManaged === "true") return;
    const url = new URL(anchor.href, window.location.origin);
    if (url.protocol !== "https:" || url.hostname !== "wa.me" || url.pathname.replaceAll("/", "") !== WHATSAPP_NUMBER) return;

    event.preventDefault();
    if (anchor.dataset.attributionPending === "true") return;
    anchor.dataset.attributionPending = "true";
    const popup = window.open("about:blank", "_blank");
    if (popup) popup.opener = null;
    if (preferences?.analytics || preferences?.advertising) {
      window.dataLayer.push({ event: "whatsapp_click", contact_method: "whatsapp", source: "commercial_whatsapp_link", page_path: window.location.pathname || "/" });
    }
    const destination = await attributedWhatsAppUrl(url.toString());
    delete anchor.dataset.attributionPending;
    if (popup && !popup.closed) popup.location.replace(destination);
    else window.location.assign(destination);
  });

  const style = document.createElement("style");
  style.textContent = `
    .uc-consent { position: fixed; z-index: 2147483647; right: 16px; bottom: 16px; max-width: 430px; padding: 18px; color: #fff; background: #111827; border: 1px solid rgba(255,255,255,.25); border-radius: 14px; box-shadow: 0 16px 48px rgba(0,0,0,.35); font: 14px/1.45 Arial,sans-serif; }
    .uc-consent h2 { margin: 0 0 6px; font-size: 17px; } .uc-consent p { margin: 0 0 14px; } .uc-consent-actions { display: flex; flex-wrap: wrap; gap: 8px; } .uc-consent button { cursor: pointer; padding: 9px 12px; color: inherit; background: transparent; border: 1px solid rgba(255,255,255,.55); border-radius: 7px; font: inherit; } .uc-consent .uc-primary { color: #111827; background: #63f07a; border-color: #63f07a; } .uc-privacy { position: fixed; z-index: 2147483646; right: 16px; bottom: 16px; padding: 8px 10px; color: #fff; background: #111827; border: 1px solid rgba(255,255,255,.35); border-radius: 7px; font: 13px Arial,sans-serif; cursor: pointer; }
    @media (max-width: 600px) { .uc-consent { right: 12px; bottom: 12px; left: 12px; max-width: none; } }
  `;
  document.head.append(style);

  const renderConsent = (editing = false) => {
    document.querySelector(".uc-consent, .uc-privacy")?.remove();
    if (preferences && !editing) {
      const button = document.createElement("button");
      button.className = "uc-privacy";
      button.type = "button";
      button.textContent = "Privacidad";
      button.addEventListener("click", () => renderConsent(true));
      document.body.append(button);
      return;
    }
    const panel = document.createElement("section");
    panel.className = "uc-consent";
    panel.setAttribute("role", "region");
    panel.setAttribute("aria-label", "Preferencias de privacidad");
    const defaults = preferences || { analytics: false, advertising: false };
    panel.innerHTML = `<h2>Tu privacidad, bajo tu control</h2><p>Usamos medición para entender qué contenidos funcionan y publicidad solo si la autorizas.</p>${editing ? `<label><input type="checkbox" data-analytics ${defaults.analytics ? "checked" : ""}> Analítica</label><br><label><input type="checkbox" data-advertising ${defaults.advertising ? "checked" : ""}> Publicidad</label><br><br>` : ""}<div class="uc-consent-actions"><button type="button" data-reject>Rechazar opcionales</button>${!editing ? '<button type="button" data-configure>Configurar</button>' : '<button type="button" data-cancel>Cancelar</button>'}<button type="button" class="uc-primary" data-accept>${editing ? "Guardar preferencias" : "Aceptar todas"}</button></div>`;
    const save = (selection) => {
      preferences = { ...selection, policyVersion: POLICY_VERSION, updatedAt: new Date().toISOString() };
      window.localStorage.setItem(CONSENT_KEY, JSON.stringify(preferences));
      updateGoogleConsent(preferences);
      loadConsentedTags(preferences);
      if (!preferences.advertising) window.sessionStorage.removeItem(ATTRIBUTION_KEY);
      else if (Object.keys(capturedParams).length) window.sessionStorage.setItem(ATTRIBUTION_KEY, JSON.stringify({ params: capturedParams, landingPath: window.location.pathname || "/", capturedAt: new Date().toISOString() }));
      renderConsent();
    };
    panel.querySelector("[data-reject]").addEventListener("click", () => save({ analytics: false, advertising: false }));
    panel.querySelector("[data-accept]").addEventListener("click", () => {
      save(editing ? { analytics: panel.querySelector("[data-analytics]").checked, advertising: panel.querySelector("[data-advertising]").checked } : { analytics: true, advertising: true });
    });
    panel.querySelector("[data-configure]")?.addEventListener("click", () => renderConsent(true));
    panel.querySelector("[data-cancel]")?.addEventListener("click", () => renderConsent());
    document.body.append(panel);
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => renderConsent(), { once: true });
  else renderConsent();
})();
