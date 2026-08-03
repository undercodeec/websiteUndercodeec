"use client";

import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { animate } from "animejs";
import AnimatedCards from "@/components/LandingEspana/AnimatedCards";
import StackingCardsDemo from "@/components/LandingEspana/StackingCardsDemo";

const TubesBackground = dynamic(
  () => import("@/components/LandingEspana/TubesBackground"),
  { ssr: false, loading: () => null }
);
const JellySqueeze = dynamic(
  () => import("@/components/LandingEspana/JellySqueeze"),
  { ssr: false, loading: () => null }
);

const BLOCKS = [
  {
    title: "¿Quieres que tu web tenga efectos así?",
    desc: "Carruseles 3D con perspectiva real, parallax al cursor y volumen físico. Animaciones que tus usuarios no olvidan.",
  },
  {
    title: "¿O tal vez algo así?",
    desc: "Fondos interactivos con tubos neón que reaccionan al cursor en tiempo real. Tu marca con personalidad propia.",
  },
  {
    title: "¿O quizás algo como esto?",
    desc: "Stacking cards: cada tarjeta se queda fija mientras la siguiente se desliza encima como un mazo cinematográfico.",
  },
  {
    title: "¿O un botón que se apachurra?",
    desc: "Física blanda en tiempo real: arrastra el blob, suéltalo y rebota con inercia. Microinteracciones que cambian la percepción de tu marca.",
  },
];

const smoothstep = (t) => {
  const x = Math.max(0, Math.min(1, t));
  return x * x * (3 - 2 * x);
};

const fadeBand = (p, start, end) => {
  if (p <= start) return 0;
  if (p >= end) return 1;
  return (p - start) / (end - start);
};

export default function ScrollPinShowcase() {
  const sectionRef = useRef(null);
  const stickyRef = useRef(null);

  const displacementRef = useRef(null);
  const turbulenceRef = useRef(null);
  const tubesDisplacementRef = useRef(null);
  const tubesTurbulenceRef = useRef(null);
  const stackingDisplacementRef = useRef(null);
  const stackingTurbulenceRef = useRef(null);
  const jellyDisplacementRef = useRef(null);
  const jellyTurbulenceRef = useRef(null);

  const cardsRef = useRef(null);
  const tubesRef = useRef(null);
  const stackingRef = useRef(null);
  const stackingWrapperRef = useRef(null);
  const jellyRef = useRef(null);

  const block1Ref = useRef(null);
  const block2Ref = useRef(null);
  const block3Ref = useRef(null);
  const block4Ref = useRef(null);
  const enteredRef = useRef(false);
  const cardsActiveRef = useRef({ active: true });
  const jellyActiveRef = useRef({ active: true });

  const [reducedMotion, setReducedMotion] = useState(false);
  const [phase, setPhase] = useState("before");
  const [mountTubes, setMountTubes] = useState(false);
  const [mountJelly, setMountJelly] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const initialMotionTimer = setTimeout(() => setReducedMotion(mq.matches), 0);
    const onChange = (e) => setReducedMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => {
      clearTimeout(initialMotionTimer);
      mq.removeEventListener("change", onChange);
    };
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    if (phase === "pinned" && !enteredRef.current && block1Ref.current) {
      enteredRef.current = true;
      animate(block1Ref.current, {
        opacity: [0, 1],
        translateY: ["40px", "0px"],
        duration: 900,
        ease: "outCubic",
      });
      if (cardsRef.current) {
        animate(cardsRef.current, {
          opacity: [0, 1],
          scale: [0.92, 1],
          duration: 1100,
          ease: "outQuart",
        });
      }
    }
  }, [phase, reducedMotion]);

  useEffect(() => {
    if (reducedMotion) return;

    let rafId = 0;
    let ticking = false;

    const compute = () => {
      const section = sectionRef.current;
      if (!section) {
        ticking = false;
        return;
      }
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;

      let newPhase;
      if (rect.top > 0) newPhase = "before";
      else if (rect.bottom < vh) newPhase = "after";
      else newPhase = "pinned";
      setPhase((prev) => (prev === newPhase ? prev : newPhase));

      const total = Math.max(1, rect.height - vh);
      const scrolled = Math.max(0, -rect.top);
      const p = Math.max(0, Math.min(1, scrolled / total));

      // Lazy-mount heavy WebGL/image-sequence layers slightly before their visible range
      if (!mountTubes && p > 0.18) setMountTubes(true);
      if (!mountJelly && p > 0.72) setMountJelly(true);

      // --- Cards (AnimatedCards) ---
      // Thanos dissolve 0.14 - 0.28
      const cardsThanos = smoothstep(fadeBand(p, 0.14, 0.28));
      const cardsThanosActive = cardsThanos > 0.001 && cardsThanos < 0.999;
      if (cardsThanosActive) {
        if (displacementRef.current) displacementRef.current.setAttribute("scale", (cardsThanos * 380).toFixed(2));
        if (turbulenceRef.current) turbulenceRef.current.setAttribute("baseFrequency", (0.012 + cardsThanos * 0.055).toFixed(4));
      }
      if (cardsRef.current && enteredRef.current) {
        cardsRef.current.style.opacity = (1 - cardsThanos).toFixed(3);
        cardsRef.current.style.filter = cardsThanosActive ? "url(#thanos-scroll-dissolve)" : "none";
      }
      cardsActiveRef.current.active = (1 - cardsThanos) > 0.02;

      // --- Tubes ---
      // appears 0.25 - 0.34, Thanos dissolve 0.46 - 0.58
      const tubesIn = smoothstep(fadeBand(p, 0.25, 0.34));
      const tubesThanos = smoothstep(fadeBand(p, 0.46, 0.58));
      const tubesThanosActive = tubesThanos > 0.001 && tubesThanos < 0.999;
      if (tubesRef.current) {
        const tubesOpacity = tubesIn * (1 - tubesThanos);
        tubesRef.current.style.opacity = tubesOpacity.toFixed(3);
        tubesRef.current.style.pointerEvents = tubesOpacity > 0.5 ? "auto" : "none";
        tubesRef.current.style.filter = tubesThanosActive ? "url(#tubes-scroll-dissolve)" : "none";
      }
      if (tubesThanosActive) {
        if (tubesDisplacementRef.current) tubesDisplacementRef.current.setAttribute("scale", (tubesThanos * 400).toFixed(2));
        if (tubesTurbulenceRef.current) tubesTurbulenceRef.current.setAttribute("baseFrequency", (0.014 + tubesThanos * 0.06).toFixed(4));
      }

      // --- Stacking Cards ---
      // appears 0.54 - 0.62, stacking animation 0.54 - 0.76, Thanos exit 0.74 - 0.80
      const stackingIn = smoothstep(fadeBand(p, 0.54, 0.62));
      const stackingThanos = smoothstep(fadeBand(p, 0.74, 0.80));
      const stackingThanosActive = stackingThanos > 0.001 && stackingThanos < 0.999;
      if (stackingWrapperRef.current) {
        stackingWrapperRef.current.style.opacity = (stackingIn * (1 - stackingThanos)).toFixed(3);
        stackingWrapperRef.current.style.filter = stackingThanosActive ? "url(#stacking-scroll-dissolve)" : "none";
      }
      if (stackingRef.current) {
        const stackP = Math.max(0, Math.min(1, (p - 0.54) / 0.22));
        stackingRef.current.setProgress(stackP);
      }
      if (stackingThanosActive) {
        if (stackingDisplacementRef.current) stackingDisplacementRef.current.setAttribute("scale", (stackingThanos * 420).toFixed(2));
        if (stackingTurbulenceRef.current) stackingTurbulenceRef.current.setAttribute("baseFrequency", (0.013 + stackingThanos * 0.06).toFixed(4));
      }

      // --- Jelly Squeeze ---
      // appears 0.80 - 0.88, Thanos dissolve exit 0.93 - 1.0
      const jellyIn = smoothstep(fadeBand(p, 0.80, 0.88));
      const jellyThanos = smoothstep(fadeBand(p, 0.93, 1.0));
      const jellyThanosActive = jellyThanos > 0.001 && jellyThanos < 0.999;
      let jellyOpacity = 0;
      if (jellyRef.current) {
        jellyOpacity = jellyIn * (1 - jellyThanos);
        jellyRef.current.style.opacity = jellyOpacity.toFixed(3);
        jellyRef.current.style.pointerEvents = jellyOpacity > 0.5 ? "auto" : "none";
        jellyRef.current.style.filter = jellyThanosActive ? "url(#jelly-scroll-dissolve)" : "none";
      }
      if (jellyThanosActive) {
        if (jellyDisplacementRef.current) jellyDisplacementRef.current.setAttribute("scale", (jellyThanos * 420).toFixed(2));
        if (jellyTurbulenceRef.current) jellyTurbulenceRef.current.setAttribute("baseFrequency", (0.013 + jellyThanos * 0.06).toFixed(4));
      }
      jellyActiveRef.current.active = jellyOpacity > 0.02;

      // --- Texts ---
      if (block1Ref.current && enteredRef.current) {
        // visible 0 - 0.13, fade out 0.13 - 0.20
        const o1 = p < 0.13 ? 1 : p > 0.20 ? 0 : 1 - (p - 0.13) / 0.07;
        block1Ref.current.style.opacity = o1.toFixed(3);
        block1Ref.current.style.transform = `translateY(${((1 - o1) * 20).toFixed(1)}px)`;
      }
      if (block2Ref.current) {
        // fade in 0.28 - 0.36, visible to 0.48, fade out 0.48 - 0.55
        const o2 = p < 0.28 ? 0 : p > 0.55 ? 0 : p < 0.36 ? (p - 0.28) / 0.08 : p > 0.48 ? 1 - (p - 0.48) / 0.07 : 1;
        block2Ref.current.style.opacity = Math.max(0, Math.min(1, o2)).toFixed(3);
        block2Ref.current.style.transform = `translateY(${((1 - Math.max(0, Math.min(1, o2))) * 20).toFixed(1)}px)`;
      }
      if (block3Ref.current) {
        // fade in 0.58 - 0.65, visible to 0.76, fade out 0.76 - 0.82
        const o3 = p < 0.58 ? 0 : p > 0.82 ? 0 : p < 0.65 ? (p - 0.58) / 0.07 : p > 0.76 ? 1 - (p - 0.76) / 0.06 : 1;
        block3Ref.current.style.opacity = Math.max(0, Math.min(1, o3)).toFixed(3);
        block3Ref.current.style.transform = `translateY(${((1 - Math.max(0, Math.min(1, o3))) * 20).toFixed(1)}px)`;
      }
      if (block4Ref.current) {
        // fade in 0.86 - 0.92, visible to 1.0
        const o4 = p < 0.86 ? 0 : p > 0.92 ? 1 : (p - 0.86) / 0.06;
        block4Ref.current.style.opacity = o4.toFixed(3);
        block4Ref.current.style.transform = `translateY(${((1 - o4) * 20).toFixed(1)}px)`;
      }

      ticking = false;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      rafId = requestAnimationFrame(compute);
    };

    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(rafId);
    };
  }, [reducedMotion, mountTubes, mountJelly]);

  if (reducedMotion) {
    return (
      <section style={{ background: "#fff", padding: "80px 0" }}>
        <div className="container">
          {BLOCKS.map((b, i) => (
            <div key={i} style={{ marginBottom: "64px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "48px", alignItems: "center" }}>
              <div>
                <h2 style={{ fontSize: "clamp(28px, 3.5vw, 52px)", fontWeight: 800, color: "#150e23", lineHeight: 1.15 }}>{b.title}</h2>
                <p style={{ marginTop: "20px", fontSize: "17px", color: "rgba(21,14,35,0.6)", lineHeight: 1.7 }}>{b.desc}</p>
              </div>
              <div style={{ height: "500px" }}>
                {i === 0 ? <AnimatedCards /> : i === 1 ? <TubesBackground /> : i === 2 ? <StackingCardsDemo /> : <JellySqueeze />}
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  const stickyStyle =
    phase === "pinned"
      ? { position: "fixed", top: 0, left: 0, right: 0 }
      : phase === "before"
      ? { position: "absolute", top: 0, left: 0, right: 0 }
      : { position: "absolute", bottom: 0, left: 0, right: 0 };

  return (
    <section ref={sectionRef} className="pin-section">
      <svg style={{ position: "absolute", width: 0, height: 0 }} aria-hidden="true">
        <defs>
          <filter id="thanos-scroll-dissolve" x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence ref={turbulenceRef} type="fractalNoise" baseFrequency="0.012" numOctaves="3" seed="7" result="noise" />
            <feDisplacementMap ref={displacementRef} in="SourceGraphic" in2="noise" scale="0" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id="tubes-scroll-dissolve" x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence ref={tubesTurbulenceRef} type="fractalNoise" baseFrequency="0.014" numOctaves="3" seed="11" result="tubesNoise" />
            <feDisplacementMap ref={tubesDisplacementRef} in="SourceGraphic" in2="tubesNoise" scale="0" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id="stacking-scroll-dissolve" x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence ref={stackingTurbulenceRef} type="fractalNoise" baseFrequency="0.013" numOctaves="3" seed="17" result="stackingNoise" />
            <feDisplacementMap ref={stackingDisplacementRef} in="SourceGraphic" in2="stackingNoise" scale="0" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id="jelly-scroll-dissolve" x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence ref={jellyTurbulenceRef} type="fractalNoise" baseFrequency="0.013" numOctaves="3" seed="23" result="jellyNoise" />
            <feDisplacementMap ref={jellyDisplacementRef} in="SourceGraphic" in2="jellyNoise" scale="0" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      <div ref={stickyRef} className="pin-sticky" style={stickyStyle}>
        <div className="pin-grid">
          <div className="pin-text">
            <div ref={block1Ref} className="pin-block" style={{ opacity: 0 }}>
              <h2>{BLOCKS[0].title}</h2>
              <p>{BLOCKS[0].desc}</p>
            </div>
            <div ref={block2Ref} className="pin-block" style={{ opacity: 0 }}>
              <h2>{BLOCKS[1].title}</h2>
              <p>{BLOCKS[1].desc}</p>
            </div>
            <div ref={block3Ref} className="pin-block" style={{ opacity: 0 }}>
              <h2>{BLOCKS[2].title}</h2>
              <p>{BLOCKS[2].desc}</p>
            </div>
            <div ref={block4Ref} className="pin-block" style={{ opacity: 0 }}>
              <h2>{BLOCKS[3].title}</h2>
              <p>{BLOCKS[3].desc}</p>
            </div>
          </div>

          <div className="pin-cards">
            <div ref={cardsRef} className="cards-dissolve" style={{ opacity: 0 }}>
              <AnimatedCards activeRef={cardsActiveRef} />
            </div>
            <div ref={tubesRef} className="tubes-layer" style={{ opacity: 0, pointerEvents: "none" }}>
              {mountTubes && <TubesBackground />}
            </div>
            <div ref={stackingWrapperRef} className="stacking-layer" style={{ opacity: 0 }}>
              <StackingCardsDemo ref={stackingRef} />
            </div>
            <div ref={jellyRef} className="jelly-layer" style={{ opacity: 0, pointerEvents: "none" }}>
              {mountJelly && <JellySqueeze activeRef={jellyActiveRef} />}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .pin-section {
          position: relative;
          height: 620vh;
          background: #fff;
        }
        .pin-sticky {
          height: 100vh;
          overflow: hidden;
          background: #fff;
        }
        .pin-grid {
          width: 100%;
          height: 100%;
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 48px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
          align-items: center;
        }
        .pin-text {
          position: relative;
          height: 60vh;
        }
        .pin-block {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          will-change: opacity, transform;
        }
        .pin-block h2 {
          font-size: clamp(28px, 3.6vw, 56px);
          font-weight: 800;
          line-height: 1.1;
          margin: 0 0 20px 0;
          background-image: linear-gradient(to right, #600b56 0%, #270f31 30%, #efa238 73%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
        }
        .pin-block p {
          font-size: clamp(15px, 1.2vw, 18px);
          color: rgba(21,14,35,0.7);
          line-height: 1.65;
          margin: 0;
          max-width: 520px;
        }
        .pin-cards {
          position: relative;
          height: 80vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .cards-dissolve {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          will-change: opacity, transform;
        }
        .tubes-layer {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          will-change: opacity;
          border-radius: 16px;
          overflow: hidden;
        }
        .stacking-layer {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          will-change: opacity;
        }
        .jelly-layer {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          will-change: opacity;
          border-radius: 16px;
          overflow: hidden;
        }
        @media (max-width: 900px) {
          .pin-section { height: 540vh; }
          .pin-grid {
            grid-template-columns: 1fr;
            gap: 24px;
            padding: 0 24px;
            align-content: center;
          }
          .pin-text { height: auto; min-height: 28vh; }
          .pin-cards { height: 50vh; }
          .pin-block h2 { font-size: clamp(24px, 6vw, 36px); }
          .pin-block p { font-size: 15px; }
        }
      `}</style>
    </section>
  );
}
