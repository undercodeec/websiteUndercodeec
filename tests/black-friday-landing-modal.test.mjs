import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { buildBlackFridayLandingWhatsAppUrl } from "../src/components/BlackFridayLandingModal/config.mjs";

test("builds the Black Friday $80,00 landing-page WhatsApp URL", () => {
  assert.equal(
    buildBlackFridayLandingWhatsAppUrl(),
    "https://wa.me/593999739534?text=Hola%2C%20quiero%20contratar%20la%20oferta%20Black%20Friday%20de%20Landing%20Page%20por%20%2480%2C00.",
  );
});

test("waits three seconds after the preload-ready signal before opening the Black Friday dialog", async () => {
  const component = await readFile(
    "src/components/BlackFridayLandingModal/BlackFridayLandingModal.jsx",
    "utf8",
  );

  assert.match(component, /function BlackFridayLandingModal\(\{ isPageReady \}\)/);
  assert.match(component, /if \(!isPageReady \|\| hasDismissed\) return undefined;/);
  assert.match(component, /window\.setTimeout\(\(\) => setIsOpen\(true\), 3000\)/);
  assert.match(component, /role="dialog"/);
  assert.match(component, /aria-modal="true"/);
  assert.match(component, /<span>\$<\/span>80,00/);
});

test("contains the approved Black Friday landing-page benefits and one WhatsApp CTA", async () => {
  const component = await readFile(
    "src/components/BlackFridayLandingModal/BlackFridayLandingModal.jsx",
    "utf8",
  );

  for (const benefit of [
    "Landing page de una sola sección",
    "Diseño responsive para celulares",
    "Botón flotante de WhatsApp y llamada directa",
    "Formulario de contacto o captura de prospectos",
    "Sección de beneficios del servicio o producto",
    "Dominio .com y hosting básico por 1 año",
    "5 correos corporativos",
    "SEO técnico base",
    "1 año de soporte posterior a la entrega",
  ]) {
    assert.match(component, new RegExp(benefit));
  }

  assert.match(component, /buildBlackFridayLandingWhatsAppUrl/);
  assert.match(component, /Hablar por WhatsApp/);
  assert.match(component, /sessionStorage\.setItem\(DISMISSAL_KEY, "true"\)/);
  assert.match(component, /event\.key === "Escape"/);
});

test("mounts the Black Friday modal in the root page using the preloader-ready state", async () => {
  const page = await readFile("src/app/page.tsx", "utf8");

  assert.match(page, /import BlackFridayLandingModal from "@\/components\/BlackFridayLandingModal\/BlackFridayLandingModal"/);
  assert.match(page, /<BlackFridayLandingModal isPageReady=\{isReady\}\s*\/>/);
});

test("uses a responsive overlay and a rectangular WhatsApp CTA", async () => {
  const styles = await readFile(
    "src/components/BlackFridayLandingModal/BlackFridayLandingModal.module.css",
    "utf8",
  );

  assert.match(styles, /\.backdrop\s*\{/);
  assert.match(styles, /\.dialog\s*\{[\s\S]*max-height:/);
  assert.match(styles, /\.benefits\s*\{[\s\S]*overflow-y:\s*auto/);
  assert.match(styles, /\.whatsappButton\s*\{[\s\S]*border-radius:\s*12px/);
  assert.match(styles, /@media\s*\(max-width:\s*640px\)/);
  assert.match(styles, /prefers-reduced-motion:\s*reduce/);
});
