"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { hermesApi } from "@/lib/hermes/api";
import { parseCampaignCsv } from "@/lib/hermes/csv";
import {
  getTemplateHeaderType,
  isVideoTemplateConfigured,
  loadCampaignWorkspace,
} from "@/lib/hermes/campaign-template-media.mjs";

const EMPTY_FORM = { name: "", templateName: "", templateLanguage: "es", templateCategory: "" };
const metric = (campaign, key) => campaign?.metrics?.[key] || 0;
const templateKey = (template) => `${template.id}:${template.language}`;

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [media, setMedia] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [preview, setPreview] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [configuringTemplate, setConfiguringTemplate] = useState("");
  const [uploadingTemplate, setUploadingTemplate] = useState("");
  const [registeringTemplate, setRegisteringTemplate] = useState("");
  const [existingMediaId, setExistingMediaId] = useState("");
  const [selectedMediaId, setSelectedMediaId] = useState("");
  const [advancedUrl, setAdvancedUrl] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [mediaError, setMediaError] = useState("");
  const [templatesError, setTemplatesError] = useState("");

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.name === form.templateName && template.language === form.templateLanguage),
    [templates, form.templateName, form.templateLanguage],
  );
  const requiresVideo = getTemplateHeaderType(selectedTemplate) === "VIDEO";
  const selectedTemplateConfigured = isVideoTemplateConfigured(selectedTemplate);

  const load = async () => {
    setLoading(true);
    setError("");
    const workspace = await loadCampaignWorkspace({
      campaigns: () => hermesApi.campaigns({ page: 1, limit: 100 }),
      templates: () => hermesApi.campaignTemplates(),
      media: () => hermesApi.campaignMedia(),
    });
    setCampaigns(workspace.campaigns);
    setTemplates(workspace.templates);
    setMedia(workspace.media);
    setMediaError(workspace.mediaError?.message || "");
    setTemplatesError(workspace.templatesError?.message || "");
    if (workspace.campaignsError) setError(workspace.campaignsError.message || "No se pudieron cargar las campañas.");
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const refreshTemplates = async () => {
    try {
      const next = await hermesApi.campaignTemplates();
      setTemplates(next || []);
      setTemplatesError("");
    } catch (requestError) {
      setTemplatesError(requestError.message || "No se pudieron actualizar las plantillas.");
    }
  };

  const selectTemplate = (event) => {
    const selected = templates[Number(event.target.value) - 1];
    if (!selected) return setForm((current) => ({ ...current, templateName: "", templateLanguage: "es", templateCategory: "" }));
    setForm((current) => ({
      ...current,
      templateName: selected.name,
      templateLanguage: selected.language,
      templateCategory: selected.category || "",
    }));
  };

  const readCsv = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setPreview(parseCampaignCsv(await file.text()));
      setError("");
    } catch (parseError) {
      setPreview(null);
      setError(parseError.message);
    }
  };

  const configureTemplateMedia = async (template, mediaReference) => {
    await hermesApi.configureCampaignTemplateMedia({
      templateId: template.id,
      templateName: template.name,
      templateLanguage: template.language,
      ...mediaReference,
    });
    await refreshTemplates();
  };

  const uploadVideo = async (event, template) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const key = templateKey(template);
    setError("");
    setNotice("");
    if (file.type !== "video/mp4") {
      setError("Selecciona un video MP4.");
      event.target.value = "";
      return;
    }
    if (file.size > 16 * 1024 * 1024) {
      setError("El video debe pesar como máximo 16 MB.");
      event.target.value = "";
      return;
    }
    setUploadingTemplate(key);
    try {
      const asset = await hermesApi.uploadCampaignMedia(file, file.name);
      setMedia((current) => [asset, ...current.filter((item) => item.id !== asset.id)]);
      await configureTemplateMedia(template, { campaignMediaId: asset.id });
      setNotice(`Video “${asset.name}” cargado y configurado para ${template.name} (${template.language}).`);
      setConfiguringTemplate("");
    } catch (requestError) {
      setError(requestError.message || "No se pudo cargar y configurar el video en Meta.");
    } finally {
      setUploadingTemplate("");
      event.target.value = "";
    }
  };

  const configureExistingMedia = async (template) => {
    if (!selectedMediaId) return setError("Selecciona un video de la biblioteca.");
    setError("");
    try {
      await configureTemplateMedia(template, { campaignMediaId: selectedMediaId });
      setNotice(`Video configurado para ${template.name} (${template.language}).`);
      setSelectedMediaId("");
      setConfiguringTemplate("");
    } catch (requestError) {
      setError(requestError.message || "No se pudo configurar el video.");
    }
  };

  const registerExistingVideo = async (template) => {
    const metaMediaId = existingMediaId.trim();
    if (!metaMediaId) return setError("Ingresa el Media ID existente para verificarlo.");
    const key = templateKey(template);
    setRegisteringTemplate(key);
    setError("");
    try {
      const asset = await hermesApi.registerCampaignMedia({ name: `Video Meta ${metaMediaId.slice(-6)}`, metaMediaId });
      setMedia((current) => [asset, ...current.filter((item) => item.id !== asset.id)]);
      await configureTemplateMedia(template, { campaignMediaId: asset.id });
      setExistingMediaId("");
      setNotice(`Media ID verificado y configurado para ${template.name} (${template.language}).`);
      setConfiguringTemplate("");
    } catch (requestError) {
      setError(requestError.message || "No se pudo verificar el Media ID en Meta.");
    } finally {
      setRegisteringTemplate("");
    }
  };

  const configureAdvancedUrl = async (template) => {
    const mediaUrl = advancedUrl.trim();
    if (!mediaUrl) return setError("Ingresa una URL HTTPS permitida.");
    setError("");
    try {
      await configureTemplateMedia(template, { mediaUrl });
      setAdvancedUrl("");
      setNotice(`URL HTTPS configurada para ${template.name} (${template.language}).`);
      setConfiguringTemplate("");
    } catch (requestError) {
      setError(requestError.message || "La URL no pudo configurarse.");
    }
  };

  const create = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");
    if (!preview?.summary?.eligible) return setError("Carga un CSV con al menos un destinatario apto y consentimiento explícito.");
    if (requiresVideo && !selectedTemplateConfigured) return setError("Esta plantilla usa VIDEO y todavía no tiene video configurado.");
    setSaving(true);
    try {
      const campaign = await hermesApi.createCampaign(Object.fromEntries(Object.entries(form).filter(([, value]) => value)));
      const eligible = preview.rows.filter((row) => row.eligible).map(({ nombre, telefono, consentimiento }) => ({ nombre, telefono, consentimiento }));
      for (let index = 0; index < eligible.length; index += 500) {
        await hermesApi.importCampaignContacts(campaign.id, eligible.slice(index, index + 500));
      }
      setNotice("Campaña creada e importada. Permanecerá lista hasta que un operador la inicie explícitamente.");
      setShowForm(false);
      setPreview(null);
      setForm(EMPTY_FORM);
      await load();
    } catch (requestError) {
      setError(requestError.message || "No se pudo crear la campaña.");
    } finally {
      setSaving(false);
    }
  };

  const act = async (campaign, action) => {
    setError("");
    setNotice("");
    try {
      await action(campaign.id);
      setNotice(`Acción aplicada a “${campaign.name}”.`);
      await load();
    } catch (requestError) {
      setError(requestError.message || "No se pudo actualizar la campaña.");
    }
  };

  const openTemplateConfiguration = (template) => {
    const key = templateKey(template);
    setConfiguringTemplate((current) => current === key ? "" : key);
    window.setTimeout(() => document.getElementById(`template-${key}`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 0);
  };

  return <section className="crm-campaigns">
    <header className="crm-page-header">
      <div>
        <span className="crm-eyebrow">WhatsApp Cloud API</span>
        <h1>Campañas</h1>
        <p>Solo contactos con consentimiento explícito. La multimedia se administra por plantilla y Hermes conserva el estado oficial.</p>
      </div>
      <div className="crm-page-actions"><button className="crm-button is-primary" type="button" onClick={() => setShowForm((open) => !open)}>Nueva campaña</button></div>
    </header>

    {error && <p className="crm-feedback is-error" role="alert">{error}</p>}
    {notice && <p className="crm-feedback is-success">{notice}</p>}
    {templatesError && <p className="crm-feedback is-error">Las plantillas no se pudieron actualizar: {templatesError}</p>}
    {mediaError && <p className="crm-feedback is-error">La biblioteca multimedia no está disponible. Las plantillas siguen visibles: {mediaError}</p>}

    {showForm && <form className="crm-panel crm-campaign-form" onSubmit={create}>
      <h2>Nueva campaña</h2>
      <div className="crm-form-grid">
        <label>Nombre<input required maxLength="160" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
        <label>Plantilla aprobada
          <select required value={selectedTemplate ? templates.findIndex((template) => templateKey(template) === templateKey(selectedTemplate)) + 1 : ""} onChange={selectTemplate}>
            <option value="">Selecciona una plantilla</option>
            {templates.map((template, index) => <option key={templateKey(template)} value={index + 1}>{template.name} · {template.language} · {template.category}</option>)}
          </select>
        </label>
        {selectedTemplate && <div className={`crm-template-state ${requiresVideo && !selectedTemplateConfigured ? "is-missing" : "is-ready"}`}>
          <strong>{selectedTemplate.status || "APPROVED"}</strong>
          <span>Encabezado: {getTemplateHeaderType(selectedTemplate) || "Sin encabezado"}</span>
          {requiresVideo && (selectedTemplateConfigured
            ? <span>✓ VIDEO configurado</span>
            : <button type="button" className="crm-text-link" onClick={() => openTemplateConfiguration(selectedTemplate)}>Configurar video</button>)}
        </div>}
        <label>Archivo CSV<input required type="file" accept=".csv,text/csv" onChange={readCsv} /></label>
      </div>
      {preview && <div className="crm-csv-preview"><strong>Vista previa local</strong><span>Total {preview.summary.total} · Válidos {preview.summary.valid} · Inválidos {preview.summary.invalid} · Duplicados {preview.summary.duplicates} · Sin consentimiento {preview.summary.withoutConsent} · Aptos {preview.summary.eligible}</span></div>}
      <div className="crm-page-actions"><button className="crm-button is-secondary" type="button" onClick={() => setShowForm(false)}>Cancelar</button><button className="crm-button is-primary" disabled={saving || (requiresVideo && !selectedTemplateConfigured)}>{saving ? "Guardando…" : "Crear e importar"}</button></div>
    </form>}

    <section className="crm-panel crm-template-list" aria-labelledby="templates-heading">
      <header><div><span className="crm-eyebrow">Configuración</span><h2 id="templates-heading">Plantillas WhatsApp</h2><p>Configura el video una vez por plantilla e idioma. Las campañas futuras reutilizarán esa referencia.</p></div></header>
      {templates.length === 0 ? <p className="crm-empty">No hay plantillas aprobadas disponibles.</p> : templates.map((template) => {
        const key = templateKey(template);
        const isVideo = getTemplateHeaderType(template) === "VIDEO";
        const configured = isVideoTemplateConfigured(template);
        const isConfiguring = configuringTemplate === key;
        return <article key={key} id={`template-${key}`} className="crm-template-card">
          <div className="crm-template-card-header">
            <div><h3>{template.name}</h3><p>{template.language} · {template.status || "APPROVED"} · Header: {getTemplateHeaderType(template) || "Sin encabezado"}</p></div>
            {isVideo && <span className={`crm-status ${configured ? "crm-status-running" : "crm-status-failed"}`}>{configured ? "VIDEO configurado" : "Falta video"}</span>}
          </div>
          {!isVideo && <p className="crm-template-config">Esta plantilla no requiere configuración de video.</p>}
          {isVideo && configured && <div className="crm-template-config"><strong>✓ Configurado</strong><span>{template.mediaConfiguration?.mediaName || (template.mediaConfiguration?.usesAdvancedUrl ? "URL HTTPS permitida" : "Media de Meta")}</span></div>}
          {isVideo && !configured && <p className="crm-template-config is-warning">Esta plantilla utiliza un encabezado de video pero todavía no tiene un video configurado.</p>}
          {isVideo && <button className="crm-button is-secondary" type="button" onClick={() => openTemplateConfiguration(template)}>{configured ? "Reemplazar video" : "Configurar video"}</button>}
          {isVideo && isConfiguring && <div className="crm-template-editor">
            <label>Subir MP4
              <input type="file" accept="video/mp4" onChange={(event) => uploadVideo(event, template)} disabled={uploadingTemplate === key} />
              {uploadingTemplate === key && <small>Cargando video a Meta…</small>}
            </label>
            <details className="crm-advanced-options">
              <summary>Opciones avanzadas</summary>
              <label>Usar video de la biblioteca
                <select value={selectedMediaId} onChange={(event) => setSelectedMediaId(event.target.value)}><option value="">Selecciona un video</option>{media.map((asset) => <option key={asset.id} value={asset.id}>{asset.name} · {(asset.sizeBytes / (1024 * 1024)).toFixed(1)} MB</option>)}</select>
              </label>
              <button className="crm-button is-secondary" type="button" onClick={() => configureExistingMedia(template)}>Usar video seleccionado</button>
              <label>Registrar Media ID existente<input value={existingMediaId} onChange={(event) => setExistingMediaId(event.target.value)} placeholder="Media ID de Meta" /></label>
              <button className="crm-button is-secondary" type="button" onClick={() => registerExistingVideo(template)} disabled={registeringTemplate === key}>{registeringTemplate === key ? "Verificando…" : "Verificar y configurar"}</button>
              <label>Usar URL HTTPS permitida<input type="url" value={advancedUrl} onChange={(event) => setAdvancedUrl(event.target.value)} placeholder="https://…/video.mp4" /></label>
              <button className="crm-button is-secondary" type="button" onClick={() => configureAdvancedUrl(template)}>Usar URL HTTPS</button>
            </details>
          </div>}
        </article>;
      })}
    </section>

    <div className="crm-panel crm-campaign-table-wrap">
      {loading ? <p>Cargando campañas…</p> : campaigns.length === 0 ? <p className="crm-empty">No hay campañas todavía.</p> : <table className="crm-table"><thead><tr><th>Nombre</th><th>Plantilla</th><th>Estado</th><th>Enviados</th><th>Entregados</th><th>Leídos</th><th>Respuestas</th><th>Fallidos</th><th>Fecha</th><th /></tr></thead><tbody>{campaigns.map((campaign) => <tr key={campaign.id}><td><Link href={`/admin/crm/campanas/${campaign.id}`}>{campaign.name}</Link></td><td>{campaign.templateName}</td><td><span className={`crm-status crm-status-${campaign.status?.toLowerCase()}`}>{campaign.status}</span></td><td>{metric(campaign, "sent")}</td><td>{metric(campaign, "delivered")}</td><td>{metric(campaign, "read")}</td><td>{metric(campaign, "replied")}</td><td>{metric(campaign, "failed")}</td><td>{new Date(campaign.createdAt).toLocaleDateString("es-EC")}</td><td className="crm-inline-actions"><Link href={`/admin/crm/campanas/${campaign.id}`}>Ver</Link>{campaign.status === "RUNNING" && <button onClick={() => act(campaign, hermesApi.pauseCampaign)}>Pausar</button>}{campaign.status === "PAUSED" && <button onClick={() => act(campaign, hermesApi.resumeCampaign)}>Reanudar</button>}{["DRAFT", "READY", "PAUSED"].includes(campaign.status) && <button onClick={() => act(campaign, hermesApi.startCampaign)}>Iniciar</button>}{!["COMPLETED", "CANCELLED"].includes(campaign.status) && <button onClick={() => act(campaign, hermesApi.cancelCampaign)}>Cancelar</button>}</td></tr>)}</tbody></table>}
    </div>
  </section>;
}
