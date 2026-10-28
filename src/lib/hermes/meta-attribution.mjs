export const ORIGIN_OPTIONS = [
  { value: 'meta_ad', label: 'Meta Ads' },
  { value: 'organic', label: 'Publicación orgánica' },
  { value: 'unknown', label: 'Sin atribución' },
];

export function originLabel(value) {
  return ORIGIN_OPTIONS.find((option) => option.value === value)?.label || 'Sin atribución';
}

export function safeAdId(value) {
  return typeof value === 'string' && value.length > 0 && value.length <= 128 ? value : null;
}

export function acquisitionToday(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Guayaquil', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(now);
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

export function acquisitionRange(preset, today = acquisitionToday()) {
  const days = preset === 'today' ? 1 : preset === '7d' ? 7 : 30;
  const date = new Date(`${today}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() - days + 1);
  return { from: date.toISOString().slice(0, 10), to: today };
}
