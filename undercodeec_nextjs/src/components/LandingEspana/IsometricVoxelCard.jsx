"use client";
import { useEffect, useRef } from "react";

export default function IsometricVoxelCard({ accent = "#63f07a", gridSize = 3, waveSpeed = 1, amplitude = 1 }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let running = true;
    let raf = null;
    let W = 0, H = 0, dpr = 1;
    const t0 = performance.now();

    const rgb = (hex) => {
      hex = String(hex || "#63f07a").replace("#", "");
      if (hex.length === 3) hex = hex.split("").map((x) => x + x).join("");
      const n = parseInt(hex, 16);
      return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
    };
    const col = rgb(accent);
    const rgba = (a) => `rgba(${col.r},${col.g},${col.b},${a})`;

    const resize = () => {
      const r = container.getBoundingClientRect();
      if (!r.width || !r.height) return;
      W = r.width; H = r.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(r.width * dpr);
      canvas.height = Math.round(r.height * dpr);
    };

    const draw = (t) => {
      if (!W || !H) { resize(); if (!W || !H) return; }
      const ctx = canvas.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      ctx.fillStyle = "rgba(255,255,255,0)";
      ctx.fillRect(0, 0, W, H);

      const N = Math.max(2, Math.min(6, Math.round(gridSize)));
      const restH = N;
      const maxH = restH + amplitude + 0.6;
      const c = 0.8660254, sp = 0.5;

      const proj1 = (x, y, z) => [
        ((x - N / 2) - (y - N / 2)) * c,
        ((x - N / 2) + (y - N / 2)) * sp - (z - restH / 2),
      ];
      let minx = 1e9, maxx = -1e9, miny = 1e9, maxy = -1e9;
      for (const x of [0, N]) for (const y of [0, N]) for (const z of [0, restH, maxH]) {
        const q = proj1(x, y, z);
        if (q[0] < minx) minx = q[0]; if (q[0] > maxx) maxx = q[0];
        if (q[1] < miny) miny = q[1]; if (q[1] > maxy) maxy = q[1];
      }
      const s = Math.min(W * 0.8 / (maxx - minx), H * 0.8 / (maxy - miny));
      const ox = W / 2 - ((minx + maxx) / 2) * s;
      const oy = H / 2 - ((miny + maxy) / 2) * s;
      const P = (x, y, z) => [
        ((x - N / 2) - (y - N / 2)) * c * s + ox,
        (((x - N / 2) + (y - N / 2)) * sp - (z - restH / 2)) * s + oy,
      ];

      const line = (a, b, color, lw, glow) => {
        ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]);
        ctx.lineWidth = lw; ctx.strokeStyle = color;
        if (glow) { ctx.shadowColor = rgba(0.8); ctx.shadowBlur = glow; }
        ctx.stroke(); ctx.shadowBlur = 0;
      };
      const poly = (pp, fill, strokeC, lw, glow) => {
        ctx.beginPath(); ctx.moveTo(pp[0][0], pp[0][1]);
        for (let k = 1; k < pp.length; k++) ctx.lineTo(pp[k][0], pp[k][1]);
        ctx.closePath();
        if (fill) { ctx.shadowBlur = 0; ctx.fillStyle = fill; ctx.fill(); }
        if (strokeC) {
          ctx.lineWidth = lw; ctx.strokeStyle = strokeC;
          if (glow) { ctx.shadowColor = rgba(0.85); ctx.shadowBlur = glow; }
          ctx.stroke(); ctx.shadowBlur = 0;
        }
      };

      const lo = -1.4, hi = N + 1.4;
      ctx.setLineDash([4, 5]);
      for (let g = Math.ceil(lo); g <= Math.floor(hi); g++) {
        line(P(lo, g, 0), P(hi, g, 0), rgba(0.13), 1, 0);
        line(P(g, lo, 0), P(g, hi, 0), rgba(0.13), 1, 0);
      }
      ctx.setLineDash([]);

      const e = rgba(0.13);
      const A = P(0, 0, 0), B = P(N, 0, 0), C = P(N, N, 0), D = P(0, N, 0);
      const A2 = P(0, 0, restH), B2 = P(N, 0, restH), C2 = P(N, N, restH), D2 = P(0, N, restH);
      [[A, B], [B, C], [C, D], [D, A], [A2, B2], [B2, C2], [C2, D2], [D2, A2], [A, A2], [B, B2], [C, C2], [D, D2]]
        .forEach((seg) => line(seg[0], seg[1], e, 1, 0));

      const cells = [];
      for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) cells.push([i, j]);
      cells.sort((a, b) => (a[0] + a[1]) - (b[0] + b[1]));
      for (const [i, j] of cells) {
        let h = restH + amplitude * Math.sin(t * waveSpeed * 1.3 + i * 0.85 + j * 1.4);
        h = Math.max(0.35, h);
        const a = P(i, j, h), b = P(i + 1, j, h), cc = P(i + 1, j + 1, h), d = P(i, j + 1, h);
        const rb0 = P(i + 1, j, 0), rc0 = P(i + 1, j + 1, 0), ld0 = P(i, j + 1, 0);
        poly([b, cc, rc0, rb0], rgba(0.05), rgba(0.5), 1, 0);
        poly([d, cc, rc0, ld0], rgba(0.035), rgba(0.38), 1, 0);
        poly([a, b, cc, d], rgba(0.10), rgba(0.95), 1.4, 7);
        line(b, rb0, rgba(0.6), 1, 0);
        line(cc, rc0, rgba(0.6), 1, 0);
        line(d, ld0, rgba(0.4), 1, 0);
        for (let z = 1; z <= Math.floor(h); z++) {
          line(P(i + 1, j, z), P(i + 1, j + 1, z), rgba(0.26), 1, 0);
          line(P(i, j + 1, z), P(i + 1, j + 1, z), rgba(0.2), 1, 0);
        }
      }

      const rr = (x, y, w, hh, r) => {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + hh, r);
        ctx.arcTo(x + w, y + hh, x, y + hh, r);
        ctx.arcTo(x, y + hh, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
      };

      const pb = P(0, N * 0.5, restH * 0.72);
      ctx.save();
      rr(pb[0] - 13, pb[1] - 13, 26, 26, 4);
      ctx.fillStyle = "rgba(5,16,10,0.86)"; ctx.fill();
      ctx.lineWidth = 1.3; ctx.strokeStyle = rgba(0.85);
      ctx.shadowColor = rgba(0.6); ctx.shadowBlur = 6; ctx.stroke(); ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.moveTo(pb[0] - 4, pb[1] - 6);
      ctx.lineTo(pb[0] - 4, pb[1] + 6);
      ctx.lineTo(pb[0] + 6, pb[1]);
      ctx.closePath();
      ctx.fillStyle = rgba(0.95); ctx.fill();
      ctx.restore();

      const lp = P(-0.15, N * 0.92, restH * 0.3);
      const txt = "4:32";
      ctx.save();
      ctx.font = '600 11px "JetBrains Mono", ui-monospace, monospace';
      const tw = ctx.measureText(txt).width;
      const lw2 = tw + 30, lh = 20;
      rr(lp[0] - lw2 / 2, lp[1] - lh / 2, lw2, lh, 5);
      ctx.fillStyle = rgba(0.9); ctx.shadowColor = rgba(0.55); ctx.shadowBlur = 6; ctx.fill(); ctx.shadowBlur = 0;
      ctx.fillStyle = "rgba(5,16,10,0.95)";
      ctx.beginPath(); ctx.arc(lp[0] - lw2 / 2 + 12, lp[1], 3.2, 0, 6.283); ctx.fill();
      ctx.textBaseline = "middle"; ctx.textAlign = "left";
      ctx.fillText(txt, lp[0] - lw2 / 2 + 21, lp[1] + 0.5);
      ctx.restore();

      const gp = P(N * 0.42, N * 0.35, restH + 0.7);
      ctx.save();
      ctx.fillStyle = rgba(0.95); ctx.shadowColor = rgba(0.8); ctx.shadowBlur = 8;
      ctx.beginPath();
      const r0 = 8, r1 = 2.6;
      for (let k = 0; k < 8; k++) {
        const ang = k * Math.PI / 4 - Math.PI / 2;
        const rad = k % 2 ? r1 : r0;
        const X = gp[0] + Math.cos(ang) * rad, Y = gp[1] + Math.sin(ang) * rad;
        if (k === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y);
      }
      ctx.closePath(); ctx.fill();
      ctx.restore();
    };

    const frame = (now) => {
      if (!running) return;
      try { draw((now - t0) / 1000); } catch {}
      raf = requestAnimationFrame(frame);
    };

    resize();
    draw(0);
    raf = requestAnimationFrame(frame);

    const ro = new ResizeObserver(resize);
    ro.observe(container);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [accent, gridSize, waveSpeed, amplitude]);

  return (
    <div
      ref={containerRef}
      style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", background: "transparent" }}
    >
      <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />
    </div>
  );
}
