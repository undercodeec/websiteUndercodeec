"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import testimonials from "@/data/Saas/testimonials.json";
import styles from "./Testimonials.module.css";

const HEADING = "La confianza se construye en cada entrega.";

function HeadingCharacters() {
  const words = HEADING.split(" ");

  return words.map((word, wordIndex) => (
    <span className={styles.headingWord} key={`${word}-${wordIndex}`}>
      {Array.from(word).map((character, characterIndex) => (
        <span
          className={styles.headingCharacter}
          data-testimonials-heading-character
          key={`${character}-${characterIndex}`}
        >
          {character}
        </span>
      ))}
      {wordIndex < words.length - 1 ? "\u00a0" : null}
    </span>
  ));
}

function CornerMarks() {
  return (
    <>
      <span className={`${styles.corner} ${styles.cornerTopLeft}`} aria-hidden="true">+</span>
      <span className={`${styles.corner} ${styles.cornerTopRight}`} aria-hidden="true">+</span>
      <span className={`${styles.corner} ${styles.cornerBottomLeft}`} aria-hidden="true">+</span>
      <span className={`${styles.corner} ${styles.cornerBottomRight}`} aria-hidden="true">+</span>
    </>
  );
}

export default function Testimonials() {
  const sectionRef = useRef(null);
  const activePanelRef = useRef(null);
  const clientButtonsRef = useRef([]);
  const isPausedRef = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeTestimonial = testimonials[activeIndex];

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return undefined;

    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      const headingCharacters = section.querySelectorAll("[data-testimonials-heading-character]");
      const revealElements = section.querySelectorAll("[data-testimonials-reveal]");
      const cards = section.querySelectorAll("[data-testimonials-client]");

      gsap.set(headingCharacters, { yPercent: 110, autoAlpha: 0 });
      gsap.set(revealElements, { y: 36, autoAlpha: 0 });
      gsap.set(cards, { y: 52, autoAlpha: 0 });

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 72%",
          once: true,
        },
      });

      timeline
        .to(headingCharacters, {
          yPercent: 0,
          autoAlpha: 1,
          duration: 1,
          ease: "power4.inOut",
          stagger: { each: .018, from: "random" },
        })
        .to(revealElements, {
          y: 0,
          autoAlpha: 1,
          duration: .8,
          ease: "power3.out",
          stagger: .08,
        }, .16)
        .to(cards, {
          y: 0,
          autoAlpha: 1,
          duration: .9,
          ease: "power4.out",
          stagger: .1,
        }, .28);
    }, section);

    return () => context.revert();
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (!isPausedRef.current) {
        setActiveIndex((currentIndex) => (currentIndex + 1) % testimonials.length);
      }
    }, 6500);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const panel = activePanelRef.current;
    if (!panel || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

    const animation = gsap.fromTo(
      panel,
      { y: 28, autoAlpha: 0, rotateX: 2.5 },
      { y: 0, autoAlpha: 1, rotateX: 0, duration: .72, ease: "power4.out" },
    );

    return () => animation.kill();
  }, [activeIndex]);

  const showPrevious = () => {
    setActiveIndex((currentIndex) => (currentIndex - 1 + testimonials.length) % testimonials.length);
  };

  const showNext = () => {
    setActiveIndex((currentIndex) => (currentIndex + 1) % testimonials.length);
  };

  const handleClientKeyDown = (event, index) => {
    const direction = {
      ArrowDown: 1,
      ArrowRight: 1,
      ArrowUp: -1,
      ArrowLeft: -1,
    }[event.key];

    if (!direction) return;
    event.preventDefault();
    const nextIndex = (index + direction + testimonials.length) % testimonials.length;
    setActiveIndex(nextIndex);
    clientButtonsRef.current[nextIndex]?.focus();
  };

  return (
    <section
      ref={sectionRef}
      className={`${styles.section} testimonials section-padding bg-gray5 style-5`}
      data-scroll-index="5"
      data-primary-testimonials
      aria-labelledby="testimonials-title"
      onPointerEnter={() => { isPausedRef.current = true; }}
      onPointerLeave={() => { isPausedRef.current = false; }}
      onFocusCapture={() => { isPausedRef.current = true; }}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) isPausedRef.current = false;
      }}
    >
      <header className={styles.header}>
        <p className={styles.eyebrow} data-testimonials-reveal>Voces de clientes</p>
        <div className={styles.headingClip}>
          <h2 id="testimonials-title" className={`primary-heading-b ${styles.heading}`}>
            <HeadingCharacters />
          </h2>
        </div>
        <p className={styles.index} data-testimonials-reveal>03 / 04</p>
        <p className={styles.introduction} data-testimonials-reveal>
          Relaciones reales, soluciones medibles y productos que siguen aportando valor después de su lanzamiento.
        </p>
      </header>

      <div className={styles.stage}>
        <div className={styles.clientRail} role="tablist" aria-label="Seleccionar testimonio">
          {testimonials.map((testimonial, index) => {
            const isActive = activeIndex === index;

            return (
              <button
                ref={(element) => { clientButtonsRef.current[index] = element; }}
                type="button"
                className={`${styles.clientButton} ${isActive ? styles.clientButtonActive : ""}`}
                data-testimonials-client
                role="tab"
                aria-selected={isActive}
                aria-controls="active-testimonial"
                tabIndex={isActive ? 0 : -1}
                onClick={() => setActiveIndex(index)}
                onKeyDown={(event) => handleClientKeyDown(event, index)}
                key={testimonial.author.name}
              >
                <span className={styles.clientNumber}>{String(index + 1).padStart(2, "0")}</span>
                <span className={styles.clientPortrait}>
                  <span
                    className={styles.clientPortraitImage}
                    style={{ backgroundImage: `url("${testimonial.author.image}")` }}
                    aria-hidden="true"
                  />
                </span>
                <span className={styles.clientIdentity}>
                  <strong>{testimonial.author.name}</strong>
                  <small>{testimonial.author.position}</small>
                </span>
                <span className={styles.clientArrow} aria-hidden="true">→</span>
              </button>
            );
          })}
        </div>

        <article
          id="active-testimonial"
          className={styles.quotePanel}
          ref={activePanelRef}
          role="tabpanel"
          aria-live="polite"
          key={activeTestimonial.author.name}
        >
          <CornerMarks />
          <div className={styles.quoteMeta}>
            <span>Testimonio verificado</span>
            <span className={styles.stars} aria-label={`${activeTestimonial.stars} de 5 estrellas`}>
              {Array.from({ length: activeTestimonial.stars }, (_, index) => (
                <span aria-hidden="true" key={index}>★</span>
              ))}
            </span>
          </div>

          <blockquote className={styles.quote}>
            <p>{activeTestimonial.comment.replace(/[“”]/g, "")}</p>
          </blockquote>

          <footer className={styles.quoteFooter}>
            <div>
              <strong>{activeTestimonial.author.name}</strong>
              <span>{activeTestimonial.author.position}</span>
            </div>
            <div className={styles.controls} aria-label="Navegación de testimonios">
              <button type="button" onClick={showPrevious} aria-label="Testimonio anterior">←</button>
              <span aria-hidden="true">
                {String(activeIndex + 1).padStart(2, "0")} / {String(testimonials.length).padStart(2, "0")}
              </span>
              <button type="button" onClick={showNext} aria-label="Siguiente testimonio">→</button>
            </div>
          </footer>
        </article>
      </div>

      <div className={styles.marquee} aria-hidden="true">
        <div className={styles.marqueeTrack}>
          <span>CONFIANZA</span><i>+</i><span>PRODUCTOS ÚTILES</span><i>+</i><span>RELACIONES REALES</span><i>+</i>
          <span>CONFIANZA</span><i>+</i><span>PRODUCTOS ÚTILES</span><i>+</i><span>RELACIONES REALES</span><i>+</i>
        </div>
      </div>
    </section>
  );
}
