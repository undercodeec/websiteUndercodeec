"use client";

import { useEffect, useRef } from "react";
import "../../../public/landing-primary/css/hero-particles.css";

const SCRIPT_URL = "/landing-primary/js/home-hero-particles.js?v=20261103-mobile-grid";

export default function HeroParticles() {
  const clipRef = useRef(null);

  useEffect(() => {
    const clip = clipRef.current;
    const hero = clip?.parentElement;
    if (!hero) return undefined;
    const mobileMedia = window.matchMedia("(max-width: 767px)");

    let cancelled = false;
    let dispose = () => {};
    let frame = 0;
    let idle = 0;
    let timer = 0;
    const mount = () => {
      if (!cancelled && !mobileMedia.matches && window.mountHeroParticles) {
        dispose = window.mountHeroParticles(hero, clip);
      }
    };

    const start = () => {
      if (cancelled || mobileMedia.matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      if (window.mountHeroParticles) {
        mount();
        return;
      }
      let script = document.querySelector('script[data-hero-particles-loader]');
      if (!script) {
        script = document.createElement("script");
        script.src = SCRIPT_URL;
        script.dataset.heroParticlesLoader = "true";
        document.head.append(script);
      }
      script.addEventListener("load", mount, { once: true });
    };

    const stop = () => {
      window.cancelAnimationFrame(frame);
      if (idle) window.cancelIdleCallback(idle);
      window.clearTimeout(timer);
      document.querySelector('script[data-hero-particles-loader]')?.removeEventListener("load", mount);
      dispose();
      dispose = () => {};
    };

    const schedule = () => {
      // Paint the heading and controls before downloading the decorative engine.
      frame = window.requestAnimationFrame(() => {
        if ("requestIdleCallback" in window) {
          idle = window.requestIdleCallback(start, { timeout: 1600 });
        } else {
          timer = window.setTimeout(start, 250);
        }
      });
    };
    const onMobileChange = () => {
      if (mobileMedia.matches) stop();
      else schedule();
    };
    mobileMedia.addEventListener("change", onMobileChange);
    if (!mobileMedia.matches) schedule();

    return () => {
      cancelled = true;
      mobileMedia.removeEventListener("change", onMobileChange);
      stop();
    };
  }, []);

  return (
    <>
      <div ref={clipRef} className="hero-particles" aria-hidden="true">
        <div className="webgpu-container" />
      </div>
      <div className="mobile-hero-grid" aria-hidden="true">
        <div className="mobile-hero-grid__layer mobile-hero-grid__layer--base" />
        <div className="mobile-hero-grid__layer mobile-hero-grid__layer--offset" />
        <span className="mobile-hero-grid__cell mobile-hero-grid__cell--one" />
        <span className="mobile-hero-grid__cell mobile-hero-grid__cell--two" />
        <span className="mobile-hero-grid__cell mobile-hero-grid__cell--three" />
        <span className="mobile-hero-grid__cell mobile-hero-grid__cell--four" />
      </div>
    </>
  );
}
