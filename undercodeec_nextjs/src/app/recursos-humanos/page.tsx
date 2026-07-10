"use client";

import { type ChangeEvent, type FormEvent, useState } from "react";
import {
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  Code2,
  GraduationCap,
  HeartHandshake,
  Mail,
  MapPin,
  Send,
  Sparkles,
  UserRound,
} from "lucide-react";
import StackDemoHero from "@/components/LandingEspana/StackDemoHero";
import HrCanvasSequence from "@/components/LandingEspana/HrCanvasSequence";
import styles from "./recursos-humanos.module.css";

declare global {
  interface Window {
    grecaptcha?: {
      enterprise?: {
        execute: (siteKey: string | undefined, options: { action: string }) => Promise<string>;
      };
    };
    fbq?: (...args: unknown[]) => void;
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.undercodeec.com";

const developmentPlan = [
  {
    title: "Ingreso guiado",
    text: "Primeras tareas con contexto, acompanamiento y objetivos claros por rol.",
    icon: GraduationCap,
  },
  {
    title: "Proyecto real",
    text: "Participacion gradual en productos, automatizaciones, sitios y software para clientes.",
    icon: Code2,
  },
  {
    title: "Crecimiento medible",
    text: "Revision de avances, habilidades tecnicas, comunicacion y autonomia operativa.",
    icon: Sparkles,
  },
  {
    title: "Especializacion",
    text: "Ruta hacia frontend, backend, IA, marketing, ventas, diseno o soporte segun desempeno.",
    icon: BriefcaseBusiness,
  },
];

const initialForm = {
  fullName: "",
  email: "",
  phone: "",
  city: "",
  position: "",
  experience: "",
  portfolio: "",
  availability: "",
  workMode: "",
  skills: "",
  motivation: "",
  terms: false,
};

type FormState = typeof initialForm;

async function executeRecaptcha(action: string) {
  if (typeof window === "undefined") return null;
  try {
    return await window.grecaptcha?.enterprise?.execute(
      process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
      { action },
    );
  } catch (error) {
    console.error("Recaptcha error:", error);
    return null;
  }
}

export default function RecursosHumanosPage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const updateField = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = event.target;
    const checked = type === "checkbox" ? (event.target as HTMLInputElement).checked : undefined;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("sending");
    setMessage("");

    const recaptchaToken = await executeRecaptcha("HR_APPLICATION");
    if (!recaptchaToken) {
      setStatus("error");
      setMessage("No se pudo validar reCAPTCHA. Recarga la pagina e intenta de nuevo.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/send-hr-application`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, recaptchaToken }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "No se pudo enviar la postulacion.");
      }

      if (typeof window !== "undefined" && typeof window.fbq === "function") {
        window.fbq("trackCustom", "HRApplication");
      }

      setForm(initialForm);
      setStatus("success");
      setMessage(data.message || "Postulacion enviada correctamente.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Ocurrio un error al enviar.");
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.stackHero} aria-label="Hero stack demo">
        <StackDemoHero />
      </section>

      <HrCanvasSequence />

      <div id="rhRevealPanel" className={styles.revealPanel}>
      <section id="plan" className={styles.planSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.eyebrow}>Plan de desarrollo</span>
          <h2>Una incorporacion con objetivos claros</h2>
          <p>
            La seleccion no termina en enviar un CV. Queremos entender tu
            potencial y ubicarte en una ruta donde puedas aportar y crecer.
          </p>
        </div>
        <div className={styles.timeline}>
          {developmentPlan.map((item, index) => {
            const Icon = item.icon;
            return (
              <article className={styles.timelineItem} key={item.title}>
                <div className={styles.stepNumber}>{String(index + 1).padStart(2, "0")}</div>
                <div className={styles.stepIcon}>
                  <Icon size={22} aria-hidden="true" />
                </div>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section id="postulacion" className={styles.formSection}>
        <div className={styles.formIntro}>
          <span className={styles.eyebrow}>Postulacion</span>
          <h2>Cuentanos donde puedes aportar</h2>
          <p>
            Los registros llegan por correo al mismo destino usado para
            notificar pagos realizados. No se guarda informacion en base de
            datos desde este formulario.
          </p>
          <div className={styles.infoList}>
            <span><Mail size={18} aria-hidden="true" /> Respuesta por email o WhatsApp</span>
            <span><Clock3 size={18} aria-hidden="true" /> Revision inicial en 24 a 72 horas</span>
            <span><HeartHandshake size={18} aria-hidden="true" /> Modalidades remota, parcial o por proyecto</span>
          </div>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGrid}>
            <label>
              Nombre completo *
              <span><UserRound size={16} aria-hidden="true" /></span>
              <input name="fullName" value={form.fullName} onChange={updateField} required />
            </label>
            <label>
              Email *
              <span><Mail size={16} aria-hidden="true" /></span>
              <input type="email" name="email" value={form.email} onChange={updateField} required />
            </label>
            <label>
              Telefono / WhatsApp *
              <span><BriefcaseBusiness size={16} aria-hidden="true" /></span>
              <input name="phone" value={form.phone} onChange={updateField} required />
            </label>
            <label>
              Ciudad / pais
              <span><MapPin size={16} aria-hidden="true" /></span>
              <input name="city" value={form.city} onChange={updateField} />
            </label>
            <label>
              Area de interes *
              <select name="position" value={form.position} onChange={updateField} required>
                <option value="">Selecciona un area</option>
                <option value="Desarrollo frontend">Desarrollo frontend</option>
                <option value="Desarrollo backend">Desarrollo backend</option>
                <option value="Diseno UX/UI">Diseno UX/UI</option>
                <option value="Marketing digital">Marketing digital</option>
                <option value="Ventas consultivas">Ventas consultivas</option>
                <option value="Soporte tecnico">Soporte tecnico</option>
                <option value="Practicas / trainee">Practicas / trainee</option>
              </select>
            </label>
            <label>
              Experiencia *
              <select name="experience" value={form.experience} onChange={updateField} required>
                <option value="">Selecciona tu nivel</option>
                <option value="Sin experiencia formal">Sin experiencia formal</option>
                <option value="0 a 1 ano">0 a 1 ano</option>
                <option value="1 a 3 anos">1 a 3 anos</option>
                <option value="3 a 5 anos">3 a 5 anos</option>
                <option value="Mas de 5 anos">Mas de 5 anos</option>
              </select>
            </label>
            <label>
              Portafolio, LinkedIn o CV
              <input name="portfolio" value={form.portfolio} onChange={updateField} placeholder="https://..." />
            </label>
            <label>
              Disponibilidad
              <select name="availability" value={form.availability} onChange={updateField}>
                <option value="">Selecciona una opcion</option>
                <option value="Inmediata">Inmediata</option>
                <option value="En 15 dias">En 15 dias</option>
                <option value="En 30 dias">En 30 dias</option>
                <option value="Por proyecto">Por proyecto</option>
              </select>
            </label>
            <label>
              Modalidad preferida
              <select name="workMode" value={form.workMode} onChange={updateField}>
                <option value="">Selecciona una modalidad</option>
                <option value="Remoto">Remoto</option>
                <option value="Hibrido">Hibrido</option>
                <option value="Freelance / proyecto">Freelance / proyecto</option>
                <option value="Practicas">Practicas</option>
              </select>
            </label>
            <label className={styles.fullWidth}>
              Habilidades principales
              <textarea
                name="skills"
                rows={3}
                value={form.skills}
                onChange={updateField}
                placeholder="Ej: React, Node.js, WordPress, Figma, ventas B2B..."
              />
            </label>
            <label className={styles.fullWidth}>
              Por que quieres trabajar con Undercodeec? *
              <textarea
                name="motivation"
                rows={5}
                value={form.motivation}
                onChange={updateField}
                required
              />
            </label>
          </div>

          <label className={styles.terms}>
            <input
              type="checkbox"
              name="terms"
              checked={form.terms}
              onChange={updateField}
              required
            />
            Acepto que Undercodeec revise mi informacion para procesos de seleccion.
          </label>

          {message && (
            <p className={status === "success" ? styles.successMessage : styles.errorMessage}>
              {status === "success" && <CheckCircle2 size={18} aria-hidden="true" />}
              {message}
            </p>
          )}

          <button className={styles.submitButton} type="submit" disabled={status === "sending"}>
            {status === "sending" ? "Enviando..." : "Enviar postulacion"}
            <Send size={18} aria-hidden="true" />
          </button>
        </form>
      </section>
      </div>
    </main>
  );
}
