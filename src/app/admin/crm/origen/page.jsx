"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { BarChart3, MessageCircle, Target, Trophy, TrendingDown, RefreshCw } from 'lucide-react';
import { hermesApi } from '@/lib/hermes/api';
import { acquisitionRange, originLabel } from '@/lib/hermes/meta-attribution.mjs';
import { apiErrorMessage } from '../_components/format';
import { ErrorState, LoadingState, PageHeader } from '../_components/Ui';

const PRESETS = [
  { value: 'today', label: 'Hoy' },
  { value: '7d', label: 'Últimos 7 días' },
  { value: '30d', label: 'Últimos 30 días' },
  { value: 'custom', label: 'Personalizado' },
];
const ORIGINS = ['meta_ad', 'organic', 'unknown'];
const KPI = [
  { key: 'newConversations', label: 'Conversaciones nuevas', icon: MessageCircle },
  { key: 'inboundMessages', label: 'Mensajes entrantes', icon: BarChart3 },
  { key: 'qualifiedLeadsVerified', label: 'Leads calificados verificados', icon: Target },
  { key: 'contractsWonVerified', label: 'Contratos ganados verificados', icon: Trophy },
  { key: 'contractsLostVerified', label: 'Contratos perdidos verificados', icon: TrendingDown },
  { key: 'nousRequests', label: 'Solicitudes Nous registradas', icon: BarChart3 },
  { key: 'estimatedUsd', label: 'IA estimada (USD)', icon: BarChart3 },
];

function count(value) {
  return typeof value === 'number' && Number.isFinite(value) ? value.toLocaleString('es-EC') : 'No disponible';
}

export default function ConversationOriginsPage() {
  const [preset, setPreset] = useState('30d');
  const [range, setRange] = useState(() => acquisitionRange('30d'));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const load = useCallback(async () => {
    if (!range.from || !range.to || range.from > range.to) {
      setError('Elige un rango de fechas válido.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      setData(await hermesApi.acquisitionSummary(range));
    } catch (requestError) {
      setError(apiErrorMessage(requestError, 'No se pudo consultar el origen de conversaciones.'));
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => { void load(); }, [load, refreshKey]);

  const maximumDaily = useMemo(() => Math.max(1, ...(data?.daily || []).map((item) => item.total)), [data]);
  const totalConversations = data?.totals?.newConversations || 0;

  return (
    <>
      <PageHeader eyebrow="Adquisición WhatsApp" title="Origen de conversaciones"
        description="Cohortes de conversaciones iniciadas en el período, según la hora de Ecuador. Mensajes y conversiones asociados se acumulan hasta la consulta; las ventas se cuentan solo cuando el hito comercial está verificado."
        actions={<button type="button" className="crm-button is-secondary" onClick={() => setRefreshKey((value) => value + 1)} disabled={loading}>
          <RefreshCw size={16} />Actualizar
        </button>} />

      <section className="crm-origin-filters" aria-label="Rango de adquisición">
        <label>Período
          <select value={preset} onChange={(event) => {
            const next = event.target.value;
            setPreset(next);
            if (next !== 'custom') setRange(acquisitionRange(next));
          }}>
            {PRESETS.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}
          </select>
        </label>
        <label>Desde
          <input type="date" value={range.from} onChange={(event) => { setPreset('custom'); setRange((value) => ({ ...value, from: event.target.value })); }} />
        </label>
        <label>Hasta
          <input type="date" value={range.to} onChange={(event) => { setPreset('custom'); setRange((value) => ({ ...value, to: event.target.value })); }} />
        </label>
      </section>

      {loading ? <LoadingState label="Consultando adquisición…" /> : error ? <ErrorState message={error} onRetry={load} /> : data ? (
        <>
          <section className="crm-origin-kpis" aria-label="Indicadores de adquisición">
            {KPI.map(({ key, label, icon: Icon }) => <article className="crm-panel" key={key}>
              <span><Icon size={17} />{label}</span><strong>{key === 'estimatedUsd' && typeof data.totals?.[key] === 'number'
                ? new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD', maximumFractionDigits: 4 }).format(data.totals[key])
                : count(data.totals?.[key])}</strong>
            </article>)}
            <article className="crm-panel"><span>Referencias posteriores a anuncios</span><strong>{count(data.totals?.laterAdReferralMessages)}</strong></article>
          </section>

          {totalConversations === 0 ? (
            <div className="crm-panel crm-origin-empty">No hay conversaciones de WhatsApp registradas en este período.</div>
          ) : (
            <div className="crm-origin-grid">
              <section className="crm-panel" aria-label="Distribución por origen">
                <div className="crm-panel-header"><div><span>Origen inicial</span><h2>Distribución</h2></div></div>
                <div className="crm-origin-distribution">
                  {data.byOrigin.map((item) => <div key={item.origin}>
                    <div><strong>{originLabel(item.origin)}</strong><span>{count(item.newConversations)} · {Math.round(item.newConversations / totalConversations * 100)} %</span></div>
                    <div className="crm-origin-track"><i className={`is-${item.origin}`} style={{ width: `${item.newConversations / totalConversations * 100}%` }} /></div>
                  </div>)}
                </div>
              </section>

              <section className="crm-panel" aria-label="Evolución diaria de conversaciones">
                <div className="crm-panel-header"><div><span>Fecha de inicio</span><h2>Evolución diaria</h2></div></div>
                <div className="crm-origin-daily">
                  {data.daily.map((item) => <div key={item.date}>
                    <time>{item.date}</time>
                    <div className="crm-origin-daily-track" aria-label={`${item.date}: ${item.total} conversaciones`}>
                      {ORIGINS.map((origin) => <i key={origin} className={`is-${origin}`}
                        style={{ width: `${item[origin] / maximumDaily * 100}%` }} />)}
                    </div>
                    <strong>{item.total}</strong>
                  </div>)}
                </div>
              </section>
            </div>
          )}

          <section className="crm-panel crm-origin-ad-table">
            <div className="crm-panel-header"><div><span>Meta Ads</span><h2>Rendimiento por ID de anuncio</h2></div></div>
            {data.byAd.length ? <div className="crm-table-wrap"><table className="crm-table">
              <thead><tr><th>ID de anuncio</th><th>Conversaciones</th><th>Mensajes</th><th>Leads verificados</th><th>Ganados</th><th>Perdidos</th></tr></thead>
              <tbody>{data.byAd.map((row) => <tr key={row.sourceId}>
                <td><strong>{row.sourceId}</strong></td><td>{count(row.newConversations)}</td><td>{count(row.inboundMessages)}</td>
                <td>{count(row.qualifiedLeadsVerified)}</td><td>{count(row.contractsWonVerified)}</td><td>{count(row.contractsLostVerified)}</td>
              </tr>)}</tbody>
            </table></div> : <p className="crm-inline-empty">No hay IDs de anuncio registrados en este período.</p>}
          </section>

          <p className="crm-origin-source-note">Fuente: webhook de WhatsApp y eventos comerciales verificados en Hermes. ID de anuncio no equivale a nombre de campaña. La cifra de IA es una estimación operativa, no una factura. Inversión, clics, costo por lead y ROAS: no disponibles sin Meta Marketing API. Facturación IA: {data.totals?.billedUsd === null ? 'no disponible' : 'verificada'}.</p>
        </>
      ) : null}
    </>
  );
}
