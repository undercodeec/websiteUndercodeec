import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  buildHermesWhatsAppUrl,
  HERMES_WHATSAPP_LINK_PROPS,
  isCommercialWhatsAppTrackingPath,
  isHermesWhatsAppHiddenPath,
  trackCommercialWhatsAppClick,
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
    "/undercodeec",
  ]) {
    assert.equal(isHermesWhatsAppHiddenPath(pathname), true, pathname);
  }
  assert.equal(isHermesWhatsAppHiddenPath("/servicios"), false);
  assert.equal(isHermesWhatsAppHiddenPath("/administracion"), false);
  assert.equal(isHermesWhatsAppHiddenPath("/contratos-publicos"), false);
  assert.equal(isHermesWhatsAppHiddenPath("/recursos-humanos/solicitudes"), false);
});

test("uses secure new-tab attributes and tracks a commercial WhatsApp click", () => {
  assert.deepEqual(HERMES_WHATSAPP_LINK_PROPS, {
    target: "_blank",
    rel: "noopener noreferrer",
  });

  const calls = [];
  trackCommercialWhatsAppClick((...args) => calls.push(args), {
    source: "hermes_whatsapp_button",
    pagePath: "/servicios",
  });

  assert.deepEqual(calls, [["trackCustom", "WhatsAppCommercialClick", {
    source: "hermes_whatsapp_button",
    page_path: "/servicios",
  }]]);
  assert.doesNotThrow(() => trackCommercialWhatsAppClick(undefined, {
    source: "commercial_whatsapp_link",
    pagePath: "/",
  }));
});

test("excludes internal routes from commercial WhatsApp Meta tracking", () => {
  const calls = [];
  for (const path of ["/admin", "/admin/crm", "/contratos", "/contratos/123", "/undercodeec", "/undercodeec/contacto"]) {
    assert.equal(isCommercialWhatsAppTrackingPath(path), false, path);
    trackCommercialWhatsAppClick((...args) => calls.push(args), {
      source: "commercial_whatsapp_link",
      pagePath: path,
    });
  }
  assert.deepEqual(calls, []);
  for (const path of ["/", "/servicios", "/administracion", "/contratos-publicos"]) {
    assert.equal(isCommercialWhatsAppTrackingPath(path), true, path);
  }
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

test("keeps UnderCodeec channel icons on the WebGL orb in mobile view", async () => {
  const button = await readFile("src/components/HermesWhatsAppButton/index.jsx", "utf8");
  const channel = await readFile("src/components/Navbars/UnderCodeec/UnderCodeecChannelCanvas.jsx", "utf8");
  const orb = await readFile("src/components/PrimaryOrb/PrimaryOrb.jsx", "utf8");

  assert.match(button, /<PrimaryOrb className="hermes-whatsapp-orb" color="#25D366" disableOnMobile\s*\/>/);
  assert.match(channel, /<PrimaryOrb className=\{styles\.channelOrb\} color=\{color\}\s*\/>/);
  assert.match(orb, /disableOnMobile && window\.matchMedia\("\(max-width: 700px\)"\)\.matches/);
});
