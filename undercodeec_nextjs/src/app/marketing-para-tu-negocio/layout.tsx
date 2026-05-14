import type { Metadata } from "next";

const SITE_URL = "https://undercodeec.com";

export const metadata: Metadata = {
  title: "Marketing Digital para tu Negocio | SEO, Redes Sociales y Publicidad - Undercodeec",
  description:
    "Agencia de marketing digital. Servicios de SEO, posicionamiento web, gestión de redes sociales, publicidad en Google Ads y Meta Ads. Aumenta tus ventas con estrategias de inbound marketing y análisis SEO de precisión para empresas y pequeños negocios.",
  keywords: [
    "marketing digital",
    "agencia de marketing digital",
    "SEO",
    "posicionamiento web",
    "posicionamiento en Google",
    "gestión de redes sociales",
    "publicidad en Google Ads",
    "publicidad en Meta Ads",
    "inbound marketing",
    "estrategias de marketing digital",
    "análisis SEO para negocios",
    "community manager",
    "marketing de contenidos",
    "branding digital",
    "consultoría de marketing digital",
    "campañas publicitarias digitales",
    "crecimiento digital para empresas",
    "agencia SEO",
    "optimización para motores de búsqueda",
    "publicidad online",
  ],
  alternates: {
    canonical: `${SITE_URL}/marketing-para-tu-negocio/`,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: "Marketing Digital para tu Negocio | Undercodeec",
    description:
      "Potenciamos tu marca con estrategias de marketing digital, SEO, redes sociales y campañas publicitarias orientadas a resultados.",
    url: `${SITE_URL}/marketing-para-tu-negocio/`,
    siteName: "Undercodeec",
    type: "website",
    locale: "es_ES",
    images: [
      {
        url: `${SITE_URL}/assets/img/undercode-logo.png`,
        width: 512,
        height: 512,
        alt: "Marketing digital, SEO y publicidad online - Undercodeec",
      },
    ],
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Inicio", item: `${SITE_URL}/` },
    { "@type": "ListItem", position: 2, name: "Servicios", item: `${SITE_URL}/servicios/` },
    {
      "@type": "ListItem",
      position: 3,
      name: "Marketing Digital para tu Negocio",
      item: `${SITE_URL}/marketing-para-tu-negocio/`,
    },
  ],
};

const serviceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": `${SITE_URL}/marketing-para-tu-negocio/#service`,
  name: "Marketing Digital y Posicionamiento SEO",
  description:
    "Estrategias de marketing digital: SEO técnico y de contenidos, posicionamiento en Google, campañas en Google Ads y Meta Ads, gestión de redes sociales (Facebook e Instagram), inbound marketing y branding digital.",
  provider: { "@id": `${SITE_URL}/#organization` },
  serviceType: [
    "Posicionamiento web (SEO)",
    "Auditoría SEO técnica",
    "SEO local y nacional",
    "Campañas de Google Ads",
    "Campañas de Meta Ads (Facebook e Instagram)",
    "Gestión de redes sociales",
    "Marketing de contenidos",
    "Inbound marketing",
    "Branding digital",
    "Email marketing",
  ],
  areaServed: { "@type": "Place", name: "Worldwide" },
  availableChannel: {
    "@type": "ServiceChannel",
    serviceUrl: `${SITE_URL}/marketing-para-tu-negocio/`,
    availableLanguage: "es",
  },
  offers: {
    "@type": "AggregateOffer",
    priceCurrency: "USD",
    lowPrice: "300",
    highPrice: "10000",
    offerCount: "6",
  },
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      {children}
    </>
  );
}
