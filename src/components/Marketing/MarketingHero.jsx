"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import HeroParticles from "@/components/HeroParticles/HeroParticles";
import styles from "./MarketingHero.module.css";

const HERO_LABEL = "Agencia de Marketing Digital y SEO para tu Negocio";
const HERO_LINES = ["Marketing digital", "y SEO para", "tu negocio"];
const HERO_SUMMARY = "Estrategias de marketing digital, posicionamiento SEO, gestión de redes sociales y publicidad en Google Ads y Meta Ads para empresas.";

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
  regionMeta = "EC — 2026",
}) {
  const heroRef = useRef(null);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return undefined;
    const characters = hero.querySelectorAll("[data-marketing-hero-character]");
    const revealItems = hero.querySelectorAll("[data-marketing-hero-reveal]");
    if (!characters.length || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

    let removePreloaderDoneListener = () => {};
    let revealFallback;
    let hasRevealed = false;
    const context = gsap.context(() => {
      gsap.set(characters, { yPercent: 110, autoAlpha: 0 });
      gsap.set(revealItems, { y: 22, autoAlpha: 0 });

      const reveal = () => {
        if (hasRevealed) return;
        hasRevealed = true;
        window.clearTimeout(revealFallback);
        removePreloaderDoneListener();
        gsap.timeline()
          .to(characters, {
            yPercent: 0, autoAlpha: 1, duration: 1, ease: "power4.inOut",
            stagger: { each: .026, from: "random" },
          }, .2)
          .to(revealItems, {
            y: 0, autoAlpha: 1, duration: .8, ease: "power3.out", stagger: .08,
          }, .55);
      };

      if (document.body.classList.contains("primary-preloading")) {
        window.addEventListener("preloaderDone", reveal, { once: true });
        removePreloaderDoneListener = () => window.removeEventListener("preloaderDone", reveal);
        revealFallback = window.setTimeout(reveal, 8000);
      } else {
        reveal();
      }
    }, hero);

    return () => {
      removePreloaderDoneListener();
      window.clearTimeout(revealFallback);
      context.revert();
    };
  }, []);

  return (
    <section ref={heroRef} className={styles.hero} aria-labelledby={titleId}>
      <HeroParticles />
      <div className={styles.topMeta} data-marketing-hero-reveal>
        <span>{topMeta}</span>
        <span>{regionMeta}</span>
      </div>
      <div className={styles.content}>
        <div className={styles.titleBlend}>
          <h1 id={titleId} className={styles.title} aria-label={label}>
            {lines.map((line) => <AnimatedLine text={line} key={line} />)}
          </h1>
        </div>
        <div className={styles.summary} data-marketing-hero-reveal>
          <p>{summary}</p>
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
