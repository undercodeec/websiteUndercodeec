import type { Metadata } from "next";

const SITE_URL = "https://undercodeec.com";

export const metadata: Metadata = {
  title: "Nuestra Trayectoria | Agencia Digital con Experiencia - Undercodeec",
  description:
    "Conoce a Undercodeec: agencia digital fundada en 2018 especializada en diseño y desarrollo web, aplicaciones móviles, software empresarial y posicionamiento SEO. Equipo, filosofía y casos de éxito.",
  keywords: [
    "sobre undercodeec",
    "agencia digital Ecuador",
    "historia agencia desarrollo web",
    "equipo desarrollo web Quito",
    "trayectoria agencia digital",
    "casos de éxito desarrollo web",
    "agencia transformación digital",
    "agencia digital con experiencia",
    "filosofía agencia tecnológica",
  ],
  alternates: {
    canonical: `${SITE_URL}/nuestra-trayectoria/`,
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
    title: "Nuestra Trayectoria | Undercodeec",
    description:
      "Agencia digital con experiencia en desarrollo web, apps móviles, software a medida y SEO. Conoce nuestra historia, equipo y filosofía.",
    url: `${SITE_URL}/nuestra-trayectoria/`,
    siteName: "Undercodeec",
    type: "website",
    locale: "es_ES",
    images: [
      {
        url: `${SITE_URL}/assets/img/undercode-logo.png`,
        width: 512,
        height: 512,
        alt: "Trayectoria de Undercodeec",
      },
    ],
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Inicio", item: `${SITE_URL}/` },
    {
      "@type": "ListItem",
      position: 2,
      name: "Nuestra Trayectoria",
      item: `${SITE_URL}/nuestra-trayectoria/`,
    },
  ],
};

const aboutPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  "@id": `${SITE_URL}/nuestra-trayectoria/#aboutpage`,
  url: `${SITE_URL}/nuestra-trayectoria/`,
  name: "Nuestra Trayectoria - Undercodeec",
  inLanguage: "es",
  description:
    "Agencia digital fundada en 2018 especializada en desarrollo web, aplicaciones móviles, software empresarial y SEO.",
  mainEntity: { "@id": `${SITE_URL}/#organization` },
};

export default function NuestraTrayectoriaLayout({
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutPageJsonLd) }}
      />
      {children}
    </>
  );
}
