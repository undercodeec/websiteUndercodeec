export const ATTRIBUTION_PARAM_NAMES = Object.freeze([
  "gclid",
  "gbraid",
  "wbraid",
  "utm_source",
  "utm_medium",
  "utm_campaign",
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
