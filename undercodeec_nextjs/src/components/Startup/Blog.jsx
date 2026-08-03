"use client";
import React, { useState, useEffect, useCallback } from "react";

const contentSets = [
  {
    h2: "¡Bienvenido!",
    h4: "El marketing digital ya es esencial",
    p: "Hoy las personas buscan productos y servicios en internet. Tu negocio necesita presencia digital para crecer.",
  },
  {
    h2: "¿Qué es Inbound Marketing?",
    h4: "Estrategias de posicionamiento web para atraer clientes",
    p: "Conecta con personas interesadas en lo que ofreces mediante SEO, contenido de valor y redes sociales. El inbound marketing convierte visitas en ventas reales para tu empresa.",
  },
];

const Blog = ({}) => {
  const [displayH2, setDisplayH2] = useState("");
  const [displayH4, setDisplayH4] = useState("");
  const [displayP, setDisplayP] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const [showWhatsappMessage, setShowWhatsappMessage] = useState(false);

  // WhatsApp message tooltip cycle
  useEffect(() => {
    const interval = setInterval(() => {
      setShowWhatsappMessage(true);
      setTimeout(() => setShowWhatsappMessage(false), 4000);
    }, 8000);
    // Show initially after 2s
    const initial = setTimeout(() => {
      setShowWhatsappMessage(true);
      setTimeout(() => setShowWhatsappMessage(false), 4000);
    }, 2000);
    return () => {
      clearInterval(interval);
      clearTimeout(initial);
    };
  }, []);

  useEffect(() => {
    const cursorInterval = setInterval(
      () => setShowCursor((prev) => !prev),
      530,
    );
    return () => clearInterval(cursorInterval);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    const typeText = async (text, setter, speed = 35) => {
      for (let i = 1; i <= text.length; i++) {
        if (cancelled) return;
        setter(text.substring(0, i));
        await sleep(speed);
      }
    };

    const deleteText = async (text, setter, speed = 15) => {
      for (let i = text.length - 1; i >= 0; i--) {
        if (cancelled) return;
        setter(text.substring(0, i));
        await sleep(speed);
      }
    };

    const runAnimation = async () => {
      while (!cancelled) {
        for (let setIdx = 0; setIdx < contentSets.length; setIdx++) {
          const set = contentSets[setIdx];
          if (cancelled) return;

          // Type all fields
          await typeText(set.h2, setDisplayH2);
          await sleep(200);
          await typeText(set.h4, setDisplayH4);
          await sleep(200);
          await typeText(set.p, setDisplayP);

          // Pause to read
          await sleep(3000);
          if (cancelled) return;

          // Delete all fields in reverse
          await deleteText(set.p, setDisplayP);
          await sleep(100);
          await deleteText(set.h4, setDisplayH4);
          await sleep(100);
          await deleteText(set.h2, setDisplayH2);

          await sleep(500);
        }
      }
    };

    runAnimation();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="flex-section flex flex-wrap items-center justify-center gap-0 lg:gap-10 pt-0 pb-8 lg:py-12 px-0 lg:px-6">
      {/* Banner + social icons side by side */}
      {/* ✏️ Ajustar gap para separar los iconos del banner. Ejemplo: gap: '60px' */}
      <style>{`
        /* === Contenedor personaje: position:relative ancla los hijos absolutos === */
        .blog-character-outer {
          position: relative;
          width: 280px;
          max-width: 100%;
          margin: 80px auto 0;
          flex-shrink: 0;
        }
        /* Imagen del cuerpo define la altura del contenedor */
        .blog-body-img {
          width: 100%;
          height: auto;
          display: block;
        }
        /*
         * Todas las posiciones en % del contenedor → zoom-estables.
         * top % = relativo a la ALTURA del contenedor (= altura de .blog-body-img).
         * left/width % = relativo al ANCHO del contenedor.
         * Ajusta estos valores si la posición visual difiere.
         */
        .blog-head-img {
              position: absolute !important;
    top: -24% !important;
    left: 50% !important;
    width: 28% !important;
        }
        .blog-eye-left {
          position: absolute !important;
    top: -8% !important;
    left: 49% !important;
    width: 4.5% !important;
        }
        .blog-eye-right {
         position: absolute !important;
    top: -8.5% !important;
    left: 57% !important;
    width: 3% !important;
        }
        @media (min-width: 1024px) {
          .blog-character-outer {
            margin: 0;
          }
        }

        .blog-banner-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0;
          width: 100%;
        }
        .marketing-banner-responsive {
          left: 0 !important;
          width: 92% !important;
          margin: 0 auto !important;
          padding: 20px 15px !important;
        }
        .blog-social-col {
          display: none;
        }
        @media (min-width: 1024px) {
          .blog-banner-wrapper {
            flex-direction: row;
            align-items: center;
            gap: 60px;
            width: auto;
          }
          .marketing-banner-responsive {
            left: 0 !important;
            width: 453px !important;
            margin: 0 !important;
            padding: 30px !important;
          }
          .blog-social-col {
            display: flex;
            align-items: center;
          }
        }
      `}</style>
      {/* Imagen al lado con cabeza animada — izquierda */}
      <div className="blog-character-outer">
        <img
          src="/assets/img/choose_us/imgiboock.webp"
          alt="Persona feliz usando laptop sobre monedas"
          className="blog-body-img"
        />
        <img
          src="/assets/img/choose_us/imgcabeza.webp"
          alt="Cabeza del modelo"
          className="head-animated blog-head-img"
        />
        <img
          src="/assets/img/choose_us/ojo2.webp"
          alt="Ojo izquierdo"
          className="eye blog-eye-left"
        />
        <img
          src="/assets/img/choose_us/ojo1.webp"
          alt="Ojo derecho"
          className="eye blog-eye-right"
        />
      </div>

      <div className="blog-banner-wrapper">
        {/* Cuadro con burbujas estilo lámpara de lava */}
        <div className="banner-left-marketing marketing-banner-responsive">
          <div className="lava-bubbles d-lg-none">
            <span className="bubble-floating"></span>
            <span className="bubble-floating"></span>
            <span className="bubble-floating"></span>
            <span className="bubble-floating"></span>
            <span className="bubble-floating"></span>
          </div>
          <h2 style={{ minHeight: "1.4em" }}>
            {displayH2}
            <span
              style={{
                fontWeight: 100,
                color: "#fff",
                marginLeft: "2px",
                opacity: showCursor ? 1 : 0,
              }}
            >
              |
            </span>
          </h2>
          <h4 style={{ minHeight: "1.2em" }}>{displayH4}</h4>
          <p style={{ minHeight: "3em" }}>{displayP}</p>
        </div>

        {/* Social icons al costado derecho */}
        <div className="blog-social-col">
          <div
            className="social-icons"
            style={{ gap: "20px", justifyContent: "center" }}
          >
            <a
              href="https://www.facebook.com/undercodeec"
              target="_blank"
              rel="noopener noreferrer"
              className="facebook"
            >
              <i className="fab fa-facebook-f"></i>
            </a>
            <a
              href="https://www.instagram.com/undercodeec"
              target="_blank"
              rel="noopener noreferrer"
              className="instagram"
            >
              <i className="fab fa-instagram"></i>
            </a>
            <div
              className="whatsapp-icon-container"
              style={{ position: "relative" }}
            >
              <a
                href="https://wa.me/593999739534?text=¡Hola!%20Estoy%20interesado%20en%20obtener%20más%20información%20sobre%20los%20planes%20de%20marketing%20para%20mi%20negocio."
                target="_blank"
                rel="noopener noreferrer"
                className="whatsapp"
              >
                <i className="fab fa-whatsapp"></i>
              </a>
              {showWhatsappMessage && (
                <div
                  className="whatsapp-message"
                  style={{
                    left: "40px",
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                >
                  ¿Tienes preguntas?
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Blog;
