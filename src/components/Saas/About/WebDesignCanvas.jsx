"use client";

import { useEffect, useRef } from "react";

const ASSET_URL = "/images/services/web-design-studio.png";
const ACCENT = "99, 240, 122";

function drawAmbient(context, width, height, elapsed, pointerX, pointerY, reduceMotion) {
  const phase = reduceMotion ? 0 : elapsed * 0.00035;
  const centerX = width * (0.5 + pointerX * 0.025);
  const centerY = height * (0.48 + pointerY * 0.018);
  const radius = Math.max(width, height) * 0.58;
  const glow = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);

  glow.addColorStop(0, `rgba(${ACCENT}, ${0.12 + Math.sin(phase) * 0.018})`);
  glow.addColorStop(0.42, `rgba(${ACCENT}, .035)`);
  glow.addColorStop(1, `rgba(${ACCENT}, 0)`);
  context.fillStyle = glow;
  context.fillRect(0, 0, width, height);

  context.save();
  context.strokeStyle = "rgba(29, 29, 29, .1)";
  context.lineWidth = 1;
  context.setLineDash([2, 7]);
  const gridSize = Math.max(34, Math.min(width, height) / 9);
  const driftX = (phase * 11) % gridSize;
  const driftY = (phase * 7) % gridSize;

  for (let x = -gridSize + driftX; x < width + gridSize; x += gridSize) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, height);
    context.stroke();
  }

  for (let y = -gridSize + driftY; y < height + gridSize; y += gridSize) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(width, y);
    context.stroke();
  }
  context.restore();

  for (let index = 0; index < 12; index += 1) {
    const seed = index * 1.917;
    const x = ((Math.sin(seed * 2.3) + 1) * 0.5 * width + phase * (8 + index)) % width;
    const baseY = (Math.cos(seed * 1.7) + 1) * 0.5 * height;
    const y = baseY + Math.sin(phase * 2 + seed) * 8;
    const alpha = 0.12 + (index % 4) * 0.045;

    context.fillStyle = `rgba(${ACCENT}, ${alpha})`;
    context.beginPath();
    context.arc(x, y, 1 + (index % 3) * 0.45, 0, Math.PI * 2);
    context.fill();
  }
}

function drawProduct(context, image, width, height, elapsed, pointerX, pointerY, reduceMotion) {
  const phase = reduceMotion ? 0 : elapsed * 0.00065;
  const maxWidth = width * 1.03;
  const maxHeight = height * 0.9;
  const scale = Math.min(maxWidth / image.naturalWidth, maxHeight / image.naturalHeight);
  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;
  const floatY = reduceMotion ? 0 : Math.sin(phase * 1.35) * Math.min(7, height * 0.012);
  const x = (width - drawWidth) / 2 + pointerX * Math.min(12, width * 0.025);
  const y = (height - drawHeight) / 2 + floatY + pointerY * Math.min(9, height * 0.018);

  context.save();
  context.globalAlpha = 0.22;
  context.filter = "blur(13px)";
  context.fillStyle = `rgba(${ACCENT}, .7)`;
  context.beginPath();
  context.ellipse(width * 0.51, y + drawHeight * 0.88, drawWidth * 0.32, drawHeight * 0.045, 0, 0, Math.PI * 2);
  context.fill();
  context.restore();

  context.save();
  context.shadowColor = "rgba(4, 12, 8, .26)";
  context.shadowBlur = 28;
  context.shadowOffsetY = 18;
  context.drawImage(image, x, y, drawWidth, drawHeight);
  context.restore();

  const reflection = context.createLinearGradient(x, y, x + drawWidth, y + drawHeight);
  reflection.addColorStop(0.2, "rgba(255, 255, 255, 0)");
  reflection.addColorStop(0.48, "rgba(255, 255, 255, .14)");
  reflection.addColorStop(0.56, "rgba(255, 255, 255, 0)");
  context.save();
  context.globalCompositeOperation = "screen";
  context.fillStyle = reflection;
  context.beginPath();
  context.moveTo(x + drawWidth * 0.18, y + drawHeight * 0.08);
  context.lineTo(x + drawWidth * 0.42, y + drawHeight * 0.08);
  context.lineTo(x + drawWidth * 0.83, y + drawHeight * 0.82);
  context.lineTo(x + drawWidth * 0.63, y + drawHeight * 0.82);
  context.closePath();
  context.fill();
  context.restore();
}

export default function WebDesignCanvas() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return undefined;

    const image = new Image();
    let width = 0;
    let height = 0;
    let dpr = 1;
    let raf = null;
    let running = true;
    let visible = true;
    let imageReady = false;
    let pointerX = 0;
    let pointerY = 0;
    let pointerTargetX = 0;
    let pointerTargetY = 0;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const startedAt = performance.now();

    const render = (elapsed = 0) => {
      if (!width || !height) return;
      const context = canvas.getContext("2d");
      if (!context) return;

      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, width, height);
      drawAmbient(context, width, height, elapsed, pointerX, pointerY, reduceMotion);
      if (imageReady) drawProduct(context, image, width, height, elapsed, pointerX, pointerY, reduceMotion);
    };

    const resize = () => {
      const bounds = container.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;

      width = bounds.width;
      height = bounds.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      render(reduceMotion ? 0 : performance.now() - startedAt);
    };

    const frame = (now) => {
      raf = null;
      if (!running || !visible || reduceMotion) return;
      pointerX += (pointerTargetX - pointerX) * 0.055;
      pointerY += (pointerTargetY - pointerY) * 0.055;
      render(now - startedAt);
      raf = requestAnimationFrame(frame);
    };

    const startAnimation = () => {
      if (!reduceMotion && running && visible && !raf) raf = requestAnimationFrame(frame);
    };

    const stopAnimation = () => {
      if (!raf) return;
      cancelAnimationFrame(raf);
      raf = null;
    };

    const handlePointerMove = (event) => {
      const bounds = container.getBoundingClientRect();
      pointerTargetX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
      pointerTargetY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
    };

    const handlePointerLeave = () => {
      pointerTargetX = 0;
      pointerTargetY = 0;
    };

    image.decoding = "async";
    image.onload = () => {
      imageReady = true;
      render(reduceMotion ? 0 : performance.now() - startedAt);
    };
    image.src = ASSET_URL;

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) startAnimation(); else stopAnimation();
    }, { threshold: 0.05 });
    visibilityObserver.observe(container);

    container.addEventListener("pointermove", handlePointerMove);
    container.addEventListener("pointerleave", handlePointerLeave);
    startAnimation();

    return () => {
      running = false;
      image.onload = null;
      stopAnimation();
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", background: "transparent" }}
    >
      <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />
    </div>
  );
}
