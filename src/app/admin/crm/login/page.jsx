"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Bot, KeyRound, Mail } from "lucide-react";
import { useCrmSession } from "../_components/CrmSession";
import { apiErrorMessage } from "../_components/format";
import { hermesApi } from "@/lib/hermes/api";

const CRM_OPERATOR_EMAIL = "gerencia@undercodeec.com";

export default function CrmLoginPage() {
  const { loginWithCode } = useCrmSession();
  const searchParams = useSearchParams();
  const [step, setStep] = useState("request");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const expired = searchParams.get("reason") === "expired";

  const requestCode = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await hermesApi.requestAccessCode(CRM_OPERATOR_EMAIL);
      setStep("verify");
    } catch (requestError) {
      setError(apiErrorMessage(requestError, "No se pudo solicitar el codigo. Intentalo nuevamente."));
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await loginWithCode({ email: CRM_OPERATOR_EMAIL, code: code.trim() });
    } catch (requestError) {
      setError(apiErrorMessage(requestError, "Codigo invalido o expirado. Solicita uno nuevo."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="crm-login-page">
      <section className="crm-login-story">
        <div className="crm-login-brand"><span><Bot size={23} /></span>Hermes CRM</div>
        <div className="crm-login-story-copy">
          <span className="crm-eyebrow">Operacion comercial</span>
          <h1>Cada conversacion, visible. Cada oportunidad, a tiempo.</h1>
          <p>Observa como atiende Hermes, toma el control cuando un cliente lo necesita y mueve cada conversacion por el pipeline.</p>
        </div>
        <div className="crm-login-signal"><i aria-hidden="true" /><div><strong>Hermes permanece activo</strong><span>Las conversaciones automaticas continuan en WhatsApp.</span></div></div>
      </section>

      <section className="crm-login-panel">
        <div className="crm-login-form-wrap">
          <div className="crm-login-mobile-brand"><Bot size={21} />Hermes CRM</div>
          <span className="crm-eyebrow">Acceso privado</span>
          <h2>Acceso de gerencia</h2>
          <p>Solicita un codigo de un solo uso para entrar a Hermes CRM.</p>

          {expired && !error && <div className="crm-inline-alert">Tu sesion vencio. Inicia sesion nuevamente para continuar.</div>}
          {error && <div className="crm-inline-alert is-error" role="alert">{error}</div>}

          {step === "request" ? (
            <form onSubmit={requestCode} className="crm-login-form">
              <label>
                <span>Correo autorizado</span>
                <div className="crm-input-with-icon"><Mail size={18} aria-hidden="true" /><input type="email" value={CRM_OPERATOR_EMAIL} readOnly aria-readonly="true" /></div>
              </label>
              <button type="submit" className="crm-button is-primary is-large" disabled={loading}>
                {loading ? "Enviando codigo..." : "Enviar codigo de acceso"}{!loading && <ArrowRight size={18} />}
              </button>
            </form>
          ) : (
            <form onSubmit={verifyCode} className="crm-login-form">
              <label>
                <span>Codigo recibido por correo</span>
                <div className="crm-input-with-icon">
                  <KeyRound size={18} aria-hidden="true" />
                  <input inputMode="numeric" autoComplete="one-time-code" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 8))} placeholder="00000000" pattern="\d{8}" required autoFocus />
                </div>
              </label>
              <button type="submit" className="crm-button is-primary is-large" disabled={loading}>
                {loading ? "Validando acceso..." : "Entrar al CRM"}{!loading && <ArrowRight size={18} />}
              </button>
              <button type="button" className="crm-button" disabled={loading} onClick={() => { setStep("request"); setCode(""); setError(""); }}>
                Solicitar un nuevo codigo
              </button>
            </form>
          )}

          <small>Esta sesion usa exclusivamente un JWT emitido por Hermes CRM.</small>
        </div>
      </section>
    </main>
  );
}
