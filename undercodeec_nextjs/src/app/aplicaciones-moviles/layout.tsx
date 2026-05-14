import type { Metadata } from "next";

const SITE_URL = "https://undercodeec.com";

export const metadata: Metadata = {
  title: "Desarrollo de Aplicaciones Móviles | Apps Android e iOS - Undercodeec",
  description:
    "Empresa de desarrollo de aplicaciones móviles. Creamos apps nativas y multiplataforma para Android e iOS. Diseño UI/UX, apps de e-commerce, delivery, gestión empresarial y más. Presupuesto personalizado para tu proyecto.",
  keywords: [
    "desarrollo de aplicaciones móviles",
    "desarrollo de apps Android e iOS",
    "empresa de desarrollo de apps",
    "crear aplicación móvil para empresa",
    "programadores de aplicaciones móviles",
    "desarrollo de apps nativas",
    "desarrollo de apps multiplataforma",
    "desarrollo de apps Flutter React Native",
    "aplicaciones móviles para empresas",
    "diseño de apps móviles",
    "desarrollo de apps e-commerce móvil",
    "apps de delivery y logística",
    "apps de gestión empresarial Android iOS",
    "desarrollo de software móvil",
    "presupuesto desarrollo de aplicaciones móviles",
    "agencia de desarrollo de apps profesionales",
    "aplicaciones móviles seguras y de alto rendimiento",
    "publicar app en Play Store y App Store",
    "diseño UX UI aplicaciones móviles",
    "consultoría de desarrollo de apps",
  ],
  alternates: {
    canonical: `${SITE_URL}/aplicaciones-moviles/`,
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
    title: "Desarrollo de Aplicaciones Móviles | Undercodeec",
    description:
      "Creamos aplicaciones móviles innovadoras para Android e iOS. Diseño intuitivo, alto rendimiento y experiencias móviles que generan impacto.",
    url: `${SITE_URL}/aplicaciones-moviles/`,
    siteName: "Undercodeec",
    type: "website",
    locale: "es_ES",
    images: [
      {
        url: `${SITE_URL}/assets/img/undercode-logo.png`,
        width: 512,
        height: 512,
        alt: "Desarrollo de aplicaciones móviles Android e iOS - Undercodeec",
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
      name: "Desarrollo de Aplicaciones Móviles",
      item: `${SITE_URL}/aplicaciones-moviles/`,
    },
  ],
};

const serviceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": `${SITE_URL}/aplicaciones-moviles/#service`,
  name: "Desarrollo de Aplicaciones Móviles Android e iOS",
  description:
    "Diseño y desarrollo profesional de aplicaciones móviles nativas y multiplataforma (Flutter, React Native) para Android e iOS, con publicación en Google Play Store y Apple App Store.",
  provider: { "@id": `${SITE_URL}/#organization` },
  serviceType: [
    "Desarrollo de apps nativas Android (Kotlin, Java)",
    "Desarrollo de apps nativas iOS (Swift)",
    "Desarrollo multiplataforma con Flutter",
    "Desarrollo multiplataforma con React Native",
    "Diseño UX/UI de aplicaciones móviles",
    "Publicación en Google Play y App Store",
    "Apps de e-commerce y delivery",
    "Apps de gestión empresarial",
  ],
  areaServed: { "@type": "Place", name: "Worldwide" },
  availableChannel: {
    "@type": "ServiceChannel",
    serviceUrl: `${SITE_URL}/aplicaciones-moviles/`,
    availableLanguage: "es",
  },
  offers: {
    "@type": "AggregateOffer",
    priceCurrency: "USD",
    lowPrice: "2000",
    highPrice: "20000",
    offerCount: "5",
  },
};

export default function AplicacionesMovilesLayout({
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
