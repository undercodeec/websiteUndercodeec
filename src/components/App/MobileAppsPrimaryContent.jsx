"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Autoplay, Keyboard } from "swiper";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import MobileAppProcessCanvas from "./MobileAppProcessCanvas";
import "swiper/css";
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

function AnimatedHeading({ as: Heading = "h2", children, className, ...props }) {
  const label = typeof children === "string" ? children : "";
  const words = label.split(/(\s+)/);

  return (
    <Heading {...props} className={className} aria-label={label}>
      <span className={styles.headingCharacters} aria-hidden="true">
        {words.map((word, wordIndex) => {
          if (/^\s+$/.test(word)) return " ";

          return (
            <span className={styles.headingWord} key={`${word}-${wordIndex}`}>
              {Array.from(word).map((character, characterIndex) => (
                <span className={styles.headingCharacterClip} key={`${character}-${characterIndex}`}>
                  <span className={styles.headingCharacter} data-mobile-apps-content-heading-char>
                    {character}
                  </span>
                </span>
              ))}
            </span>
          );
        })}
      </span>
    </Heading>
  );
}

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

function ProductScreensCarousel() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => setPrefersReducedMotion(mediaQuery.matches);

    updateMotionPreference();
    mediaQuery.addEventListener("change", updateMotionPreference);

    return () => mediaQuery.removeEventListener("change", updateMotionPreference);
  }, []);

  return (
    <div
      className={styles.shotGrid}
      role="region"
      aria-roledescription="carrusel"
      aria-label="Muestras de interfaces móviles"
    >
      <Swiper
        modules={[A11y, Autoplay, Keyboard]}
        className={styles.shotCarousel}
        dir="ltr"
        slidesPerView={5}
        centeredSlides
        loop
        speed={prefersReducedMotion ? 0 : 1000}
        autoplay={prefersReducedMotion ? false : {
          delay: 3000,
          disableOnInteraction: true,
          pauseOnMouseEnter: false,
        }}
        onClick={(swiper) => swiper.autoplay?.stop()}
        onTouchStart={(swiper) => swiper.autoplay?.stop()}
        keyboard={{ enabled: true }}
        breakpoints={{
          0: { slidesPerView: 2 },
          480: { slidesPerView: 2 },
          787: { slidesPerView: 3 },
          991: { slidesPerView: 3 },
          1200: { slidesPerView: 5 },
        }}
      >
        {screenshots.map((screenshot, index) => (
          <SwiperSlide className={styles.shotSlide} key={screenshot}>
            <figure className={styles.shot}>
              <Image
                src={screenshot}
                alt={`Interfaz móvil de muestra ${index + 1}`}
                width={190}
                height={420}
                sizes="(max-width: 700px) 8.5rem, 11.875rem"
              />
            </figure>
          </SwiperSlide>
        ))}
      </Swiper>

      <Image
        src="/assets/img/screenshots/hand.png"
        alt=""
        aria-hidden="true"
        className={styles.shotHand}
        width={511}
        height={676}
        sizes="(max-width: 700px) 27rem, 37.5rem"
      />
    </div>
  );
}

export default function MobileAppsPrimaryContent() {
  const surfaceRef = useRef(null);

  useEffect(() => {
    const surface = surfaceRef.current;
    if (!surface || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

    gsap.registerPlugin(ScrollTrigger);

    const context = gsap.context(() => {
      surface.querySelectorAll("[data-mobile-apps-content-section]").forEach((section) => {
        const headingCharacters = section.querySelectorAll("[data-mobile-apps-content-heading-char]");
        const revealElements = section.querySelectorAll("[data-mobile-apps-content-reveal]");
        const visual = section.querySelector("[data-mobile-apps-content-visual]");

        gsap.set(headingCharacters, { yPercent: 105, autoAlpha: 0 });
        gsap.set(revealElements, { y: 36, autoAlpha: 0 });
        if (visual) gsap.set(visual, { clipPath: "inset(0 0 100% 0)" });

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top 78%",
            once: true,
          },
        });

        if (headingCharacters.length) {
          timeline.to(headingCharacters, {
            yPercent: 0,
            autoAlpha: 1,
            duration: 1,
            ease: "power4.inOut",
            stagger: { each: .025, from: "random" },
          });
        }

        if (revealElements.length) {
          timeline.to(revealElements, {
            y: 0,
            autoAlpha: 1,
            duration: .85,
            ease: "power4.out",
            stagger: .08,
          }, headingCharacters.length ? .12 : 0);
        }

        if (visual) {
          timeline.to(visual, {
            clipPath: "inset(0 0 0% 0)",
            duration: 1.1,
            ease: "power4.inOut",
          }, .1);
        }
      });
    }, surface);

    return () => context.revert();
  }, []);

  return (
    <div ref={surfaceRef} className={styles.surface}>
      <section className={styles.intro} data-mobile-apps-content-section aria-labelledby="mobile-apps-intro-title">
        <p className={styles.sectionMeta} data-mobile-apps-content-reveal>01 / Aplicaciones móviles</p>
        <div className={styles.introTitleWrap}>
          <AnimatedHeading id="mobile-apps-intro-title" className={`primary-heading-b ${styles.displayTitle}`}>
            Tu idea, lista para vivir en cada pantalla.
          </AnimatedHeading>
        </div>
        <div className={styles.introCopy} data-mobile-apps-content-reveal>
          <p>
            Diseñamos y desarrollamos aplicaciones móviles que conectan una necesidad real
            con una experiencia clara, útil y memorable.
          </p>
          <a className={styles.inlineAction} href="#proceso">
            <span>Conoce nuestro proceso</span><span aria-hidden="true">→</span>
          </a>
        </div>
      </section>

      <section id="proceso" className={styles.process} data-mobile-apps-content-section aria-labelledby="mobile-apps-process-title">
        <header className={styles.sectionHeader}>
          <p className={styles.sectionMeta} data-mobile-apps-content-reveal>02 / De la idea al lanzamiento</p>
          <AnimatedHeading id="mobile-apps-process-title" className={`primary-heading-b ${styles.sectionTitle}`}>
            Un producto pensado para avanzar.
          </AnimatedHeading>
          <p className={styles.headerCopy} data-mobile-apps-content-reveal>
            Trabajamos contigo desde la primera decisión hasta la publicación en App Store y Google Play.
          </p>
        </header>

        <div className={styles.stageGrid}>
          {deliveryStages.map(([number, title, description]) => (
            <article className={styles.stage} data-mobile-apps-content-reveal key={number}>
              <span className={styles.stageNumber}>{number}</span>
              <div className={styles.stageVisual} aria-hidden="true">
                <MobileAppProcessCanvas stage={number} />
              </div>
              <div className={styles.stageContent}>
                <AnimatedHeading as="h3">{title}</AnimatedHeading>
                <p>{description}</p>
              </div>
              <span className={styles.stageCorner} aria-hidden="true">+</span>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.experience} data-mobile-apps-content-section aria-labelledby="mobile-apps-experience-title">
        <div className={styles.experienceCopy}>
          <p className={styles.sectionMeta} data-mobile-apps-content-reveal>03 / Experiencia de producto</p>
          <AnimatedHeading id="mobile-apps-experience-title" className={`primary-heading-b ${styles.featureTitle}`}>
            Diseñamos experiencias que se sienten naturales.
          </AnimatedHeading>
          <p className={styles.bodyCopy} data-mobile-apps-content-reveal>
            Cada decisión de diseño hace que tu marca se vea mejor y que las personas lleguen a su objetivo con menos esfuerzo.
          </p>
        </div>

        <figure className={styles.phoneVisual} data-mobile-apps-content-visual>
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

        <div className={styles.experienceList} data-mobile-apps-content-reveal>
          <ExpandableList items={about.features} label="Características de experiencia móvil" />
          <a className={styles.inlineAction} href="/contacto">
            <span>Hablemos de tu aplicación</span><span aria-hidden="true">→</span>
          </a>
        </div>
      </section>

      <section className={styles.security} data-mobile-apps-content-section aria-labelledby="mobile-apps-security-title">
        <div className={styles.securityHeader}>
          <p className={styles.sectionMeta} data-mobile-apps-content-reveal>04 / Seguridad y escala</p>
          <AnimatedHeading id="mobile-apps-security-title" className={`primary-heading-b ${styles.securityTitle}`}>
            Crece con una base segura.
          </AnimatedHeading>
        </div>
        <div className={styles.securityContent} data-mobile-apps-content-reveal>
          <p className={styles.securityLead}>
            La confianza no se añade al final. Protegemos los datos, definimos una arquitectura preparada para crecer y cuidamos cada integración desde el inicio.
          </p>
          <ExpandableList items={about.accordions} label="Seguridad de aplicaciones móviles" />
        </div>
      </section>

      <section className={styles.showcase} data-mobile-apps-content-section aria-labelledby="mobile-apps-showcase-title">
        <header className={styles.sectionHeader}>
          <p className={styles.sectionMeta} data-mobile-apps-content-reveal>05 / Producto en movimiento</p>
          <AnimatedHeading id="mobile-apps-showcase-title" className={`primary-heading-b ${styles.sectionTitle}`}>
            Hecha para tu negocio. Preparada para tus clientes.
          </AnimatedHeading>
          <p className={styles.headerCopy} data-mobile-apps-content-reveal>
            Catálogos, reservas, ventas, contenido y flujos internos: construimos la aplicación alrededor de la forma en que tu negocio realmente trabaja.
          </p>
        </header>

        <ProductScreensCarousel />
      </section>

      <section className={styles.faqSection} data-mobile-apps-content-section aria-labelledby="mobile-apps-faq-title">
        <header className={styles.faqHeader}>
          <p className={styles.sectionMeta} data-mobile-apps-content-reveal>06 / Preguntas frecuentes</p>
          <AnimatedHeading id="mobile-apps-faq-title" className={`primary-heading-b ${styles.faqTitle}`}>
            Lo que necesitas saber antes de empezar.
          </AnimatedHeading>
        </header>
        <div className={styles.faqContent} data-mobile-apps-content-reveal><FAQList /></div>
      </section>
    </div>
  );
}
