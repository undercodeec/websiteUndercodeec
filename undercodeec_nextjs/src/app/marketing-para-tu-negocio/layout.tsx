import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Marketing Digital para tu Negocio en Ecuador | SEO, Redes Sociales y Publicidad - Undercodeec",
  description:
    "Agencia de marketing digital en Quito y Ecuador. Servicios de SEO, posicionamiento web, manejo de redes sociales, publicidad en Google Ads y Facebook Ads. Aumenta tus ventas con estrategias de inbound marketing y análisis SEO de precisión para PYMES y empresas.",
  keywords: [
    "marketing digital Ecuador",
    "marketing digital Quito",
    "agencia de marketing digital Quito",
    "SEO Ecuador",
    "posicionamiento web Ecuador",
    "posicionamiento en Google Ecuador",
    "manejo de redes sociales Quito",
    "publicidad en Google Ads Ecuador",
    "publicidad en Facebook Ads Ecuador",
    "inbound marketing Ecuador",
    "estrategias de marketing digital PYMES",
    "análisis SEO para negocios",
    "community manager Quito",
    "marketing de contenidos Ecuador",
    "branding digital Quito",
    "consultoría de marketing digital Ecuador",
    "campañas publicitarias digitales Quito",
    "crecimiento digital para empresas Ecuador",
    "agencia SEO Quito",
    "optimización de motores de búsqueda Ecuador",
  ],
  openGraph: {
    title: "Marketing Digital para tu Negocio | Undercodeec - Quito, Ecuador",
    description:
      "Potenciamos tu marca con estrategias de marketing digital, SEO, redes sociales y campañas publicitarias. Agencia experta en Quito y Ecuador.",
    url: "https://undercodeec.com/marketing-para-tu-negocio",
    siteName: "Undercodeec",
    type: "website",
    locale: "es_EC",
  },
  alternates: {
    canonical: "https://undercodeec.com/marketing-para-tu-negocio",
  },
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
