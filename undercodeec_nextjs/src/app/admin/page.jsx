'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import '@/components/Slider/slider.css';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [requireVerification, setRequireVerification] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const executeRecaptcha = async (action) => {
    if (typeof window !== 'undefined' && window.grecaptcha && window.grecaptcha.enterprise) {
      try {
        const token = await window.grecaptcha.enterprise.execute(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY, {action});
        return token;
      } catch (err) {
        console.error("Recaptcha error:", err);
      }
    }
    return null;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
      
      if (requireVerification) {
        // Step 2: Code verification
        const res = await fetch(`${apiUrl}/api/admin/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, code })
        });

        const data = await res.json();

        if (data.success) {
          localStorage.setItem('adminToken', data.token);
          router.push('/admin/dashboard');
        } else {
          setError(data.error || 'Código incorrecto o expirado');
        }
      } else {
        // Fetch reCAPTCHA token first
        const recaptchaToken = await executeRecaptcha('ADMIN_LOGIN');
        if (!recaptchaToken) {
          setError('Error de validación de seguridad (reCAPTCHA)');
          setLoading(false);
          return;
        }

        // Step 1: Credentials submission
        const res = await fetch(`${apiUrl}/api/admin/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, recaptchaToken })
        });

        const data = await res.json();

        if (data.success) {
          if (data.requireVerification) {
            setRequireVerification(true);
          } else {
            localStorage.setItem('adminToken', data.token);
            router.push('/admin/dashboard');
          }
        } else {
          setError(data.error || 'Credenciales incorrectas');
        }
      }
    } catch (err) {
      console.error(err);
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tw-min-h-screen tw-flex tw-items-center tw-justify-center tw-p-4 tw-relative tw-overflow-hidden tw-bg-[#0f172a]">
      {/* Background Effects */}
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
            <p className="tw-mt-3 tw-text-sm tw-text-gray-400">
              {requireVerification ? 'Verificación de Seguridad 2FA' : 'Acceso exclusivo Undercodeec'}
            </p>
          </div>

          <form className="tw-space-y-6" onSubmit={handleLogin}>
            {!requireVerification ? (
              <>
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

                <div>
                  <div className="tw-relative">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      className="tw-w-full tw-px-5 tw-py-4 tw-bg-gray-800/50 tw-border tw-border-gray-600 tw-rounded-xl tw-text-white tw-placeholder-gray-500 tw-focus:outline-none tw-focus:ring-2 tw-focus:ring-purple-500/50 tw-focus:border-purple-500 tw-transition-all tw-duration-300"
                      placeholder="Contraseña..."
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div>
                <p className="tw-text-xs tw-text-purple-300 tw-mb-4 tw-text-center">
                  Hemos enviado un código temporal de 6 dígitos a tu correo electrónico. Por favor, ingrésalo a continuación:
                </p>
                <div className="tw-relative">
                  <input
                    id="code"
                    name="code"
                    type="text"
                    required
                    maxLength={6}
                    className="tw-w-full tw-text-center tw-font-mono tw-text-2xl tw-tracking-[0.25em] tw-px-5 tw-py-4 tw-bg-gray-800/50 tw-border tw-border-gray-600 tw-rounded-xl tw-text-white tw-placeholder-gray-500 tw-focus:outline-none tw-focus:ring-2 tw-focus:ring-purple-500/50 tw-focus:border-purple-500 tw-transition-all tw-duration-300"
                    placeholder="Código..."
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                </div>
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
              ) : requireVerification ? 'Verificar e Ingresar' : 'Enviar Código de Acceso'}
            </button>
          </form>
        </div>
        
        <p className="tw-text-center tw-mt-8 tw-text-xs tw-text-gray-500">
          Protegido por Undercodeec Security
        </p>
      </div>
    </div>
  );
}
