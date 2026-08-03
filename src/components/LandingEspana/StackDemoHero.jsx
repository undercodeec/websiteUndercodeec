"use client";

import { useEffect, useRef } from "react";

const BASE = "/landing-espana/stack-timeline";

const HERO_HTML = String.raw`
<section class="hero-section">
  <div class="intro_holder" style="z-index: 0;">
    <div class="intro_map">
      <div class="line_progress" style="translate: none; rotate: none; scale: none; transform: translate(828.332px, 0px);">
        <div class="current_percent" style="translate: none; rotate: none; scale: none; opacity: 0; transform: translate(0px, 0%); transform-origin: 0% 50%; filter: blur(16px);">
          <div class="percent_wrapper">
            <div class="block-12 bg-primary-blue"></div>
            <div class="ts-16px color-white padding-bottom">100%</div>
          </div>
        </div>
        <div class="line_current" style="width: 25em; translate: none; rotate: none; scale: none; transform-origin: 100% 50%; transform: scale(0, 1); opacity: 0;">
          <img src="https://cdn.prod.website-files.com/68e8e0120513ba12c5cd12e0/6901316af5849175ac89f762_Frame%202147267312%20(1).avif" loading="eager" alt="" class="image-9">
          <div class="black_overlay"></div>
        </div>
      </div>
    </div>
  </div>
  <div class="hero_first_section" style="--mouse-x: 50%; --mouse-y: 50%;">
    <div class="gradient-blur"><div></div><div></div><div></div></div>
    <div class="text-layers" style="opacity: 1; translate: none; rotate: none; scale: none; transform: translate(0px, 0%);">
      <div class="first_section_content">
        <h1 class="hero_heading absolute sharp mobileonly">Trabaja con Undercodeec</h1>
        <h1 class="hero_heading absolute sharp desktoponly" style="--text-x: 50%; --text-y: 50%;">Trabaja con Undercodeec</h1>
      </div>
    </div>
  </div>
</section>`;

const HERO_OVERRIDES = `
  :host { display: block; background: #030307; }
  .stack-hero-root {
    min-height: 100svh;
    background: #030307;
    color: #fff;
    overflow: hidden;
    font-family: "TWK Everett", Arial, sans-serif;
  }
  .hero-section {
    min-height: 100svh !important;
    height: 100svh;
    position: relative;
    overflow: hidden;
    background:
      radial-gradient(circle at 50% 38%, rgba(107, 214, 61, 0.2), transparent 18%),
      radial-gradient(circle at 50% 105%, rgba(96, 11, 86, 0.55), transparent 42%),
      #030307 !important;
  }
  .intro_holder,
  .intro_map {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }
  .line_progress {
    position: absolute;
    top: 42%;
    left: 0;
    height: 1px;
    opacity: 0.85;
  }
  .line_current {
    position: relative;
    height: 1px;
    background: #6bd63d;
  }
  .image-9 {
    width: 100%;
    height: 1px;
    object-fit: cover;
    display: block;
  }
  .black_overlay {
    position: absolute;
    inset: -16px 0;
    background: linear-gradient(90deg, transparent, rgba(0,0,0,0.55), transparent);
  }
  .hero_first_section {
    position: absolute !important;
    inset: 0;
    display: grid;
    place-items: center;
  }
  .text-layers,
  .first_section_content {
    position: relative;
    width: min(92vw, 1400px);
    height: clamp(150px, 26vw, 340px);
    display: grid;
    place-items: center;
  }
  .hero_heading {
    position: absolute !important;
    inset: auto 0 !important;
    width: 100%;
    text-align: center;
    font-size: clamp(44px, 8.4vw, 120px) !important;
    line-height: 0.96 !important;
    letter-spacing: 0 !important;
    font-weight: 900 !important;
    white-space: normal;
    overflow-wrap: break-word;
  }
  .mobileonly { display: none !important; }
  .desktoponly { display: block !important; }
  .first_section_content_2 {
    position: absolute !important;
    left: 50%;
    bottom: clamp(34px, 7vh, 84px);
    width: min(92vw, 760px);
    transform: translateX(-50%) !important;
    display: grid;
    justify-items: center;
    gap: 26px;
    text-align: center;
  }
  .hero-custom-break {
    display: block;
    max-width: 760px;
    color: rgba(255,255,255,0.82) !important;
    font-size: clamp(17px, 1.55vw, 24px) !important;
    line-height: 1.45 !important;
  }
  .cta-wrapper {
    display: flex !important;
    align-items: center;
    justify-content: center;
    gap: 12px;
    flex-wrap: wrap;
    opacity: 1 !important;
  }
  .cta-button {
    min-height: 52px;
    display: inline-flex !important;
    align-items: center;
    justify-content: center;
    padding: 0 22px !important;
    border: 1px solid rgba(255,255,255,0.24) !important;
    border-radius: 999px !important;
    background: #fff !important;
    color: #030307 !important;
    text-decoration: none !important;
    font-weight: 800 !important;
  }
  .cta-button.is--alternative {
    background: transparent !important;
    color: #fff !important;
  }
  .gradient-blur { z-index: 3; }
  @media (max-width: 768px) {
    .hero-section { min-height: 100svh !important; height: 100svh; }
    .mobileonly { display: block !important; }
    .desktoponly { display: none !important; }
    .text-layers,
    .first_section_content {
      width: min(92vw, 560px);
      height: clamp(200px, 46vw, 280px);
    }
    .hero_heading {
      font-size: clamp(40px, 13vw, 72px) !important;
      line-height: 1 !important;
    }
    .first_section_content_2 {
      bottom: 38px;
      gap: 18px;
    }
    .cta-button {
      width: 100%;
      max-width: 320px;
    }
  }
`;

function ensureFonts() {
  if (document.getElementById("st-sui-fonts")) return;
  const link = document.createElement("link");
  link.id = "st-sui-fonts";
  link.rel = "stylesheet";
  link.href = `${BASE}/sui-fonts.css`;
  document.head.appendChild(link);
}

export default function StackDemoHero() {
  const hostRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || host.shadowRoot) return;

    ensureFonts();
    const shadow = host.attachShadow({ mode: "open" });
    shadow.innerHTML = `
      <link rel="stylesheet" href="${BASE}/sui-webflow.css">
      <link rel="stylesheet" href="${BASE}/sui-inline.css">
      <style>${HERO_OVERRIDES}</style>
      <div class="stack-hero-root">${HERO_HTML}</div>
    `;

    const hero = shadow.querySelector(".hero_first_section");
    const desktopHeading = shadow.querySelector(".desktoponly");
    const onPointerMove = (event) => {
      if (!hero || !desktopHeading) return;
      const rect = hero.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      hero.style.setProperty("--mouse-x", `${x}%`);
      hero.style.setProperty("--mouse-y", `${y}%`);
      desktopHeading.style.setProperty("--text-x", `${event.clientX - rect.left}px`);
      desktopHeading.style.setProperty("--text-y", `${event.clientY - rect.top}px`);
    };

    hero?.addEventListener("pointermove", onPointerMove);
    return () => {
      hero?.removeEventListener("pointermove", onPointerMove);
    };
  }, []);

  return <div ref={hostRef} />;
}
