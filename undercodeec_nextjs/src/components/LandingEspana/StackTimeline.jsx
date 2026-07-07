"use client";

import { useEffect, useRef } from "react";
import { animate } from "animejs";
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
  [scrollto-lenis] .stack-medallion-wrap {
    width: 100%;
    height: 17em !important;
    min-height: 17em !important;
    display: grid;
    place-items: center;
    opacity: 1;
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
    [scrollto-lenis] .stack-medallion-wrap { height: 220px !important; min-height: 220px !important; }
    [scrollto-lenis] .stack-medallion { width: min(78vw, 300px); }
  }
`;

const STACK_MEDALLION_HTML = `
  <div class="stack-medallion-wrap">
    <div class="stack-medallion" aria-hidden="true">
      <div class="stack-medallion-rim"></div>
      <div class="stack-medallion-ticks"></div>
      <div class="stack-medallion-core"></div>
      <div class="stack-medallion-diamond"></div>
      <div class="stack-medallion-orbit"></div>
    </div>
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
    if (!num || num.textContent.trim() !== "01") return;
    const anim = card.querySelector(".timeline_card_anim");
    if (anim) anim.innerHTML = STACK_MEDALLION_HTML;
  });
}

function mountMedallionAnimations(root) {
  const animations = [];

  root.querySelectorAll(".stack-medallion").forEach((medallion) => {
    const rim = medallion.querySelector(".stack-medallion-rim");
    const ticks = medallion.querySelector(".stack-medallion-ticks");
    const core = medallion.querySelector(".stack-medallion-core");
    const diamond = medallion.querySelector(".stack-medallion-diamond");
    const orbit = medallion.querySelector(".stack-medallion-orbit");

    animations.push(
      animate(medallion, {
        rotate: ["0deg", "360deg"],
        duration: 52000,
        ease: "linear",
        loop: true,
      })
    );

    if (rim) {
      animations.push(
        animate(rim, {
          rotate: ["0deg", "360deg"],
          duration: 9000,
          ease: "linear",
          loop: true,
        })
      );
    }

    if (ticks) {
      animations.push(
        animate(ticks, {
          rotate: ["0deg", "-360deg"],
          duration: 22000,
          ease: "linear",
          loop: true,
        })
      );
    }

    if (core) {
      animations.push(
        animate(core, {
          rotate: ["0deg", "360deg"],
          scale: [0.96, 1.03],
          duration: 7000,
          ease: "inOutSine",
          alternate: true,
          loop: true,
        })
      );
    }

    if (diamond) {
      animations.push(
        animate(diamond, {
          rotate: ["45deg", "405deg"],
          translateX: ["-50%", "-50%"],
          translateY: ["-50%", "-50%"],
          scale: [0.94, 1.06],
          duration: 12000,
          ease: "inOutSine",
          alternate: true,
          loop: true,
        })
      );
    }

    if (orbit) {
      animations.push(
        animate(orbit, {
          rotate: ["-24deg", "336deg"],
          translateX: ["-50%", "-50%"],
          translateY: ["-50%", "-50%"],
          duration: 6400,
          ease: "linear",
          loop: true,
        })
      );
    }
  });

  return () => {
    animations.forEach((animation) => {
      if (animation && typeof animation.pause === "function") animation.pause();
    });
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
    replaceScopeCards(root);
    cleanups.push(mountMedallionAnimations(root));

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
        const riveBox = anim.querySelector(".rivesize, .stack-medallion-wrap");
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

      /* ---- white_cube sigue el scroll a lo largo del timeline ---- */
      const progressMain = root.querySelector(".timeline_progress_main");
      const timelineCurrent = root.querySelector(".timeline_current");
      if (progressMain && timelineCurrent) {
        const tlSection = root.querySelector("[scrollto-lenis]");
        gsap.set(timelineCurrent, { y: 0 });
        const cubeAnim = gsap.to(timelineCurrent, {
          y: () => progressMain.offsetHeight - timelineCurrent.offsetHeight,
          ease: "none",
          scrollTrigger: {
            trigger: tlSection || root,
            start: "top 60%",
            end: "bottom 40%",
            scrub: 1,
          },
        });
        cleanups.push(() => cubeAnim.scrollTrigger?.kill());
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
