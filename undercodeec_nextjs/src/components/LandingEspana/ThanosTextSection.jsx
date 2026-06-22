"use client";

import React, { useEffect, useRef, useState } from "react";

export default function ThanosTextSection() {
  const sectionRef = useRef(null);
  const dispRef = useRef(null);
  const turbRef = useRef(null);
  const headingRef = useRef(null);
  const rafRef = useRef(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e) => setReduced(e.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  useEffect(() => {
    if (reduced) {
      if (headingRef.current) {
        headingRef.current.style.opacity = "1";
        headingRef.current.style.transform = "scale(1)";
      }
      if (dispRef.current) dispRef.current.setAttribute("scale", "0");
      return;
    }

    const section = sectionRef.current;
    if (!section) return;

    const update = () => {
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      // progress: 0 cuando la sección está completamente debajo del viewport,
      // 1 cuando está completamente arriba del viewport.
      const total = rect.height + vh;
      const passed = vh - rect.top;
      let p = passed / total;
      p = Math.max(0, Math.min(1, p));

      // Curva: texto sólido en el centro (~0.35–0.65), se desintegra al entrar/salir.
      // distancia al centro [0..1] -> mayor = más desintegración
      const d = Math.abs(p - 0.5) * 2; // 0 centro, 1 bordes

      // Zona estable cerca del centro
      const stable = 0.25;
      let dissolve;
      if (d < stable) dissolve = 0;
      else dissolve = (d - stable) / (1 - stable); // 0..1

      const scale = Math.round(dissolve * 320); // máx disp
      const freq = (0.015 + dissolve * 0.04).toFixed(4);
      const opacity = (1 - Math.pow(dissolve, 1.4)).toFixed(3);

      if (dispRef.current) dispRef.current.setAttribute("scale", String(scale));
      if (turbRef.current) turbRef.current.setAttribute("baseFrequency", freq);
      if (headingRef.current) {
        headingRef.current.style.opacity = opacity;
        headingRef.current.style.transform = `scale(${(0.96 + (1 - dissolve) * 0.04).toFixed(3)})`;
      }
    };

    const onScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = 0;
        update();
      });
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [reduced]);

  return (
    <section className="thanos-text-section" ref={sectionRef}>
      <svg style={{ position: "absolute", width: 0, height: 0 }} aria-hidden="true">
        <defs>
          <filter id="thanos-text-dissolve" x="-60%" y="-60%" width="220%" height="220%">
            <feTurbulence
              ref={turbRef}
              type="fractalNoise"
              baseFrequency="0.015"
              numOctaves="3"
              seed="7"
              result="noise"
            />
            <feDisplacementMap
              ref={dispRef}
              in="SourceGraphic"
              in2="noise"
              scale="0"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      <div className="thanos-text-wrapper">
        <h2 className="thanos-text-heading" ref={headingRef}>
          Impulsa tu negocio con una web de verdad
        </h2>
      </div>

      <style jsx>{`
        .thanos-text-section {
          position: relative;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #ffffff;
          overflow: hidden;
        }

        .thanos-text-wrapper {
          filter: url(#thanos-text-dissolve);
          text-align: center;
          max-width: 900px;
        }

        .thanos-text-heading {
          font-size: clamp(32px, 6vw, 72px);
          font-weight: 800;
          background-image: linear-gradient(90deg, #600b56 0%, #270f31 30%, #efa238 73%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
          line-height: 1.1;
          letter-spacing: -0.02em;
          margin: 0;
          opacity: 0;
          transform: scale(0.96);
          will-change: opacity, transform;
        }
      `}</style>
    </section>
  );
}
