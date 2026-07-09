'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import InvoicesTab from './InvoicesTab';
import '@/components/Slider/slider.css';

const STATUS_STYLES = {
  pending: { label: 'Pendiente', badge: 'tw-bg-yellow-500/10 tw-text-yellow-500 tw-border-yellow-500/20', dot: 'tw-bg-yellow-500' },
  approved: { label: 'Aprobado', badge: 'tw-bg-green-500/10 tw-text-green-400 tw-border-green-500/20', dot: 'tw-bg-green-400' },
  rejected: { label: 'Rechazado', badge: 'tw-bg-red-500/10 tw-text-red-400 tw-border-red-500/20', dot: 'tw-bg-red-400' }
};

const METHOD_STYLES = {
  tarjeta: { label: 'Tarjeta', badge: 'tw-bg-blue-500/10 tw-text-blue-400 tw-border-blue-500/20' },
  transferencia: { label: 'Transferencia', badge: 'tw-bg-orange-500/10 tw-text-orange-400 tw-border-orange-500/20' }
};

const parseJsonField = (value) => {
  if (value && typeof value === 'object') return value;
  if (typeof value === 'string') {
    try { return JSON.parse(value); } catch { return {}; }
  }
  return {};
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('payments');
  const [payments, setPayments] = useState([]);
  const [leads, setLeads] = useState([]);
  const [chatUsage, setChatUsage] = useState({ days: 7, summary: [], recent: [] });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Payments filters / detail
  const [filterMethod, setFilterMethod] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const [selectedChatSession, setSelectedChatSession] = useState(null);
  const [chatSessionMessages, setChatSessionMessages] = useState([]);
  const [loadingChatSession, setLoadingChatSession] = useState(false);

  // Facturación: pago precargado al pulsar "Emitir factura" en el detalle de un pago
  const [invoicePrefillPayment, setInvoicePrefillPayment] = useState(null);

  // Settings / Password states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [settingsSuccess, setSettingsSuccess] = useState('');
  const [settingsError, setSettingsError] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

  const handleSessionExpired = useCallback(() => {
    localStorage.removeItem('adminToken');
    router.push('/admin');
  }, [router]);

  const fetchData = useCallback(async (isRefresh = false) => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin');
      return;
    }
    if (isRefresh) setRefreshing(true); else setLoading(true);
    setError('');
    try {
      const [paymentsRes, leadsRes, chatUsageRes] = await Promise.all([
        fetch(`${apiUrl}/api/admin/payments`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${apiUrl}/api/admin/leads`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${apiUrl}/api/admin/chat-usage?days=7`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (paymentsRes.status === 401 || leadsRes.status === 401 || chatUsageRes.status === 401) {
        handleSessionExpired();
        return;
      }

      const paymentsData = await paymentsRes.json();
      const leadsData = await leadsRes.json();
      const chatUsageData = await chatUsageRes.json();

      if (paymentsData.success) setPayments(paymentsData.data);
      if (leadsData.success) setLeads(leadsData.data);
      if (chatUsageData.success) setChatUsage(chatUsageData);

    } catch (err) {
      console.error(err);
      setError('Error al cargar los datos. Revisa la conexión con el servidor.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [apiUrl, router, handleSessionExpired]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleStatusChange = async (paymentId, newStatus) => {
    const statusLabel = STATUS_STYLES[newStatus]?.label || newStatus;
    if (!window.confirm(`¿Confirmas cambiar el pago #${paymentId} a "${statusLabel}"?`)) return;

    const token = localStorage.getItem('adminToken');
    setUpdatingStatusId(paymentId);
    try {
      const res = await fetch(`${apiUrl}/api/admin/payments/${paymentId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.status === 401) {
        handleSessionExpired();
        return;
      }
      const data = await res.json();
      if (data.success) {
        setPayments(prev => prev.map(p => (p.id === paymentId ? { ...p, payment_status: newStatus } : p)));
        setSelectedPayment(prev => (prev && prev.id === paymentId ? { ...prev, payment_status: newStatus } : prev));
      } else {
        alert(data.error || 'No se pudo actualizar el estado');
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión al actualizar el estado');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setSettingsError('');
    setSettingsSuccess('');

    if (newPassword !== confirmPassword) {
      setSettingsError('Las nuevas contraseñas no coinciden');
      return;
    }

    setUpdatingPassword(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${apiUrl}/api/admin/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSettingsSuccess('Contraseña actualizada correctamente');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setSettingsError(data.error || 'Error al actualizar la contraseña');
      }
    } catch (err) {
      console.error(err);
      setSettingsError('Error de conexión con el servidor');
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleLogout = async () => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      try {
        await fetch(`${apiUrl}/api/admin/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch { /* best-effort */ }
    }
    localStorage.removeItem('adminToken');
    router.push('/admin');
  };

  const openChatSession = async (session) => {
    const token = localStorage.getItem('adminToken');
    setSelectedChatSession(session);
    setChatSessionMessages([]);
    setLoadingChatSession(true);
    try {
      const res = await fetch(`${apiUrl}/api/admin/chat-sessions/${session.id}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 401) {
        handleSessionExpired();
        return;
      }
      const data = await res.json();
      if (data.success) {
        setSelectedChatSession(data.session);
        setChatSessionMessages(data.messages || []);
      } else {
        alert(data.error || 'No se pudo cargar la conversación');
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión al cargar la conversación');
    } finally {
      setLoadingChatSession(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('es-EC', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatMoney = (value) => {
    const n = Number(value);
    return Number.isFinite(n) ? `$${n.toFixed(2)}` : `$${value}`;
  };

  // ====== Derived data (stats + filters) ======
  const stats = useMemo(() => {
    const approved = payments.filter(p => p.payment_status === 'approved');
    const totalApproved = approved.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    return {
      totalApproved,
      cardCount: payments.filter(p => p.payment_method === 'tarjeta').length,
      transferCount: payments.filter(p => p.payment_method === 'transferencia').length,
      pendingCount: payments.filter(p => p.payment_status === 'pending').length
    };
  }, [payments]);

  const filteredPayments = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return payments.filter(p => {
      if (filterMethod !== 'all' && p.payment_method !== filterMethod) return false;
      if (filterStatus !== 'all' && p.payment_status !== filterStatus) return false;
      if (q) {
        const haystack = [
          String(p.id),
          p.plan_name,
          p.transaction_id,
          typeof p.client_info === 'string' ? p.client_info : JSON.stringify(p.client_info || {})
        ].filter(Boolean).join(' ').toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [payments, filterMethod, filterStatus, searchQuery]);

  const chatMetrics = useMemo(() => {
    const rows = Array.isArray(chatUsage.summary) ? chatUsage.summary : [];
    const byEvent = rows.reduce((acc, row) => {
      const events = Number(row.events) || 0;
      const messageChars = Number(row.total_message_chars) || 0;
      const responseChars = Number(row.total_response_chars) || 0;
      const current = acc[row.event_type] || { events: 0, messageChars: 0, responseChars: 0 };
      acc[row.event_type] = {
        events: current.events + events,
        messageChars: current.messageChars + messageChars,
        responseChars: current.responseChars + responseChars
      };
      return acc;
    }, {});

    const eventCount = (name) => byEvent[name]?.events || 0;
    const aiResponses = eventCount('chat_ai_response');
    const staticReplies = eventCount('chat_static_reply') + eventCount('chat_welcome');
    const limits = eventCount('chat_rate_limited_minute') + eventCount('chat_rate_limited_daily') + eventCount('chat_tts_rate_limited');
    const leadsCaptured = eventCount('chat_lead_saved');
    const ttsGenerated = eventCount('chat_tts_generated');
    const responseChars = Object.values(byEvent).reduce((sum, row) => sum + row.responseChars, 0);

    return {
      byEvent,
      aiResponses,
      staticReplies,
      limits,
      leadsCaptured,
      ttsGenerated,
      responseChars,
      totalEvents: Object.values(byEvent).reduce((sum, row) => sum + row.events, 0),
      estimatedOutputTokens: Math.ceil(responseChars / 4)
    };
  }, [chatUsage]);

  const renderStatusBadge = (status) => {
    const s = STATUS_STYLES[status] || STATUS_STYLES.pending;
    return (
      <span className={`tw-inline-flex tw-items-center tw-px-3 tw-py-1 tw-rounded-full tw-text-xs tw-font-semibold tw-border ${s.badge}`}>
        <span className={`tw-w-1.5 tw-h-1.5 tw-rounded-full tw-mr-2 ${s.dot}`}></span>
        {s.label}
      </span>
    );
  };

  const renderMethodBadge = (method) => {
    const m = METHOD_STYLES[method] || { label: method || 'N/A', badge: 'tw-bg-gray-500/10 tw-text-gray-400 tw-border-gray-500/20' };
    return (
      <span className={`tw-inline-flex tw-items-center tw-px-2.5 tw-py-1 tw-rounded-lg tw-text-[11px] tw-font-bold tw-border tw-uppercase tw-tracking-wider ${m.badge}`}>
        {m.label}
      </span>
    );
  };

  return (
    <div className="tw-min-h-screen tw-bg-[#0f172a] tw-text-gray-100 tw-font-sans tw-relative">

      {/* Background ambient light */}
      <div className="tw-absolute tw-top-0 tw-left-1/2 tw--translate-x-1/2 tw-w-full tw-max-w-4xl tw-h-[400px] tw-bg-purple-600/10 tw-blur-[150px] tw-rounded-full tw-pointer-events-none"></div>

      {/* Header */}
      <header className="tw-bg-gray-900/80 tw-backdrop-blur-md tw-border-b tw-border-gray-800 tw-sticky tw-top-0 tw-z-50">
        <div className="tw-max-w-7xl tw-mx-auto tw-px-4 sm:tw-px-6 lg:tw-px-8 tw-py-4 tw-flex tw-justify-between tw-items-center">
          <div className="tw-flex tw-items-center tw-space-x-3">
            <div className="tw-w-10 tw-h-10 tw-bg-gradient-to-br tw-from-purple-600 tw-to-orange-500 tw-rounded-xl tw-flex tw-items-center tw-justify-center tw-font-bold tw-text-white tw-shadow-lg tw-shadow-purple-500/20">
              U
            </div>
            <div>
              <h1 className="tw-text-xl tw-font-bold tw-text-transparent tw-bg-clip-text tw-bg-gradient-to-r tw-from-white tw-to-gray-400">
                Admin Dashboard
              </h1>
              <p className="tw-text-xs tw-text-purple-400">Panel de Control General</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="tw-text-sm tw-bg-gray-800 hover:tw-bg-red-500/10 hover:tw-text-red-400 hover:tw-border-red-500/50 tw-px-5 tw-py-2.5 tw-rounded-lg tw-transition-all tw-duration-300 tw-border tw-border-gray-700 tw-font-medium"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="tw-max-w-7xl tw-mx-auto tw-px-4 sm:tw-px-6 lg:tw-px-8 tw-py-8 tw-relative tw-z-10">

        {/* Tabs */}
        <div className="tw-flex tw-flex-wrap tw-gap-2 tw-bg-gray-800/60 tw-p-1.5 tw-rounded-2xl tw-w-max tw-max-w-full tw-mb-8 tw-border tw-border-gray-700/50 tw-backdrop-blur-sm">
          <button
            onClick={() => setActiveTab('payments')}
            className={`tw-px-6 tw-py-3 tw-rounded-xl tw-text-sm tw-font-semibold tw-transition-all tw-duration-300 tw-flex tw-items-center tw-gap-3 ${
              activeTab === 'payments'
                ? 'tw-bg-gradient-to-r tw-from-purple-600 tw-to-orange-500 tw-text-white tw-shadow-lg'
                : 'tw-text-gray-400 hover:tw-text-white hover:tw-bg-gray-700/50'
            }`}
          >
            Pagos
            <span className={`tw-px-2.5 tw-py-0.5 tw-rounded-full tw-text-xs ${activeTab === 'payments' ? 'tw-bg-black/20' : 'tw-bg-gray-700 tw-text-gray-300'}`}>
              {payments.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('leads')}
            className={`tw-px-6 tw-py-3 tw-rounded-xl tw-text-sm tw-font-semibold tw-transition-all tw-duration-300 tw-flex tw-items-center tw-gap-3 ${
              activeTab === 'leads'
                ? 'tw-bg-gradient-to-r tw-from-purple-600 tw-to-orange-500 tw-text-white tw-shadow-lg'
                : 'tw-text-gray-400 hover:tw-text-white hover:tw-bg-gray-700/50'
            }`}
          >
            Formularios / Leads
            <span className={`tw-px-2.5 tw-py-0.5 tw-rounded-full tw-text-xs ${activeTab === 'leads' ? 'tw-bg-black/20' : 'tw-bg-gray-700 tw-text-gray-300'}`}>
              {leads.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`tw-px-6 tw-py-3 tw-rounded-xl tw-text-sm tw-font-semibold tw-transition-all tw-duration-300 tw-flex tw-items-center tw-gap-3 ${
              activeTab === 'invoices'
                ? 'tw-bg-gradient-to-r tw-from-purple-600 tw-to-orange-500 tw-text-white tw-shadow-lg'
                : 'tw-text-gray-400 hover:tw-text-white hover:tw-bg-gray-700/50'
            }`}
          >
            Facturas
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`tw-px-6 tw-py-3 tw-rounded-xl tw-text-sm tw-font-semibold tw-transition-all tw-duration-300 tw-flex tw-items-center tw-gap-3 ${
              activeTab === 'ai'
                ? 'tw-bg-gradient-to-r tw-from-purple-600 tw-to-orange-500 tw-text-white tw-shadow-lg'
                : 'tw-text-gray-400 hover:tw-text-white hover:tw-bg-gray-700/50'
            }`}
          >
            IA
            <span className={`tw-px-2.5 tw-py-0.5 tw-rounded-full tw-text-xs ${activeTab === 'ai' ? 'tw-bg-black/20' : 'tw-bg-gray-700 tw-text-gray-300'}`}>
              {chatMetrics.totalEvents}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`tw-px-6 tw-py-3 tw-rounded-xl tw-text-sm tw-font-semibold tw-transition-all tw-duration-300 tw-flex tw-items-center tw-gap-3 ${
              activeTab === 'settings'
                ? 'tw-bg-gradient-to-r tw-from-purple-600 tw-to-orange-500 tw-text-white tw-shadow-lg'
                : 'tw-text-gray-400 hover:tw-text-white hover:tw-bg-gray-700/50'
            }`}
          >
            Configuraciones
          </button>
        </div>

        {error && (
          <div className="tw-bg-red-500/10 tw-border tw-border-red-500/20 tw-text-red-400 tw-p-4 tw-mb-8 tw-rounded-xl tw-flex tw-items-center">
            <svg className="tw-w-5 tw-h-5 tw-mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            {error}
          </div>
        )}

        {loading ? (
          <div className="tw-flex tw-justify-center tw-items-center tw-h-64">
            <div className="tw-animate-spin tw-rounded-full tw-h-12 tw-w-12 tw-border-t-2 tw-border-b-2 tw-border-orange-500"></div>
          </div>
        ) : (
          <>
            {/* PAYMENTS TAB */}
            {activeTab === 'payments' && (
              <div className="tw-space-y-6">

                {/* Stats Cards */}
                <div className="tw-grid tw-grid-cols-2 lg:tw-grid-cols-4 tw-gap-4">
                  <div className="tw-bg-gray-900/60 tw-backdrop-blur-md tw-rounded-2xl tw-border tw-border-gray-700/50 tw-p-5">
                    <p className="tw-text-xs tw-text-gray-400 tw-uppercase tw-tracking-wider tw-font-bold">Total Recaudado</p>
                    <p className="tw-text-2xl tw-font-bold tw-text-green-400 tw-mt-2">{formatMoney(stats.totalApproved)}</p>
                    <p className="tw-text-[11px] tw-text-gray-500 tw-mt-1">Solo pagos aprobados</p>
                  </div>
                  <div className="tw-bg-gray-900/60 tw-backdrop-blur-md tw-rounded-2xl tw-border tw-border-gray-700/50 tw-p-5">
                    <p className="tw-text-xs tw-text-gray-400 tw-uppercase tw-tracking-wider tw-font-bold">Pagos con Tarjeta</p>
                    <p className="tw-text-2xl tw-font-bold tw-text-blue-400 tw-mt-2">{stats.cardCount}</p>
                    <p className="tw-text-[11px] tw-text-gray-500 tw-mt-1">Vía PayPhone</p>
                  </div>
                  <div className="tw-bg-gray-900/60 tw-backdrop-blur-md tw-rounded-2xl tw-border tw-border-gray-700/50 tw-p-5">
                    <p className="tw-text-xs tw-text-gray-400 tw-uppercase tw-tracking-wider tw-font-bold">Transferencias</p>
                    <p className="tw-text-2xl tw-font-bold tw-text-orange-400 tw-mt-2">{stats.transferCount}</p>
                    <p className="tw-text-[11px] tw-text-gray-500 tw-mt-1">Depósitos bancarios</p>
                  </div>
                  <div className="tw-bg-gray-900/60 tw-backdrop-blur-md tw-rounded-2xl tw-border tw-border-gray-700/50 tw-p-5">
                    <p className="tw-text-xs tw-text-gray-400 tw-uppercase tw-tracking-wider tw-font-bold">Pendientes</p>
                    <p className="tw-text-2xl tw-font-bold tw-text-yellow-400 tw-mt-2">{stats.pendingCount}</p>
                    <p className="tw-text-[11px] tw-text-gray-500 tw-mt-1">Requieren revisión</p>
                  </div>
                </div>

                {/* Filters Bar */}
                <div className="tw-flex tw-flex-wrap tw-items-center tw-gap-3 tw-bg-gray-900/60 tw-backdrop-blur-md tw-rounded-2xl tw-border tw-border-gray-700/50 tw-p-4">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por plan, ID, transacción o cliente..."
                    className="tw-flex-1 tw-min-w-[220px] tw-px-4 tw-py-2.5 tw-bg-gray-800/50 tw-border tw-border-gray-700 tw-rounded-xl tw-text-sm tw-text-white tw-placeholder-gray-500 tw-focus:outline-none tw-focus:ring-2 tw-focus:ring-purple-500/50"
                  />
                  <select
                    value={filterMethod}
                    onChange={(e) => setFilterMethod(e.target.value)}
                    className="tw-px-4 tw-py-2.5 tw-bg-gray-800/50 tw-border tw-border-gray-700 tw-rounded-xl tw-text-sm tw-text-white tw-focus:outline-none tw-focus:ring-2 tw-focus:ring-purple-500/50"
                  >
                    <option value="all">Todos los métodos</option>
                    <option value="tarjeta">Tarjeta</option>
                    <option value="transferencia">Transferencia</option>
                  </select>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="tw-px-4 tw-py-2.5 tw-bg-gray-800/50 tw-border tw-border-gray-700 tw-rounded-xl tw-text-sm tw-text-white tw-focus:outline-none tw-focus:ring-2 tw-focus:ring-purple-500/50"
                  >
                    <option value="all">Todos los estados</option>
                    <option value="pending">Pendiente</option>
                    <option value="approved">Aprobado</option>
                    <option value="rejected">Rechazado</option>
                  </select>
                  <button
                    onClick={() => fetchData(true)}
                    disabled={refreshing}
                    className="tw-flex tw-items-center tw-gap-2 tw-px-4 tw-py-2.5 tw-bg-purple-600/10 tw-text-purple-400 hover:tw-bg-purple-600 hover:tw-text-white tw-rounded-xl tw-border tw-border-purple-500/30 tw-transition-all tw-duration-300 tw-text-sm tw-font-bold disabled:tw-opacity-50"
                  >
                    <svg className={`tw-w-4 tw-h-4 ${refreshing ? 'tw-animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                    {refreshing ? 'Actualizando...' : 'Refrescar'}
                  </button>
                </div>

                {/* Payments Table */}
                <div className="tw-bg-gray-900/60 tw-backdrop-blur-md tw-rounded-2xl tw-shadow-2xl tw-border tw-border-gray-700/50 tw-overflow-hidden">
                  <div className="tw-overflow-x-auto">
                    <table className="tw-w-full tw-text-left tw-text-sm tw-whitespace-nowrap">
                      <thead className="tw-uppercase tw-tracking-wider tw-border-b tw-border-gray-700 tw-bg-gray-800/80 tw-text-gray-400 tw-text-xs tw-font-bold">
                        <tr>
                          <th className="tw-px-6 tw-py-5">ID</th>
                          <th className="tw-px-6 tw-py-5">Fecha</th>
                          <th className="tw-px-6 tw-py-5">Plan</th>
                          <th className="tw-px-6 tw-py-5">Monto</th>
                          <th className="tw-px-6 tw-py-5">Método</th>
                          <th className="tw-px-6 tw-py-5">Estado</th>
                          <th className="tw-px-6 tw-py-5">Comprobante</th>
                          <th className="tw-px-6 tw-py-5">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="tw-divide-y tw-divide-gray-700/50">
                        {filteredPayments.length === 0 ? (
                          <tr>
                            <td colSpan="8" className="tw-px-6 tw-py-16 tw-text-center tw-text-gray-500">
                              <div className="tw-flex tw-flex-col tw-items-center">
                                <svg className="tw-w-12 tw-h-12 tw-mb-3 tw-text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                <p>{payments.length === 0 ? 'No hay pagos registrados.' : 'No hay pagos que coincidan con los filtros.'}</p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          filteredPayments.map((p) => (
                            <tr key={p.id} className="hover:tw-bg-gray-800/50 tw-transition-colors">
                              <td className="tw-px-6 tw-py-5 tw-font-mono tw-text-gray-500">#{p.id}</td>
                              <td className="tw-px-6 tw-py-5 tw-text-gray-300">{formatDate(p.created_at)}</td>
                              <td className="tw-px-6 tw-py-5 tw-font-medium tw-text-white">{p.plan_name}</td>
                              <td className="tw-px-6 tw-py-5 tw-text-green-400 tw-font-bold">{formatMoney(p.amount)}</td>
                              <td className="tw-px-6 tw-py-5">{renderMethodBadge(p.payment_method)}</td>
                              <td className="tw-px-6 tw-py-5">{renderStatusBadge(p.payment_status)}</td>
                              <td className="tw-px-6 tw-py-5">
                                {p.voucher_url ? (
                                  <a
                                    href={p.voucher_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="tw-inline-flex tw-items-center tw-px-4 tw-py-2 tw-bg-purple-600/10 tw-text-purple-400 hover:tw-bg-purple-600 hover:tw-text-white tw-rounded-lg tw-border tw-border-purple-500/30 tw-transition-all tw-duration-300 tw-text-xs tw-font-bold"
                                  >
                                    <svg className="tw-w-4 tw-h-4 tw-mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                    Ver
                                  </a>
                                ) : (
                                  <span className="tw-text-gray-500 tw-text-xs tw-italic">{p.payment_method === 'tarjeta' ? 'PayPhone' : 'Sin archivo'}</span>
                                )}
                              </td>
                              <td className="tw-px-6 tw-py-5">
                                <div className="tw-flex tw-items-center tw-gap-2">
                                  <button
                                    onClick={() => setSelectedPayment(p)}
                                    className="tw-px-3 tw-py-1.5 tw-text-xs tw-font-bold tw-bg-gray-800 tw-text-gray-300 hover:tw-bg-gray-700 tw-rounded-lg tw-border tw-border-gray-700 tw-transition-all"
                                  >
                                    Detalle
                                  </button>
                                  {p.payment_status === 'pending' && (
                                    <>
                                      <button
                                        onClick={() => handleStatusChange(p.id, 'approved')}
                                        disabled={updatingStatusId === p.id}
                                        className="tw-px-3 tw-py-1.5 tw-text-xs tw-font-bold tw-bg-green-500/10 tw-text-green-400 hover:tw-bg-green-600 hover:tw-text-white tw-rounded-lg tw-border tw-border-green-500/30 tw-transition-all disabled:tw-opacity-50"
                                      >
                                        Aprobar
                                      </button>
                                      <button
                                        onClick={() => handleStatusChange(p.id, 'rejected')}
                                        disabled={updatingStatusId === p.id}
                                        className="tw-px-3 tw-py-1.5 tw-text-xs tw-font-bold tw-bg-red-500/10 tw-text-red-400 hover:tw-bg-red-600 hover:tw-text-white tw-rounded-lg tw-border tw-border-red-500/30 tw-transition-all disabled:tw-opacity-50"
                                      >
                                        Rechazar
                                      </button>
                                    </>
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
              </div>
            )}

            {/* LEADS TAB */}
            {activeTab === 'leads' && (
              <div className="tw-bg-gray-900/60 tw-backdrop-blur-md tw-rounded-2xl tw-shadow-2xl tw-border tw-border-gray-700/50 tw-overflow-hidden">
                <div className="tw-overflow-x-auto">
                  <table className="tw-w-full tw-text-left tw-text-sm">
                    <thead className="tw-uppercase tw-tracking-wider tw-border-b tw-border-gray-700 tw-bg-gray-800/80 tw-text-gray-400 tw-text-xs tw-font-bold">
                      <tr>
                        <th className="tw-px-6 tw-py-5 tw-whitespace-nowrap">Fecha</th>
                        <th className="tw-px-6 tw-py-5 tw-whitespace-nowrap">Origen</th>
                        <th className="tw-px-6 tw-py-5 tw-whitespace-nowrap">Nombre</th>
                        <th className="tw-px-6 tw-py-5 tw-whitespace-nowrap">Contacto</th>
                        <th className="tw-px-6 tw-py-5 tw-min-w-[350px]">Detalles Técnicos</th>
                      </tr>
                    </thead>
                    <tbody className="tw-divide-y tw-divide-gray-700/50">
                      {leads.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="tw-px-6 tw-py-16 tw-text-center tw-text-gray-500">
                            <div className="tw-flex tw-flex-col tw-items-center">
                              <svg className="tw-w-12 tw-h-12 tw-mb-3 tw-text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                              <p>No hay leads registrados aún.</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        leads.map((l) => {
                          const payload = parseJsonField(l.data);
                          return (
                            <tr key={l.id} className="hover:tw-bg-gray-800/50 tw-transition-colors">
                              <td className="tw-px-6 tw-py-5 tw-text-gray-400 tw-whitespace-nowrap">{formatDate(l.created_at)}</td>
                              <td className="tw-px-6 tw-py-5 tw-whitespace-nowrap">
                                <span className="tw-inline-flex tw-items-center tw-px-2.5 tw-py-1 tw-rounded-lg tw-text-[11px] tw-font-bold tw-bg-orange-500/10 tw-text-orange-400 tw-border tw-border-orange-500/20 tw-uppercase tw-tracking-wider">
                                  {l.form_type}
                                </span>
                              </td>
                              <td className="tw-px-6 tw-py-5 tw-font-bold tw-text-white tw-whitespace-nowrap">{l.name}</td>
                              <td className="tw-px-6 tw-py-5 tw-whitespace-nowrap">
                                <div className="tw-flex tw-items-center tw-text-gray-300">
                                  <svg className="tw-w-3.5 tw-h-3.5 tw-mr-1.5 tw-text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                  {l.email}
                                </div>
                                <div className="tw-flex tw-items-center tw-text-gray-400 tw-text-xs tw-mt-1">
                                  <svg className="tw-w-3.5 tw-h-3.5 tw-mr-1.5 tw-text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                                  {l.phone}
                                </div>
                              </td>
                              <td className="tw-px-6 tw-py-5">
                                <div className="tw-bg-gray-900/80 tw-p-3.5 tw-rounded-xl tw-border tw-border-gray-700/50 tw-text-xs tw-text-gray-400 tw-font-mono tw-overflow-auto tw-max-h-40 custom-scrollbar tw-shadow-inner">
                                  {Object.entries(payload).map(([key, value]) => {
                                    if (['name', 'email', 'phone', 'nombre', 'telefono', 'g-recaptcha-response', 'contactName', 'contactEmail', 'contactPhone'].includes(key)) return null;
                                    return (
                                      <div key={key} className="tw-mb-1.5 last:tw-mb-0 tw-flex tw-gap-2">
                                        <span className="tw-text-purple-400 tw-font-semibold tw-shrink-0">{key}:</span>
                                        <span className="tw-text-gray-300">{typeof value === 'object' ? JSON.stringify(value) : value?.toString() || 'N/A'}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* INVOICES TAB */}
            {activeTab === 'invoices' && (
              <InvoicesTab
                apiUrl={apiUrl}
                payments={payments}
                onSessionExpired={handleSessionExpired}
                formatDate={formatDate}
                formatMoney={formatMoney}
                prefillPayment={invoicePrefillPayment}
                onPrefillConsumed={() => setInvoicePrefillPayment(null)}
              />
            )}

            {/* AI METRICS TAB */}
            {activeTab === 'ai' && (
              <div className="tw-space-y-6">
                <div className="tw-flex tw-flex-wrap tw-items-center tw-justify-between tw-gap-3">
                  <div>
                    <h2 className="tw-text-xl tw-font-bold tw-text-white">Métricas del Asistente IA</h2>
                    <p className="tw-text-xs tw-text-gray-400 tw-mt-1">Resumen de los últimos {chatUsage.days || 7} días.</p>
                  </div>
                  <button
                    onClick={() => fetchData(true)}
                    disabled={refreshing}
                    className="tw-flex tw-items-center tw-gap-2 tw-px-4 tw-py-2.5 tw-bg-purple-600/10 tw-text-purple-400 hover:tw-bg-purple-600 hover:tw-text-white tw-rounded-xl tw-border tw-border-purple-500/30 tw-transition-all tw-duration-300 tw-text-sm tw-font-bold disabled:tw-opacity-50"
                  >
                    <svg className={`tw-w-4 tw-h-4 ${refreshing ? 'tw-animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                    {refreshing ? 'Actualizando...' : 'Refrescar'}
                  </button>
                </div>

                <div className="tw-grid tw-grid-cols-2 lg:tw-grid-cols-6 tw-gap-4">
                  <div className="tw-bg-gray-900/60 tw-backdrop-blur-md tw-rounded-2xl tw-border tw-border-gray-700/50 tw-p-5">
                    <p className="tw-text-xs tw-text-gray-400 tw-uppercase tw-tracking-wider tw-font-bold">IA real</p>
                    <p className="tw-text-2xl tw-font-bold tw-text-purple-400 tw-mt-2">{chatMetrics.aiResponses}</p>
                    <p className="tw-text-[11px] tw-text-gray-500 tw-mt-1">Llamadas a Gemini</p>
                  </div>
                  <div className="tw-bg-gray-900/60 tw-backdrop-blur-md tw-rounded-2xl tw-border tw-border-gray-700/50 tw-p-5">
                    <p className="tw-text-xs tw-text-gray-400 tw-uppercase tw-tracking-wider tw-font-bold">Plantillas</p>
                    <p className="tw-text-2xl tw-font-bold tw-text-blue-400 tw-mt-2">{chatMetrics.staticReplies}</p>
                    <p className="tw-text-[11px] tw-text-gray-500 tw-mt-1">Sin costo IA</p>
                  </div>
                  <div className="tw-bg-gray-900/60 tw-backdrop-blur-md tw-rounded-2xl tw-border tw-border-gray-700/50 tw-p-5">
                    <p className="tw-text-xs tw-text-gray-400 tw-uppercase tw-tracking-wider tw-font-bold">Límites</p>
                    <p className="tw-text-2xl tw-font-bold tw-text-yellow-400 tw-mt-2">{chatMetrics.limits}</p>
                    <p className="tw-text-[11px] tw-text-gray-500 tw-mt-1">Bloqueos sanos</p>
                  </div>
                  <div className="tw-bg-gray-900/60 tw-backdrop-blur-md tw-rounded-2xl tw-border tw-border-gray-700/50 tw-p-5">
                    <p className="tw-text-xs tw-text-gray-400 tw-uppercase tw-tracking-wider tw-font-bold">Leads IA</p>
                    <p className="tw-text-2xl tw-font-bold tw-text-green-400 tw-mt-2">{chatMetrics.leadsCaptured}</p>
                    <p className="tw-text-[11px] tw-text-gray-500 tw-mt-1">Capturados en chat</p>
                  </div>
                  <div className="tw-bg-gray-900/60 tw-backdrop-blur-md tw-rounded-2xl tw-border tw-border-gray-700/50 tw-p-5">
                    <p className="tw-text-xs tw-text-gray-400 tw-uppercase tw-tracking-wider tw-font-bold">Voz</p>
                    <p className="tw-text-2xl tw-font-bold tw-text-orange-400 tw-mt-2">{chatMetrics.ttsGenerated}</p>
                    <p className="tw-text-[11px] tw-text-gray-500 tw-mt-1">TTS generado</p>
                  </div>
                  <div className="tw-bg-gray-900/60 tw-backdrop-blur-md tw-rounded-2xl tw-border tw-border-gray-700/50 tw-p-5">
                    <p className="tw-text-xs tw-text-gray-400 tw-uppercase tw-tracking-wider tw-font-bold">Tokens aprox.</p>
                    <p className="tw-text-2xl tw-font-bold tw-text-pink-400 tw-mt-2">{chatMetrics.estimatedOutputTokens}</p>
                    <p className="tw-text-[11px] tw-text-gray-500 tw-mt-1">Salida estimada</p>
                  </div>
                </div>

                <div className="tw-grid lg:tw-grid-cols-2 tw-gap-6">
                  <div className="tw-bg-gray-900/60 tw-backdrop-blur-md tw-rounded-2xl tw-shadow-2xl tw-border tw-border-gray-700/50 tw-overflow-hidden">
                    <div className="tw-p-5 tw-border-b tw-border-gray-800">
                      <h3 className="tw-text-sm tw-font-bold tw-text-white">Eventos por tipo</h3>
                      <p className="tw-text-xs tw-text-gray-500 tw-mt-1">Sirve para ver ahorro por plantillas y presión de límites.</p>
                    </div>
                    <div className="tw-overflow-x-auto">
                      <table className="tw-w-full tw-text-left tw-text-sm">
                        <thead className="tw-uppercase tw-tracking-wider tw-border-b tw-border-gray-700 tw-bg-gray-800/80 tw-text-gray-400 tw-text-xs tw-font-bold">
                          <tr>
                            <th className="tw-px-5 tw-py-4">Evento</th>
                            <th className="tw-px-5 tw-py-4 tw-text-right">Cantidad</th>
                            <th className="tw-px-5 tw-py-4 tw-text-right">Chars respuesta</th>
                          </tr>
                        </thead>
                        <tbody className="tw-divide-y tw-divide-gray-700/50">
                          {Object.entries(chatMetrics.byEvent).length === 0 ? (
                            <tr><td colSpan="3" className="tw-px-5 tw-py-10 tw-text-center tw-text-gray-500">Aún no hay métricas registradas.</td></tr>
                          ) : (
                            Object.entries(chatMetrics.byEvent).map(([eventType, row]) => (
                              <tr key={eventType} className="hover:tw-bg-gray-800/50">
                                <td className="tw-px-5 tw-py-4 tw-font-mono tw-text-xs tw-text-purple-300">{eventType}</td>
                                <td className="tw-px-5 tw-py-4 tw-text-right tw-font-bold tw-text-white">{row.events}</td>
                                <td className="tw-px-5 tw-py-4 tw-text-right tw-text-gray-400">{row.responseChars}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="tw-bg-gray-900/60 tw-backdrop-blur-md tw-rounded-2xl tw-shadow-2xl tw-border tw-border-gray-700/50 tw-overflow-hidden">
                    <div className="tw-p-5 tw-border-b tw-border-gray-800">
                      <h3 className="tw-text-sm tw-font-bold tw-text-white">Eventos recientes</h3>
                      <p className="tw-text-xs tw-text-gray-500 tw-mt-1">Últimos 100 registros del asistente.</p>
                    </div>
                    <div className="tw-divide-y tw-divide-gray-800 tw-max-h-[430px] tw-overflow-y-auto custom-scrollbar">
                      {(chatUsage.recent || []).length === 0 ? (
                        <div className="tw-px-5 tw-py-10 tw-text-center tw-text-gray-500 tw-text-sm">Sin eventos recientes.</div>
                      ) : (
                        chatUsage.recent.map((event) => (
                          <div key={event.id} className="tw-p-4 hover:tw-bg-gray-800/40 tw-transition-colors">
                            <div className="tw-flex tw-items-center tw-justify-between tw-gap-3">
                              <span className="tw-font-mono tw-text-xs tw-text-purple-300">{event.event_type}</span>
                              <span className="tw-text-[11px] tw-text-gray-500 tw-whitespace-nowrap">{formatDate(event.created_at)}</span>
                            </div>
                            <div className="tw-mt-2 tw-flex tw-flex-wrap tw-gap-2 tw-text-[11px] tw-text-gray-400">
                              <span className="tw-bg-gray-800 tw-border tw-border-gray-700 tw-rounded-lg tw-px-2 tw-py-1">msg {event.message_length || 0}</span>
                              <span className="tw-bg-gray-800 tw-border tw-border-gray-700 tw-rounded-lg tw-px-2 tw-py-1">resp {event.response_length || 0}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="tw-bg-gray-900/60 tw-backdrop-blur-md tw-rounded-2xl tw-shadow-2xl tw-border tw-border-gray-700/50 tw-overflow-hidden">
                  <div className="tw-p-5 tw-border-b tw-border-gray-800">
                    <h3 className="tw-text-sm tw-font-bold tw-text-white">Sesiones recientes del chat</h3>
                    <p className="tw-text-xs tw-text-gray-500 tw-mt-1">Base para historial persistente y seguimiento comercial.</p>
                  </div>
                  <div className="tw-overflow-x-auto">
                    <table className="tw-w-full tw-text-left tw-text-sm">
                      <thead className="tw-uppercase tw-tracking-wider tw-border-b tw-border-gray-700 tw-bg-gray-800/80 tw-text-gray-400 tw-text-xs tw-font-bold">
                        <tr>
                          <th className="tw-px-5 tw-py-4">Sesión</th>
                          <th className="tw-px-5 tw-py-4">Estado</th>
                          <th className="tw-px-5 tw-py-4 tw-text-right">Mensajes</th>
                          <th className="tw-px-5 tw-py-4">Lead</th>
                          <th className="tw-px-5 tw-py-4">Usuario</th>
                          <th className="tw-px-5 tw-py-4">Última actividad</th>
                          <th className="tw-px-5 tw-py-4">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="tw-divide-y tw-divide-gray-700/50">
                        {(chatUsage.sessions || []).length === 0 ? (
                          <tr><td colSpan="7" className="tw-px-5 tw-py-10 tw-text-center tw-text-gray-500">Aún no hay sesiones guardadas.</td></tr>
                        ) : (
                          chatUsage.sessions.map((session) => (
                            <tr key={session.id} className="hover:tw-bg-gray-800/50">
                              <td className="tw-px-5 tw-py-4 tw-font-mono tw-text-xs tw-text-purple-300">{session.external_session_id}</td>
                              <td className="tw-px-5 tw-py-4">
                                <span className={`tw-inline-flex tw-px-2.5 tw-py-1 tw-rounded-lg tw-text-[11px] tw-font-bold tw-border ${
                                  session.status === 'client'
                                    ? 'tw-bg-amber-500/10 tw-text-amber-400 tw-border-amber-500/20'
                                    : session.status === 'lead_captured'
                                    ? 'tw-bg-green-500/10 tw-text-green-400 tw-border-green-500/20'
                                    : session.status === 'registered'
                                    ? 'tw-bg-blue-500/10 tw-text-blue-400 tw-border-blue-500/20'
                                    : 'tw-bg-gray-700/50 tw-text-gray-300 tw-border-gray-600'
                                }`}>
                                  {session.status || 'active'}
                                </span>
                              </td>
                              <td className="tw-px-5 tw-py-4 tw-text-right tw-font-bold tw-text-white">{session.message_count || 0}</td>
                              <td className="tw-px-5 tw-py-4 tw-text-gray-300">{session.lead_id ? `#${session.lead_id}` : '-'}</td>
                              <td className="tw-px-5 tw-py-4">
                                {session.user_email ? (
                                  <div>
                                    <div className="tw-text-white tw-font-semibold">{session.user_name || 'Usuario IA'}</div>
                                    <div className="tw-text-xs tw-text-gray-500">{session.user_email}</div>
                                  </div>
                                ) : (
                                  <span className="tw-text-gray-500">-</span>
                                )}
                              </td>
                              <td className="tw-px-5 tw-py-4 tw-text-gray-400 tw-whitespace-nowrap">{formatDate(session.last_message_at || session.updated_at)}</td>
                              <td className="tw-px-5 tw-py-4">
                                <button
                                  onClick={() => openChatSession(session)}
                                  className="tw-px-3 tw-py-1.5 tw-text-xs tw-font-bold tw-bg-gray-800 tw-text-gray-300 hover:tw-bg-purple-600 hover:tw-text-white tw-rounded-lg tw-border tw-border-gray-700 hover:tw-border-purple-500 tw-transition-all"
                                >
                                  Ver
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === 'settings' && (
              <div className="tw-bg-gray-900/60 tw-backdrop-blur-md tw-rounded-2xl tw-shadow-2xl tw-border tw-border-gray-700/50 tw-overflow-hidden">
                <div className="tw-p-8 tw-max-w-xl tw-mx-auto">
                  <h3 className="tw-text-xl tw-font-bold tw-text-white tw-mb-2">Configuración de Seguridad</h3>
                  <p className="tw-text-xs tw-text-gray-400 tw-mb-8">Actualiza la contraseña del panel administrativo. Se guarda cifrada (bcrypt) en la base de datos.</p>

                  <form onSubmit={handlePasswordChange} className="tw-space-y-6">
                    <div>
                      <label className="tw-block tw-text-xs tw-font-bold tw-text-purple-400 tw-uppercase tw-tracking-wider tw-mb-2.5">Contraseña Actual</label>
                      <input
                        type="password"
                        required
                        className="tw-w-full tw-px-5 tw-py-4 tw-bg-gray-800/40 tw-border tw-border-gray-700 tw-rounded-xl tw-text-white tw-placeholder-gray-500 tw-focus:outline-none tw-focus:ring-2 tw-focus:ring-purple-500/50 tw-focus:border-purple-500 tw-transition-all tw-duration-300"
                        placeholder="Ingresa la contraseña actual..."
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="tw-block tw-text-xs tw-font-bold tw-text-purple-400 tw-uppercase tw-tracking-wider tw-mb-2.5">Nueva Contraseña</label>
                      <input
                        type="password"
                        required
                        className="tw-w-full tw-px-5 tw-py-4 tw-bg-gray-800/40 tw-border tw-border-gray-700 tw-rounded-xl tw-text-white tw-placeholder-gray-500 tw-focus:outline-none tw-focus:ring-2 tw-focus:ring-purple-500/50 tw-focus:border-purple-500 tw-transition-all tw-duration-300"
                        placeholder="Mínimo 12 caracteres, mayúsculas, minúsculas y números..."
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="tw-block tw-text-xs tw-font-bold tw-text-purple-400 tw-uppercase tw-tracking-wider tw-mb-2.5">Confirmar Nueva Contraseña</label>
                      <input
                        type="password"
                        required
                        className="tw-w-full tw-px-5 tw-py-4 tw-bg-gray-800/40 tw-border tw-border-gray-700 tw-rounded-xl tw-text-white tw-placeholder-gray-500 tw-focus:outline-none tw-focus:ring-2 tw-focus:ring-purple-500/50 tw-focus:border-purple-500 tw-transition-all tw-duration-300"
                        placeholder="Confirma la nueva contraseña..."
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>

                    {settingsError && (
                      <div className="tw-text-red-400 tw-bg-red-500/10 tw-border tw-border-red-500/20 tw-p-4 tw-rounded-xl tw-text-xs tw-font-medium tw-animate-pulse">
                        {settingsError}
                      </div>
                    )}

                    {settingsSuccess && (
                      <div className="tw-text-green-400 tw-bg-green-500/10 tw-border tw-border-green-500/20 tw-p-4 tw-rounded-xl tw-text-xs tw-font-medium">
                        {settingsSuccess}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={updatingPassword}
                      className="tw-w-full tw-py-4 tw-px-6 tw-rounded-xl tw-text-white tw-font-bold tw-text-md tw-bg-gradient-to-r tw-from-purple-600 tw-to-orange-500 hover:tw-from-purple-500 hover:tw-to-orange-400 tw-transition-all tw-duration-300 tw-shadow-lg tw-shadow-purple-500/20 disabled:tw-opacity-50 hover:tw-scale-[1.01] active:tw-scale-[0.99]"
                    >
                      {updatingPassword ? 'Actualizando...' : 'Actualizar Contraseña'}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* CHAT SESSION DETAIL MODAL */}
      {selectedChatSession && (
        <div
          className="tw-fixed tw-inset-0 tw-z-[100] tw-flex tw-items-center tw-justify-center tw-p-4 tw-bg-black/70 tw-backdrop-blur-sm"
          onClick={() => setSelectedChatSession(null)}
        >
          <div
            className="tw-bg-gray-900 tw-border tw-border-gray-700 tw-rounded-2xl tw-shadow-2xl tw-w-full tw-max-w-3xl tw-max-h-[85vh] tw-overflow-hidden tw-flex tw-flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="tw-flex tw-justify-between tw-items-center tw-p-6 tw-border-b tw-border-gray-800">
              <div>
                <h3 className="tw-text-lg tw-font-bold tw-text-white">Conversación IA #{selectedChatSession.id}</h3>
                <p className="tw-text-xs tw-text-gray-400 tw-mt-0.5 tw-font-mono">{selectedChatSession.external_session_id}</p>
              </div>
              <button
                onClick={() => setSelectedChatSession(null)}
                className="tw-w-9 tw-h-9 tw-flex tw-items-center tw-justify-center tw-rounded-lg tw-bg-gray-800 tw-text-gray-400 hover:tw-text-white hover:tw-bg-gray-700 tw-transition-all"
              >
                ×
              </button>
            </div>

            <div className="tw-p-5 tw-border-b tw-border-gray-800 tw-flex tw-flex-wrap tw-gap-3 tw-text-xs">
              <span className="tw-bg-gray-800 tw-border tw-border-gray-700 tw-rounded-lg tw-px-3 tw-py-1.5 tw-text-gray-300">
                Estado: {selectedChatSession.status || 'active'}
              </span>
              <span className="tw-bg-gray-800 tw-border tw-border-gray-700 tw-rounded-lg tw-px-3 tw-py-1.5 tw-text-gray-300">
                Lead: {selectedChatSession.lead_id ? `#${selectedChatSession.lead_id}` : '-'}
              </span>
              <span className="tw-bg-gray-800 tw-border tw-border-gray-700 tw-rounded-lg tw-px-3 tw-py-1.5 tw-text-gray-300">
                Usuario: {selectedChatSession.user_email ? `${selectedChatSession.user_name || 'Usuario IA'} (${selectedChatSession.user_email})` : '-'}
              </span>
              <span className="tw-bg-gray-800 tw-border tw-border-gray-700 tw-rounded-lg tw-px-3 tw-py-1.5 tw-text-gray-300">
                Inicio: {formatDate(selectedChatSession.created_at)}
              </span>
            </div>

            <div className="tw-p-6 tw-overflow-y-auto custom-scrollbar tw-space-y-4">
              {loadingChatSession ? (
                <div className="tw-flex tw-justify-center tw-items-center tw-h-40">
                  <div className="tw-animate-spin tw-rounded-full tw-h-10 tw-w-10 tw-border-t-2 tw-border-b-2 tw-border-orange-500"></div>
                </div>
              ) : chatSessionMessages.length === 0 ? (
                <div className="tw-text-center tw-text-gray-500 tw-py-12">No hay mensajes guardados para esta sesión.</div>
              ) : (
                chatSessionMessages.map((message) => {
                  const isUser = message.role === 'user';
                  const isAssistant = message.role === 'assistant';
                  return (
                    <div
                      key={message.id}
                      className={`tw-flex ${isUser ? 'tw-justify-end' : 'tw-justify-start'}`}
                    >
                      <div className={`tw-max-w-[82%] tw-rounded-2xl tw-p-4 tw-border ${
                        isUser
                          ? 'tw-bg-purple-600/20 tw-border-purple-500/30 tw-text-white'
                          : isAssistant
                            ? 'tw-bg-gray-800/80 tw-border-gray-700 tw-text-gray-100'
                            : 'tw-bg-orange-500/10 tw-border-orange-500/20 tw-text-orange-200'
                      }`}>
                        <div className="tw-flex tw-items-center tw-justify-between tw-gap-4 tw-mb-2">
                          <span className="tw-text-[11px] tw-font-bold tw-uppercase tw-tracking-wider tw-text-purple-300">{message.role}</span>
                          <span className="tw-text-[10px] tw-text-gray-500">{formatDate(message.created_at)}</span>
                        </div>
                        <p className="tw-text-sm tw-leading-relaxed tw-whitespace-pre-wrap">{message.content}</p>
                        <div className="tw-mt-2 tw-flex tw-gap-2 tw-text-[10px] tw-text-gray-500">
                          {message.event_type && <span>{message.event_type}</span>}
                          {message.used_ai ? <span>IA</span> : <span>sin IA</span>}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT DETAIL MODAL */}
      {selectedPayment && (
        <div
          className="tw-fixed tw-inset-0 tw-z-[100] tw-flex tw-items-center tw-justify-center tw-p-4 tw-bg-black/70 tw-backdrop-blur-sm"
          onClick={() => setSelectedPayment(null)}
        >
          <div
            className="tw-bg-gray-900 tw-border tw-border-gray-700 tw-rounded-2xl tw-shadow-2xl tw-w-full tw-max-w-2xl tw-max-h-[85vh] tw-overflow-y-auto custom-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="tw-flex tw-justify-between tw-items-center tw-p-6 tw-border-b tw-border-gray-800 tw-sticky tw-top-0 tw-bg-gray-900 tw-z-10">
              <div>
                <h3 className="tw-text-lg tw-font-bold tw-text-white">Pago #{selectedPayment.id}</h3>
                <p className="tw-text-xs tw-text-gray-400 tw-mt-0.5">{formatDate(selectedPayment.created_at)}</p>
              </div>
              <button
                onClick={() => setSelectedPayment(null)}
                className="tw-w-9 tw-h-9 tw-flex tw-items-center tw-justify-center tw-rounded-lg tw-bg-gray-800 tw-text-gray-400 hover:tw-text-white hover:tw-bg-gray-700 tw-transition-all"
              >
                ✕
              </button>
            </div>

            <div className="tw-p-6 tw-space-y-6">
              {/* Resumen */}
              <div className="tw-grid tw-grid-cols-2 tw-gap-4">
                <div className="tw-bg-gray-800/50 tw-rounded-xl tw-p-4 tw-border tw-border-gray-700/50">
                  <p className="tw-text-[11px] tw-text-gray-500 tw-uppercase tw-font-bold tw-tracking-wider">Plan</p>
                  <p className="tw-text-sm tw-text-white tw-font-semibold tw-mt-1">{selectedPayment.plan_name}</p>
                </div>
                <div className="tw-bg-gray-800/50 tw-rounded-xl tw-p-4 tw-border tw-border-gray-700/50">
                  <p className="tw-text-[11px] tw-text-gray-500 tw-uppercase tw-font-bold tw-tracking-wider">Monto</p>
                  <p className="tw-text-sm tw-text-green-400 tw-font-bold tw-mt-1">{formatMoney(selectedPayment.amount)}</p>
                </div>
                <div className="tw-bg-gray-800/50 tw-rounded-xl tw-p-4 tw-border tw-border-gray-700/50">
                  <p className="tw-text-[11px] tw-text-gray-500 tw-uppercase tw-font-bold tw-tracking-wider tw-mb-2">Método</p>
                  {renderMethodBadge(selectedPayment.payment_method)}
                </div>
                <div className="tw-bg-gray-800/50 tw-rounded-xl tw-p-4 tw-border tw-border-gray-700/50">
                  <p className="tw-text-[11px] tw-text-gray-500 tw-uppercase tw-font-bold tw-tracking-wider tw-mb-2">Estado</p>
                  {renderStatusBadge(selectedPayment.payment_status)}
                </div>
              </div>

              {selectedPayment.transaction_id && (
                <div className="tw-bg-gray-800/50 tw-rounded-xl tw-p-4 tw-border tw-border-gray-700/50">
                  <p className="tw-text-[11px] tw-text-gray-500 tw-uppercase tw-font-bold tw-tracking-wider">ID de Transacción (PayPhone)</p>
                  <p className="tw-text-sm tw-text-gray-300 tw-font-mono tw-mt-1 tw-break-all">{selectedPayment.transaction_id}</p>
                </div>
              )}

              {selectedPayment.voucher_url && (
                <a
                  href={selectedPayment.voucher_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tw-inline-flex tw-items-center tw-px-4 tw-py-2.5 tw-bg-purple-600/10 tw-text-purple-400 hover:tw-bg-purple-600 hover:tw-text-white tw-rounded-lg tw-border tw-border-purple-500/30 tw-transition-all tw-duration-300 tw-text-xs tw-font-bold"
                >
                  Ver comprobante de transferencia
                </a>
              )}

              {/* Datos del cliente */}
              <div>
                <p className="tw-text-xs tw-font-bold tw-text-purple-400 tw-uppercase tw-tracking-wider tw-mb-3">Información del Cliente / Pedido</p>
                <div className="tw-bg-gray-950/60 tw-p-4 tw-rounded-xl tw-border tw-border-gray-700/50 tw-text-xs tw-text-gray-400 tw-font-mono tw-overflow-auto tw-max-h-72 custom-scrollbar">
                  {Object.entries(parseJsonField(selectedPayment.client_info)).map(([key, value]) => (
                    <div key={key} className="tw-mb-1.5 last:tw-mb-0 tw-flex tw-gap-2">
                      <span className="tw-text-purple-400 tw-font-semibold tw-shrink-0">{key}:</span>
                      <span className="tw-text-gray-300 tw-break-all">{typeof value === 'object' ? JSON.stringify(value) : value?.toString() || 'N/A'}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Emitir factura desde este pago */}
              <div className="tw-pt-2 tw-border-t tw-border-gray-800">
                <button
                  onClick={() => {
                    setInvoicePrefillPayment(selectedPayment);
                    setSelectedPayment(null);
                    setActiveTab('invoices');
                  }}
                  className="tw-mt-3 tw-px-5 tw-py-2.5 tw-rounded-xl tw-text-white tw-font-bold tw-text-xs tw-bg-gradient-to-r tw-from-purple-600 tw-to-orange-500 hover:tw-from-purple-500 hover:tw-to-orange-400 tw-transition-all tw-shadow-lg tw-shadow-purple-500/20"
                >
                  🧾 Emitir factura de este pago
                </button>
              </div>

              {/* Acciones de estado */}
              <div className="tw-flex tw-flex-wrap tw-gap-3 tw-pt-2 tw-border-t tw-border-gray-800">
                <p className="tw-w-full tw-text-[11px] tw-text-gray-500 tw-uppercase tw-font-bold tw-tracking-wider tw-mt-3">Cambiar estado del pago</p>
                {['approved', 'pending', 'rejected'].filter(s => s !== selectedPayment.payment_status).map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(selectedPayment.id, s)}
                    disabled={updatingStatusId === selectedPayment.id}
                    className={`tw-px-4 tw-py-2 tw-text-xs tw-font-bold tw-rounded-lg tw-border tw-transition-all disabled:tw-opacity-50 ${
                      s === 'approved'
                        ? 'tw-bg-green-500/10 tw-text-green-400 tw-border-green-500/30 hover:tw-bg-green-600 hover:tw-text-white'
                        : s === 'rejected'
                          ? 'tw-bg-red-500/10 tw-text-red-400 tw-border-red-500/30 hover:tw-bg-red-600 hover:tw-text-white'
                          : 'tw-bg-yellow-500/10 tw-text-yellow-400 tw-border-yellow-500/30 hover:tw-bg-yellow-600 hover:tw-text-white'
                    }`}
                  >
                    Marcar como {STATUS_STYLES[s].label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        header {
          min-height: auto !important;
          height: auto !important;
          overflow: visible !important;
        }
        header::before,
        header::after {
          display: none !important;
          content: none !important;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(15, 23, 42, 0.5); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(88, 28, 135, 0.5); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(249, 115, 22, 0.8); }
      `}} />
    </div>
  );
}
