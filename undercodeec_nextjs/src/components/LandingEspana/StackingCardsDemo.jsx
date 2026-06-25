"use client";

import React, { forwardRef, useImperativeHandle, useRef } from "react";

const CARDS = [
  {
    tag: "01 — Diseño",
    title: "Tipografía cinética",
    desc: "Letras que respiran y se animan con el scroll para guiar la lectura.",
    gradient: "linear-gradient(135deg, #600B56 0%, #150e23 100%)",
    image: "/landing-preview/img/portfolio/1.png",
  },
  {
    tag: "02 — Interacción",
    title: "Parallax 3D al cursor",
    desc: "Capas con profundidad real que reaccionan al movimiento del mouse.",
    gradient: "linear-gradient(135deg, #1a0033 0%, #ff007a 100%)",
    image: "/landing-preview/img/portfolio/2.png",
  },
  {
    tag: "03 — Narrativa",
    title: "Scroll-pin sticky",
    desc: "Capítulos visuales que se cuentan a tu ritmo mientras bajas.",
    gradient: "linear-gradient(135deg, #0f172a 0%, #6366f1 100%)",
    image: "/landing-preview/img/portfolio/3.png",
  },
  {
    tag: "04 — Cine",
    title: "Particle dissolve",
    desc: "Transiciones cinematográficas estilo Thanos para impactar.",
    gradient: "linear-gradient(135deg, #150e23 0%, #b428a0 100%)",
    image: "/landing-preview/img/portfolio/4.png",
  },
];

const SEGMENTS = [
  { in: 0.0 },
  { in: 0.0 },
  { in: 0.22 },
  { in: 0.45 },
];
const SEG_DURATION = 0.55;

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
const easeInOutQuad = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

const StackingCardsDemo = forwardRef(function StackingCardsDemo(props, ref) {
  const cardRefs = useRef([]);

  useImperativeHandle(ref, () => ({
    setProgress: (p) => {
      const n = CARDS.length;
      for (let i = 0; i < n; i++) {
        const el = cardRefs.current[i];
        if (!el) continue;

        let cardP;
        if (i === 0) {
          cardP = 1;
        } else {
          const start = SEGMENTS[i].in;
          const end = start + SEG_DURATION;
          const t = Math.max(0, Math.min(1, (p - start) / (end - start)));
          cardP = easeOutCubic(t);
        }

        let cardsAfterIn = 0;
        for (let j = i + 1; j < n; j++) {
          const sStart = SEGMENTS[j].in;
          const sEnd = sStart + SEG_DURATION;
          const tj = Math.max(0, Math.min(1, (p - sStart) / (sEnd - sStart)));
          cardsAfterIn += easeInOutQuad(tj);
        }

        const translateYPct = (1 - cardP) * 110;
        const scale = 1 - cardsAfterIn * 0.035;
        const translateYStack = -cardsAfterIn * 12;
        const brightness = Math.max(0.72, 1 - cardsAfterIn * 0.09);

        el.style.transform = `translateY(${translateYPct.toFixed(2)}%) translateY(${translateYStack.toFixed(2)}px) scale(${scale.toFixed(3)})`;
        el.style.opacity = cardP > 0.01 ? "1" : "0";
        el.style.zIndex = String(10 + i);
        el.style.filter = `brightness(${brightness.toFixed(3)})`;
      }
    },
  }));

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: "500px",
        borderRadius: "16px",
        background: "#ffffff",
        perspective: "1400px",
      }}
    >
      {CARDS.map((c, i) => (
        <div
          key={i}
          ref={(el) => {
            cardRefs.current[i] = el;
          }}
          style={{
            position: "absolute",
            left: "6%",
            right: "6%",
            top: "15%",
            aspectRatio: "16 / 10",
            borderRadius: "22px",
            background: c.gradient,
            color: "#fff",
            padding: "28px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            boxShadow: "0 30px 80px rgba(21, 14, 35, 0.35), inset 0 1px 1px rgba(255,255,255,0.18)",
            border: "1px solid rgba(255,255,255,0.1)",
            transform: "translateY(110%) scale(1)",
            opacity: 0,
            transformOrigin: "center top",
            willChange: "transform, opacity, filter",
            transition: "filter 0.4s ease",
            overflow: "hidden",
          }}
        >
          <img
            src={c.image}
            alt=""
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0.55,
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(180deg, rgba(21,14,35,0.05) 0%, rgba(21,14,35,0.55) 60%, rgba(21,14,35,0.85) 100%)",
              pointerEvents: "none",
            }}
          />
          <span style={{ position: "relative", fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", opacity: 0.85, marginBottom: "8px" }}>
            {c.tag}
          </span>
          <h3 style={{ position: "relative", fontSize: "clamp(22px, 2.4vw, 32px)", fontWeight: 800, margin: "0 0 8px 0", lineHeight: 1.1 }}>
            {c.title}
          </h3>
          <p style={{ position: "relative", fontSize: "14px", margin: 0, opacity: 0.92, lineHeight: 1.55 }}>
            {c.desc}
          </p>
        </div>
      ))}
    </div>
  );
});

export default StackingCardsDemo;
