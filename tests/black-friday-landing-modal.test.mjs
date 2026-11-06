import assert from "node:assert/strict";
import test from "node:test";
import { buildBlackFridayLandingWhatsAppUrl } from "../src/components/BlackFridayLandingModal/config.mjs";

test("builds the Black Friday $80,00 landing-page WhatsApp URL", () => {
  assert.equal(
    buildBlackFridayLandingWhatsAppUrl(),
    "https://wa.me/593999739534?text=Hola%2C%20quiero%20contratar%20la%20oferta%20Black%20Friday%20de%20Landing%20Page%20por%20%2480%2C00.",
  );
});
