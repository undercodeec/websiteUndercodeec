import { ATTRIBUTION_REFERENCE_PATTERN } from "./schema.mjs";

const COMMERCIAL_NUMBERS = new Set(["593999739534"]);

export function isCommercialWhatsAppUrl(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.hostname !== "wa.me") return false;
    const number = url.pathname.replace(/^\/+|\/+$/g, "");
    return COMMERCIAL_NUMBERS.has(number);
  } catch {
    return false;
  }
}

export function appendReferenceToWhatsAppUrl(value, reference) {
  if (!isCommercialWhatsAppUrl(value)) return value;
  if (!ATTRIBUTION_REFERENCE_PATTERN.test(reference || "")) return value;

  const url = new URL(value);
  const message = url.searchParams.get("text") || "Hola, quisiera obtener información.";
  if (message.includes(`Referencia: ${reference}`)) return url.toString();
  url.searchParams.set("text", `${message} Referencia: ${reference}`);
  return url.toString();
}

export async function resolveAttributedWhatsAppUrl(value, intent, timeoutMs = 3_000) {
  if (!isCommercialWhatsAppUrl(value)) return value;
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch("/api/attribution/whatsapp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(intent),
      cache: "no-store",
      signal: controller.signal,
    });
    if (!response.ok) return value;
    const result = await response.json();
    return appendReferenceToWhatsAppUrl(value, result?.reference);
  } catch {
    return value;
  } finally {
    window.clearTimeout(timeoutId);
  }
}
