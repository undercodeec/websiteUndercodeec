"use client";

import { useEffect, useRef } from "react";

const INK = "29, 29, 29";
const PAPER = "229, 228, 224";
const WINE = "112, 0, 71";

function roundedRect(context, x, y, width, height, radius) {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + safeRadius, y);
  context.arcTo(x + width, y, x + width, y + height, safeRadius);
  context.arcTo(x + width, y + height, x, y + height, safeRadius);
  context.arcTo(x, y + height, x, y, safeRadius);
  context.arcTo(x, y, x + width, y, safeRadius);
  context.closePath();
}

function circle(context, x, y, radius, fill) {
  context.fillStyle = fill;
  context.beginPath();
  context.arc(x, y, radius, 0, Math.PI * 2);
  context.fill();
}

function line(context, x1, y1, x2, y2, stroke, width = 1) {
  context.strokeStyle = stroke;
  context.lineWidth = width;
  context.beginPath();
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.stroke();
}

function label(context, text, x, y, options = {}) {
  const { color = `rgba(${INK}, .7)`, size = 9, align = "center", weight = 600 } = options;
  context.fillStyle = color;
  context.font = `${weight} ${size}px Arial, sans-serif`;
  context.textAlign = align;
  context.textBaseline = "middle";
  context.fillText(text, x, y);
}

function drawCheck(context, x, y, accent) {
  circle(context, x, y, 6, `rgba(${accent}, .92)`);
  context.strokeStyle = `rgba(${PAPER}, .96)`;
  context.lineWidth = 1.4;
  context.beginPath();
  context.moveTo(x - 2.8, y);
  context.lineTo(x - .5, y + 2.5);
  context.lineTo(x + 3.5, y - 2.8);
  context.stroke();
}

function drawNode(context, node, elapsed, index, reduceMotion) {
  const bob = reduceMotion ? 0 : Math.sin(elapsed * .0012 + index * 1.3) * 2;
  const y = node.y + bob;
  context.fillStyle = `rgba(${PAPER}, .82)`;
  roundedRect(context, node.x - node.width / 2, y - 22, node.width, 44, 7);
  context.fill();
  context.strokeStyle = `rgba(${node.accent}, .62)`;
  context.lineWidth = 1;
  context.stroke();
  circle(context, node.x - node.width / 2 + 14, y, 4, `rgba(${node.accent}, .9)`);
  label(context, node.label, node.x + 5, y, { size: 9 });
  drawCheck(context, node.x + node.width / 2 - 13, y, node.accent);
  return y;
}

function drawScene(context, width, height, elapsed, pointerX, pointerY, reduceMotion) {
  const phase = reduceMotion ? 0 : elapsed * .001;
  const centerX = width * .5 + pointerX * 4;
  const centerY = height * .48 + pointerY * 4;
  const nodeWidth = Math.max(100, Math.min(138, width * .3));
  const nodes = [
    { label: "ESTRATEGIA", x: width * .23, y: height * .2, width: nodeWidth, accent: WINE },
    { label: "DISEÑO", x: width * .77, y: height * .2, width: nodeWidth, accent: "240, 107, 168" },
    { label: "DESARROLLO", x: width * .77, y: height * .73, width: nodeWidth, accent: "56, 148, 210" },
    { label: "CALIDAD", x: width * .23, y: height * .73, width: nodeWidth, accent: "201, 157, 0" },
  ];

  context.clearRect(0, 0, width, height);
  const grid = Math.max(30, Math.min(width, height) / 8);
  context.save();
  context.setLineDash([2, 8]);
  for (let x = grid / 2; x < width; x += grid) line(context, x, 0, x, height, `rgba(${INK}, .09)`);
  for (let y = grid / 2; y < height; y += grid) line(context, 0, y, width, y, `rgba(${INK}, .09)`);
  context.restore();

  context.save();
  context.setLineDash([3, 6]);
  context.strokeStyle = `rgba(${WINE}, .32)`;
  context.lineWidth = 1;
  context.beginPath();
  context.ellipse(centerX, centerY, width * .31, height * .31, 0, 0, Math.PI * 2);
  context.stroke();
  context.restore();

  nodes.forEach((node, index) => {
    const animatedY = drawNode(context, node, elapsed, index, reduceMotion);
    line(context, node.x, animatedY, centerX, centerY, `rgba(${node.accent}, .3)`);
    const progress = reduceMotion ? .62 : (phase * .2 + index * .24) % 1;
    circle(
      context,
      node.x + (centerX - node.x) * progress,
      animatedY + (centerY - animatedY) * progress,
      2.8,
      `rgba(${node.accent}, .95)`,
    );
  });

  const pulse = reduceMotion ? .45 : (phase * .32) % 1;
  context.strokeStyle = `rgba(${WINE}, ${.38 * (1 - pulse)})`;
  context.lineWidth = 1;
  context.beginPath();
  context.arc(centerX, centerY, 48 + pulse * 27, 0, Math.PI * 2);
  context.stroke();

  circle(context, centerX, centerY, 48, `rgba(${PAPER}, .94)`);
  context.strokeStyle = `rgba(${WINE}, .72)`;
  context.lineWidth = 1;
  context.beginPath();
  context.arc(centerX, centerY, 48, 0, Math.PI * 2);
  context.stroke();
  circle(context, centerX, centerY - 10, 12, `rgba(${WINE}, .9)`);
  label(context, "PRODUCTO", centerX, centerY + 15, { color: `rgba(${INK}, .76)`, size: 10 });
  label(context, "CON PROPÓSITO", centerX, centerY + 28, { color: `rgba(${INK}, .5)`, size: 7 });

  const railY = height * .9;
  line(context, width * .14, railY, width * .86, railY, `rgba(${INK}, .24)`);
  const travel = reduceMotion ? .72 : (phase * .16) % 1;
  circle(context, width * .14 + width * .72 * travel, railY, 4, `rgba(${WINE}, .92)`);
  label(context, "MEDIR", width * .14, railY - 14, { align: "left", size: 8 });
  label(context, "APRENDER", centerX, railY - 14, { size: 8 });
  label(context, "MEJORAR", width * .86, railY - 14, { align: "right", size: 8 });
}

export default function TrajectoryPhilosophyCanvas() {
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
    let pointerX = 0;
    let pointerY = 0;
    let targetX = 0;
    let targetY = 0;
    let lastFrame = 0;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const startedAt = performance.now();

    const render = (elapsed) => {
      if (!width || !height) return;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawScene(context, width, height, elapsed, pointerX, pointerY, reduceMotion);
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
        pointerX += (targetX - pointerX) * .08;
        pointerY += (targetY - pointerY) * .08;
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
    const handlePointerMove = (event) => {
      const bounds = container.getBoundingClientRect();
      targetX = (event.clientX - bounds.left) / bounds.width - .5;
      targetY = (event.clientY - bounds.top) / bounds.height - .5;
    };
    const handlePointerLeave = () => {
      targetX = 0;
      targetY = 0;
    };

    resizeObserver.observe(container);
    visibilityObserver.observe(container);
    container.addEventListener("pointermove", handlePointerMove, { passive: true });
    container.addEventListener("pointerleave", handlePointerLeave);
    resize();
    if (reduceMotion) render(0);
    else start();

    return () => {
      stop();
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, []);

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%", overflow: "hidden", contain: "strict" }}>
      <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />
    </div>
  );
}
