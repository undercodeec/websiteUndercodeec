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

test("uses a Landing Primary-inspired footer isolated to the services route", async () => {
  const page = await readFile("src/app/servicios/page.tsx", "utf8");
  const footer = await readFile("src/components/Servicios/ServiciosPrimaryFooter.jsx", "utf8");
  const styles = await readFile("src/components/Servicios/ServiciosPrimaryFooter.module.css", "utf8");
  const primaryStyles = await readFile("src/styles/primary-system.css", "utf8");

  assert.match(page, /import ServiciosPrimaryFooter from "@\/components\/Servicios\/ServiciosPrimaryFooter";/);
  assert.match(page, /<ServiciosPrimaryFooter\s*\/>/);
  assert.doesNotMatch(page, /import Footer from "@\/components\/Saas\/Footer";/);
  assert.match(footer, /import \{ useEffect, useRef \} from "react";/);
  assert.match(footer, /import gsap from "gsap";/);
  assert.match(footer, /import \{ ScrollTrigger \} from "gsap\/ScrollTrigger";/);
  assert.match(footer, /const FOOTER_TITLE_LINES = \[".Hacemos", "algo", "juntos\?"\]/);
  assert.match(footer, /data-services-footer-link-target/);
  assert.match(footer, /data-services-footer-link-track/);
  assert.match(footer, /className=\{styles\.ctaGrid\}/);
  assert.match(footer, /className=\{styles\.ctaRow\}/);
  assert.match(footer, /data-services-footer-title-line/);
  assert.match(footer, /className=\{styles\.buttonInner\}/);
  assert.match(footer, /className=\{styles\.buttonBackground\}/);
  assert.doesNotMatch(footer, /Jun\+tos/);
  assert.doesNotMatch(footer, /revealFallback = window\.setTimeout/);
  assert.match(footer, /const revealFooter = \(\) =>/);
  assert.match(footer, /let hasRevealed = false;/);
  assert.match(footer, /let hasArmed = false;/);
  assert.match(footer, /if \(hasRevealed\) return;/);
  assert.match(footer, /preloaderFallback = window\.setTimeout\(armReveal, 2500\);/);
  assert.match(footer, /ScrollTrigger\.create\(\{[\s\S]*?onEnter: revealFooter/);
  assert.match(footer, /requestAnimationFrame\(\(\) => ScrollTrigger\.refresh\(\)\);/);
  assert.match(footer, /window\.clearTimeout\(preloaderFallback\);/);
  assert.match(footer, /revealTrigger\?\.kill\(\);/);
  assert.match(footer, /const revealTimeline = gsap\.timeline\(\);/);
  assert.match(footer, /aria-label="Pie de p.gina"/);
  assert.match(footer, /aria-label=\{label\}/);
  assert.match(footer, /title="Mapa del sitio" label="Mapa del sitio"/);
  assert.match(footer, /title="Conecta" label="Redes sociales"/);
  assert.match(footer, /title="Legal" label="Informaci.n legal"/);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(styles, /:focus-visible/);
  assert.match(styles, /font-family: var\(--primary-font-family\);/);
  assert.match(styles, /grid-template-columns: repeat\(12, minmax\(0, 1fr\)\);/);
  assert.match(styles, /font-size: var\(--primary-heading-a-size\);/);
  assert.match(styles, /\.ctaGrid\s*\{[\s\S]*?grid-template-columns:\s*repeat\(7, minmax\(0, 1fr\)\);[\s\S]*?padding-left:\s*3em;/);
  assert.match(styles, /\.ctaRow\s*\{[\s\S]*?align-items:\s*center;[\s\S]*?display:\s*flex;/);
  assert.match(styles, /\.button\s*\{[\s\S]*?border:\s*1px solid var\(--footer-line\);[\s\S]*?background:\s*var\(--primary-main-light\);[\s\S]*?border-radius:\s*6\.25em;[\s\S]*?font-size:\s*1\.6em;/);
  assert.match(styles, /\.buttonInner\s*\{[\s\S]*?padding:\s*1em 2em;/);
  assert.match(styles, /\.buttonBackground\s*\{[\s\S]*?mix-blend-mode:\s*exclusion;/);
  assert.match(styles, /\.footer\s*\{[\s\S]*?font-weight:\s*400;[\s\S]*?font-synthesis:\s*none;/);
  assert.match(styles, /\.grid\s*\{[\s\S]*?gap:\s*1\.25em;[\s\S]*?padding:\s*0 1\.25em;/);
  assert.match(styles, /\.column p\s*\{[\s\S]*?font-weight:\s*400;[\s\S]*?letter-spacing:\s*normal;/);
  assert.match(styles, /\.link\s*\{[\s\S]*?padding-bottom:\s*\.3em;[\s\S]*?font-size:\s*1em;[\s\S]*?font-weight:\s*400;[\s\S]*?font-synthesis:\s*none;[\s\S]*?line-height:\s*1;/);
  assert.doesNotMatch(styles, /\.link\s*\{[\s\S]*?font-weight:\s*700;/);
  assert.match(styles, /\.linkClip\s*\{[\s\S]*?gap:\s*\.5rem;/);
  assert.match(styles, /@media \(max-width: 991px\)\s*\{[\s\S]*?\.grid\s*\{[\s\S]*?display:\s*flex;[\s\S]*?gap:\s*3rem;[\s\S]*?padding:\s*0 2vw;[\s\S]*?\.titleLine\s*\{\s*font-size:\s*10em;[\s\S]*?\.navigation\s*\{[\s\S]*?grid-template-columns:\s*repeat\(3, minmax\(0, 1fr\)\);[\s\S]*?\.linkLabel,[\s\S]*?font-size:\s*1rem;[\s\S]*?\.miniLink \.linkLabel,[\s\S]*?font-size:\s*\.85rem;/);
  assert.match(styles, /@media \(max-width: 767px\)\s*\{[\s\S]*?\.linkLabel,[\s\S]*?font-size:\s*\.8rem;/);
  assert.match(styles, /@media \(max-width: 479px\)\s*\{[\s\S]*?\.grid\s*\{[\s\S]*?padding:\s*0 3vw;[\s\S]*?\.navigation\s*\{[\s\S]*?grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\);[\s\S]*?\.linkLabel,[\s\S]*?font-size:\s*\.8rem;[\s\S]*?\.miniLink \.linkLabel,[\s\S]*?font-size:\s*\.7rem;/);
  assert.match(primaryStyles, /font-display:\s*block;/);
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
  assert.match(hero, /window\.setTimeout\(revealTitle, 900\)/);
  assert.match(hero, /data-mobile-apps-hero-line/);
  assert.match(hero, /data-mobile-apps-hero-line-transform/);
});

test("uses the original Landing Primary home-hero structure for mobile applications", async () => {
  const hero = await readFile("src/components/App/Header.jsx", "utf8");
  const styles = await readFile("src/components/App/Header.module.css", "utf8");

  assert.match(hero, /className=\{styles\.tabletTitle\}/);
  assert.match(hero, /className=\{styles\.desktopTitle\}/);
  assert.match(hero, /className=\{styles\.titleBlock\}/);
  assert.match(hero, /className=\{styles\.subtitleBlock\}/);
  assert.match(hero, /const MOBILE_APPS_TITLE_LINES = \["Desarrollo", "de Aplicaciones", "Móviles"\]/);
  assert.match(hero, /data-mobile-apps-hero-line/);
  assert.match(hero, /x: index % 2 === 0 \? "10em" : "-10em"/);
  assert.match(styles, /\.desktopTitle\s*\{[\s\S]*?flex-direction:\s*column;[\s\S]*?padding:\s*7rem 1\.5rem 3rem;/);
  assert.match(styles, /\.titleBlock\s*\{[\s\S]*?width:\s*min\(100%, 72rem\);[\s\S]*?text-align:\s*center;/);
  assert.match(styles, /\.title\s*\{[\s\S]*?font-size:\s*clamp\(2\.8rem, 7vw, 7\.5rem\);[\s\S]*?line-height:\s*\.95;[\s\S]*?letter-spacing:\s*-\.045em;/);
  assert.match(styles, /@media \(max-width: 991px\)\s*\{[\s\S]*?\.titleBlock\s*\{\s*display:\s*none;/);
  assert.match(styles, /@media \(max-width: 991px\)\s*\{[\s\S]*?\.tabletTitle\s*\{[\s\S]*?display:\s*flex;/);
});

test("reveals the mobile-applications hero earlier with the services blend treatment", async () => {
  const hero = await readFile("src/components/App/Header.jsx", "utf8");
  const styles = await readFile("src/components/App/Header.module.css", "utf8");

  assert.match(hero, /className=\{styles\.titleBlend\}/);
  assert.match(hero, /window\.setTimeout\(revealTitle, 900\)/);
  assert.match(hero, /\.2 \+ index \* \.1/);
  assert.match(styles, /\.titleBlend\s*\{[\s\S]*?color:\s*var\(--primary-main-light\);[\s\S]*?mix-blend-mode:\s*difference;/);
  assert.match(styles, /\.tabletTitle\s*\{[\s\S]*?color:\s*var\(--primary-main-light\);[\s\S]*?mix-blend-mode:\s*difference;/);
  assert.doesNotMatch(styles, /\.content\s*\{[\s\S]*?z-index\s*:/);
  assert.doesNotMatch(styles, /\.tabletTitle\s*\{[\s\S]*?z-index\s*:/);
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
  assert.match(
    page,
    /<div className=\{styles\.page\} data-services-page>[\s\S]*?<ServicesOrbBackground\s*\/>[\s\S]*?<main className="services-page style-5">[\s\S]*?<ServiciosPrimaryFooter\s*\/>[\s\S]*?<\/div>/,
  );
  assert.doesNotMatch(page, /<main[^>]*data-services-page/);
  assert.doesNotMatch(hero, /data-services-orb/);
  assert.match(orb, /import \{ ScrollTrigger \} from "gsap\/ScrollTrigger";/);
  assert.match(orb, /trigger: page, start: "top top", end: "bottom bottom", scrub: true, immediateRender: false/);
  assert.match(orb, /x: "0vw", y: "0vh", scale: 1/);
  assert.match(orb, /x: "50vw", scale: 2, duration: \.15, ease: "power2\.out"/);
  assert.match(orb, /x: "-50vw", y: "-20vh", scale: 1\.5, duration: \.15, ease: "power2\.inOut"/);
  assert.match(orb, /x: "0vw", y: "50vh", scale: 0, duration: \.05/);
  assert.match(orb, /x: "-60vw", y: "-75vh", scale: 0, ease: "power1\.out", duration: \.05/);
  assert.match(orb, /x: "0vw", y: "0vh", scale: 0, duration: \.3/);
  assert.match(orb, /x: "49vw", y: "0vh", scale: 1, duration: \.05/);
  assert.match(orb, /x: "29vw", y: "0vh", scale: 1\.5, duration: \.05/);
  assert.doesNotMatch(orb, /footerMotion|trigger:\s*footer/);
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

test("renders the voxel canvas in the Desarrollo de software visual and keeps its title legible", async () => {
  const about = await readFile("src/components/Saas/About/PrimaryAbout.jsx", "utf8");
  const styles = await readFile("src/components/Saas/About/PrimaryAbout.module.css", "utf8");

  assert.match(about, /import IsometricVoxelCard from "@\/components\/LandingShared\/IsometricVoxelCard";/);
  assert.match(about, /const isSoftwareStory = story\.number === "01";/);
  assert.match(about, /isSoftwareStory \? \(\s*<div className=\{styles\.voxelCanvas\}>\s*<IsometricVoxelCard\s*\/>\s*<\/div>\s*\) : null/);
  assert.match(styles, /\.voxelCanvas\s*\{[\s\S]*?position:\s*absolute;[\s\S]*?inset:\s*1\.1rem;/);
  assert.match(styles, /\.softwareStory \.storyTitle span\s*\{[\s\S]*?color:\s*var\(--primary-main-dark\);[\s\S]*?mix-blend-mode:\s*normal;/);
});

test("renders a responsive mobile-app canvas only in the Desarrollamos apps visual", async () => {
  const about = await readFile("src/components/Saas/About/PrimaryAbout.jsx", "utf8");
  const styles = await readFile("src/components/Saas/About/PrimaryAbout.module.css", "utf8");
  const canvas = await readFile("src/components/Saas/About/MobileAppCanvas.jsx", "utf8");

  assert.match(about, /import MobileAppCanvas from "\.\/MobileAppCanvas";/);
  assert.match(about, /const isAppsStory = story\.number === "02";/);
  assert.match(about, /isAppsStory \? \(\s*<div className=\{styles\.appCanvas\}>\s*<MobileAppCanvas\s*\/>\s*<\/div>\s*\) : null/);
  assert.match(styles, /\.appCanvas\s*\{[\s\S]*?position:\s*absolute;[\s\S]*?inset:\s*1\.1rem;/);
  assert.match(canvas, /new ResizeObserver\(resize\)/);
  assert.match(canvas, /new IntersectionObserver/);
  assert.match(canvas, /container\.addEventListener\("pointermove"/);
  assert.match(canvas, /container\.removeEventListener\("pointermove"/);
  assert.match(canvas, /requestAnimationFrame\(frame\)/);
  assert.match(canvas, /cancelAnimationFrame\(raf\)/);
  assert.match(canvas, /<canvas ref=\{canvasRef\}/);
});

test("renders an ultra-realistic web-design canvas only in the DiseÃ±o y web visual", async () => {
  const about = await readFile("src/components/Saas/About/PrimaryAbout.jsx", "utf8");
  const styles = await readFile("src/components/Saas/About/PrimaryAbout.module.css", "utf8");
  const canvas = await readFile("src/components/Saas/About/WebDesignCanvas.jsx", "utf8");

  assert.match(about, /import WebDesignCanvas from "\.\/WebDesignCanvas";/);
  assert.match(about, /const isWebStory = story\.number === "03";/);
  assert.match(about, /isWebStory \? \(\s*<div className=\{styles\.webCanvas\}>\s*<WebDesignCanvas\s*\/>\s*<\/div>\s*\) : null/);
  assert.match(styles, /\.webCanvas\s*\{[\s\S]*?position:\s*absolute;[\s\S]*?inset:\s*1\.1rem;/);
  assert.match(canvas, /const ASSET_URL = "\/images\/services\/web-design-studio\.png";/);
  assert.match(canvas, /new ResizeObserver\(resize\)/);
  assert.match(canvas, /new IntersectionObserver/);
  assert.match(canvas, /container\.addEventListener\("pointermove"/);
  assert.match(canvas, /requestAnimationFrame\(frame\)/);
  assert.match(canvas, /<canvas ref=\{canvasRef\}/);
});

test("redesigns testimonials with the Landing Primary grid and GSAP motion", async () => {
  const testimonials = await readFile("src/components/Saas/Testimonials.jsx", "utf8");
  const styles = await readFile("src/components/Saas/Testimonials.module.css", "utf8");

  assert.match(testimonials, /import gsap from "gsap";/);
  assert.match(testimonials, /import \{ ScrollTrigger \} from "gsap\/ScrollTrigger";/);
  assert.match(testimonials, /data-primary-testimonials/);
  assert.match(testimonials, /data-testimonials-heading-character/);
  assert.match(testimonials, /data-testimonials-reveal/);
  assert.match(testimonials, /data-testimonials-client/);
  assert.match(testimonials, /start: "top 72%"/);
  assert.match(testimonials, /prefers-reduced-motion: reduce/);
  assert.match(testimonials, /role="tablist"/);
  assert.match(testimonials, /aria-live="polite"/);
  assert.doesNotMatch(testimonials, /framer-motion|Swiper/);
  assert.match(styles, /grid-template-columns:\s*repeat\(12, minmax\(0, 1fr\)\);/);
  assert.match(styles, /font-family:\s*var\(--primary-font-family\);/);
  assert.match(styles, /@keyframes testimonials-marquee/);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
});

test("loads reCAPTCHA only from routes and forms that require it", async () => {
  const layout = await readFile("src/app/layout.tsx", "utf8");
  const contact = await readFile("src/components/Contact/Form.jsx", "utf8");
  const marketing = await readFile("src/components/Marketing/MarketingPrimaryContent.jsx", "utf8");
  const hr = await readFile("src/app/recursos-humanos/page.tsx", "utf8");

  assert.doesNotMatch(layout, /RecaptchaEnterpriseScript/);
  assert.doesNotMatch(layout, /google\.com\/recaptcha\/enterprise\.js/);
  assert.match(contact, /<RecaptchaEnterpriseScript\s*\/>/);
  assert.match(marketing, /<RecaptchaEnterpriseScript\s*\/>/);
  assert.match(hr, /notFound\(\)/);
});

test("removes the promotion banner and keeps Hermes draggable from the right edge", async () => {
  const layout = await readFile("src/app/layout.tsx", "utf8");
  const hermes = await readFile("src/components/HermesWhatsAppButton/index.jsx", "utf8");

  assert.doesNotMatch(layout, /PromoBanner/);
  await assert.rejects(access("src/components/PromoBanner/index.tsx"));
  assert.match(hermes, /right:\s*var\(--primary-page-gutter, 24px\);/);
  assert.match(hermes, /right:\s*16px;/);
  assert.match(hermes, /setPointerCapture/);
  assert.match(hermes, /releasePointerCapture/);
  assert.match(hermes, /touch-action:\s*none;/);
});
