"use client";

import React, { useEffect, useRef } from "react";

/* ═══════════════════════════════════════════════════════════════
 *  ScrollShapesDemo – Glitch Tech / Cyber Node Animation
 *  ─────────────────────────────────────────────────────────────
 *  MODIFIED FOR INTERNAL SCROLL:
 *  This demo now manages its own scroll state. It acts as a 
 *  scrollable container (overflow-y: auto) so it can be placed
 *  inside smaller bento box cards without relying on window scroll.
 * ═══════════════════════════════════════════════════════════════ */

const ScrollShapesDemo = () => {
  const scrollWrapperRef = useRef(null);
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

      /* Satellite centres */
      const s1x = w * 0.20 + half;
      const s1y = h * 0.15 + half;
      const s2x = w * 0.20 + half;
      const s2y = h * 0.85 - half;
      const s3x = w * 0.85 - half;
      const s3y = h * 0.5;

      /* Angular bend points */
      const b1x = s1x + (cx - s1x) * 0.38;
      const b2x = s2x + (cx - s2x) * 0.38;

      const pathData = [
        `M ${s1x} ${s1y} L ${b1x} ${s1y} L ${cx} ${cy}`,
        `M ${s2x} ${s2y} L ${b2x} ${s2y} L ${cx} ${cy}`,
        `M ${s3x} ${s3y} L ${cx} ${s3y}`,
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

  /* ── 3. Internal Scroll detection ─── */
  const handleScroll = (e) => {
    const wrapper = e.target;
    const sticky = stickyRef.current;
    if (!wrapper || !sticky) return;

    if (rafId.current) return;
    rafId.current = requestAnimationFrame(() => {
      rafId.current = null;
      
      // Calculate scroll progress based on the wrapper's scrollTop
      // Trigger animation when scrolled 25% down the scrollable height
      const scrollableHeight = wrapper.scrollHeight - wrapper.clientHeight;
      const triggerPoint = scrollableHeight * 0.25;
      const scrolled = wrapper.scrollTop > triggerPoint;

      if (scrolled !== isScrolledRef.current) {
        isScrolledRef.current = scrolled;
        sticky.classList.toggle("shpdemo-scrolled", scrolled);
        
        const delays = [0.2, 0.3, 0.4];
        pathRefs.current.forEach((p, i) => {
          if (!p) return;
          if (scrolled) {
            p.style.transition = `stroke-dashoffset 0.8s cubic-bezier(0.87,0,0.13,1) ${delays[i]}s`;
            p.style.strokeDashoffset = "0";
          } else {
            p.style.transition = "stroke-dashoffset 0.5s cubic-bezier(0.87,0,0.13,1)";
            p.style.strokeDashoffset = String(p.getTotalLength());
          }
        });
      }
    });
  };

  /* ═══════════════════════════════════════════════════════════ */
  /*  R E N D E R                                               */
  /* ═══════════════════════════════════════════════════════════ */
  return (
    <div
      ref={scrollWrapperRef}
      onScroll={handleScroll}
      className="shpdemo-container"
      style={{
        width: "100%",
        height: "100%", // Takes full height of the bento card
        overflowY: "auto", // Enables internal scrolling
        overflowX: "hidden",
        position: "relative",
        background: "#0a0a0a"
      }}
    >
      {/* ── scroll area (taller than container to allow scrolling) ── */}
      <div ref={wrapRef} className="shpdemo-scroll-track">
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
            <span>SCROLL TO INITIALIZE</span>
            <div className="shpdemo-drop-line" />
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════ */}
      {/*  S C O P E D   S T Y L E S                              */}
      {/* ═══════════════════════════════════════════════════════ */}
      <style jsx global>{`
        /* ── Layout ───────────────────────────── */
        
        /* Hide scrollbar for a cleaner look but keep functionality */
        .shpdemo-container::-webkit-scrollbar {
          width: 0px;
          background: transparent;
        }

        .shpdemo-scroll-track {
          /* Make it taller than container to force scroll */
          height: 180%; 
          position: relative;
        }

        .shpdemo-sticky-view {
          position: sticky;
          top: 0;
          height: 100%;
          min-height: 400px; /* Minimum height to ensure it fits in small cards */
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
          width: 140px;
          height: 140px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
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
          width: 220px;
          height: 220px;
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
          font-size: 2rem;
          letter-spacing: -1px;
          margin-bottom: 2px;
        }

        .shpdemo-nexus-sub {
          font-size: 0.6rem;
          letter-spacing: 4px;
          font-weight: 700;
          opacity: 0.7;
        }

        /* ── Satellites ──────────────────────── */
        .shpdemo-satellite {
          width: 70px;
          height: 70px;
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
          font-size: 0.8rem;
        }

        .shpdemo-sat-1 {
          top: 15%;
          left: 15%;
        }
        .shpdemo-sat-2 {
          bottom: 15%;
          left: 15%;
        }
        .shpdemo-sat-3 {
          top: 50%;
          right: 10%;
          transform: translateY(-50%) scale(0);
        }

        /* ── Scroll Indicator ────────────────── */
        .shpdemo-indicator {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          opacity: 1;
          transition: opacity 0.3s;
          font-size: 0.7rem;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 3px;
          z-index: 40;
          text-align: center;
        }

        .shpdemo-drop-line {
          width: 1px;
          height: 30px;
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
            width: 110px !important;
            height: 110px !important;
            font-size: 0.8rem !important;
          }
          .shpdemo-initial-grid {
            gap: 1rem !important;
          }
          .shpdemo-center-circle {
            width: 170px !important;
            height: 170px !important;
          }
          .shpdemo-nexus-text {
            font-size: 1.5rem !important;
          }
          .shpdemo-satellite {
            width: 55px !important;
            height: 55px !important;
            font-size: 0.7rem !important;
          }
        }

        @media (max-width: 480px) {
          .shpdemo-grid-shape {
            width: 95px !important;
            height: 95px !important;
            font-size: 0.7rem !important;
          }
          .shpdemo-grid-shape i {
            font-size: 18px !important;
          }
          .shpdemo-initial-grid {
            gap: 0.7rem !important;
          }
          .shpdemo-center-circle {
            width: 140px !important;
            height: 140px !important;
          }
          .shpdemo-nexus-text {
            font-size: 1.2rem !important;
          }
          .shpdemo-nexus-sub {
            font-size: 0.5rem !important;
            letter-spacing: 2px !important;
          }
          .shpdemo-satellite {
            width: 45px !important;
            height: 45px !important;
            font-size: 0.6rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ScrollShapesDemo;
