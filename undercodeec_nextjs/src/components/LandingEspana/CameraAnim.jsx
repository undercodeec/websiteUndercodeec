"use client";

import React, { useEffect, useRef } from "react";
import { animate, utils, spring } from "animejs";

export default function CameraAnim({ ariaLabel = "Lente de cámara animado" }) {
  const wrapperRef = useRef(null);
  const lensRef = useRef(null);
  const bladesRef = useRef(null);
  const irisRef = useRef(null);
  const innerShineRef = useRef(null);
  const coatingRef = useRef(null);
  const centerSquareRef = useRef(null);
  const orbitDotsRef = useRef([]);
  const accentCircleRef = useRef(null);

  useEffect(() => {
    if (!lensRef.current || !wrapperRef.current) return;

    const lens = lensRef.current;
    const springIn = spring();
    const outEase = "out(3)";

    utils.set(lens, { rotate: 0, scale: 0.001 });

    const rotateAnim = animate(lens, {
      id: "intuitive-rotate",
      rotate: "+=360",
      loop: true,
      duration: 18000,
      ease: "linear",
      autoplay: false,
    });

    const ambient = [];
    if (bladesRef.current) {
      ambient.push(
        animate(bladesRef.current, {
          rotate: [0, 22],
          duration: 2800,
          ease: "inOutQuad",
          loop: true,
          alternate: true,
        })
      );
    }
    if (irisRef.current) {
      ambient.push(
        animate(irisRef.current, {
          scale: [0.85, 1.12],
          duration: 1800,
          ease: "inOutSine",
          loop: true,
          alternate: true,
        })
      );
    }
    if (innerShineRef.current) {
      ambient.push(
        animate(innerShineRef.current, {
          opacity: [0.45, 0.9],
          scale: [0.92, 1.08],
          duration: 1600,
          ease: "inOutQuad",
          loop: true,
          alternate: true,
        })
      );
    }
    if (coatingRef.current) {
      ambient.push(
        animate(coatingRef.current, {
          opacity: [0.25, 0.55],
          duration: 3400,
          ease: "inOutSine",
          loop: true,
          alternate: true,
        })
      );
    }

    if (centerSquareRef.current) {
      ambient.push(
        animate(centerSquareRef.current, {
          rotate: "-=360",
          duration: 9000,
          ease: "linear",
          loop: true,
        })
      );
    }

    if (accentCircleRef.current) {
      ambient.push(
        animate(accentCircleRef.current, {
          scale: [0.6, 1.1],
          opacity: [0.55, 1],
          duration: 1600,
          ease: "inOutSine",
          loop: true,
          alternate: true,
        })
      );
    }

    orbitDotsRef.current.forEach((node, i) => {
      if (!node) return;
      ambient.push(
        animate(node, {
          rotate: i % 2 === 0 ? "+=360" : "-=360",
          duration: 5000 + i * 1200,
          ease: "linear",
          loop: true,
        })
      );
    });

    let enterAnim = null;
    let leaveAnim = null;
    let isIn = false;

    const onEnter = () => {
      if (isIn) return;
      isIn = true;
      if (leaveAnim && typeof leaveAnim.pause === "function") leaveAnim.pause();
      enterAnim = animate(lens, {
        id: "intuitive-enter",
        scale: 1,
        ease: springIn,
      });
      rotateAnim.restart();
    };

    const onLeave = () => {
      if (!isIn) return;
      isIn = false;
      if (enterAnim && typeof enterAnim.pause === "function") enterAnim.pause();
      leaveAnim = animate(lens, {
        id: "intuitive-leave",
        scale: 0,
        duration: 250,
        ease: outEase,
      });
      rotateAnim.pause();
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) onEnter();
          else onLeave();
        });
      },
      { threshold: 0.25 }
    );
    observer.observe(wrapperRef.current);

    return () => {
      observer.disconnect();
      [rotateAnim, enterAnim, leaveAnim, ...ambient].forEach((a) => {
        if (a && typeof a.pause === "function") a.pause();
      });
    };
  }, []);

  const bladeCount = 9;
  const knurlCount = 64;

  return (
    <div
      ref={wrapperRef}
      className="camera-anim-wrapper"
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "transparent",
      }}
    >
      <svg
        ref={lensRef}
        className="camera-anim"
        viewBox="-115 -115 230 230"
        role="img"
        aria-label={ariaLabel}
        xmlns="http://www.w3.org/2000/svg"
        style={{
          width: "100%",
          height: "100%",
          overflow: "visible",
          willChange: "transform",
          transformBox: "fill-box",
          transformOrigin: "center",
        }}
      >
        <defs>
          <radialGradient id="lensGlass" cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor="#0a1418" />
            <stop offset="40%" stopColor="#0d2030" />
            <stop offset="75%" stopColor="#040a10" />
            <stop offset="100%" stopColor="#000000" />
          </radialGradient>
          <radialGradient id="lensCoating" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#6fc3d1" stopOpacity="0" />
            <stop offset="40%" stopColor="#3a7d8c" stopOpacity="0.55" />
            <stop offset="70%" stopColor="#1f5a4c" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#0a1418" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="lensIris" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#dff4f9" />
            <stop offset="22%" stopColor="#5fb6c5" />
            <stop offset="50%" stopColor="#1f4658" />
            <stop offset="100%" stopColor="#040a10" />
          </radialGradient>
          <radialGradient id="lensHighlight" cx="32%" cy="28%" r="42%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="50%" stopColor="#cfeaff" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="lensFlare" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="45%" stopColor="#a6f1ff" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#a6f1ff" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="chromeRing" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f4f4f4" />
            <stop offset="20%" stopColor="#bcbcbc" />
            <stop offset="50%" stopColor="#5f5f5f" />
            <stop offset="80%" stopColor="#9a9a9a" />
            <stop offset="100%" stopColor="#e8e8e8" />
          </linearGradient>
          <linearGradient id="darkRing" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3a3a3a" />
            <stop offset="50%" stopColor="#101010" />
            <stop offset="100%" stopColor="#2b2b2b" />
          </linearGradient>
          <linearGradient id="grip" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#222222" />
            <stop offset="50%" stopColor="#080808" />
            <stop offset="100%" stopColor="#1a1a1a" />
          </linearGradient>
          <linearGradient id="silverEdge" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#7a7a7a" />
            <stop offset="50%" stopColor="#e0e0e0" />
            <stop offset="100%" stopColor="#7a7a7a" />
          </linearGradient>
          <filter id="lensSoftGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <circle r="104" fill="url(#darkRing)" stroke="#000" strokeWidth="0.6" />
        <circle r="104" fill="none" stroke="url(#silverEdge)" strokeWidth="1.2" opacity="0.55" />
        <circle r="100" fill="none" stroke="#ffffff" strokeOpacity="0.08" strokeWidth="0.6" />

        <circle r="96" fill="url(#grip)" />
        {Array.from({ length: knurlCount }).map((_, i) => {
          const angle = (i * (360 / knurlCount) * Math.PI) / 180;
          const r1 = 88;
          const r2 = 96;
          return (
            <line
              key={`knurl-${i}`}
              x1={Math.cos(angle) * r1}
              y1={Math.sin(angle) * r1}
              x2={Math.cos(angle) * r2}
              y2={Math.sin(angle) * r2}
              stroke="#3a3a3a"
              strokeWidth="1"
              strokeLinecap="round"
            />
          );
        })}
        <circle r="88" fill="none" stroke="#5a5a5a" strokeWidth="0.7" />

        <circle r="86" fill="url(#chromeRing)" />
        <circle r="86" fill="none" stroke="#000000" strokeOpacity="0.4" strokeWidth="0.4" />

        {Array.from({ length: 4 }).map((_, i) => {
          const angle = (i * 90 + 45) * (Math.PI / 180);
          const cx = Math.cos(angle) * 82;
          const cy = Math.sin(angle) * 82;
          return (
            <g key={`screw-${i}`}>
              <circle cx={cx} cy={cy} r="2.2" fill="#1a1a1a" />
              <line
                x1={cx - 1.6}
                y1={cy}
                x2={cx + 1.6}
                y2={cy}
                stroke="#3a3a3a"
                strokeWidth="0.6"
                strokeLinecap="round"
              />
            </g>
          );
        })}

        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 30 - 90) * (Math.PI / 180);
          const r1 = 76;
          const r2 = 80;
          return (
            <line
              key={`scale-${i}`}
              x1={Math.cos(angle) * r1}
              y1={Math.sin(angle) * r1}
              x2={Math.cos(angle) * r2}
              y2={Math.sin(angle) * r2}
              stroke="#dadada"
              strokeWidth="0.9"
              opacity="0.9"
            />
          );
        })}

        <circle r="74" fill="url(#darkRing)" />
        {Array.from({ length: 36 }).map((_, i) => {
          const angle = (i * 10 * Math.PI) / 180;
          const r1 = 68;
          const r2 = 74;
          return (
            <line
              key={`finescale-${i}`}
              x1={Math.cos(angle) * r1}
              y1={Math.sin(angle) * r1}
              x2={Math.cos(angle) * r2}
              y2={Math.sin(angle) * r2}
              stroke="#9a9a9a"
              strokeWidth="0.5"
              opacity="0.7"
            />
          );
        })}
        <circle r="68" fill="none" stroke="#000" strokeOpacity="0.5" strokeWidth="0.6" />

        <circle r="66" fill="url(#chromeRing)" />
        <circle r="66" fill="none" stroke="#000" strokeOpacity="0.55" strokeWidth="0.5" />

        <circle r="62" fill="#050505" />
        <circle r="62" fill="none" stroke="#1a1a1a" strokeWidth="0.4" />

        <circle r="58" fill="url(#lensGlass)" />
        <circle
          ref={coatingRef}
          r="56"
          fill="url(#lensCoating)"
          opacity="0.4"
        />

        <g
          ref={bladesRef}
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
          opacity="0.92"
        >
          {Array.from({ length: bladeCount }).map((_, i) => {
            const angle = (i * (360 / bladeCount) * Math.PI) / 180;
            const angleNext = ((i + 1) * (360 / bladeCount) * Math.PI) / 180;
            const inner = 16;
            const outer = 52;
            const x1 = Math.cos(angle) * inner;
            const y1 = Math.sin(angle) * inner;
            const x2 = Math.cos(angle) * outer;
            const y2 = Math.sin(angle) * outer;
            const x3 = Math.cos(angleNext) * outer;
            const y3 = Math.sin(angleNext) * outer;
            return (
              <path
                key={`blade-${i}`}
                d={`M ${x1} ${y1} L ${x2} ${y2} A ${outer} ${outer} 0 0 1 ${x3} ${y3} Z`}
                fill="#040a10"
                stroke="#2a4750"
                strokeOpacity="0.45"
                strokeWidth="0.5"
              />
            );
          })}
        </g>

        <g
          ref={irisRef}
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
        >
          <circle r="26" fill="url(#lensIris)" />
          <circle r="18" fill="#020608" />
          <circle
            ref={innerShineRef}
            r="10"
            fill="#a6f1ff"
            opacity="0.6"
            filter="url(#lensSoftGlow)"
          />
        </g>

        <g
          ref={centerSquareRef}
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
        >
          <rect
            x="-8"
            y="-8"
            width="16"
            height="16"
            fill="#a6f1ff"
            stroke="#ffffff"
            strokeWidth="0.6"
            strokeOpacity="0.6"
          />
        </g>

        <g
          ref={(el) => (orbitDotsRef.current[0] = el)}
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
        >
          <circle cx="34" cy="0" r="2" fill="#a6f1ff" opacity="0.85" />
        </g>
        <g
          ref={(el) => (orbitDotsRef.current[1] = el)}
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
        >
          <circle cx="-30" cy="0" r="1.6" fill="#dff4f9" opacity="0.7" />
        </g>
        <g
          ref={(el) => (orbitDotsRef.current[2] = el)}
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
        >
          <rect x="40" y="-2" width="4" height="4" fill="#5fb6c5" opacity="0.65" />
        </g>
        <g
          ref={(el) => (orbitDotsRef.current[3] = el)}
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
        >
          <polygon points="-44,-3 -40,3 -48,3" fill="#cfeaff" opacity="0.6" />
        </g>

        <circle
          ref={accentCircleRef}
          r="3"
          fill="#ffffff"
          opacity="0.9"
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
        />
      </svg>
    </div>
  );
}
