import type { Metadata } from "next";

const SITE_URL = "https://undercodeec.com";

export const metadata: Metadata = {
  title: "Servicios | Desarrollo Web, Apps Móviles, Software y SEO - Undercodeec",
  description:
    "Catálogo de servicios digitales de Undercodeec: diseño y desarrollo web profesional, aplicaciones móviles Android e iOS, software empresarial a medida (CRM, ERP, facturación electrónica), posicionamiento SEO y marketing digital.",
  keywords: [
    "servicios de desarrollo web",
    "servicios agencia digital",
    "servicios desarrollo de aplicaciones móviles",
    "servicios software empresarial a medida",
    "servicios marketing digital",
    "servicios posicionamiento SEO",
    "servicios e-commerce",
    "servicios CRM y ERP",
    "servicios facturación electrónica",
    "agencia de transformación digital",
    "soluciones digitales empresas",
    "consultoría tecnológica",
  ],
  alternates: {
    canonical: `${SITE_URL}/servicios/`,
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
    title: "Servicios Digitales | Undercodeec",
    description:
      "Desarrollo web, apps móviles Android e iOS, software a medida (CRM, ERP, facturación electrónica), marketing digital y SEO.",
    url: `${SITE_URL}/servicios/`,
    siteName: "Undercodeec",
    type: "website",
    locale: "es_ES",
    images: [
      {
        url: `${SITE_URL}/assets/img/undercode-logo.png`,
        width: 512,
        height: 512,
        alt: "Servicios Undercodeec",
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
  ],
};

const itemListJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Servicios digitales de Undercodeec",
  itemListOrder: "https://schema.org/ItemListUnordered",
  numberOfItems: 4,
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      url: `${SITE_URL}/aplicaciones-moviles/`,
      name: "Desarrollo de Aplicaciones Móviles Android e iOS",
    },
    {
      "@type": "ListItem",
      position: 2,
      url: `${SITE_URL}/software-para-tu-negocio/`,
      name: "Software Empresarial a Medida (CRM, ERP, Facturación Electrónica)",
    },
    {
      "@type": "ListItem",
      position: 3,
      url: `${SITE_URL}/marketing-para-tu-negocio/`,
      name: "Marketing Digital y Posicionamiento SEO",
    },
    {
      "@type": "ListItem",
      position: 4,
      url: `${SITE_URL}/`,
      name: "Diseño y Desarrollo de Páginas Web Profesional",
    },
  ],
};

export default function ServiciosLayout({
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      {children}
    </>
  );
}
