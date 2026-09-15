"use client";

import { useState } from "react";
import Image from "next/image";
import about from "@/data/App/about.json";
import faq from "@/data/App/faq.json";
import screenshots from "@/data/App/screenshots.json";
import styles from "./MobileAppsPrimaryContent.module.css";

const deliveryStages = [
  ["01", "Estrategia", "Definimos objetivos, usuarios y el alcance que necesita tu producto."],
  ["02", "Diseño", "Convertimos el recorrido de cada persona en una interfaz clara y reconocible."],
  ["03", "Desarrollo", "Construimos una app rápida, escalable y preparada para evolucionar."],
  ["04", "Lanzamiento", "Publicamos, medimos y acompañamos las siguientes mejoras."],
];

function ExpandableList({ items, label }) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className={styles.expandableList} aria-label={label}>
      {items.map((item, index) => {
        const isOpen = activeIndex === index;
        const panelId = `${label.replaceAll(" ", "-").toLowerCase()}-${index}`;
        const description = item.content || item.desc;

        return (
          <article className={styles.expandableItem} key={item.title}>
            <button
              type="button"
              className={styles.expandableButton}
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setActiveIndex(isOpen ? -1 : index)}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <span>{item.title}</span>
              <span className={styles.expandableSymbol} aria-hidden="true">{isOpen ? "−" : "+"}</span>
            </button>
            <div id={panelId} className={styles.expandableContent} hidden={!isOpen}>
              <p>{description}</p>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function FAQList() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className={styles.faqList}>
      {faq.map((item, index) => {
        const isOpen = activeIndex === index;
        const answerId = `mobile-app-faq-${item.id}`;

        return (
          <article className={styles.faqItem} key={item.id}>
            <button
              type="button"
              className={styles.faqButton}
              aria-expanded={isOpen}
              aria-controls={answerId}
              onClick={() => setActiveIndex(isOpen ? -1 : index)}
            >
              <span className={styles.faqNumber}>{String(index + 1).padStart(2, "0")}</span>
              <span>{item.question}</span>
              <span className={styles.faqSymbol} aria-hidden="true">{isOpen ? "−" : "+"}</span>
            </button>
            <div id={answerId} className={styles.faqAnswer} hidden={!isOpen}>
              <p>{item.answer.part1}</p>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export default function MobileAppsPrimaryContent() {
  return (
    <div className={styles.surface}>
      <section className={styles.intro} aria-labelledby="mobile-apps-intro-title">
        <p className={styles.sectionMeta}>01 / Aplicaciones móviles</p>
        <div className={styles.introTitleWrap}>
          <h2 id="mobile-apps-intro-title" className={styles.displayTitle}>
            Tu idea, lista para vivir en cada pantalla.
          </h2>
        </div>
        <div className={styles.introCopy}>
          <p>
            Diseñamos y desarrollamos aplicaciones móviles que conectan una necesidad real
            con una experiencia clara, útil y memorable.
          </p>
          <a className={styles.inlineAction} href="#proceso">
            <span>Conoce nuestro proceso</span><span aria-hidden="true">→</span>
          </a>
        </div>
      </section>

      <section id="proceso" className={styles.process} aria-labelledby="mobile-apps-process-title">
        <header className={styles.sectionHeader}>
          <p className={styles.sectionMeta}>02 / De la idea al lanzamiento</p>
          <h2 id="mobile-apps-process-title" className={styles.sectionTitle}>
            Un producto pensado para avanzar.
          </h2>
          <p className={styles.headerCopy}>
            Trabajamos contigo desde la primera decisión hasta la publicación en App Store y Google Play.
          </p>
        </header>

        <div className={styles.stageGrid}>
          {deliveryStages.map(([number, title, description]) => (
            <article className={styles.stage} key={number}>
              <span className={styles.stageNumber}>{number}</span>
              <h3>{title}</h3>
              <p>{description}</p>
              <span className={styles.stageCorner} aria-hidden="true">+</span>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.experience} aria-labelledby="mobile-apps-experience-title">
        <div className={styles.experienceCopy}>
          <p className={styles.sectionMeta}>03 / Experiencia de producto</p>
          <h2 id="mobile-apps-experience-title" className={styles.featureTitle}>
            Diseñamos experiencias que se sienten naturales.
          </h2>
          <p className={styles.bodyCopy}>
            Cada decisión de diseño hace que tu marca se vea mejor y que las personas lleguen a su objetivo con menos esfuerzo.
          </p>
        </div>

        <figure className={styles.phoneVisual}>
          <span className={`${styles.corner} ${styles.cornerTopLeft}`} aria-hidden="true">+</span>
          <span className={`${styles.corner} ${styles.cornerTopRight}`} aria-hidden="true">+</span>
          <span className={`${styles.corner} ${styles.cornerBottomLeft}`} aria-hidden="true">+</span>
          <span className={`${styles.corner} ${styles.cornerBottomRight}`} aria-hidden="true">+</span>
          <div className={styles.phoneFrame}>
            <Image
              src={screenshots[1]}
              alt="Vista de una aplicación móvil desarrollada por Undercodeec"
              width={620}
              height={1240}
              sizes="(max-width: 700px) 58vw, 23vw"
            />
          </div>
          <p className={styles.visualCaption}>Diseño UI / UX · Android · iOS</p>
        </figure>

        <div className={styles.experienceList}>
          <ExpandableList items={about.features} label="Características de experiencia móvil" />
          <a className={styles.inlineAction} href="/contacto">
            <span>Hablemos de tu aplicación</span><span aria-hidden="true">→</span>
          </a>
        </div>
      </section>

      <section className={styles.security} aria-labelledby="mobile-apps-security-title">
        <div className={styles.securityHeader}>
          <p className={styles.sectionMeta}>04 / Seguridad y escala</p>
          <h2 id="mobile-apps-security-title" className={styles.securityTitle}>
            Crece con una base segura.
          </h2>
        </div>
        <div className={styles.securityContent}>
          <p className={styles.securityLead}>
            La confianza no se añade al final. Protegemos los datos, definimos una arquitectura preparada para crecer y cuidamos cada integración desde el inicio.
          </p>
          <ExpandableList items={about.accordions} label="Seguridad de aplicaciones móviles" />
        </div>
      </section>

      <section className={styles.showcase} aria-labelledby="mobile-apps-showcase-title">
        <header className={styles.sectionHeader}>
          <p className={styles.sectionMeta}>05 / Producto en movimiento</p>
          <h2 id="mobile-apps-showcase-title" className={styles.sectionTitle}>
            Hecha para tu negocio. Preparada para tus clientes.
          </h2>
          <p className={styles.headerCopy}>
            Catálogos, reservas, ventas, contenido y flujos internos: construimos la aplicación alrededor de la forma en que tu negocio realmente trabaja.
          </p>
        </header>

        <div className={styles.shotGrid} aria-label="Muestras de interfaces móviles">
          {screenshots.map((screenshot, index) => (
            <figure className={styles.shot} key={screenshot}>
              <Image
                src={screenshot}
                alt={`Interfaz móvil de muestra ${index + 1}`}
                width={620}
                height={1240}
                sizes="(max-width: 700px) 34vw, 17vw"
              />
              <span className={styles.shotIndex}>{String(index + 1).padStart(2, "0")}</span>
            </figure>
          ))}
        </div>
      </section>

      <section className={styles.faqSection} aria-labelledby="mobile-apps-faq-title">
        <header className={styles.faqHeader}>
          <p className={styles.sectionMeta}>06 / Preguntas frecuentes</p>
          <h2 id="mobile-apps-faq-title" className={styles.faqTitle}>
            Lo que necesitas saber antes de empezar.
          </h2>
        </header>
        <FAQList />
      </section>
    </div>
  );
}
