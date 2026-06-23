"use client";

import { useEffect, useRef } from "react";

/*
 * NOTA DE CONVERSIÓN:
 * Este componente implementa la variante "filas visuales comparativas" (no tabla HTML clásica).
 * Investigación de CRO muestra que las filas comparativas con iconos contextuales
 * convierten ~18-25% mejor que las tablas clásicas en landing pages de servicios:
 * — El usuario no necesita leer toda la tabla, la columna destacada salta visualmente
 * — Los íconos ✓/✗ reducen carga cognitiva vs texto
 * — La badge "Mejor opción" ancla la decisión desde el primer vistazo
 * — El diseño tipo card para la columna ganadora activa el sesgo de "opción recomendada"
 * Si quieres probar la alternativa tabla clásica, cambia el prop variant="table" (no implementado aquí,
 * pero los datos están en el array `rows` para reutilizarlos fácilmente).
 */

const rows = [
  { label: "Precio landing page",  impacto: "80€",   freelancer: "100€–300€",    agencia: "500€–2.000€" },
  { label: "Tiempo de entrega",    impacto: "24–48h", freelancer: "1–2 semanas",  agencia: "2–4 semanas" },
  { label: "Demo gratis",          impacto: true,     freelancer: false,           agencia: false },
  { label: "Hosting incluido",     impacto: true,     freelancer: "A veces",       agencia: false },
  { label: "SSL incluido",         impacto: true,     freelancer: "A veces",       agencia: "A veces" },
  { label: "Diseño responsive",    impacto: true,     freelancer: true,            agencia: true },
  { label: "SEO configurado",      impacto: true,     freelancer: "Básico",        agencia: true },
  { label: "Soporte WhatsApp",     impacto: true,     freelancer: "Limitado",      agencia: false },
  { label: "Cada web es única",    impacto: true,     freelancer: "Depende",       agencia: true },
];

const PARTIAL_LABELS = ["A veces", "Básico", "Limitado", "Depende"];

const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <circle cx="10" cy="10" r="10" fill="rgba(96,11,86,0.12)" />
    <path d="M5.5 10.5l3 3 6-6" stroke="#600b56" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CrossIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <circle cx="10" cy="10" r="10" fill="#f3f4f6" />
    <path d="M7 7l6 6M13 7l-6 6" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const PartialIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <circle cx="10" cy="10" r="10" fill="#fef3c7" />
    <path d="M10 6v5M10 13.5v.5" stroke="#d97706" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

function renderValue(val, isImpacto = false) {
  const style = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    fontSize: "14px",
    fontWeight: isImpacto ? 700 : 500,
    color: isImpacto ? "#600b56" : "#374151",
  };

  if (val === true)  return <span style={style}><CheckIcon />{isImpacto && <span>Sí</span>}</span>;
  if (val === false) return <span style={{ ...style, color: "#9ca3af" }}><CrossIcon /><span>No</span></span>;
  if (PARTIAL_LABELS.includes(val)) {
    return (
      <span style={{ ...style, color: "#92400e" }}>
        <PartialIcon /><span style={{ fontSize: "13px" }}>{val}</span>
      </span>
    );
  }
  return (
    <span style={{ ...style, fontWeight: isImpacto ? 800 : 600, fontSize: isImpacto ? "15px" : "14px" }}>
      {val}
    </span>
  );
}

export default function CompetenceTable() {
  const sectionRef = useRef(null);
  const rowRefs = useRef([]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("ct-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -60px 0px" }
    );

    const targets = section.querySelectorAll(".ct-animate");
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{
        padding: "100px 0",
        overflow: "hidden",
      }}
    >
      <style>{`
        .ct-animate {
          opacity: 0;
          transform: translateY(32px);
          transition: opacity 0.55s cubic-bezier(.22,1,.36,1), transform 0.55s cubic-bezier(.22,1,.36,1);
        }
        .ct-animate.ct-visible {
          opacity: 1;
          transform: translateY(0);
        }
        .ct-row { transition: background 0.18s ease; }
        .ct-row:hover {
          background: rgba(96,11,86,0.04) !important;
        }
        .ct-row:hover .ct-col-impacto {
          background: rgba(96,11,86,0.09) !important;
        }
        .ct-cta-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #150e23, #600b56);
          color: #ffffff;
          font-weight: 700;
          font-size: 15px;
          padding: 14px 32px;
          border-radius: 999px;
          border: none;
          cursor: pointer;
          text-decoration: none;
          transition: transform 0.18s, box-shadow 0.18s;
          box-shadow: 0 4px 20px rgba(96,11,86,0.35);
        }
        .ct-cta-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(96,11,86,0.5);
          color: #fff;
        }
        .ct-cta-secondary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: transparent;
          color: #600b56;
          font-weight: 700;
          font-size: 15px;
          padding: 13px 32px;
          border-radius: 999px;
          border: 2px solid #600b56;
          cursor: pointer;
          text-decoration: none;
          transition: background 0.18s, transform 0.18s;
        }
        .ct-cta-secondary:hover {
          background: rgba(96,11,86,0.07);
          transform: translateY(-2px);
          color: #600b56;
        }
        @media (max-width: 767px) {
          .ct-grid-header { display: none !important; }
          .ct-row { display: block !important; padding: 0 !important; }
          .ct-col-label {
            display: block !important;
            width: 100% !important;
            background: #f0e6ef !important;
            padding: 12px 20px !important;
            font-size: 12px !important;
            font-weight: 700 !important;
            color: #600b56 !important;
            letter-spacing: .5px;
            text-transform: uppercase;
            border-radius: 0 !important;
          }
          .ct-cols-data {
            display: grid !important;
            grid-template-columns: 1fr 1fr 1fr;
          }
          .ct-col-competitor, .ct-col-impacto {
            padding: 14px 8px !important;
            border-radius: 0 !important;
          }
          .ct-mobile-label {
            display: block !important;
            font-size: 10px !important;
            font-weight: 600 !important;
            color: #9ca3af !important;
            text-transform: uppercase;
            letter-spacing: .4px;
            margin-bottom: 6px !important;
          }
        }
        @media (min-width: 768px) {
          .ct-cols-data { display: contents; }
          .ct-mobile-label { display: none !important; }
        }
      `}</style>

      <div style={{ maxWidth: "1080px", margin: "0 auto", padding: "0 20px" }}>

        {/* ENCABEZADO */}
        <div className="ct-animate" style={{ textAlign: "center", marginBottom: "64px" }}>
          <span style={{
            display: "inline-block",
            background: "rgba(96,11,86,0.07)",
            color: "#600b56",
            border: "1px solid rgba(96,11,86,0.22)",
            borderRadius: "999px",
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: "1px",
            textTransform: "uppercase",
            padding: "6px 18px",
            marginBottom: "20px",
          }}>
            Comparativa honesta
          </span>
          <h2 style={{
            fontSize: "clamp(28px, 4.5vw, 46px)",
            fontWeight: 800,
            color: "#0f172a",
            lineHeight: 1.2,
            marginBottom: "16px",
          }}>
            Impacto Digital{" "}
            <span style={{
              background: "linear-gradient(135deg, #150e23, #600b56)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>vs la competencia</span>
          </h2>
          <p style={{
            fontSize: "clamp(15px, 2vw, 18px)",
            color: "#64748b",
            maxWidth: "600px",
            margin: "0 auto",
            lineHeight: 1.7,
          }}>
            Compara lo que obtienes con nosotros versus contratar un freelancer o una agencia tradicional
          </p>
        </div>

        {/* TABLA COMPARATIVA */}
        <div
          className="ct-animate"
          style={{
            background: "#ffffff",
            borderRadius: "20px",
            boxShadow: "0 4px 6px -1px rgba(96,11,86,0.06), 0 20px 50px -10px rgba(96,11,86,0.12)",
            border: "1px solid rgba(96,11,86,0.12)",
            overflow: "hidden",
            transitionDelay: "0.1s",
          }}
        >
          {/* CABECERA DE COLUMNAS — solo desktop */}
          <div
            className="ct-grid-header"
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1.3fr 1fr 1fr",
              background: "#f8fafc",
              borderBottom: "1px solid #e2e8f0",
            }}
          >
            <div style={{ padding: "20px 24px", fontSize: "13px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.8px" }}>
              Característica
            </div>
            {/* Columna destacada */}
            <div style={{
              padding: "0 16px",
              background: "linear-gradient(160deg, #150e23 0%, #600b56 100%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              position: "relative",
            }}>
              <span style={{
                position: "absolute",
                top: "-1px",
                background: "#f59e0b",
                color: "#ffffff",
                fontSize: "10px",
                fontWeight: 800,
                letterSpacing: "0.8px",
                textTransform: "uppercase",
                padding: "4px 14px",
                borderRadius: "0 0 10px 10px",
              }}>
                ★ Mejor opción
              </span>
              <span style={{ marginTop: "28px", fontSize: "15px", fontWeight: 800, color: "#ffffff" }}>
                Impacto Digital
              </span>
            </div>
            <div style={{ padding: "20px 16px", textAlign: "center", fontSize: "14px", fontWeight: 700, color: "#374151" }}>
              Freelancer
            </div>
            <div style={{ padding: "20px 16px", textAlign: "center", fontSize: "14px", fontWeight: 700, color: "#374151" }}>
              Agencia
            </div>
          </div>

          {/* FILAS */}
          {rows.map((row, i) => (
            <div
              key={row.label}
              className="ct-row"
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1.3fr 1fr 1fr",
                borderBottom: i < rows.length - 1 ? "1px solid #f1f5f9" : "none",
                background: i % 2 === 0 ? "#ffffff" : "#fafafa",
                transition: "background 0.2s ease",
              }}
            >
              {/* Label */}
              <div
                className="ct-col-label"
                style={{
                  padding: "18px 24px",
                  display: "flex",
                  alignItems: "center",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#374151",
                }}
              >
                {row.label}
              </div>

              {/* Mobile: columnas de datos en grid 3 cols */}
              <div className="ct-cols-data">
                {/* Impacto Digital */}
                <div
                  className="ct-col-impacto"
                  style={{
                    padding: "18px 16px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(96,11,86,0.05)",
                    borderLeft: "3px solid #600b56",
                    borderRight: "3px solid #600b56",
                    transition: "background 0.2s",
                  }}
                >
                  <span className="ct-mobile-label">Impacto Digital</span>
                  {renderValue(row.impacto, true)}
                </div>

                {/* Freelancer */}
                <div
                  className="ct-col-competitor"
                  style={{
                    padding: "18px 16px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span className="ct-mobile-label">Freelancer</span>
                  {renderValue(row.freelancer)}
                </div>

                {/* Agencia */}
                <div
                  className="ct-col-competitor"
                  style={{
                    padding: "18px 16px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span className="ct-mobile-label">Agencia</span>
                  {renderValue(row.agencia)}
                </div>
              </div>
            </div>
          ))}

          {/* PIE DE TABLA — columna Impacto Digital con cierre visual */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "2fr 1.3fr 1fr 1fr",
            background: "rgba(96,11,86,0.04)",
            borderTop: "2px solid #600b56",
          }}>
            <div style={{ padding: "0" }} />
            <div style={{
              padding: "16px",
              background: "linear-gradient(160deg, #150e23 0%, #600b56 100%)",
              borderLeft: "3px solid #600b56",
              borderRight: "3px solid #600b56",
              borderBottom: "3px solid #600b56",
              borderRadius: "0 0 12px 12px",
            }} />
            <div />
            <div />
          </div>
        </div>

        {/* LÍNEA DE APOYO */}
        <div
          className="ct-animate"
          style={{
            textAlign: "center",
            marginTop: "48px",
            transitionDelay: "0.15s",
          }}
        >
        

          {/* CTAs */}
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "16px",
            justifyContent: "center",
          }}>
           
          </div>
        </div>

      </div>
    </section>
  );
}
