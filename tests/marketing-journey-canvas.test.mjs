import assert from "node:assert/strict";
import test from "node:test";

let getEspanaServiceCanvasScene;

try {
  ({ getEspanaServiceCanvasScene } = await import(
    "../src/components/Marketing/espanaServiceCanvasScenes.mjs"
  ));
} catch {
  // The first TDD run documents the missing Spanish services canvas mapping.
}

test("asigna una metáfora visual específica a cada servicio de España", () => {
  assert.deepEqual(getEspanaServiceCanvasScene?.("Desarrollo web Madrid, Barcelona y Valencia"), {
    id: "corporate-web",
    label: "Sitio web corporativo adaptable y orientado a conversión",
  });
  assert.deepEqual(getEspanaServiceCanvasScene?.("Tienda online España y ecommerce España"), {
    id: "ecommerce",
    label: "Catálogo digital que conduce a una compra online",
  });
  assert.deepEqual(getEspanaServiceCanvasScene?.("Desarrollo de apps móviles España"), {
    id: "mobile-app",
    label: "Aplicación móvil conectada a las operaciones del negocio",
  });
  assert.deepEqual(getEspanaServiceCanvasScene?.("Software empresarial España"), {
    id: "business-software",
    label: "Procesos y datos conectados en un sistema empresarial",
  });
});
