const ESPANA_SERVICE_CANVAS_SCENES = {
  "Desarrollo web Madrid, Barcelona y Valencia": {
    id: "corporate-web",
    label: "Sitio web corporativo adaptable y orientado a conversión",
  },
  "Tienda online España y ecommerce España": {
    id: "ecommerce",
    label: "Catálogo digital que conduce a una compra online",
  },
  "Desarrollo de apps móviles España": {
    id: "mobile-app",
    label: "Aplicación móvil conectada a las operaciones del negocio",
  },
  "Software empresarial España": {
    id: "business-software",
    label: "Procesos y datos conectados en un sistema empresarial",
  },
};

export function getEspanaServiceCanvasScene(title) {
  return ESPANA_SERVICE_CANVAS_SCENES[title] ?? null;
}
