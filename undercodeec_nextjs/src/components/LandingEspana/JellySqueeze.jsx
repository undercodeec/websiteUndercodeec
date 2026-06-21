"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";

if (typeof window !== "undefined") {
  gsap.registerPlugin(Draggable);
}

export default function JellySqueeze({
  title = "Arrastra verticalmente para apachurrar",
  helper = "Suelta y mira cómo rebota",
  activeRef,
}) {
  const canvasRef = useRef(null);
  const dragTriggerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  const animState = useRef({
    totalFrames: 215,
    startFrame: 70,
    images: [],
    currentFrame: -1,
    dragFrame: 70,
    displayFrame: 70,
    dragSensitivity: 5.2,
    smoothing: 0.11,
    startTime: 0,
    rafId: 0,
    isMounted: false,
  });

  useEffect(() => {
    animState.current.isMounted = true;
    const totalFrames = animState.current.totalFrames;
    let loaded = 0;
    const images = [];

    for (let i = 0; i < totalFrames; i++) {
      if (!animState.current.isMounted) break;
      const img = new Image();
      img.src = `https://cerpow.github.io/cerpow-img/jelly/jelly_${i
        .toString()
        .padStart(5, "0")}.jpg`;
      const done = () => {
        loaded++;
        if (loaded === totalFrames) setIsLoading(false);
      };
      img.onload = done;
      img.onerror = done;
      images[i] = img;
    }
    animState.current.images = images;

    return () => {
      animState.current.isMounted = false;
      cancelAnimationFrame(animState.current.rafId);
    };
  }, []);

  useLayoutEffect(() => {
    if (isLoading || !canvasRef.current || !dragTriggerRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const state = animState.current;

    gsap.set(canvas, { y: state.startFrame / state.dragSensitivity });

    const clamp = (frame) =>
      Math.max(0, Math.min(state.totalFrames - 1, Math.floor(frame)));

    const setCanvasSize = () => {
      if (!canvas) return;
      const ratio = window.devicePixelRatio || 1;
      const width = canvas.clientWidth;
      const height = width * (3 / 4);
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      canvas.style.height = `${height}px`;
      if (ctx) {
        ctx.scale(ratio, ratio);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "medium";
      }
      state.currentFrame = -1;
    };
    setCanvasSize();
    window.addEventListener("resize", setCanvasSize);

    const draggable = Draggable.create(canvas, {
      trigger: dragTriggerRef.current,
      type: "y",
      inertia: true,
      bounds: {
        minY: 0,
        maxY: (state.totalFrames - 1) / state.dragSensitivity,
      },
      allowNativeTouchScrolling: false,
      dragResistance: 0.5,
      edgeResistance: 1,
      minDuration: 0.4,
      onDrag: function () {
        state.dragFrame = this.y * state.dragSensitivity;
      },
      onThrowUpdate: function () {
        state.dragFrame = this.y * state.dragSensitivity;
      },
    })[0];

    state.startTime = Date.now();
    const tick = () => {
      if (!state.isMounted) return;
      const paused =
        (activeRef && activeRef.current && activeRef.current.active === false) ||
        (typeof document !== "undefined" && document.hidden);
      if (paused) {
        // Reset startTime so dt doesn't explode on resume
        state.startTime = Date.now();
        state.rafId = requestAnimationFrame(tick);
        return;
      }

      const now = Date.now();
      const dt = (now - state.startTime) / 1000;
      state.startTime = now;

      const dampening = 1.0 - Math.exp(-state.smoothing * 60 * dt);
      state.displayFrame +=
        (state.dragFrame - state.displayFrame) * dampening;

      const newFrame = clamp(state.displayFrame);
      if (
        newFrame !== state.currentFrame &&
        state.images[newFrame]?.complete &&
        ctx
      ) {
        ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
        ctx.drawImage(
          state.images[newFrame],
          0,
          0,
          canvas.clientWidth,
          canvas.clientHeight
        );
        state.currentFrame = newFrame;
      }
      state.rafId = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      window.removeEventListener("resize", setCanvasSize);
      cancelAnimationFrame(state.rafId);
      draggable.kill();
    };
  }, [isLoading]);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        userSelect: "none",
        overflow: "hidden",
        background: "#ffffff",
        borderRadius: "16px",
        color: "#150e23",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "8%",
          zIndex: 20,
          pointerEvents: "none",
          opacity: isLoading ? 0 : 1,
          transition: "opacity 700ms ease",
          textAlign: "center",
        }}
      >
        <h3 style={{ fontSize: "17px", fontWeight: 600, margin: 0 }}>{title}</h3>
        <p style={{ fontSize: "13px", margin: "6px 0 0", opacity: 0.7 }}>
          {helper}
        </p>
      </div>

      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "520px",
          aspectRatio: "4 / 3",
          zIndex: 10,
          padding: "0 16px",
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "clamp(22px, 6vw, 42px)",
            opacity: isLoading ? 0 : 1,
            transition: "opacity 1s ease-out",
            transform: "scale3d(1,1,1)",
            background: "#ffffff",
            filter: "brightness(1.42) contrast(1.05)",
          }}
        />
        <div
          ref={dragTriggerRef}
          aria-label="Arrastra para apachurrar"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -49%)",
            width: "56%",
            height: "52%",
            borderRadius: "50%",
            cursor: "grab",
            zIndex: 20,
          }}
        />
      </div>

      {isLoading && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "90%",
            maxWidth: "150px",
            height: "2px",
            background: "rgba(21,14,35,0.18)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: "25%",
              height: "100%",
              background: "#150e23",
              animation: "jelly-loader 1.3s infinite alternate ease-in-out",
            }}
          />
        </div>
      )}

      <style jsx>{`
        @keyframes jelly-loader {
          0% {
            opacity: 0;
            transform: translateX(0%);
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translateX(300%);
          }
        }
      `}</style>
    </div>
  );
}
