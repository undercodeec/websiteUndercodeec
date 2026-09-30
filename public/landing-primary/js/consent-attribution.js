(() => {
  const CONSENT_KEY = "undercodeec_consent_v1";
  const ATTRIBUTION_KEY = "undercodeec_attribution_v2";
  const LEGACY_ATTRIBUTION_KEY = "undercodeec_attribution_v1";
  const POLICY_VERSION = "2026-09-17";
  const CONSENT_MAX_AGE_MS = 90 * 24 * 60 * 60_000;
  const WHATSAPP_NUMBER = "593999739534";
  const ATTRIBUTION_PARAMS = [
    "gclid", "gbraid", "wbraid", "utm_source", "utm_medium", "utm_campaign", "utm_id", "utm_content", "utm_term",
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
    && typeof value.advertising === "boolean"
    && typeof value.updatedAt === "string"
    && Number.isFinite(Date.parse(value.updatedAt))
    && Date.parse(value.updatedAt) <= Date.now() + 5 * 60_000
    && Date.parse(value.updatedAt) >= Date.now() - CONSENT_MAX_AGE_MS;

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
        if (fbq.callMethod) fbq.callMethod.apply(fbq, arguments);
        else fbq.queue.push(arguments);
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
  if (!preferences?.advertising) {
    try {
      window.sessionStorage.removeItem(ATTRIBUTION_KEY);
      window.sessionStorage.removeItem(LEGACY_ATTRIBUTION_KEY);
    } catch { /* Storage unavailable. */ }
  }

  const captureParams = () => {
    const values = {};
    const query = new URLSearchParams(window.location.search);
    ATTRIBUTION_PARAMS.forEach((name) => {
      const value = query.get(name);
      if (value && value.length <= (name.startsWith("utm_") ? 256 : 512) && !/[\u0000-\u001F\u007F]/.test(value)
        && (name.startsWith("utm_") || /^[A-Za-z0-9._~-]+$/.test(value))) {
        values[name] = value;
      }
    });
    return values;
  };

  const attributionFromSession = () => {
    try {
      const value = JSON.parse(window.sessionStorage.getItem(ATTRIBUTION_KEY) || "null");
      const lastActivity = Date.parse(value?.lastActivityAt);
      if (value?.schemaVersion !== 2 || !Number.isFinite(lastActivity)
        || lastActivity > Date.now() || Date.now() - lastActivity >= 30 * 60_000
        || !Number.isFinite(Date.parse(preferences?.updatedAt))
        || Date.parse(preferences.updatedAt) > lastActivity) return null;
      const readTouch = (item) => {
        if (!item?.params || typeof item.params !== "object" || Array.isArray(item.params)) return null;
        const params = {};
        const storedParams = new URLSearchParams(item.params);
        ATTRIBUTION_PARAMS.forEach((name) => {
          const part = storedParams.get(name);
          if (part && part.length <= (name.startsWith("utm_") ? 256 : 512)
            && !/[\u0000-\u001F\u007F]/.test(part)
            && (name.startsWith("utm_") || /^[A-Za-z0-9._~-]+$/.test(part))) params[name] = part;
        });
        if (!Object.keys(params).length || typeof item.capturedAt !== "string") return null;
        const visited = Date.parse(item.capturedAt);
        if (!Number.isFinite(visited) || visited > lastActivity) return null;
        const path = item.landingPath;
        if (typeof path !== "string" || !path.startsWith("/") || path.length > 512
          || /[?#\u0000-\u001F\u007F]/.test(path)) return null;
        return { params, landingPath: path, capturedAt: new Date(visited).toISOString() };
      };
      const firstTouch = readTouch(value.firstTouch);
      const lastTouch = readTouch(value.lastTouch);
      if (!firstTouch || !lastTouch || Date.parse(firstTouch.capturedAt) > Date.parse(lastTouch.capturedAt)) return null;
      return { schemaVersion: 2, firstTouch, lastTouch, lastActivityAt: new Date(lastActivity).toISOString() };
    } catch {
      return null;
    }
  };

  let session = null;
  const captureAttribution = () => {
    if (!preferences?.advertising) return null;
    const params = captureParams();
    const stored = attributionFromSession();
    if (!stored) {
      try { window.sessionStorage.removeItem(ATTRIBUTION_KEY); } catch { /* Storage unavailable. */ }
    }
    const inMemory = session && Date.now() - Date.parse(session.lastActivityAt) < 30 * 60_000
      && Date.parse(preferences?.updatedAt) <= Date.parse(session.lastActivityAt) ? session : null;
    const previous = stored || inMemory;
    const landingPath = window.location.pathname || "/";
    if (Object.keys(params).length) {
      const same = previous?.lastTouch?.landingPath === landingPath
        && ATTRIBUTION_PARAMS.every((name) => previous.lastTouch.params?.[name] === params[name]);
      const lastTouch = same ? previous.lastTouch : { params, landingPath, capturedAt: new Date().toISOString() };
      session = { schemaVersion: 2, firstTouch: previous?.firstTouch || lastTouch,
        lastTouch, lastActivityAt: new Date().toISOString() };
    } else if (previous) {
      session = { ...previous, lastActivityAt: new Date().toISOString() };
    } else session = null;
    if (session) {
      try {
        window.sessionStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(session));
      } catch {
        // Browser storage may be unavailable; no alternate persistence is used.
      }
    }
    return session;
  };
  captureAttribution();

  const buildIntent = () => {
    const advertisingAllowed = Boolean(preferences?.advertising);
    const selected = advertisingAllowed ? captureAttribution() : null;
    const adStorage = advertisingAllowed ? "granted" : "denied";
    const contactedAt = new Date().toISOString();
    const mapTouch = (touch) => touch ? {
      landingPath: touch.landingPath,
      visitedAt: touch.capturedAt,
      clickIds: { gclid: touch.params.gclid || null, gbraid: touch.params.gbraid || null,
        wbraid: touch.params.wbraid || null },
      utm: { id: touch.params.utm_id || null, source: touch.params.utm_source || null,
        medium: touch.params.utm_medium || null, campaign: touch.params.utm_campaign || null,
        content: touch.params.utm_content || null, term: touch.params.utm_term || null },
    } : null;
    return {
      schemaVersion: 2,
      source: "undercodeec_web",
      occurredAt: contactedAt,
      firstTouch: mapTouch(selected?.firstTouch),
      lastTouch: mapTouch(selected?.lastTouch),
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
    .uc-consent { position: fixed; z-index: 2147483647; right: auto; bottom: 1.25rem; left: 1.25rem; width: min(34rem, calc(100vw - 2.5rem)); padding: 1.25rem; color: #1d1d1d; background: #f4f2ec; border: 1px solid #1d1d1d; box-shadow: .55rem .55rem 0 #1d1d1d; font: 14px/1.45 Arial, sans-serif; }
    .uc-consent h2 { margin: 0 0 .45rem; font-family: Arial, sans-serif; font-size: .72rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; } .uc-consent p { margin: 0 0 1rem; color: rgba(29,29,29,.76); } .uc-consent-actions { display: flex; flex-wrap: wrap; gap: .5rem; } .uc-consent button { min-height: 2.75rem; cursor: pointer; padding: .65rem .9rem; color: #1d1d1d; background: transparent; border: 1px solid #1d1d1d; border-radius: 0; font: 700 .72rem/1 Arial, sans-serif; letter-spacing: .06em; text-transform: uppercase; } .uc-consent button:hover, .uc-consent button:focus-visible { color: #f4f2ec; background: #1d1d1d; outline: 2px solid #efa238; outline-offset: 2px; } .uc-consent .uc-primary { color: #f4f2ec; background: #1d1d1d; } .uc-consent .uc-primary:hover, .uc-consent .uc-primary:focus-visible { color: #1d1d1d; background: #efa238; } @media (max-width: 600px) { .uc-consent { right: auto; bottom: 1rem; left: 1rem; width: calc(100vw - 2rem); } .uc-consent button { flex: 1 1 9rem; } }
    .uc-consent-settings { position: fixed; z-index: 10049; right: 1rem; bottom: 1rem; min-height: 2.75rem; padding: .55rem .8rem; color: #1d1d1d; background: #f4f2ec; border: 1px solid #1d1d1d; font: 700 .72rem/1 Arial,sans-serif; cursor: pointer; } .uc-consent-settings:focus-visible { outline: 2px solid #efa238; outline-offset: 2px; }
  `;
  document.head.append(style);

  const renderConsent = (editing = false) => {
    document.querySelector(".uc-consent")?.remove();
    if (preferences && !document.getElementById("uc-consent-settings")) {
      const settingsButton = document.createElement("button");
      settingsButton.id = "uc-consent-settings";
      settingsButton.className = "uc-consent-settings";
      settingsButton.type = "button";
      settingsButton.textContent = "Privacidad";
      settingsButton.addEventListener("click", () => renderConsent(true));
      document.body.append(settingsButton);
    }
    if (preferences && !editing) return;
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
      if (typeof window.fbq === "function") {
        window.fbq("consent", preferences.advertising ? "grant" : "revoke");
      }
      loadConsentedTags(preferences);
      if (!preferences.advertising) {
        session = null;
        try {
          window.sessionStorage.removeItem(ATTRIBUTION_KEY);
          window.sessionStorage.removeItem(LEGACY_ATTRIBUTION_KEY);
        } catch { /* Storage unavailable. */ }
      } else captureAttribution();
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

  const renderAfterPreloader = () => {
    if (document.querySelector("[preloader]")) {
      window.setTimeout(renderAfterPreloader, 100);
      return;
    }
    renderConsent();
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", renderAfterPreloader, { once: true });
  else renderAfterPreloader();
})();
