"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PrimaryOrb } from "@/components/Primary";
import styles from "./MarketingHero.module.css";

const HERO_LABEL = "Agencia de Marketing Digital y SEO para tu Negocio";
const HERO_LINES = ["Marketing digital", "y SEO para", "tu negocio"];
const HERO_SUMMARY = "Estrategia, contenido, SEO y medios conectados para convertir atención en crecimiento medible.";

function AnimatedLine({ text }) {
  return (
    <span className={styles.titleLine}>
      <span className={styles.titleLineInner}>
        {text.split(/(\s+)/).map((word, wordIndex) => {
          if (/^\s+$/.test(word)) return " ";

          return (
            <span className={styles.titleWord} key={`${word}-${wordIndex}`}>
              {Array.from(word).map((character, characterIndex) => (
                <span className={styles.characterClip} key={`${character}-${characterIndex}`}>
                  <span className={styles.character} data-marketing-hero-character>
                    {character}
                  </span>
                </span>
              ))}
            </span>
          );
        })}
      </span>
    </span>
  );
}

export default function MarketingHero({
  label = HERO_LABEL,
  lines = HERO_LINES,
  topMeta = "Marketing / Estrategia / Rendimiento",
  summary = HERO_SUMMARY,
  bottomMeta = "Posicionamiento con propósito",
  index = "01",
  titleId = "marketing-hero-title",
  animateAcrossPage = true,
}) {
  const heroRef = useRef(null);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return undefined;

    const characters = hero.querySelectorAll("[data-marketing-hero-character]");
    const revealItems = hero.querySelectorAll("[data-marketing-hero-reveal]");
    const orb = hero.querySelector("[data-marketing-hero-orb]");
    const innerOutline = hero.querySelector('[data-marketing-hero-ring="inner"]');
    const outerOutline = hero.querySelector('[data-marketing-hero-ring="outer"]');
    const innerRotation = hero.querySelector('[data-marketing-hero-ring-rotation="inner"]');
    const outerRotation = hero.querySelector('[data-marketing-hero-ring-rotation="outer"]');
    const page = document.querySelector("[data-primary-page]");
    if (!characters.length || !orb || !innerOutline || !outerOutline || !innerRotation || !outerRotation) return undefined;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let removePreloaderDoneListener = () => {};
    let revealFallback;
    let hasRevealed = false;

    const context = gsap.context(() => {
      gsap.registerPlugin(ScrollTrigger);

      if (reduceMotion) {
        gsap.set([characters, revealItems, orb, innerOutline, outerOutline], {
          clearProps: "all",
          autoAlpha: 1,
        });
        return;
      }

      gsap.set(characters, { yPercent: 110, autoAlpha: 0 });
      gsap.set(revealItems, { y: 22, autoAlpha: 0 });
      gsap.set(orb, { scale: .64, autoAlpha: 0, force3D: true });
      gsap.set(innerOutline, { scale: .76, autoAlpha: 0, force3D: true });
      gsap.set(outerOutline, { scale: .84, autoAlpha: 0, force3D: true });

      const innerSpin = gsap.to(innerRotation, {
        rotation: 360,
        duration: 90,
        repeat: -1,
        ease: "none",
        force3D: true,
      });
      const outerSpin = gsap.to(outerRotation, {
        rotation: -360,
        duration: 120,
        repeat: -1,
        ease: "none",
        force3D: true,
      });

      const reveal = () => {
        if (hasRevealed) return;
        hasRevealed = true;
        window.clearTimeout(revealFallback);
        removePreloaderDoneListener();

        const timeline = gsap.timeline();

        timeline
          .to(orb, { scale: 1, autoAlpha: 1, duration: 1.4, ease: "power4.out" }, 0)
          .to(innerOutline, { scale: 1, autoAlpha: 1, duration: 1.5, ease: "power4.out" }, .08)
          .to(outerOutline, { scale: 1, autoAlpha: 1, duration: 1.6, ease: "power4.out" }, .14)
          .to(characters, {
            yPercent: 0,
            autoAlpha: 1,
            duration: 1,
            ease: "power4.inOut",
            stagger: { each: .026, from: "random" },
          }, .2)
          .to(revealItems, {
            y: 0,
            autoAlpha: 1,
            duration: .8,
            ease: "power3.out",
            stagger: .08,
          }, .55);
      };

      if (document.body.classList.contains("primary-preloading")) {
        window.addEventListener("preloaderDone", reveal, { once: true });
        removePreloaderDoneListener = () => window.removeEventListener("preloaderDone", reveal);
        revealFallback = window.setTimeout(reveal, 1800);
      } else {
        reveal();
      }

      if (page && animateAcrossPage) {
        const createScrollTimeline = () => gsap.timeline({
          scrollTrigger: {
            trigger: page,
            start: "top top",
            end: "bottom bottom",
            scrub: true,
            immediateRender: false,
          },
        });

        createScrollTimeline()
          .to(orb, { x: "50vw", scale: 2, duration: .15, ease: "power2.out" })
          .to(orb, { x: "-50vw", y: "-20vh", scale: 1.5, duration: .15, ease: "power2.inOut" })
          .to(orb, { x: "0vw", y: "50vh", scale: 0, duration: .05 })
          .to(orb, { x: "0vw", scale: 0, duration: .025 })
          .to(orb, { x: "0vw", y: "0vh", scale: 1, duration: .125 })
          .to(orb, { x: "-25vw", y: "20vh", scale: 1.5, duration: .1 })
          .to(orb, { x: "-60vw", y: "-75vh", scale: 0, ease: "power1.out", duration: .05 })
          .to(orb, { x: "0vw", y: "0vh", scale: 0, duration: .3 });

        createScrollTimeline()
          .to(innerOutline, { x: "10vw", y: "0vh", scale: 1.2, duration: .15 })
          .to(innerOutline, { x: "-30vw", y: "0vh", scale: 1.3, duration: .15 })
          .to(innerOutline, { x: "0vw", y: "50vh", scale: 1, duration: .05 })
          .to(innerOutline, { x: "0vw", y: "50vh", scale: .8, duration: .025 })
          .to(innerOutline, { x: "0vw", y: "0vh", scale: 1, duration: .125 })
          .to(innerOutline, { x: "30vw", y: "-20vh", scale: .7, duration: .15 })
          .to(innerOutline, { x: "0vw", y: "0vh", scale: 1, duration: .05 })
          .to(innerOutline, { x: "0vw", y: "0vh", scale: 0, duration: .25 })
          .to(innerOutline, { x: "49vw", y: "0vh", scale: 1, duration: .05 });

        createScrollTimeline()
          .to(outerOutline, { x: "25vw", y: "0vh", scale: 1.3, duration: .15 })
          .to(outerOutline, { x: "-9vw", y: "32vh", scale: .6, duration: .15 })
          .to(outerOutline, { x: "0vw", y: "50vh", scale: 1, duration: .05 })
          .to(outerOutline, { x: "0vw", y: "50vh", scale: .8, duration: .025 })
          .to(outerOutline, { x: "0vw", y: "0vh", scale: 1, duration: .125 })
          .to(outerOutline, { x: "0vw", y: "14vh", scale: 1.2, duration: .15 })
          .to(outerOutline, { x: "0vw", y: "0vh", scale: .6, duration: .05 })
          .to(outerOutline, { x: "0vw", y: "0vh", scale: 0, duration: .25 })
          .to(outerOutline, { x: "29vw", y: "0vh", scale: 1.5, duration: .05 });
      }

      return () => {
        innerSpin.kill();
        outerSpin.kill();
      };
    }, hero);

    return () => {
      removePreloaderDoneListener();
      window.clearTimeout(revealFallback);
      context.revert();
    };
  }, [animateAcrossPage]);

  return (
    <section ref={heroRef} className={styles.hero} aria-labelledby={titleId}>
      <div
        className={`${styles.orbField} ${animateAcrossPage ? "" : styles.orbFieldContained}`}
        aria-hidden="true"
      >
        <div className={styles.outerRingLayer} data-marketing-hero-ring="outer">
          <div className={styles.outerRing} data-marketing-hero-ring-rotation="outer" />
        </div>
        <div className={styles.innerRingLayer} data-marketing-hero-ring="inner">
          <div className={styles.innerRing} data-marketing-hero-ring-rotation="inner" />
        </div>
        <div className={styles.orbLayer} data-marketing-hero-orb>
          <PrimaryOrb className={styles.orb} />
        </div>
      </div>

      <div className={styles.topMeta} data-marketing-hero-reveal>
        <span>{topMeta}</span>
        <span>EC — 2026</span>
      </div>

      <div className={styles.content}>
        <div className={styles.titleBlend}>
          <h1 id={titleId} className={styles.title} aria-label={label}>
            {lines.map((line) => <AnimatedLine text={line} key={line} />)}
          </h1>
        </div>

        <div className={styles.summary} data-marketing-hero-reveal>
          <p>
            {summary}
          </p>
        </div>
      </div>

      <div className={styles.bottomMeta} data-marketing-hero-reveal aria-hidden="true">
        <span>{bottomMeta}</span>
        <span className={styles.metaLine} />
        <span>{index}</span>
      </div>
    </section>
  );
}
