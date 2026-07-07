"use client";

import React, { forwardRef, useImperativeHandle, useRef } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";

const MoonMini = dynamic(() => import("@/components/3D/MoonMini"), {
  ssr: false,
  loading: () => null,
});

const CARDS = [
  {
    tag: "01 - Understudio",
    title: "Understudio",
    desc: "Experiencias web, motion UI y productos digitales con identidad visual propia para marcas que necesitan destacar.",
    gradient: "linear-gradient(135deg, #f8f3ff 0%, #efe7f7 48%, #ffffff 100%)",
    image: "/landing-preview/img/portfolio/1.png",
    href: "https://understudio.undercodeec.com",
  },
  {
    tag: "02 - Demo 3D",
    title: "Demo-Moon",
    desc: "Miniatura interactiva del modelo lunar 3D integrada dentro del card para mostrar profundidad sin romper el layout.",
    gradient: "linear-gradient(135deg, #f7f7fb 0%, #ebe7f1 58%, #ffffff 100%)",
    image: "/landing-preview/img/portfolio/2.png",
    model: "moon",
  },
  {
    tag: "03 - Narrativa",
    title: "Scroll-pin sticky",
    desc: "Capitulos visuales que se cuentan a tu ritmo mientras bajas.",
    gradient: "linear-gradient(135deg, #0f172a 0%, #6366f1 100%)",
    image: "/landing-preview/img/portfolio/3.png",
  },
  {
    tag: "04 - Cine",
    title: "Particle dissolve",
    desc: "Transiciones cinematograficas estilo Thanos para impactar.",
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

const cardTextStyle = {
  color: "#150e23b3",
  maxWidth: "520px",
  margin: 0,
  fontSize: "max(15px, min(1.2vw, 18px))",
  lineHeight: 1.65,
};

const baseCardStyle = {
  position: "absolute",
  left: "6%",
  right: "6%",
  top: "15%",
  aspectRatio: "16 / 10",
  borderRadius: "22px",
  color: "#150e23",
  padding: "28px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-end",
  boxShadow: "0 30px 80px rgba(21, 14, 35, 0.22), inset 0 1px 1px rgba(255,255,255,0.55)",
  border: "1px solid rgba(21,14,35,0.08)",
  transform: "translateY(110%) scale(1)",
  opacity: 0,
  transformOrigin: "center top",
  willChange: "transform, opacity, filter",
  transition: "filter 0.4s ease",
  overflow: "hidden",
  textDecoration: "none",
};

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
      {CARDS.map((card, i) => {
        const CardTag = card.href ? "a" : "div";

        return (
          <CardTag
            key={i}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            href={card.href}
            target={card.href ? "_blank" : undefined}
            rel={card.href ? "noopener noreferrer" : undefined}
            style={{
              ...baseCardStyle,
              background: card.gradient,
              cursor: card.href ? "pointer" : "default",
            }}
          >
            <Image
              src={card.image}
              alt=""
              aria-hidden="true"
              fill
              sizes="(max-width: 768px) 88vw, 520px"
              style={{
                objectFit: "cover",
                opacity: card.model ? 0.18 : 0.22,
                pointerEvents: "none",
                filter: "saturate(0.7) contrast(0.9)",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(180deg, rgba(255,255,255,0.32) 0%, rgba(255,255,255,0.78) 58%, rgba(255,255,255,0.94) 100%)",
                pointerEvents: "none",
              }}
            />
            {card.model === "moon" && (
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  top: "18px",
                  right: "20px",
                  width: "min(38%, 190px)",
                  aspectRatio: "1",
                  borderRadius: "18px",
                  overflow: "hidden",
                  background: "radial-gradient(circle at 50% 50%, rgba(96,11,86,0.16), rgba(21,14,35,0.08) 55%, rgba(255,255,255,0.18) 100%)",
                  boxShadow: "inset 0 0 0 1px rgba(21,14,35,0.08), 0 18px 36px rgba(21,14,35,0.18)",
                  pointerEvents: "auto",
                }}
              >
                <MoonMini />
              </div>
            )}
            <span
              style={{
                position: "relative",
                color: "#150e23b3",
                fontSize: "11px",
                letterSpacing: "3px",
                textTransform: "uppercase",
                opacity: 0.85,
                marginBottom: "8px",
              }}
            >
              {card.tag}
            </span>
            <h3
              style={{
                position: "relative",
                color: "#150e23",
                fontSize: "clamp(22px, 2.4vw, 32px)",
                fontWeight: 800,
                margin: "0 0 8px 0",
                lineHeight: 1.1,
              }}
            >
              {card.title}
            </h3>
            <p style={{ position: "relative", ...cardTextStyle }}>
              {card.desc}
            </p>
          </CardTag>
        );
      })}
    </div>
  );
});

export default StackingCardsDemo;
