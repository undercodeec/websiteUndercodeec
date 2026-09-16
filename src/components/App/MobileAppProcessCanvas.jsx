"use client";

import { useEffect, useRef } from "react";

const STAGES = {
  "01": { accent: "112, 0, 71", type: "strategy" },
  "02": { accent: "240, 107, 168", type: "design" },
  "03": { accent: "120, 186, 230", type: "development" },
  "04": { accent: "250, 203, 14", type: "launch" },
};

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

function drawAmbient(context, width, height, elapsed, accent, pointerX, pointerY, reduceMotion) {
  const phase = reduceMotion ? 0 : elapsed * .00035;
  const centerX = width * (.5 + pointerX * .035);
  const centerY = height * (.5 + pointerY * .025);
  const radius = Math.max(width, height) * .68;
  const glow = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);

  glow.addColorStop(0, `rgba(${accent}, ${.12 + Math.sin(phase) * .02})`);
  glow.addColorStop(.55, `rgba(${accent}, .025)`);
  glow.addColorStop(1, `rgba(${accent}, 0)`);
  context.fillStyle = glow;
  context.fillRect(0, 0, width, height);

  context.save();
  context.strokeStyle = "rgba(29, 29, 29, .11)";
  context.lineWidth = 1;
  context.setLineDash([2, 7]);
  const size = Math.max(24, Math.min(width, height) / 6.5);
  const offset = (phase * 12) % size;

  for (let x = -size + offset; x < width + size; x += size) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, height);
    context.stroke();
  }

  for (let y = -size + offset; y < height + size; y += size) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(width, y);
    context.stroke();
  }

  context.restore();
}

function drawStrategy(context, width, height, elapsed, accent, reduceMotion) {
  const phase = reduceMotion ? 0 : elapsed * .001;
  const nodes = [
    [.22, .3, 1.2], [.5, .19, .8], [.78, .34, 1.5], [.32, .72, .7], [.63, .68, 1.1],
  ].map(([x, y, offset]) => ({
    x: width * x + Math.sin(phase + offset) * 4,
    y: height * y + Math.cos(phase * .8 + offset) * 4,
  }));
  const connections = [[0, 1], [1, 2], [0, 3], [1, 4], [2, 4], [3, 4], [0, 4]];

  context.save();
  context.lineWidth = 1.2;
  context.strokeStyle = `rgba(${accent}, .48)`;
  connections.forEach(([from, to], index) => {
    const start = nodes[from];
    const end = nodes[to];
    const bend = (index % 2 ? -1 : 1) * Math.min(width, height) * .07;
    context.beginPath();
    context.moveTo(start.x, start.y);
    context.quadraticCurveTo((start.x + end.x) / 2, (start.y + end.y) / 2 + bend, end.x, end.y);
    context.stroke();
  });

  nodes.forEach((node, index) => {
    const pulse = reduceMotion ? 0 : ((phase * .38 + index / nodes.length) % 1);
    context.strokeStyle = `rgba(${accent}, ${.42 * (1 - pulse)})`;
    context.beginPath();
    context.arc(node.x, node.y, 7 + pulse * 17, 0, Math.PI * 2);
    context.stroke();
    context.fillStyle = `rgba(${accent}, .9)`;
    context.shadowColor = `rgba(${accent}, .75)`;
    context.shadowBlur = 10;
    context.beginPath();
    context.arc(node.x, node.y, 4, 0, Math.PI * 2);
    context.fill();
  });
  context.restore();
}

function drawDesign(context, width, height, elapsed, accent, reduceMotion) {
  const phase = reduceMotion ? 0 : elapsed * .0008;
  const cardWidth = width * .34;
  const cardHeight = height * .64;
  const cards = [
    { x: width * .18 + Math.sin(phase) * 4, y: height * .22, rotation: -.08 },
    { x: width * .48 + Math.cos(phase * .9) * 4, y: height * .14, rotation: .08 },
  ];

  context.save();
  cards.forEach((card, index) => {
    context.save();
    context.translate(card.x + cardWidth / 2, card.y + cardHeight / 2);
    context.rotate(card.rotation);
    context.translate(-cardWidth / 2, -cardHeight / 2);
    context.fillStyle = "rgba(229, 228, 224, .86)";
    context.shadowColor = "rgba(29, 29, 29, .16)";
    context.shadowBlur = 18;
    context.shadowOffsetY = 10;
    roundedRect(context, 0, 0, cardWidth, cardHeight, 12);
    context.fill();
    context.shadowColor = "transparent";
    context.strokeStyle = `rgba(${accent}, .58)`;
    context.lineWidth = 1.2;
    context.stroke();

    context.fillStyle = `rgba(${accent}, .75)`;
    roundedRect(context, cardWidth * .14, cardHeight * .12, cardWidth * .72, cardHeight * .17, 6);
    context.fill();
    context.fillStyle = "rgba(29, 29, 29, .18)";
    for (let line = 0; line < 3; line += 1) {
      roundedRect(context, cardWidth * .14, cardHeight * (.39 + line * .1), cardWidth * (line === 2 ? .45 : .68), 4, 2);
      context.fill();
    }
    context.fillStyle = `rgba(${accent}, .2)`;
    roundedRect(context, cardWidth * .14, cardHeight * .74, cardWidth * .72, cardHeight * .11, 5);
    context.fill();
    context.restore();

    if (index === 1) {
      const cursorX = card.x + cardWidth * (.2 + ((phase * .14) % .55));
      const cursorY = card.y + cardHeight * (.45 + Math.sin(phase * 2) * .1);
      context.fillStyle = `rgba(${accent}, .94)`;
      context.beginPath();
      context.moveTo(cursorX, cursorY);
      context.lineTo(cursorX + 10, cursorY + 23);
      context.lineTo(cursorX + 4, cursorY + 18);
      context.lineTo(cursorX - 2, cursorY + 27);
      context.closePath();
      context.fill();
    }
  });
  context.restore();
}

function drawDevelopment(context, width, height, elapsed, accent, reduceMotion) {
  const phase = reduceMotion ? 0 : elapsed * .001;
  const terminalX = width * .12;
  const terminalY = height * .18;
  const terminalWidth = width * .76;
  const terminalHeight = height * .62;
  const lines = ["const app = ready()", "build --ios --android", "✓ interface compiled", "deploy()"];

  context.save();
  context.fillStyle = "rgba(29, 29, 29, .92)";
  roundedRect(context, terminalX, terminalY, terminalWidth, terminalHeight, 10);
  context.fill();
  context.strokeStyle = `rgba(${accent}, .7)`;
  context.lineWidth = 1.2;
  context.stroke();
  context.fillStyle = `rgba(${accent}, .9)`;
  [0, 1, 2].forEach((index) => {
    context.beginPath();
    context.arc(terminalX + 15 + index * 10, terminalY + 15, 3, 0, Math.PI * 2);
    context.fill();
  });

  const fontSize = Math.max(8, Math.min(13, terminalWidth / 21));
  context.font = `500 ${fontSize}px ui-monospace, SFMono-Regular, Menlo, monospace`;
  context.textBaseline = "middle";
  lines.forEach((line, index) => {
    const visibleLength = reduceMotion ? line.length : Math.min(line.length, Math.floor((phase * 6 + index * 5) % (line.length + 7)));
    context.fillStyle = index === 2 ? `rgba(${accent}, .95)` : "rgba(229, 228, 224, .8)";
    context.fillText(`${index === 2 ? "✓" : ">"} ${line.slice(0, visibleLength)}`, terminalX + 17, terminalY + 49 + index * fontSize * 1.85);
  });

  const progress = reduceMotion ? .72 : (Math.sin(phase * 2) + 1) / 2;
  context.fillStyle = "rgba(229, 228, 224, .16)";
  roundedRect(context, terminalX + 17, terminalY + terminalHeight - 30, terminalWidth - 34, 6, 3);
  context.fill();
  context.fillStyle = `rgba(${accent}, .95)`;
  roundedRect(context, terminalX + 17, terminalY + terminalHeight - 30, (terminalWidth - 34) * (.35 + progress * .55), 6, 3);
  context.fill();
  context.restore();
}

function drawLaunch(context, width, height, elapsed, accent, reduceMotion) {
  const phase = reduceMotion ? 0 : elapsed * .001;
  const phoneWidth = width * .26;
  const phoneHeight = height * .63;
  const x = width * .18 + Math.sin(phase * .8) * 3;
  const y = height * .2 + Math.cos(phase) * 3;

  context.save();
  context.fillStyle = "rgba(29, 29, 29, .9)";
  roundedRect(context, x, y, phoneWidth, phoneHeight, 13);
  context.fill();
  context.fillStyle = "rgba(229, 228, 224, .92)";
  roundedRect(context, x + 4, y + 6, phoneWidth - 8, phoneHeight - 12, 9);
  context.fill();
  context.fillStyle = `rgba(${accent}, .86)`;
  roundedRect(context, x + phoneWidth * .18, y + phoneHeight * .2, phoneWidth * .64, phoneHeight * .2, 7);
  context.fill();
  context.strokeStyle = `rgba(${accent}, .9)`;
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(x + phoneWidth * .18, y + phoneHeight * .72);
  context.lineTo(x + phoneWidth * .42, y + phoneHeight * .56);
  context.lineTo(x + phoneWidth * .62, y + phoneHeight * .64);
  context.lineTo(x + phoneWidth * .82, y + phoneHeight * .42);
  context.stroke();

  const chartX = width * .53;
  const chartY = height * .28;
  const chartWidth = width * .32;
  const chartHeight = height * .43;
  context.strokeStyle = "rgba(29, 29, 29, .18)";
  context.lineWidth = 1;
  for (let line = 0; line < 4; line += 1) {
    const yLine = chartY + line * chartHeight / 3;
    context.beginPath();
    context.moveTo(chartX, yLine);
    context.lineTo(chartX + chartWidth, yLine);
    context.stroke();
  }

  const rise = reduceMotion ? .75 : .62 + Math.sin(phase * 1.2) * .1;
  context.strokeStyle = `rgba(${accent}, .95)`;
  context.lineWidth = 2.5;
  context.beginPath();
  context.moveTo(chartX, chartY + chartHeight * .82);
  context.bezierCurveTo(chartX + chartWidth * .25, chartY + chartHeight * .68, chartX + chartWidth * .47, chartY + chartHeight * .84, chartX + chartWidth, chartY + chartHeight * (1 - rise));
  context.stroke();
  context.fillStyle = `rgba(${accent}, .95)`;
  context.beginPath();
  context.arc(chartX + chartWidth, chartY + chartHeight * (1 - rise), 4, 0, Math.PI * 2);
  context.fill();
  context.restore();
}

function drawScene(context, stage, width, height, elapsed, pointerX, pointerY, reduceMotion) {
  const { accent, type } = STAGES[stage] || STAGES["01"];
  const insetX = Math.max(10, width * .075);
  const insetY = Math.max(8, height * .09);
  const sceneWidth = Math.max(1, width - insetX * 2);
  const sceneHeight = Math.max(1, height - insetY * 2);

  context.clearRect(0, 0, width, height);
  drawAmbient(context, width, height, elapsed, accent, pointerX, pointerY, reduceMotion);

  context.save();
  context.translate(insetX + pointerX * 2.5, insetY + pointerY * 2.5);

  if (type === "strategy") drawStrategy(context, sceneWidth, sceneHeight, elapsed, accent, reduceMotion);
  if (type === "design") drawDesign(context, sceneWidth, sceneHeight, elapsed, accent, reduceMotion);
  if (type === "development") drawDevelopment(context, sceneWidth, sceneHeight, elapsed, accent, reduceMotion);
  if (type === "launch") drawLaunch(context, sceneWidth, sceneHeight, elapsed, accent, reduceMotion);

  context.restore();
}

export default function MobileAppProcessCanvas({ stage }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return undefined;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let raf = null;
    let lastRenderedAt = 0;
    let running = true;
    let visible = true;
    let pointerX = 0;
    let pointerY = 0;
    let pointerTargetX = 0;
    let pointerTargetY = 0;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const startedAt = performance.now();
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return undefined;

    const render = (elapsed = 0) => {
      if (!width || !height) return;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawScene(context, stage, width, height, elapsed, pointerX, pointerY, reduceMotion);
    };

    const resize = () => {
      const bounds = container.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;

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

    const frame = (now) => {
      raf = null;
      if (!running || !visible || reduceMotion) return;
      if (now - lastRenderedAt >= 1000 / 30) {
        pointerX += (pointerTargetX - pointerX) * .09;
        pointerY += (pointerTargetY - pointerY) * .09;
        render(now - startedAt);
        lastRenderedAt = now;
      }
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
      pointerTargetX = ((event.clientX - bounds.left) / bounds.width - .5) * 2;
      pointerTargetY = ((event.clientY - bounds.top) / bounds.height - .5) * 2;
    };

    const handlePointerLeave = () => {
      pointerTargetX = 0;
      pointerTargetY = 0;
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) startAnimation(); else stopAnimation();
    }, { threshold: .12 });
    visibilityObserver.observe(container);

    container.addEventListener("pointermove", handlePointerMove);
    container.addEventListener("pointerleave", handlePointerLeave);
    startAnimation();

    return () => {
      running = false;
      stopAnimation();
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [stage]);

  return (
    <div
      ref={containerRef}
      style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", background: "transparent", contain: "strict" }}
    >
      <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%", pointerEvents: "none" }} />
    </div>
  );
}
