"use client";
import { useEffect, useRef } from "react";

export default function OrbVisualizer({ speed = 1, waveIntensity = 1, showDots = true }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    let raf;
    let t0 = performance.now();
    let dpr = 1, cssW = 0, cssH = 0;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = c.getBoundingClientRect();
      cssW = Math.max(1, Math.round(r.width));
      cssH = Math.max(1, Math.round(r.height));
      c.width = Math.round(cssW * dpr);
      c.height = Math.round(cssH * dpr);
    }

    function ringColor(a) {
      let p = a / (Math.PI * 2); p = ((p % 1) + 1) % 1;
      const stops = [
        [0.00, [193, 58, 122]], [0.16, [176, 52, 120]], [0.30, [120, 40, 96]],
        [0.42, [95, 42, 110]],  [0.52, [120, 47, 168]], [0.63, [136, 52, 176]],
        [0.72, [140, 70, 150]], [0.80, [214, 150, 51]], [0.90, [224, 168, 58]],
        [1.00, [193, 58, 122]],
      ];
      for (let i = 0; i < stops.length - 1; i++) {
        const a0 = stops[i], a1 = stops[i + 1];
        if (p >= a0[0] && p <= a1[0]) {
          const f = (p - a0[0]) / (a1[0] - a0[0]);
          return [a0[1][0] + (a1[1][0] - a0[1][0]) * f | 0, a0[1][1] + (a1[1][1] - a0[1][1]) * f | 0, a0[1][2] + (a1[1][2] - a0[1][2]) * f | 0];
        }
      }
      return [193, 58, 122];
    }

    function drawRing(ctx, cx, cy, R, t) {
      const TAU = Math.PI * 2;
      const nTicks = 96, t1 = R - 6, t2 = R - 15;
      ctx.lineWidth = 1.4;
      for (let i = 0; i < nTicks; i++) {
        const a = (i / nTicks) * TAU, ang = a - Math.PI / 2;
        const col = ringColor(a);
        const jitter = 0.55 + 0.45 * Math.abs(Math.sin(i * 1.7 + t * 0.6));
        const inner = t1 - (t1 - t2) * jitter;
        ctx.strokeStyle = `rgba(${col[0]},${col[1]},${col[2]},${0.28 + 0.35 * jitter})`;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(ang) * t1, cy + Math.sin(ang) * t1);
        ctx.lineTo(cx + Math.cos(ang) * inner, cy + Math.sin(ang) * inner);
        ctx.stroke();
      }
      const segs = [[0.895,0.155],[0.175,0.285],[0.315,0.400],[0.470,0.610],[0.630,0.700],[0.735,0.800],[0.815,0.885]];
      ctx.lineCap = "round";
      for (const [s, e] of segs) {
        let start = s, end = e; if (end < start) end += 1;
        const steps = Math.max(6, Math.round((end - start) * 120));
        for (let k = 0; k < steps; k++) {
          const p0 = start + (end - start) * (k / steps);
          const p1 = start + (end - start) * ((k + 1) / steps);
          const col = ringColor(((p0 + p1) / 2) * TAU);
          ctx.beginPath();
          ctx.strokeStyle = `rgb(${col[0]},${col[1]},${col[2]})`;
          ctx.lineWidth = 7;
          ctx.arc(cx, cy, R - 3.5, p0 * TAU - Math.PI / 2, p1 * TAU - Math.PI / 2);
          ctx.stroke();
        }
      }
      ctx.lineCap = "butt";
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU);
      ctx.strokeStyle = "rgba(255,255,255,0.05)"; ctx.lineWidth = 1; ctx.stroke();
    }

    function env(n, t) {
      const win = Math.pow(Math.max(0, Math.cos(n * Math.PI / 2)), 0.45 + 2.6 * (0.5 + 0.5 * Math.sin(t * 0.5)));
      const m1 = 0.5 + 0.5 * Math.sin(t * 0.37), m2 = 0.5 + 0.5 * Math.sin(t * 0.29 + 1.3);
      return Math.max(0, win * (1 + 0.28 * Math.cos(3 * Math.PI * n + t * 1.15) * m1 + 0.16 * Math.cos(5 * Math.PI * n - t * 0.8) * m2));
    }

    function drawWave(ctx, cx, cy, Rd, t) {
      const Lw = Rd * 0.86, amp = Rd * (0.30 + 0.14 * (0.5 + 0.5 * Math.sin(t * 0.8))) * waveIntensity;
      const top = [], bot = [];
      for (let x = -Lw; x <= Lw; x++) {
        const h = env(x / Lw, t) * amp;
        top.push([cx + x, cy - h]); bot.push([cx + x, cy + h]);
      }
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(top[0][0], top[0][1]);
      for (let i = 1; i < top.length; i++) ctx.lineTo(top[i][0], top[i][1]);
      for (let i = bot.length - 1; i >= 0; i--) ctx.lineTo(bot[i][0], bot[i][1]);
      ctx.closePath();
      const g = ctx.createLinearGradient(0, cy - amp, 0, cy + amp);
      g.addColorStop(0, "rgba(126,26,78,0.60)"); g.addColorStop(0.5, "rgba(168,42,104,0.95)"); g.addColorStop(1, "rgba(126,26,78,0.60)");
      ctx.fillStyle = g; ctx.fill();
      ctx.clip();
      ctx.lineWidth = 1;
      for (let y = cy - amp - 2; y <= cy + amp + 2; y += 3) {
        const d = Math.abs(y - cy) / (amp + 1);
        ctx.strokeStyle = `rgba(206,88,150,${0.16 + 0.30 * (1 - d)})`;
        ctx.beginPath(); ctx.moveTo(cx - Lw, y + 0.5); ctx.lineTo(cx + Lw, y + 0.5); ctx.stroke();
      }
      ctx.restore();
      ctx.strokeStyle = "rgba(224,120,170,0.85)"; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(cx - Rd * 0.92, cy + 0.5); ctx.lineTo(cx + Rd * 0.92, cy + 0.5); ctx.stroke();
    }

    function drawDots(ctx, cx, cy, Rd, t) {
      const N = 46, rot = t * 0.42;
      const waves = 1.4 + 0.5 * Math.sin(t * 0.33);
      const amp = Rd * 0.34 * (0.7 + 0.3 * Math.sin(t * 0.7)), len = Rd * 0.92;
      const cosR = Math.cos(rot), sinR = Math.sin(rot);
      for (let i = 0; i < N; i++) {
        const p = i / (N - 1), s = p * 2 - 1;
        const lx = s * len, ly = Math.sin(s * Math.PI * waves + t * 1.6) * amp * (1 - Math.abs(s) * 0.15);
        const x = cx + lx * cosR - ly * sinR, y = cy + lx * sinR + ly * cosR;
        if (Math.hypot(x - cx, y - cy) > Rd - 4) continue;
        const size = 1.6 + 2.6 * Math.sin(p * Math.PI), alpha = 0.35 + 0.6 * Math.sin(p * Math.PI);
        ctx.beginPath();
        ctx.fillStyle = `rgba(230,104,168,${alpha})`;
        ctx.shadowColor = "rgba(255,140,196,0.9)"; ctx.shadowBlur = 8;
        ctx.arc(x, y, size, 0, Math.PI * 2); ctx.fill();
      }
      ctx.shadowBlur = 0;
    }

    function drawRipples(ctx, cx, cy, Rd, t) {
      const a0 = 0.10 * Math.PI, a1 = 0.62 * Math.PI;
      ctx.lineCap = "round";
      for (let k = 0; k < 4; k++) {
        const rr = Rd - 6 - k * 11, pulse = 0.35 + 0.4 * (0.5 + 0.5 * Math.sin(t * 1.1 - k * 0.7));
        ctx.beginPath(); ctx.strokeStyle = `rgba(238,170,146,${pulse})`; ctx.lineWidth = 2.4;
        ctx.arc(cx, cy, rr, a0, a1); ctx.stroke();
      }
      ctx.lineCap = "butt";
    }

    function drawGlass(ctx, cx, cy, Rd) {
      ctx.save();
      const sx = cx - Rd * 0.28, sy = cy - Rd * 0.42;
      const gl = ctx.createRadialGradient(sx, sy, 2, sx, sy, Rd * 0.85);
      gl.addColorStop(0, "rgba(255,255,255,0.16)"); gl.addColorStop(0.35, "rgba(255,255,255,0.05)"); gl.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = gl;
      ctx.beginPath(); ctx.ellipse(cx - Rd * 0.22, cy - Rd * 0.3, Rd * 0.72, Rd * 0.5, -0.5, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.10)"; ctx.lineWidth = Rd * 0.10;
      ctx.beginPath(); ctx.arc(cx, cy, Rd * 0.78, Math.PI * 1.12, Math.PI * 1.62); ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,0.06)"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(cx, cy, Rd - 3, Math.PI * 1.05, Math.PI * 1.75); ctx.stroke();
      const vg = ctx.createRadialGradient(cx, cy + Rd * 0.2, Rd * 0.4, cx, cy, Rd);
      vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,0.45)");
      ctx.fillStyle = vg; ctx.beginPath(); ctx.arc(cx, cy, Rd, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }

    function draw(ctx, t) {
      const W = cssW || 300, H = cssH || 300;
      ctx.save(); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
      const cx = W / 2, cy = H / 2, R = Math.min(W, H) / 2 - 6, Rd = R - 20;
      ctx.save();
      ctx.shadowColor = "rgba(20,10,25,0.35)"; ctx.shadowBlur = 22; ctx.shadowOffsetY = 8;
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fillStyle = "#0a070c"; ctx.fill();
      ctx.restore();
      drawRing(ctx, cx, cy, R, t);
      const dome = ctx.createRadialGradient(cx - Rd * 0.18, cy - Rd * 0.22, Rd * 0.05, cx, cy, Rd * 1.05);
      dome.addColorStop(0, "#2a2430"); dome.addColorStop(0.45, "#161218"); dome.addColorStop(0.8, "#0b080d"); dome.addColorStop(1, "#040305");
      ctx.beginPath(); ctx.arc(cx, cy, Rd, 0, Math.PI * 2); ctx.fillStyle = dome; ctx.fill();
      ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, Rd, 0, Math.PI * 2); ctx.clip();
      drawWave(ctx, cx, cy, Rd, t);
      drawRipples(ctx, cx, cy, Rd, t);
      if (showDots) drawDots(ctx, cx, cy, Rd, t);
      drawGlass(ctx, cx, cy, Rd, t);
      ctx.restore();
      ctx.beginPath(); ctx.arc(cx, cy, Rd + 0.5, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(0,0,0,0.6)"; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.restore();
    }

    function loop(now) {
      raf = requestAnimationFrame(loop);
      if (!c) return;
      if ((c.width === 0 || c.getBoundingClientRect().width !== cssW) && c.getBoundingClientRect().width) resize();
      const ctx = c.getContext("2d");
      const t = ((now - t0) / 1000) * speed;
      draw(ctx, t);
    }

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(c);
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [speed, waveIntensity, showDots]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: "100%", display: "block", background: "transparent" }}
    />
  );
}
