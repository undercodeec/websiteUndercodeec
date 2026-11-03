"use client";

import { useEffect, useRef } from "react";
import "../../../public/landing-primary/css/hero-particles.css";

const SCRIPT_URL = "/landing-primary/js/home-hero-particles.js?v=20261031-progressive-particles";

export default function HeroParticles() {
  const clipRef = useRef(null);

  useEffect(() => {
    const clip = clipRef.current;
    const hero = clip?.parentElement;
    if (!hero) return undefined;

    let cancelled = false;
    let dispose = () => {};
    let frame = 0;
    let idle = 0;
    let timer = 0;
    const mount = () => {
      if (!cancelled && window.mountHeroParticles) {
        dispose = window.mountHeroParticles(hero, clip);
      }
    };

    const start = () => {
      if (cancelled || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
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

    // Paint the heading and controls before downloading the decorative engine.
    frame = window.requestAnimationFrame(() => {
      if ("requestIdleCallback" in window) {
        idle = window.requestIdleCallback(start, { timeout: 1600 });
      } else {
        timer = window.setTimeout(start, 250);
      }
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
      if (idle) window.cancelIdleCallback(idle);
      window.clearTimeout(timer);
      document.querySelector('script[data-hero-particles-loader]')?.removeEventListener("load", mount);
      dispose();
    };
  }, []);

  return (
    <div ref={clipRef} className="hero-particles" aria-hidden="true">
      <div className="webgpu-container" />
    </div>
  );
}
