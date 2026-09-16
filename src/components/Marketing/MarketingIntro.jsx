"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import MarketingCanvas from "./MarketingCanvas";
import { splitAnimatedWords } from "./marketingIntroText.mjs";
import styles from "./MarketingIntro.module.css";

const INTRO_TITLE = "El marketing digital ya es esencial.";

function AnimatedHeading({ children, className, id }) {
  return (
    <h2 id={id} className={className} aria-label={children}>
      <span aria-hidden="true">
        {splitAnimatedWords(children).map((token, tokenIndex) => {
          if (token.type === "space") return token.value;

          return (
            <span className={styles.titleWord} key={`${token.characters.join("")}-${tokenIndex}`}>
              {token.characters.map((character, characterIndex) => (
                <span className={styles.characterClip} key={`${character}-${characterIndex}`}>
                  <span className={styles.character} data-marketing-intro-character>
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

export default function MarketingIntro() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    gsap.registerPlugin(ScrollTrigger);

    const media = gsap.matchMedia();

    media.add("(prefers-reduced-motion: no-preference)", () => {
      const context = gsap.context(() => {
        const characters = section.querySelectorAll("[data-marketing-intro-character]");
        const revealItems = section.querySelectorAll("[data-marketing-intro-reveal]");
        const visual = section.querySelector("[data-marketing-intro-visual]");

        gsap.set(characters, { yPercent: 110, autoAlpha: 0 });
        gsap.set(revealItems, { y: 36, autoAlpha: 0 });
        gsap.set(visual, { clipPath: "inset(0 0 100% 0)" });

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top 72%",
            once: true,
          },
        });

        timeline
          .to(characters, {
            yPercent: 0,
            autoAlpha: 1,
            duration: 1,
            ease: "power4.inOut",
            stagger: { each: .025, from: "random" },
          })
          .to(revealItems, {
            y: 0,
            autoAlpha: 1,
            duration: .85,
            ease: "power4.out",
            stagger: .08,
          }, .12)
          .to(visual, {
            clipPath: "inset(0 0 0% 0)",
            duration: 1.15,
            ease: "power4.inOut",
          }, .08);

      }, section);

      return () => context.revert();
    });

    return () => media.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="marketing-intro"
      className={styles.section}
      aria-labelledby="marketing-intro-title"
    >
      <header className={styles.header}>
        <p className={styles.meta} data-marketing-intro-reveal>02 / ¡Bienvenido!</p>
        <div className={styles.titleBlend}>
          <AnimatedHeading
            id="marketing-intro-title"
            className={`primary-heading-b ${styles.title}`}
          >
            {INTRO_TITLE}
          </AnimatedHeading>
        </div>
        <p className={styles.index} data-marketing-intro-reveal>02</p>
      </header>

      <div className={styles.content}>
        <figure
          className={styles.visual}
          data-marketing-intro-visual
          aria-label="Recorrido de inbound marketing desde los canales digitales hasta la conversión en ventas"
        >
          <span className={`${styles.corner} ${styles.cornerTopLeft}`} aria-hidden="true">+</span>
          <span className={`${styles.corner} ${styles.cornerTopRight}`} aria-hidden="true">+</span>
          <span className={`${styles.corner} ${styles.cornerBottomLeft}`} aria-hidden="true">+</span>
          <span className={`${styles.corner} ${styles.cornerBottomRight}`} aria-hidden="true">+</span>

          <div className={styles.canvas} aria-hidden="true">
            <MarketingCanvas scene="intro" />
          </div>

          <figcaption>Presencia digital / Contenido / Conversión</figcaption>
        </figure>

        <div className={styles.copy}>
          <p className={styles.lead} data-marketing-intro-reveal>
            Hoy las personas buscan productos y servicios en internet. Tu negocio necesita
            presencia digital para crecer.
          </p>

          <div className={styles.inbound} data-marketing-intro-reveal>
            <p className={styles.inboundMeta}>¿Qué es Inbound Marketing?</p>
            <h3>Estrategias de posicionamiento web para atraer clientes</h3>
            <p>
              Conecta con personas interesadas en lo que ofreces mediante SEO, contenido de
              valor y redes sociales. El inbound marketing convierte visitas en ventas reales
              para tu empresa.
            </p>
          </div>

         
        </div>
      </div>
    </section>
  );
}
