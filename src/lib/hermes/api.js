const API_BASE_URL = (
  process.env.NEXT_PUBLIC_HERMES_API_URL || "/api/hermes"
).replace(/\/+$/, "");
const ADMIN_API_BASE_URL = (
  process.env.NEXT_PUBLIC_ADMIN_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://api.undercodeec.com"
).replace(/\/+$/, "");

export const HERMES_TOKEN_KEY = "hermesCrmToken";
export const HERMES_USER_KEY = "hermesCrmUser";
export const HERMES_REFRESH_KEY = "hermesCrmRefreshToken";
export const HERMES_DEADLINE_KEY = "hermesCrmExpiresAt";
export const ADMIN_TOKEN_KEY = "adminToken";
export const HERMES_SESSION_EXPIRED_EVENT = "hermes:session-expired";
export const HERMES_CUSTOMER_MESSAGE_EVENT = "hermes:customer-message";
export const HERMES_CONVERSATION_READ_EVENT = "hermes:conversation-read";

export function parseHermesDeadline(value) {
  if (typeof value !== "string" || !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d+)?Z$/.test(value)) return 0;
  const time = Date.parse(value);
  return Number.isSafeInteger(time) && time > 0 ? time : 0;
}

function readStoredValue(key) {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(key);
}

function errorMessage(payload, fallback) {
  if (Array.isArray(payload?.message)) return payload.message.join(". ");
  return payload?.message || payload?.error || fallback;
}

export class HermesApiError extends Error {
  constructor(message, { status = 0, code = "", payload = null } = {}) {
    super(message);
    this.name = "HermesApiError";
    this.status = status;
    this.code = code;
    this.payload = payload;
  }
}

export function getHermesToken() {
  return readStoredValue(HERMES_TOKEN_KEY);
}

export function getHermesRefreshToken() {
  return readStoredValue(HERMES_REFRESH_KEY);
}

export function getHermesDeadline() {
  const value = Number(readStoredValue(HERMES_DEADLINE_KEY));
  return Number.isSafeInteger(value) && value > 0 ? value : 0;
}

function webAccessExpiry(token) {
  try {
    const claims = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return claims.typ === "web" && Number.isSafeInteger(claims.exp) ? claims.exp * 1000 : 0;
  } catch { return 0; }
}

export function getHermesAccessDeadline() {
  return webAccessExpiry(getHermesToken() || "");
}

export function getAdminToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function getStoredHermesUser() {
  const stored = readStoredValue(HERMES_USER_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function saveHermesSession(accessToken, user, adminToken, refreshToken, expiresAt) {
  const deadline = parseHermesDeadline(expiresAt);
  if (!accessToken || !refreshToken || deadline <= Date.now()) {
    throw new HermesApiError("Hermes no confirmo la sesion web.");
  }
  window.sessionStorage.setItem(HERMES_TOKEN_KEY, accessToken);
  window.sessionStorage.setItem(HERMES_USER_KEY, JSON.stringify(user));
  window.sessionStorage.setItem(HERMES_REFRESH_KEY, refreshToken);
  window.sessionStorage.setItem(HERMES_DEADLINE_KEY, String(deadline));
  window.localStorage.setItem(ADMIN_TOKEN_KEY, adminToken);
}

export function clearHermesSession() {
  if (typeof window === "undefined") return;
  clearHermesAccess();
  window.localStorage.removeItem(ADMIN_TOKEN_KEY);
}

export function clearHermesAccess() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(HERMES_TOKEN_KEY);
  window.sessionStorage.removeItem(HERMES_USER_KEY);
  window.sessionStorage.removeItem(HERMES_REFRESH_KEY);
  window.sessionStorage.removeItem(HERMES_DEADLINE_KEY);
}

let refreshInFlight = null;
let logoutInFlight = null;

function storeRotatedWebSession(session, expectedRefresh) {
  if (getHermesRefreshToken() !== expectedRefresh) throw new HermesApiError("La sesion Hermes cambio durante la renovacion.");
  const deadline = parseHermesDeadline(session?.expiresAt);
  if (!session?.accessToken || !session?.refreshToken || deadline <= Date.now()) {
    throw new HermesApiError("Hermes no confirmo la renovacion web.");
  }
  window.sessionStorage.setItem(HERMES_TOKEN_KEY, session.accessToken);
  window.sessionStorage.setItem(HERMES_REFRESH_KEY, session.refreshToken);
  window.sessionStorage.setItem(HERMES_DEADLINE_KEY, String(Math.max(getHermesDeadline(), deadline)));
  if (session.user) window.sessionStorage.setItem(HERMES_USER_KEY, JSON.stringify(session.user));
  window.dispatchEvent(new CustomEvent("hermes:token-rotated"));
  return session;
}

export function refreshHermesWebSession() {
  if (refreshInFlight) return refreshInFlight;
  if (logoutInFlight) return Promise.reject(new HermesApiError("La sesion Hermes se esta cerrando."));
  const refreshToken = getHermesRefreshToken();
  if (!refreshToken || !getAdminToken()) return Promise.reject(new HermesApiError("Sesion web no disponible."));
  refreshInFlight = (async () => {
    const adminToken = getAdminToken();
    const admin = await adminApi.profile();
    if (adminToken !== getAdminToken() || !Number.isSafeInteger(admin?.expiresAt) || admin.expiresAt <= Date.now() ||
        admin?.user?.email?.trim().toLowerCase() !== "gerencia@undercodeec.com") {
      throw new HermesApiError("Sesion administrativa no verificada.");
    }
    try {
      const session = await request("/auth/web/refresh", { method: "POST", auth: false,
        body: { refreshToken }, cache: "no-store" });
      return storeRotatedWebSession(session, refreshToken);
    } catch (error) {
      if (error?.status === 401 && getHermesRefreshToken() === refreshToken) {
        clearHermesAccess();
        window.dispatchEvent(new CustomEvent(HERMES_SESSION_EXPIRED_EVENT));
      }
      throw error;
    }
  })().finally(() => { refreshInFlight = null; });
  return refreshInFlight;
}

async function currentHermesAccess() {
  const token = getHermesToken();
  if (getHermesRefreshToken() && (!token || !webAccessExpiry(token) || webAccessExpiry(token) - Date.now() < 60_000)) {
    await refreshHermesWebSession();
  }
  return getHermesToken();
}

export function toQueryString(params = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    searchParams.set(key, String(value));
  });
  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

async function request(path, options = {}) {
  const {
    auth = true,
    retryAfterRotation = false,
    body,
    headers: customHeaders,
    ...fetchOptions
  } = options;
  const token = auth ? await currentHermesAccess() : getHermesToken();
  const refreshAtStart = getHermesRefreshToken();
  const headers = new Headers(customHeaders);
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  if (body !== undefined && !isFormData) headers.set("Content-Type", "application/json");
  if (auth && token) headers.set("Authorization", `Bearer ${token}`);

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...fetchOptions,
      headers,
      body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
    });
  } catch {
    throw new HermesApiError(
      "No se pudo conectar con Hermes. Revisa la conexión e inténtalo de nuevo.",
    );
  }

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json().catch(() => null)
    : await response.text().catch(() => "");

  if (!response.ok) {
    if (response.status === 401 && auth && !retryAfterRotation && token === getHermesToken() &&
        refreshAtStart && webAccessExpiry(token) && webAccessExpiry(token) <= Date.now()) {
      await refreshHermesWebSession();
      return request(path, { ...options, retryAfterRotation: true });
    }
    if (response.status === 401 && auth && !retryAfterRotation && refreshAtStart &&
        refreshAtStart !== getHermesRefreshToken() && token !== getHermesToken()) {
      return request(path, { ...options, retryAfterRotation: true });
    }
    if (response.status === 401 && auth && token === getHermesToken() && path !== "/auth/profile") {
      clearHermesAccess();
      window.dispatchEvent(new CustomEvent(HERMES_SESSION_EXPIRED_EVENT));
    }
    throw new HermesApiError(
      errorMessage(payload, `Hermes respondió con estado ${response.status}.`),
      {
        status: response.status,
        code: payload?.code || "",
        payload,
      },
    );
  }

  return payload;
}

function parseServerEvent(block) {
  let type = "message";
  const dataLines = [];
  let retry;

  block.split("\n").forEach((line) => {
    if (line.startsWith("event:")) type = line.slice(6).trim() || "message";
    if (line.startsWith("data:")) dataLines.push(line.slice(5).trimStart());
    if (line.startsWith("retry:")) retry = Number(line.slice(6).trim());
  });

  const rawData = dataLines.join("\n");
  let data = rawData;
  if (rawData) {
    try {
      data = JSON.parse(rawData);
    } catch {
      // Algunos proxies pueden entregar eventos de diagnóstico como texto.
    }
  }
  return { type, data, retry };
}

function reconnectDelay(ms, signal) {
  return new Promise((resolve) => {
    let timer;
    const finish = () => {
      window.clearTimeout(timer);
      signal.removeEventListener("abort", finish);
      resolve();
    };
    timer = window.setTimeout(finish, ms);
    if (signal.aborted) finish();
    else signal.addEventListener("abort", finish, { once: true });
  });
}

export function subscribeHermesEvents(onEvent, onConnectionChange = () => {}) {
  const controller = new AbortController();
  const { signal } = controller;
  let activeConnection;
  let rotated = false;
  const onRotation = () => { rotated = true; activeConnection?.abort(); };
  window.addEventListener("hermes:token-rotated", onRotation);

  const connect = async () => {
    let retryDelay = 3000;
    while (!signal.aborted) {
      try {
        rotated = false;
        const token = await currentHermesAccess();
        rotated = false;
        if (!token) return;
        activeConnection = new AbortController();
        const onStop = () => activeConnection?.abort();
        signal.addEventListener("abort", onStop, { once: true });
        const response = await fetch(`${API_BASE_URL}/conversations/events`, {
          headers: {
            Accept: "text/event-stream",
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
          signal: activeConnection.signal,
        });
        signal.removeEventListener("abort", onStop);
        if (response.status === 401) {
          if (rotated) continue;
          if (token === getHermesToken() && getHermesRefreshToken() &&
              webAccessExpiry(token) && webAccessExpiry(token) <= Date.now()) {
            await refreshHermesWebSession();
            continue;
          }
          if (token === getHermesToken() && !rotated) {
            clearHermesAccess();
            window.dispatchEvent(new CustomEvent(HERMES_SESSION_EXPIRED_EVENT));
          }
          return;
        }
        if (!response.ok || !response.body) {
          throw new Error(`No se pudo abrir el canal en tiempo real (${response.status}).`);
        }

        onConnectionChange(true);
        retryDelay = 3000;
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (!signal.aborted) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer = `${buffer}${decoder.decode(value, { stream: true })}`.replace(
            /\r\n/g,
            "\n",
          );
          let boundary = buffer.indexOf("\n\n");
          while (boundary >= 0) {
            const block = buffer.slice(0, boundary).trim();
            buffer = buffer.slice(boundary + 2);
            if (block && !block.startsWith(":")) {
              const event = parseServerEvent(block);
              if (Number.isFinite(event.retry) && event.retry >= 1000) {
                retryDelay = Math.min(event.retry, 30000);
              }
              onEvent(event);
            }
            boundary = buffer.indexOf("\n\n");
          }
        }
      } catch (error) {
        if (signal.aborted) return;
        if (error?.name === "AbortError" && !rotated) return;
      } finally {
        activeConnection = null;
        onConnectionChange(false);
      }

      if (rotated) continue;
      await reconnectDelay(retryDelay, signal);
      retryDelay = Math.min(retryDelay * 2, 30000);
    }
  };

  void connect();
  return () => { window.removeEventListener("hermes:token-rotated", onRotation); controller.abort(); activeConnection?.abort(); };
}

async function requestAdminCrmAuth(path, body) {
  let response;
  try {
    response = await fetch(`${ADMIN_API_BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new HermesApiError("No se pudo conectar con el servicio de acceso.");
  }

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new HermesApiError(
      errorMessage(payload, "No se pudo procesar el acceso al CRM."),
      { status: response.status, code: payload?.code || "", payload },
    );
  }
  return payload;
}

async function requestAdmin(path, options = {}) {
  const {
    body,
    broadcastUnauthorized = true,
    headers: customHeaders,
    ...fetchOptions
  } = options;
  const headers = new Headers(customHeaders);
  const token = getAdminToken();

  if (body !== undefined) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let response;
  try {
    response = await fetch(`${ADMIN_API_BASE_URL}${path}`, {
      ...fetchOptions,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new HermesApiError("No se pudo conectar con el servicio administrativo.");
  }

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 401 && broadcastUnauthorized && token === getAdminToken()) {
      const refreshToken = getHermesRefreshToken();
      clearHermesSession();
      window.dispatchEvent(new CustomEvent(HERMES_SESSION_EXPIRED_EVENT));
      // Best effort only: a server-to-server binding is needed for guaranteed
      // cross-system revocation when this browser is offline.
      if (refreshToken) void request("/auth/web/logout-refresh", { method: "POST", auth: false,
        body: { refreshToken }, cache: "no-store" }).catch(() => {});
    }
    throw new HermesApiError(
      errorMessage(payload, `Administración respondió con estado ${response.status}.`),
      { status: response.status, code: payload?.code || "", payload },
    );
  }
  return payload;
}

export const hermesApi = {
  requestAccessCode(email) {
    return requestAdminCrmAuth("/api/crm/auth/request-code", { email });
  },
  async loginWithCode({ email, code }) {
    const verification = await requestAdminCrmAuth("/api/crm/auth/verify-code", {
      email,
      code,
    });
    if (!verification?.proof || !verification?.adminToken) {
      throw new HermesApiError("No se pudo completar la verificacion del codigo.");
    }
    const session = await request("/auth/crm-proof", {
      method: "POST",
      auth: false,
      body: { proof: verification.proof },
    });
    return { ...session, adminToken: verification.adminToken };
  },
  async renewSession() {
    // The admin session is checked server-side on every proof issuance. Never
    // exchange a cached proof or trust a locally stored operator identity.
    if (refreshInFlight) return refreshInFlight;
    if (logoutInFlight) throw new HermesApiError("La sesion Hermes se esta cerrando.");
    const existingRefreshToken = getHermesRefreshToken();
    if (!existingRefreshToken) throw new HermesApiError("La sesion Hermes fue cerrada. Solicita un nuevo codigo.");
    refreshInFlight = (async () => {
      const admin = await adminApi.profile();
      if (!Number.isSafeInteger(admin?.expiresAt) || admin.expiresAt <= Date.now() ||
          admin?.user?.email?.trim().toLowerCase() !== "gerencia@undercodeec.com") {
        throw new HermesApiError("Acceso CRM no autorizado.", { status: 403 });
      }
      const { proof } = await requestAdmin("/api/crm/auth/session-proof", { method: "POST" });
      if (typeof proof !== "string") throw new HermesApiError("No se pudo renovar el acceso CRM.");
      const session = await request("/auth/crm-proof", {
        method: "POST", auth: false, body: { proof, existingRefreshToken }, cache: "no-store",
      });
      return storeRotatedWebSession(session, existingRefreshToken);
    })().finally(() => { refreshInFlight = null; });
    return refreshInFlight;
  },
  async webSession() {
    const token = getHermesToken();
    const result = await request("/auth/web/session", { cache: "no-store" });
    if (result?.active && getHermesToken() === token) {
      const deadline = parseHermesDeadline(result.expiresAt);
      if (deadline) window.sessionStorage.setItem(HERMES_DEADLINE_KEY, String(Math.max(getHermesDeadline(), deadline)));
    }
    return result;
  },
  async webActivity() {
    const result = await request("/auth/web/activity", { method: "POST", cache: "no-store" });
    const deadline = parseHermesDeadline(result?.expiresAt);
    if (result?.active && deadline && getHermesRefreshToken()) {
      window.sessionStorage.setItem(HERMES_DEADLINE_KEY, String(Math.max(getHermesDeadline(), deadline)));
    }
    return result;
  },
  logoutWeb() {
    if (logoutInFlight) return logoutInFlight;
    const initialRefresh = getHermesRefreshToken();
    const sessionId = initialRefresh?.split(".")[0];
    logoutInFlight = (async () => {
      if (refreshInFlight) await refreshInFlight.catch(() => {});
      const refreshToken = getHermesRefreshToken();
      if (!refreshToken || refreshToken.split(".")[0] !== sessionId) return;
      await request("/auth/web/logout-refresh", { method: "POST", auth: false,
        body: { refreshToken }, cache: "no-store" });
    })().finally(() => {
      if (sessionId && getHermesRefreshToken()?.split(".")[0] === sessionId) clearHermesAccess();
      logoutInFlight = null;
    });
    return logoutInFlight;
  },
  profile() {
    return request("/auth/profile");
  },
  async revokeAllMobileAccess() {
    const result = await request("/auth/mobile/revoke-all", { method: "POST", cache: "no-store" });
    // Hermes returns a count (zero is valid); a 200 with a malformed body is
    // not evidence that remote revocation was confirmed.
    if (!Number.isSafeInteger(result?.revokedSessions) || result.revokedSessions < 0) {
      throw new HermesApiError("No se pudo confirmar la revocacion remota.");
    }
    return result;
  },
  priceLists() {
    return request("/price-lists", { cache: "no-store" });
  },
  priceList(id) {
    return request(`/price-lists/${encodeURIComponent(id)}`, { cache: "no-store" });
  },
  priceListAudit(id) {
    return request(`/price-lists/${encodeURIComponent(id)}/audit`, { cache: "no-store" });
  },
  updatePriceListStatus(id, isActive) {
    return request(`/price-lists/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: { isActive },
    });
  },
  overview() {
    return request("/analytics/crm-overview");
  },
  funnel() {
    return request("/analytics/funnel");
  },
  acquisitionSummary(params) {
    return request(`/analytics/acquisition${toQueryString(params)}`);
  },
  advertisingDashboard(params) {
    return request(`/advertising/dashboard${toQueryString(params)}`);
  },
  advertisingStatus() {
    return request("/advertising/status");
  },
  updateAdvertisingIntegration(data) {
    return request("/advertising/integration", { method: "PUT", body: data });
  },
  advertisingMappings() {
    return request("/advertising/mappings");
  },
  updateAdvertisingMapping(data) {
    return request("/advertising/mappings", { method: "PUT", body: data });
  },
  advertisingMetrics(params) {
    return request(`/advertising/metrics${toQueryString(params)}`);
  },
  syncAdvertisingMetrics(data) {
    return request("/advertising/metrics/sync", { method: "POST", body: data });
  },
  advertisingLeadHistory(id) {
    return request(`/advertising/leads/${encodeURIComponent(id)}/history`);
  },
  recordAdvertisingEvent(id, data) {
    return request(`/advertising/leads/${encodeURIComponent(id)}/events`, {
      method: "POST",
      body: data,
    });
  },
  revokeAdvertisingConsent(contactId, reason) {
    return request(`/advertising/contacts/${encodeURIComponent(contactId)}/revoke`, {
      method: "POST",
      body: { reason },
    });
  },
  leads(params) {
    return request(`/leads${toQueryString(params)}`);
  },
  /**
   * Read-only Hermes meetings. All dates are ISO instants; timezone filters
   * the stored meeting timezone and is independent of the display timezone.
   * @param {{from: string, to: string, status?: 'PENDING'|'CONFIRMED'|'CANCELLED'|'FAILED', timezone?: string}} params
   * @returns {Promise<{data: Array<{id: string, status: string, startAt: string, endAt: string, timezone: string, meetUrl: string|null, serviceContext: string|null, cancelledAt: string|null, contact: {id: string, name: string|null, company: string|null, email: string|null, phone: string|null, waId: string}, lead: {id: string, stage: string, productOfInterest: string|null}|null, conversation: {id: string, status: string}|null, task: {id: string, status: string, title: string}|null}>, range: {from: string, to: string}}>}
   */
  meetings({ from, to, status, timezone }) {
    return request(`/meetings${toQueryString({ from, to, status, timezone })}`, { cache: "no-store" });
  },
  lead(id) {
    return request(`/leads/${encodeURIComponent(id)}`);
  },
  bankAccounts() {
    return request('/bank-accounts');
  },
  createBankAccount(data) {
    return request('/bank-accounts', { method: 'POST', body: data });
  },
  updateBankAccount(id, data) {
    return request(`/bank-accounts/${encodeURIComponent(id)}`, { method: 'PUT', body: data });
  },
  transferByConversation(id) {
    return request(`/transfers/conversation/${encodeURIComponent(id)}`);
  },
  startTransferReview(id) {
    return request(`/transfers/${encodeURIComponent(id)}/start-review`, { method: 'POST', body: {} });
  },
  approveTransfer(id, data) {
    return request(`/transfers/${encodeURIComponent(id)}/approve`, { method: 'POST', body: data });
  },
  rejectTransfer(id, data) {
    return request(`/transfers/${encodeURIComponent(id)}/reject`, { method: 'POST', body: data });
  },
  async inboxMedia(conversationId, messageId, retried = false) {
    const token = await currentHermesAccess();
    const refreshAtStart = getHermesRefreshToken();
    const response = await fetch(`${API_BASE_URL}/conversations/${encodeURIComponent(conversationId)}/messages/${encodeURIComponent(messageId)}/media`, {
      headers: { Authorization: `Bearer ${token}` }, cache: 'no-store',
    });
    if (!response.ok) {
      if (response.status === 401 && !retried && token === getHermesToken() &&
          refreshAtStart && webAccessExpiry(token) && webAccessExpiry(token) <= Date.now()) {
        await refreshHermesWebSession();
        return this.inboxMedia(conversationId, messageId, true);
      }
      if (response.status === 401 && !retried && refreshAtStart &&
          refreshAtStart !== getHermesRefreshToken() && token !== getHermesToken()) {
        return this.inboxMedia(conversationId, messageId, true);
      }
      if (response.status === 401 && token === getHermesToken()) {
        clearHermesAccess();
        window.dispatchEvent(new CustomEvent(HERMES_SESSION_EXPIRED_EVENT));
      }
      throw new HermesApiError('No se pudo abrir el adjunto de WhatsApp.', { status: response.status });
    }
    return response.blob();
  },
  updateLead(id, changes) {
    return request(`/leads/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: changes,
    });
  },
  conversations(params) {
    return request(`/conversations${toQueryString(params)}`);
  },
  conversation(id) {
    return request(`/conversations/${encodeURIComponent(id)}`);
  },
  messages(id, params) {
    return request(
      `/conversations/${encodeURIComponent(id)}/messages${toQueryString(params)}`,
    );
  },
  feedbackForConversation(id) {
    return request(`/feedback/conversation/${encodeURIComponent(id)}`);
  },
  createFeedback(data) {
    return request('/feedback', { method: 'POST', body: data });
  },
  learningCandidates() {
    return request('/learning/candidates');
  },
  decideLearningCandidate(id, data) {
    return request(`/learning/candidates/${encodeURIComponent(id)}/decision`, { method: 'POST', body: data });
  },
  reply(id, content) {
    return request(`/conversations/${encodeURIComponent(id)}/reply`, {
      method: "POST",
      body: { content },
    });
  },
  closeConversation(id) {
    return request(`/conversations/${encodeURIComponent(id)}/close`, {
      method: "PUT",
      body: {},
    });
  },
  reopenConversation(id) {
    return request(`/conversations/${encodeURIComponent(id)}/reopen`, {
      method: "PUT",
      body: {},
    });
  },
  createHandoff(conversationId, reason, reasonDetail) {
    return request("/handoff", {
      method: "POST",
      body: { conversationId, reason, reasonDetail },
    });
  },
  takeHandoff(id) {
    return request(`/handoff/${encodeURIComponent(id)}/take`, {
      method: "PUT",
      body: {},
    });
  },
  resolveHandoff(id, resolution, action) {
    return request(`/handoff/${encodeURIComponent(id)}/resolve`, {
      method: "PUT",
      body: { resolution, action },
    });
  },
  campaigns(params) {
    return request(`/campaigns${toQueryString(params)}`);
  },
  campaign(id) {
    return request(`/campaigns/${encodeURIComponent(id)}`);
  },
  campaignRecipients(id, params) {
    return request(`/campaigns/${encodeURIComponent(id)}/recipients${toQueryString(params)}`);
  },
  campaignTemplates() {
    return request("/campaigns/templates");
  },
  configureCampaignTemplateMedia(data) {
    return request("/campaigns/templates/media", { method: "PUT", body: data });
  },
  campaignMedia() {
    return request("/campaigns/media");
  },
  uploadCampaignMedia(file, name) {
    const body = new FormData();
    body.append("file", file);
    if (name) body.append("name", name);
    return request("/campaigns/media", { method: "POST", body });
  },
  registerCampaignMedia(data) {
    return request("/campaigns/media/register", { method: "POST", body: data });
  },
  createCampaign(data) {
    return request("/campaigns", { method: "POST", body: data });
  },
  importCampaignContacts(id, contacts) {
    return request(`/campaigns/${encodeURIComponent(id)}/contacts`, {
      method: "POST", body: { contacts },
    });
  },
  startCampaign(id) {
    return request(`/campaigns/${encodeURIComponent(id)}/start`, { method: "POST", body: {} });
  },
  pauseCampaign(id) {
    return request(`/campaigns/${encodeURIComponent(id)}/pause`, { method: "POST", body: {} });
  },
  resumeCampaign(id) {
    return request(`/campaigns/${encodeURIComponent(id)}/resume`, { method: "POST", body: {} });
  },
  cancelCampaign(id) {
    return request(`/campaigns/${encodeURIComponent(id)}/cancel`, { method: "POST", body: {} });
  },
};

export const adminApi = {
  activity() {
    return requestAdmin("/api/admin/activity", { method: "POST" });
  },
  profile() {
    return requestAdmin("/api/admin/profile");
  },
  logout() {
    return requestAdmin("/api/admin/logout", {
      method: "POST",
      broadcastUnauthorized: false,
    });
  },
};
