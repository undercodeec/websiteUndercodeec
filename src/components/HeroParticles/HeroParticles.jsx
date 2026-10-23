"use client";

import { useEffect, useRef } from "react";
import "../../../public/landing-primary/css/hero-particles.css";

const SCRIPT_URL = "/landing-primary/js/home-hero-particles.js?v=20261023-primary-mobile-canvas";

export default function HeroParticles() {
  const clipRef = useRef(null);

  useEffect(() => {
    const clip = clipRef.current;
    const hero = clip?.parentElement;
    if (!hero) return undefined;

    let cancelled = false;
    let dispose = () => {};
    const mount = () => {
      if (!cancelled && window.mountHeroParticles) {
        dispose = window.mountHeroParticles(hero, clip);
      }
    };

    if (window.mountHeroParticles) {
      mount();
    } else {
      let script = document.querySelector('script[data-hero-particles-loader]');
      if (!script) {
        script = document.createElement("script");
        script.src = SCRIPT_URL;
        script.dataset.heroParticlesLoader = "true";
        document.head.append(script);
      }
      script.addEventListener("load", mount, { once: true });
    }

    return () => {
      cancelled = true;
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
