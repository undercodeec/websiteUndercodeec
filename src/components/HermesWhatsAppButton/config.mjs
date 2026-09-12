const WHATSAPP_NUMBER = "593999739534";
const WHATSAPP_MESSAGE =
  "Hola, quisiera obtener información sobre los servicios de Undercodeec.";
const HIDDEN_PATH_PREFIXES = ["/admin", "/contratos", "/recursos-humanos"];

export const HERMES_WHATSAPP_LINK_PROPS = {
  target: "_blank",
  rel: "noopener noreferrer",
};

export const buildHermesWhatsAppUrl = () =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

export const isHermesWhatsAppHiddenPath = (pathname) =>
  HIDDEN_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname?.startsWith(`${prefix}/`),
  );

export const trackHermesWhatsAppClick = (tracker, pagePath) => {
  if (typeof tracker === "function") {
    tracker("trackCustom", "WhatsAppHermesClick", {
      source: "hermes_whatsapp_button",
      page_path: pagePath || "/",
    });
  }
};
