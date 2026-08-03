import type { Metadata } from "next";

const SITE_URL = "https://undercodeec.com";

export const metadata: Metadata = {
  title: "Software para tu Negocio | CRM, Inventarios y Facturación Electrónica - Undercodeec",
  description:
    "Soluciones de software empresarial a medida. Sistemas CRM, control de inventarios, facturación electrónica, e-commerce y automatización de procesos para pequeñas y medianas empresas. Desarrollo de software personalizado con soporte técnico especializado.",
  keywords: [
    "software empresarial",
    "software para pequeñas y medianas empresas",
    "sistema de gestión empresarial",
    "software CRM",
    "CRM para gestión de ventas y clientes",
    "sistema de control de inventarios",
    "software de inventarios en la nube",
    "facturación electrónica",
    "software de facturación electrónica",
    "sistema contable y administrativo",
    "software ERP",
    "desarrollo de software a medida",
    "automatización de procesos empresariales",
    "e-commerce para negocios",
    "tienda online",
    "sistema de ventas y punto de venta",
    "software de gestión empresarial",
    "transformación digital empresarial",
    "soluciones tecnológicas para empresas",
    "desarrollo de software personalizado",
  ],
  alternates: {
    canonical: `${SITE_URL}/software-para-tu-negocio/`,
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
    title: "Software para tu Negocio | Undercodeec",
    description:
      "Soluciones de software a medida: CRM, inventarios, facturación electrónica y e-commerce. Impulsa la transformación digital de tu empresa.",
    url: `${SITE_URL}/software-para-tu-negocio/`,
    siteName: "Undercodeec",
    type: "website",
    locale: "es_ES",
    images: [
      {
        url: `${SITE_URL}/assets/img/undercode-logo.png`,
        width: 512,
        height: 512,
        alt: "Software empresarial a medida CRM, ERP, facturación electrónica - Undercodeec",
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
      name: "Software para tu Negocio",
      item: `${SITE_URL}/software-para-tu-negocio/`,
    },
  ],
};

const serviceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": `${SITE_URL}/software-para-tu-negocio/#service`,
  name: "Software Empresarial a Medida (CRM, ERP, Facturación Electrónica)",
  description:
    "Desarrollo de software empresarial personalizado: sistemas CRM, ERP, control de inventarios, facturación electrónica, e-commerce y automatización de procesos para pymes.",
  provider: { "@id": `${SITE_URL}/#organization` },
  serviceType: [
    "Software CRM a medida",
    "Software ERP empresarial",
    "Sistema de control de inventarios",
    "Software de facturación electrónica",
    "Automatización de procesos empresariales",
    "Tiendas online y e-commerce",
    "Sistemas de punto de venta (POS)",
    "Software contable y administrativo",
  ],
  areaServed: { "@type": "Place", name: "Worldwide" },
  availableChannel: {
    "@type": "ServiceChannel",
    serviceUrl: `${SITE_URL}/software-para-tu-negocio/`,
    availableLanguage: "es",
  },
  offers: {
    "@type": "AggregateOffer",
    priceCurrency: "USD",
    lowPrice: "1500",
    highPrice: "30000",
    offerCount: "8",
  },
};

export default function SoftwareLayout({
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
