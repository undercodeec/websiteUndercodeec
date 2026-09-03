"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { hermesApi } from "@/lib/hermes/api";

const LABELS = { total: "Total", pending: "Pendientes", sent: "Enviados", delivered: "Entregados", read: "Leídos", replied: "Respondieron", failed: "Fallidos", skipped: "Excluidos" };
function mask(phone) { return phone?.length > 5 ? `${phone.slice(0, 3)}***${phone.slice(-2)}` : "***"; }

export default function CampaignDetailPage() {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [recipients, setRecipients] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => { setLoading(true); try { const [current, list] = await Promise.all([hermesApi.campaign(id), hermesApi.campaignRecipients(id, { page: 1, limit: 100 })]); setCampaign(current); setRecipients(list?.data || []); setError(""); } catch (requestError) { setError(requestError.message || "No se pudo cargar la campaña."); } finally { setLoading(false); } }, [id]);
  useEffect(() => { if (id) load(); }, [id, load]);
  const act = async (action) => { try { await action(id); await load(); } catch (requestError) { setError(requestError.message); } };
  if (loading) return <p>Cargando campaña…</p>;
  if (error) return <p className="crm-feedback is-error">{error}</p>;
  return <section className="crm-campaigns"><header className="crm-page-header"><div><span className="crm-eyebrow">Campaña oficial</span><h1>{campaign.name}</h1><p>{campaign.templateName} · {campaign.templateLanguage} · <span className={`crm-status crm-status-${campaign.status.toLowerCase()}`}>{campaign.status}</span></p></div><div className="crm-page-actions"><Link className="crm-button is-secondary" href="/admin/crm/campanas">Volver</Link>{campaign.status === "RUNNING" && <button className="crm-button" onClick={() => act(hermesApi.pauseCampaign)}>Pausar</button>}{campaign.status === "PAUSED" && <button className="crm-button" onClick={() => act(hermesApi.resumeCampaign)}>Reanudar</button>}{["DRAFT", "READY", "PAUSED"].includes(campaign.status) && <button className="crm-button" onClick={() => act(hermesApi.startCampaign)}>Iniciar</button>}</div></header>
    <div className="crm-campaign-metrics">{Object.entries(LABELS).map(([key, label]) => <article className="crm-metric-card" key={key}><span>{label}</span><strong>{campaign.metrics?.[key] || 0}</strong></article>)}</div>
    <div className="crm-panel crm-campaign-table-wrap"><h2>Destinatarios</h2><table className="crm-table"><thead><tr><th>Nombre</th><th>Teléfono</th><th>Estado</th><th>Enviado</th><th>Entregado</th><th>Leído</th><th>Respondió</th><th>Error</th></tr></thead><tbody>{recipients.map((recipient) => <tr key={recipient.id}><td>{recipient.contact?.name || "Sin nombre"}</td><td>{mask(recipient.phone)}</td><td>{recipient.status}</td><td>{recipient.sentAt ? new Date(recipient.sentAt).toLocaleString("es-EC") : "—"}</td><td>{recipient.deliveredAt ? new Date(recipient.deliveredAt).toLocaleString("es-EC") : "—"}</td><td>{recipient.readAt ? new Date(recipient.readAt).toLocaleString("es-EC") : "—"}</td><td>{recipient.repliedAt ? new Date(recipient.repliedAt).toLocaleString("es-EC") : "—"}</td><td>{recipient.errorMessage || "—"}</td></tr>)}</tbody></table></div>
  </section>;
}
