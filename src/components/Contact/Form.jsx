"use client";

import { useState } from "react";
import ReactGA from "react-ga4";
import RecaptchaEnterpriseScript from "@/components/RecaptchaEnterpriseScript";
import { pushAnalyticsEvent } from "@/lib/analytics/dataLayer.mjs";
import styles from "./ContactPrimaryContent.module.css";

const INITIAL_FORM = {
  name: "",
  email: "",
  phone: "",
  website: "",
  option: "",
  message: "",
  terms: false,
};

const contactDetails = [
  {
    index: "01",
    label: "Correo",
    value: "gerencia@undercodeec.com",
    href: "mailto:gerencia@undercodeec.com",
  },
  {
    index: "02",
    label: "Teléfono",
    value: "+593 99 973 9534",
    href: "tel:+593999739534",
  },
  {
    index: "03",
    label: "Ubicación",
    value: "Sangolquí · Ecuador",
  },
  {
    index: "04",
    label: "Horario",
    value: "Lun — Vie / 08:00 — 18:00",
  },
];

export default function ContactSection() {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  const executeRecaptcha = async (action) => {
    if (typeof window !== "undefined" && window.grecaptcha?.enterprise) {
      try {
        return await window.grecaptcha.enterprise.execute(
          process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
          { action },
        );
      } catch (error) {
        console.error("Recaptcha error:", error);
      }
    }
    return null;
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (status.message) setStatus({ type: "", message: "" });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.terms) {
      setStatus({ type: "error", message: "Acepta los términos y condiciones para continuar." });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: "", message: "" });

    ReactGA.event({
      category: "Formulario de Contacto",
      action: "Envío del formulario",
      label: "Botón Enviar",
      value: 1,
    });

    if (typeof window !== "undefined" && typeof window.fbq === "function") {
      window.fbq("track", "Contact", {
        content_name: "Formulario de Contacto",
        value: 1,
        currency: "USD",
      });
    }

    try {
      const token = await executeRecaptcha("CONTACT");
      if (!token) {
        setStatus({ type: "error", message: "No pudimos validar reCAPTCHA. Inténtalo nuevamente." });
        return;
      }

      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.undercodeec.com";
      const response = await fetch(`${backendUrl}/api/send-contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          terms: formData.terms ? "1" : "0",
          "g-recaptcha-response": token,
        }),
      });
      const text = await response.text();
      let result;

      try {
        result = JSON.parse(text);
      } catch {
        throw new Error("La respuesta del servidor no es válida.");
      }

      if (!response.ok || result.status !== "success") {
        throw new Error(result.message || "No fue posible enviar el mensaje.");
      }

      pushAnalyticsEvent("generate_lead", {
        form_id: "contact_primary",
        lead_type: "contact_form",
        service_interest: formData.option,
        page_path: window.location.pathname || "/contacto",
      });
      window.fbq?.("track", "CompleteRegistration");
      setFormData(INITIAL_FORM);
      setStatus({
        type: "success",
        message: "Recibimos tu mensaje. Nuestro equipo se pondrá en contacto contigo pronto.",
      });
    } catch (error) {
      console.error("Error al enviar el formulario:", error);
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Ocurrió un error. Inténtalo nuevamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={styles.section} aria-labelledby="contact-form-title">
      <RecaptchaEnterpriseScript />

      <header className={styles.sectionHeader}>
        <p className={styles.sectionMeta}>Contacto / 01</p>
        <h2 id="contact-form-title">Una conversación puede iniciar algo grande.</h2>
        <p className={styles.sectionIntro}>
          Comparte el reto, la idea o el objetivo. Te responderemos con una ruta clara y los siguientes pasos.
        </p>
      </header>

      <div className={styles.contentGrid}>
        <aside className={styles.contactPanel} aria-label="Información de contacto">
          <p className={styles.panelLabel}>Dónde encontrarnos</p>
          <div className={styles.contactList}>
            {contactDetails.map((detail) => (
              <div className={styles.contactItem} key={detail.label}>
                <span>{detail.index}</span>
                <div>
                  <p>{detail.label}</p>
                  {detail.href ? <a href={detail.href}>{detail.value}</a> : <strong>{detail.value}</strong>}
                </div>
              </div>
            ))}
          </div>
          <p className={styles.coverage}>Atención remota · Cobertura nacional e internacional</p>
        </aside>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formHeader}>
            <p>Cuéntanos sobre tu proyecto</p>
            <span>* Campos obligatorios</span>
          </div>

          <div className={styles.fieldGrid}>
            <label className={styles.field}>
              <span>Nombre *</span>
              <input type="text" name="name" autoComplete="name" value={formData.name} onChange={handleChange} required />
            </label>
            <label className={styles.field}>
              <span>Correo electrónico *</span>
              <input type="email" name="email" autoComplete="email" value={formData.email} onChange={handleChange} required />
            </label>
            <label className={styles.field}>
              <span>Teléfono</span>
              <input type="tel" name="phone" autoComplete="tel" value={formData.phone} onChange={handleChange} />
            </label>
            <label className={styles.field}>
              <span>Sitio web</span>
              <input type="url" name="website" inputMode="url" placeholder="https://" value={formData.website} onChange={handleChange} />
            </label>
            <label className={`${styles.field} ${styles.fieldWide}`}>
              <span>¿Cómo podemos ayudarte? *</span>
              <select name="option" value={formData.option} onChange={handleChange} required>
                <option value="" disabled>Selecciona un servicio</option>
                <option value="web">Sitio web</option>
                <option value="software">Software para mi negocio</option>
                <option value="app">Aplicación móvil</option>
                <option value="marketing">Marketing digital</option>
                <option value="otro">Otro proyecto</option>
              </select>
            </label>
            <label className={`${styles.field} ${styles.fieldWide}`}>
              <span>Mensaje *</span>
              <textarea name="message" rows={5} value={formData.message} onChange={handleChange} required />
            </label>
          </div>

          <label className={styles.terms}>
            <input type="checkbox" name="terms" checked={formData.terms} onChange={handleChange} required />
            <span>Al enviar, acepto los <a href="/politicas-playconsole">términos y condiciones</a>.</span>
          </label>

          {status.message ? (
            <p className={`${styles.status} ${status.type === "success" ? styles.statusSuccess : styles.statusError}`} role="status">
              {status.message}
            </p>
          ) : null}

          <button className={styles.submit} type="submit" disabled={isSubmitting}>
            <span>{isSubmitting ? "Enviando" : "Enviar mensaje"}</span>
            <span aria-hidden="true">→</span>
          </button>
        </form>
      </div>
    </section>
  );
}
