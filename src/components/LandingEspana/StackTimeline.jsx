"use client";

import { createElement, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import MoonMini from "@/components/3D/MoonMini";
import IsometricVoxelCard from "@/components/LandingEspana/IsometricVoxelCard";
import OrbVisualizer from "@/components/LandingEspana/OrbVisualizer";
import { STACK_TIMELINE_HTML } from "@/components/LandingEspana/stackTimelineHtml";

/* Réplica EXACTA y self-contained de la sección "Innovación, diseñada."
   (timeline [scrollto-lenis] de sui.io / stack-demo). NO depende del sitio
   demo: el markup verbatim + el CSS Webflow original + las animaciones se
   montan aquí dentro.

   Aislamiento por Shadow DOM: el CSS de Webflow (650KB) vive dentro del
   shadow root, así no colisiona con los estilos de la landing ni al revés.
   La sección fluye con el scroll nativo de la página (sin iframe ni nested
   scroll). Assets (fuentes .otf/.woff2, iconos .riv) se sirven desde el CDN
   de Webflow, independiente del stack-demo. */

const BASE = "/landing-espana/stack-timeline";
const CARD_LINKS = {
  1: "https://understudio.undercodeec.com",
  2: "https://understudio.undercodeec.com/demo-moon",
  3: "https://understudio.undercodeec.com/stack-demo",
};

// Overrides de tema BLANCO (contenido de texto intacto, solo re-tinte de lo
// que en el original era claro-sobre-oscuro).
const WHITE_THEME = `
  :host { display: block; background: #ffffff; }
  .st-root {
    font-family: "TWK Everett", Arial, sans-serif;
    font-size: 16px;
    line-height: 1.4;
    color: #0a0a0f;
    background: #ffffff;
  }
  [scrollto-lenis] { background: #ffffff; }
  [scrollto-lenis] .color-white,
  [scrollto-lenis] .h2-90px.color-white,
  [scrollto-lenis] .ts-14px.color-white { color: #0a0a0f !important; }
  [scrollto-lenis] .ts-18px { color: #0a0a0f !important; }
  [scrollto-lenis] .color-gray,
  [scrollto-lenis] .ts-18px.color-gray { color: #6a6f7a !important; }
  /* Heading + subtítulo con relleno degradado (clip text). */
  [scrollto-lenis] .timeline_heading .h2-90px {
    color: #0000 !important;
    -webkit-text-fill-color: transparent;
    background-image: linear-gradient(90deg, #600b56 0%, #270f31 30%, #efa238 73%);
    -webkit-background-clip: text;
    background-clip: text;
    margin: 0 0 20px;
    font-size: max(28px, min(3.6vw, 56px));
    font-weight: 800;
    line-height: 1.1;
    text-align: center;
  }
  [scrollto-lenis] .timeline_heading .ts-18px {
    color: transparent !important;
    -webkit-text-fill-color: transparent;
    background-image: linear-gradient(90deg, #600b56 0%, #270f31 30%, #efa238 73%);
    -webkit-background-clip: text;
    background-clip: text;
    padding-bottom: 15px;
  }
  [scrollto-lenis] .timeline_num { color: #0a0a0f !important; border-color: #d3d7e0 !important; }
  [scrollto-lenis] .timeline_colum_card { border-top-color: #e2e5ec !important; }
  /* Quitar fondo oscuro Webflow (#131518) de los cards — fondo transparente */
  [scrollto-lenis] .colum_card_main {
    background-color: transparent !important;
    border-color: #e2e5ec !important;
  }
  [scrollto-lenis] .timeline_card_anim { background: transparent !important; }
  /* timeline_wrapper: sin padding-top y row-gap reducido */
  [scrollto-lenis] .timeline_wrapper {
    padding-top: 0 !important;
    grid-row-gap: 5.625em !important;
  }
  /* Card 03: el blanco vive en el contenedor; el canvas renderiza normal
     para no ocultar ni alterar el modelado de Rive. */
  [scrollto-lenis] .rivesize.third,
  [scrollto-lenis] .rivesize.third .riveicon {
    background: #ffffff !important;
  }
  [scrollto-lenis] .rivesize.third canvas {
    background: transparent !important;
    mix-blend-mode: normal !important;
    display: block !important;
  }

  /* ── Hero background dentro del [scrollto-lenis] ── */
  [scrollto-lenis] { position: relative; overflow: hidden; }
  .st-hero-bg {
    position: absolute; inset: 0; z-index: 0; pointer-events: none; overflow: hidden;
    background: #ffffff;
  }
  .st-rotating-pattern {
    position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
    z-index: 1; pointer-events: none;
  }
  .st-rotating-pattern img {
    width: 100%; height: 100%; object-fit: cover; opacity: 0.3;
    animation: st-rotate-center 60s linear infinite;
  }
  @keyframes st-rotate-center {
    0%   { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  .st-blob-1 {
    position: absolute; width: 700px; height: 700px;
    top: 20%; right: 10%;
    background: radial-gradient(circle, #643ff7 0%, transparent 70%);
    filter: blur(110px); opacity: 0.2; z-index: 1;
    animation: st-float3 22s ease-in-out infinite alternate;
  }
  .st-blob-2 {
    position: absolute; width: 500px; height: 500px;
    bottom: 30%; left: 20%;
    background: radial-gradient(circle, #fdbd55 0%, transparent 70%);
    filter: blur(90px); opacity: 0.15; z-index: 1;
    animation: st-float4 16s ease-in-out infinite alternate;
  }
  .st-blob-3 {
    position: absolute; width: 600px; height: 600px;
    top: 50%; left: 50%;
    background: radial-gradient(circle, #500c4c 0%, transparent 70%);
    filter: blur(100px); opacity: 0.18; z-index: 1;
    animation: st-float5 24s ease-in-out infinite alternate;
  }
  @keyframes st-float3 {
    0%,100% { transform: translate(0,0) scale(1); }
    50%     { transform: translate(-120px,60px) scale(0.95); }
  }
  @keyframes st-float4 {
    0%,100% { transform: translate(0,0) scale(1); }
    50%     { transform: translate(90px,-70px) scale(1.1); }
  }
  @keyframes st-float5 {
    0%,100% { transform: translate(-50%,-50%) scale(1); }
    50%     { transform: translate(calc(-50% + 50px),calc(-50% - 50px)) scale(1.05); }
  }
  /* Asegurar que el contenido del timeline quede sobre el bg */
  [scrollto-lenis] > *:not(.st-hero-bg) { position: relative; z-index: 2; }
  [scrollto-lenis] .timeline_colum_card [global-target] {
    color: transparent !important;
    -webkit-text-fill-color: transparent;
    background-image: linear-gradient(90deg, #600b56 0%, #270f31 30%, #efa238 73%);
    -webkit-background-clip: text;
    background-clip: text;
   
    max-width: 520px;
    margin: 0;
    font-family: "Inter", sans-serif !important;
    font-size: max(15px, min(1.2vw, 18px));
    line-height: 1.65;
    display: block;
  }
  [scrollto-lenis] .timeline_colum_card .ts-18px {
    color: #150e23b3 !important;
    max-width: 520px;
    margin: 0;
    font-size: max(15px, min(1.2vw, 18px));
    line-height: 1.65;
    display: block;
  }
  [scrollto-lenis] .connector_line_top,
  [scrollto-lenis] .connector_line_bottom { background-color: #d3d7e0 !important; }
  [scrollto-lenis] .gray_cube { background-color: #0a0a0f !important; }
  [scrollto-lenis] .timeline_progress { color: #0a0a0f !important; }
  [scrollto-lenis] .white_cube { background: linear-gradient(90deg, #600b56 0%, #270f31 30%, #efa238 73%) !important; }
  [scrollto-lenis] .timeline_current::before { background: linear-gradient(to bottom, #ffffff, transparent) !important; }
  [scrollto-lenis] .timeline_current::after { background: linear-gradient(to top, #ffffff, transparent) !important; }
  /* Colapsar altura sobrante tras ocultar cards */
  [scrollto-lenis] .timeline_main:not(.mobile) { align-items: flex-start !important; }
  [scrollto-lenis] .timeline_main:not(.mobile) .timeline_colum_left,
  [scrollto-lenis] .timeline_main:not(.mobile) .timeline_colum_left.right,
  [scrollto-lenis] .timeline_main:not(.mobile) .timeline_progress_main { height: auto !important; min-height: 0 !important; }

  /* 3-card mode: col-izq solo 1 card (02), col-der solo 2 cards (01,03) */
  [scrollto-lenis] .timeline_main:not(.mobile) .timeline_colum_left:not(.right) .colum_card_main:nth-child(n+2) { display: none !important; }
  [scrollto-lenis] .timeline_main:not(.mobile) .timeline_colum_left.right .colum_card_main:nth-child(n+3) { display: none !important; }
  [scrollto-lenis] .timeline_main:not(.mobile) .timeline_colum_left:not(.right) .colum_card_main:first-child .timeline_connector { display: none !important; }
  [scrollto-lenis] .timeline_main:not(.mobile) .timeline_colum_left.right .colum_card_main:nth-child(2) .timeline_connector { display: none !important; }
  /* Mobile: solo 3 cards */
  [scrollto-lenis] .timeline_main.mobile .colum_card_main:nth-child(n+4) { display: none !important; }
  [scrollto-lenis] .timeline_main.mobile .colum_card_main:nth-child(3) .timeline_connector { display: none !important; }
  /* .mobile solo se muestra en su breakpoint (≤991px). En desktop queda
     display:none (base Webflow) para no duplicar el zigzag. */
  [scrollto-lenis] .timeline_main.mobile {
    align-items: flex-start !important;
    gap: 18px !important;
  }
  @media screen and (max-width: 991px) {
    [scrollto-lenis] .timeline_main.mobile { display: flex !important; }
  }
  [scrollto-lenis] .timeline_main.mobile .mobile_optimized {
    width: 100% !important;
    height: auto !important;
    min-height: 100% !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: stretch !important;
    overflow: visible !important;
  }
  [scrollto-lenis] .timeline_main.mobile .timeline_progress_main {
    position: relative !important;
    height: auto !important;
    min-height: 100% !important;
    flex: 0 0 auto !important;
  }
  [scrollto-lenis] .stack-orb-wrap {
    width: 100%;
    height: 17em !important;
    min-height: 17em !important;
    display: grid;
    place-items: center;
    position: relative;
    overflow: hidden;
    background: transparent;
  }
  [scrollto-lenis] .stack-orb-host {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  [scrollto-lenis] .stack-orb-host canvas {
    width: min(90%, 17em) !important;
    height: min(90%, 17em) !important;
    aspect-ratio: 1 / 1;
    display: block;
    background: transparent !important;
  }
  [scrollto-lenis] .stack-medallion-wrap {
    width: 100%;
    height: 17em !important;
    min-height: 17em !important;
    display: grid;
    place-items: center;
    opacity: 1;
  }
  [scrollto-lenis] .stack-moon-wrap {
    width: 100%;
    height: 17em !important;
    min-height: 17em !important;
    display: grid;
    place-items: center;
    position: relative;
    overflow: hidden;
    background: transparent;
    box-shadow: none;
  }
  [scrollto-lenis] .stack-moon-host {
    position: absolute;
    inset: 0;
  }
  [scrollto-lenis] .stack-moon-wrap canvas {
    width: 100% !important;
    height: 100% !important;
    display: block;
    background: transparent !important;
  }
  [scrollto-lenis] .stack-voxel-wrap {
    width: 100%;
    height: 17em !important;
    min-height: 17em !important;
    position: relative;
    overflow: hidden;
    background: transparent;
  }
  [scrollto-lenis] .stack-voxel-host {
    position: absolute;
    inset: 0;
  }
  [scrollto-lenis] .stack-medallion {
    position: relative;
    width: min(82%, 15.5em);
    aspect-ratio: 1;
    border-radius: 50%;
    overflow: hidden;
    background:
      radial-gradient(circle at 50% 50%, #19191b 0 56%, transparent 57%),
      repeating-conic-gradient(from -3deg, #d44d7f 0deg 1.2deg, transparent 1.2deg 2.7deg),
      conic-gradient(from 170deg, #d59b2d, #251a24 14%, #1d1d20 62%, #a449f0 78%, #d59b2d 100%);
    box-shadow:
      inset 0 0 0 3px #27272a,
      inset 0 0 0 7px #141416,
      0 1px 0 #4c4c50,
      0 12px 22px rgba(10, 10, 15, 0.18);
    transform-origin: center;
    will-change: transform;
  }
  [scrollto-lenis] .stack-medallion > * {
    pointer-events: none;
    will-change: transform, opacity;
  }
  [scrollto-lenis] .stack-medallion::before {
    content: "";
    position: absolute;
    inset: 7.5%;
    border-radius: 50%;
    background:
      conic-gradient(from 86deg, transparent 0 37%, rgba(250, 183, 132, 0.95) 42%, transparent 49% 72%, rgba(198, 56, 111, 0.75) 78%, transparent 86%),
      repeating-conic-gradient(from 0deg, rgba(40, 40, 44, 0.8) 0deg 1deg, transparent 1deg 3deg);
    box-shadow:
      inset 0 0 0 1px rgba(255, 255, 255, 0.05),
      inset 0 0 0 12px #1b1b1e,
      inset 0 0 0 17px #111113;
  }
  [scrollto-lenis] .stack-medallion::after {
    content: "";
    position: absolute;
    inset: 18%;
    border-radius: 50%;
    background:
      linear-gradient(125deg, transparent 2%, rgba(78, 78, 82, 0.85) 3% 10%, transparent 11% 76%, rgba(255, 184, 132, 0.9) 78% 79%, transparent 80%),
      repeating-radial-gradient(circle at 50% 50%, transparent 0 10px, rgba(0, 0, 0, 0.32) 11px 12px);
  }
  [scrollto-lenis] .stack-medallion-rim {
    position: absolute;
    inset: 1.8%;
    border-radius: 50%;
    z-index: 4;
    background:
      conic-gradient(from 0deg, #d79b2b 0 7%, transparent 8% 43%, #f2a66d 45% 52%, transparent 53% 70%, #a449f0 73% 82%, transparent 83% 100%);
    -webkit-mask: radial-gradient(circle, transparent 0 88%, #000 89% 100%);
    mask: radial-gradient(circle, transparent 0 88%, #000 89% 100%);
    transform-origin: center;
  }
  [scrollto-lenis] .stack-medallion-ticks {
    position: absolute;
    inset: 9%;
    border-radius: 50%;
    z-index: 3;
    background: repeating-conic-gradient(from 0deg, #c84b78 0deg 1.15deg, transparent 1.15deg 3.2deg);
    -webkit-mask: radial-gradient(circle, transparent 0 86%, #000 87% 100%);
    mask: radial-gradient(circle, transparent 0 86%, #000 87% 100%);
    transform-origin: center;
    opacity: 0.95;
  }
  [scrollto-lenis] .stack-medallion-core {
    position: absolute;
    inset: 24%;
    border-radius: 50%;
    z-index: 2;
    background:
      repeating-radial-gradient(circle, transparent 0 9px, rgba(0, 0, 0, 0.38) 10px 11px),
      radial-gradient(circle, rgba(30, 30, 34, 0.9), rgba(13, 13, 16, 0.95));
    transform-origin: center;
  }
  [scrollto-lenis] .stack-medallion-diamond {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 43%;
    aspect-ratio: 1;
    transform: translate(-50%, -50%) rotate(45deg);
    background: repeating-linear-gradient(0deg, #bd3f70 0 2px, transparent 2px 5px);
    filter: drop-shadow(0 0 1px rgba(230, 87, 134, 0.75));
    z-index: 5;
    transform-origin: center;
  }
  [scrollto-lenis] .stack-medallion-orbit {
    position: absolute;
    left: 50%;
    top: 51%;
    width: 73%;
    height: 10px;
    transform: translate(-50%, -50%) rotate(-24deg);
    background: radial-gradient(circle, #ca4a77 0 2.8px, transparent 3.2px) 0 50% / 15px 10px repeat-x;
    z-index: 6;
    transform-origin: center;
  }
  @media (max-width: 991px) {
    [scrollto-lenis] .padding-large { padding-left: 5%; padding-right: 5%; }
    [scrollto-lenis] .stack-orb-wrap { height: 220px !important; min-height: 220px !important; }
    [scrollto-lenis] .stack-medallion-wrap { height: 220px !important; min-height: 220px !important; }
    [scrollto-lenis] .stack-moon-wrap { height: 220px !important; min-height: 220px !important; }
    [scrollto-lenis] .stack-voxel-wrap { height: 220px !important; min-height: 220px !important; }
    [scrollto-lenis] .stack-medallion { width: min(78vw, 300px); }
  }
`;

const STACK_ORB_HTML = `
  <div class="stack-orb-wrap">
    <div class="stack-orb-host"></div>
  </div>
`;

const STACK_MOON_HTML = `
  <div class="stack-moon-wrap">
    <div class="stack-moon-host"></div>
  </div>
`;

const STACK_VOXEL_HTML = `
  <div class="stack-voxel-wrap">
    <div class="stack-voxel-host"></div>
  </div>
`;

// Inyecta @font-face TWK Everett en el <head> del documento una sola vez.
// (Los @font-face dentro de un shadow root no siempre se aplican; en el head
// solo registran las familias, sin colisionar con la landing.)
function ensureFonts() {
  if (document.getElementById("st-sui-fonts")) return;
  const link = document.createElement("link");
  link.id = "st-sui-fonts";
  link.rel = "stylesheet";
  link.href = `${BASE}/sui-fonts.css`;
  document.head.appendChild(link);
}

function replaceScopeCards(root) {
  root.querySelectorAll(".colum_card_main").forEach((card) => {
    const num = card.querySelector(".timeline_num .mono");
    const anim = card.querySelector(".timeline_card_anim");
    if (!num || !anim) return;
    const value = num.textContent.trim();
    if (value === "01") {
      anim.innerHTML = STACK_ORB_HTML;
      return;
    }
    if (value === "02") {
      anim.innerHTML = STACK_MOON_HTML;
      return;
    }
    if (value === "03") {
      anim.innerHTML = STACK_VOXEL_HTML;
    }
  });
}

function keepOnlyFirstThreeCards(root) {
  root.querySelectorAll(".colum_card_main").forEach((card) => {
    const num = card.querySelector(".timeline_num .mono");
    const value = (num?.textContent || "").trim();
    if (value === "01" || value === "02" || value === "03") return;
    card.remove();
  });
}

function mountCardLinks(root) {
  const cleanups = [];

  root.querySelectorAll(".colum_card_main").forEach((card) => {
    const num = card.querySelector(".timeline_num .mono");
    const key = Number.parseInt((num?.textContent || "").trim(), 10);
    const href = CARD_LINKS[key];
    if (!href) return;

    const go = (event) => {
      if (event.type === "keydown" && event.key !== "Enter" && event.key !== " ") return;
      if (event.type === "keydown") event.preventDefault();
      window.open(href, "_blank", "noopener noreferrer");
    };

    card.style.cursor = "pointer";
    card.setAttribute("role", "link");
    card.tabIndex = 0;
    card.addEventListener("click", go, true);
    card.addEventListener("keydown", go);
    cleanups.push(() => {
      card.removeEventListener("click", go, true);
      card.removeEventListener("keydown", go);
    });
  });

  return () => {
    cleanups.forEach((cleanup) => cleanup());
  };
}

function mountOrbVisualizer(root) {
  const cleanups = [];

  root.querySelectorAll(".stack-orb-host").forEach((host) => {
    const reactRoot = createRoot(host);
    reactRoot.render(createElement(OrbVisualizer));
    cleanups.push(() => reactRoot.unmount());
  });

  return () => {
    cleanups.forEach((cleanup) => cleanup());
  };
}

function mountMoonModel(root) {
  const cleanups = [];

  root.querySelectorAll(".stack-moon-host").forEach((host) => {
    const reactRoot = createRoot(host);
    reactRoot.render(createElement(MoonMini));
    cleanups.push(() => reactRoot.unmount());
  });

  return () => {
    cleanups.forEach((cleanup) => cleanup());
  };
}

function mountIsometricVoxel(root) {
  const cleanups = [];

  root.querySelectorAll(".stack-voxel-host").forEach((host) => {
    const reactRoot = createRoot(host);
    reactRoot.render(createElement(IsometricVoxelCard));
    cleanups.push(() => reactRoot.unmount());
  });

  return () => {
    cleanups.forEach((cleanup) => cleanup());
  };
}

export default function StackTimeline() {
  const hostRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || host.shadowRoot) return;

    let cleanups = [];
    let killed = false;

    ensureFonts();

    const shadow = host.attachShadow({ mode: "open" });
    shadow.innerHTML = `
      <link rel="stylesheet" href="${BASE}/sui-webflow.css">
      <link rel="stylesheet" href="${BASE}/sui-inline.css">
      <style>${WHITE_THEME}</style>
      <div class="st-root">${STACK_TIMELINE_HTML}</div>
    `;

    const root = shadow.querySelector(".st-root");

    /* Inyectar hero-background (gradient-bg + rotating-pattern + blobs) */
    const heroBg = document.createElement("div");
    heroBg.className = "st-hero-bg";

    const patternWrap = document.createElement("div");
    patternWrap.className = "st-rotating-pattern";
    const patternImg = document.createElement("img");
    patternImg.src = "/assets/slider/6fa818bb935c0e2a1081f259d84df226b237a184.png";
    patternImg.alt = "";
    patternImg.setAttribute("aria-hidden", "true");
    patternWrap.appendChild(patternImg);

    const blob1 = document.createElement("div"); blob1.className = "st-blob-1";
    const blob2 = document.createElement("div"); blob2.className = "st-blob-2";
    const blob3 = document.createElement("div"); blob3.className = "st-blob-3";

    heroBg.appendChild(patternWrap);
    heroBg.appendChild(blob1);
    heroBg.appendChild(blob2);
    heroBg.appendChild(blob3);
    /* Inyectar dentro del propio [scrollto-lenis] que ya tiene
       position:relative + overflow:hidden — así el absolute queda anclado */
    const lenisEl = root.querySelector("[scrollto-lenis]") || root;
    lenisEl.prepend(heroBg);

    keepOnlyFirstThreeCards(root);
    replaceScopeCards(root);
    cleanups.push(mountCardLinks(root));
    cleanups.push(mountOrbVisualizer(root));
    cleanups.push(mountMoonModel(root));
    cleanups.push(mountIsometricVoxel(root));

    // Espera a que carguen las hojas de estilo (para medir alturas reales) y
    // luego monta Rive + GSAP ScrollTrigger.
    const links = Array.from(shadow.querySelectorAll("link[rel=stylesheet]"));
    let pending = links.length;
    const startWhenReady = () => {
      if (--pending > 0) return;
      if (killed) return;
      init();
    };
    links.forEach((l) => {
      if (l.sheet) startWhenReady();
      else {
        l.addEventListener("load", startWhenReady);
        l.addEventListener("error", startWhenReady);
      }
    });
    // Fallback por si los eventos no disparan.
    const fallback = setTimeout(() => {
      if (!killed && pending > 0) {
        pending = 0;
        init();
      }
    }, 1200);
    cleanups.push(() => clearTimeout(fallback));

    async function init() {
      const [{ gsap }, stMod, rive] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
        import("@rive-app/canvas"),
      ]);
      if (killed) return;
      const ScrollTrigger = stMod.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);

      /* ---- Iconos Rive ---- */
      const { Rive, Layout, Fit, Alignment } = rive;
      const FIT = {
        cover: Fit.Cover, contain: Fit.Contain, fill: Fit.Fill,
        fitwidth: Fit.FitWidth, fitheight: Fit.FitHeight,
        none: Fit.None, scaledown: Fit.ScaleDown,
      };
      const ALIGN = {
        center: Alignment.Center, topleft: Alignment.TopLeft,
        topcenter: Alignment.TopCenter, topright: Alignment.TopRight,
        centerleft: Alignment.CenterLeft, centerright: Alignment.CenterRight,
        bottomleft: Alignment.BottomLeft, bottomcenter: Alignment.BottomCenter,
        bottomright: Alignment.BottomRight,
      };
      const key = (v) => (v || "").toLowerCase().replace(/[\s_-]/g, "");

      root.querySelectorAll("[data-rive-url]").forEach((el) => {
        const src = el.getAttribute("data-rive-url");
        const canvas = el.querySelector("canvas");
        if (!src || !canvas) return;
        const stateMachine = el.getAttribute("data-rive-state-machine") || undefined;
        const artboard = el.getAttribute("data-rive-artboard") || undefined;
        const autoplay = el.getAttribute("data-rive-autoplay") !== "false";
        const fit = FIT[key(el.getAttribute("data-rive-fit"))] ?? Fit.Contain;
        const alignment = ALIGN[key(el.getAttribute("data-rive-alignment"))] ?? Alignment.Center;
        try {
          const r = new Rive({
            src, canvas, artboard, autoplay,
            stateMachines: stateMachine,
            layout: new Layout({ fit, alignment }),
            onLoad: () => { r.resizeDrawingSurfaceToCanvas(); if (autoplay) r.play(); },
          });
          const ro = new ResizeObserver(() => r.resizeDrawingSurfaceToCanvas());
          ro.observe(el);
          cleanups.push(() => { ro.disconnect(); r.cleanup(); });
        } catch { /* .riv que no carga se ignora */ }
      });

      /* ---- Apertura de cards por scroll ---- */
      root.querySelectorAll(".colum_card_main").forEach((card) => {
        const anim = card.querySelector(".timeline_card_anim");
        if (!anim) return;
        const riveBox = anim.querySelector(".rivesize, .stack-orb-wrap, .stack-medallion-wrap, .stack-moon-wrap, .stack-security-wrap");
        const bottomCard = card.querySelector(".timeline_colum_card.bottom");
        const openH = anim.getBoundingClientRect().height || 272;

        gsap.set(anim, { height: 0, overflow: "hidden" });
        if (riveBox) gsap.set(riveBox, { scale: 0.7, opacity: 0, transformOrigin: "bottom center" });

        const openTl = gsap.timeline({ paused: true, defaults: { ease: "power2.out" } });
        openTl.to(anim, { height: openH, duration: 0.45 }, 0);
        if (riveBox) openTl.fromTo(riveBox, { scale: 0.7, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5 }, "<");
        if (bottomCard) openTl.set(bottomCard, { borderTop: "1.5px solid #e2e5ec" }, 0);

        const stCard = ScrollTrigger.create({
          trigger: card, start: "top 50%",
          onEnter: () => openTl.play(),
          onLeaveBack: () => openTl.reverse(),
        });
        requestAnimationFrame(() => {
          if (stCard.progress > 0 || stCard.isActive) openTl.play();
        });
        cleanups.push(() => { stCard.kill(); openTl.kill(); });
      });

      /* ---- Barra de progreso: los puntos llegan hasta la 3ª card ----
         El track visible (desktop o mobile) marca la altura: la barra
         se estira hasta el fondo de la última card. El .timeline_current
         (sticky) hace que el white_cube se deslice con el scroll. */
      const progressMain = root.querySelector(".timeline_progress_main");
      const timelineCurrent = root.querySelector(".timeline_current");
      const whiteCube = root.querySelector(".white_cube");
      const desktopTrack = root.querySelector(".timeline_main:not(.mobile) .timeline_colum_left.right");
      const mobileTrack = root.querySelector(".timeline_main.mobile .timeline_colum_left.right");

      const activeTrack = () => {
        if (mobileTrack && mobileTrack.getBoundingClientRect().height > 0) return mobileTrack;
        return desktopTrack;
      };
      const syncProgressHeight = () => {
        if (!progressMain) return 0;
        const track = activeTrack();
        const trackHeight = Math.max(
          track ? track.scrollHeight || 0 : 0,
          track ? track.getBoundingClientRect().height || 0 : 0,
          timelineCurrent ? timelineCurrent.offsetHeight || 0 : 0,
        );
        // setProperty con 'important' vence al height:auto !important del tema.
        progressMain.style.setProperty("height", `${trackHeight}px`, "important");
        progressMain.style.setProperty("min-height", `${trackHeight}px`, "important");
        return trackHeight;
      };
      if (progressMain) {
        syncProgressHeight();
        const trackObserver = new ResizeObserver(() => {
          syncProgressHeight();
          requestAnimationFrame(() => ScrollTrigger.refresh());
        });
        [desktopTrack, mobileTrack].forEach((t) => t && trackObserver.observe(t));
        cleanups.push(() => trackObserver.disconnect());
      }

      /* ---- white_cube: se desliza por la línea entrecortada (↑/↓) ----
         position:absolute dentro de progressMain; y se anima de 0 → maxY
         sincronizado con el scroll. scrub alto (2.5) amortigua saltos
         cuando los cards se abren y cambian la altura del track. */
      if (whiteCube && timelineCurrent && progressMain) {
        gsap.set(timelineCurrent, {
          position: "absolute",
          top: 0,
          left: "50%",
          xPercent: -50,
          marginLeft: 0,
          marginRight: 0,
          y: 0,
        });

        let cubeSlide;
        const buildCubeAnim = () => {
          const totalH = syncProgressHeight();
          const cubeH = timelineCurrent.offsetHeight || 0;
          const endY = Math.max(0, totalH - cubeH);
          if (cubeSlide) {
            cubeSlide.scrollTrigger?.kill();
            cubeSlide.kill();
          }
          cubeSlide = gsap.fromTo(
            timelineCurrent,
            { y: 0 },
            {
              y: endY,
              ease: "none",
              scrollTrigger: {
                trigger: progressMain,
                start: "top 60%",
                end: "bottom 60%",
                scrub: 2.5,
              },
            },
          );
        };

        buildCubeAnim();

        // Reconstruir cuando los cards abren y cambian la altura.
        const cubeResizeObs = new ResizeObserver(() => {
          buildCubeAnim();
          requestAnimationFrame(() => ScrollTrigger.refresh());
        });
        cubeResizeObs.observe(progressMain);
        cleanups.push(() => {
          cubeResizeObs.disconnect();
          cubeSlide?.scrollTrigger?.kill();
          cubeSlide?.kill();
        });
      }

      /* ---- Reveal del heading ---- */
      const tlHeading = root.querySelector(".timeline_heading");
      if (tlHeading) {
        const reveal = gsap.fromTo(
          tlHeading,
          { y: "50%", scale: 0.7, opacity: 0 },
          {
            y: "0%", scale: 1, opacity: 1, duration: 1, ease: "power2.out",
            scrollTrigger: { trigger: tlHeading, start: "top 85%", once: true },
          },
        );
        cleanups.push(() => reveal.scrollTrigger?.kill());
      }

      ScrollTrigger.refresh();
    }

    return () => {
      killed = true;
      cleanups.forEach((fn) => fn());
      cleanups = [];
    };
  }, []);

  return <div ref={hostRef} style={{ background: "#ffffff", position: "relative", zIndex: 1 }} />;
}
