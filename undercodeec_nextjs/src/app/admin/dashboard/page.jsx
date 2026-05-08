'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import '@/components/Slider/slider.css';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('transfers');
  const [transfers, setTransfers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  // Settings / Password states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [settingsSuccess, setSettingsSuccess] = useState('');
  const [settingsError, setSettingsError] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
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

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin');
      return;
    }

    fetchData(token);
  }, [router]);

  const fetchData = async (token) => {
    setLoading(true);
    setError('');
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
      
      const [transfersRes, leadsRes] = await Promise.all([
        fetch(`${apiUrl}/api/admin/transfers`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${apiUrl}/api/admin/leads`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (transfersRes.status === 401 || leadsRes.status === 401) {
        localStorage.removeItem('adminToken');
        router.push('/admin');
        return;
      }

      const transfersData = await transfersRes.json();
      const leadsData = await leadsRes.json();

      if (transfersData.success) setTransfers(transfersData.data);
      if (leadsData.success) setLeads(leadsData.data);

    } catch (err) {
      console.error(err);
      setError('Error al cargar los datos. Revisa la conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    router.push('/admin');
  };

  const parseLeadData = (dataStr) => {
    try {
      return JSON.parse(dataStr);
    } catch {
      return {};
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
        <div className="tw-flex tw-space-x-2 tw-bg-gray-800/60 tw-p-1.5 tw-rounded-2xl tw-w-max tw-mb-8 tw-border tw-border-gray-700/50 tw-backdrop-blur-sm">
          <button
            onClick={() => setActiveTab('transfers')}
            className={`tw-px-6 tw-py-3 tw-rounded-xl tw-text-sm tw-font-semibold tw-transition-all tw-duration-300 tw-flex tw-items-center tw-gap-3 ${
              activeTab === 'transfers'
                ? 'tw-bg-gradient-to-r tw-from-purple-600 tw-to-orange-500 tw-text-white tw-shadow-lg'
                : 'tw-text-gray-400 hover:tw-text-white hover:tw-bg-gray-700/50'
            }`}
          >
            Transferencias Bancarias
            <span className={`tw-px-2.5 tw-py-0.5 tw-rounded-full tw-text-xs ${activeTab === 'transfers' ? 'tw-bg-black/20' : 'tw-bg-gray-700 tw-text-gray-300'}`}>
              {transfers.length}
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
          <div className="tw-bg-gray-900/60 tw-backdrop-blur-md tw-rounded-2xl tw-shadow-2xl tw-border tw-border-gray-700/50 tw-overflow-hidden">
            
            {/* TRANSFERS TAB */}
            {activeTab === 'transfers' && (
              <div className="tw-overflow-x-auto">
                <table className="tw-w-full tw-text-left tw-text-sm tw-whitespace-nowrap">
                  <thead className="tw-uppercase tw-tracking-wider tw-border-b tw-border-gray-700 tw-bg-gray-800/80 tw-text-gray-400 tw-text-xs tw-font-bold">
                    <tr>
                      <th className="tw-px-6 tw-py-5">ID</th>
                      <th className="tw-px-6 tw-py-5">Fecha</th>
                      <th className="tw-px-6 tw-py-5">Plan</th>
                      <th className="tw-px-6 tw-py-5">Monto</th>
                      <th className="tw-px-6 tw-py-5">Estado</th>
                      <th className="tw-px-6 tw-py-5">Comprobante</th>
                    </tr>
                  </thead>
                  <tbody className="tw-divide-y tw-divide-gray-700/50">
                    {transfers.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="tw-px-6 tw-py-16 tw-text-center tw-text-gray-500">
                          <div className="tw-flex tw-flex-col tw-items-center">
                            <svg className="tw-w-12 tw-h-12 tw-mb-3 tw-text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                            <p>No hay transferencias registradas.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      transfers.map((t) => (
                        <tr key={t.id} className="hover:tw-bg-gray-800/50 tw-transition-colors">
                          <td className="tw-px-6 tw-py-5 tw-font-mono tw-text-gray-500">#{t.id}</td>
                          <td className="tw-px-6 tw-py-5 tw-text-gray-300">{formatDate(t.created_at)}</td>
                          <td className="tw-px-6 tw-py-5 tw-font-medium tw-text-white">{t.plan_name}</td>
                          <td className="tw-px-6 tw-py-5 tw-text-green-400 tw-font-bold">${t.amount}</td>
                          <td className="tw-px-6 tw-py-5">
                            <span className="tw-inline-flex tw-items-center tw-px-3 tw-py-1 tw-rounded-full tw-text-xs tw-font-semibold tw-bg-yellow-500/10 tw-text-yellow-500 tw-border tw-border-yellow-500/20">
                              <span className="tw-w-1.5 tw-h-1.5 tw-rounded-full tw-bg-yellow-500 tw-mr-2"></span>
                              {t.payment_status}
                            </span>
                          </td>
                          <td className="tw-px-6 tw-py-5">
                            {t.voucher_url ? (
                              <a
                                href={t.voucher_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="tw-inline-flex tw-items-center tw-px-4 tw-py-2 tw-bg-purple-600/10 tw-text-purple-400 hover:tw-bg-purple-600 hover:tw-text-white tw-rounded-lg tw-border tw-border-purple-500/30 tw-transition-all tw-duration-300 tw-text-xs tw-font-bold"
                              >
                                <svg className="tw-w-4 tw-h-4 tw-mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                Ver Archivo
                              </a>
                            ) : (
                              <span className="tw-text-gray-500 tw-text-xs tw-italic">Sin archivo</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* LEADS TAB */}
            {activeTab === 'leads' && (
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
                        const payload = parseLeadData(l.data);
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
            )}

            {/* SETTINGS TAB */}
            {activeTab === 'settings' && (
              <div className="tw-p-8 tw-max-w-xl tw-mx-auto">
                <h3 className="tw-text-xl tw-font-bold tw-text-white tw-mb-2">Configuración de Seguridad</h3>
                <p className="tw-text-xs tw-text-gray-400 tw-mb-8">Actualiza la contraseña del panel administrativo de forma segura y permanente.</p>
                
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
                      placeholder="Ingresa la nueva contraseña..."
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
            )}
            
          </div>
        )}
      </main>
      
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
