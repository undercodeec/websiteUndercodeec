"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { PrimaryOrb } from "@/components/Primary";
import styles from "./Header.module.css";

const MOBILE_APPS_TITLE = "Desarrollo de Aplicaciones Móviles";
const MOBILE_APPS_TITLE_LINES = ["Desarrollo", "de Aplicaciones", "Móviles"];
const HERO_SUBTITLE = "Diseño Innovador y Desarrollo Profesional";

function HeroCharacters({ text }) {
  return Array.from(text).map((character, index) => (
    <span className={styles.titleCharacterClip} key={`${character}-${index}`}>
      <span className={styles.titleCharacter} data-mobile-apps-hero-char>
        {character === " " ? "\u00a0" : character}
      </span>
    </span>
  ));
}

export default function Header() {
  const orbFieldRef = useRef(null);

  useEffect(() => {
    const orbField = orbFieldRef.current;
    if (!orbField) return undefined;

    const orb = orbField.querySelector("[data-mobile-apps-orb]");
    const innerOutline = orbField.querySelector('[data-mobile-apps-orb-outline="1"]');
    const outerOutline = orbField.querySelector('[data-mobile-apps-orb-outline="2"]');
    const innerRotation = orbField.querySelector('[data-mobile-apps-orb-outline-rotation="1"]');
    const outerRotation = orbField.querySelector('[data-mobile-apps-orb-outline-rotation="2"]');
    const hero = orbField.parentElement;
    const titleCharacters = hero?.querySelectorAll("[data-mobile-apps-hero-char]");
    const titleLineTransforms = hero?.querySelectorAll("[data-mobile-apps-hero-line-transform]");
    if (!orb || !innerOutline || !outerOutline || !innerRotation || !outerRotation || !titleCharacters?.length || !titleLineTransforms?.length) return undefined;

    let animationFrame;
    let removePreloaderDoneListener = () => {};
    let revealFallback;
    let hasRevealed = false;

    const context = gsap.context(() => {
      const timeline = gsap.timeline();

      timeline
        .to(orb, { x: "0vw", y: "0vh", scale: 1, duration: 1, force3D: true }, 0)
        .to(innerOutline, { x: "0vw", y: "0vh", scale: 1, duration: 1.5, force3D: true }, 0)
        .to(outerOutline, { x: "0vw", y: "0vh", scale: 1, duration: 1.5, force3D: true }, 0);

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(titleCharacters, { yPercent: 0, autoAlpha: 1 });
        timeline.progress(1);
        return;
      }

      const isTabletOrBelow = window.matchMedia("(max-width: 991px)").matches;
      gsap.set(titleCharacters, isTabletOrBelow
        ? { yPercent: -101, autoAlpha: 0 }
        : { yPercent: -101 });

      const revealTitle = () => {
        if (hasRevealed) return;
        hasRevealed = true;
        window.clearTimeout(revealFallback);
        removePreloaderDoneListener();

        const titleTimeline = gsap.timeline();

        titleTimeline.to(titleCharacters, {
          yPercent: 0,
          ...(isTabletOrBelow ? { autoAlpha: 1 } : {}),
          duration: 1,
          ease: "power4.inOut",
          stagger: { each: .03, from: "random" },
        });

        titleLineTransforms.forEach((line, index) => {
          titleTimeline.from(
            line,
            { x: index % 2 === 0 ? "10em" : "-10em", duration: 1, ease: "power2.inOut" },
            .2 + index * .1,
          );
        });
      };

      if (document.body.classList.contains("primary-preloading")) {
        window.addEventListener("preloaderDone", revealTitle, { once: true });
        removePreloaderDoneListener = () => window.removeEventListener("preloaderDone", revealTitle);
        revealFallback = window.setTimeout(revealTitle, 900);
      } else {
        revealTitle();
      }

      const innerSpin = gsap.to(innerRotation, {
        rotation: 360, duration: 100, repeat: -1, ease: "none", force3D: true,
      });
      const outerSpin = gsap.to(outerRotation, {
        rotation: -360, duration: 100, repeat: -1, ease: "none", force3D: true,
      });
      let lastScrollY = window.scrollY;

      const updateRingSpeed = () => {
        const scrollDelta = window.scrollY - lastScrollY;
        lastScrollY = window.scrollY;
        innerSpin.timeScale(Math.max(1, Math.abs(scrollDelta)));
        outerSpin.timeScale(Math.max(1, Math.abs(scrollDelta)));
        animationFrame = window.requestAnimationFrame(updateRingSpeed);
      };

      animationFrame = window.requestAnimationFrame(updateRingSpeed);
    }, hero);

    return () => {
      removePreloaderDoneListener();
      window.clearTimeout(revealFallback);
      window.cancelAnimationFrame(animationFrame);
      context.revert();
    };
  }, []);

  return (
    <section className={styles.hero} aria-label={MOBILE_APPS_TITLE}>
      <div ref={orbFieldRef} className={styles.orbField} aria-hidden="true">
        <div className={styles.orbLayer} data-mobile-apps-orb>
          <PrimaryOrb className={styles.orb} />
        </div>
        <div className={styles.orbOutlineLayer} data-mobile-apps-orb-outline="1">
          <div
            className={styles.orbOutlineRotation}
            data-mobile-apps-orb-outline-rotation="1"
          >
            <span className={styles.orbOutline} />
          </div>
        </div>
        <div className={`${styles.orbOutlineLayer} ${styles.orbOutlineLayerOuter}`} data-mobile-apps-orb-outline="2">
          <div
            className={styles.orbOutlineRotation}
            data-mobile-apps-orb-outline-rotation="2"
          >
            <span className={styles.orbOutline} />
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.tabletTitle} aria-hidden="true">
          <div className={styles.tabletHeading}>
            {MOBILE_APPS_TITLE_LINES.map((line) => <div key={line}><HeroCharacters text={line} /></div>)}
          </div>
        </div>

        <div className={styles.desktopTitle}>
          <div className={styles.titleBlend}>
            {MOBILE_APPS_TITLE_LINES.map((line) => (
              <div className={styles.titleBlock} key={line}>
                <span className={styles.titleTransform} data-mobile-apps-hero-line-transform>
                  <span className={styles.titleOverflow}>
                    <h1 className={styles.title} data-mobile-apps-hero-line><HeroCharacters text={line} /></h1>
                  </span>
                </span>
              </div>
            ))}
          </div>

          <div className={styles.subtitleBlock}>
            <p className={styles.subtitle}>{HERO_SUBTITLE}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
