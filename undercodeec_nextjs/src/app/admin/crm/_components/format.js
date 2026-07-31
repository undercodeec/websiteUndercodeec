export function contactName(contact) {
  return contact?.name || contact?.phone || contact?.waId || "Contacto sin nombre";
}

export function contactPhone(contact) {
  return contact?.phone || contact?.waId || "Sin teléfono";
}

export function initials(name) {
  return String(name || "?")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function formatDate(value, options = {}) {
  if (!value) return "Sin fecha";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sin fecha";
  return new Intl.DateTimeFormat("es-EC", {
    day: "2-digit",
    month: "short",
    year: options.withYear ? "numeric" : undefined,
    hour: options.withTime === false ? undefined : "2-digit",
    minute: options.withTime === false ? undefined : "2-digit",
  }).format(date);
}

export function relativeDate(value) {
  if (!value) return "Sin actividad";
  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return "Sin actividad";
  const seconds = Math.round((timestamp - Date.now()) / 1000);
  const absolute = Math.abs(seconds);
  let unit = "second";
  let divisor = 1;
  if (absolute >= 86400) {
    unit = "day";
    divisor = 86400;
  } else if (absolute >= 3600) {
    unit = "hour";
    divisor = 3600;
  } else if (absolute >= 60) {
    unit = "minute";
    divisor = 60;
  }
  return new Intl.RelativeTimeFormat("es", { numeric: "auto" }).format(
    Math.round(seconds / divisor),
    unit,
  );
}

export function percent(value) {
  if (value === null || value === undefined) return "—";
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "—";
  return `${Math.round(numeric <= 1 ? numeric * 100 : numeric)}%`;
}

export function money(value) {
  if (value === null || value === undefined) return "—";
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "—";
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(numeric);
}

export function lastMessage(conversation) {
  const message = conversation?.messages?.[0];
  return message?.content || "Aún no hay mensajes";
}

export function apiErrorMessage(error, fallback) {
  return error?.message || fallback;
}
