"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PrimaryOrb } from "@/components/Primary";
import styles from "./ServicesOrbBackground.module.css";

export default function ServicesOrbBackground() {
  const orbFieldRef = useRef(null);

  useEffect(() => {
    const orbField = orbFieldRef.current;
    const page = document.querySelector("[data-services-page]");
    if (!orbField || !page) return undefined;

    const orb = orbField.querySelector("[data-services-orb]");
    const innerOutline = orbField.querySelector('[data-services-orb-outline="1"]');
    const outerOutline = orbField.querySelector('[data-services-orb-outline="2"]');
    const innerRotation = orbField.querySelector('[data-services-orb-outline-rotation="1"]');
    const outerRotation = orbField.querySelector('[data-services-orb-outline-rotation="2"]');
    if (!orb || !innerOutline || !outerOutline || !innerRotation || !outerRotation) return undefined;

    gsap.registerPlugin(ScrollTrigger);
    let animationFrame;

    const context = gsap.context(() => {
      gsap.set([orb, innerOutline, outerOutline], {
        x: "0vw", y: "0vh", scale: 1, force3D: true,
      });

      const orbMotion = gsap.timeline({
        scrollTrigger: { trigger: page, start: "top top", end: "bottom bottom", scrub: true, immediateRender: false },
      });
      const innerOutlineMotion = gsap.timeline({
        scrollTrigger: { trigger: page, start: "top top", end: "bottom bottom", scrub: true, immediateRender: false },
      });
      const outerOutlineMotion = gsap.timeline({
        scrollTrigger: { trigger: page, start: "top top", end: "bottom bottom", scrub: true, immediateRender: false },
      });

      orbMotion
        .to(orb, { x: "50vw", scale: 2, duration: .15, ease: "power2.out" })
        .to(orb, { x: "-50vw", y: "-20vh", scale: 1.5, duration: .15, ease: "power2.inOut" })
        .to(orb, { x: "0vw", y: "50vh", scale: 0, duration: .05 })
        .to(orb, { x: "0vw", scale: 0, duration: .025 })
        .to(orb, { x: "0vw", y: "0vh", scale: 1, duration: .125 })
        .to(orb, { x: "-25vw", y: "20vh", scale: 1.5, duration: .1 })
        .to(orb, { x: "-60vw", y: "-75vh", scale: 0, ease: "power1.out", duration: .05 })
        .to(orb, { x: "0vw", y: "0vh", scale: 0, duration: .3 });

      innerOutlineMotion
        .to(innerOutline, { x: "10vw", y: "0vh", scale: 1.2, duration: .15, overwrite: "auto" })
        .to(innerOutline, { x: "-30vw", y: "0vh", scale: 1.3, duration: .15 })
        .to(innerOutline, { x: "0vw", y: "50vh", scale: 1, duration: .05 })
        .to(innerOutline, { x: "0vw", y: "50vh", scale: .8, duration: .025 })
        .to(innerOutline, { x: "0vw", y: "0vh", scale: 1, duration: .125 })
        .to(innerOutline, { x: "30vw", y: "-20vh", scale: .7, duration: .15 })
        .to(innerOutline, { x: "0vw", y: "0vh", scale: 1, duration: .05 })
        .to(innerOutline, { x: "0vw", y: "0vh", scale: 0, duration: .25 })
        .to(innerOutline, { x: "49vw", y: "0vh", scale: 1, duration: .05 });

      outerOutlineMotion
        .to(outerOutline, { x: "25vw", y: "0vh", scale: 1.3, duration: .15, overwrite: "auto" })
        .to(outerOutline, { x: "-9vw", y: "32vh", scale: .6, duration: .15 })
        .to(outerOutline, { x: "0vw", y: "50vh", scale: 1, duration: .05 })
        .to(outerOutline, { x: "0vw", y: "50vh", scale: .8, duration: .025 })
        .to(outerOutline, { x: "0vw", y: "0vh", scale: 1, duration: .125 })
        .to(outerOutline, { x: "0vw", y: "14vh", scale: 1.2, duration: .15 })
        .to(outerOutline, { x: "0vw", y: "0vh", scale: .6, duration: .05 })
        .to(outerOutline, { x: "0vw", y: "0vh", scale: 0, duration: .25 })
        .to(outerOutline, { x: "29vw", y: "0vh", scale: 1.5, duration: .05 });

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        orbMotion.progress(0);
        innerOutlineMotion.progress(0);
        outerOutlineMotion.progress(0);
        return;
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
    }, orbField);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      context.revert();
    };
  }, []);

  return (
    <div ref={orbFieldRef} className={styles.root} aria-hidden="true">
      <div className={styles.orbLayer} data-services-orb>
        <PrimaryOrb className={styles.orb} darkModeBlack />
      </div>
      <div className={styles.orbOutlineLayer} data-services-orb-outline="1">
        <div className={styles.orbOutlineRotation} data-services-orb-outline-rotation="1">
          <span className={styles.orbOutline} />
        </div>
      </div>
      <div className={`${styles.orbOutlineLayer} ${styles.orbOutlineLayerOuter}`} data-services-orb-outline="2">
        <div className={styles.orbOutlineRotation} data-services-orb-outline-rotation="2">
          <span className={styles.orbOutline} />
        </div>
      </div>
    </div>
  );
}
