"use client";

import React from "react";
import dynamic from "next/dynamic";

// WebGL only runs client-side — avoid SSR of the three.js canvas.
const GhostCursor = dynamic(
  () => import("@/components/LandingEspana/GhostCursor"),
  { ssr: false }
);

const GhostCursorSection = () => {
  return (
    <section className="ghost-section">
      {/* Background decoration */}
      <div className="ghost-section__bg" />

      {/* Centered copy (non-interactive so the cursor reads through it) */}
      <div className="ghost-section__content">
        <span className="ghost-section__eyebrow">Diseño con alma</span>
        <h2 className="ghost-section__title">
          Creatividad que deja huella
        </h2>
        <p className="ghost-section__subtitle">
          Mueve el cursor y siente el detalle. Así cuidamos cada interacción de
          tu proyecto: fluida, viva y memorable.
        </p>
      </div>

      {/* Ghost cursor trail */}
      <GhostCursor
        color="#c77dff"
        brightness={1.2}
        edgeIntensity={0}
        trailLength={20}
        inertia={0.4}
        grainIntensity={0.05}
        bloomStrength={0.5}
        bloomRadius={0.7}
        bloomThreshold={0}
        fadeDelayMs={200}
        fadeDurationMs={1000}
        zIndex={10}
      />

      <style jsx global>{`
        .ghost-section {
          position: relative;
          min-height: 72vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          background: #120a1f;
          color: #fff;
          overflow: hidden;
          padding: 80px 20px;
        }
        .ghost-section__bg {
          position: absolute;
          inset: 0;
          z-index: 0;
          background: radial-gradient(
              circle at 30% 30%,
              rgba(96, 11, 86, 0.35),
              transparent 55%
            ),
            radial-gradient(
              circle at 75% 70%,
              rgba(124, 58, 160, 0.3),
              transparent 55%
            ),
            #120a1f;
          pointer-events: none;
        }
        .ghost-section__content {
          position: relative;
          z-index: 20;
          max-width: 720px;
          pointer-events: none;
          user-select: none;
        }
        .ghost-section__eyebrow {
          display: inline-block;
          text-transform: uppercase;
          letter-spacing: 3px;
          font-size: 13px;
          font-weight: 700;
          color: #d6a9f0;
          margin-bottom: 16px;
        }
        .ghost-section__title {
          font-size: clamp(34px, 6vw, 64px);
          font-weight: 700;
          letter-spacing: -0.02em;
          line-height: 1.05;
          margin: 0 0 18px;
        }
        .ghost-section__subtitle {
          font-size: 18px;
          line-height: 1.7;
          color: rgba(255, 255, 255, 0.65);
          margin: 0 auto;
          max-width: 560px;
        }
      `}</style>
    </section>
  );
};

export default GhostCursorSection;
