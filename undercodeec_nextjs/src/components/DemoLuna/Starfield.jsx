"use client";

import { useEffect, useRef } from "react";

/**
 * Campo de estrellas dibujado en <canvas>: parpadeo suave + un cometa que
 * cruza en diagonal cada pocos segundos. Se pausa cuando `active` es false
 * para no gastar CPU mientras hay un overlay abierto.
 */
const STAR_COUNT = 900;
const COMET_INTERVAL = 6500; // ms entre cometas
const COMET_LIFE = 1700; // ms que tarda en cruzar

export default function Starfield({ active = true }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const W = 2400;
    const H = 1200;
    canvas.width = W;
    canvas.height = H;

    // PRNG determinista para que el cielo se vea igual en cada carga.
    let seed = 0x9e3779b9;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };

    const stars = Array.from({ length: STAR_COUNT }, () => ({
      x: rand() * W,
      y: rand() * H,
      r: rand() * 1.4 + 0.3,
      base: rand() * 0.55 + 0.2,
      speed: rand() * 2.2 + 0.6,
      phase: rand() * Math.PI * 2,
      depth: rand() * 0.7 + 0.25,
    }));

    let comet = null;
    let nextComet = 800;
    const spawnComet = (now) => {
      const fromLeft = rand() > 0.5;
      const y0 = H * 0.05 + rand() * H * 0.5;
      comet = {
        born: now,
        x0: fromLeft ? -140 : W + 140,
        y0,
        x1: fromLeft ? W + 200 : -200,
        y1: y0 + (rand() * 0.4 + 0.2) * H,
      };
    };

    const easeInOut = (p) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);

    let raf = 0;
    let running = true;

    const frame = (now) => {
      if (!running) return;
      const t = now / 1000;
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, W, H);

      for (const s of stars) {
        const twinkle = 1 - s.depth + s.depth * (0.5 + 0.5 * Math.sin(t * s.speed + s.phase));
        ctx.fillStyle = `rgba(255,243,234,${(s.base * twinkle).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      if (!comet && now >= nextComet) spawnComet(now);
      if (comet) {
        const p = (now - comet.born) / COMET_LIFE;
        if (p >= 1) {
          comet = null;
          nextComet = now + COMET_INTERVAL;
        } else {
          const e = easeInOut(p);
          const hx = comet.x0 + (comet.x1 - comet.x0) * e;
          const hy = comet.y0 + (comet.y1 - comet.y0) * e;
          const dx = comet.x1 - comet.x0;
          const dy = comet.y1 - comet.y0;
          const len = Math.hypot(dx, dy) || 1;
          const tailX = hx - (dx / len) * 240;
          const tailY = hy - (dy / len) * 240;
          const glow = Math.sin(Math.min(1, p / 0.9) * Math.PI);

          const grad = ctx.createLinearGradient(hx, hy, tailX, tailY);
          grad.addColorStop(0, `rgba(255,247,235,${(0.9 * glow).toFixed(3)})`);
          grad.addColorStop(1, "rgba(255,247,235,0)");
          ctx.strokeStyle = grad;
          ctx.lineWidth = 2.4;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(tailX, tailY);
          ctx.lineTo(hx, hy);
          ctx.stroke();

          ctx.fillStyle = `rgba(255,250,240,${glow.toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(hx, hy, 2.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      raf = requestAnimationFrame(frame);
    };

    if (active) raf = requestAnimationFrame(frame);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
    };
  }, [active]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "absolute",
        top: "-20%",
        left: "-30%",
        width: "160%",
        height: "140%",
        display: "block",
        opacity: active ? 1 : 0,
        transition: "opacity 0.5s ease",
      }}
    />
  );
}
