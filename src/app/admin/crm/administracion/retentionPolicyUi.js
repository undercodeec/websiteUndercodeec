export const BACKUP_INTERVAL_PRESETS = Object.freeze([
  { hours: 12, label: "12 horas" },
  { hours: 24, label: "24 horas" },
  { hours: 48, label: "48 horas" },
  { hours: 72, label: "3 días" },
  { hours: 168, label: "7 días" },
  { hours: 336, label: "14 días" },
  { hours: 720, label: "30 días" },
]);

export const STORAGE_BUDGET_WARNING = "El presupuesto es un límite máximo de backups gestionados; Hermes puede detener una operación antes si se alcanza el umbral de seguridad del servidor.";

export function availableBackupIntervals(limits) {
  return BACKUP_INTERVAL_PRESETS.filter(({ hours }) => hours >= limits.min && hours <= limits.max);
}
