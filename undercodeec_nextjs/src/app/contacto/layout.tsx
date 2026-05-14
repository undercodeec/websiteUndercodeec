import type { Metadata } from "next";

const SITE_URL = "https://undercodeec.com";

export const metadata: Metadata = {
  title: "Contacto | Agencia de Desarrollo Web en Quito - Undercodeec",
  description:
    "Contáctanos para solicitar tu presupuesto de diseño web, aplicaciones móviles o posicionamiento SEO. Atendemos desde Quito - Sangolquí, Valle de los Chillos, a todo Ecuador. Respuesta en 24 horas.",
  keywords: [
    "contacto undercodeec",
    "agencia desarrollo web Quito",
    "contacto desarrollo de software Ecuador",
    "presupuesto pagina web Quito",
    "contactar agencia digital Ecuador",
    "diseño web Sangolqui Valle de los Chillos",
    "telefono agencia web Quito",
    "ventas undercodeec",
  ],
  alternates: {
    canonical: `${SITE_URL}/contacto/`,
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
    title: "Contacto | Agencia de Desarrollo Web en Quito - Undercodeec",
    description:
      "Solicita tu presupuesto de diseño web, apps móviles o SEO. Atendemos desde Quito a todo Ecuador con respuesta en 24 horas.",
    url: `${SITE_URL}/contacto/`,
    siteName: "Undercodeec",
    type: "website",
    locale: "es_EC",
    images: [
      {
        url: `${SITE_URL}/assets/img/undercode-logo.png`,
        width: 512,
        height: 512,
        alt: "Contacto Undercodeec - Quito, Ecuador",
      },
    ],
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Inicio", item: `${SITE_URL}/` },
    { "@type": "ListItem", position: 2, name: "Contacto", item: `${SITE_URL}/contacto/` },
  ],
};

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": `${SITE_URL}/contacto/#localbusiness-quito`,
  name: "UNDER CODEEC - Agencia de Desarrollo Web en Quito",
  alternateName: "Undercodeec Quito",
  image: `${SITE_URL}/assets/img/undercode-logo.png`,
  logo: `${SITE_URL}/assets/img/undercode-logo.png`,
  url: `${SITE_URL}/contacto/`,
  telephone: "+593-979-046-329",
  email: "ventas@undercodeec.com",
  priceRange: "$$",
  currenciesAccepted: "USD",
  paymentAccepted: "Cash, Credit Card, Bank Transfer, PayPal",
  description:
    "Agencia digital en Quito especializada en diseño y desarrollo de páginas web profesionales, aplicaciones móviles para Android e iOS, posicionamiento SEO y software empresarial a medida.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Sangolquí - Valle de los Chillos",
    addressLocality: "Quito",
    addressRegion: "Pichincha",
    postalCode: "171103",
    addressCountry: "EC",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: -0.3331,
    longitude: -78.4530,
  },
  hasMap:
    "https://www.google.com/maps/place/Sangolqu%C3%AD,+Ecuador/@-0.3331,-78.4530,14z",
  areaServed: [
    { "@type": "City", name: "Quito" },
    { "@type": "City", name: "Sangolquí" },
    { "@type": "AdministrativeArea", name: "Valle de los Chillos" },
    { "@type": "AdministrativeArea", name: "Pichincha" },
    { "@type": "Country", name: "Ecuador" },
  ],
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "18:00",
    },
  ],
  contactPoint: [
    {
      "@type": "ContactPoint",
      contactType: "sales",
      telephone: "+593-979-046-329",
      email: "ventas@undercodeec.com",
      availableLanguage: ["es"],
      areaServed: "EC",
    },
  ],
  sameAs: [
    "https://www.facebook.com/undercodeec",
    "https://www.instagram.com/undercodeec/",
  ],
  parentOrganization: { "@id": `${SITE_URL}/#organization` },
};

export default function ContactoLayout({
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      {children}
    </>
  );
}
