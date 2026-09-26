"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import MarketingCanvas from "./MarketingCanvas";
import { splitAnimatedWords } from "./marketingIntroText.mjs";
import styles from "./MarketingPrimaryContent.module.css";

const services = [
  {
    number: "01",
    title: "Desarrollo web Madrid, Barcelona y Valencia",
    subtitle: "Web corporativa y conversión",
    description: "Para proyectos de desarrollo web Madrid y desarrollo web Barcelona, creamos sitios corporativos, landing pages y portales preparados para móvil. El diseño web Valencia se trabaja desde la estructura de contenidos, la navegación y la conversión.",
    scene: "01",
  },
  {
    number: "02",
    title: "Tienda online España y ecommerce España",
    subtitle: "Catálogo, compra e integraciones",
    description: "Una tienda online España debe responder al catálogo, los métodos de compra, la gestión de pedidos y las integraciones que realmente necesita cada negocio. Definimos el recorrido antes de desarrollar.",
    scene: "02",
  },
  {
    number: "03",
    title: "Desarrollo de apps móviles España",
    subtitle: "Android e iOS para tu operación",
    description: "El desarrollo de aplicaciones móviles Madrid parte de los usuarios, las tareas prioritarias y los sistemas que deben conectarse. Creamos apps para Android e iOS España para ventas, reservas, atención y operaciones.",
    scene: "03",
  },
  {
    number: "04",
    title: "Software empresarial España",
    subtitle: "Procesos, datos e integraciones",
    description: "Analizamos procesos, datos e integraciones para desarrollar software a medida España. También evaluamos necesidades de facturación electrónica España y Verifactu dentro del alcance técnico de cada sistema.",
    scene: "04",
  },
];

const processSteps = [
  {
    number: "01",
    title: "Analizamos",
    subtitle: "Objetivo, público y procesos",
    description: "Objetivo, público, procesos y alcance real.",
  },
  {
    number: "02",
    title: "Definimos",
    subtitle: "Estructura y prioridades",
    description: "Estructura, contenido, funcionalidades e integraciones prioritarias.",
  },
  {
    number: "03",
    title: "Construimos",
    subtitle: "Solución para tu negocio",
    description: "Una solución preparada para clientes, equipos y dispositivos.",
  },
  {
    number: "04",
    title: "Medimos",
    subtitle: "Mejora continua",
    description: "Publicamos y priorizamos mejoras según el comportamiento del proyecto.",
  },
];

const faqs = [
  {
    number: "01",
    title: "¿Qué incluye un presupuesto desarrollo web España?",
    subtitle: "Alcance del proyecto",
    description: "La propuesta se ajusta a las páginas, funcionalidades, integraciones, contenido y soporte que necesita el proyecto. Antes de recomendar una solución, revisamos qué debe resolver la web para la empresa.",
  },
  {
    number: "02",
    title: "¿Cuándo conviene elegir software a medida España?",
    subtitle: "Decisión técnica",
    description: "Cuando los procesos de clientes, ventas, inventario, operaciones o conexión con otras herramientas requieren una solución propia, analizamos el flujo antes de definir el alcance.",
  },
  {
    number: "03",
    title: "¿Trabajáis con empresas de Madrid, Barcelona y Valencia?",
    subtitle: "Trabajo remoto",
    description: "Sí. El trabajo se organiza de forma remota con sesiones de definición, revisiones y entregas acordadas con cada empresa.",
  },
];

function AnimatedHeading({ children, className, id }) {
  return (
    <h2 id={id} className={className} aria-label={children}>
      <span aria-hidden="true">
        {splitAnimatedWords(children).map((token, tokenIndex) => {
          if (token.type === "space") return token.value;

          return (
            <span className={styles.headingWord} key={`${token.characters.join("")}-${tokenIndex}`}>
              {token.characters.map((character, characterIndex) => (
                <span className={styles.headingCharacterClip} key={`${character}-${characterIndex}`}>
                  <span className={styles.headingCharacter} data-espana-content-heading-char>
                    {character}
                  </span>
                </span>
              ))}
            </span>
          );
        })}
      </span>
    </h2>
  );
}

function ContentGrid({ items, withCanvas = false }) {
  return (
    <ol className={styles.journeyGrid}>
      {items.map((item) => (
        <li className={styles.journeyStep} data-espana-content-reveal key={item.number}>
          <span className={styles.stepNumber}>{item.number}</span>
          <div className={styles.stepVisual} aria-hidden="true">
            {withCanvas ? <MarketingCanvas scene={item.scene} /> : null}
          </div>
          <div className={styles.stepContent}>
            <h3>{item.title}</h3>
            <p className={styles.stepSubtitle}>{item.subtitle}</p>
            <p className={styles.stepDescription}>{item.description}</p>
          </div>
          <span className={styles.stepCorner} aria-hidden="true">+</span>
        </li>
      ))}
    </ol>
  );
}

export default function EspanaPrimaryContent() {
  const surfaceRef = useRef(null);

  useEffect(() => {
    const surface = surfaceRef.current;
    if (!surface) return undefined;

    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();

    media.add("(prefers-reduced-motion: no-preference)", () => {
      const context = gsap.context(() => {
        surface.querySelectorAll("[data-marketing-content-section]").forEach((section) => {
          const characters = section.querySelectorAll("[data-espana-content-heading-char]");
          const revealItems = section.querySelectorAll("[data-espana-content-reveal]");
          const visual = section.querySelector("[data-espana-content-visual]");

          gsap.set(characters, { yPercent: 110, autoAlpha: 0 });
          gsap.set(revealItems, { y: 36, autoAlpha: 0 });
          if (visual) gsap.set(visual, { clipPath: "inset(0 0 100% 0)" });

          const timeline = gsap.timeline({
            scrollTrigger: {
              trigger: section,
              start: "top 78%",
              once: true,
            },
          });

          if (characters.length) {
            timeline.to(characters, {
              yPercent: 0,
              autoAlpha: 1,
              duration: 1,
              ease: "power4.inOut",
              stagger: { each: .022, from: "random" },
            });
          }

          if (revealItems.length) {
            timeline.to(revealItems, {
              y: 0,
              autoAlpha: 1,
              duration: .85,
              ease: "power4.out",
              stagger: .07,
            }, characters.length ? .1 : 0);
          }

          if (visual) {
            timeline.to(visual, {
              clipPath: "inset(0 0 0% 0)",
              duration: 1.1,
              ease: "power4.inOut",
            }, .08);
          }
        });
      }, surface);

      return () => context.revert();
    });

    return () => media.revert();
  }, []);

  return (
    <div ref={surfaceRef} className={styles.surface}>
      <section className={styles.journey} data-marketing-content-section aria-labelledby="espana-services-title">
        <header className={styles.sectionHeader}>
          <p className={styles.sectionMeta} data-espana-content-reveal>03 / Servicios</p>
          <AnimatedHeading id="espana-services-title" className={styles.sectionTitle}>
            Soluciones digitales para empresas en España
          </AnimatedHeading>
          <p className={styles.sectionIndex} data-espana-content-reveal>04 áreas</p>
        </header>
        <ContentGrid items={services} withCanvas />
      </section>

      <section className={styles.conversion} data-marketing-content-section aria-labelledby="espana-seo-title">
        <header className={styles.conversionHeader}>
          <p className={styles.sectionMeta} data-espana-content-reveal>04 / Visibilidad</p>
          <AnimatedHeading id="espana-seo-title" className={styles.conversionTitle}>
            Agencia SEO España y Google Ads España
          </AnimatedHeading>
          <p className={styles.sectionIndex} data-espana-content-reveal>SEO / Ads</p>
        </header>

        <div className={styles.conversionGrid}>
          <div className={styles.conversionCopy}>
            <p className={styles.conversionLead} data-espana-content-reveal>
              El posicionamiento web España requiere una base técnica sólida, contenido útil y mejora continua.
            </p>
            <p className={styles.combination} data-espana-content-reveal>
              Como agencia SEO España, trabajamos el posicionamiento en Google España con objetivos medibles; Google Ads España complementa la estrategia cuando conviene captar demanda de forma inmediata.
              <strong>Visibilidad que acompaña a tu negocio</strong>
            </p>
            <ul className={styles.benefits} data-espana-content-reveal>
              <li><span>01</span>Posicionamiento web España</li>
              <li><span>02</span>Posicionamiento en Google España</li>
              <li><span>03</span>Google Ads España</li>
            </ul>
          </div>

          <figure className={styles.conversionVisual} data-espana-content-visual>
            <span className={`${styles.corner} ${styles.cornerTopLeft}`} aria-hidden="true">+</span>
            <span className={`${styles.corner} ${styles.cornerTopRight}`} aria-hidden="true">+</span>
            <span className={`${styles.corner} ${styles.cornerBottomLeft}`} aria-hidden="true">+</span>
            <span className={`${styles.corner} ${styles.cornerBottomRight}`} aria-hidden="true">+</span>
            <div className={styles.camera} aria-hidden="true">
              <MarketingCanvas scene="intro" />
            </div>
            <figcaption>SEO / Google Ads / Medición</figcaption>
          </figure>
        </div>
      </section>

      <section className={styles.journey} data-marketing-content-section aria-labelledby="espana-process-title">
        <header className={styles.sectionHeader}>
          <p className={styles.sectionMeta} data-espana-content-reveal>05 / Proceso</p>
          <AnimatedHeading id="espana-process-title" className={styles.sectionTitle}>
            Transformación digital pymes España, con un plan claro
          </AnimatedHeading>
          <p className={styles.sectionIndex} data-espana-content-reveal>04 pasos</p>
        </header>
        <ContentGrid items={processSteps} />
      </section>

      <section className={styles.journey} data-marketing-content-section aria-labelledby="espana-faq-title">
        <header className={styles.sectionHeader}>
          <p className={styles.sectionMeta} data-espana-content-reveal>06 / Preguntas frecuentes</p>
          <AnimatedHeading id="espana-faq-title" className={styles.sectionTitle}>
            Decisiones antes de empezar
          </AnimatedHeading>
          <p className={styles.sectionIndex} data-espana-content-reveal>FAQ</p>
        </header>
        <ContentGrid items={faqs} />
      </section>

      <section className={styles.conversion} data-marketing-content-section aria-labelledby="espana-contact-title">
        <header className={styles.conversionHeader}>
          <p className={styles.sectionMeta} data-espana-content-reveal>07 / Contacto</p>
          <AnimatedHeading id="espana-contact-title" className={styles.conversionTitle}>
            Hablemos de tu proyecto en España
          </AnimatedHeading>
          <p className={styles.sectionIndex} data-espana-content-reveal>Undercodeec</p>
        </header>

        <div className={styles.conversionGrid}>
          <div className={styles.conversionCopy}>
            <p className={styles.conversionLead} data-espana-content-reveal>
              Cuéntanos qué necesita tu empresa.
            </p>
            <p className={styles.combination} data-espana-content-reveal>
              Prepararemos una propuesta para diseño web, ecommerce, apps, software o posicionamiento web.
              <strong>Una propuesta adaptada al alcance real</strong>
            </p>
            <a className={styles.primaryAction} href="mailto:gerencia@undercodeec.com" data-espana-content-reveal>
              <span>Escribir a Undercodeec</span><span aria-hidden="true">→</span>
            </a>
            <br />
            <a className={styles.primaryAction} href="https://wa.me/593999739534" data-espana-content-reveal>
              <span>Contactar por WhatsApp</span><span aria-hidden="true">→</span>
            </a>
          </div>

          <figure className={styles.conversionVisual} data-espana-content-visual>
            <span className={`${styles.corner} ${styles.cornerTopLeft}`} aria-hidden="true">+</span>
            <span className={`${styles.corner} ${styles.cornerTopRight}`} aria-hidden="true">+</span>
            <span className={`${styles.corner} ${styles.cornerBottomLeft}`} aria-hidden="true">+</span>
            <span className={`${styles.corner} ${styles.cornerBottomRight}`} aria-hidden="true">+</span>
            <div className={styles.camera} aria-hidden="true">
              <MarketingCanvas scene="03" />
            </div>
            <figcaption>Proyecto / Alcance / Propuesta</figcaption>
          </figure>
        </div>
      </section>
    </div>
  );
}
