"use client";

import React, { useRef, useEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
} from "framer-motion";
import dynamic from "next/dynamic";
import CameraAnim from "@/components/LandingEspana/CameraAnim";

const MoonMini = dynamic(() => import("@/components/3D/MoonMini"), {
  ssr: false,
});

const PROJECTS = [
  {
    name: "Proyecto 1",
    style: "Diseño glassmorphism con animaciones fluidas y paleta neón.",
    image: "/assets/projects/placeholder-1.jpg",
    link: "/es/proyectos/proyecto-1",
  },
  {
    name: "21HRS on the Moon",
    style: "Experiencia 3D interactiva: explora un modelo lunar en tiempo real con WebGL.",
    image: "/assets/projects/placeholder-2.jpg",
    link: "/es/proyectos/proyecto-2",
  },
  {
    name: "Proyecto 3",
    style: "Experiencia inmersiva 3D con WebGL y scroll cinematográfico.",
    image: "/assets/projects/placeholder-3.jpg",
    link: "/es/proyectos/proyecto-3",
  },
  {
    name: "Proyecto 4",
    style: "Minimalismo premium con parallax sutil y enfoque en conversión.",
    image: "/assets/projects/placeholder-4.jpg",
    link: "/es/proyectos/proyecto-4",
  },
  {
    name: "Proyecto 5",
    style: "Diseño editorial con scroll horizontal y transiciones cinematográficas.",
    image: "/assets/projects/placeholder-5.jpg",
    link: "/es/proyectos/proyecto-5",
  },
  {
    name: "Proyecto 6",
    style: "Dashboard premium con dataviz interactiva y modo oscuro nativo.",
    image: "/assets/projects/placeholder-6.jpg",
    link: "/es/proyectos/placeholder-6",
  },
];

export default function ScrollJourneyLine() {
  const sectionRef = useRef(null);
  const pathRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 20,
    mass: 0.3,
  });

  const pathLength = useTransform(smoothProgress, [0.05, 0.95], [0, 1]);

  // Sphere position follows path tip
  const sphereX = useMotionValue(200);
  const sphereY = useMotionValue(0);

  useEffect(() => {
    return pathLength.on("change", (v) => {
      if (!pathRef.current) return;
      const totalLen = pathRef.current.getTotalLength();
      const pt = pathRef.current.getPointAtLength(v * totalLen);
      sphereX.set(pt.x);
      sphereY.set(pt.y);
    });
  }, [pathLength, sphereX, sphereY]);

  // Chip opacity fades out near end
  const sphereOpacity = useTransform(smoothProgress, [0.70, 0.84], [1, 0]);

  return (
    <section ref={sectionRef} className="scroll-journey">
      <div className="container">
        <section className="journey-intro">
          <span className="journey-eyebrow">Diseños que enamoran</span>
          <h2 className="journey-title">
            Esto no es una web cualquiera.<br />
            <span className="journey-title-grad">Mira lo que hacemos.</span>
          </h2>
          <p className="journey-sub">
            Desplázate hacia abajo y descubre proyectos reales con diseños
            impactantes, animaciones únicas y experiencias hechas a medida.
            Cada uno está pensado para destacar — porque tu marca también lo merece.
          </p>
        </section>

        <div className="journey-wrapper tw-relative tw-overflow-hidden">
          <div className="tw-absolute tw-inset-0 gradient-bg tw-z-0 tw-pointer-events-none" />
          <div className="tw-absolute tw-inset-0 tw-flex tw-items-center tw-justify-center tw-pointer-events-none tw-z-[1]">
            <img
              src="/assets/slider/6fa818bb935c0e2a1081f259d84df226b237a184.png"
              alt=""
              className="rotating-pattern tw-w-full tw-h-full tw-object-cover tw-opacity-30 tw-pointer-events-none"
            />
          </div>
          <div className="gradient-blob-1 tw-pointer-events-none" />
          <div className="gradient-blob-2 tw-pointer-events-none" />
          <div className="gradient-blob-3 tw-pointer-events-none" />

          <svg
            className="journey-svg"
            viewBox="0 0 400 1600"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="journeyGradient" x1="0" y1="0" x2="1" y2="0" gradientUnits="objectBoundingBox">
                <stop offset="0%"   stopColor="#0055ff" />
                <stop offset="30%"  stopColor="#001133" />
                <stop offset="73%"  stopColor="#00f0ff" />
                <stop offset="100%" stopColor="#00f0ff" />
              </linearGradient>
              <radialGradient id="sphereGrad" cx="35%" cy="35%" r="65%">
                <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.9" />
                <stop offset="25%"  stopColor="#00f0ff" />
                <stop offset="55%"  stopColor="#0055ff" />
                <stop offset="80%"  stopColor="#001133" />
                <stop offset="100%" stopColor="#00f0ff" stopOpacity="0.6" />
              </radialGradient>
              <radialGradient id="sphereGrad2" cx="65%" cy="65%" r="65%">
                <stop offset="0%"   stopColor="#00f0ff" stopOpacity="0.8" />
                <stop offset="40%"  stopColor="#0055ff" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#001133" stopOpacity="0" />
              </radialGradient>
              <filter id="journeyGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="sphereGlow" x="-80%" y="-80%" width="260%" height="260%">
                <feGaussianBlur stdDeviation="10" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Track path */}
            <path
              d="M200 0 C 60 250, 340 550, 200 800 S 60 1350, 200 1600"
              fill="none"
              stroke="rgba(255, 255, 255, 0.18)"
              strokeWidth="6"
              strokeLinecap="round"
            />

            {/* Animated drawn path */}
            <motion.path
              ref={pathRef}
              d="M200 0 C 60 250, 340 550, 200 800 S 60 1350, 200 1600"
              fill="none"
              stroke="url(#journeyGradient)"
              strokeWidth="6"
              strokeLinecap="round"
              style={{ pathLength, opacity: sphereOpacity }}
              filter="url(#journeyGlow)"
            />

            {/* Electromagnetic Pulses */}
            <path
              className="pulse-path"
              d="M200 0 C 60 250, 340 550, 200 800 S 60 1350, 200 1600"
              fill="none"
              stroke="#00f0ff"
              strokeWidth="2.5"
              strokeLinecap="round"
              pathLength="1"
              filter="url(#journeyGlow)"
            />

            {/* Minimalist Chip at path tip */}
            <motion.g
              style={{ x: sphereX, y: sphereY, opacity: sphereOpacity }}
              filter="url(#sphereGlow)"
            >
              {/* Pins (Legs) */}
              <g fill="#00f0ff" opacity="0.9">
                <rect x="-22" y="-12" width="6" height="4" rx="1" />
                <rect x="-22" y="-2" width="6" height="4" rx="1" />
                <rect x="-22" y="8" width="6" height="4" rx="1" />
                
                <rect x="16" y="-12" width="6" height="4" rx="1" />
                <rect x="16" y="-2" width="6" height="4" rx="1" />
                <rect x="16" y="8" width="6" height="4" rx="1" />
                
                <rect x="-12" y="-22" width="4" height="6" rx="1" />
                <rect x="-2" y="-22" width="4" height="6" rx="1" />
                <rect x="8" y="-22" width="4" height="6" rx="1" />
                
                <rect x="-12" y="16" width="4" height="6" rx="1" />
                <rect x="-2" y="16" width="4" height="6" rx="1" />
                <rect x="8" y="16" width="4" height="6" rx="1" />
              </g>

              {/* Chip Body */}
              <rect x="-18" y="-18" width="36" height="36" rx="4" fill="#000511" stroke="#00f0ff" strokeWidth="1.5" />
              
              {/* Internal Circuit Tracks (Base) */}
              <path d="M-18 -10 L-8 -10 L-8 -6 M-18 10 L-8 10 L-8 6 M18 -10 L8 -10 L8 -6 M18 10 L8 10 L8 6" fill="none" stroke="#001133" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              
              {/* Animated Internal Circuits */}
              <path className="elec-path" d="M-18 -10 L-8 -10 L-8 -6 M-18 10 L-8 10 L-8 6 M18 -10 L8 -10 L8 -6 M18 10 L8 10 L8 6" fill="none" stroke="#00f0ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

              {/* Inner Core */}
              <rect x="-6" y="-6" width="12" height="12" rx="2" fill="#001133" stroke="#0055ff" strokeWidth="1" />
              <circle className="chip-core-pulse" cx="0" cy="0" r="3" fill="#ffffff" />
            </motion.g>
          </svg>

          <ol className="journey-grid">
            {PROJECTS.map((p, i) => {
              const side = i % 2 === 0 ? "left" : "right";
              return (
                <JourneyStep
                  key={i}
                  index={i + 1}
                  project={p}
                  side={side}
                  topOffset={(i * 220) - (Math.floor(i / 2) * 320)}
                />
              );
            })}
          </ol>

        </div>
      </div>

      <style jsx>{`
        .scroll-journey {
          padding: 0px;
          position: relative;
          z-index: 1;
        }
        .elec-path {
          stroke-dasharray: 4 12;
          animation: flow-elec 1.2s linear infinite;
        }
        @keyframes flow-elec {
          to { stroke-dashoffset: -16; }
        }
        .pulse-path {
          stroke-dasharray: 0.015 0.12;
          animation: flow-pulse 3s linear infinite;
          opacity: 0.8;
        }
        @keyframes flow-pulse {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -1; }
        }
        .chip-core-pulse {
          animation: core-pulse 1s ease-in-out infinite alternate;
          transform-origin: center;
        }
        @keyframes core-pulse {
          0% { opacity: 0.5; fill: #00f0ff; transform: scale(0.85); }
          100% { opacity: 1; fill: #ffffff; transform: scale(1.15); }
        }
        .journey-intro {
          text-align: center;
          max-width: 760px;
          margin: 0 auto 80px;
          padding: 60px 20px 0;
          background: transparent;
          position: relative;
        }
        .journey-intro::before,
        .journey-intro::after {
          content: none !important;
          display: none !important;
          background: none !important;
        }
        .journey-eyebrow {
          display: inline-block;
          text-transform: uppercase;
          font-weight: 700;
          letter-spacing: 2px;
          font-size: 13px;
          background: linear-gradient(90deg, #0055ff 0%, #001133 30%, #00f0ff 73%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 18px;
        }
        .journey-title {
          font-size: clamp(30px, 4.5vw, 50px);
          font-weight: 800;
          color: #000511;
          line-height: 1.15;
          margin-bottom: 18px;
        }
        .journey-title-grad {
          background: linear-gradient(90deg, #0055ff 0%, #001133 30%, #00f0ff 73%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .journey-sub {
          color: #5a5566;
          font-size: 17px;
          line-height: 1.7;
          margin-bottom: 0;
        }
        .journey-wrapper {
          position: relative;
          max-width: 1100px;
          margin: 0 auto;
        }
        .journey-svg {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 200px;
          height: 100%;
          pointer-events: none;
          z-index: 0;
          overflow: visible;
        }
        .journey-grid {
          position: relative;
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          grid-template-columns: 1fr 1fr;
          column-gap: 120px;
          row-gap: 80px;
          z-index: 1;
          padding-bottom: 700px;
        }
        @media (max-width: 900px) {
          .scroll-journey { padding: 70px 0 90px; }
          .journey-svg { display: none; }
          .journey-grid {
            grid-template-columns: 1fr;
            row-gap: 50px;
            padding-bottom: 60px;
          }
        }
      `}</style>
    </section>
  );
}

function JourneyStep({ index, project, side, topOffset = 0 }) {
  return (
    <motion.li
      className={`step step--${side}`}
      style={{ position: "relative", top: `${topOffset}px` }}
      initial={{ opacity: 0.15, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.3 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className="step-dot"
        initial={{ scale: 0.85 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <span>{index}</span>
      </motion.div>

      <a
        href={index === 1 ? "https://understudio.undercodeec.com/" : project.link}
        target={index === 1 ? "_blank" : undefined}
        rel={index === 1 ? "noopener noreferrer" : undefined}
        className={`step-card${index === 1 ? " step-card--anim" : ""}`}
        aria-label={index === 1 ? "Visita Understudio en undercodeec.com" : `Ver ${project.name}`}
      >
        {index === 1 ? (
          <div className="step-card-anim">
            <span className="lens-pulse" aria-hidden="true" />
            <span className="lens-pulse lens-pulse--delay" aria-hidden="true" />
            <div className="lens-wrap">
              <CameraAnim ariaLabel={`Animación cámara de ${project.name}`} />
            </div>
            <div className="lens-cta">
              <span className="lens-cta-title">Entra a Understudio</span>
              <span className="lens-cta-sub">
                Captura nuestro estudio creativo
                <svg
                  className="lens-cta-arrow"
                  viewBox="0 0 24 24"
                  width="14"
                  height="14"
                  aria-hidden="true"
                >
                  <path
                    d="M5 12h14M13 6l6 6-6 6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </div>
          </div>
        ) : index === 2 ? (
          <>
            <div className="step-card-moon" aria-hidden="true">
              <MoonMini />
            </div>
            <div className="step-card-overlay step-card-overlay--moon">
              <h3>{project.name}</h3>
              <p>{project.style}</p>
            </div>
          </>
        ) : (
          <>
            <img
              src={project.image}
              alt={project.name}
              loading="lazy"
              onError={(e) => { e.currentTarget.style.opacity = "0"; }}
            />
            <div className="step-card-overlay">
              <h3>{project.name}</h3>
              <p>{project.style}</p>
            </div>
          </>
        )}
      </a>

      <style jsx>{`
        .step {
          position: relative;
          display: flex;
          align-items: center;
          margin: 0;
          padding: 0;
        }
        .step--left {
          grid-column: 1;
          justify-content: flex-end;
        }
        .step--right {
          grid-column: 2;
          justify-content: flex-start;
        }
        .step-dot {
          position: absolute;
          top: 50%;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(90deg, #0055ff 0%, #001133 30%, #00f0ff 73%);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 22px;
          box-shadow: 0 10px 30px rgba(0, 85, 255, 0.4);
          z-index: 3;
          border: 4px solid #fff;
        }
        .step--left .step-dot {
          right: -90px;
          transform: translateY(-50%);
        }
        .step--right .step-dot {
          left: -90px;
          transform: translateY(-50%);
        }
        .step-card {
          display: block;
          width: 100%;
          max-width: 320px;
          aspect-ratio: 4 / 3;
          background: transparent;
          border-radius: 18px;
          overflow: hidden;
          border: none;
          text-decoration: none;
          color: inherit;
          position: relative;
        }
        .step-card img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .step-card-moon {
          position: absolute;
          inset: 0;
          z-index: 1;
          background: transparent;
        }
        .step-card-anim {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 0;
          background: transparent;
          cursor: pointer;
        }
        .lens-wrap {
          position: relative;
          width: 78%;
          height: 78%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1),
                      filter 0.45s ease;
          z-index: 2;
        }
        .step-card--anim:hover .lens-wrap {
          transform: scale(1.08);
          filter: drop-shadow(0 8px 28px rgba(166, 241, 255, 0.45));
        }
        .step-card--anim:active .lens-wrap {
          transform: scale(0.98);
        }
        .step-card-anim :global(.intuitive-demo-mini),
        .step-card-anim :global(.camera-anim-wrapper),
        .step-card-anim :global(svg.camera-anim) {
          width: 100%;
          height: 100%;
          max-width: 100%;
          max-height: 100%;
          display: block;
          overflow: visible;
        }
        .lens-pulse {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 60%;
          aspect-ratio: 1 / 1;
          border-radius: 50%;
          border: 2px solid rgba(166, 241, 255, 0.55);
          transform: translate(-50%, -50%);
          animation: lens-pulse 2.4s ease-out infinite;
          pointer-events: none;
          z-index: 1;
        }
        .lens-pulse--delay {
          animation-delay: 1.2s;
        }
        @keyframes lens-pulse {
          0% {
            transform: translate(-50%, -50%) scale(0.7);
            opacity: 0.75;
            border-width: 2px;
          }
          70% {
            opacity: 0.15;
            border-width: 1px;
          }
          100% {
            transform: translate(-50%, -50%) scale(1.45);
            opacity: 0;
            border-width: 0.5px;
          }
        }
        .lens-cta {
          position: absolute;
          left: 0;
          right: 0;
          bottom: -38px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 0 12px;
          text-align: center;
          z-index: 3;
          pointer-events: none;
        }
        .lens-cta-title {
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.04em;
          color: #000511;
          text-transform: uppercase;
        }
        .lens-cta-sub {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 600;
          color: #5a5566;
          transition: color 0.3s ease, transform 0.3s ease;
        }
        .lens-cta-arrow {
          transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .step-card--anim:hover .lens-cta-sub {
          color: #000511;
        }
        .step-card--anim:hover .lens-cta-arrow {
          transform: translateX(4px);
        }
        .step-card--anim {
          background: transparent !important;
          overflow: visible;
        }
        @media (prefers-reduced-motion: reduce) {
          .lens-pulse { animation: none; opacity: 0; }
          .lens-wrap { transition: none; }
        }
        .step-card-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 20px 22px;
          background: linear-gradient(180deg, rgba(21, 14, 35, 0) 30%, rgba(21, 14, 35, 0.85) 100%);
          z-index: 2;
        }
        .step-card-overlay--moon {
          background: none;
        }
        .step-card-overlay h3 {
          font-size: 20px;
          font-weight: 800;
          margin: 0 0 6px;
          color: #ffffff;
          text-shadow: 0 2px 12px rgba(0, 0, 0, 0.5);
        }
        .step-card-overlay p {
          margin: 0;
          color: rgba(255, 255, 255, 0.92);
          font-size: 13px;
          line-height: 1.5;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
        }
        @media (max-width: 900px) {
          .step, .step--left, .step--right {
            grid-column: 1;
            justify-content: center;
            top: 0 !important;
          }
          .step-dot,
          .step--left .step-dot,
          .step--right .step-dot {
            position: static;
            transform: none;
            margin: 0 auto -30px;
          }
          .step { flex-direction: column; }
          .step-card { max-width: 100%; }
        }
      `}</style>
    </motion.li>
  );
}
