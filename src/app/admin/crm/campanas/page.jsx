"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { hermesApi } from "@/lib/hermes/api";
import { parseCampaignCsv } from "@/lib/hermes/csv";

const EMPTY_FORM = { name: "", templateName: "", templateLanguage: "es", templateCategory: "", headerVideoAssetId: "", headerVideoMediaId: "", headerVideoUrl: "" };
const metric = (campaign, key) => campaign?.metrics?.[key] || 0;

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [media, setMedia] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [preview, setPreview] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [existingMediaId, setExistingMediaId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const selectedTemplate = useMemo(() => templates.find((template) => template.name === form.templateName && template.language === form.templateLanguage), [templates, form.templateName, form.templateLanguage]);
  const requiresVideo = selectedTemplate?.components?.some((component) => component.type === "HEADER" && component.format === "VIDEO");
  const load = async () => {
    setLoading(true); setError("");
    try {
      const [campaignResult, templateResult, mediaResult] = await Promise.all([hermesApi.campaigns({ page: 1, limit: 100 }), hermesApi.campaignTemplates(), hermesApi.campaignMedia()]);
      setCampaigns(campaignResult?.data || []); setTemplates(templateResult || []); setMedia(mediaResult || []);
    } catch (requestError) { setError(requestError.message || "No se pudieron cargar las campaÃ±as."); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const selectTemplate = (event) => {
    const selected = templates[Number(event.target.value)];
    if (!selected) return setForm((current) => ({ ...current, templateName: "" }));
    setForm((current) => ({ ...current, templateName: selected.name, templateLanguage: selected.language, templateCategory: selected.category || "" }));
  };
  const readCsv = async (event) => {
    const file = event.target.files?.[0]; if (!file) return;
    try { setPreview(parseCampaignCsv(await file.text())); setError(""); }
    catch (parseError) { setPreview(null); setError(parseError.message); }
  };
  const uploadVideo = async (event) => {
    const file = event.target.files?.[0]; if (!file) return;
    setError(""); setNotice("");
    if (file.type !== "video/mp4") { setError("Selecciona un video MP4."); event.target.value = ""; return; }
    if (file.size > 16 * 1024 * 1024) { setError("El video debe pesar como máximo 16 MB."); event.target.value = ""; return; }
    setUploading(true);
    try {
      const asset = await hermesApi.uploadCampaignMedia(file, file.name.replace(/\.mp4$/i, ""));
      setMedia((current) => [asset, ...current.filter((item) => item.id !== asset.id)]);
      setForm((current) => ({ ...current, headerVideoAssetId: asset.id, headerVideoMediaId: "", headerVideoUrl: "" }));
      setNotice(`Video “${asset.name}” cargado en Meta y seleccionado para esta campaña.`);
    } catch (requestError) { setError(requestError.message || "No se pudo cargar el video en Meta."); }
    finally { setUploading(false); event.target.value = ""; }
  };
  const registerExistingVideo = async () => {
    const metaMediaId = existingMediaId.trim();
    if (!metaMediaId) return setError("Ingresa el Media ID existente para guardarlo una sola vez.");
    setRegistering(true); setError(""); setNotice("");
    try {
      const asset = await hermesApi.registerCampaignMedia({ name: `Video Meta ${metaMediaId.slice(-6)}`, metaMediaId });
      setMedia((current) => [asset, ...current.filter((item) => item.id !== asset.id)]);
      setForm((current) => ({ ...current, headerVideoAssetId: asset.id, headerVideoMediaId: "", headerVideoUrl: "" }));
      setExistingMediaId("");
      setNotice(`Video “${asset.name}” verificado en Meta y guardado en la biblioteca.`);
    } catch (requestError) { setError(requestError.message || "No se pudo verificar el Media ID en Meta."); }
    finally { setRegistering(false); }
  };
  const create = async (event) => {
    event.preventDefault(); setError(""); setNotice("");
    if (!preview?.summary?.eligible) return setError("Carga un CSV con al menos un destinatario apto y consentimiento explÃ­cito.");
    if (requiresVideo && !form.headerVideoAssetId && !form.headerVideoMediaId && !form.headerVideoUrl) return setError("La plantilla requiere un video: súbelo o selecciónalo desde la biblioteca.");
    setSaving(true);
    try {
      const campaign = await hermesApi.createCampaign(Object.fromEntries(Object.entries(form).filter(([, value]) => value)));
      const eligible = preview.rows.filter((row) => row.eligible).map(({ nombre, telefono, consentimiento }) => ({ nombre, telefono, consentimiento }));
      for (let index = 0; index < eligible.length; index += 500) await hermesApi.importCampaignContacts(campaign.id, eligible.slice(index, index + 500));
      setNotice("Campaña creada e importada. Permanecerá lista hasta que un operador la inicie explícitamente.");
      setShowForm(false); setPreview(null); setForm(EMPTY_FORM); await load();
    } catch (requestError) { setError(requestError.message || "No se pudo crear la campaña."); }
    finally { setSaving(false); }
  };
  const act = async (campaign, action) => {
    setError(""); setNotice("");
    try { await action(campaign.id); setNotice(`Acción aplicada a “${campaign.name}”.`); await load(); }
    catch (requestError) { setError(requestError.message || "No se pudo actualizar la campaña."); }
  };

  return <section className="crm-campaigns">
    <header className="crm-page-header"><div><span className="crm-eyebrow">WhatsApp Cloud API</span><h1>CampaÃ±as</h1><p>Solo contactos con consentimiento explícito. Hermes conserva el estado oficial y no inicia envíos automáticamente.</p></div><div className="crm-page-actions"><button className="crm-button" type="button" onClick={() => setShowForm((open) => !open)}>Nueva campaña</button></div></header>
    {error && <p className="crm-feedback is-error" role="alert">{error}</p>}{notice && <p className="crm-feedback is-success">{notice}</p>}
    {showForm && <form className="crm-panel crm-campaign-form" onSubmit={create}>
      <h2>Nueva campaña</h2><div className="crm-form-grid">
        <label>Nombre<input required maxLength="160" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
        <label>Plantilla aprobada<select required value={templates.findIndex((template) => template.name === form.templateName && template.language === form.templateLanguage)} onChange={selectTemplate}><option value="">Selecciona una plantilla</option>{templates.map((template, index) => <option key={`${template.name}-${template.language}`} value={index}>{template.name} · {template.language} · {template.category}</option>)}</select></label>
        {requiresVideo && <><label>Video para el encabezado<select value={form.headerVideoAssetId} onChange={(event) => setForm({ ...form, headerVideoAssetId: event.target.value, headerVideoMediaId: "", headerVideoUrl: "" })}><option value="">Selecciona un video ya cargado</option>{media.map((asset) => <option key={asset.id} value={asset.id}>{asset.name} · {(asset.sizeBytes / (1024 * 1024)).toFixed(1)} MB</option>)}</select></label><label>Subir video MP4 a Meta<input type="file" accept="video/mp4" onChange={uploadVideo} disabled={uploading} />{uploading && <small>Cargando el video de forma segura…</small>}</label><label>Registrar Media ID existente<input value={existingMediaId} onChange={(event) => setExistingMediaId(event.target.value)} placeholder="Se guarda una sola vez" /><button className="crm-text-link" type="button" onClick={registerExistingVideo} disabled={registering}>{registering ? "Verificando…" : "Verificar y guardar"}</button></label><label>o URL HTTPS permitida<input type="url" value={form.headerVideoUrl} onChange={(event) => setForm({ ...form, headerVideoUrl: event.target.value, headerVideoAssetId: "" })} /></label></>}
        <label>Archivo CSV<input required type="file" accept=".csv,text/csv" onChange={readCsv} /></label>
      </div>
      {preview && <div className="crm-csv-preview"><strong>Vista previa local</strong><span>Total {preview.summary.total} · Válidos {preview.summary.valid} · Inválidos {preview.summary.invalid} · Duplicados {preview.summary.duplicates} · Sin consentimiento {preview.summary.withoutConsent} · Aptos {preview.summary.eligible}</span></div>}
      <div className="crm-page-actions"><button className="crm-button is-secondary" type="button" onClick={() => setShowForm(false)}>Cancelar</button><button className="crm-button" disabled={saving}>{saving ? "Guardando…" : "Crear e importar"}</button></div>
    </form>}
    <div className="crm-panel crm-campaign-table-wrap">{loading ? <p>Cargando campañas…</p> : campaigns.length === 0 ? <p className="crm-empty">No hay campañas todavía.</p> : <table className="crm-table"><thead><tr><th>Nombre</th><th>Plantilla</th><th>Estado</th><th>Enviados</th><th>Entregados</th><th>Leídos</th><th>Respuestas</th><th>Fallidos</th><th>Fecha</th><th /></tr></thead><tbody>{campaigns.map((campaign) => <tr key={campaign.id}><td><Link href={`/admin/crm/campanas/${campaign.id}`}>{campaign.name}</Link></td><td>{campaign.templateName}</td><td><span className={`crm-status crm-status-${campaign.status?.toLowerCase()}`}>{campaign.status}</span></td><td>{metric(campaign, "sent")}</td><td>{metric(campaign, "delivered")}</td><td>{metric(campaign, "read")}</td><td>{metric(campaign, "replied")}</td><td>{metric(campaign, "failed")}</td><td>{new Date(campaign.createdAt).toLocaleDateString("es-EC")}</td><td className="crm-inline-actions"><Link href={`/admin/crm/campanas/${campaign.id}`}>Ver</Link>{campaign.status === "RUNNING" && <button onClick={() => act(campaign, hermesApi.pauseCampaign)}>Pausar</button>}{campaign.status === "PAUSED" && <button onClick={() => act(campaign, hermesApi.resumeCampaign)}>Reanudar</button>}{["DRAFT", "READY", "PAUSED"].includes(campaign.status) && <button onClick={() => act(campaign, hermesApi.startCampaign)}>Iniciar</button>}{!["COMPLETED", "CANCELLED"].includes(campaign.status) && <button onClick={() => act(campaign, hermesApi.cancelCampaign)}>Cancelar</button>}</td></tr>)}</tbody></table>}</div>
  </section>;
}
