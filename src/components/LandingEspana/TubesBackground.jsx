"use client";

import React, { useEffect, useRef } from "react";

const randomColors = (count) =>
  new Array(count)
    .fill(0)
    .map(() => "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0"));

export default function TubesBackground({ children, enableClickInteraction = true }) {
  const canvasRef = useRef(null);
  const tubesRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      if (!canvasRef.current) return;
      try {
        const mod = await import(
          /* webpackIgnore: true */ "https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js"
        );
        const TubesCursor = mod.default;
        if (!mounted) return;
        const app = TubesCursor(canvasRef.current, {
          tubes: {
            colors: ["#600B56", "#b428a0", "#150e23"],
            lights: {
              intensity: 200,
              colors: ["#ff66e0", "#b428a0", "#600B56", "#150e23"],
            },
          },
        });
        tubesRef.current = app;
      } catch (e) {
        console.error("TubesBackground failed to load:", e);
      }
    };

    init();
    return () => {
      mounted = false;
    };
  }, []);

  const handleClick = () => {
    if (!enableClickInteraction || !tubesRef.current) return;
    tubesRef.current.tubes.setColors(randomColors(3));
    tubesRef.current.tubes.setLightsColors(randomColors(4));
  };

  return (
    <div
      onClick={handleClick}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: "400px",
        overflow: "hidden",
        background: "#ffffff",
        borderRadius: "16px",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          display: "block",
          touchAction: "none",
          filter: "invert(1) hue-rotate(180deg)",
        }}
      />
      <div style={{ position: "relative", zIndex: 10, width: "100%", height: "100%", pointerEvents: "none" }}>
        {children}
      </div>
    </div>
  );
}
