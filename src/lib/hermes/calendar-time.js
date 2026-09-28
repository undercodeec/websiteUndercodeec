export const DEFAULT_TIMEZONE = "America/Guayaquil";
export const TIMEZONE_STORAGE_KEY = "hermes-crm-calendar-timezone";
export const TIMEZONE_OPTIONS = [
  { value: "America/Guayaquil", label: "Ecuador" },
  { value: "Europe/Madrid", label: "España peninsular" },
  { value: "Atlantic/Canary", label: "Islas Canarias" },
];
export const GRID_START = 7 * 60;
export const GRID_END = 21 * 60;
export const QUARTER_HEIGHT = 20;
export const GRID_HEIGHT = (GRID_END - GRID_START) / 15 * QUARTER_HEIGHT;
export const MEETING_STATUSES = {
  PENDING: { label: "En verificación", tone: "pending" },
  CONFIRMED: { label: "Confirmada", tone: "confirmed" },
  CANCELLED: { label: "Cancelada", tone: "cancelled" },
  FAILED: { label: "Fallida", tone: "failed" },
};

const formatters = new Map();
const pad = (value) => String(value).padStart(2, "0");

export function meetingStatus(status) {
  return MEETING_STATUSES[status] || { label: "Estado desconocido", tone: "unknown" };
}

export function resolveMeetingSelection(selection, meetings) {
  return selection ? meetings.find(({ id }) => id === selection.id) ?? null : null;
}

export function localParts(instant, timezone) {
  if (!formatters.has(timezone)) {
    formatters.set(timezone, new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hourCycle: "h23",
    }));
  }
  const parts = Object.fromEntries(formatters.get(timezone).formatToParts(new Date(instant))
    .filter(({ type }) => type !== "literal").map(({ type, value }) => [type, value]));
  return { date: `${parts.year}-${parts.month}-${parts.day}`, hour: Number(parts.hour), minute: Number(parts.minute) };
}

export function shiftDate(date, days) {
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

// Resolve midnight in the named timezone, recomputing its offset across DST.
function midnight(date, timezone) {
  const target = Date.parse(`${date}T00:00:00Z`);
  let instant = target;
  for (let i = 0; i < 4; i += 1) {
    const parts = localParts(instant, timezone);
    const wall = Date.parse(`${parts.date}T${pad(parts.hour)}:${pad(parts.minute)}:00Z`);
    const difference = target - wall;
    if (!difference) return new Date(instant).toISOString();
    instant += difference;
  }
  throw new RangeError("No se pudo resolver la fecha en la zona horaria seleccionada.");
}

export function dayRange(date, timezone) {
  return { from: midnight(date, timezone), to: midnight(shiftDate(date, 1), timezone) };
}

export function weekRange(date, timezone) {
  const weekday = new Date(`${date}T12:00:00Z`).getUTCDay();
  const monday = shiftDate(date, -((weekday + 6) % 7));
  return {
    from: midnight(monday, timezone), to: midnight(shiftDate(monday, 7), timezone),
    days: Array.from({ length: 7 }, (_, index) => shiftDate(monday, index)),
  };
}

export function dayLabel(date, options = {}) {
  return new Intl.DateTimeFormat("es", {
    timeZone: "UTC", weekday: "short", day: "numeric", month: "short", ...options,
  }).format(new Date(`${date}T12:00:00Z`));
}

export function formatInstant(instant, timezone) {
  return new Intl.DateTimeFormat("es", {
    timeZone: timezone, dateStyle: "medium", timeStyle: "short", hourCycle: "h23",
  }).format(new Date(instant));
}

export function formatTime(instant, timezone) {
  const { hour, minute } = localParts(instant, timezone);
  return `${pad(hour)}:${pad(minute)}`;
}

export function eventsForDay(meetings, date, timezone) {
  const { from, to } = dayRange(date, timezone);
  const lower = Date.parse(from);
  const upper = Date.parse(to);
  return meetings.filter((meeting) => Date.parse(meeting.startAt) < upper && Date.parse(meeting.endAt) > lower)
    .map((meeting) => {
      const start = Math.max(lower, Date.parse(meeting.startAt));
      const end = Math.min(upper, Date.parse(meeting.endAt));
      const startParts = localParts(start, timezone);
      const endParts = localParts(end, timezone);
      const startMinute = startParts.hour * 60 + startParts.minute;
      const endMinute = end === upper ? 1440 : endParts.hour * 60 + endParts.minute;
      return { ...meeting, startMinute, endMinute };
    }).sort((a, b) => Date.parse(a.startAt) - Date.parse(b.startAt));
}

export function eventLayout(event) {
  const start = Math.max(GRID_START, event.startMinute);
  const end = Math.min(GRID_END, event.endMinute);
  return {
    top: Math.max(0, (start - GRID_START) / 15 * QUARTER_HEIGHT),
    height: Math.max(0, (end - start) / 15 * QUARTER_HEIGHT),
    outside: end <= start,
  };
}

export function layoutDayEvents(events) {
  const result = [];
  let group = [];
  let ends = [];
  let groupEnd = -Infinity;
  const flush = () => {
    result.push(...group.map((event) => ({ ...event, columns: ends.length })));
    group = [];
    ends = [];
  };
  for (const event of [...events].sort((a, b) => a.startMinute - b.startMinute)) {
    if (event.startMinute >= groupEnd) flush();
    let column = ends.findIndex((end) => end <= event.startMinute);
    if (column === -1) column = ends.length;
    ends[column] = event.endMinute;
    groupEnd = group.length ? Math.max(groupEnd, event.endMinute) : event.endMinute;
    group.push({ ...event, column });
  }
  flush();
  return result;
}
