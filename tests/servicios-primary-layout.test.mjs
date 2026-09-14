import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";
import postcss from "postcss";

test("parses the mobile-applications hero stylesheet", async () => {
  const styles = await readFile("src/components/App/Header.module.css", "utf8");

  assert.doesNotThrow(() => postcss.parse(styles));
});

test("renders service cards over the hero while keeping the section heading below it", async () => {
  const page = await readFile("src/app/servicios/page.tsx", "utf8");
  const hero = await readFile("src/components/Servicios/ServicesHero.jsx", "utf8");

  assert.match(
    page,
    /<ServicesHero>\s*<ServicesCards\s*\/>\s*<\/ServicesHero>\s*<ServicesShowcase\s*\/>/,
  );
  assert.match(hero, /className=\{styles\.cardsOverlay\}/);
});

test("keeps the landing hamburger background nested inside the primary header", async () => {
  const header = await readFile("src/components/Primary/PrimaryHeader.jsx", "utf8");
  const hamburger = await readFile("src/components/Primary/PrimaryHamburgerButton.jsx", "utf8");

  assert.match(header, /import PrimaryHamburgerButton from "\.\/PrimaryHamburgerButton"/);
  assert.match(header, /<PrimaryHamburgerButton/);
  assert.match(hamburger, /hud-menu-w/);
  assert.match(hamburger, /hud-menu-c/);
  assert.match(hamburger, /hud-menu-line is-1/);
  assert.match(hamburger, /hud-menu-line is-2/);
  assert.match(hamburger, /hud-menu-line is-3/);
  assert.match(hamburger, /hud-menu-bg/);
});

test("uses the shared Landing Primary header on the mobile-applications route", async () => {
  const page = await readFile("src/app/aplicaciones-moviles/page.tsx", "utf8");

  assert.match(page, /import \{ PrimaryHeader \} from "@\/components\/Primary";/);
  assert.match(page, /<PrimaryHeader\s*\/>/);
  assert.doesNotMatch(page, /import TopNav from "@\/components\/Navbars\/TopNav";/);
  assert.doesNotMatch(page, /import Navbar from "@\/components\/Navbars\/AppNav";/);
});

test("replaces the mobile-applications hero media with the Landing Primary orb treatment", async () => {
  const hero = await readFile("src/components/App/Header.jsx", "utf8");

  assert.match(hero, /import \{ PrimaryOrb \} from "@\/components\/Primary";/);
  assert.match(hero, /data-mobile-apps-orb/);
  assert.match(hero, /data-mobile-apps-orb-outline="1"/);
  assert.match(hero, /data-mobile-apps-orb-outline="2"/);
  assert.match(hero, /Diseño Innovador y Desarrollo Profesional/);
  assert.match(hero, /Desarrollo de Aplicaciones Móviles/);
  assert.doesNotMatch(hero, /banner_app1\.webp|header_4_bubble\.png|header_4_wave\.png|ModalVideo/);
});

test("keeps the mobile-applications orb centered and reveals its hero title like Landing Primary", async () => {
  const hero = await readFile("src/components/App/Header.jsx", "utf8");

  assert.match(hero, /x: "0vw", y: "0vh", scale: 1, duration: 1/);
  assert.match(hero, /data-mobile-apps-hero-char/);
  assert.match(hero, /\? \{ yPercent: -101, autoAlpha: 0 \}\s*:\s*\{ yPercent: -101 \}/);
  assert.match(hero, /yPercent:\s*0,[\s\S]*?duration:\s*1,\s*ease:\s*"power4\.inOut"/);
  assert.match(hero, /stagger: \{ each: \.03, from: "random" \}/);
  assert.match(hero, /const revealTitle = \(\) =>/);
  assert.match(hero, /index % 2 === 0 \? "10em" : "-10em"/);
  assert.match(hero, /window\.addEventListener\("preloaderDone"/);
  assert.match(hero, /window\.setTimeout\(revealTitle, 2500\)/);
  assert.match(hero, /data-mobile-apps-hero-line/);
  assert.match(hero, /data-mobile-apps-hero-line-transform/);
});

test("uses the native Landing Primary headline treatment for mobile applications", async () => {
  const hero = await readFile("src/components/App/Header.jsx", "utf8");
  const styles = await readFile("src/components/App/Header.module.css", "utf8");

  assert.doesNotMatch(hero, /framer-motion|usePageReady|motion\./);
  assert.match(hero, /const MOBILE_APPS_TITLE_LINES = \["Desarrollo", "de Aplicaciones", "Móviles"\]/);
  assert.match(hero, /data-mobile-apps-hero-line/);
  assert.match(hero, /yPercent: -101/);
  assert.match(hero, /x: index % 2 === 0 \? "10em" : "-10em"/);
  assert.match(styles, /\.titleLineBlock\s*\{[\s\S]*?mix-blend-mode: difference;/);
  assert.match(styles, /\.titleLineBlock\s*\{[\s\S]*?color: var\(--primary-main-light\);/);
});

test("uses the Landing Primary orb-only preloader globally", async () => {
  const preloader = await readFile("src/components/Primary/PrimaryPreloader.jsx", "utf8");
  const styles = await readFile("src/components/Primary/PrimaryPreloader.module.css", "utf8");

  assert.match(preloader, /import gsap from "gsap";/);
  assert.match(preloader, /<PrimaryOrb className=\{styles\.orb\} \/>/);
  assert.match(preloader, /width: "4\.3em", height: "4\.3em", duration: 1/);
  assert.match(preloader, /width:\s*"80vh",\s*height:\s*"80vh",\s*minHeight:\s*"45em",\s*minWidth:\s*"45em"/);
  assert.doesNotMatch(preloader, /CustomEase|LoadMark|loadingCharacters|percentage|fillMask/);
  assert.doesNotMatch(styles, /mask: url\(/);
  assert.match(styles, /border: 1px dashed rgba\(111, 111, 111, \.4\);/);
});

test("keeps the services orb centered first and moves it through the full page scroll", async () => {
  const page = await readFile("src/app/servicios/page.tsx", "utf8");
  const hero = await readFile("src/components/Servicios/ServicesHero.jsx", "utf8");
  const heroStyles = await readFile("src/components/Servicios/ServicesHero.module.css", "utf8");
  const orb = await readFile("src/components/Servicios/ServicesOrbBackground.jsx", "utf8");
  const pageStyles = await readFile("src/app/servicios/ServiciosPage.module.css", "utf8");
  const showcaseStyles = await readFile("src/components/Servicios/ServicesShowcase.module.css", "utf8");

  assert.match(page, /import ServicesOrbBackground from "@\/components\/Servicios\/ServicesOrbBackground";/);
  assert.match(page, /<ServicesOrbBackground\s*\/>\s*<main[^>]*data-services-page/);
  assert.doesNotMatch(hero, /data-services-orb/);
  assert.match(orb, /import \{ ScrollTrigger \} from "gsap\/ScrollTrigger";/);
  assert.match(orb, /trigger: page, start: "top top", end: "bottom bottom", scrub: true, immediateRender: false/);
  assert.match(orb, /x: "0vw", y: "0vh", scale: 1/);
  assert.match(orb, /x: "50vw", scale: 2, duration: \.15, ease: "power2\.out"/);
  assert.match(orb, /x: "-50vw", y: "-20vh", scale: 1\.5, duration: \.15, ease: "power2\.inOut"/);
  assert.match(orb, /x: "0vw", y: "50vh", scale: 0, duration: \.05/);
  assert.match(orb, /x: "-60vw", y: "-75vh", scale: 0, ease: "power1\.out", duration: \.05/);
  assert.match(orb, /x: "10vw", y: "0vh", scale: 1\.2, duration: \.15, overwrite: "auto"/);
  assert.match(orb, /x: "25vw", y: "0vh", scale: 1\.3, duration: \.15, overwrite: "auto"/);
  assert.match(orb, /rotation: 360, duration: 100, repeat: -1, ease: "none", force3D: true/);
  assert.match(orb, /timeScale\(Math\.max\(1, Math\.abs\(scrollDelta\)\)/);
  assert.match(heroStyles, /background:\s*transparent;/);
  assert.doesNotMatch(pageStyles, /\.page\s*\{[\s\S]*?isolation:\s*isolate;/);
  assert.match(pageStyles, /\.page[\s\S]*?:global\(\.testimonials\)[\s\S]*?background:\s*transparent !important;/);
  assert.match(showcaseStyles, /\.section\s*\{[\s\S]*?background:\s*transparent;/);
});

test("keeps the orb fallback visible until its WebGL texture is ready", async () => {
  const orbRuntime = await readFile("src/lib/primary-orb/createPrimaryOrb.js", "utf8");
  const orbStyles = await readFile("src/components/PrimaryOrb/PrimaryOrb.module.css", "utf8");

  assert.match(orbRuntime, /renderer\.domElement\.dataset\.primaryOrbTextureReady\s*=\s*"false";/);
  assert.match(orbRuntime, /renderingMaterial\.uniforms\.matcapTexture2\.value\s*=\s*texture;[\s\S]*?renderer\.domElement\.dataset\.primaryOrbTextureReady\s*=\s*"true";/);
  assert.match(orbStyles, /\.viewport:has\(> canvas\[data-primary-orb-texture-ready="true"\]\)/);
  assert.match(orbStyles, /canvas\[data-primary-orb-texture-ready="false"\]\s*\{[\s\S]*?opacity:\s*0;/);
});

test("removes the left scroll indicator and advances service cards faster with a smooth transition", async () => {
  const header = await readFile("src/components/Primary/PrimaryHeader.jsx", "utf8");
  const showcase = await readFile("src/components/Servicios/ServicesShowcase.jsx", "utf8");

  assert.doesNotMatch(header, /styles\.scrollCue/);
  assert.match(showcase, /speed=\{850\}/);
  assert.match(showcase, /autoplay=\{\{ delay: 2200, disableOnInteraction: false, pauseOnMouseEnter: false \}\}/);
  assert.match(showcase, /onClick=\{\(swiper\) => swiper\.autoplay\.stop\(\)\}/);
  assert.match(showcase, /\bloop\b/);
});

test("hides the native page scrollbar without disabling page scrolling", async () => {
  const globals = await readFile("src/styles/globals.css", "utf8");

  assert.match(globals, /html,\s*body\s*\{[\s\S]*?scrollbar-width:\s*none;/);
  assert.match(globals, /html,\s*body\s*\{[\s\S]*?-ms-overflow-style:\s*none;/);
  assert.match(globals, /html::\-webkit-scrollbar,\s*body::\-webkit-scrollbar\s*\{[\s\S]*?display:\s*none;/);
  assert.doesNotMatch(globals, /html,\s*body\s*\{[\s\S]*?overflow-y:\s*hidden;/);
});

test("keeps the Landing Primary card surface available inside the hero slider", async () => {
  const styles = await readFile("src/components/Servicios/ServicesShowcase.module.css", "utf8");

  assert.match(styles, /\.slider\s*\{[\s\S]*?--ink:\s*var\(--primary-main-dark\);/);
  assert.match(styles, /\.slider\s*\{[\s\S]*?--card-surface:\s*#e5e4e0;/);
  assert.match(styles, /\.slider\s*\{[\s\S]*?--line:\s*rgba\(111, 111, 111, \.38\);/);
  assert.match(styles, /\.card\s*\{[\s\S]*?background:\s*var\(--card-surface\);/);
  assert.doesNotMatch(styles, /\.card:hover\s*\{[\s\S]*?background:/);
  assert.doesNotMatch(styles, /\.card:hover\s*\{[\s\S]*?color:/);
  assert.doesNotMatch(styles, /\.card:hover \.cardContent p/);
});

test("renders the services showcase title with the Landing Primary hero treatment", async () => {
  const showcase = await readFile("src/components/Servicios/ServicesShowcase.jsx", "utf8");
  const styles = await readFile("src/components/Servicios/ServicesShowcase.module.css", "utf8");

  assert.match(showcase, /import \{ useEffect, useRef \} from "react";/);
  assert.match(showcase, /import gsap from "gsap";/);
  assert.match(showcase, /className=\{`primary-heading-b \$\{styles\.heroTitle\}`\}/);
  assert.match(showcase, /className=\{styles\.heroTitleBlend\}/);
  assert.match(showcase, /data-services-showcase-hero-char/);
  assert.match(showcase, /yPercent:\s*0,\s*autoAlpha:\s*1,\s*duration:\s*1,\s*ease:\s*"power4\.inOut"/);
  assert.match(showcase, /stagger: \{ each: \.03, from: "random" \}/);
  assert.match(showcase, /window\.addEventListener\("preloaderDone"/);
  assert.match(showcase, /let revealFallback;/);
  assert.match(showcase, /let hasRevealed = false;/);
  assert.match(showcase, /if \(hasRevealed\) return;/);
  assert.match(showcase, /revealFallback = window\.setTimeout\(revealTitle, 2500\);/);
  assert.match(showcase, /window\.clearTimeout\(revealFallback\);/);
  assert.match(showcase, /gsap\.set\(titleCharacters, \{ yPercent: 105, autoAlpha: 0 \}\);/);
  assert.match(styles, /\.heroTitle\s*\{[\s\S]*?font-size:\s*var\(--primary-heading-b-size\);/);
  assert.match(styles, /\.sectionHeader\s*\{[\s\S]*?grid-template-columns:\s*repeat\(12, minmax\(0, 1fr\)\);/);
  assert.match(styles, /\.heroTitleBlend\s*\{[\s\S]*?grid-column:\s*3 \/ 13;/);
  assert.match(styles, /\.heroTitleBlend\s*\{[\s\S]*?color:\s*var\(--primary-main-light\);[\s\S]*?mix-blend-mode:\s*difference;/);
  assert.match(styles, /\.heroTitleOverflow\s*\{[\s\S]*?overflow:\s*clip;/);
  assert.doesNotMatch(styles, /\.heroTitleCharacter\s*\{[\s\S]*?transform:\s*translateY\(105%\);/);
});

test("keeps the service hero cards compact and close to the lower edge", async () => {
  const heroStyles = await readFile("src/components/Servicios/ServicesHero.module.css", "utf8");
  const showcaseStyles = await readFile("src/components/Servicios/ServicesShowcase.module.css", "utf8");

  assert.match(heroStyles, /\.cardsOverlay\s*\{[\s\S]*?bottom:\s*clamp\(\.75rem,\s*2vh,\s*2rem\);/);
  assert.match(heroStyles, /@media \(max-width: 520px\)\s*\{[\s\S]*?\.cardsOverlay\s*\{\s*bottom:\s*1\.25rem;/);
  assert.match(showcaseStyles, /\.card\s*\{[\s\S]*?min-height:\s*26rem;/);
  assert.match(showcaseStyles, /\.card\s*\{[\s\S]*?grid-template-rows:\s*auto minmax\(9rem, 1fr\) auto;/);
  assert.match(showcaseStyles, /\.imageWrap\s*\{[\s\S]*?min-height:\s*9rem;/);
  assert.match(showcaseStyles, /@media \(max-width: 991px\)\s*\{[\s\S]*?\.card\s*\{\s*min-height:\s*25rem;/);
  assert.match(showcaseStyles, /@media \(max-width: 640px\)\s*\{[\s\S]*?\.card\s*\{\s*min-height:\s*23rem;/);
  assert.match(showcaseStyles, /width:\s*clamp\(3\.5rem,\s*6vw,\s*4\.5rem\);/);
  assert.match(showcaseStyles, /height:\s*clamp\(3\.5rem,\s*6vw,\s*4\.5rem\);/);
  assert.match(showcaseStyles, /width:\s*clamp\(3\.25rem,\s*8vw,\s*4\.25rem\);/);
  assert.match(showcaseStyles, /height:\s*clamp\(3rem,\s*18vw,\s*3\.75rem\);/);
});

test("does not load reCAPTCHA on the services route", async () => {
  const layout = await readFile("src/app/layout.tsx", "utf8");
  const recaptcha = await readFile("src/components/RecaptchaEnterpriseScript.jsx", "utf8");

  assert.match(layout, /import RecaptchaEnterpriseScript from "@\/components\/RecaptchaEnterpriseScript"/);
  assert.match(layout, /<RecaptchaEnterpriseScript\s*\/>/);
  assert.doesNotMatch(layout, /google\.com\/recaptcha\/enterprise\.js/);
  assert.match(recaptcha, /usePathname/);
  assert.match(recaptcha, /pathname === "\/servicios"/);
  assert.match(recaptcha, /google\.com\/recaptcha\/enterprise\.js/);
});

test("removes the global promotion banner and anchors Hermes on the left", async () => {
  const layout = await readFile("src/app/layout.tsx", "utf8");
  const hermes = await readFile("src/components/HermesWhatsAppButton/index.jsx", "utf8");

  assert.doesNotMatch(layout, /PromoBanner/);
  await assert.rejects(access("src/components/PromoBanner/index.tsx"));
  assert.match(hermes, /left:\s*24px;/);
  assert.doesNotMatch(hermes, /right:\s*24px;/);
  assert.match(hermes, /left:\s*16px;/);
  assert.doesNotMatch(hermes, /right:\s*16px;/);
});
