export const ATTRIBUTION_PARAM_NAMES = Object.freeze([
  "gclid",
  "gbraid",
  "wbraid",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_id",
  "utm_content",
  "utm_term",
]);

const CLICK_ID_NAMES = new Set(["gclid", "gbraid", "wbraid"]);
const CONTROL_CHARACTERS = /[\u0000-\u001F\u007F]/;
const CLICK_ID_PATTERN = /^[A-Za-z0-9._~-]+$/;

function isAllowedValue(name, value) {
  if (!value) return false;
  const maxLength = CLICK_ID_NAMES.has(name) ? 512 : 256;
  if (value.length > maxLength || CONTROL_CHARACTERS.test(value)) return false;
  return !CLICK_ID_NAMES.has(name) || CLICK_ID_PATTERN.test(value);
}

export function parseAttributionParams(input) {
  const searchParams =
    input instanceof URLSearchParams
      ? input
      : new URLSearchParams(typeof input === "string" ? input : "");
  const result = {};

  ATTRIBUTION_PARAM_NAMES.forEach((name) => {
    const value = searchParams.get(name);
    if (value !== null && isAllowedValue(name, value)) result[name] = value;
  });

  return result;
}

export function hasAttributionParams(value) {
  return ATTRIBUTION_PARAM_NAMES.some((name) => typeof value?.[name] === "string");
}

export function parseStoredAttribution(rawValue) {
  try {
    const value = JSON.parse(rawValue || "null");
    if (!value || !value.params || typeof value.params !== "object" || Array.isArray(value.params)) return null;
    const params = parseAttributionParams(new URLSearchParams(value.params));
    if (!hasAttributionParams(params) || typeof value.capturedAt !== "string" || !Number.isFinite(Date.parse(value.capturedAt))) return null;
    return {
      params,
      landingPath: sanitizeLandingPath(value.landingPath),
      capturedAt: new Date(value.capturedAt).toISOString(),
    };
  } catch {
    return null;
  }
}

// Keep the existing single-touch contract until first/last policy is agreed.
// A new tagged visit is a complete snapshot, never a merge of two campaigns.
export function captureAttributionTouch(previous, search, pathname, now = new Date()) {
  const params = parseAttributionParams(search);
  if (!hasAttributionParams(params)) return previous || null;
  const landingPath = sanitizeLandingPath(pathname);
  if (previous?.landingPath === landingPath
    && ATTRIBUTION_PARAM_NAMES.every((name) => previous.params?.[name] === params[name])) {
    return previous;
  }
  return { params, landingPath, capturedAt: now.toISOString() };
}

const SESSION_IDLE_MS = 30 * 60_000;

export function parseStoredAttributionSession(rawValue, now = new Date()) {
  try {
    const value = JSON.parse(rawValue || "null");
    if (value?.schemaVersion !== 2 || typeof value.lastActivityAt !== "string") return null;
    const lastActivity = Date.parse(value.lastActivityAt);
    if (!Number.isFinite(lastActivity) || lastActivity > now.getTime() || now.getTime() - lastActivity >= SESSION_IDLE_MS) return null;
    const readTouch = (touch) => {
      if (!touch || typeof touch !== "object" || Array.isArray(touch)) return null;
      const parsed = parseStoredAttribution(JSON.stringify({ ...touch, capturedAt: touch.capturedAt }));
      if (!parsed || parsed.landingPath !== touch.landingPath) return null;
      const visited = Date.parse(parsed.capturedAt);
      if (visited > lastActivity) return null;
      return parsed;
    };
    const firstTouch = readTouch(value.firstTouch);
    const lastTouch = readTouch(value.lastTouch);
    if (!firstTouch || !lastTouch || Date.parse(firstTouch.capturedAt) > Date.parse(lastTouch.capturedAt)) return null;
    return { schemaVersion: 2, firstTouch, lastTouch, lastActivityAt: new Date(lastActivity).toISOString() };
  } catch {
    return null;
  }
}

export function captureAttributionSession(previous, search, pathname, now = new Date()) {
  const validPrevious = previous && parseStoredAttributionSession(JSON.stringify(previous), now);
  const params = parseAttributionParams(search);
  if (!hasAttributionParams(params)) return validPrevious ? { ...validPrevious, lastActivityAt: now.toISOString() } : null;
  const landingPath = sanitizeLandingPath(pathname);
  const same = validPrevious?.lastTouch?.landingPath === landingPath
    && ATTRIBUTION_PARAM_NAMES.every((name) => validPrevious.lastTouch.params[name] === params[name]);
  const lastTouch = same ? validPrevious.lastTouch : { params, landingPath, capturedAt: now.toISOString() };
  return {
    schemaVersion: 2,
    firstTouch: validPrevious?.firstTouch || lastTouch,
    lastTouch,
    lastActivityAt: now.toISOString(),
  };
}

export function toIntentTouch(touch) {
  if (!touch) return null;
  return {
    landingPath: touch.landingPath,
    visitedAt: touch.capturedAt,
    clickIds: {
      gclid: touch.params.gclid || null,
      gbraid: touch.params.gbraid || null,
      wbraid: touch.params.wbraid || null,
    },
    utm: {
      id: touch.params.utm_id || null,
      source: touch.params.utm_source || null,
      medium: touch.params.utm_medium || null,
      campaign: touch.params.utm_campaign || null,
      content: touch.params.utm_content || null,
      term: touch.params.utm_term || null,
    },
  };
}

export function toIntentAttribution(params = {}) {
  return {
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
  };
}

export function sanitizeLandingPath(pathname) {
  if (typeof pathname !== "string") return "/";
  if (!pathname.startsWith("/") || pathname.length > 512) return "/";
  if (pathname.includes("?") || pathname.includes("#") || CONTROL_CHARACTERS.test(pathname)) {
    return "/";
  }
  return pathname;
}
