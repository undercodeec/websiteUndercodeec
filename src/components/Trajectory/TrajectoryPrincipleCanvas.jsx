"use client";

import { useEffect, useRef } from "react";

const INK = "29, 29, 29";
const PAPER = "229, 228, 224";
const WINE = "112, 0, 71";

function roundedRect(context, x, y, width, height, radius) {
  context.beginPath();
  context.roundRect(x, y, width, height, Math.min(radius, width / 2, height / 2));
}

function circle(context, x, y, radius, fill) {
  context.fillStyle = fill;
  context.beginPath();
  context.arc(x, y, radius, 0, Math.PI * 2);
  context.fill();
}

function line(context, x1, y1, x2, y2, color, width = 1) {
  context.strokeStyle = color;
  context.lineWidth = width;
  context.beginPath();
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.stroke();
}

function label(context, text, x, y, align = "center") {
  context.fillStyle = `rgba(${INK}, .62)`;
  context.font = "600 8px Arial, sans-serif";
  context.textAlign = align;
  context.textBaseline = "middle";
  context.fillText(text, x, y);
}

function drawTailored(context, width, height, elapsed, reduceMotion) {
  const phase = reduceMotion ? 0 : elapsed * .001;
  const centerX = width * .5;
  const centerY = height * .52;
  const moduleSize = Math.min(width, height) * .18;
  const positions = [
    [centerX - moduleSize * 1.05, centerY - moduleSize * .52],
    [centerX, centerY - moduleSize * .52],
    [centerX - moduleSize * .52, centerY + moduleSize * .52],
  ];

  positions.forEach(([x, y], index) => {
    const distance = reduceMotion ? 0 : Math.sin(phase * 1.25 + index) * 3;
    context.fillStyle = index === 1 ? `rgba(${WINE}, .82)` : `rgba(${PAPER}, .72)`;
    roundedRect(context, x - moduleSize / 2 + distance, y - moduleSize / 2, moduleSize, moduleSize, 5);
    context.fill();
    context.strokeStyle = `rgba(${WINE}, .58)`;
    context.stroke();
    circle(context, x + distance, y, 2.5, index === 1 ? `rgba(${PAPER}, .92)` : `rgba(${WINE}, .86)`);
  });

  label(context, "MÓDULOS QUE ENCAJAN", centerX, height * .91);
}

function drawDecisions(context, width, height, elapsed, reduceMotion) {
  const phase = reduceMotion ? 0 : elapsed * .001;
  const startX = width * .12;
  const endX = width * .88;
  const y = height * .5;
  const checkpoints = [startX, width * .38, width * .64, endX];

  line(context, startX, y, endX, y, `rgba(${INK}, .22)`);
  checkpoints.forEach((x, index) => {
    circle(context, x, y, index === checkpoints.length - 1 ? 8 : 6, index === checkpoints.length - 1 ? `rgba(${WINE}, .9)` : `rgba(${PAPER}, .95)`);
    context.strokeStyle = `rgba(${WINE}, .65)`;
    context.beginPath();
    context.arc(x, y, index === checkpoints.length - 1 ? 8 : 6, 0, Math.PI * 2);
    context.stroke();
    if (index < checkpoints.length - 1) label(context, ["NECESIDAD", "ALCANCE", "VALOR"][index], x, y - 18);
  });

  const progress = reduceMotion ? .78 : (phase * .23) % 1;
  circle(context, startX + (endX - startX) * progress, y, 3.2, `rgba(${WINE}, .95)`);
  context.strokeStyle = `rgba(${PAPER}, .96)`;
  context.lineWidth = 1.4;
  context.beginPath();
  context.moveTo(endX - 3.5, y);
  context.lineTo(endX - .7, y + 3);
  context.lineTo(endX + 4, y - 3.5);
  context.stroke();
  label(context, "DECISIÓN CLARA", width * .5, height * .91);
}

function drawSupport(context, width, height, elapsed, reduceMotion) {
  const phase = reduceMotion ? 0 : elapsed * .001;
  const centerX = width * .5;
  const centerY = height * .49;
  const orbit = Math.min(width, height) * .3;

  context.save();
  context.setLineDash([3, 6]);
  context.strokeStyle = `rgba(${WINE}, .42)`;
  context.beginPath();
  context.arc(centerX, centerY, orbit, 0, Math.PI * 2);
  context.stroke();
  context.restore();

  circle(context, centerX, centerY, orbit * .48, `rgba(${PAPER}, .9)`);
  context.strokeStyle = `rgba(${WINE}, .65)`;
  context.beginPath();
  context.arc(centerX, centerY, orbit * .48, 0, Math.PI * 2);
  context.stroke();
  circle(context, centerX, centerY, 4, `rgba(${WINE}, .9)`);
  label(context, "ACTIVO", centerX, centerY + 15);

  const angle = reduceMotion ? -.7 : phase * .7;
  const orbitX = centerX + Math.cos(angle) * orbit;
  const orbitY = centerY + Math.sin(angle) * orbit;
  circle(context, orbitX, orbitY, 6, `rgba(${WINE}, .94)`);
  context.strokeStyle = `rgba(${WINE}, .24)`;
  context.beginPath();
  context.arc(orbitX, orbitY, 10 + (reduceMotion ? 0 : (Math.sin(phase * 2) + 1) * 3), 0, Math.PI * 2);
  context.stroke();
  label(context, "SEGUIMIENTO CONTINUO", centerX, height * .91);
}

function drawScene(context, scene, width, height, elapsed, reduceMotion) {
  context.clearRect(0, 0, width, height);
  const gridSize = Math.max(24, Math.min(width, height) / 4);
  context.save();
  context.setLineDash([2, 7]);
  for (let x = gridSize / 2; x < width; x += gridSize) line(context, x, 0, x, height, `rgba(${INK}, .08)`);
  for (let y = gridSize / 2; y < height; y += gridSize) line(context, 0, y, width, y, `rgba(${INK}, .08)`);
  context.restore();

  if (scene === "01") drawTailored(context, width, height, elapsed, reduceMotion);
  if (scene === "02") drawDecisions(context, width, height, elapsed, reduceMotion);
  if (scene === "03") drawSupport(context, width, height, elapsed, reduceMotion);
}

export default function TrajectoryPrincipleCanvas({ scene }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return undefined;
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return undefined;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let frameId = null;
    let visible = true;
    let lastFrame = 0;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const startedAt = performance.now();

    const render = (elapsed) => {
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawScene(context, scene, width, height, elapsed, reduceMotion);
    };
    const resize = () => {
      const bounds = container.getBoundingClientRect();
      const nextWidth = Math.max(1, Math.round(bounds.width));
      const nextHeight = Math.max(1, Math.round(bounds.height));
      const nextDpr = Math.min(window.devicePixelRatio || 1, 1.5);
      if (nextWidth === width && nextHeight === height && nextDpr === dpr) return;
      width = nextWidth;
      height = nextHeight;
      dpr = nextDpr;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      render(reduceMotion ? 0 : performance.now() - startedAt);
    };
    const animate = (now) => {
      frameId = null;
      if (!visible || reduceMotion) return;
      if (now - lastFrame >= 1000 / 30) {
        render(now - startedAt);
        lastFrame = now;
      }
      frameId = window.requestAnimationFrame(animate);
    };
    const start = () => {
      if (!reduceMotion && visible && !frameId) frameId = window.requestAnimationFrame(animate);
    };
    const stop = () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      frameId = null;
    };
    const resizeObserver = new ResizeObserver(resize);
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    }, { threshold: .01 });

    resizeObserver.observe(container);
    visibilityObserver.observe(container);
    resize();
    if (reduceMotion) render(0);
    else start();

    return () => {
      stop();
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
    };
  }, [scene]);

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%", overflow: "hidden", contain: "strict" }}>
      <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />
    </div>
  );
}
