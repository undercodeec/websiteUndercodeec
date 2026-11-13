import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("serves the simplified Black Friday offer from the static root landing", async () => {
  const page = await readFile("public/landing-primary/index.html", "utf8");

  assert.match(page, /black-friday-modal\.css/);
  assert.match(page, /data-black-friday-modal/);
  assert.match(page, /aria-label="Precio especial 80 dólares"/);
  assert.match(page, /<span>\$<\/span><strong>80,00<\/strong>/);
  const promoLink = page.match(/<a\s+class="black-friday-modal__whatsapp"\s+href="([^"]+)"/);
  assert.ok(promoLink);
  assert.equal(new URL(promoLink[1]).searchParams.get("text"), "hola quiero mas informacion de la promocion de $80.00");
  assert.match(page, /black-friday-modal\.js/);
  assert.match(page, /<h2[^>]*id="black-friday-modal-title"/);
  assert.match(page, /Escríbenos para saber más/);
  assert.doesNotMatch(page, /class="black-friday-modal__benefits"/);
  assert.doesNotMatch(page, /class="black-friday-modal__section-title"/);
});

test("opens three seconds after the static preloader releases the page", async () => {
  const script = await readFile("public/landing-primary/js/black-friday-modal.js", "utf8");

  assert.match(script, /homePreloaderDone/);
  assert.match(script, /window\.setTimeout\(openModal, 3000\)/);
  assert.match(script, /document\.body\.classList\.contains\("home-content-ready"\)/);
  assert.match(script, /event\.key === "Escape"/);
  assert.match(script, /event\.key === "Tab"/);
  assert.match(script, /createPrimaryOrb/);
  assert.match(script, /home-hero-character-clip/);
});

test("uses the root font, white copy, hero title animation, and floating WhatsApp orb", async () => {
  const styles = await readFile("public/landing-primary/css/black-friday-modal.css", "utf8");

  assert.match(styles, /\.black-friday-modal\s*\{/);
  assert.match(styles, /\.black-friday-modal__dialog\s*\{[\s\S]*max-height:/);
  assert.match(styles, /font-family:\s*"Ataero Retina OB Edition"/);
  assert.match(styles, /\.black-friday-modal__title[\s\S]*home-hero-character-enter/);
  assert.match(styles, /\.black-friday-modal__orb/);
  assert.match(styles, /\.black-friday-modal__whatsapp\s*\{[\s\S]*border-radius:\s*12px/);
  assert.match(styles, /\.black-friday-modal__whatsapp\s*\{[^}]*background:[^;]*#25d366/i);
  assert.match(styles, /\.black-friday-modal\[data-title-ready\] \.black-friday-modal__lead/);
  assert.match(styles, /\.black-friday-modal\[data-title-ready\] \.black-friday-modal__price/);
  assert.match(styles, /\.black-friday-modal\[data-title-ready\] \.black-friday-modal__whatsapp/);
  assert.match(styles, /font-size:\s*clamp\(38px,\s*5vw,\s*62px\)/);
  assert.doesNotMatch(styles, /body\.black-friday-modal-open \.uc-consent[\s\S]*visibility:\s*hidden/);
  assert.match(styles, /@media\s*\(max-width:\s*640px\)/);
});

test("keeps privacy controls visible above the Black Friday modal", async () => {
  const styles = await readFile("public/landing-primary/css/black-friday-modal.css", "utf8");
  const consent = await readFile("public/landing-primary/js/consent-attribution.js", "utf8");

  assert.doesNotMatch(styles, /body\.black-friday-modal-open \.uc-consent[\s\S]*pointer-events:\s*none/);
  assert.match(consent, /\.uc-consent-settings\s*\{[^}]*z-index:\s*2147483647/);
});

test("renders the modal's WebGL effect as a rectangle without changing floating orbs", async () => {
  const modal = await readFile("public/landing-primary/js/black-friday-modal.js", "utf8");
  const orb = await readFile("public/landing-primary/js/whatsapp-primary-orb.js", "utf8");

  assert.match(modal, /createPrimaryOrb\(orb,\s*\{[^}]*shape:\s*"rectangle"/);
  assert.match(orb, /shape\s*=\s*"sphere"/);
  assert.match(orb, /shape\s*===\s*"rectangle"\s*\?\s*new PlaneGeometry/);
  assert.match(orb, /PerspectiveCamera\(60,\s*1,\s*0\.1,\s*shape\s*===\s*"rectangle"\s*\?\s*4\s*:\s*2\)/);
  const styles = await readFile("public/landing-primary/css/black-friday-modal.css", "utf8");
  assert.match(styles, /\.black-friday-modal__orb\s*\{[^}]*z-index:\s*0\s*;/);
});

test("points from the Black Friday message to WhatsApp and respects reduced motion", async () => {
  const page = await readFile("public/landing-primary/index.html", "utf8");
  const styles = await readFile("public/landing-primary/css/black-friday-modal.css", "utf8");
  const script = await readFile("public/landing-primary/js/black-friday-modal.js", "utf8");

  assert.match(page, /¡Aprovecha esta mega promoción de Black Friday y haz que tu\s+negocio destaque!/);
  assert.match(page, /class="black-friday-modal__pointer"[^>]*aria-hidden="true"/);
  assert.match(page, /class="black-friday-modal__pointer-anchor"/);
  assert.match(styles, /@keyframes black-friday-pointer-trip/);
  assert.match(styles, /@keyframes black-friday-pointer-click/);
  assert.match(styles, /prefers-reduced-motion:[^)]*reduce[\s\S]*\.black-friday-modal__pointer/);
  assert.match(script, /getBoundingClientRect\(\)/);
  assert.match(script, /pointerAnchor\.getBoundingClientRect\(\)/);
  assert.match(script, /--black-friday-pointer-x/);
  assert.match(script, /--black-friday-pointer-y/);
});

test("starts the desktop pointer motion promptly and shows a click on WhatsApp", async () => {
  const page = await readFile("public/landing-primary/index.html", "utf8");
  const styles = await readFile("public/landing-primary/css/black-friday-modal.css", "utf8");

  assert.match(styles, /\.black-friday-modal\[data-title-ready\] \.black-friday-modal__pointer\s*\{[^}]*animation:\s*black-friday-pointer-trip 3\.2s [^;]* 0s infinite/);
  assert.match(styles, /\.black-friday-modal__whatsapp::after\s*\{/);
  assert.match(styles, /@keyframes black-friday-button-click/);
  assert.match(page, /black-friday-modal\.css\?v=20261109-consent-layer/);
  assert.match(page, /black-friday-modal\.js\?v=20261109-mobile-pointer/);
});
