"use client";

import React, { useEffect, useRef } from "react";

/* ═══════════════════════════════════════════════════════════════
 *  ScrollShapesDemo – Glitch Tech / Cyber Node Animation
 *  ─────────────────────────────────────────────────────────────
 *  Scroll-driven transition:
 *    • Initial state  → 2×2 grid of tech-node shapes
 *    • Scrolled state → central circle (NEXUS) + 3 satellite
 *                        nodes connected by angular SVG paths
 *
 *  All DOM updates happen via refs (no re-renders on scroll).
 * ═══════════════════════════════════════════════════════════════ */

const ScrollShapesDemo = () => {
  const wrapRef       = useRef(null);
  const stickyRef     = useRef(null);
  const svgRef        = useRef(null);
  const pathRefs      = useRef([]);
  const isScrolledRef = useRef(false);
  const rafId         = useRef(null);

  /* ── 1. Load Google Fonts (JetBrains Mono + Space Grotesk) ── */
  useEffect(() => {
    if (document.querySelector("[data-shpdemo-fonts]")) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;800&family=Space+Grotesk:wght@700&display=swap";
    link.setAttribute("data-shpdemo-fonts", "");
    document.head.appendChild(link);
  }, []);

  /* ── 2. SVG connector path calculation + ResizeObserver ───── */
  useEffect(() => {
    const sticky = stickyRef.current;
    const svg    = svgRef.current;
    if (!sticky || !svg) return;

    const computePaths = () => {
      const w = sticky.offsetWidth;
      const h = sticky.offsetHeight;
      svg.setAttribute("viewBox", `0 0 ${w} ${h}`);

      /* Satellite size (matches CSS – adapts via media-query) */
      const satW =
        w <= 480 ? 50 : w <= 768 ? 65 : 90;
      const half = satW / 2;

      /* Center of the viewport */
      const cx = w / 2;
      const cy = h / 2;

      /* Satellite centres (must match the CSS positions) */
      const s1x = w * 0.20 + half;          // sat-1: top:15% left:20%
      const s1y = h * 0.15 + half;
      const s2x = w * 0.20 + half;          // sat-2: bottom:15% left:20%
      const s2y = h * 0.85 - half;
      const s3x = w * 0.85 - half;          // sat-3: top:50% right:15%
      const s3y = h * 0.5;                  //         translateY(-50%)

      /* Angular bend points */
      const b1x = s1x + (cx - s1x) * 0.38;
      const b2x = s2x + (cx - s2x) * 0.38;

      const pathData = [
        `M ${s1x} ${s1y} L ${b1x} ${s1y} L ${cx} ${cy}`,       // sat-1 → bend → center
        `M ${s2x} ${s2y} L ${b2x} ${s2y} L ${cx} ${cy}`,       // sat-2 → bend → center
        `M ${s3x} ${s3y} L ${cx} ${s3y}`,                       // sat-3 → straight → center
      ];

      pathData.forEach((d, i) => {
        const p = pathRefs.current[i];
        if (!p) return;
        p.setAttribute("d", d);
        const len = p.getTotalLength();
        p.style.strokeDasharray = String(len);
        if (!isScrolledRef.current) {
          p.style.strokeDashoffset = String(len);
        }
      });
    };

    requestAnimationFrame(computePaths);
    const ro = new ResizeObserver(() => requestAnimationFrame(computePaths));
    ro.observe(sticky);
    return () => ro.disconnect();
  }, []);

  /* ── 3. Scroll detection → class toggle + path animation ─── */
  useEffect(() => {
    const wrap   = wrapRef.current;
    const sticky = stickyRef.current;
    if (!wrap || !sticky) return;

    const animatePaths = (scrolled) => {
      const delays = [0.2, 0.3, 0.4];
      pathRefs.current.forEach((p, i) => {
        if (!p) return;
        if (scrolled) {
          p.style.transition =
            `stroke-dashoffset 0.8s cubic-bezier(0.87,0,0.13,1) ${delays[i]}s`;
          p.style.strokeDashoffset = "0";
        } else {
          p.style.transition =
            "stroke-dashoffset 0.5s cubic-bezier(0.87,0,0.13,1)";
          p.style.strokeDashoffset = String(p.getTotalLength());
        }
      });
    };

    const onScroll = () => {
      if (rafId.current) return;
      rafId.current = requestAnimationFrame(() => {
        rafId.current = null;
        const rect     = wrap.getBoundingClientRect();
        const scrolled = -rect.top > window.innerHeight * 0.4;
        if (scrolled !== isScrolledRef.current) {
          isScrolledRef.current = scrolled;
          sticky.classList.toggle("shpdemo-scrolled", scrolled);
          animatePaths(scrolled);
        }
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  /* ═══════════════════════════════════════════════════════════ */
  /*  R E N D E R                                               */
  /* ═══════════════════════════════════════════════════════════ */
  return (
    <section id="demos-diseno" style={{ position: "relative", overflow: "hidden" }}>
      {/* ── gradient transition: white → dark ── */}
      <div
        style={{
          background: "linear-gradient(180deg, #ffffff 0%, #111 100%)",
          height: 120,
        }}
      />

      {/* ── section header on dark bg ── */}
      <div style={{ background: "#0a0a0a", paddingTop: 40, paddingBottom: 20 }}>
        <div className="container">
          <div className="text-center animate-fadeUp">
            <span
              style={{
                textTransform: "uppercase",
                fontWeight: 700,
                color: "#FEE07A",
                letterSpacing: "3px",
                fontSize: 12,
              }}
            >
              Lo que podemos crear
            </span>
            <h2
              style={{
                fontSize: "clamp(28px, 4vw, 44px)",
                fontWeight: 700,
                marginTop: 10,
                marginBottom: 14,
                color: "#fff",
                letterSpacing: "-0.5px",
              }}
            >
              Diseño que cobra vida con cada scroll
            </h2>
            <p
              style={{
                color: "#888",
                maxWidth: 660,
                fontSize: 16,
                margin: "0 auto",
                lineHeight: 1.7,
              }}
            >
              Desliza hacia abajo y observa cómo transformamos ideas simples en
              experiencias visuales únicas. Esto es solo una muestra de lo que
              Undercodeec puede crear para tu marca.
            </p>
          </div>
        </div>
      </div>

      {/* ── scroll container ── */}
      <div ref={wrapRef} className="shpdemo-scroll-container">
        <div ref={stickyRef} className="shpdemo-sticky-view">
          {/* cyber grid bg */}
          <div className="shpdemo-cyber-grid" />

          {/* ─── INITIAL GRID ─── */}
          <div className="shpdemo-initial-grid">
            <div className="shpdemo-shape shpdemo-grid-shape">
              <i className="bi bi-database" style={{ fontSize: 28, marginBottom: 8 }} />
              <span>NODE.01</span>
            </div>
            <div className="shpdemo-shape shpdemo-grid-shape shpdemo-primary">
              <i className="bi bi-cpu" style={{ fontSize: 34, marginBottom: 8 }} />
              <span>SYS.CORE</span>
            </div>
            <div className="shpdemo-shape shpdemo-grid-shape">
              <i className="bi bi-hdd-network" style={{ fontSize: 28, marginBottom: 8 }} />
              <span>NODE.02</span>
            </div>
            <div className="shpdemo-shape shpdemo-grid-shape">
              <i className="bi bi-hdd-rack" style={{ fontSize: 28, marginBottom: 8 }} />
              <span>NODE.03</span>
            </div>
          </div>

          {/* ─── CONNECTED LAYOUT ─── */}
          <div className="shpdemo-connected-layout">
            {/* SVG angular connectors */}
            <svg ref={svgRef} className="shpdemo-connector-svg">
              {[0, 1, 2].map((i) => (
                <path
                  key={i}
                  ref={(el) => (pathRefs.current[i] = el)}
                  fill="none"
                  stroke="#FEE07A"
                  strokeWidth={2}
                />
              ))}
            </svg>

            {/* Center core */}
            <div className="shpdemo-center-circle">
              <span className="shpdemo-nexus-text">NEXUS</span>
              <span className="shpdemo-nexus-sub">ONLINE</span>
            </div>

            {/* Satellites */}
            <div className="shpdemo-satellite shpdemo-sat-1">
              <span>N.01</span>
            </div>
            <div className="shpdemo-satellite shpdemo-sat-2">
              <span>N.02</span>
            </div>
            <div className="shpdemo-satellite shpdemo-sat-3">
              <span>N.03</span>
            </div>
          </div>

          {/* scroll indicator */}
          <div className="shpdemo-indicator">
            <span>INITIALIZE SEQUENCE</span>
            <div className="shpdemo-drop-line" />
          </div>
        </div>
      </div>

      {/* ── gradient transition: dark → white ── */}
      <div
        style={{
          background: "linear-gradient(180deg, #0a0a0a 0%, #ffffff 100%)",
          height: 120,
        }}
      />

      {/* ═══════════════════════════════════════════════════════ */}
      {/*  S C O P E D   S T Y L E S                              */}
      {/* ═══════════════════════════════════════════════════════ */}
      <style jsx global>{`
        /* ── Layout ───────────────────────────── */
        .shpdemo-scroll-container {
          height: 250vh;
          position: relative;
          background: #0a0a0a;
        }

        .shpdemo-sticky-view {
          position: sticky;
          top: 0;
          height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background: radial-gradient(circle at center, #1a1a1a 0%, #0a0a0a 100%);
          font-family: "JetBrains Mono", "SF Mono", "Consolas", monospace;
          color: #fff;
        }

        /* ── Cyber Grid ──────────────────────── */
        .shpdemo-cyber-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
          background-size: 50px 50px;
          z-index: 0;
          pointer-events: none;
        }

        /* ── Initial Grid ────────────────────── */
        .shpdemo-initial-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          position: absolute;
          z-index: 10;
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .shpdemo-shape {
          border: 2px solid #333;
          background: rgba(20, 20, 20, 0.8);
          backdrop-filter: blur(4px);
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          overflow: hidden;
        }

        .shpdemo-shape::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            45deg,
            transparent 40%,
            rgba(255, 255, 255, 0.1) 50%,
            transparent 60%
          );
          background-size: 200% 200%;
          animation: shpdemoScanline 3s linear infinite;
        }

        .shpdemo-grid-shape {
          width: 180px;
          height: 180px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          font-weight: 700;
          color: #888;
          border-radius: 4px;
        }

        .shpdemo-grid-shape.shpdemo-primary {
          border-color: #FEE07A;
          background: rgba(254, 224, 122, 0.1);
          color: #FEE07A;
          box-shadow: 0 0 20px rgba(254, 224, 122, 0.2);
        }

        /* ── Connected Layout ────────────────── */
        .shpdemo-connected-layout {
          position: absolute;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          z-index: 20;
        }

        .shpdemo-connector-svg {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          z-index: 15;
          pointer-events: none;
        }

        /* ── Center Circle ───────────────────── */
        .shpdemo-center-circle {
          width: 280px;
          height: 280px;
          background-color: #FEE07A;
          border: 4px solid #fff;
          border-radius: 50%;
          position: absolute;
          z-index: 30;
          box-shadow: 0 0 40px rgba(254, 224, 122, 0.4),
            inset 0 0 20px rgba(0, 0, 0, 0.5);
          transform: scale(0);
          opacity: 0;
          transition: all 0.6s cubic-bezier(0.87, 0, 0.13, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          color: #000;
        }

        .shpdemo-center-circle::after {
          content: "";
          position: absolute;
          inset: -10px;
          border: 1px dashed #FEE07A;
          border-radius: 50%;
          animation: shpdemoRotate 10s linear infinite;
        }

        .shpdemo-nexus-text {
          font-family: "Space Grotesk", sans-serif;
          font-weight: 700;
          font-size: 2.5rem;
          letter-spacing: -1px;
          margin-bottom: 2px;
        }

        .shpdemo-nexus-sub {
          font-size: 0.7rem;
          letter-spacing: 4px;
          font-weight: 700;
          opacity: 0.7;
        }

        /* ── Satellites ──────────────────────── */
        .shpdemo-satellite {
          width: 90px;
          height: 90px;
          border: 2px solid #555;
          background: #111;
          position: absolute;
          z-index: 25;
          opacity: 0;
          transform: scale(0);
          transition: all 0.5s cubic-bezier(0.87, 0, 0.13, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: #fff;
          border-radius: 4px;
          font-size: 0.85rem;
        }

        .shpdemo-sat-1 {
          top: 15%;
          left: 20%;
        }
        .shpdemo-sat-2 {
          bottom: 15%;
          left: 20%;
        }
        .shpdemo-sat-3 {
          top: 50%;
          right: 15%;
          transform: translateY(-50%) scale(0);
        }

        /* ── Scroll Indicator ────────────────── */
        .shpdemo-indicator {
          position: absolute;
          bottom: 40px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          opacity: 1;
          transition: opacity 0.3s;
          font-size: 0.8rem;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 4px;
          z-index: 40;
        }

        .shpdemo-drop-line {
          width: 1px;
          height: 40px;
          background: linear-gradient(to bottom, transparent, #FEE07A);
          animation: shpdemoDrop 1.5s infinite;
        }

        /* ══════════════════════════════════════ */
        /*  SCROLLED STATES                       */
        /* ══════════════════════════════════════ */
        .shpdemo-scrolled .shpdemo-initial-grid {
          opacity: 0;
          transform: scale(1.1) translateY(40px) skewX(-5deg);
          filter: blur(10px);
          pointer-events: none;
        }

        .shpdemo-scrolled .shpdemo-center-circle {
          transform: scale(1);
          opacity: 1;
          transition-delay: 0.1s;
        }

        .shpdemo-scrolled .shpdemo-satellite {
          opacity: 1;
          transform: scale(1);
        }

        .shpdemo-scrolled .shpdemo-sat-1 {
          transition-delay: 0.2s;
          border-color: #FEE07A;
        }
        .shpdemo-scrolled .shpdemo-sat-2 {
          transition-delay: 0.3s;
          border-color: #FEE07A;
        }
        .shpdemo-scrolled .shpdemo-sat-3 {
          transition-delay: 0.4s;
          transform: translateY(-50%) scale(1);
          border-color: #FEE07A;
        }

        .shpdemo-scrolled .shpdemo-indicator {
          opacity: 0;
          pointer-events: none;
        }

        /* ══════════════════════════════════════ */
        /*  KEYFRAME ANIMATIONS                   */
        /* ══════════════════════════════════════ */
        @keyframes shpdemoScanline {
          0% {
            background-position: 0% -100%;
          }
          100% {
            background-position: 0% 200%;
          }
        }

        @keyframes shpdemoRotate {
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes shpdemoDrop {
          0% {
            transform: translateY(-20px);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateY(20px);
            opacity: 0;
          }
        }

        /* ══════════════════════════════════════ */
        /*  RESPONSIVE                            */
        /* ══════════════════════════════════════ */
        @media (max-width: 768px) {
          .shpdemo-grid-shape {
            width: 130px !important;
            height: 130px !important;
            font-size: 0.9rem !important;
          }
          .shpdemo-initial-grid {
            gap: 1rem !important;
          }
          .shpdemo-center-circle {
            width: 200px !important;
            height: 200px !important;
          }
          .shpdemo-nexus-text {
            font-size: 1.8rem !important;
          }
          .shpdemo-satellite {
            width: 65px !important;
            height: 65px !important;
            font-size: 0.75rem !important;
          }
        }

        @media (max-width: 480px) {
          .shpdemo-grid-shape {
            width: 105px !important;
            height: 105px !important;
            font-size: 0.75rem !important;
          }
          .shpdemo-grid-shape i {
            font-size: 20px !important;
          }
          .shpdemo-initial-grid {
            gap: 0.7rem !important;
          }
          .shpdemo-center-circle {
            width: 150px !important;
            height: 150px !important;
          }
          .shpdemo-nexus-text {
            font-size: 1.3rem !important;
          }
          .shpdemo-nexus-sub {
            font-size: 0.55rem !important;
            letter-spacing: 2px !important;
          }
          .shpdemo-satellite {
            width: 50px !important;
            height: 50px !important;
            font-size: 0.6rem !important;
          }
          .shpdemo-indicator {
            font-size: 0.65rem !important;
            letter-spacing: 2px !important;
          }
        }
      `}</style>
    </section>
  );
};

export default ScrollShapesDemo;
