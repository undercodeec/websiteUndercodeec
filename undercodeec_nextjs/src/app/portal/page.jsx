'use client';
import { useState, useEffect, useCallback } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.undercodeec.com';
const TOKEN_KEY = 'undercodeec_chat_auth_token';

const STATUS_LABELS = {
  pending: { label: 'Pendiente', color: '#eab308' },
  approved: { label: 'Aprobado', color: '#22c55e' },
  rejected: { label: 'Rechazado', color: '#ef4444' },
};

function formatDate(value) {
  if (!value) return '-';
  try {
    return new Date(value).toLocaleString('es-EC', { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return String(value);
  }
}

function formatMoney(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '-';
  return `$${n.toFixed(2)}`;
}

export default function PortalClientes() {
  const [booting, setBooting] = useState(true);
  const [me, setMe] = useState(null);

  // Auth form
  const [authMode, setAuthMode] = useState('login'); // login | register | forgot | reset
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', code: '' });
  const [authError, setAuthError] = useState('');
  const [authInfo, setAuthInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Dashboard
  const [activeTab, setActiveTab] = useState('proyectos');
  const [orders, setOrders] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionMessages, setSessionMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const getToken = () => (typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null);

  const loadMe = useCallback(async () => {
    const token = getToken();
    if (!token) { setBooting(false); return; }
    try {
      const res = await fetch(`${API_URL}/api/chat/me`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) { localStorage.removeItem(TOKEN_KEY); setMe(null); }
      else { const data = await res.json(); setMe(data); }
    } catch {
      setMe(null);
    } finally {
      setBooting(false);
    }
  }, []);

  useEffect(() => { loadMe(); }, [loadMe]);

  const loadDashboardData = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    setLoadingData(true);
    try {
      const [ordersRes, sessionsRes] = await Promise.all([
        fetch(`${API_URL}/api/chat/my-orders`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/api/chat/my-sessions`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (ordersRes.ok) setOrders((await ordersRes.json()).orders || []);
      if (sessionsRes.ok) setSessions((await sessionsRes.json()).sessions || []);
    } catch {
      /* silencioso */
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => { if (me) loadDashboardData(); }, [me, loadDashboardData]);

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('undercodeec_chat_user');
    setMe(null);
    setOrders([]);
    setSessions([]);
  };

  const applyAuthSuccess = (data) => {
    if (data.token) localStorage.setItem(TOKEN_KEY, data.token);
    if (data.user) localStorage.setItem('undercodeec_chat_user', JSON.stringify(data.user));
    setForm({ name: '', email: '', phone: '', password: '', code: '' });
    setAuthError('');
    setAuthInfo('');
    loadMe();
  };

  const submitAuth = async () => {
    setAuthError('');
    setAuthInfo('');

    if (authMode === 'forgot') {
      if (!form.email.trim()) { setAuthError('Escribe tu email.'); return; }
      setSubmitting(true);
      try {
        const res = await fetch(`${API_URL}/api/chat/auth/forgot`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: form.email }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) { setAuthError(data.error || 'No se pudo enviar el codigo.'); return; }
        setAuthMode('reset');
        setAuthInfo(data.message || 'Si el email existe, te enviamos un codigo. Revisa tu correo.');
      } catch { setAuthError('Error de conexion.'); }
      finally { setSubmitting(false); }
      return;
    }

    if (authMode === 'reset') {
      if (!/^\d{6}$/.test(form.code.trim()) || form.password.length < 6) {
        setAuthError('Ingresa el codigo de 6 digitos y una clave de minimo 6 caracteres.'); return;
      }
      setSubmitting(true);
      try {
        const res = await fetch(`${API_URL}/api/chat/auth/reset`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: form.email, code: form.code.trim(), password: form.password }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) { setAuthError(data.error || 'Codigo invalido o expirado.'); return; }
        applyAuthSuccess(data);
      } catch { setAuthError('Error de conexion.'); }
      finally { setSubmitting(false); }
      return;
    }

    // login / register
    if (!form.email.trim() || form.password.length < 6 || (authMode === 'register' && !form.name.trim())) {
      setAuthError('Completa los campos requeridos (clave minima 6 caracteres).'); return;
    }
    setSubmitting(true);
    try {
      const endpoint = authMode === 'register' ? 'register' : 'login';
      const body = authMode === 'register'
        ? { name: form.name, email: form.email, phone: form.phone, password: form.password }
        : { email: form.email, password: form.password };
      const res = await fetch(`${API_URL}/api/chat/auth/${endpoint}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) { setAuthError(data.error || 'No se pudo completar.'); return; }
      applyAuthSuccess(data);
    } catch { setAuthError('Error de conexion.'); }
    finally { setSubmitting(false); }
  };

  const openSession = async (session) => {
    setSelectedSession(session);
    setSessionMessages([]);
    setLoadingMessages(true);
    const token = getToken();
    try {
      const res = await fetch(`${API_URL}/api/chat/my-sessions/${session.id}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setSessionMessages((await res.json()).messages || []);
    } catch { /* silencioso */ }
    finally { setLoadingMessages(false); }
  };

  // ---- Render ----
  if (booting) {
    return <div style={S.centered}>Cargando...</div>;
  }

  if (!me) {
    return (
      <div style={S.authWrap}>
        <div style={S.authCard}>
          <h1 style={S.authTitle}>Portal de clientes</h1>
          <p style={S.authSubtitle}>
            {authMode === 'register' ? 'Crea tu cuenta para seguir tus proyectos.'
              : authMode === 'forgot' ? 'Te enviaremos un codigo de 6 digitos a tu email.'
              : authMode === 'reset' ? 'Ingresa el codigo recibido y tu nueva clave.'
              : 'Inicia sesion para ver tus proyectos e historial.'}
          </p>

          {authMode === 'register' && (
            <input style={S.input} placeholder="Nombre" value={form.name}
              onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} disabled={submitting} />
          )}
          <input style={S.input} type="email" placeholder="Email" value={form.email}
            onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))} disabled={submitting} />
          {authMode === 'register' && (
            <input style={S.input} placeholder="WhatsApp / telefono (opcional)" value={form.phone}
              onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))} disabled={submitting} />
          )}
          {authMode === 'reset' && (
            <input style={{ ...S.input, letterSpacing: '4px' }} inputMode="numeric" maxLength={6}
              placeholder="Codigo de 6 digitos" value={form.code}
              onChange={(e) => setForm(p => ({ ...p, code: e.target.value.replace(/\D/g, '').slice(0, 6) }))} disabled={submitting} />
          )}
          {authMode !== 'forgot' && (
            <input style={S.input} type="password"
              placeholder={authMode === 'reset' ? 'Nueva clave' : 'Clave'} value={form.password}
              onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))} disabled={submitting} />
          )}

          {authMode === 'login' && (
            <button style={S.linkBtn} onClick={() => { setAuthMode('forgot'); setAuthError(''); setAuthInfo(''); }} disabled={submitting}>
              Olvide mi clave
            </button>
          )}

          {authError && <div style={S.errorBox}>{authError}</div>}
          {authInfo && <div style={S.infoBox}>{authInfo}</div>}

          <button style={S.primaryBtn} onClick={submitAuth} disabled={submitting}>
            {submitting ? 'Procesando...'
              : authMode === 'register' ? 'Crear cuenta'
              : authMode === 'forgot' ? 'Enviar codigo'
              : authMode === 'reset' ? 'Guardar clave'
              : 'Iniciar sesion'}
          </button>

          <button style={S.switchBtn} disabled={submitting}
            onClick={() => {
              setAuthError(''); setAuthInfo('');
              setAuthMode(prev => prev === 'register' ? 'login' : prev === 'login' ? 'register' : 'login');
            }}>
            {authMode === 'register' ? 'Ya tengo cuenta' : authMode === 'login' ? 'Crear cuenta nueva' : 'Volver a iniciar sesion'}
          </button>
        </div>
      </div>
    );
  }

  const tierBadge = me.tier === 'client'
    ? { label: 'Cliente', color: '#22c55e' }
    : { label: 'Registrado', color: '#3b82f6' };

  return (
    <div style={S.dashWrap}>
      <header style={S.dashHeader}>
        <div>
          <h1 style={S.dashTitle}>Hola, {me.user?.name || 'cliente'}</h1>
          <span style={S.dashEmail}>{me.user?.email}</span>
        </div>
        <div style={S.headerRight}>
          <span style={{ ...S.badge, background: `${tierBadge.color}22`, color: tierBadge.color, borderColor: `${tierBadge.color}44` }}>
            {tierBadge.label}
          </span>
          <button style={S.logoutBtn} onClick={handleLogout}>Cerrar sesion</button>
        </div>
      </header>

      <div style={S.statsRow}>
        <div style={S.statCard}><span style={S.statNum}>{orders.length}</span><span style={S.statLabel}>Proyectos</span></div>
        <div style={S.statCard}><span style={S.statNum}>{sessions.length}</span><span style={S.statLabel}>Conversaciones</span></div>
        <div style={S.statCard}><span style={S.statNum}>{me.dailyMax}</span><span style={S.statLabel}>Consultas IA/dia</span></div>
      </div>

      <nav style={S.tabs}>
        {['proyectos', 'historial', 'cuenta'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{ ...S.tab, ...(activeTab === tab ? S.tabActive : {}) }}>
            {tab === 'proyectos' ? 'Mis proyectos' : tab === 'historial' ? 'Historial' : 'Mi cuenta'}
          </button>
        ))}
      </nav>

      <main style={S.main}>
        {loadingData && <div style={S.muted}>Cargando datos...</div>}

        {activeTab === 'proyectos' && !loadingData && (
          orders.length === 0
            ? <div style={S.muted}>Aun no tienes proyectos registrados. Cuando realices un pago apareceran aqui.</div>
            : <div style={S.list}>
                {orders.map(o => {
                  const st = STATUS_LABELS[o.payment_status] || { label: o.payment_status || '-', color: '#94a3b8' };
                  return (
                    <div key={o.id} style={S.card}>
                      <div style={S.cardRow}>
                        <strong style={S.cardTitle}>{o.plan_name || 'Proyecto'}</strong>
                        <span style={{ ...S.badge, background: `${st.color}22`, color: st.color, borderColor: `${st.color}44` }}>{st.label}</span>
                      </div>
                      <div style={S.cardMeta}>
                        <span>{formatMoney(o.amount)}</span>
                        <span>{o.payment_method || '-'}</span>
                        <span>{formatDate(o.created_at)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
        )}

        {activeTab === 'historial' && !loadingData && (
          sessions.length === 0
            ? <div style={S.muted}>No tienes conversaciones guardadas todavia.</div>
            : <div style={S.list}>
                {sessions.map(s => (
                  <button key={s.id} style={{ ...S.card, ...S.cardBtn }} onClick={() => openSession(s)}>
                    <div style={S.cardRow}>
                      <strong style={S.cardTitle}>Conversacion #{s.id}</strong>
                      <span style={S.muted}>{s.message_count} mensajes</span>
                    </div>
                    <div style={S.cardMeta}><span>{formatDate(s.updated_at)}</span></div>
                  </button>
                ))}
              </div>
        )}

        {activeTab === 'cuenta' && (
          <div style={S.card}>
            <div style={S.accRow}><span style={S.accLabel}>Nombre</span><span>{me.user?.name || '-'}</span></div>
            <div style={S.accRow}><span style={S.accLabel}>Email</span><span>{me.user?.email}</span></div>
            <div style={S.accRow}><span style={S.accLabel}>Telefono</span><span>{me.user?.phone || '-'}</span></div>
            <div style={S.accRow}><span style={S.accLabel}>Tipo</span><span>{tierBadge.label}</span></div>
            {me.user?.isClient && (
              <div style={S.accRow}><span style={S.accLabel}>Cliente desde</span><span>{formatDate(me.user?.clientSince)}</span></div>
            )}
            <div style={S.accRow}><span style={S.accLabel}>Cuenta creada</span><span>{formatDate(me.user?.createdAt)}</span></div>
          </div>
        )}
      </main>

      {selectedSession && (
        <div style={S.modalOverlay} onClick={() => setSelectedSession(null)}>
          <div style={S.modal} onClick={(e) => e.stopPropagation()}>
            <div style={S.modalHead}>
              <strong>Conversacion #{selectedSession.id}</strong>
              <button style={S.modalClose} onClick={() => setSelectedSession(null)}>x</button>
            </div>
            <div style={S.modalBody}>
              {loadingMessages ? <div style={S.muted}>Cargando...</div>
                : sessionMessages.length === 0 ? <div style={S.muted}>Sin mensajes.</div>
                : sessionMessages.map(m => (
                    <div key={m.id} style={{ ...S.msg, ...(m.role === 'user' ? S.msgUser : S.msgAssistant) }}>
                      <span style={S.msgRole}>{m.role === 'user' ? 'Tu' : 'Asistente'}</span>
                      <span>{m.content}</span>
                    </div>
                  ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const S = {
  centered: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0b1120', color: '#94a3b8', fontFamily: 'Segoe UI, Arial, sans-serif' },
  authWrap: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0b1120', padding: '20px', fontFamily: 'Segoe UI, Arial, sans-serif' },
  authCard: { width: '100%', maxWidth: '380px', background: '#101828', borderRadius: '18px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '10px', boxShadow: '0 10px 40px rgba(0,0,0,0.4)' },
  authTitle: { color: '#fff', fontSize: '22px', margin: 0 },
  authSubtitle: { color: '#94a3b8', fontSize: '13px', margin: '0 0 8px' },
  input: { border: '1px solid rgba(255,255,255,0.14)', background: '#0b1120', color: '#fff', borderRadius: '10px', padding: '11px 13px', fontSize: '13px', outline: 'none' },
  linkBtn: { alignSelf: 'flex-start', background: 'none', border: 'none', color: '#efa238', fontSize: '12px', cursor: 'pointer', padding: 0, textDecoration: 'underline' },
  primaryBtn: { background: '#efa238', color: '#101828', border: 'none', borderRadius: '10px', padding: '11px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', marginTop: '4px' },
  switchBtn: { background: 'none', border: '1px solid rgba(255,255,255,0.16)', color: '#cbd5e1', borderRadius: '10px', padding: '9px', fontSize: '12px', cursor: 'pointer' },
  errorBox: { background: 'rgba(239,68,68,0.12)', color: '#fca5a5', borderRadius: '8px', padding: '8px 10px', fontSize: '12px' },
  infoBox: { background: 'rgba(34,197,94,0.12)', color: '#86efac', borderRadius: '8px', padding: '8px 10px', fontSize: '12px' },

  dashWrap: { minHeight: '100vh', background: '#0b1120', color: '#e2e8f0', fontFamily: 'Segoe UI, Arial, sans-serif', padding: '24px', maxWidth: '900px', margin: '0 auto' },
  dashHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' },
  dashTitle: { fontSize: '24px', margin: 0, color: '#fff' },
  dashEmail: { fontSize: '13px', color: '#94a3b8' },
  headerRight: { display: 'flex', alignItems: 'center', gap: '10px' },
  logoutBtn: { background: 'none', border: '1px solid rgba(255,255,255,0.16)', color: '#cbd5e1', borderRadius: '8px', padding: '7px 12px', fontSize: '12px', cursor: 'pointer' },
  badge: { fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '999px', border: '1px solid' },

  statsRow: { display: 'flex', gap: '12px', margin: '20px 0', flexWrap: 'wrap' },
  statCard: { flex: '1 1 120px', background: '#101828', borderRadius: '14px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px' },
  statNum: { fontSize: '24px', fontWeight: 700, color: '#fff' },
  statLabel: { fontSize: '12px', color: '#94a3b8' },

  tabs: { display: 'flex', gap: '6px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '18px' },
  tab: { background: 'none', border: 'none', color: '#94a3b8', padding: '10px 14px', fontSize: '13px', cursor: 'pointer', borderBottom: '2px solid transparent' },
  tabActive: { color: '#fff', borderBottom: '2px solid #efa238' },

  main: { display: 'flex', flexDirection: 'column', gap: '12px' },
  list: { display: 'flex', flexDirection: 'column', gap: '10px' },
  card: { background: '#101828', borderRadius: '12px', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '8px' },
  cardBtn: { textAlign: 'left', border: 'none', cursor: 'pointer', color: '#e2e8f0', width: '100%' },
  cardRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' },
  cardTitle: { fontSize: '14px', color: '#fff' },
  cardMeta: { display: 'flex', gap: '14px', fontSize: '12px', color: '#94a3b8', flexWrap: 'wrap' },
  muted: { color: '#94a3b8', fontSize: '13px', padding: '8px 0' },

  accRow: { display: 'flex', justifyContent: 'space-between', gap: '10px', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: '13px' },
  accLabel: { color: '#94a3b8' },

  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 50 },
  modal: { background: '#101828', borderRadius: '16px', width: '100%', maxWidth: '520px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' },
  modalHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 18px', borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#fff' },
  modalClose: { background: 'none', border: 'none', color: '#94a3b8', fontSize: '16px', cursor: 'pointer' },
  modalBody: { padding: '16px 18px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' },
  msg: { display: 'flex', flexDirection: 'column', gap: '3px', padding: '8px 12px', borderRadius: '10px', fontSize: '13px', maxWidth: '85%' },
  msgUser: { alignSelf: 'flex-end', background: '#efa23822', color: '#fde68a' },
  msgAssistant: { alignSelf: 'flex-start', background: '#1e293b', color: '#e2e8f0' },
  msgRole: { fontSize: '10px', textTransform: 'uppercase', opacity: 0.7 },
};
