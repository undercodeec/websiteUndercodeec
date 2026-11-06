const WHATSAPP_NUMBER = "593999739534";
const BLACK_FRIDAY_MESSAGE =
  "Hola, quiero contratar la oferta Black Friday de Landing Page por $80,00.";

export const buildBlackFridayLandingWhatsAppUrl = () =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(BLACK_FRIDAY_MESSAGE)}`;
