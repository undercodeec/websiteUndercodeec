"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./PrimaryAbout.module.css";

const STORY_DATA = [
  {
    number: "01",
    eyebrow: "Producto digital",
    title: <>Desarrollo de <span>software.</span></>,
    description: "Nuestro enfoque está en proporcionar herramientas digitales esenciales que ayuden a tu empresa a mantenerse organizada, mejorar la experiencia del cliente y aumentar la productividad.",
    actionHref: "/software-para-tu-negocio/",
    actionLabel: "Conocer software",
    linksKey: "lineLinks",
  },
  {
    number: "02",
    eyebrow: "Experiencia móvil",
    title: <>Desarrollamos <span>apps.</span></>,
    description: "Diseñamos apps a medida para satisfacer las necesidades específicas de tu empresa. Desde la gestión de pagos hasta la experiencia de usuario, todo ajustado a ti. Descubre cómo podemos ayudarte hoy.",
    actionHref: "/aplicaciones-moviles",
    actionLabel: "Conocer apps",
    linksKey: "list",
  },
  {
    number: "03",
    eyebrow: "Presencia online",
    title: <>Diseño y <span>web.</span></>,
    description: "Haz que tu página web refleje completamente la identidad de tu negocio. Personalizamos cada elemento para que se ajuste a tus necesidades y ofrezca una experiencia única a tus clientes.",
    actionHref: "/",
    actionLabel: "Conocer web",
    linksKey: "webLinks",
  },
];

function fixEncoding(value = "") {
  if (!value.includes("Ã") && !value.includes("Â")) return value;

  try {
    return new TextDecoder("utf-8").decode(
      Uint8Array.from(value, (character) => character.charCodeAt(0)),
    );
  } catch {
    return value;
  }
}

function CapabilityList({ items = [], storyNumber }) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <ul className={styles.capabilities} aria-label={`Características del servicio ${storyNumber}`}>
      {items.map((item, index) => {
        const isActive = activeIndex === index;
        const itemId = `primary-about-${storyNumber}-${index}`;

        return (
          <li className={styles.capability} key={item.title}>
            <button
              type="button"
              className={styles.capabilityButton}
              aria-expanded={isActive}
              aria-controls={itemId}
              onClick={() => setActiveIndex(isActive ? -1 : index)}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <span>{fixEncoding(item.title)}</span>
              <span className={styles.capabilitySymbol} aria-hidden="true">{isActive ? "−" : "+"}</span>
            </button>
            <div
              id={itemId}
              className={styles.capabilityDetail}
              hidden={!isActive}
            >
              <p>{fixEncoding(item.desc)}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default function PrimaryAbout({ data }) {
  const sectionRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

    gsap.registerPlugin(ScrollTrigger);

    const context = gsap.context(() => {
      section.querySelectorAll("[data-primary-about-story]").forEach((story) => {
        const revealElements = story.querySelectorAll("[data-primary-about-reveal]");
        const imageFrame = story.querySelector("[data-primary-about-image]");

        gsap.set(revealElements, { y: 44, autoAlpha: 0 });
        if (imageFrame) gsap.set(imageFrame, { clipPath: "inset(0 0 100% 0)" });

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: story,
            start: "top 82%",
            once: true,
          },
        });

        timeline.to(revealElements, {
          y: 0,
          autoAlpha: 1,
          duration: .9,
          stagger: .09,
          ease: "power4.out",
        });

        if (imageFrame) {
          timeline.to(imageFrame, {
            clipPath: "inset(0 0 0% 0)",
            duration: 1.15,
            ease: "power4.inOut",
          }, .08);
        }
      });
    }, section);

    return () => context.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={styles.section}
      data-scroll-index="1"
      aria-labelledby="primary-about-title"
    >
      <header className={styles.intro}>
        <p className={styles.kicker}>Lo que construimos</p>
        <div className={styles.introTitleBlend}>
          <h2 id="primary-about-title" className={`primary-heading-b ${styles.introTitle}`}>
            Productos digitales pensados para avanzar.
          </h2>
        </div>
        <p className={styles.introIndex}>02 / 04</p>
      </header>

      <div className={styles.stories}>
        {STORY_DATA.map((story, storyIndex) => {
          const links = data[story.linksKey] || [];
          const isReverse = storyIndex % 2 === 1;

          return (
            <article
              className={`${styles.story} ${isReverse ? styles.storyReverse : ""}`}
              data-primary-about-story
              key={story.number}
            >
              <div className={styles.storyMeta} data-primary-about-reveal>
                <span>{story.number}</span>
                <span>{story.eyebrow}</span>
              </div>

              <figure className={styles.visual} data-primary-about-image aria-hidden="true">
                <span className={`${styles.corner} ${styles.cornerTopLeft}`} aria-hidden="true">+</span>
                <span className={`${styles.corner} ${styles.cornerTopRight}`} aria-hidden="true">+</span>
                <span className={`${styles.corner} ${styles.cornerBottomLeft}`} aria-hidden="true">+</span>
                <span className={`${styles.corner} ${styles.cornerBottomRight}`} aria-hidden="true">+</span>
              </figure>

              <div className={styles.storyContent}>
                <h3 className={`primary-heading-b ${styles.storyTitle}`} data-primary-about-reveal>
                  {story.title}
                </h3>
                <p className={styles.description} data-primary-about-reveal>{story.description}</p>
                <div data-primary-about-reveal>
                  <CapabilityList items={links} storyNumber={story.number} />
                </div>
                <Link className={styles.action} href={story.actionHref} data-primary-about-reveal>
                  <span>{story.actionLabel}</span>
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
