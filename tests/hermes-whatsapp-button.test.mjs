import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  buildHermesWhatsAppUrl,
  HERMES_WHATSAPP_LINK_PROPS,
  isHermesWhatsAppHiddenPath,
  trackHermesWhatsAppClick,
} from "../src/components/HermesWhatsAppButton/config.mjs";

test("builds the approved WhatsApp conversation URL", () => {
  assert.equal(
    buildHermesWhatsAppUrl(),
    "https://wa.me/593999739534?text=Hola%2C%20quisiera%20obtener%20informaci%C3%B3n%20sobre%20los%20servicios%20de%20Undercodeec.",
  );
});

test("adds only a valid opaque attribution reference to the WhatsApp message", () => {
  assert.equal(
    buildHermesWhatsAppUrl("UC-ABCDEFGHJKLMNPQRSTUVWX"),
    "https://wa.me/593999739534?text=Hola%2C%20quisiera%20obtener%20informaci%C3%B3n%20sobre%20los%20servicios%20de%20Undercodeec.%20Referencia%3A%20UC-ABCDEFGHJKLMNPQRSTUVWX",
  );
  assert.equal(buildHermesWhatsAppUrl("gclid-secret"), buildHermesWhatsAppUrl());
});

test("hides the Hermes entrypoint on internal route prefixes", () => {
  for (const pathname of [
    "/admin",
    "/admin/crm",
    "/contratos/123",
    "/recursos-humanos/solicitudes",
    "/undercodeec",
  ]) {
    assert.equal(isHermesWhatsAppHiddenPath(pathname), true, pathname);
  }
  assert.equal(isHermesWhatsAppHiddenPath("/servicios"), false);
  assert.equal(isHermesWhatsAppHiddenPath("/administracion"), false);
  assert.equal(isHermesWhatsAppHiddenPath("/contratos-publicos"), false);
});

test("uses secure new-tab attributes and tracks only the Hermes click event", () => {
  assert.deepEqual(HERMES_WHATSAPP_LINK_PROPS, {
    target: "_blank",
    rel: "noopener noreferrer",
  });

  const calls = [];
  trackHermesWhatsAppClick((...args) => calls.push(args), "/servicios");

  assert.deepEqual(calls, [["trackCustom", "WhatsAppHermesClick", {
    source: "hermes_whatsapp_button",
    page_path: "/servicios",
  }]]);
  assert.doesNotThrow(() => trackHermesWhatsAppClick(undefined, "/servicios"));
});

test("root layout mounts Hermes instead of the web AI assistant", async () => {
  const layout = await readFile("src/app/layout.tsx", "utf8");

  assert.match(
    layout,
    /import HermesWhatsAppButton from "@\/components\/HermesWhatsAppButton"/,
  );
  assert.match(layout, /<HermesWhatsAppButton\s*\/>/);
  assert.doesNotMatch(layout, /import AIAssistant from "@\/components\/AIAssistant"/);
  assert.doesNotMatch(layout, /<AIAssistant\s*\/>/);
  assert.match(layout, /<ConsentManager>/);
  assert.match(layout, /<AttributionProvider>/);
  assert.doesNotMatch(layout, /googletagmanager\.com\/gtag\/js/);
});

test("uses the CSS orb fallback instead of WebGL for phone-sized WhatsApp controls", async () => {
  const button = await readFile("src/components/HermesWhatsAppButton/index.jsx", "utf8");
  const channel = await readFile("src/components/Navbars/UnderCodeec/UnderCodeecChannelCanvas.jsx", "utf8");
  const orb = await readFile("src/components/PrimaryOrb/PrimaryOrb.jsx", "utf8");

  assert.match(button, /<PrimaryOrb className="hermes-whatsapp-orb" color="#25D366" disableOnMobile\s*\/>/);
  assert.match(channel, /<PrimaryOrb className=\{styles\.channelOrb\} color=\{color\} disableOnMobile\s*\/>/);
  assert.match(orb, /disableOnMobile && window\.matchMedia\("\(max-width: 700px\)"\)\.matches/);
});
