"use client";

import { useEffect, useRef } from "react";
import { getEspanaServiceCanvasScene } from "./espanaServiceCanvasScenes.mjs";

const ACCENTS = {
  "corporate-web": "112,0,71",
  ecommerce: "240,107,168",
  "mobile-app": "56,148,210",
  "business-software": "201,157,0",
};

function box(context, x, y, width, height, fill, radius = 6) {
  context.fillStyle = fill;
  context.beginPath();
  context.roundRect(x, y, width, height, Math.min(radius, width / 2, height / 2));
  context.fill();
}

function strokeBox(context, x, y, width, height, color, radius = 6) {
  context.strokeStyle = color;
  context.beginPath();
  context.roundRect(x, y, width, height, Math.min(radius, width / 2, height / 2));
  context.stroke();
}

function line(context, x1, y1, x2, y2, color, width = 1) {
  context.strokeStyle = color;
  context.lineWidth = width;
  context.beginPath();
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.stroke();
}

function dot(context, x, y, radius, color) {
  context.fillStyle = color;
  context.beginPath();
  context.arc(x, y, radius, 0, Math.PI * 2);
  context.fill();
}

function text(context, value, x, y, color, align = "left") {
  context.fillStyle = color;
  context.font = "600 10px Arial, sans-serif";
  context.textAlign = align;
  context.textBaseline = "middle";
  context.fillText(value, x, y);
}

function theme() {
  return document.documentElement.classList.contains("dark")
    ? { ink: "rgba(255,255,255,.78)", panel: "rgba(255,255,255,.1)", grid: "rgba(255,255,255,.12)" }
    : { ink: "rgba(29,29,29,.72)", panel: "rgba(255,255,255,.7)", grid: "rgba(29,29,29,.1)" };
}

function backdrop(context, width, height, accent, colors) {
  const step = Math.max(25, Math.min(width, height) / 4);
  context.clearRect(0, 0, width, height);
  context.setLineDash([2, 7]);
  for (let x = step / 2; x < width; x += step) line(context, x, 0, x, height, colors.grid);
  for (let y = step / 2; y < height; y += step) line(context, 0, y, width, y, colors.grid);
  context.setLineDash([]);
  const glow = context.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width * .6);
  glow.addColorStop(0, `rgba(${accent},.16)`);
  glow.addColorStop(1, `rgba(${accent},0)`);
  context.fillStyle = glow;
  context.fillRect(0, 0, width, height);
}

function drawCorporateWeb(context, width, height, time, accent, colors) {
  const x = width * .11;
  const y = height * .17;
  const w = width * .78;
  const h = height * .57;
  box(context, x, y, w, h, colors.panel, 9);
  strokeBox(context, x, y, w, h, `rgba(${accent},.82)`, 9);
  line(context, x, y + 22, x + w, y + 22, colors.grid);
  [0, 1, 2].forEach((index) => dot(context, x + 11 + index * 8, y + 11, 2.3, `rgba(${accent},.${index === 0 ? 9 : 45})`));
  box(context, x + w * .1, y + h * .3, w * .4, 11, `rgba(${accent},.85)`, 3);
  box(context, x + w * .1, y + h * .47, w * .55, 6, colors.grid, 2);
  box(context, x + w * .1, y + h * .6, w * .43, 6, colors.grid, 2);
  const phoneX = x + w * .69;
  const phoneY = y + h * .29 + Math.sin(time * .0015) * 2;
  box(context, phoneX, phoneY, w * .16, h * .51, `rgba(${accent},.18)`, 6);
  strokeBox(context, phoneX, phoneY, w * .16, h * .51, `rgba(${accent},.78)`, 6);
  box(context, phoneX + w * .03, phoneY + h * .11, w * .1, h * .19, `rgba(${accent},.8)`, 2);
  text(context, "WEB + MOVIL", width / 2, height * .88, colors.ink, "center");
}

function drawEcommerce(context, width, height, time, accent, colors) {
  const cardWidth = width * .21;
  const gap = width * .055;
  const start = (width - cardWidth * 3 - gap * 2) / 2;
  [0, 1, 2].forEach((index) => {
    const x = start + index * (cardWidth + gap);
    const y = height * (.25 + (index === 1 ? Math.sin(time * .0018) * .025 : 0));
    box(context, x, y, cardWidth, height * .39, colors.panel, 7);
    strokeBox(context, x, y, cardWidth, height * .39, `rgba(${accent},.7)`, 7);
    box(context, x + cardWidth * .16, y + height * .07, cardWidth * .68, height * .14, `rgba(${accent},.${index === 1 ? 8 : 35})`, 3);
    box(context, x + cardWidth * .16, y + height * .27, cardWidth * .5, 6, colors.grid, 2);
    text(context, `0${index + 1}`, x + cardWidth / 2, y + height * .34, colors.ink, "center");
  });
  const cartX = width * .77;
  const cartY = height * .76;
  line(context, cartX - 17, cartY - 10, cartX - 10, cartY + 6, `rgba(${accent},.94)`, 2);
  line(context, cartX - 10, cartY + 6, cartX + 12, cartY + 6, `rgba(${accent},.94)`, 2);
  dot(context, cartX - 3, cartY + 13, 3, `rgba(${accent},.94)`);
  dot(context, cartX + 9, cartY + 13, 3, `rgba(${accent},.94)`);
  text(context, "CATALOGO / COMPRA", width / 2, height * .9, colors.ink, "center");
}

function drawMobileApp(context, width, height, time, accent, colors) {
  const phoneW = width * .25;
  const phoneH = height * .68;
  const x = (width - phoneW) / 2;
  const y = height * .16;
  box(context, x, y, phoneW, phoneH, colors.panel, 12);
  strokeBox(context, x, y, phoneW, phoneH, `rgba(${accent},.86)`, 12);
  box(context, x + phoneW * .12, y + phoneH * .15, phoneW * .76, phoneH * .23, `rgba(${accent},.8)`, 4);
  [0, 1, 2].forEach((index) => box(context, x + phoneW * .15, y + phoneH * (.49 + index * .12), phoneW * (.65 - index * .08), 6, colors.grid, 2));
  [[width * .14, height * .31], [width * .86, height * .31], [width * .15, height * .7], [width * .85, height * .7]].forEach(([pointX, pointY], index) => {
    line(context, x + phoneW / 2, y + phoneH / 2, pointX, pointY, `rgba(${accent},.4)`);
    dot(context, pointX, pointY + Math.sin(time * .0017 + index) * 3, 5, `rgba(${accent},.9)`);
  });
  text(context, "ANDROID / IOS", width / 2, height * .91, colors.ink, "center");
}

function drawBusinessSoftware(context, width, height, time, accent, colors) {
  const nodes = [[.23, .3, "VENTAS"], [.76, .3, "DATOS"], [.23, .72, "EQUIPO"], [.76, .72, "OPERACION"]];
  const centerX = width / 2;
  const centerY = height * .51;
  nodes.forEach(([left, top, value], index) => {
    const x = width * left;
    const y = height * top;
    line(context, x, y, centerX, centerY, `rgba(${accent},.42)`);
    const progress = (time * .00045 + index * .23) % 1;
    dot(context, x + (centerX - x) * progress, y + (centerY - y) * progress, 2.5, `rgba(${accent},.96)`);
    box(context, x - 25, y - 10, 50, 20, colors.panel, 5);
    strokeBox(context, x - 25, y - 10, 50, 20, `rgba(${accent},.7)`, 5);
    text(context, value, x, y, colors.ink, "center");
  });
  box(context, centerX - 31, centerY - 14, 62, 28, `rgba(${accent},.9)`, 7);
  text(context, "SISTEMA", centerX, centerY, "white", "center");
  text(context, "PROCESOS CONECTADOS", width / 2, height * .91, colors.ink, "center");
}

function drawScene(context, scene, width, height, time) {
  const accent = ACCENTS[scene] ?? ACCENTS["corporate-web"];
  const colors = theme();
  backdrop(context, width, height, accent, colors);
  if (scene === "corporate-web") drawCorporateWeb(context, width, height, time, accent, colors);
  if (scene === "ecommerce") drawEcommerce(context, width, height, time, accent, colors);
  if (scene === "mobile-app") drawMobileApp(context, width, height, time, accent, colors);
  if (scene === "business-software") drawBusinessSoftware(context, width, height, time, accent, colors);
  if (["analysis", "planning", "building", "measurement", "proposal", "remote-work"].includes(scene)) {
    drawProjectScene(context, scene, width, height, time, accent, colors);
  }
}

function drawProjectScene(context, scene, width, height, time, accent, colors) {
  const x = width * .1;
  const y = height * .16;
  const w = width * .8;
  const h = height * .64;
  box(context, x, y, w, h, colors.panel, 10);
  strokeBox(context, x, y, w, h, `rgba(${accent},.8)`, 10);
  if (scene === "analysis") {
    [0, 1, 2].forEach((index) => {
      box(context, x + 18, y + 26 + index * 25, w * (.6 - index * .1), 8, colors.grid, 3);
    });
    const cx = width * .68;
    const cy = height * .52;
    context.beginPath();
    context.arc(cx, cy, 23, 0, Math.PI * 2);
    context.strokeStyle = `rgba(${accent},.95)`;
    context.lineWidth = 4;
    context.stroke();
    line(context, cx + 17, cy + 17, cx + 35, cy + 35, `rgba(${accent},.95)`, 5);
  } else if (scene === "measurement") {
    [0, 1, 2, 3, 4].forEach((index) => {
      const barH = 22 + index * 15 + Math.sin(time * .0015 + index) * 4;
      box(context, x + 22 + index * 33, y + h - 20 - barH, 19, barH, `rgba(${accent},.${index === 4 ? 9 : 5})`, 3);
    });
  } else if (scene === "remote-work") {
    [0, 1, 2].forEach((index) => {
      const px = x + 39 + index * 64;
      box(context, px - 23, y + 27, 46, 63, colors.grid, 6);
      dot(context, px, y + 47, 8, `rgba(${accent},.9)`);
      box(context, px - 12, y + 60, 24, 20, `rgba(${accent},.65)`, 7);
    });
    text(context, "MADRID / BARCELONA / VALENCIA", width / 2, y + h - 17, colors.ink, "center");
  } else {
    const headings = scene === "building" ? ["WEB", "APP", "DATOS"] : scene === "proposal" ? ["ALCANCE", "ENTREGAS", "SOPORTE"] : ["CONTENIDO", "FUNCIONES", "PRIORIDAD"];
    headings.forEach((heading, index) => {
      const top = y + 25 + index * 32;
      box(context, x + 15, top, w - 30, 24, index === 1 ? `rgba(${accent},.7)` : colors.grid, 4);
      text(context, heading, x + 28, top + 12, index === 1 ? "white" : colors.ink);
      text(context, scene === "building" ? "</>" : "✓", x + w - 31, top + 12, colors.ink, "center");
    });
  }
  const captions = { analysis: "OBJETIVOS Y NECESIDADES", planning: "ESTRUCTURA Y PRIORIDADES", building: "DESARROLLO E INTEGRACIONES", measurement: "RESULTADOS Y MEJORAS", proposal: "PROPUESTA A TU MEDIDA", "remote-work": "SESIONES Y ENTREGAS REMOTAS" };
  text(context, captions[scene], width / 2, height * .91, colors.ink, "center");
}

export default function EspanaServiceCanvas({ title, sceneId }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const scene = getEspanaServiceCanvasScene(title);
  const resolvedId = sceneId ?? scene?.id;

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas || !resolvedId) return undefined;
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return undefined;
    let width = 0; let height = 0; let dpr = 1; let frame = null; let visible = false;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const startedAt = performance.now();
    const render = (time) => {
      if (!width || !height) return;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, width, height);
      const scale = Math.min(width / 260, height / 220);
      context.translate((width - 260 * scale) / 2, (height - 220 * scale) / 2);
      context.scale(scale, scale);
      drawScene(context, resolvedId, 260, 220, time);
    };
    const resize = () => {
      const bounds = container.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      width = Math.round(bounds.width); height = Math.round(bounds.height); dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = width * dpr; canvas.height = height * dpr; render(reduceMotion ? 0 : performance.now() - startedAt);
    };
    const animate = (now) => { if (!visible || reduceMotion) return; render(now - startedAt); frame = window.requestAnimationFrame(animate); };
    const resizeObserver = new ResizeObserver(resize);
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !reduceMotion && !frame) frame = window.requestAnimationFrame(animate);
      if (!visible && frame) { window.cancelAnimationFrame(frame); frame = null; }
    }, { threshold: .01 });
    resizeObserver.observe(container); observer.observe(container); resize();
    return () => { if (frame) window.cancelAnimationFrame(frame); resizeObserver.disconnect(); observer.disconnect(); };
  }, [resolvedId]);

  return <div ref={containerRef} data-espana-service-canvas={resolvedId} style={{ width: "100%", height: "100%", overflow: "hidden" }}><canvas ref={canvasRef} aria-label={scene?.label ?? title} role="img" style={{ display: "block", width: "100%", height: "100%" }} /></div>;
}
