"use client";

import React, { useEffect, useRef, useState } from "react";

/* ═══════════════════════════════════════════════════════════════
 *  GlitchTechAnimation  —  "Nexus Core Expansion"
 *  ─────────────────────────────────────────────────────────────
 *  Four nodes in a 2×2 grid. On scroll (or activation), the
 *  primary node (node-2) expands into a large glowing circle
 *  while the other three shrink and fly out to satellite
 *  positions, linked by SVG connector paths.
 *
 *  Scroll-lock logic:
 *  ─ When visible and user scrolls down → triggers expansion,
 *    scroll is BLOCKED for ANIMATION_LOCK_MS.
 *  ─ After the animation completes → scroll is released.
 *  ─ State resets when the component leaves the viewport.
 * ═══════════════════════════════════════════════════════════════ */

const ANIMATION_LOCK_MS = 1400;

const GlitchTechAnimation = () => {
  const containerRef = useRef(null);
  const [expanded, setExpanded] = useState(false);

  const phaseRef = useRef("idle");
  const timerRef = useRef(null);
  const touchStartYRef = useRef(0);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    /* ── Reset when scrolled away ── */
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting && phaseRef.current !== "idle") {
          phaseRef.current = "idle";
          setExpanded(false);
          if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
          }
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(node);

    /* ── Wheel handler ── */
    const handleWheel = (e) => {
      const phase = phaseRef.current;
      if (phase === "idle" && e.deltaY > 0) {
        e.preventDefault();
        e.stopPropagation();
        setExpanded(true);
        phaseRef.current = "animating";
        timerRef.current = setTimeout(() => {
          phaseRef.current = "done";
        }, ANIMATION_LOCK_MS);
      } else if (phase === "animating") {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    /* ── Touch handlers ── */
    const handleTouchStart = (e) => {
      touchStartYRef.current = e.touches[0].clientY;
    };
    const handleTouchMove = (e) => {
      const deltaY = touchStartYRef.current - e.touches[0].clientY;
      const phase = phaseRef.current;
      if (phase === "idle" && deltaY > 12) {
        e.preventDefault();
        setExpanded(true);
        phaseRef.current = "animating";
        timerRef.current = setTimeout(() => {
          phaseRef.current = "done";
        }, ANIMATION_LOCK_MS);
      } else if (phase === "animating") {
        e.preventDefault();
      }
    };

    node.addEventListener("wheel", handleWheel, { passive: false });
    node.addEventListener("touchstart", handleTouchStart, { passive: true });
    node.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      node.removeEventListener("wheel", handleWheel);
      node.removeEventListener("touchstart", handleTouchStart);
      node.removeEventListener("touchmove", handleTouchMove);
      observer.disconnect();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`nce-root${expanded ? " nce-expanded" : ""}`}
    >
      {/* Cyber grid */}
      <div className="nce-cyber-grid" />

      {/* Noise overlay */}
      <div className="nce-noise" />

      {/* Stage — contains nodes + connectors */}
      <div className="nce-stage">
        {/* SVG Connectors (center → satellites) */}
        <svg className="nce-connector-svg" viewBox="0 0 500 420" preserveAspectRatio="xMidYMid meet">
          {/* Path: center → top-left satellite */}
          <path className="nce-path-line nce-path-1" d="M 250 175 L 190 175 L 110 105" />
          {/* Path: center → bottom-left satellite */}
          <path className="nce-path-line nce-path-2" d="M 250 245 L 190 245 L 110 315" />
          {/* Path: center → right satellite */}
          <path className="nce-path-line nce-path-3" d="M 300 210 L 410 210" />
        </svg>

        {/* Node 1 — SAT.01 (top-left) */}
        <div className="nce-node nce-node-1">
          <svg className="nce-node-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" /><path d="M15 2v2" /><path d="M15 20v2" /><path d="M2 15h2" /><path d="M2 9h2" /><path d="M20 15h2" /><path d="M20 9h2" /><path d="M9 2v2" /><path d="M9 20v2" />
          </svg>
          <span className="nce-node-label">SAT.01</span>
        </div>

        {/* Node 2 — NEXUS CORE (primary, expands to center circle) */}
        <div className="nce-node nce-node-2">
          <div className="nce-core-content">
            <svg className="nce-core-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.84Z" /><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" /><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
            </svg>
            <span className="nce-core-title">Nexus Core</span>
            <span className="nce-core-sub">SYSTEM_ONLINE</span>
          </div>
        </div>

        {/* Node 3 — SAT.02 (bottom-left) */}
        <div className="nce-node nce-node-3">
          <svg className="nce-node-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="16" y="16" width="6" height="6" rx="1" /><rect x="2" y="16" width="6" height="6" rx="1" /><rect x="9" y="2" width="6" height="6" rx="1" /><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3" /><path d="M12 12V8" />
          </svg>
          <span className="nce-node-label">SAT.02</span>
        </div>

        {/* Node 4 — SAT.03 (right) */}
        <div className="nce-node nce-node-4">
          <svg className="nce-node-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9" /><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.4" /><circle cx="12" cy="12" r="2" /><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.4" /><path d="M19.1 4.9C23 8.8 23 15.1 19.1 19" />
          </svg>
          <span className="nce-node-label">SAT.03</span>
        </div>
      </div>

      {/* HUD — Status bar (bottom-left) */}
      <div className="nce-status-bar">
        <div>Lat: 51.5074° N / Long: 0.1278° W</div>
        <div>Protocol: 882-X-GAMMA</div>
      </div>

      {/* HUD — Top-left module badge */}
      <div className="nce-module-badge">
        <div className="nce-module-dot-box">
          <div className="nce-module-dot" />
        </div>
        <div className="nce-module-info">
          <span className="nce-module-name">CORE_MODULE_01</span>
          <span className="nce-module-status">STABLE_CONNECTION</span>
        </div>
      </div>

      {/* ═════════════ SCOPED STYLES ═════════════ */}
      <style jsx global>{`
        /* ── Root ── */
        .nce-root {
          --accent: #FEE07A;
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
          background: radial-gradient(circle at center, #151515 0%, #0a0a0a 100%);
          border-radius: 16px;
          font-family: 'JetBrains Mono', 'SF Mono', 'Fira Code', monospace;
          color: #fff;
        }

        /* ── Cyber grid ── */
        .nce-cyber-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(254,224,122,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(254,224,122,0.05) 1px, transparent 1px);
          background-size: 50px 50px;
          pointer-events: none;
          z-index: 0;
        }

        /* ── Noise overlay ── */
        .nce-noise {
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(254,224,122,0.015) 2px,
            rgba(254,224,122,0.015) 4px
          );
          pointer-events: none;
          z-index: 50;
          border-radius: 16px;
        }

        /* ── Stage ── */
        .nce-stage {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
        }

        /* ── Nodes (common) ── */
        .nce-node {
          position: absolute;
          border: 2px solid rgba(254,224,122,0.3);
          background: rgba(20,20,20,0.9);
          backdrop-filter: blur(8px);
          transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .nce-node::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(transparent 50%, rgba(254,224,122,0.05) 50%);
          background-size: 100% 4px;
          pointer-events: none;
        }

        .nce-node-icon {
          width: 28px;
          height: 28px;
          opacity: 0.5;
          margin-bottom: 6px;
        }
        .nce-node-label {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 3px;
        }

        /* ── Node positions: initial (2×2 grid, centered) ── */
        .nce-node-1 {
          width: 110px; height: 110px;
          border-radius: 16px;
          transform: translate(-62px, -62px);
        }
        .nce-node-2 {
          width: 110px; height: 110px;
          border-radius: 16px;
          transform: translate(62px, -62px);
          background: rgba(254,224,122,0.12);
          border-color: var(--accent);
        }
        .nce-node-3 {
          width: 110px; height: 110px;
          border-radius: 16px;
          transform: translate(-62px, 62px);
        }
        .nce-node-4 {
          width: 110px; height: 110px;
          border-radius: 16px;
          transform: translate(62px, 62px);
        }

        /* ── Core content (inside node-2) ── */
        .nce-core-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          transition: opacity 0.4s ease;
        }
        .nce-core-icon {
          width: 28px;
          height: 28px;
          margin-bottom: 6px;
        }
        .nce-core-title {
          font-size: 9px;
          font-weight: 800;
          letter-spacing: -0.3px;
          text-transform: uppercase;
          margin-bottom: 2px;
          white-space: nowrap;
        }
        .nce-core-sub {
          font-size: 7px;
          opacity: 0.7;
          letter-spacing: 2px;
          font-weight: 700;
        }

        /* ── Connectors ── */
        .nce-connector-svg {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          pointer-events: none;
          z-index: 5;
        }
        .nce-path-line {
          stroke: var(--accent);
          stroke-width: 2;
          fill: none;
          stroke-dasharray: 800;
          stroke-dashoffset: 800;
          transition: stroke-dashoffset 1s cubic-bezier(0.16, 1, 0.3, 1);
          opacity: 0.4;
        }

        /* ── HUD elements ── */
        .nce-status-bar {
          position: absolute;
          bottom: 12px;
          left: 14px;
          font-size: 8px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: var(--accent);
          opacity: 0.5;
          line-height: 1.6;
          z-index: 20;
        }
        .nce-module-badge {
          position: absolute;
          top: 12px;
          left: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
          z-index: 20;
        }
        .nce-module-dot-box {
          width: 18px;
          height: 18px;
          border: 1px solid var(--accent);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .nce-module-dot {
          width: 8px;
          height: 8px;
          background: var(--accent);
          animation: nce-pulse 1.5s ease-in-out infinite;
        }
        .nce-module-info {
          display: flex;
          flex-direction: column;
        }
        .nce-module-name {
          font-size: 8px;
          font-weight: 700;
          color: var(--accent);
          letter-spacing: 1px;
        }
        .nce-module-status {
          font-size: 7px;
          opacity: 0.35;
          letter-spacing: 1px;
        }

        /* ═══════════════════════════════════════════
         *  EXPANDED STATE
         * ═══════════════════════════════════════════ */

        /* Node 1 → small satellite, top-left */
        .nce-expanded .nce-node-1 {
          width: 60px; height: 60px;
          border-radius: 10px;
          transform: translate(-180px, -110px);
        }

        /* Node 2 → large center circle */
        .nce-expanded .nce-node-2 {
          width: 150px; height: 150px;
          border-radius: 50%;
          border-width: 4px;
          transform: translate(0, 0);
          box-shadow: 0 0 50px rgba(254,224,122,0.2);
          background: var(--accent);
          color: #000;
        }
        .nce-expanded .nce-core-icon {
          width: 36px;
          height: 36px;
          margin-bottom: 8px;
        }
        .nce-expanded .nce-core-title {
          font-size: 13px;
          letter-spacing: -0.5px;
        }
        .nce-expanded .nce-core-sub {
          font-size: 8px;
          letter-spacing: 2.5px;
        }

        /* Node 3 → small satellite, bottom-left */
        .nce-expanded .nce-node-3 {
          width: 60px; height: 60px;
          border-radius: 10px;
          transform: translate(-180px, 110px);
        }

        /* Node 4 → small satellite, right */
        .nce-expanded .nce-node-4 {
          width: 60px; height: 60px;
          border-radius: 10px;
          transform: translate(190px, 0);
        }

        /* Satellite styling in expanded state */
        .nce-expanded .nce-node-1,
        .nce-expanded .nce-node-3,
        .nce-expanded .nce-node-4 {
          border-color: rgba(254,224,122,0.5);
        }
        .nce-expanded .nce-node-1 .nce-node-icon,
        .nce-expanded .nce-node-3 .nce-node-icon,
        .nce-expanded .nce-node-4 .nce-node-icon {
          width: 18px; height: 18px;
          margin-bottom: 3px;
        }
        .nce-expanded .nce-node-1 .nce-node-label,
        .nce-expanded .nce-node-3 .nce-node-label,
        .nce-expanded .nce-node-4 .nce-node-label {
          font-size: 6px;
          letter-spacing: 2px;
        }

        /* Connectors appear */
        .nce-expanded .nce-path-line {
          stroke-dashoffset: 0;
        }
        .nce-expanded .nce-path-1 { transition-delay: 0.15s; }
        .nce-expanded .nce-path-2 { transition-delay: 0.25s; }
        .nce-expanded .nce-path-3 { transition-delay: 0.35s; }

        /* ── Keyframes ── */
        @keyframes nce-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        /* ── Responsive ── */
        @media (max-width: 575px) {
          .nce-node-1, .nce-node-2, .nce-node-3, .nce-node-4 {
            width: 80px !important; height: 80px !important;
          }
          .nce-node-1 { transform: translate(-46px, -46px); }
          .nce-node-2 { transform: translate(46px, -46px); }
          .nce-node-3 { transform: translate(-46px, 46px); }
          .nce-node-4 { transform: translate(46px, 46px); }

          .nce-expanded .nce-node-2 {
            width: 110px !important; height: 110px !important;
          }
          .nce-expanded .nce-node-1 { width: 46px !important; height: 46px !important; transform: translate(-120px, -80px); }
          .nce-expanded .nce-node-3 { width: 46px !important; height: 46px !important; transform: translate(-120px, 80px); }
          .nce-expanded .nce-node-4 { width: 46px !important; height: 46px !important; transform: translate(130px, 0); }

          .nce-status-bar { display: none; }
          .nce-module-badge { display: none; }
        }
      `}</style>
    </div>
  );
};

export default GlitchTechAnimation;
