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
export const ADMIN_TOKEN_KEY = "adminToken";
export const HERMES_SESSION_EXPIRED_EVENT = "hermes:session-expired";

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

export function saveHermesSession(accessToken, user, adminToken) {
  window.sessionStorage.setItem(HERMES_TOKEN_KEY, accessToken);
  window.sessionStorage.setItem(HERMES_USER_KEY, JSON.stringify(user));
  window.localStorage.setItem(ADMIN_TOKEN_KEY, adminToken);
}

export function clearHermesSession() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(HERMES_TOKEN_KEY);
  window.sessionStorage.removeItem(HERMES_USER_KEY);
  window.localStorage.removeItem(ADMIN_TOKEN_KEY);
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
    body,
    headers: customHeaders,
    ...fetchOptions
  } = options;
  const token = getHermesToken();
  const headers = new Headers(customHeaders);

  if (body !== undefined) headers.set("Content-Type", "application/json");
  if (auth && token) headers.set("Authorization", `Bearer ${token}`);

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...fetchOptions,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
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
    if (response.status === 401 && auth) {
      clearHermesSession();
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
    if (response.status === 401 && broadcastUnauthorized) {
      clearHermesSession();
      window.dispatchEvent(new CustomEvent(HERMES_SESSION_EXPIRED_EVENT));
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
  profile() {
    return request("/auth/profile");
  },
  overview() {
    return request("/analytics/crm-overview");
  },
  funnel() {
    return request("/analytics/funnel");
  },
  leads(params) {
    return request(`/leads${toQueryString(params)}`);
  },
  lead(id) {
    return request(`/leads/${encodeURIComponent(id)}`);
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
};

export const adminApi = {
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
