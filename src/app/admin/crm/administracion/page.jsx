"use client";

import { useEffect, useRef, useState } from 'react';
import AdminDashboard from "../../dashboard/page";
import { PageHeader } from "../_components/Ui";
import { useCrmSession } from '../_components/CrmSession';
import { hermesApi } from '@/lib/hermes/api';

const EMPTY_ACCOUNT = { label: '', bankName: '', accountHolder: '', holderIdentification: '',
  accountType: 'SAVINGS', accountNumber: '', currency: 'USD', instructions: '', priority: 0, isActive: true };

function MobileAccessRevoke() {
  const { user } = useCrmSession();
  const [status, setStatus] = useState('idle');
  const requestInProgress = useRef(false);

  if (user?.role !== 'ADMIN') return null;

  const confirmRevoke = async () => {
    if (status !== 'confirm' || requestInProgress.current) return;
    requestInProgress.current = true;
    setStatus('loading');
    try {
      await hermesApi.revokeAllMobileAccess();
      setStatus('success');
    } catch {
      // No mostrar el cuerpo del error: puede contener datos de la cuenta.
      setStatus('error');
    } finally {
      requestInProgress.current = false;
    }
  };

  return (
    <section className="crm-panel" aria-labelledby="crm-mobile-access-heading" style={{ marginBottom: 24, padding: 20 }}>
      <h2 id="crm-mobile-access-heading">Acceso desde teléfonos</h2>
      <p>Revoca las sesiones de la aplicación móvil. Esta acción no cierra tu sesión web del CRM.</p>
      {status === 'confirm' ? (
        <div role="group" aria-label="Confirmar revocación del acceso móvil" style={{ display: 'grid', gap: 10 }}>
          <p>¿Confirmas que quieres revocar el acceso de todos los teléfonos? Tendrán que volver a iniciar sesión en la aplicación móvil. Tu sesión web seguirá abierta.</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <button type="button" className="crm-button is-primary" onClick={confirmRevoke}>Sí, revocar acceso de los teléfonos</button>
            <button type="button" className="crm-button" onClick={() => setStatus('idle')}>Cancelar</button>
          </div>
        </div>
      ) : (
        <button type="button" className="crm-button" disabled={status === 'loading'} onClick={() => setStatus('confirm')}>
          Revocar acceso del teléfono
        </button>
      )}
      <div role="status" aria-live="polite">
        {status === 'loading' && 'Revocando acceso de los teléfonos…'}
        {status === 'success' && 'Acceso móvil revocado. Tu sesión web del CRM sigue abierta.'}
      </div>
      {status === 'error' && <p role="alert">No se pudo revocar el acceso móvil. Comprueba tu sesión e inténtalo de nuevo.</p>}
    </section>
  );
}

function BankAccounts() {
  const { user } = useCrmSession();
  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState(EMPTY_ACCOUNT);
  const [editingId, setEditingId] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (user?.role === 'ADMIN') hermesApi.bankAccounts().then(setAccounts).catch(() => setError('No se pudieron cargar las cuentas bancarias.'));
  }, [user?.role]);
  if (user?.role !== 'ADMIN') return null;
  const edit = (account) => {
    setEditingId(account.id);
    setForm({ label: account.label, bankName: account.bankName, accountHolder: account.accountHolder,
      holderIdentification: account.holderIdentification || '', accountType: account.accountType,
      accountNumber: '', currency: account.currency, instructions: account.instructions || '',
      priority: account.priority, isActive: account.isActive });
  };
  const save = async (event) => {
    event.preventDefault();
    setBusy(true); setError('');
    try {
      const payload = { ...form, priority: Number(form.priority) };
      if (editingId && !payload.accountNumber) delete payload.accountNumber;
      const saved = editingId ? await hermesApi.updateBankAccount(editingId, payload) : await hermesApi.createBankAccount(payload);
      setAccounts((items) => editingId ? items.map((item) => item.id === editingId ? saved : item) : [...items, saved]);
      setEditingId(''); setForm(EMPTY_ACCOUNT);
    } catch (requestError) { setError(requestError.message || 'No se pudo guardar la cuenta.'); }
    finally { setBusy(false); }
  };
  const deactivate = async (account) => {
    if (!window.confirm(`¿Desactivar ${account.label}?`)) return;
    try {
      const saved = await hermesApi.updateBankAccount(account.id, { isActive: false });
      setAccounts((items) => items.map((item) => item.id === account.id ? saved : item));
    } catch (requestError) { setError(requestError.message || 'No se pudo desactivar la cuenta.'); }
  };
  return <section className="crm-panel" style={{ marginBottom: 24, padding: 20 }}>
    <h2>Cuentas bancarias para transferencias</h2>
    <p>Solo las cuentas activas se pueden enviar por WhatsApp. Los números guardados se muestran enmascarados.</p>
    {error && <p role="alert">{error}</p>}
    <div style={{ display: 'grid', gap: 8, marginBottom: 20 }}>
      {accounts.map((account) => <div key={account.id} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <strong>{account.label}</strong><span>{account.bankName} · {account.accountNumberMasked} · {account.currency}</span>
        <span>{account.isActive ? 'Activa' : 'Inactiva'}</span>
        <button type="button" onClick={() => edit(account)}>Editar</button>
        {account.isActive && <button type="button" onClick={() => deactivate(account)}>Desactivar</button>}
      </div>)}
    </div>
    <form onSubmit={save} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 10 }}>
      <label>Nombre operativo<input required value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} /></label>
      <label>Banco<input required value={form.bankName} onChange={(e) => setForm({ ...form, bankName: e.target.value })} /></label>
      <label>Titular<input required value={form.accountHolder} onChange={(e) => setForm({ ...form, accountHolder: e.target.value })} /></label>
      <label>Identificación<input value={form.holderIdentification} onChange={(e) => setForm({ ...form, holderIdentification: e.target.value })} /></label>
      <label>Tipo<select value={form.accountType} onChange={(e) => setForm({ ...form, accountType: e.target.value })}><option value="SAVINGS">Ahorros</option><option value="CHECKING">Corriente</option><option value="OTHER">Otra</option></select></label>
      <label>Número de cuenta<input required={!editingId} value={form.accountNumber} placeholder={editingId ? 'Conservar número actual' : ''} onChange={(e) => setForm({ ...form, accountNumber: e.target.value })} /></label>
      <label>Moneda<input required maxLength={3} value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase() })} /></label>
      <label>Prioridad<input type="number" min="0" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} /></label>
      <label>Referencia o instrucciones<input value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} /></label>
      <label>Activa<input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /></label>
      <button className="crm-button is-primary" disabled={busy}>{busy ? 'Guardando…' : editingId ? 'Guardar cambios' : 'Crear cuenta'}</button>
      {editingId && <button type="button" onClick={() => { setEditingId(''); setForm(EMPTY_ACCOUNT); }}>Cancelar</button>}
    </form>
  </section>;
}

export default function UnifiedAdministrationPage() {
  return (
    <>
      <PageHeader
        eyebrow="Operación administrativa"
        title="Administración general"
        description="Pagos, formularios, facturación, uso del asistente y configuración en el mismo panel de Hermes CRM."
      />
      <MobileAccessRevoke />
      <BankAccounts />
      <AdminDashboard embedded />
    </>
  );
}
