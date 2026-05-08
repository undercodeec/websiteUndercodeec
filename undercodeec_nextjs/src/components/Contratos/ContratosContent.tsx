"use client";

import React, { useState, useCallback, useRef } from "react";
import Link from "next/link";
import ContratoPDF, { ContratoData, INITIAL_DATA } from "./ContratoPDF";
import "@/styles/contratos.css";

/* ── Icons ─────────────────────────────────────── */
const ScaleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v18"/><path d="M5 6l7-3 7 3"/><path d="M2 12l3-6 3 6a5.12 5.12 0 0 1-6 0z"/><path d="M16 12l3-6 3 6a5.12 5.12 0 0 1-6 0z"/>
  </svg>
);
const FileIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);
const GridIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
);
const DownloadIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);
const ArrowLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
);
const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);
const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

/* ── Stepper ───────────────────────────────────── */
const STEPS = ["Tipo de Contrato", "Datos del Proyecto", "Previsualización"];

function Stepper({ step }: { step: number }) {
  return (
    <div className="contratos-stepper">
      {STEPS.map((label, i) => (
        <React.Fragment key={i}>
          {i > 0 && <div className={`contratos-step__line${i <= step ? " contratos-step__line--done" : ""}`} />}
          <div className={`contratos-step${i === step ? " contratos-step--active" : i < step ? " contratos-step--done" : ""}`}>
            <div className="contratos-step__circle">{i < step ? "✓" : i + 1}</div>
            <span className="contratos-step__label">{label}</span>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

/* ── Step 1: Contract Selector ─────────────────── */
function StepSelector({ data, onChange }: { data: ContratoData; onChange: (t: ContratoData["tipo"]) => void }) {
  return (
    <div style={{ animation: "contratos-fadeInUp .5s ease-out" }}>
      <h2 style={{ fontFamily: "var(--legal-serif)", fontSize: "22px", fontWeight: 600, color: "var(--legal-heading)", margin: "0 0 8px" }}>
        Seleccione el tipo de contrato
      </h2>
      <p style={{ fontFamily: "var(--legal-sans)", fontSize: "14px", color: "var(--legal-text-muted)", marginBottom: "28px" }}>
        Elija la modalidad contractual que mejor se adapte a su proyecto.
      </p>
      <div className="contratos-selector">
        {/* Simplificado */}
        <div className={`contratos-card${data.tipo === "simplificado" ? " contratos-card--selected" : ""}`} onClick={() => onChange("simplificado")}>
          <div className="contratos-card__icon"><FileIcon /></div>
          <span className="contratos-card__tag">Proyectos Pequeños</span>
          <h3 className="contratos-card__title">Contrato Simplificado</h3>
          <p className="contratos-card__desc">Precio fijo con entregables claros. Ideal para proyectos de alcance definido.</p>
          <ul className="contratos-card__features">
            <li>Páginas web y landing pages</li>
            <li>Tiendas online (e-commerce)</li>
            <li>Comerciales de corta duración</li>
            <li>Precio fijo con hitos de pago</li>
          </ul>
        </div>
        {/* Modular */}
        <div className={`contratos-card${data.tipo === "modular" ? " contratos-card--selected" : ""}`} onClick={() => onChange("modular")}>
          <div className="contratos-card__icon"><GridIcon /></div>
          <span className="contratos-card__tag">Proyectos Grandes</span>
          <h3 className="contratos-card__title">Estructura Modular</h3>
          <p className="contratos-card__desc">NDA + MSA + SOW + SLA. Para proyectos complejos con múltiples fases.</p>
          <ul className="contratos-card__features">
            <li>Software empresarial a medida</li>
            <li>Aplicaciones móviles complejas</li>
            <li>Modelo Time &amp; Materials</li>
            <li>SLA con tiempos de respuesta</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ── Step 2: Form ──────────────────────────────── */
function StepForm({ data, setData, errors }: {
  data: ContratoData;
  setData: React.Dispatch<React.SetStateAction<ContratoData>>;
  errors: Record<string, string>;
}) {
  const set = useCallback(
    (key: keyof ContratoData, val: string) => setData((prev) => ({ ...prev, [key]: val })),
    [setData]
  );

  const inp = (key: keyof ContratoData, label: string, placeholder: string, type = "text") => (
    <div className="contratos-form__field">
      <label className="contratos-form__label">{label}</label>
      <input
        type={type}
        className={`contratos-form__input${errors[key] ? " contratos-form__input--error" : ""}`}
        placeholder={placeholder}
        value={data[key]}
        onChange={(e) => set(key, e.target.value)}
      />
      {errors[key] && <span className="contratos-form__error">{errors[key]}</span>}
    </div>
  );

  const ta = (key: keyof ContratoData, label: string, placeholder: string) => (
    <div className="contratos-form__field">
      <label className="contratos-form__label">{label}</label>
      <textarea
        className={`contratos-form__textarea${errors[key] ? " contratos-form__input--error" : ""}`}
        placeholder={placeholder}
        value={data[key]}
        onChange={(e) => set(key, e.target.value)}
      />
      {errors[key] && <span className="contratos-form__error">{errors[key]}</span>}
    </div>
  );

  return (
    <div className="contratos-form">
      {/* Client */}
      <div className="contratos-form__group">
        <h3 className="contratos-form__group-title">Datos del Cliente</h3>
        <div className="contratos-form__row">
          {inp("clienteNombre", "Nombre / Razón Social", "Ej: Empresa ABC S.A.")}
          {inp("clienteRuc", "NIF / RUC", "Ej: 1712345678001")}
        </div>
        <div className="contratos-form__row">
          {inp("clienteRepresentante", "Representante Legal", "Nombre completo")}
          {inp("clienteEmail", "Correo Electrónico", "correo@empresa.com", "email")}
        </div>
      </div>

      {/* Project */}
      <div className="contratos-form__group">
        <h3 className="contratos-form__group-title">Datos del Proyecto</h3>
        <div className="contratos-form__row contratos-form__row--single">
          {ta("proyectoDescripcion", "Descripción del Proyecto", "Describa brevemente el proyecto a desarrollar...")}
        </div>
        <div className="contratos-form__row contratos-form__row--single">
          {ta("proyectoFuncionalidades", "Funcionalidades Incluidas", "Liste las funcionalidades que se incluirán...")}
        </div>
        <div className="contratos-form__row contratos-form__row--single">
          {ta("proyectoExclusiones", "Exclusiones", "Funcionalidades excluidas del alcance (Ej: Hosting, SEO, etc.)")}
        </div>
      </div>

      {/* Billing — only for simplificado */}
      {data.tipo === "simplificado" && (
        <div className="contratos-form__group">
          <h3 className="contratos-form__group-title">Facturación y Pagos</h3>
          <div className="contratos-form__row">
            {inp("montoTotal", "Monto Total (USD)", "Ej: $2,500.00")}
            {inp("diasUAT", "Días para Aceptación (UAT)", "Ej: 15", "number")}
          </div>
          <label className="contratos-form__label" style={{ marginBottom: 8, marginTop: 4 }}>Porcentajes por Hito</label>
          <div className="contratos-form__hitos">
            <span className="contratos-form__hito-label">Firma del contrato e inicio</span>
            <input className="contratos-form__input contratos-form__hito-input" placeholder="%" value={data.hitoPorcentaje1} onChange={(e) => set("hitoPorcentaje1", e.target.value)} />
            <span className="contratos-form__hito-label">Entrega de versión Beta</span>
            <input className="contratos-form__input contratos-form__hito-input" placeholder="%" value={data.hitoPorcentaje2} onChange={(e) => set("hitoPorcentaje2", e.target.value)} />
            <span className="contratos-form__hito-label">Aceptación Técnica y Lanzamiento</span>
            <input className="contratos-form__input contratos-form__hito-input" placeholder="%" value={data.hitoPorcentaje3} onChange={(e) => set("hitoPorcentaje3", e.target.value)} />
          </div>
        </div>
      )}

      {/* IP Modality — only for simplificado */}
      {data.tipo === "simplificado" && (
        <div className="contratos-form__group">
          <h3 className="contratos-form__group-title">Propiedad Intelectual</h3>
          <div className="contratos-form__radios">
            <div
              className={`contratos-form__radio${data.modalidadIP === "estandar" ? " contratos-form__radio--selected" : ""}`}
              onClick={() => set("modalidadIP", "estandar")}
            >
              <div className="contratos-form__radio-title">Licencia de Uso</div>
              <div className="contratos-form__radio-desc">El Prestador retiene la propiedad del código. Se otorga licencia no exclusiva.</div>
            </div>
            <div
              className={`contratos-form__radio${data.modalidadIP === "propiedad" ? " contratos-form__radio--selected" : ""}`}
              onClick={() => set("modalidadIP", "propiedad")}
            >
              <div className="contratos-form__radio-title">Transferencia Total</div>
              <div className="contratos-form__radio-desc">Se transfiere la propiedad completa del código fuente al Cliente.</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Step 3: Preview ───────────────────────────── */
function StepPreview({ data, pdfRef, onDownload, downloading }: {
  data: ContratoData;
  pdfRef: React.RefObject<HTMLDivElement | null>;
  onDownload: () => void;
  downloading: boolean;
}) {
  return (
    <div className="contratos-preview">
      <div className="contratos-preview__toolbar">
        <button className="contratos-btn contratos-btn--download" onClick={onDownload} disabled={downloading}>
          <DownloadIcon />
          {downloading ? "Generando PDF..." : "Descargar PDF"}
        </button>
      </div>
      <div ref={pdfRef}>
        <ContratoPDF data={data} />
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════ */
export default function ContratosContent() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<ContratoData>(INITIAL_DATA);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [downloading, setDownloading] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!data.clienteNombre.trim()) e.clienteNombre = "Campo requerido";
    if (!data.clienteRuc.trim()) e.clienteRuc = "Campo requerido";
    if (!data.clienteRepresentante.trim()) e.clienteRepresentante = "Campo requerido";
    if (!data.clienteEmail.trim()) e.clienteEmail = "Campo requerido";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.clienteEmail)) e.clienteEmail = "Email inválido";
    if (!data.proyectoDescripcion.trim()) e.proyectoDescripcion = "Campo requerido";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (step === 1 && !validate()) return;
    setStep((s) => Math.min(s + 1, 2));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const prev = () => {
    setStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDownload = async () => {
    if (!pdfRef.current) return;
    setDownloading(true);
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const filename = data.tipo === "simplificado"
        ? `Contrato_Simplificado_${data.clienteNombre.replace(/\s+/g, "_") || "Cliente"}.pdf`
        : `Contrato_Modular_${data.clienteNombre.replace(/\s+/g, "_") || "Cliente"}.pdf`;

      const opts: Record<string, unknown> = {
          margin: [10, 10, 10, 10],
          filename,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, letterRendering: true },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          pagebreak: { mode: ["avoid-all", "css", "legacy"] },
        };

      await html2pdf()
        .set(opts)
        .from(pdfRef.current)
        .save();
    } catch (err) {
      console.error("Error generating PDF:", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="contratos-page">
      <header className="contratos-hero">
        <div className="contratos-hero__icon"><ScaleIcon /></div>
        <div className="contratos-hero__badge">Marco Legal &amp; Jurídico</div>
        <h1 className="contratos-hero__title">Contratos de Desarrollo<br />de Software</h1>
        <p className="contratos-hero__subtitle">
          Seleccione el tipo de contrato, complete sus datos y descargue el documento en formato PDF.
        </p>
      </header>

      <div className="contratos-content">
        <Stepper step={step} />

        {step === 0 && (
          <StepSelector data={data} onChange={(t) => setData((p) => ({ ...p, tipo: t }))} />
        )}
        {step === 1 && (
          <StepForm data={data} setData={setData} errors={errors} />
        )}
        {step === 2 && (
          <StepPreview data={data} pdfRef={pdfRef} onDownload={handleDownload} downloading={downloading} />
        )}

        {/* Navigation */}
        <div className="contratos-actions">
          {step > 0 ? (
            <button className="contratos-btn contratos-btn--secondary" onClick={prev}>
              <ArrowLeftIcon /> {step === 2 ? "Editar datos" : "Anterior"}
            </button>
          ) : <div />}
          {step < 2 && (
            <button className="contratos-btn contratos-btn--primary" onClick={next}>
              Siguiente <ArrowRightIcon />
            </button>
          )}
          {step === 2 && (
            <button className="contratos-btn contratos-btn--secondary" onClick={() => { setStep(0); setData(INITIAL_DATA); setErrors({}); }}>
              <EditIcon /> Nuevo contrato
            </button>
          )}
        </div>
      </div>

      <footer className="contratos-footer">
        <p className="contratos-footer__text">
          © {new Date().getFullYear()} <span className="contratos-footer__brand">Undercodeec</span> — Todos los derechos reservados.
        </p>
        <Link href="/" className="contratos-footer__back">
          <ArrowLeftIcon /> Volver al inicio
        </Link>
      </footer>
    </div>
  );
}
