'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import '@/components/Slider/slider.css';

const LOGIN_MODE = 'login';
const VERIFY_MODE = 'verify';
const FORGOT_MODE = 'forgot';
const RESET_MODE = 'reset';

export default function AdminLogin() {
  const [mode, setMode] = useState(LOGIN_MODE);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const executeRecaptcha = async (action) => {
    if (typeof window !== 'undefined' && window.grecaptcha && window.grecaptcha.enterprise) {
      try {
        const token = await window.grecaptcha.enterprise.execute(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY, { action });
        return token;
      } catch (err) {
        console.error('Recaptcha error:', err);
      }
    }
    return null;
  };

  const resetMessages = () => {
    setError('');
    setInfo('');
  };

  const goToMode = (nextMode) => {
    setMode(nextMode);
    setCode('');
    if (nextMode !== VERIFY_MODE) {
      setPassword('');
    }
    resetMessages();
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    resetMessages();

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

      if (mode === VERIFY_MODE) {
        const res = await fetch(`${apiUrl}/api/admin/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, code }),
        });

        const data = await res.json();
        if (data.success) {
          localStorage.setItem('adminToken', data.token);
          router.push('/admin/dashboard');
        } else {
          setError(data.error || 'Codigo incorrecto o expirado');
        }
        return;
      }

      if (mode === FORGOT_MODE) {
        const res = await fetch(`${apiUrl}/api/admin/forgot`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });

        const data = await res.json();
        if (data.success) {
          setMode(RESET_MODE);
          setInfo(data.message || 'Revisa tu correo para continuar con el cambio de contrasena.');
        } else {
          setError(data.error || 'No se pudo enviar el codigo de recuperacion');
        }
        return;
      }

      if (mode === RESET_MODE) {
        const res = await fetch(`${apiUrl}/api/admin/reset`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, code, password }),
        });

        const data = await res.json();
        if (data.success) {
          setMode(LOGIN_MODE);
          setCode('');
          setPassword('');
          setInfo(data.message || 'Contrasena actualizada. Ya puedes iniciar sesion.');
        } else {
          setError(data.error || 'No se pudo restablecer la contrasena');
        }
        return;
      }

      const recaptchaToken = await executeRecaptcha('ADMIN_LOGIN');
      if (!recaptchaToken) {
        setError('Error de validacion de seguridad (reCAPTCHA)');
        return;
      }

      const res = await fetch(`${apiUrl}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, recaptchaToken }),
      });

      const data = await res.json();
      if (data.success) {
        if (data.requireVerification) {
          setMode(VERIFY_MODE);
          setInfo('Te enviamos un codigo temporal de 8 digitos a tu correo.');
        } else {
          localStorage.setItem('adminToken', data.token);
          router.push('/admin/dashboard');
        }
      } else {
        setError(data.error || 'Credenciales incorrectas');
      }
    } catch (err) {
      console.error(err);
      setError('Error de conexion con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const titleByMode = {
    [LOGIN_MODE]: 'Acceso exclusivo Undercodeec',
    [VERIFY_MODE]: 'Verificacion de Seguridad 2FA',
    [FORGOT_MODE]: 'Recupera el acceso por correo',
    [RESET_MODE]: 'Define una nueva contrasena',
  };

  const submitLabelByMode = {
    [LOGIN_MODE]: 'Enviar Codigo de Acceso',
    [VERIFY_MODE]: 'Verificar e Ingresar',
    [FORGOT_MODE]: 'Enviar codigo de recuperacion',
    [RESET_MODE]: 'Guardar nueva contrasena',
  };

  return (
    <div className="tw-min-h-screen tw-flex tw-items-center tw-justify-center tw-p-4 tw-relative tw-overflow-hidden tw-bg-[#0f172a]">
      <div className="tw-absolute tw-inset-0 tw-z-0">
        <div className="tw-absolute tw-top-[-10%] tw-left-[-10%] tw-w-[500px] tw-h-[500px] tw-bg-purple-600/30 tw-rounded-full tw-blur-[120px] tw-mix-blend-screen tw-animate-pulse"></div>
        <div className="tw-absolute tw-bottom-[-10%] tw-right-[-10%] tw-w-[600px] tw-h-[600px] tw-bg-orange-500/20 tw-rounded-full tw-blur-[150px] tw-mix-blend-screen" style={{ animation: 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}></div>
      </div>

      <div className="tw-relative tw-z-10 tw-w-full tw-max-w-md">
        <div className="tw-bg-gray-900/60 tw-backdrop-blur-xl tw-border tw-border-gray-700/50 tw-p-10 tw-rounded-3xl tw-shadow-2xl">
          <div className="tw-text-center tw-mb-8">
            <div className="tw-w-16 tw-h-16 tw-bg-gradient-to-br tw-from-purple-600 tw-to-orange-500 tw-rounded-2xl tw-flex tw-items-center tw-justify-center tw-text-white tw-text-2xl tw-font-bold tw-mx-auto tw-mb-6 tw-shadow-lg tw-shadow-purple-500/30">
              U
            </div>
            <h2 className="tw-text-3xl tw-font-extrabold tw-text-transparent tw-bg-clip-text tw-bg-gradient-to-r tw-from-white tw-to-gray-400">
              Panel Admin
            </h2>
            <p className="tw-mt-3 tw-text-sm tw-text-gray-400">{titleByMode[mode]}</p>
          </div>

          <form className="tw-space-y-6" onSubmit={handleLogin}>
            {mode !== VERIFY_MODE && (
              <div>
                <div className="tw-relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="tw-w-full tw-px-5 tw-py-4 tw-bg-gray-800/50 tw-border tw-border-gray-600 tw-rounded-xl tw-text-white tw-placeholder-gray-500 tw-focus:outline-none tw-focus:ring-2 tw-focus:ring-purple-500/50 tw-focus:border-purple-500 tw-transition-all tw-duration-300"
                    placeholder="Correo del administrador..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
            )}

            {(mode === LOGIN_MODE || mode === RESET_MODE) && (
              <div>
                <div className="tw-relative">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="tw-w-full tw-px-5 tw-py-4 tw-bg-gray-800/50 tw-border tw-border-gray-600 tw-rounded-xl tw-text-white tw-placeholder-gray-500 tw-focus:outline-none tw-focus:ring-2 tw-focus:ring-purple-500/50 tw-focus:border-purple-500 tw-transition-all tw-duration-300"
                    placeholder={mode === RESET_MODE ? 'Nueva contrasena segura...' : 'Contrasena...'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                {mode === RESET_MODE && (
                  <p className="tw-mt-2 tw-text-xs tw-text-gray-400">
                    Usa al menos 12 caracteres con mayusculas, minusculas y numeros.
                  </p>
                )}
              </div>
            )}

            {mode === VERIFY_MODE && (
              <div>
                <p className="tw-text-xs tw-text-purple-300 tw-mb-4 tw-text-center">
                  Hemos enviado un codigo temporal de 8 digitos a tu correo electronico. Por favor, ingresalo a continuacion:
                </p>
                <div className="tw-relative">
                  <input
                    id="code"
                    name="code"
                    type="text"
                    required
                    maxLength={8}
                    inputMode="numeric"
                    pattern="[0-9]{8}"
                    className="tw-w-full tw-text-center tw-font-mono tw-text-2xl tw-tracking-[0.25em] tw-px-5 tw-py-4 tw-bg-gray-800/50 tw-border tw-border-gray-600 tw-rounded-xl tw-text-white tw-placeholder-gray-500 tw-focus:outline-none tw-focus:ring-2 tw-focus:ring-purple-500/50 tw-focus:border-purple-500 tw-transition-all tw-duration-300"
                    placeholder="Codigo..."
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
                  />
                </div>
              </div>
            )}

            {mode === RESET_MODE && (
              <div>
                <p className="tw-text-xs tw-text-purple-300 tw-mb-4 tw-text-center">
                  Ingresa el codigo de 6 digitos enviado a tu correo y tu nueva contrasena.
                </p>
                <div className="tw-relative">
                  <input
                    id="code"
                    name="code"
                    type="text"
                    required
                    maxLength={6}
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    className="tw-w-full tw-text-center tw-font-mono tw-text-2xl tw-tracking-[0.25em] tw-px-5 tw-py-4 tw-bg-gray-800/50 tw-border tw-border-gray-600 tw-rounded-xl tw-text-white tw-placeholder-gray-500 tw-focus:outline-none tw-focus:ring-2 tw-focus:ring-purple-500/50 tw-focus:border-purple-500 tw-transition-all tw-duration-300"
                    placeholder="Codigo..."
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  />
                </div>
              </div>
            )}

            {info && (
              <div className="tw-text-sky-300 tw-text-sm tw-text-center tw-bg-sky-400/10 tw-py-3 tw-rounded-lg tw-border tw-border-sky-400/20">
                {info}
              </div>
            )}

            {error && (
              <div className="tw-animate-bounce tw-text-orange-400 tw-text-sm tw-text-center tw-bg-orange-400/10 tw-py-3 tw-rounded-lg tw-border tw-border-orange-400/20">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="tw-w-full tw-py-4 tw-px-6 tw-rounded-xl tw-text-white tw-font-bold tw-text-lg tw-bg-gradient-to-r tw-from-purple-600 tw-to-orange-500 hover:tw-from-purple-500 hover:tw-to-orange-400 tw-focus:outline-none tw-focus:ring-2 tw-focus:ring-offset-2 tw-focus:ring-offset-gray-900 tw-focus:ring-purple-500 disabled:tw-opacity-50 tw-shadow-lg tw-shadow-purple-500/25 tw-transition-all tw-duration-300 hover:tw-scale-[1.02] tw-active:scale-[0.98]"
            >
              {loading ? (
                <span className="tw-flex tw-items-center tw-justify-center gap-2">
                  <svg className="tw-animate-spin tw-h-5 tw-w-5 tw-text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="tw-opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="tw-opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Procesando...
                </span>
              ) : submitLabelByMode[mode]}
            </button>

            <div className="tw-flex tw-justify-between tw-gap-4 tw-text-sm">
              {mode === LOGIN_MODE && (
                <button
                  type="button"
                  onClick={() => goToMode(FORGOT_MODE)}
                  className="tw-text-orange-300 hover:tw-text-orange-200 tw-transition-colors"
                >
                  Olvide mi contrasena
                </button>
              )}

              {mode !== LOGIN_MODE && (
                <button
                  type="button"
                  onClick={() => goToMode(LOGIN_MODE)}
                  className="tw-text-gray-400 hover:tw-text-white tw-transition-colors"
                >
                  Volver al login
                </button>
              )}
            </div>
          </form>
        </div>

        <p className="tw-text-center tw-mt-8 tw-text-xs tw-text-gray-500">
          Protegido por Undercodeec Security
        </p>
      </div>
    </div>
  );
}
