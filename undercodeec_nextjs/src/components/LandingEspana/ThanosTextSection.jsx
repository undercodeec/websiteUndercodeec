"use client";

import React, { useEffect, useRef, useState } from "react";

export default function ThanosTextSection() {
  const sectionRef = useRef(null);
  const stickyRef = useRef(null);
  const dispRef = useRef(null);
  const turbRef = useRef(null);
  const headingRef = useRef(null);
  const speederRef = useRef(null);
  const scaleRef = useRef(null);
  const bouncedRef = useRef(false);
  const rafRef = useRef(0);
  const [reduced, setReduced] = useState(false);
  const [phase, setPhase] = useState("before"); // before | pinned | after

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
      if (speederRef.current) {
        speederRef.current.style.opacity = "0";
      }
      return;
    }

    bouncedRef.current = false;
    const section = sectionRef.current;
    if (!section) return;

    const update = () => {
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight || 1;

      // Determinar fase
      let newPhase;
      if (rect.top > 0) newPhase = "before";
      else if (rect.bottom < vh) newPhase = "after";
      else newPhase = "pinned";
      setPhase((prev) => (prev === newPhase ? prev : newPhase));

      // Progreso solo durante el pin: 0 al iniciar pin, 1 al soltar
      const total = Math.max(1, rect.height - vh);
      const scrolled = Math.max(0, -rect.top);
      const p = Math.max(0, Math.min(1, scrolled / total));

      // FASE TEXTO:
      // 0.00 - 0.30 estable
      // 0.30 - 0.50 se desintegra
      let dissolve;
      if (newPhase === "before") dissolve = 0;
      else if (newPhase === "after") dissolve = 1;
      else if (p < 0.3) dissolve = 0;
      else if (p < 0.5) dissolve = (p - 0.3) / 0.2;
      else dissolve = 1;

      const dispScale = Math.round(dissolve * 320);
      const freq = (0.015 + dissolve * 0.04).toFixed(4);
      const textOpacity = (1 - Math.pow(dissolve, 1.4)).toFixed(3);

      if (dispRef.current) dispRef.current.setAttribute("scale", String(dispScale));
      if (turbRef.current) turbRef.current.setAttribute("baseFrequency", freq);
      if (headingRef.current) {
        headingRef.current.style.opacity = textOpacity;
        headingRef.current.style.transform = `scale(${(0.96 + (1 - dissolve) * 0.04).toFixed(3)})`;
      }

      // FASE SPEEDER (entra desde izq, corre, sale derecha) — solo pinned
      if (speederRef.current) {
        let tx, op;
        if (newPhase !== "pinned") {
          tx = -140;
          op = 0;
        } else {
          // Mapeo dentro del pin: 0.20 - 1.00 (80% del pin para el corredor)
          const speederStart = 0.2;
          const sp = (p - speederStart) / (1 - speederStart);
          const sc = Math.max(0, Math.min(1, sp));

          if (sc <= 0) {
            tx = -140;
            op = 0;
          } else if (sc < 0.48) {
            // entrada lenta (48% del recorrido del speeder)
            const k = sc / 0.48;
            const eased = 1 - Math.pow(1 - k, 3); // outCubic
            tx = -140 + eased * 140;
            op = Math.min(1, k * 1.6);
          } else if (sc < 0.56) {
            // breve centro
            tx = 0;
            op = 1;
          } else {
            // salida lenta (44% del recorrido del speeder)
            const k = (sc - 0.56) / 0.44;
            const eased = k * k; // inQuad
            tx = eased * 140;
            op = 1 - Math.min(1, k * 1.2);
          }
        }

        speederRef.current.style.transform = `translateX(${tx.toFixed(2)}vw)`;
        speederRef.current.style.opacity = op.toFixed(3);

        // Rebote de entrada (CSS) la primera vez que aparece
        if (newPhase === "pinned" && !bouncedRef.current && p > 0.22 && p < 0.45 && scaleRef.current) {
          bouncedRef.current = true;
          scaleRef.current.classList.remove("is-bouncing");
          void scaleRef.current.offsetWidth;
          scaleRef.current.classList.add("is-bouncing");
        }
        if (bouncedRef.current && (newPhase === "before" || p < 0.18)) {
          bouncedRef.current = false;
        }
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

  const stickyStyle =
    phase === "pinned"
      ? { position: "fixed", top: 0, left: 0, right: 0 }
      : phase === "before"
      ? { position: "absolute", top: 0, left: 0, right: 0 }
      : { position: "absolute", bottom: 0, left: 0, right: 0 };

  return (
    <section className="thanos-pin-section" ref={sectionRef}>
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

      <div className="thanos-pin-sticky" ref={stickyRef} style={stickyStyle}>
        <div className="thanos-text-wrapper">
          <h2 className="thanos-text-heading" ref={headingRef}>
            Impulsa tu negocio con una web de verdad
          </h2>
        </div>

        <div className="speeder-stage" aria-hidden="true">
          <div className="speeder-anim" ref={speederRef}>
            <div className="speeder-scale" ref={scaleRef}>
              <div className="loader">
                <span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
                <div className="base">
                  <span></span>
                  <div className="face"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .thanos-pin-section {
          position: relative;
          width: 100%;
          height: 340vh;
          background: #ffffff;
        }

        .thanos-pin-sticky {
          width: 100%;
          height: 100vh;
          background: #ffffff;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .thanos-text-wrapper {
          filter: url(#thanos-text-dissolve);
          text-align: center;
          max-width: 900px;
          position: relative;
          z-index: 1;
          padding: 0 24px;
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
          opacity: 1;
          transform: scale(1);
          will-change: opacity, transform;
        }

        .speeder-stage {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          z-index: 2;
        }

        .speeder-anim {
          opacity: 0;
          transform: translateX(-140vw);
          will-change: transform, opacity;
        }

        .speeder-scale {
          transform: scale(1.5);
          transform-origin: center;
        }

        .speeder-scale.is-bouncing {
          animation: speeder-bounce 700ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @keyframes speeder-bounce {
          0%   { transform: scale(1.05); }
          45%  { transform: scale(1.7);  }
          70%  { transform: scale(1.42); }
          100% { transform: scale(1.5);  }
        }

        /* === Speeder loader (animacion-veloz-hombre) ===
           Border-color de los triángulos = colores sólidos del gradiente
           (los borders CSS no aceptan linear-gradient).
           El resto lleva el gradiente real. */
        .loader {
          position: relative;
          animation: speeder 0.65s linear infinite;
          z-index: 10;
          width: 100px;
          height: 50px;
        }

        .loader > span {
          height: 5px;
          width: 35px;
          background-image: linear-gradient(90deg, #600b56 0%, #270f31 30%, #efa238 73%);
          position: absolute;
          top: 6px;
          left: 60px;
          border-radius: 2px 10px 1px 0;
        }

        .base span {
          position: absolute;
          width: 0;
          height: 0;
          border-top: 6px solid transparent;
          border-right: 100px solid #270f31;
          border-bottom: 6px solid transparent;
          top: 25px;
        }

        .base span:before {
          content: "";
          height: 22px;
          width: 22px;
          border-radius: 50%;
          background-image: linear-gradient(90deg, #600b56 0%, #270f31 30%, #efa238 73%);
          position: absolute;
          right: -78px;
          top: -16px;
        }

        .base span:after {
          content: "";
          position: absolute;
          width: 0;
          height: 0;
          border-top: 0 solid transparent;
          border-right: 55px solid #efa238;
          border-bottom: 16px solid transparent;
          top: -16px;
          right: -68px;
        }

        .face {
          position: absolute;
          height: 12px;
          width: 20px;
          background-image: linear-gradient(90deg, #600b56 0%, #270f31 30%, #efa238 73%);
          border-radius: 20px 20px 0 0;
          transform: rotate(-40deg);
          right: -10px;
          top: 10px;
        }

        .face:after {
          content: "";
          height: 12px;
          width: 12px;
          background-image: linear-gradient(90deg, #600b56 0%, #270f31 30%, #efa238 73%);
          right: 4px;
          top: 7px;
          position: absolute;
          transform: rotate(40deg);
          transform-origin: 50% 50%;
          border-radius: 0 0 0 2px;
        }

        .loader > span > span:nth-child(1),
        .loader > span > span:nth-child(2),
        .loader > span > span:nth-child(3),
        .loader > span > span:nth-child(4) {
          width: 30px;
          height: 1px;
          background-image: linear-gradient(90deg, #600b56 0%, #270f31 30%, #efa238 73%);
          position: absolute;
          animation: fazer1 0.35s linear infinite;
        }

        .loader > span > span:nth-child(2) {
          top: 3px;
          animation: fazer2 0.65s linear infinite;
        }

        .loader > span > span:nth-child(3) {
          top: 1px;
          animation: fazer3 0.65s linear infinite;
          animation-delay: -1s;
        }

        .loader > span > span:nth-child(4) {
          top: 4px;
          animation: fazer4 1.5s linear infinite;
          animation-delay: -1s;
        }

        @keyframes fazer1 {
          0% { left: 0; }
          100% { left: -80px; opacity: 0; }
        }
        @keyframes fazer2 {
          0% { left: 0; }
          100% { left: -100px; opacity: 0; }
        }
        @keyframes fazer3 {
          0% { left: 0; }
          100% { left: -50px; opacity: 0; }
        }
        @keyframes fazer4 {
          0% { left: 0; }
          100% { left: -150px; opacity: 0; }
        }

        @keyframes speeder {
          0% { transform: translate(2px, 1px) rotate(0deg); }
          10% { transform: translate(-1px, -3px) rotate(-1deg); }
          20% { transform: translate(-2px, 0px) rotate(1deg); }
          30% { transform: translate(1px, 2px) rotate(0deg); }
          40% { transform: translate(1px, -1px) rotate(1deg); }
          50% { transform: translate(-1px, 3px) rotate(-1deg); }
          60% { transform: translate(-1px, 1px) rotate(0deg); }
          70% { transform: translate(3px, 1px) rotate(-1deg); }
          80% { transform: translate(-2px, -1px) rotate(1deg); }
          90% { transform: translate(2px, 1px) rotate(0deg); }
          100% { transform: translate(1px, -2px) rotate(-1deg); }
        }

        @media (prefers-reduced-motion: reduce) {
          .thanos-pin-section {
            height: auto;
          }
          .thanos-pin-sticky {
            height: auto;
            min-height: 60vh;
            padding: 80px 0;
          }
          .speeder-stage {
            display: none;
          }
          .loader {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}
