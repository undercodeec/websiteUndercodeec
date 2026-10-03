"use client";

import { useState, useSyncExternalStore } from "react";
import Image from "next/image";
import {
  ArrowRight,
  KeyRound,
  LockKeyhole,
  Mail,
} from "lucide-react";
import CrmLoginBrain from "./CrmLoginBrain";
import { useCrmSession } from "../_components/CrmSession";
import { apiErrorMessage } from "../_components/format";
import { hermesApi } from "@/lib/hermes/api";

function subscribeToLocationChange(callback) {
  window.addEventListener("popstate", callback);
  return () => window.removeEventListener("popstate", callback);
}

function getExpiredSessionSnapshot() {
  return new URLSearchParams(window.location.search).get("reason") === "expired";
}

export default function CrmLoginPage() {
  const { loginWithCode } = useCrmSession();
  const expired = useSyncExternalStore(
    subscribeToLocationChange,
    getExpiredSessionSnapshot,
    () => false,
  );
  const [step, setStep] = useState("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const requestCode = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await hermesApi.requestAccessCode(email.trim());
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
      await loginWithCode({ email: email.trim(), code: code.trim() });
    } catch (requestError) {
      setError(apiErrorMessage(requestError, "Codigo invalido o expirado. Solicita uno nuevo."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="crm-login-page">
      <section className="crm-login-story">
        <div className="crm-login-brand">
          <Image
            className="crm-login-brand-logo"
            src="/assets/img/Logotipo Hermes CRM sobre transparencia.png"
            alt="Hermes CRM"
            width={2172}
            height={724}
            priority
          />
        </div>
        <div className="crm-login-story-copy">
          <span className="crm-login-eyebrow">OPERACIÓN COMERCIAL</span>
          <h1>Acceso seguro a tu <span>operación comercial.</span></h1>
          <p>Conversaciones, oportunidades y clientes en un solo lugar.</p>
        </div>
        <CrmLoginBrain />
      </section>

      <section className="crm-login-panel">
        <div className="crm-login-form-wrap">
          <div className="crm-login-mobile-brand">
            <Image
              className="crm-login-brand-logo"
              src="/assets/img/Logotipo Hermes CRM sobre transparencia.png"
              alt="Hermes CRM"
              width={2172}
              height={724}
              priority
            />
          </div>
          <span className="crm-login-eyebrow">ACCESO PRIVADO</span>
          <h2>Acceso de gerencia</h2>
          <div className="crm-login-heading-rule" aria-hidden="true" />

          {expired && !error && <div className="crm-inline-alert">Tu sesion vencio. Inicia sesion nuevamente para continuar.</div>}
          {error && <div className="crm-inline-alert is-error" role="alert">{error}</div>}

          {step === "request" ? (
            <form onSubmit={requestCode} className="crm-login-form">
              <label>
                <span>Correo de acceso</span>
                <div className="crm-input-with-icon"><Mail size={18} aria-hidden="true" /><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" placeholder="tu@empresa.com" required disabled={loading} /></div>
              </label>
              <button type="submit" className="crm-button is-primary is-large" disabled={loading}>
                {loading ? "Enviando código..." : "Enviar código de acceso"}{!loading && <ArrowRight size={18} />}
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

          <div className="crm-login-security-note">
            <div aria-hidden="true"><LockKeyhole size={14} /></div>
            <small>Solo los correos autorizados pueden recibir un código de acceso.</small>
          </div>

          <small>Por seguridad, solo los correos autorizados reciben un código de acceso.</small>
        </div>
      </section>
    </main>
  );
}
