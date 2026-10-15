"use client";

import { useCallback, useEffect, useState } from "react";
import { hermesApi } from "@/lib/hermes/api";
import { useCrmSession } from "../_components/CrmSession";
import { availableBackupIntervals, STORAGE_BUDGET_WARNING } from "./retentionPolicyUi";

const GiB = 1024 ** 3;
const date = (value) => value ? new Date(value).toLocaleString("es-EC") : "Sin ejecuciones";
const size = (value) => `${(Number(value || 0) / GiB).toFixed(2)} GiB`;

export default function RetentionRecovery() {
  const { user } = useCrmSession();
  const [data, setData] = useState(null);
  const [draft, setDraft] = useState(null);
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const result = await hermesApi.retentionPolicy();
      setData(result);
      setDraft(result.policy);
      setPreview(null);
    } catch (cause) {
      setError(cause?.message || "No se pudo consultar la política.");
    }
  }, []);

  useEffect(() => {
    if (user?.role !== "ADMIN") return;
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [user?.role, load]);

  if (user?.role !== "ADMIN") return null;

  const change = (key, value) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setPreview(null);
    setNotice("");
  };

  const validate = () => {
    for (const [key, limits] of Object.entries(data.limits)) {
      if (!limits || typeof limits !== "object" || !(key in draft)) continue;
      if (!Number.isInteger(draft[key]) || draft[key] < limits.min || draft[key] > limits.max) {
        throw new Error(`${key}: permitido entre ${limits.min} y ${limits.max}.`);
      }
    }
  };

  const showPreview = async () => {
    setBusy("preview"); setError("");
    try {
      validate();
      setPreview(await hermesApi.previewRetentionRotation(draft));
    } catch (cause) { setError(cause?.message || "No se pudo calcular la rotación."); }
    finally { setBusy(""); }
  };

  const save = async (event) => {
    event.preventDefault();
    setBusy("save"); setError(""); setNotice("");
    try {
      validate();
      const plan = await hermesApi.previewRetentionRotation(draft);
      setPreview(plan);
      if (plan.deleteCount > 0 && !window.confirm(`Esta política permitiría eliminar ${plan.deleteCount} backups periódicos gestionados en futuras rotaciones y liberar aproximadamente ${size(plan.reclaimBytes)}. ¿Guardar?`)) return;
      const result = await hermesApi.updateRetentionPolicy(draft);
      setData(result);
      setDraft(result.policy);
      setNotice("Política guardada. Guardar no ejecuta backups ni elimina archivos.");
    } catch (cause) { setError(cause?.message || "No se pudo guardar la política."); }
    finally { setBusy(""); }
  };

  const run = async (kind) => {
    const message = kind === "backup" ? "¿Crear un backup manual ahora?" : "¿Ejecutar un restore real en PostgreSQL aislado ahora?";
    if (!window.confirm(message)) return;
    setBusy(kind); setError(""); setNotice("");
    try {
      if (kind === "backup") await hermesApi.runBackupNow();
      else await hermesApi.runRestoreCheckNow();
      await load();
      setNotice(kind === "backup" ? "Backup manual completado." : "Restore-check completado.");
    } catch (cause) { setError(cause?.message || "La operación falló."); }
    finally { setBusy(""); }
  };

  const field = (key, label, suffix) => (
    <label className="crm-retention-field" key={key}>
      <span>{label}</span>
      <span className="crm-retention-input"><input type="number" required step="1"
        min={data.limits[key].min} max={data.limits[key].max} value={draft[key]}
        onChange={(event) => change(key, Number(event.target.value))} />{suffix}</span>
      <small>Entre {data.limits[key].min} y {data.limits[key].max} {suffix}</small>
    </label>
  );

  return <section className="crm-panel crm-retention" aria-labelledby="retention-heading">
    <div className="crm-retention-head">
      <div><h2 id="retention-heading">Retención y recuperación</h2>
        <p>Configura los trabajos periódicos de PostgreSQL. Los cambios quedan auditados.</p></div>
      <button type="button" className="crm-button is-secondary" onClick={load} disabled={Boolean(busy)}>Actualizar estado</button>
    </div>
    {error && <p className="crm-retention-error" role="alert">{error}</p>}
    {notice && <p className="crm-retention-notice" role="status">{notice}</p>}
    {!data || !draft ? <p>Cargando política…</p> : <>
      <div className="crm-retention-stats">
        <p><strong>Backup periódico actual</strong><span>{data.policy.backupEnabled ? "Activado" : "Backups periódicos desactivados"}</span></p>
        <p><strong>Último backup</strong><span>{date(data.status.lastBackupAt)}</span></p>
        <p><strong>Próximo estimado</strong><span>{date(data.status.nextBackupAt)}</span></p>
        <p><strong>Último fallo</strong><span>{date(data.status.lastBackupFailureAt)}</span></p>
        <p><strong>Restore-check</strong><span>{date(data.status.lastRestoreCheckAt)}{data.status.lastRestoreCheckAt ? data.status.lastRestoreCheckPassed ? " · correcto" : " · fallido" : ""}</span></p>
        <p><strong>Próximo restore-check</strong><span>{data.policy.restoreCheckEnabled ? date(data.status.nextRestoreCheckAt) : "Comprobaciones periódicas de restore desactivadas"}</span></p>
        <p><strong>Backups gestionados</strong><span>{data.status.managedCount} · {size(data.status.managedStorageBytes)}</span></p>
        <p><strong>Protegidos / heredados visibles</strong><span>{data.status.protectedCount} / {data.status.legacyCount} · {size(data.status.legacyStorageBytes)}</span></p>
        <p><strong>Disco libre</strong><span>{data.status.disk ? `${size(data.status.disk.freeBytes)} · ${data.status.disk.usedPercent}% usado` : "No disponible"}</span></p>
      </div>
      {data.status.warnings?.map((warning) => <p className="crm-retention-warning" key={warning}>{warning}</p>)}
      <form onSubmit={save}>
        <div className="crm-retention-grid">
          <fieldset><legend>Backups periódicos</legend>
            <label className="crm-retention-toggle"><input type="checkbox" checked={draft.backupEnabled}
              onChange={(event) => change("backupEnabled", event.target.checked)} /> Activar backups periódicos</label>
            {field("backupIntervalHours", "Frecuencia", "horas")}
            <label className="crm-retention-field"><span>Frecuencias habituales</span>
              <select value={availableBackupIntervals(data.limits.backupIntervalHours).some(({ hours }) => hours === draft.backupIntervalHours) ? draft.backupIntervalHours : ""}
                onChange={(event) => { if (event.target.value) change("backupIntervalHours", Number(event.target.value)); }}>
                <option value="">Valor personalizado</option>
                {availableBackupIntervals(data.limits.backupIntervalHours).map(({ hours, label }) => <option key={hours} value={hours}>{label}</option>)}
              </select>
            </label>
            {field("maximumBackupCount", "Máximo de backups periódicos", "backups")}
            {field("maximumBackupAgeDays", "Antigüedad máxima", "días")}
            {field("maximumBackupStorageGiB", "Presupuesto de almacenamiento gestionado", "GiB")}
            <p className="crm-retention-warning">{STORAGE_BUDGET_WARNING}</p>
          </fieldset>
          <fieldset><legend>Verificación de recuperación</legend>
            <label className="crm-retention-toggle"><input type="checkbox" checked={draft.restoreCheckEnabled}
              onChange={(event) => change("restoreCheckEnabled", event.target.checked)} /> Activar restore-check periódico</label>
            {field("restoreCheckIntervalDays", "Frecuencia", "días")}
            <p>Se ejecuta un restore real en un PostgreSQL aislado y se elimina la base temporal al terminar.</p>
          </fieldset>
        </div>
        <div className="crm-retention-actions">
          <button type="button" className="crm-button is-secondary" onClick={showPreview} disabled={Boolean(busy)}>Previsualizar rotación</button>
          <button type="submit" className="crm-button is-primary" disabled={Boolean(busy)}>{busy === "save" ? "Guardando…" : "Guardar política"}</button>
        </div>
      </form>
      {preview && <p className="crm-retention-preview">La política permitiría eliminar {preview.deleteCount} backups periódicos gestionados y liberar aproximadamente {size(preview.reclaimBytes)}. Permanecen {preview.protectedCount} protegidos y {preview.legacyCount} heredados sin gestionar.</p>}
      <div className="crm-retention-actions">
        <button type="button" className="crm-button is-secondary" onClick={() => run("backup")} disabled={Boolean(busy)}>Crear backup manual</button>
        <button type="button" className="crm-button is-secondary" onClick={() => run("restore")} disabled={Boolean(busy)}>Ejecutar restore-check</button>
      </div>
      <div className="crm-retention-rules"><h3>Reglas de seguridad permanentes</h3>
        <ul><li>Los backups de seguridad previos a despliegues críticos no dependen de esta configuración.</li>
          <li>Se exigen al menos 8 GiB libres y como máximo 85 % de disco usado antes de crear backups.</li>
          <li>Los backups protegidos y heredados no se rotan automáticamente.</li>
          <li>Redis y BullMQ se reconstruyen desde PostgreSQL; no son fuente durable.</li>
          <li>La eliminación de fuentes de aprendizaje conserva las guardas de evidencia de Hermes.</li></ul>
        <p>La retención legal de AuditLog y los valores productivos requieren una decisión aparte del operador.</p>
      </div>
    </>}
  </section>;
}
