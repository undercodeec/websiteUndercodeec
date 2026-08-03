'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';

const ESTADO_STYLES = {
  generada: { label: 'Generada', badge: 'tw-bg-gray-500/10 tw-text-gray-300 tw-border-gray-500/20' },
  firmada: { label: 'Firmada', badge: 'tw-bg-blue-500/10 tw-text-blue-400 tw-border-blue-500/20' },
  recibida: { label: 'Recibida SRI', badge: 'tw-bg-cyan-500/10 tw-text-cyan-400 tw-border-cyan-500/20' },
  devuelta: { label: 'Devuelta', badge: 'tw-bg-orange-500/10 tw-text-orange-400 tw-border-orange-500/20' },
  autorizada: { label: 'Autorizada', badge: 'tw-bg-green-500/10 tw-text-green-400 tw-border-green-500/20' },
  no_autorizada: { label: 'No Autorizada', badge: 'tw-bg-red-500/10 tw-text-red-400 tw-border-red-500/20' },
  error: { label: 'Error', badge: 'tw-bg-red-500/10 tw-text-red-400 tw-border-red-500/20' }
};

const RETRYABLE = ['firmada', 'recibida', 'devuelta', 'error', 'no_autorizada'];

const parseJsonField = (value) => {
  if (value && typeof value === 'object') return value;
  if (typeof value === 'string') {
    try { return JSON.parse(value); } catch { return {}; }
  }
  return {};
};

const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

const emptyItem = () => ({ descripcion: '', cantidad: 1, precioUnitario: 0, descuento: 0, codigoPorcentajeIva: '4' });

const emptyForm = () => ({
  orderId: null,
  tipoIdentificacion: '05',
  identificacion: '',
  razonSocial: '',
  direccion: '',
  email: '',
  telefono: '',
  formaPago: 'transferencia',
  items: [emptyItem()]
});

// Construye el formulario desde un pago (orders.client_info del wizard #planes)
function formFromPayment(payment) {
  const info = parseJsonField(payment.client_info);
  const id = String(info.rucCedula || '').trim();
  const tipoIdentificacion = id.length === 13 ? '04' : (id.length === 10 ? '05' : '06');
  const direccion = [info.callePrincipal, info.calleSecundaria, info.ciudad, info.provincia, info.pais]
    .filter(Boolean).join(', ');
  const amount = Number(payment.amount) || 0;
  return {
    orderId: payment.id,
    tipoIdentificacion,
    identificacion: id,
    razonSocial: info.razonSocial || '',
    direccion,
    email: info.email || '',
    telefono: info.telefono || '',
    formaPago: (info.metodoPago || payment.payment_method) === 'tarjeta' ? 'tarjeta' : 'transferencia',
    items: [{
      descripcion: payment.plan_name || 'Servicio',
      cantidad: 1,
      // El monto cobrado incluye IVA: se divide para que el total facturado coincida
      precioUnitario: round2(amount / 1.15),
      descuento: 0,
      codigoPorcentajeIva: '4'
    }]
  };
}

export default function InvoicesTab({ apiUrl, payments, onSessionExpired, formatDate, formatMoney, prefillPayment, onPrefillConsumed }) {
  const [invoices, setInvoices] = useState([]);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [sourcePaymentId, setSourcePaymentId] = useState('');
  const [emitting, setEmitting] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [detail, setDetail] = useState(null);

  const token = () => localStorage.getItem('adminToken');

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${apiUrl}/api/admin/invoices`, { headers: { Authorization: `Bearer ${token()}` } });
      if (res.status === 401) { onSessionExpired(); return; }
      const data = await res.json();
      if (data.success) {
        setInvoices(data.data);
        setConfig(data.config);
      } else {
        setError(data.error || 'Error al cargar facturas');
      }
    } catch {
      setError('Error de conexión al cargar facturas');
    } finally {
      setLoading(false);
    }
  }, [apiUrl, onSessionExpired]);

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

  // Prefill desde el detalle de un pago (botón "Emitir factura")
  useEffect(() => {
    if (prefillPayment) {
      setForm(formFromPayment(prefillPayment));
      setSourcePaymentId(String(prefillPayment.id));
      setShowForm(true);
      onPrefillConsumed?.();
    }
  }, [prefillPayment, onPrefillConsumed]);

  const totals = useMemo(() => {
    let subtotal = 0, iva = 0;
    form.items.forEach((it) => {
      const base = (Number(it.cantidad) || 0) * (Number(it.precioUnitario) || 0) - (Number(it.descuento) || 0);
      subtotal += base;
      if (it.codigoPorcentajeIva === '4') iva += base * 0.15;
    });
    return { subtotal: round2(subtotal), iva: round2(iva), total: round2(subtotal + iva) };
  }, [form.items]);

  const ambienteProd = config && String(config.ambiente) === '2';
  const configIssues = config ? [...(config.missingConfig || []), ...(config.missingSigning || [])] : [];

  const handleSourceChange = (val) => {
    setSourcePaymentId(val);
    if (!val) { setForm(emptyForm()); return; }
    const payment = payments.find((p) => String(p.id) === val);
    if (payment) setForm(formFromPayment(payment));
  };

  const setItem = (idx, field, value) => {
    setForm((f) => ({ ...f, items: f.items.map((it, i) => (i === idx ? { ...it, [field]: value } : it)) }));
  };

  const handleEmit = async (e) => {
    e.preventDefault();
    const numero = config ? `${config.estab}-${config.ptoEmi}` : '';
    const msg = `¿Emitir factura ${numero} por ${formatMoney(totals.total)} en ambiente ${ambienteProd ? 'PRODUCCIÓN' : 'PRUEBAS'}?`;
    if (!window.confirm(msg)) return;

    setEmitting(true);
    setError('');
    try {
      const res = await fetch(`${apiUrl}/api/admin/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({
          orderId: form.orderId,
          formaPago: form.formaPago,
          comprador: {
            tipoIdentificacion: form.tipoIdentificacion,
            identificacion: form.identificacion,
            razonSocial: form.razonSocial,
            direccion: form.direccion,
            email: form.email,
            telefono: form.telefono
          },
          items: form.items.map((it) => ({
            descripcion: it.descripcion,
            cantidad: Number(it.cantidad),
            precioUnitario: Number(it.precioUnitario),
            descuento: Number(it.descuento) || 0,
            codigoPorcentajeIva: it.codigoPorcentajeIva
          }))
        })
      });
      if (res.status === 401) { onSessionExpired(); return; }
      const data = await res.json();
      if (data.success) {
        setShowForm(false);
        setForm(emptyForm());
        setSourcePaymentId('');
        await fetchInvoices();
        const estado = data.data?.estado;
        if (estado === 'autorizada') {
          alert('✅ Factura AUTORIZADA por el SRI' + (data.data.email ? `. Enviando RIDE+XML a ${data.data.email}.` : ''));
        } else {
          alert(`Factura emitida con estado: ${ESTADO_STYLES[estado]?.label || estado}. ${data.warning || 'Revisa los mensajes del SRI en el detalle.'}`);
        }
      } else {
        setError(data.error || 'Error al emitir la factura');
      }
    } catch {
      setError('Error de conexión al emitir la factura');
    } finally {
      setEmitting(false);
    }
  };

  const handleRetry = async (inv) => {
    if (!window.confirm(`¿Reintentar envío/autorización de la factura #${inv.id} ante el SRI?`)) return;
    setActionId(inv.id);
    try {
      const res = await fetch(`${apiUrl}/api/admin/invoices/${inv.id}/retry`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token()}` }
      });
      if (res.status === 401) { onSessionExpired(); return; }
      const data = await res.json();
      if (data.success) {
        await fetchInvoices();
        setDetail(null);
      } else {
        alert(data.error || 'Error al reintentar');
      }
    } catch {
      alert('Error de conexión al reintentar');
    } finally {
      setActionId(null);
    }
  };

  const handleDownload = async (inv, kind) => {
    setActionId(inv.id);
    try {
      const res = await fetch(`${apiUrl}/api/admin/invoices/${inv.id}/${kind}`, { headers: { Authorization: `Bearer ${token()}` } });
      if (res.status === 401) { onSessionExpired(); return; }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || `Error al descargar ${kind.toUpperCase()}`);
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `factura_${invoiceNumber(inv)}.${kind === 'ride' ? 'pdf' : 'xml'}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Error de conexión en la descarga');
    } finally {
      setActionId(null);
    }
  };

  const handleSendEmail = async (inv) => {
    if (!window.confirm(`¿Enviar RIDE + XML a ${inv.email}?`)) return;
    setActionId(inv.id);
    try {
      const res = await fetch(`${apiUrl}/api/admin/invoices/${inv.id}/send-email`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token()}` }
      });
      if (res.status === 401) { onSessionExpired(); return; }
      const data = await res.json();
      alert(data.success ? `📧 ${data.message}` : (data.error || 'Error al enviar'));
    } catch {
      alert('Error de conexión al enviar email');
    } finally {
      setActionId(null);
    }
  };

  const invoiceNumber = (inv) => `${inv.estab}-${inv.pto_emi}-${String(inv.secuencial).padStart(9, '0')}`;

  const renderEstado = (estado) => {
    const s = ESTADO_STYLES[estado] || { label: estado, badge: 'tw-bg-gray-500/10 tw-text-gray-400 tw-border-gray-500/20' };
    return (
      <span className={`tw-inline-flex tw-items-center tw-px-3 tw-py-1 tw-rounded-full tw-text-xs tw-font-semibold tw-border ${s.badge}`}>
        {s.label}
      </span>
    );
  };

  const inputCls = 'tw-w-full tw-px-3 tw-py-2.5 tw-bg-gray-800/50 tw-border tw-border-gray-700 tw-rounded-xl tw-text-sm tw-text-white tw-placeholder-gray-500 tw-focus:outline-none tw-focus:ring-2 tw-focus:ring-purple-500/50';
  const labelCls = 'tw-block tw-text-[11px] tw-font-bold tw-text-purple-400 tw-uppercase tw-tracking-wider tw-mb-1.5';

  return (
    <div className="tw-space-y-6">

      {/* Barra superior: ambiente + emitir */}
      <div className="tw-flex tw-flex-wrap tw-items-center tw-justify-between tw-gap-3 tw-bg-gray-900/60 tw-backdrop-blur-md tw-rounded-2xl tw-border tw-border-gray-700/50 tw-p-4">
        <div className="tw-flex tw-items-center tw-gap-3">
          <span className={`tw-px-3 tw-py-1.5 tw-rounded-lg tw-text-xs tw-font-bold tw-uppercase tw-tracking-wider tw-border ${
            ambienteProd
              ? 'tw-bg-green-500/10 tw-text-green-400 tw-border-green-500/30'
              : 'tw-bg-orange-500/10 tw-text-orange-400 tw-border-orange-500/30'
          }`}>
            {ambienteProd ? '● PRODUCCIÓN' : '● PRUEBAS (celcer)'}
          </span>
          {config && <span className="tw-text-xs tw-text-gray-500">Serie {config.estab}-{config.ptoEmi}</span>}
        </div>
        <div className="tw-flex tw-gap-2">
          <button
            onClick={fetchInvoices}
            className="tw-px-4 tw-py-2.5 tw-bg-purple-600/10 tw-text-purple-400 hover:tw-bg-purple-600 hover:tw-text-white tw-rounded-xl tw-border tw-border-purple-500/30 tw-transition-all tw-text-sm tw-font-bold"
          >
            Refrescar
          </button>
          <button
            onClick={() => { setForm(emptyForm()); setSourcePaymentId(''); setShowForm(true); }}
            className="tw-px-5 tw-py-2.5 tw-rounded-xl tw-text-white tw-font-bold tw-text-sm tw-bg-gradient-to-r tw-from-purple-600 tw-to-orange-500 hover:tw-from-purple-500 hover:tw-to-orange-400 tw-transition-all tw-shadow-lg tw-shadow-purple-500/20"
          >
            + Emitir Factura
          </button>
        </div>
      </div>

      {configIssues.length > 0 && (
        <div className="tw-bg-yellow-500/10 tw-border tw-border-yellow-500/20 tw-text-yellow-400 tw-p-4 tw-rounded-xl tw-text-xs">
          <p className="tw-font-bold tw-mb-1">⚠ Configuración SRI incompleta (backend/.env):</p>
          <ul className="tw-list-disc tw-ml-5">{configIssues.map((m, i) => <li key={i}>{m}</li>)}</ul>
        </div>
      )}

      {error && (
        <div className="tw-bg-red-500/10 tw-border tw-border-red-500/20 tw-text-red-400 tw-p-4 tw-rounded-xl tw-text-sm">{error}</div>
      )}

      {/* Tabla de facturas */}
      <div className="tw-bg-gray-900/60 tw-backdrop-blur-md tw-rounded-2xl tw-shadow-2xl tw-border tw-border-gray-700/50 tw-overflow-hidden">
        <div className="tw-overflow-x-auto">
          <table className="tw-w-full tw-text-left tw-text-sm tw-whitespace-nowrap">
            <thead className="tw-uppercase tw-tracking-wider tw-border-b tw-border-gray-700 tw-bg-gray-800/80 tw-text-gray-400 tw-text-xs tw-font-bold">
              <tr>
                <th className="tw-px-6 tw-py-5">No.</th>
                <th className="tw-px-6 tw-py-5">Fecha</th>
                <th className="tw-px-6 tw-py-5">Cliente</th>
                <th className="tw-px-6 tw-py-5">Total</th>
                <th className="tw-px-6 tw-py-5">Estado SRI</th>
                <th className="tw-px-6 tw-py-5">Acciones</th>
              </tr>
            </thead>
            <tbody className="tw-divide-y tw-divide-gray-700/50">
              {loading ? (
                <tr><td colSpan="6" className="tw-px-6 tw-py-16 tw-text-center tw-text-gray-500">Cargando facturas...</td></tr>
              ) : invoices.length === 0 ? (
                <tr><td colSpan="6" className="tw-px-6 tw-py-16 tw-text-center tw-text-gray-500">No hay facturas emitidas aún.</td></tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:tw-bg-gray-800/50 tw-transition-colors">
                    <td className="tw-px-6 tw-py-5 tw-font-mono tw-text-gray-300">
                      {invoiceNumber(inv)}
                      {Number(inv.ambiente) !== 2 && <span className="tw-ml-2 tw-text-[10px] tw-text-orange-400 tw-font-bold">PRUEBA</span>}
                    </td>
                    <td className="tw-px-6 tw-py-5 tw-text-gray-300">{formatDate(inv.created_at)}</td>
                    <td className="tw-px-6 tw-py-5">
                      <p className="tw-font-medium tw-text-white">{inv.razon_social}</p>
                      <p className="tw-text-xs tw-text-gray-500 tw-font-mono">{inv.identificacion}</p>
                    </td>
                    <td className="tw-px-6 tw-py-5 tw-text-green-400 tw-font-bold">{formatMoney(inv.total)}</td>
                    <td className="tw-px-6 tw-py-5">{renderEstado(inv.estado)}</td>
                    <td className="tw-px-6 tw-py-5">
                      <div className="tw-flex tw-items-center tw-gap-2">
                        <button
                          onClick={() => setDetail(inv)}
                          className="tw-px-3 tw-py-1.5 tw-text-xs tw-font-bold tw-bg-gray-800 tw-text-gray-300 hover:tw-bg-gray-700 tw-rounded-lg tw-border tw-border-gray-700 tw-transition-all"
                        >
                          Detalle
                        </button>
                        {inv.estado !== 'generada' && (
                          <button
                            onClick={() => handleDownload(inv, 'xml')}
                            disabled={actionId === inv.id}
                            className="tw-px-3 tw-py-1.5 tw-text-xs tw-font-bold tw-bg-blue-500/10 tw-text-blue-400 hover:tw-bg-blue-600 hover:tw-text-white tw-rounded-lg tw-border tw-border-blue-500/30 tw-transition-all disabled:tw-opacity-50"
                          >
                            XML
                          </button>
                        )}
                        <button
                          onClick={() => handleDownload(inv, 'ride')}
                          disabled={actionId === inv.id}
                          className="tw-px-3 tw-py-1.5 tw-text-xs tw-font-bold tw-bg-purple-600/10 tw-text-purple-400 hover:tw-bg-purple-600 hover:tw-text-white tw-rounded-lg tw-border tw-border-purple-500/30 tw-transition-all disabled:tw-opacity-50"
                        >
                          RIDE
                        </button>
                        {RETRYABLE.includes(inv.estado) && (
                          <button
                            onClick={() => handleRetry(inv)}
                            disabled={actionId === inv.id}
                            className="tw-px-3 tw-py-1.5 tw-text-xs tw-font-bold tw-bg-orange-500/10 tw-text-orange-400 hover:tw-bg-orange-600 hover:tw-text-white tw-rounded-lg tw-border tw-border-orange-500/30 tw-transition-all disabled:tw-opacity-50"
                          >
                            {actionId === inv.id ? '...' : 'Reintentar'}
                          </button>
                        )}
                        {inv.estado === 'autorizada' && inv.email && (
                          <button
                            onClick={() => handleSendEmail(inv)}
                            disabled={actionId === inv.id}
                            className="tw-px-3 tw-py-1.5 tw-text-xs tw-font-bold tw-bg-green-500/10 tw-text-green-400 hover:tw-bg-green-600 hover:tw-text-white tw-rounded-lg tw-border tw-border-green-500/30 tw-transition-all disabled:tw-opacity-50"
                          >
                            Email
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Emitir factura */}
      {showForm && (
        <div
          className="tw-fixed tw-inset-0 tw-z-[100] tw-flex tw-items-center tw-justify-center tw-p-4 tw-bg-black/70 tw-backdrop-blur-sm"
          onClick={() => !emitting && setShowForm(false)}
        >
          <div
            className="tw-bg-gray-900 tw-border tw-border-gray-700 tw-rounded-2xl tw-shadow-2xl tw-w-full tw-max-w-3xl tw-max-h-[90vh] tw-overflow-y-auto custom-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="tw-flex tw-justify-between tw-items-center tw-p-6 tw-border-b tw-border-gray-800 tw-sticky tw-top-0 tw-bg-gray-900 tw-z-10">
              <div className="tw-flex tw-items-center tw-gap-3">
                <h3 className="tw-text-lg tw-font-bold tw-text-white">Emitir Factura Electrónica</h3>
                <span className={`tw-px-2.5 tw-py-1 tw-rounded-lg tw-text-[10px] tw-font-bold tw-uppercase tw-border ${
                  ambienteProd
                    ? 'tw-bg-green-500/10 tw-text-green-400 tw-border-green-500/30'
                    : 'tw-bg-orange-500/10 tw-text-orange-400 tw-border-orange-500/30'
                }`}>
                  {ambienteProd ? 'PRODUCCIÓN' : 'PRUEBAS'}
                </span>
              </div>
              <button
                onClick={() => setShowForm(false)}
                disabled={emitting}
                className="tw-w-9 tw-h-9 tw-flex tw-items-center tw-justify-center tw-rounded-lg tw-bg-gray-800 tw-text-gray-400 hover:tw-text-white hover:tw-bg-gray-700 tw-transition-all"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEmit} className="tw-p-6 tw-space-y-6">

              {/* Autocompletar desde pago */}
              <div>
                <label className={labelCls}>Autocompletar desde un pago (opcional)</label>
                <select value={sourcePaymentId} onChange={(e) => handleSourceChange(e.target.value)} className={inputCls}>
                  <option value="">— Ingreso manual —</option>
                  {payments.map((p) => (
                    <option key={p.id} value={p.id}>
                      #{p.id} · {p.plan_name} · {formatMoney(p.amount)} · {parseJsonField(p.client_info).razonSocial || 'Sin nombre'}
                    </option>
                  ))}
                </select>
                {sourcePaymentId && (
                  <p className="tw-text-[11px] tw-text-gray-500 tw-mt-1.5">
                    Precio unitario calculado dividiendo el monto cobrado para 1.15, para que el total facturado coincida con lo pagado.
                  </p>
                )}
              </div>

              {/* Comprador */}
              <div className="tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 tw-gap-4">
                <div>
                  <label className={labelCls}>Tipo de identificación</label>
                  <select
                    value={form.tipoIdentificacion}
                    onChange={(e) => setForm({ ...form, tipoIdentificacion: e.target.value })}
                    className={inputCls}
                  >
                    <option value="05">Cédula</option>
                    <option value="04">RUC</option>
                    <option value="06">Pasaporte</option>
                    <option value="07">Consumidor Final</option>
                  </select>
                </div>
                {form.tipoIdentificacion !== '07' && (
                  <div>
                    <label className={labelCls}>Identificación</label>
                    <input
                      type="text"
                      required
                      value={form.identificacion}
                      onChange={(e) => setForm({ ...form, identificacion: e.target.value.replace(/[^\dA-Za-z]/g, '') })}
                      placeholder={form.tipoIdentificacion === '04' ? '13 dígitos (termina en 001)' : form.tipoIdentificacion === '05' ? '10 dígitos' : 'Pasaporte'}
                      maxLength={form.tipoIdentificacion === '04' ? 13 : form.tipoIdentificacion === '05' ? 10 : 20}
                      className={inputCls}
                    />
                  </div>
                )}
                {form.tipoIdentificacion !== '07' && (
                  <div className="sm:tw-col-span-2">
                    <label className={labelCls}>Razón Social / Nombres</label>
                    <input type="text" required value={form.razonSocial} onChange={(e) => setForm({ ...form, razonSocial: e.target.value })} className={inputCls} />
                  </div>
                )}
                <div>
                  <label className={labelCls}>Email</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} placeholder="Para envío automático del RIDE+XML" />
                </div>
                <div>
                  <label className={labelCls}>Teléfono</label>
                  <input type="text" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} className={inputCls} />
                </div>
                <div className="sm:tw-col-span-2">
                  <label className={labelCls}>Dirección</label>
                  <input type="text" value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Forma de pago</label>
                  <select value={form.formaPago} onChange={(e) => setForm({ ...form, formaPago: e.target.value })} className={inputCls}>
                    <option value="tarjeta">Tarjeta de crédito (19)</option>
                    <option value="transferencia">Transferencia (20)</option>
                    <option value="efectivo">Efectivo / Otros (01)</option>
                  </select>
                </div>
              </div>

              {/* Items */}
              <div>
                <div className="tw-flex tw-justify-between tw-items-center tw-mb-2">
                  <label className={labelCls + ' tw-mb-0'}>Ítems</label>
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, items: [...f.items, emptyItem()] }))}
                    className="tw-px-3 tw-py-1.5 tw-text-xs tw-font-bold tw-bg-purple-600/10 tw-text-purple-400 hover:tw-bg-purple-600 hover:tw-text-white tw-rounded-lg tw-border tw-border-purple-500/30 tw-transition-all"
                  >
                    + Agregar ítem
                  </button>
                </div>
                <div className="tw-space-y-3">
                  {form.items.map((it, idx) => (
                    <div key={idx} className="tw-grid tw-grid-cols-12 tw-gap-2 tw-items-end tw-bg-gray-800/40 tw-p-3 tw-rounded-xl tw-border tw-border-gray-700/50">
                      <div className="tw-col-span-12 sm:tw-col-span-4">
                        <label className="tw-text-[10px] tw-text-gray-500 tw-font-bold">DESCRIPCIÓN</label>
                        <input type="text" required value={it.descripcion} onChange={(e) => setItem(idx, 'descripcion', e.target.value)} className={inputCls} />
                      </div>
                      <div className="tw-col-span-3 sm:tw-col-span-1">
                        <label className="tw-text-[10px] tw-text-gray-500 tw-font-bold">CANT.</label>
                        <input type="number" min="0.01" step="any" required value={it.cantidad} onChange={(e) => setItem(idx, 'cantidad', e.target.value)} className={inputCls} />
                      </div>
                      <div className="tw-col-span-4 sm:tw-col-span-2">
                        <label className="tw-text-[10px] tw-text-gray-500 tw-font-bold">P. UNITARIO</label>
                        <input type="number" min="0" step="any" required value={it.precioUnitario} onChange={(e) => setItem(idx, 'precioUnitario', e.target.value)} className={inputCls} />
                      </div>
                      <div className="tw-col-span-3 sm:tw-col-span-2">
                        <label className="tw-text-[10px] tw-text-gray-500 tw-font-bold">DESC.</label>
                        <input type="number" min="0" step="any" value={it.descuento} onChange={(e) => setItem(idx, 'descuento', e.target.value)} className={inputCls} />
                      </div>
                      <div className="tw-col-span-8 sm:tw-col-span-2">
                        <label className="tw-text-[10px] tw-text-gray-500 tw-font-bold">IVA</label>
                        <select value={it.codigoPorcentajeIva} onChange={(e) => setItem(idx, 'codigoPorcentajeIva', e.target.value)} className={inputCls}>
                          <option value="4">15%</option>
                          <option value="0">0%</option>
                        </select>
                      </div>
                      <div className="tw-col-span-4 sm:tw-col-span-1 tw-flex tw-justify-end">
                        {form.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== idx) }))}
                            className="tw-w-9 tw-h-9 tw-rounded-lg tw-bg-red-500/10 tw-text-red-400 hover:tw-bg-red-600 hover:tw-text-white tw-border tw-border-red-500/30 tw-transition-all tw-text-sm"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totales en vivo */}
              <div className="tw-flex tw-justify-end">
                <div className="tw-bg-gray-800/50 tw-rounded-xl tw-border tw-border-gray-700/50 tw-p-4 tw-w-64 tw-text-sm tw-space-y-1.5">
                  <div className="tw-flex tw-justify-between tw-text-gray-400"><span>Subtotal</span><span>{formatMoney(totals.subtotal)}</span></div>
                  <div className="tw-flex tw-justify-between tw-text-gray-400"><span>IVA 15%</span><span>{formatMoney(totals.iva)}</span></div>
                  <div className="tw-flex tw-justify-between tw-text-white tw-font-bold tw-text-base tw-border-t tw-border-gray-700 tw-pt-2"><span>TOTAL</span><span className="tw-text-green-400">{formatMoney(totals.total)}</span></div>
                </div>
              </div>

              <button
                type="submit"
                disabled={emitting || (config && config.missingConfig?.length > 0)}
                className="tw-w-full tw-py-4 tw-rounded-xl tw-text-white tw-font-bold tw-bg-gradient-to-r tw-from-purple-600 tw-to-orange-500 hover:tw-from-purple-500 hover:tw-to-orange-400 tw-transition-all tw-shadow-lg tw-shadow-purple-500/20 disabled:tw-opacity-50"
              >
                {emitting ? 'Emitiendo y enviando al SRI... (puede tardar)' : `Emitir y enviar al SRI (${ambienteProd ? 'PRODUCCIÓN' : 'PRUEBAS'})`}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Detalle de factura */}
      {detail && (
        <div
          className="tw-fixed tw-inset-0 tw-z-[100] tw-flex tw-items-center tw-justify-center tw-p-4 tw-bg-black/70 tw-backdrop-blur-sm"
          onClick={() => setDetail(null)}
        >
          <div
            className="tw-bg-gray-900 tw-border tw-border-gray-700 tw-rounded-2xl tw-shadow-2xl tw-w-full tw-max-w-2xl tw-max-h-[85vh] tw-overflow-y-auto custom-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="tw-flex tw-justify-between tw-items-center tw-p-6 tw-border-b tw-border-gray-800 tw-sticky tw-top-0 tw-bg-gray-900 tw-z-10">
              <div>
                <h3 className="tw-text-lg tw-font-bold tw-text-white tw-font-mono">{invoiceNumber(detail)}</h3>
                <p className="tw-text-xs tw-text-gray-400 tw-mt-0.5">{formatDate(detail.created_at)}</p>
              </div>
              <div className="tw-flex tw-items-center tw-gap-3">
                {renderEstado(detail.estado)}
                <button
                  onClick={() => setDetail(null)}
                  className="tw-w-9 tw-h-9 tw-flex tw-items-center tw-justify-center tw-rounded-lg tw-bg-gray-800 tw-text-gray-400 hover:tw-text-white hover:tw-bg-gray-700 tw-transition-all"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="tw-p-6 tw-space-y-5">
              <div className="tw-grid tw-grid-cols-2 tw-gap-4">
                <div className="tw-bg-gray-800/50 tw-rounded-xl tw-p-4 tw-border tw-border-gray-700/50">
                  <p className="tw-text-[11px] tw-text-gray-500 tw-uppercase tw-font-bold">Cliente</p>
                  <p className="tw-text-sm tw-text-white tw-mt-1">{detail.razon_social}</p>
                  <p className="tw-text-xs tw-text-gray-500 tw-font-mono">{detail.identificacion}</p>
                </div>
                <div className="tw-bg-gray-800/50 tw-rounded-xl tw-p-4 tw-border tw-border-gray-700/50">
                  <p className="tw-text-[11px] tw-text-gray-500 tw-uppercase tw-font-bold">Totales</p>
                  <p className="tw-text-xs tw-text-gray-400 tw-mt-1">Subtotal: {formatMoney(detail.subtotal)} · IVA: {formatMoney(detail.iva)}</p>
                  <p className="tw-text-sm tw-text-green-400 tw-font-bold">Total: {formatMoney(detail.total)}</p>
                </div>
              </div>
              {detail.clave_acceso && (
                <div className="tw-bg-gray-800/50 tw-rounded-xl tw-p-4 tw-border tw-border-gray-700/50">
                  <p className="tw-text-[11px] tw-text-gray-500 tw-uppercase tw-font-bold">Clave de acceso</p>
                  <p className="tw-text-xs tw-text-gray-300 tw-font-mono tw-break-all tw-mt-1">{detail.clave_acceso}</p>
                </div>
              )}
              {detail.numero_autorizacion && (
                <div className="tw-bg-gray-800/50 tw-rounded-xl tw-p-4 tw-border tw-border-gray-700/50">
                  <p className="tw-text-[11px] tw-text-gray-500 tw-uppercase tw-font-bold">Autorización SRI</p>
                  <p className="tw-text-xs tw-text-gray-300 tw-font-mono tw-break-all tw-mt-1">{detail.numero_autorizacion}</p>
                  {detail.fecha_autorizacion && <p className="tw-text-xs tw-text-gray-500 tw-mt-1">{formatDate(detail.fecha_autorizacion)}</p>}
                </div>
              )}
              {(() => {
                const msgs = parseJsonField(detail.mensajes_sri);
                const list = Array.isArray(msgs) ? msgs : [];
                if (!list.length) return null;
                return (
                  <div className="tw-bg-gray-950/60 tw-rounded-xl tw-p-4 tw-border tw-border-gray-700/50">
                    <p className="tw-text-[11px] tw-text-orange-400 tw-uppercase tw-font-bold tw-mb-2">Mensajes del SRI</p>
                    {list.map((m, i) => (
                      <div key={i} className="tw-text-xs tw-text-gray-300 tw-mb-2 last:tw-mb-0">
                        <span className="tw-font-bold">{m.identificador ? `[${m.identificador}] ` : ''}{m.tipo ? `${m.tipo}: ` : ''}</span>
                        {m.mensaje}
                        {m.informacionAdicional && <p className="tw-text-gray-500 tw-mt-0.5">{m.informacionAdicional}</p>}
                      </div>
                    ))}
                  </div>
                );
              })()}
              <div className="tw-flex tw-flex-wrap tw-gap-3 tw-pt-2 tw-border-t tw-border-gray-800">
                {detail.estado !== 'generada' && (
                  <button onClick={() => handleDownload(detail, 'xml')} className="tw-px-4 tw-py-2 tw-text-xs tw-font-bold tw-bg-blue-500/10 tw-text-blue-400 hover:tw-bg-blue-600 hover:tw-text-white tw-rounded-lg tw-border tw-border-blue-500/30 tw-transition-all">Descargar XML</button>
                )}
                <button onClick={() => handleDownload(detail, 'ride')} className="tw-px-4 tw-py-2 tw-text-xs tw-font-bold tw-bg-purple-600/10 tw-text-purple-400 hover:tw-bg-purple-600 hover:tw-text-white tw-rounded-lg tw-border tw-border-purple-500/30 tw-transition-all">Descargar RIDE</button>
                {RETRYABLE.includes(detail.estado) && (
                  <button onClick={() => handleRetry(detail)} disabled={actionId === detail.id} className="tw-px-4 tw-py-2 tw-text-xs tw-font-bold tw-bg-orange-500/10 tw-text-orange-400 hover:tw-bg-orange-600 hover:tw-text-white tw-rounded-lg tw-border tw-border-orange-500/30 tw-transition-all disabled:tw-opacity-50">Reintentar con el SRI</button>
                )}
                {detail.estado === 'autorizada' && detail.email && (
                  <button onClick={() => handleSendEmail(detail)} disabled={actionId === detail.id} className="tw-px-4 tw-py-2 tw-text-xs tw-font-bold tw-bg-green-500/10 tw-text-green-400 hover:tw-bg-green-600 hover:tw-text-white tw-rounded-lg tw-border tw-border-green-500/30 tw-transition-all disabled:tw-opacity-50">Reenviar email</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
