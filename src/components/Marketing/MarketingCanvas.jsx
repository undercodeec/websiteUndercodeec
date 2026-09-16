"use client";

import { useEffect, useRef } from "react";

const SCENES = {
  intro: { accent: "112, 0, 71", type: "ecosystem" },
  "01": { accent: "112, 0, 71", type: "connect" },
  "02": { accent: "240, 107, 168", type: "nurture" },
  "03": { accent: "56, 148, 210", type: "convert" },
  "04": { accent: "201, 157, 0", type: "delight" },
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

function circle(context, x, y, radius, color) {
  context.fillStyle = color;
  context.beginPath();
  context.arc(x, y, radius, 0, Math.PI * 2);
  context.fill();
}

function line(context, fromX, fromY, toX, toY, color, width = 1) {
  context.strokeStyle = color;
  context.lineWidth = width;
  context.beginPath();
  context.moveTo(fromX, fromY);
  context.lineTo(toX, toY);
  context.stroke();
}

function label(context, text, x, y, color = "rgba(29, 29, 29, .72)", align = "left") {
  context.fillStyle = color;
  context.font = "600 9px Arial, sans-serif";
  context.textAlign = align;
  context.textBaseline = "middle";
  context.fillText(text, x, y);
}

function drawBackdrop(context, width, height, elapsed, accent, pointerX, pointerY, reduceMotion, showGlow = true) {
  const phase = reduceMotion ? 0 : elapsed * .00038;
  const gridSize = Math.max(24, Math.min(width, height) / 6.5);
  const offset = (phase * 14) % gridSize;

  context.clearRect(0, 0, width, height);
  if (showGlow) {
    const glowX = width * (.5 + pointerX * .07);
    const glowY = height * (.48 + pointerY * .06);
    const glow = context.createRadialGradient(glowX, glowY, 0, glowX, glowY, Math.max(width, height) * .72);
    glow.addColorStop(0, `rgba(${accent}, .14)`);
    glow.addColorStop(.58, `rgba(${accent}, .024)`);
    glow.addColorStop(1, `rgba(${accent}, 0)`);
    context.fillStyle = glow;
    context.fillRect(0, 0, width, height);
  }

  context.save();
  context.strokeStyle = "rgba(29, 29, 29, .105)";
  context.lineWidth = 1;
  context.setLineDash([2, 7]);
  for (let x = -gridSize + offset; x < width + gridSize; x += gridSize) line(context, x, 0, x, height, context.strokeStyle);
  for (let y = -gridSize + offset; y < height + gridSize; y += gridSize) line(context, 0, y, width, y, context.strokeStyle);
  context.restore();
}

function drawPerson(context, x, y, radius, fill, stroke) {
  circle(context, x, y - radius * .42, radius * .34, fill);
  context.fillStyle = fill;
  roundedRect(context, x - radius * .52, y, radius * 1.04, radius * .68, radius * .34);
  context.fill();
  context.strokeStyle = stroke;
  context.lineWidth = 1;
  context.stroke();
}

function drawSourceCard(context, text, x, y, width, accent, elapsed, offset) {
  const bob = Math.sin(elapsed * .001 + offset) * 2;
  context.save();
  context.translate(0, bob);
  context.fillStyle = "rgba(229, 228, 224, .8)";
  roundedRect(context, x, y, width, 24, 5);
  context.fill();
  context.strokeStyle = `rgba(${accent}, .58)`;
  context.lineWidth = 1;
  context.stroke();
  circle(context, x + 10, y + 12, 3.3, `rgba(${accent}, .88)`);
  label(context, text, x + 18, y + 12);
  context.restore();
}

function drawConnect(context, width, height, elapsed, accent, reduceMotion) {
  const phase = reduceMotion ? 0 : elapsed * .001;
  const centerX = width * .52;
  const centerY = height * .55;
  const sourceWidth = Math.max(42, width * .2);
  const sources = [
    [width * .1, height * .18, "SEO", .2],
    [width * .68, height * .18, "ADS", 1.4],
    [width * .1, height * .72, "SOCIAL", 2.2],
  ];

  sources.forEach(([x, y, text, offset]) => {
    const targetX = x + sourceWidth / 2;
    const targetY = y + 12 + Math.sin(phase + offset) * 2;
    line(context, targetX, targetY, centerX, centerY, `rgba(${accent}, .36)`);
    drawSourceCard(context, text, x, y, sourceWidth, accent, elapsed, offset);
  });

  const pulse = reduceMotion ? .35 : (phase * .42) % 1;
  context.strokeStyle = `rgba(${accent}, ${.4 * (1 - pulse)})`;
  context.lineWidth = 1;
  context.beginPath();
  context.arc(centerX, centerY, 18 + pulse * 17, 0, Math.PI * 2);
  context.stroke();
  drawPerson(context, centerX, centerY + 3, 15, `rgba(${accent}, .9)`, "rgba(29, 29, 29, .42)");
  label(context, "AUDIENCIA", centerX, centerY + 31, "rgba(29, 29, 29, .66)", "center");
}

function drawNurture(context, width, height, elapsed, accent, reduceMotion) {
  const phase = reduceMotion ? 0 : elapsed * .001;
  const cardWidth = width * .64;
  const cardHeight = height * .64;
  const x = (width - cardWidth) / 2;
  const y = height * .17;
  const breathe = reduceMotion ? 0 : Math.sin(phase * 1.5) * 2;

  context.fillStyle = "rgba(229, 228, 224, .84)";
  roundedRect(context, x, y, cardWidth, cardHeight, 12);
  context.fill();
  context.strokeStyle = `rgba(${accent}, .62)`;
  context.stroke();
  label(context, "CONVERSACION", x + 14, y + 16, "rgba(29, 29, 29, .58)");

  const messages = [
    [x + cardWidth * .13, y + cardHeight * .3, cardWidth * .47, "rgba(29, 29, 29, .14)"],
    [x + cardWidth * .38, y + cardHeight * .48, cardWidth * .48, `rgba(${accent}, .66)`],
    [x + cardWidth * .13, y + cardHeight * .66, cardWidth * .38, "rgba(29, 29, 29, .14)"],
  ];
  messages.forEach(([messageX, messageY, messageWidth, color], index) => {
    context.fillStyle = color;
    roundedRect(context, messageX, messageY, messageWidth, 17, 8);
    context.fill();
    if (index === 1) label(context, "INFO UTIL", messageX + 9, messageY + 8.5, "rgba(229, 228, 224, .9)");
  });

  const heartX = x + cardWidth * .82;
  const heartY = y + cardHeight * .18 + breathe;
  context.fillStyle = `rgba(${accent}, .92)`;
  context.beginPath();
  context.moveTo(heartX, heartY + 10);
  context.bezierCurveTo(heartX - 20, heartY - 2, heartX - 9, heartY - 15, heartX, heartY - 4);
  context.bezierCurveTo(heartX + 9, heartY - 15, heartX + 20, heartY - 2, heartX, heartY + 10);
  context.fill();
  label(context, "LEAD", heartX, y + cardHeight + 18, "rgba(29, 29, 29, .66)", "center");
}

function drawConvert(context, width, height, elapsed, accent, reduceMotion) {
  const phase = reduceMotion ? 0 : elapsed * .001;
  const columns = ["INTERES", "CRM", "DECISION"];
  const columnWidth = width * .21;
  const gap = width * .055;
  const startX = (width - (columnWidth * 3 + gap * 2)) / 2;
  const top = height * .23;

  columns.forEach((title, index) => {
    const x = startX + index * (columnWidth + gap);
    const fill = index === 2 ? `rgba(${accent}, .18)` : "rgba(229, 228, 224, .62)";
    context.fillStyle = fill;
    roundedRect(context, x, top, columnWidth, height * .5, 7);
    context.fill();
    context.strokeStyle = index === 2 ? `rgba(${accent}, .8)` : "rgba(29, 29, 29, .2)";
    context.stroke();
    label(context, title, x + columnWidth / 2, top + 14, "rgba(29, 29, 29, .68)", "center");

    const bars = index + 1;
    for (let bar = 0; bar < bars; bar += 1) {
      const progress = reduceMotion ? 1 : .7 + Math.sin(phase * 1.6 + index + bar) * .18;
      context.fillStyle = index === 2 ? `rgba(${accent}, .78)` : "rgba(29, 29, 29, .22)";
      roundedRect(context, x + 8, top + 29 + bar * 18, (columnWidth - 16) * progress, 8, 3);
      context.fill();
    }
  });

  const checkX = startX + columnWidth * 3 + gap * 2 - 16;
  const checkY = top + height * .5 - 17;
  circle(context, checkX, checkY, 12, `rgba(${accent}, .92)`);
  context.strokeStyle = "rgba(229, 228, 224, .96)";
  context.lineWidth = 1.8;
  context.beginPath();
  context.moveTo(checkX - 5, checkY);
  context.lineTo(checkX - 1, checkY + 4);
  context.lineTo(checkX + 6, checkY - 5);
  context.stroke();
}

function drawDelight(context, width, height, elapsed, accent, reduceMotion) {
  const phase = reduceMotion ? 0 : elapsed * .001;
  const centerX = width * .5;
  const centerY = height * .52;
  const orbit = Math.min(width, height) * .24;
  const people = [0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].map((base, index) => {
    const angle = base + Math.sin(phase * .65) * .1;
    return [centerX + Math.cos(angle) * orbit, centerY + Math.sin(angle) * orbit, index];
  });

  context.strokeStyle = `rgba(${accent}, .42)`;
  context.setLineDash([3, 5]);
  context.beginPath();
  context.arc(centerX, centerY, orbit, 0, Math.PI * 2);
  context.stroke();
  context.setLineDash([]);
  people.forEach(([x, y]) => line(context, centerX, centerY, x, y, `rgba(${accent}, .32)`));
  drawPerson(context, centerX, centerY + 2, 17, `rgba(${accent}, .92)`, "rgba(29, 29, 29, .35)");
  people.forEach(([x, y, index]) => drawPerson(context, x, y + 2, 10, index === 1 ? "rgba(240, 107, 168, .88)" : `rgba(${accent}, .8)`, "rgba(29, 29, 29, .3)"));

  context.fillStyle = `rgba(${accent}, .92)`;
  context.font = "700 18px Arial, sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText("* * *", centerX, height * .16);
  label(context, "RECOMENDACION", centerX, height * .86, "rgba(29, 29, 29, .66)", "center");
}

function drawEcosystem(context, width, height, elapsed, accent, reduceMotion) {
  const phase = reduceMotion ? 0 : elapsed * .001;
  const centerX = width * .5;
  const sourceY = height * .13;
  const sourceWidth = width * .23;
  const sourceGap = width * .035;
  const sourceStartX = (width - sourceWidth * 3 - sourceGap * 2) / 2;
  const websiteX = width * .12;
  const websiteY = height * .3;
  const websiteWidth = width * .76;
  const websiteHeight = height * .23;

  [["SEO", 0], ["CONTENIDO", 1], ["REDES", 2]].forEach(([text, index]) => {
    const x = sourceStartX + index * (sourceWidth + sourceGap);
    const y = sourceY + (reduceMotion ? 0 : Math.sin(phase * 1.2 + index) * 2);
    const sourceCenterX = x + sourceWidth / 2;
    context.fillStyle = "rgba(229, 228, 224, .72)";
    roundedRect(context, x, y, sourceWidth, 27, 5);
    context.fill();
    context.strokeStyle = `rgba(${accent}, .56)`;
    context.stroke();
    label(context, text, sourceCenterX, y + 13.5, "rgba(29, 29, 29, .74)", "center");
    line(context, sourceCenterX, y + 27, centerX, websiteY, `rgba(${accent}, .38)`);

    const travel = reduceMotion ? .72 : (phase * .34 + index * .26) % 1;
    circle(
      context,
      sourceCenterX + (centerX - sourceCenterX) * travel,
      y + 27 + (websiteY - y - 27) * travel,
      2.5,
      `rgba(${accent}, .9)`,
    );
  });

  context.fillStyle = "rgba(229, 228, 224, .66)";
  roundedRect(context, websiteX, websiteY, websiteWidth, websiteHeight, 8);
  context.fill();
  context.strokeStyle = `rgba(${accent}, .68)`;
  context.stroke();
  line(context, websiteX, websiteY + 25, websiteX + websiteWidth, websiteY + 25, "rgba(29, 29, 29, .18)");
  circle(context, websiteX + 12, websiteY + 12.5, 2.4, "rgba(240, 107, 168, .9)");
  circle(context, websiteX + 20, websiteY + 12.5, 2.4, "rgba(250, 203, 14, .95)");
  label(context, "TU NEGOCIO ONLINE", websiteX + 31, websiteY + 12.5, "rgba(29, 29, 29, .68)");

  context.fillStyle = `rgba(${accent}, .82)`;
  roundedRect(context, websiteX + websiteWidth * .09, websiteY + websiteHeight * .39, websiteWidth * .34, 9, 3);
  context.fill();
  context.fillStyle = "rgba(29, 29, 29, .13)";
  roundedRect(context, websiteX + websiteWidth * .09, websiteY + websiteHeight * .58, websiteWidth * .5, 6, 2);
  context.fill();
  roundedRect(context, websiteX + websiteWidth * .09, websiteY + websiteHeight * .72, websiteWidth * .39, 6, 2);
  context.fill();
  context.strokeStyle = `rgba(${accent}, .5)`;
  context.beginPath();
  context.arc(websiteX + websiteWidth * .76, websiteY + websiteHeight * .58, websiteHeight * .19, 0, Math.PI * 2);
  context.stroke();
  line(context, websiteX + websiteWidth * .8, websiteY + websiteHeight * .72, websiteX + websiteWidth * .87, websiteY + websiteHeight * .84, `rgba(${accent}, .5)`, 2);

  const stages = [
    ["VISITAS", .68, .62, "rgba(29, 29, 29, .12)"],
    ["LEADS", .5, .72, `rgba(${accent}, .32)`],
    ["VENTAS", .32, .82, `rgba(${accent}, .9)`],
  ];
  stages.forEach(([text, scale, yScale, fill], index) => {
    const stageWidth = width * scale;
    const x = (width - stageWidth) / 2;
    const y = height * yScale;
    context.fillStyle = fill;
    roundedRect(context, x, y, stageWidth, 34, 7);
    context.fill();
    context.strokeStyle = index === 0 ? "rgba(29, 29, 29, .22)" : `rgba(${accent}, .62)`;
    context.stroke();
    label(context, text, centerX, y + 17, index === 2 ? "rgba(229, 228, 224, .96)" : "rgba(29, 29, 29, .72)", "center");
    if (index < stages.length - 1) {
      line(context, centerX, y + 34, centerX, height * stages[index + 1][2], `rgba(${accent}, .5)`);
    }
  });

  const conversionY = websiteY + websiteHeight;
  line(context, centerX, conversionY, centerX, height * stages[0][2], `rgba(${accent}, .5)`);
  const flow = reduceMotion ? .5 : (phase * .42) % 1;
  circle(context, centerX, conversionY + (height * stages[0][2] - conversionY) * flow, 3, `rgba(${accent}, .94)`);
  label(context, "ATRACCION  /  CONVERSION  /  CRECIMIENTO", centerX, height * .93, "rgba(29, 29, 29, .55)", "center");
}

function drawScene(context, scene, width, height, elapsed, pointerX, pointerY, reduceMotion) {
  const { accent, type } = SCENES[scene] || SCENES.intro;
  drawBackdrop(context, width, height, elapsed, accent, pointerX, pointerY, reduceMotion, type !== "ecosystem");
  context.save();
  context.translate(pointerX * 3, pointerY * 3);
  if (type === "ecosystem") drawEcosystem(context, width, height, elapsed, accent, reduceMotion);
  if (type === "connect") drawConnect(context, width, height, elapsed, accent, reduceMotion);
  if (type === "nurture") drawNurture(context, width, height, elapsed, accent, reduceMotion);
  if (type === "convert") drawConvert(context, width, height, elapsed, accent, reduceMotion);
  if (type === "delight") drawDelight(context, width, height, elapsed, accent, reduceMotion);
  context.restore();
}

export default function MarketingCanvas({ scene }) {
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
      drawScene(context, scene, width, height, elapsed, pointerX, pointerY, reduceMotion);
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

    const animate = (now) => {
      frameId = null;
      if (!visible || reduceMotion) return;
      if (now - lastFrame >= 1000 / 30) {
        pointerX += (targetX - pointerX) * .09;
        pointerY += (targetY - pointerY) * .09;
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
  }, [scene]);

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%", overflow: "hidden", contain: "strict" }}>
      <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%", pointerEvents: "none" }} />
    </div>
  );
}
