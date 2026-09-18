import type { Metadata } from "next";
import Script from "next/script";
import AttributionProvider from "@/components/Attribution/AttributionProvider";
import CommercialWhatsAppAttribution from "@/components/Attribution/CommercialWhatsAppAttribution";
import ConsentManager from "@/components/Consent/ConsentManager";
import HermesWhatsAppButton from "@/components/HermesWhatsAppButton";
import { PrimaryCursor, PrimaryPreloader } from "@/components/Primary";
import "@/styles/globals.css";
import "@/styles/primary-system.css";
import "@/styles/trading-card.css";

export const metadata: Metadata = {
  title: "Undercodeec - Diseño y Desarrollo de Páginas Web Profesional",
  description: "Expertos en diseño y desarrollo de páginas web profesionales, aplicaciones móviles y posicionamiento SEO. Impulsamos la transformación digital de tu negocio.",
  keywords: [
    "diseño de páginas web",
    "desarrollo de páginas web",
    "desarrollo web profesional",
    "agencia de desarrollo web",
    "creación de páginas web profesionales",
    "programación y diseño web",
    "diseño de página web profesional",
    "desarrollo de aplicaciones web",
    "desarrollo y diseño web a medida",
    "desarrollo de aplicaciones móviles",
    "posicionamiento SEO",
    "agencia ecommerce",
    "agencia de diseño web",
    "agencia digital",
    "transformación digital",
    "soluciones digitales para empresas"
  ],
  metadataBase: new URL("https://undercodeec.com"),
  alternates: {
    canonical: "https://undercodeec.com/",
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
    title: "Undercodeec - Diseño Web Profesional y Desarrollo a Medida",
    description: "Servicios expertos en diseño web, desarrollo de aplicaciones móviles y posicionamiento SEO orientados a resultados.",
    url: "https://undercodeec.com/",
    siteName: "Undercodeec",
    type: "website",
    locale: "es_ES",
    images: [
      {
        url: "https://undercodeec.com/assets/img/undercode-logo.png",
        width: 512,
        height: 512,
        alt: "Undercodeec - Agencia digital de diseño web, apps móviles y SEO",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Undercodeec - Diseño Web Profesional y Desarrollo a Medida",
    description:
      "Servicios expertos en diseño web, apps móviles y SEO orientados a resultados.",
    images: ["https://undercodeec.com/assets/img/undercode-logo.png"],
    creator: "@undercodeec",
    site: "@undercodeec",
  },
  authors: [{ name: "Undercodeec", url: "https://undercodeec.com" }],
  creator: "Undercodeec",
  publisher: "Undercodeec",
  category: "Technology",
  applicationName: "Undercodeec",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  verification: {
    google: "SxFpPrIPCwqofE3TadWiw0dRtAWmmNrkpTKywVmqBUc",
  },
};

const SITE_URL = "https://undercodeec.com";

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": ["Organization", "ProfessionalService"],
  "@id": `${SITE_URL}/#organization`,
  name: "UNDER CODEEC",
  alternateName: ["Undercodeec", "Under Codeec"],
  url: SITE_URL,
  logo: {
    "@type": "ImageObject",
    url: `${SITE_URL}/assets/img/undercode-logo.png`,
    width: 512,
    height: 512,
  },
  image: `${SITE_URL}/assets/img/undercode-logo.png`,
  description:
    "Agencia digital especializada en diseño y desarrollo de páginas web profesionales, aplicaciones móviles Android e iOS, posicionamiento SEO, marketing digital y software empresarial a medida (CRM, ERP y facturación electrónica).",
  slogan: "Transformación digital para tu negocio",
  email: "gerencia@undercodeec.com",
  telephone: "+593-999-739-534",
  foundingDate: "2018",
  priceRange: "$$",
  currenciesAccepted: "USD",
  knowsAbout: [
    "Diseño y desarrollo de páginas web profesionales",
    "Desarrollo de aplicaciones móviles Android e iOS",
    "Software empresarial a medida (CRM, ERP)",
    "Facturación electrónica Ecuador",
    "Posicionamiento SEO técnico y de contenidos",
    "Marketing digital y campañas de Google Ads y Meta Ads",
    "Inteligencia artificial aplicada a negocios",
    "E-commerce y tiendas online",
    "Transformación digital empresarial",
    "Generative Engine Optimization (GEO)",
  ],
  knowsLanguage: ["es"],
  sameAs: [
    "https://www.facebook.com/undercodeec",
    "https://www.instagram.com/undercodeec/",
  ],
  contactPoint: [
    {
      "@type": "ContactPoint",
      contactType: "sales",
      email: "gerencia@undercodeec.com",
      telephone: "+593-999-739-534",
      availableLanguage: ["es"],
    },
    {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: "gerencia@undercodeec.com",
      availableLanguage: ["es"],
    },
  ],
};

const webSiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: SITE_URL,
  name: "Undercodeec",
  description:
    "Diseño y desarrollo de páginas web profesionales, aplicaciones móviles y posicionamiento SEO.",
  inLanguage: ["es", "es-EC", "es-ES"],
  publisher: { "@id": `${SITE_URL}/#organization` },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/blog?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

// SpeakableSpecification: ayuda a asistentes de IA y voz a identificar
// los fragmentos clave de la página para citar como "respuesta directa".
const speakableJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${SITE_URL}/#speakable`,
  url: SITE_URL,
  speakable: {
    "@type": "SpeakableSpecification",
    cssSelector: [
      "h1",
      "h2",
      ".geo-answer",
      "[data-speakable]",
      ".blog-section-heading",
    ],
  },
  isPartOf: { "@id": `${SITE_URL}/#website` },
  about: { "@id": `${SITE_URL}/#organization` },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning={true}>
      <head>
        <Script id="consent-default" strategy="beforeInteractive">
          {`window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments);}
window.gtag=window.gtag||gtag;
gtag('consent','default',{
  ad_storage:'denied',
  analytics_storage:'denied',
  ad_user_data:'denied',
  ad_personalization:'denied',
  wait_for_update:500
});`}
        </Script>

        {/* Critical CSS — blocks render intentionally */}
        <link rel="stylesheet" href="/assets/css/lib/bootstrap.min.css" />
        <link rel="stylesheet" href="/assets/css/style.css" />

        {/* Non-critical CSS — loaded async after main thread is free */}
        <Script id="deferred-css" strategy="afterInteractive">
          {`(function(){var s=['/assets/css/lib/all.min.css','/assets/css/lib/bootstrap-icons.css','/landing-preview/css/preview-style.css','/assets/css/animations.css'];s.forEach(function(h){var l=document.createElement('link');l.rel='stylesheet';l.href=h;document.head.appendChild(l);});})();`}
        </Script>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(speakableJsonLd) }}
        />
      </head>
      <body suppressHydrationWarning={true}>
        <ConsentManager>
          <AttributionProvider>
            <CommercialWhatsAppAttribution />
            <PrimaryPreloader />
            <PrimaryCursor />
            <HermesWhatsAppButton />
            {children}
            <Script src="/assets/js/lib/bootstrap.bundle.min.js" strategy="afterInteractive" />
          </AttributionProvider>
        </ConsentManager>
      </body>
    </html>
  );
}
