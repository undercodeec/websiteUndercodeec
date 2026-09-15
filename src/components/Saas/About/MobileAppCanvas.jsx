"use client";

import { useEffect, useRef } from "react";
import { createMobileAppScene } from "./mobileAppScene.mjs";

const COLORS = {
  green: "#63f07a",
  greenSoft: "rgba(99, 240, 122, .22)",
  greenLine: "rgba(99, 240, 122, .58)",
  cream: "#e5e4e0",
  dark: "#08110c",
  panel: "rgba(11, 25, 16, .88)",
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

function paintRoundedRect(context, rect, { fill, stroke, lineWidth = 1, radius = 8 }) {
  roundedRect(context, rect.x, rect.y, rect.width, rect.height, radius);
  if (fill) {
    context.fillStyle = fill;
    context.fill();
  }
  if (stroke) {
    context.lineWidth = lineWidth;
    context.strokeStyle = stroke;
    context.stroke();
  }
}

function drawAmbient(context, scene) {
  const { width, height } = scene.viewport;
  const glow = context.createRadialGradient(width * 0.5, height * 0.48, 0, width * 0.5, height * 0.48, width * 0.52);
  glow.addColorStop(0, "rgba(99, 240, 122, .13)");
  glow.addColorStop(0.42, "rgba(99, 240, 122, .045)");
  glow.addColorStop(1, "rgba(99, 240, 122, 0)");
  context.fillStyle = glow;
  context.fillRect(0, 0, width, height);

  context.save();
  context.strokeStyle = "rgba(29, 29, 29, .12)";
  context.lineWidth = 1;
  context.setLineDash([2, 7]);
  const grid = Math.max(34, Math.min(width, height) / 9);
  for (let x = grid; x < width; x += grid) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, height);
    context.stroke();
  }
  for (let y = grid; y < height; y += grid) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(width, y);
    context.stroke();
  }
  context.restore();

  scene.particles.forEach((particle) => {
    context.fillStyle = `rgba(99, 240, 122, ${particle.alpha})`;
    context.beginPath();
    context.arc(particle.x, particle.y + particle.drift, particle.radius, 0, Math.PI * 2);
    context.fill();
  });

  context.save();
  context.strokeStyle = "rgba(99, 240, 122, .18)";
  context.lineWidth = 1;
  context.setLineDash([5, 8]);
  context.beginPath();
  context.ellipse(
    width * 0.5 + scene.parallax.x * 0.5,
    height * 0.5 + scene.parallax.y * 0.5,
    Math.min(width * 0.41, 205),
    Math.min(height * 0.36, 175),
    -0.32,
    0,
    Math.PI * 2,
  );
  context.stroke();
  context.restore();
}

function drawConnection(context, layer, scene, side) {
  const startX = side === "left" ? layer.x + layer.width : layer.x;
  const startY = layer.y + layer.height * 0.5;
  const endX = side === "left" ? scene.device.x : scene.device.x + scene.device.width;
  const endY = scene.device.y + scene.device.height * (side === "left" ? 0.42 : 0.56);

  context.save();
  context.strokeStyle = "rgba(99, 240, 122, .34)";
  context.lineWidth = 1;
  context.setLineDash([3, 5]);
  context.beginPath();
  context.moveTo(startX, startY);
  context.bezierCurveTo((startX + endX) / 2, startY, (startX + endX) / 2, endY, endX, endY);
  context.stroke();
  context.fillStyle = COLORS.green;
  context.beginPath();
  context.arc(startX, startY, 2.5, 0, Math.PI * 2);
  context.fill();
  context.restore();
}

function drawRearLayer(context, layer, phase) {
  const floatY = Math.sin(phase * 0.75 + (layer.kind === "overview" ? 0 : 1.8)) * 5;
  const centerX = layer.x + layer.width / 2;
  const centerY = layer.y + layer.height / 2 + floatY;

  context.save();
  context.translate(centerX, centerY);
  context.rotate(layer.rotation);
  context.globalAlpha = layer.alpha;

  const local = { x: -layer.width / 2, y: -layer.height / 2, width: layer.width, height: layer.height };
  context.shadowColor = "rgba(8, 17, 12, .22)";
  context.shadowBlur = 22;
  context.shadowOffsetY = 10;
  paintRoundedRect(context, local, {
    fill: "rgba(229, 228, 224, .86)",
    stroke: "rgba(99, 240, 122, .64)",
    lineWidth: 1.1,
    radius: 13,
  });
  context.shadowBlur = 0;
  context.shadowOffsetY = 0;

  context.fillStyle = "rgba(8, 17, 12, .78)";
  context.font = `600 ${Math.max(7, layer.width * 0.07)}px Arial, sans-serif`;
  context.textAlign = "left";
  context.fillText(layer.kind === "overview" ? "OVERVIEW" : "INSIGHTS", local.x + layer.width * 0.09, local.y + layer.height * 0.15);

  context.fillStyle = COLORS.green;
  context.beginPath();
  context.arc(local.x + layer.width * 0.86, local.y + layer.height * 0.13, Math.max(2, layer.width * 0.02), 0, Math.PI * 2);
  context.fill();

  if (layer.kind === "overview") {
    const gaugeX = local.x + layer.width * 0.29;
    const gaugeY = local.y + layer.height * 0.46;
    const radius = layer.width * 0.12;
    context.strokeStyle = "rgba(8, 17, 12, .14)";
    context.lineWidth = Math.max(3, layer.width * 0.035);
    context.beginPath();
    context.arc(gaugeX, gaugeY, radius, 0, Math.PI * 2);
    context.stroke();
    context.strokeStyle = COLORS.green;
    context.beginPath();
    context.arc(gaugeX, gaugeY, radius, -Math.PI / 2, Math.PI * (0.9 + Math.sin(phase) * 0.08));
    context.stroke();
    context.fillStyle = "rgba(8, 17, 12, .74)";
    context.font = `700 ${Math.max(8, layer.width * 0.09)}px Arial, sans-serif`;
    context.textAlign = "center";
    context.fillText("84%", gaugeX, gaugeY + 3);

    [0, 1, 2].forEach((index) => {
      const barY = local.y + layer.height * (0.34 + index * 0.16);
      context.fillStyle = "rgba(8, 17, 12, .13)";
      context.fillRect(local.x + layer.width * 0.52, barY, layer.width * 0.33, 3);
      context.fillStyle = index === 1 ? COLORS.green : "rgba(8, 17, 12, .48)";
      context.fillRect(local.x + layer.width * 0.52, barY, layer.width * (0.18 + index * 0.05), 3);
    });
  } else {
    const chartBottom = local.y + layer.height * 0.73;
    [0.28, 0.49, 0.36, 0.68, 0.84].forEach((amount, index) => {
      const barWidth = layer.width * 0.075;
      const barHeight = layer.height * amount * 0.48;
      const x = local.x + layer.width * (0.14 + index * 0.15);
      const barGradient = context.createLinearGradient(0, chartBottom - barHeight, 0, chartBottom);
      barGradient.addColorStop(0, COLORS.green);
      barGradient.addColorStop(1, "rgba(99, 240, 122, .14)");
      paintRoundedRect(context, { x, y: chartBottom - barHeight, width: barWidth, height: barHeight }, {
        fill: barGradient,
        radius: barWidth / 2,
      });
    });
  }
  context.restore();
}

function drawStatusIcon(context, kind, x, y, size, active) {
  const color = active ? COLORS.green : "rgba(229, 228, 224, .48)";
  context.save();
  context.strokeStyle = color;
  context.fillStyle = color;
  context.lineWidth = Math.max(1, size * 0.08);
  context.lineCap = "round";
  context.lineJoin = "round";

  if (kind === "home") {
    context.beginPath();
    context.moveTo(x - size * 0.32, y);
    context.lineTo(x, y - size * 0.28);
    context.lineTo(x + size * 0.32, y);
    context.lineTo(x + size * 0.24, y + size * 0.31);
    context.lineTo(x - size * 0.24, y + size * 0.31);
    context.closePath();
    context.stroke();
  } else if (kind === "chart") {
    [-0.25, 0, 0.25].forEach((offset, index) => {
      context.fillRect(x + size * offset - size * 0.055, y + size * (0.18 - index * 0.16), size * 0.11, size * (0.18 + index * 0.16));
    });
  } else if (kind === "wallet") {
    roundedRect(context, x - size * 0.31, y - size * 0.22, size * 0.62, size * 0.44, size * 0.09);
    context.stroke();
    context.beginPath();
    context.arc(x + size * 0.17, y, size * 0.035, 0, Math.PI * 2);
    context.fill();
  } else {
    context.beginPath();
    context.arc(x, y - size * 0.13, size * 0.12, 0, Math.PI * 2);
    context.stroke();
    context.beginPath();
    context.arc(x, y + size * 0.25, size * 0.27, Math.PI, Math.PI * 2);
    context.stroke();
  }
  context.restore();
}

function drawProductScreen(context, scene) {
  const { screen, device, phase } = scene;
  context.save();
  roundedRect(context, screen.x, screen.y, screen.width, screen.height, screen.radius);
  context.clip();

  const screenGradient = context.createLinearGradient(screen.x, screen.y, screen.x + screen.width, screen.y + screen.height);
  screenGradient.addColorStop(0, "#13231a");
  screenGradient.addColorStop(0.55, "#0a150f");
  screenGradient.addColorStop(1, "#050b07");
  context.fillStyle = screenGradient;
  context.fillRect(screen.x, screen.y, screen.width, screen.height);

  const sheen = context.createLinearGradient(screen.x, screen.y, screen.x + screen.width, screen.y);
  sheen.addColorStop(0, "rgba(255, 255, 255, .08)");
  sheen.addColorStop(0.28, "rgba(255, 255, 255, 0)");
  sheen.addColorStop(1, "rgba(99, 240, 122, .045)");
  context.fillStyle = sheen;
  context.fillRect(screen.x, screen.y, screen.width, screen.height);

  const unit = screen.width / 100;
  context.textBaseline = "middle";
  context.fillStyle = "rgba(229, 228, 224, .72)";
  context.font = `600 ${Math.max(6, unit * 5.4)}px Arial, sans-serif`;
  context.textAlign = "left";
  context.fillText("9:41", screen.x + unit * 8, screen.y + screen.height * 0.055);

  context.strokeStyle = "rgba(229, 228, 224, .7)";
  context.lineWidth = Math.max(0.8, unit * 0.6);
  context.beginPath();
  context.arc(screen.x + screen.width - unit * 17, screen.y + screen.height * 0.055, unit * 3.2, Math.PI * 1.15, Math.PI * 1.85);
  context.stroke();
  paintRoundedRect(context, {
    x: screen.x + screen.width - unit * 11,
    y: screen.y + screen.height * 0.044,
    width: unit * 6.5,
    height: unit * 2.8,
  }, { stroke: "rgba(229, 228, 224, .7)", radius: unit });

  const avatarX = screen.x + unit * 15;
  const avatarY = screen.y + screen.height * 0.15;
  context.fillStyle = COLORS.greenSoft;
  context.beginPath();
  context.arc(avatarX, avatarY, unit * 6.5, 0, Math.PI * 2);
  context.fill();
  context.strokeStyle = COLORS.greenLine;
  context.stroke();
  context.fillStyle = COLORS.green;
  context.beginPath();
  context.arc(avatarX, avatarY - unit * 1.4, unit * 1.8, 0, Math.PI * 2);
  context.fill();
  context.beginPath();
  context.arc(avatarX, avatarY + unit * 3.1, unit * 3.2, Math.PI, Math.PI * 2);
  context.fill();

  context.fillStyle = COLORS.cream;
  context.font = `600 ${Math.max(7, unit * 7.2)}px Arial, sans-serif`;
  context.fillText("Hola, Alex", screen.x + unit * 25, avatarY - unit * 2);
  context.fillStyle = "rgba(229, 228, 224, .44)";
  context.font = `500 ${Math.max(6, unit * 4.3)}px Arial, sans-serif`;
  context.fillText("Tu negocio en movimiento", screen.x + unit * 25, avatarY + unit * 4.2);

  const metric = {
    x: screen.x + unit * 8,
    y: screen.y + screen.height * 0.235,
    width: screen.width - unit * 16,
    height: screen.height * 0.265,
  };
  const metricGradient = context.createLinearGradient(metric.x, metric.y, metric.x + metric.width, metric.y + metric.height);
  metricGradient.addColorStop(0, "rgba(99, 240, 122, .22)");
  metricGradient.addColorStop(1, "rgba(99, 240, 122, .055)");
  paintRoundedRect(context, metric, { fill: metricGradient, stroke: "rgba(99, 240, 122, .38)", radius: unit * 7 });

  context.fillStyle = "rgba(229, 228, 224, .52)";
  context.font = `500 ${Math.max(6, unit * 4.1)}px Arial, sans-serif`;
  context.fillText("VENTAS DEL MES", metric.x + unit * 8, metric.y + metric.height * 0.2);
  context.fillStyle = COLORS.cream;
  context.font = `700 ${Math.max(11, unit * 12)}px Arial, sans-serif`;
  context.fillText("$24.8K", metric.x + unit * 8, metric.y + metric.height * 0.43);

  const badge = { x: metric.x + metric.width - unit * 29, y: metric.y + unit * 8, width: unit * 22, height: unit * 10 };
  paintRoundedRect(context, badge, { fill: COLORS.green, radius: badge.height / 2 });
  context.fillStyle = COLORS.dark;
  context.font = `700 ${Math.max(5.5, unit * 4.2)}px Arial, sans-serif`;
  context.textAlign = "center";
  context.fillText("+18.4%", badge.x + badge.width / 2, badge.y + badge.height / 2 + 0.5);

  const chartLeft = metric.x + unit * 8;
  const chartRight = metric.x + metric.width - unit * 8;
  const chartBottom = metric.y + metric.height * 0.84;
  const chartTop = metric.y + metric.height * 0.58;
  const points = Array.from({ length: 9 }, (_, index) => ({
    x: chartLeft + (chartRight - chartLeft) * (index / 8),
    y: chartBottom - (Math.sin(index * 1.08 + phase * 1.4) * 0.16 + index / 9) * (chartBottom - chartTop),
  }));
  const chartFill = context.createLinearGradient(0, chartTop, 0, chartBottom);
  chartFill.addColorStop(0, "rgba(99, 240, 122, .3)");
  chartFill.addColorStop(1, "rgba(99, 240, 122, 0)");
  context.beginPath();
  context.moveTo(points[0].x, chartBottom);
  points.forEach((point) => context.lineTo(point.x, point.y));
  context.lineTo(points.at(-1).x, chartBottom);
  context.closePath();
  context.fillStyle = chartFill;
  context.fill();
  context.beginPath();
  points.forEach((point, index) => {
    if (index === 0) context.moveTo(point.x, point.y); else context.lineTo(point.x, point.y);
  });
  context.strokeStyle = COLORS.green;
  context.lineWidth = Math.max(1, unit * 0.8);
  context.shadowColor = COLORS.green;
  context.shadowBlur = unit * 4;
  context.stroke();
  context.shadowBlur = 0;

  context.textAlign = "left";
  context.fillStyle = COLORS.cream;
  context.font = `600 ${Math.max(7, unit * 6)}px Arial, sans-serif`;
  context.fillText("Acciones rápidas", screen.x + unit * 8, screen.y + screen.height * 0.56);

  const actionY = screen.y + screen.height * 0.6;
  const actionGap = unit * 5;
  const actionWidth = (screen.width - unit * 16 - actionGap * 2) / 3;
  ["Enviar", "Cobrar", "Datos"].forEach((label, index) => {
    const actionX = screen.x + unit * 8 + index * (actionWidth + actionGap);
    paintRoundedRect(context, { x: actionX, y: actionY, width: actionWidth, height: screen.height * 0.105 }, {
      fill: index === 1 ? COLORS.green : "rgba(229, 228, 224, .07)",
      stroke: index === 1 ? null : "rgba(229, 228, 224, .14)",
      radius: unit * 5,
    });
    context.fillStyle = index === 1 ? COLORS.dark : COLORS.green;
    context.beginPath();
    context.arc(actionX + actionWidth / 2, actionY + screen.height * 0.032, unit * 3, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = index === 1 ? COLORS.dark : "rgba(229, 228, 224, .72)";
    context.font = `600 ${Math.max(5.5, unit * 4)}px Arial, sans-serif`;
    context.textAlign = "center";
    context.fillText(label, actionX + actionWidth / 2, actionY + screen.height * 0.076);
  });

  const activityY = screen.y + screen.height * 0.75;
  context.textAlign = "left";
  context.fillStyle = "rgba(229, 228, 224, .46)";
  context.font = `500 ${Math.max(6, unit * 4.1)}px Arial, sans-serif`;
  context.fillText("ACTIVIDAD RECIENTE", screen.x + unit * 8, activityY);
  paintRoundedRect(context, {
    x: screen.x + unit * 8,
    y: activityY + unit * 7,
    width: screen.width - unit * 16,
    height: screen.height * 0.085,
  }, { fill: "rgba(229, 228, 224, .055)", radius: unit * 4 });
  context.fillStyle = COLORS.green;
  context.beginPath();
  context.arc(screen.x + unit * 17, activityY + unit * 7 + screen.height * 0.042, unit * 3.3, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = COLORS.dark;
  context.font = `700 ${Math.max(6, unit * 4.8)}px Arial, sans-serif`;
  context.textAlign = "center";
  context.fillText("✓", screen.x + unit * 17, activityY + unit * 7 + screen.height * 0.042 + 0.5);
  context.fillStyle = "rgba(229, 228, 224, .76)";
  context.font = `600 ${Math.max(6, unit * 4.4)}px Arial, sans-serif`;
  context.textAlign = "left";
  context.fillText("Transferencia completada", screen.x + unit * 24, activityY + unit * 7 + screen.height * 0.033);
  context.fillStyle = "rgba(229, 228, 224, .34)";
  context.font = `500 ${Math.max(5, unit * 3.5)}px Arial, sans-serif`;
  context.fillText("Ahora mismo", screen.x + unit * 24, activityY + unit * 7 + screen.height * 0.058);

  const navY = screen.y + screen.height * 0.94;
  scene.navigation.forEach((item, index) => {
    const navX = screen.x + screen.width * (0.16 + index * 0.226);
    if (item.active) {
      context.fillStyle = "rgba(99, 240, 122, .12)";
      context.beginPath();
      context.arc(navX, navY, unit * 7, 0, Math.PI * 2);
      context.fill();
    }
    drawStatusIcon(context, item.kind, navX, navY, unit * 8, item.active);
  });

  context.restore();

  context.save();
  context.shadowColor = "rgba(99, 240, 122, .35)";
  context.shadowBlur = 22;
  roundedRect(context, screen.x, screen.y, screen.width, screen.height, screen.radius);
  context.strokeStyle = "rgba(99, 240, 122, .42)";
  context.lineWidth = 1;
  context.stroke();
  context.restore();

  const notchWidth = device.width * 0.28;
  paintRoundedRect(context, {
    x: device.x + (device.width - notchWidth) / 2,
    y: device.y + device.width * 0.07,
    width: notchWidth,
    height: Math.max(4, device.width * 0.024),
  }, { fill: "rgba(229, 228, 224, .52)", radius: device.width * 0.02 });
}

function drawDevice(context, scene) {
  const { device } = scene;
  context.save();
  context.shadowColor = "rgba(8, 17, 12, .38)";
  context.shadowBlur = 35;
  context.shadowOffsetY = 20;
  const frameGradient = context.createLinearGradient(device.x, device.y, device.x + device.width, device.y + device.height);
  frameGradient.addColorStop(0, "#21372a");
  frameGradient.addColorStop(0.22, "#07100b");
  frameGradient.addColorStop(0.75, "#050b07");
  frameGradient.addColorStop(1, "#294633");
  paintRoundedRect(context, device, {
    fill: frameGradient,
    stroke: "rgba(99, 240, 122, .72)",
    lineWidth: 1.4,
    radius: device.radius,
  });
  context.restore();

  context.save();
  roundedRect(context, device.x + 2, device.y + 2, device.width - 4, device.height - 4, device.radius - 2);
  context.strokeStyle = "rgba(229, 228, 224, .12)";
  context.lineWidth = 1;
  context.stroke();
  context.restore();

  drawProductScreen(context, scene);
}

function drawNotification(context, scene) {
  const { notification, device, viewport } = scene;
  if (notification.progress <= 0.01) return;

  const cardWidth = Math.min(172, Math.max(110, viewport.width * 0.35));
  const cardHeight = cardWidth * 0.31;
  const x = Math.min(viewport.width - cardWidth - 7, device.x + device.width * 0.72);
  const y = device.y + device.height * 0.12 - (1 - notification.progress) * 22;

  context.save();
  context.globalAlpha = notification.progress;
  context.shadowColor = "rgba(8, 17, 12, .3)";
  context.shadowBlur = 24;
  context.shadowOffsetY = 10;
  paintRoundedRect(context, { x, y, width: cardWidth, height: cardHeight }, {
    fill: "rgba(229, 228, 224, .94)",
    stroke: "rgba(99, 240, 122, .72)",
    lineWidth: 1,
    radius: 11,
  });
  context.shadowBlur = 0;
  context.shadowOffsetY = 0;

  const iconX = x + cardHeight * 0.5;
  const iconY = y + cardHeight * 0.5;
  context.fillStyle = COLORS.green;
  context.beginPath();
  context.arc(iconX, iconY, cardHeight * 0.23, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = COLORS.dark;
  context.font = `700 ${Math.max(8, cardHeight * 0.22)}px Arial, sans-serif`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText("✓", iconX, iconY + 0.5);

  context.fillStyle = "rgba(8, 17, 12, .9)";
  context.font = `700 ${Math.max(7, cardHeight * 0.18)}px Arial, sans-serif`;
  context.textAlign = "left";
  context.fillText(notification.label, x + cardHeight * 0.88, y + cardHeight * 0.4);
  context.fillStyle = "rgba(8, 17, 12, .55)";
  context.font = `600 ${Math.max(6, cardHeight * 0.16)}px Arial, sans-serif`;
  context.fillText(notification.detail, x + cardHeight * 0.88, y + cardHeight * 0.67);
  context.restore();
}

function drawTouch(context, scene) {
  const { touch, phase } = scene;
  context.save();
  context.strokeStyle = COLORS.green;
  context.lineWidth = 1;
  for (let ring = 0; ring < 3; ring += 1) {
    const progress = (phase * 0.72 + ring / 3) % 1;
    context.globalAlpha = (1 - progress) * 0.72;
    context.beginPath();
    context.arc(touch.x, touch.y, touch.radius + progress * touch.radius * 4.5, 0, Math.PI * 2);
    context.stroke();
  }
  context.globalAlpha = 1;
  context.fillStyle = COLORS.green;
  context.shadowColor = COLORS.green;
  context.shadowBlur = 12;
  context.beginPath();
  context.arc(touch.x, touch.y, touch.radius * 0.72, 0, Math.PI * 2);
  context.fill();
  context.restore();
}

export default function MobileAppCanvas() {
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
    let running = true;
    let visible = true;
    let pointerX = 0;
    let pointerY = 0;
    let pointerTargetX = 0;
    let pointerTargetY = 0;
    const startedAt = performance.now();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const render = (elapsed = 0) => {
      if (!width || !height) return;
      const context = canvas.getContext("2d");
      if (!context) return;

      const scene = createMobileAppScene({ width, height, elapsed, pointerX, pointerY });
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, width, height);
      drawAmbient(context, scene);
      drawConnection(context, scene.layers[0], scene, "left");
      drawConnection(context, scene.layers[1], scene, "right");
      drawRearLayer(context, scene.layers[0], scene.phase);
      drawRearLayer(context, scene.layers[1], scene.phase);
      drawDevice(context, scene);
      drawTouch(context, scene);
      drawNotification(context, scene);
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
      pointerX += (pointerTargetX - pointerX) * 0.065;
      pointerY += (pointerTargetY - pointerY) * 0.065;
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
