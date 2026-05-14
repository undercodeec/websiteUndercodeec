import type { Metadata } from "next";
import Script from "next/script";
import AIAssistant from "@/components/AIAssistant";
import CustomCursor from "@/components/CustomCursor";
import AudioMuteButton from "@/components/AudioMuteButton";
import PageTransition from "@/components/PageTransition";
import "@/styles/globals.css";
import "@/styles/preloader.css";
import "@/styles/trading-card.css";

export const metadata: Metadata = {
  title: "Undercodeec - Diseño y Desarrollo de Páginas Web Profesional",
  description: "Expertos en diseño y desarrollo de páginas web profesionales, aplicaciones móviles y posicionamiento SEO. Impulsamos la transformación digital de tu negocio.",
  keywords: [
    "diseño de páginas web",
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
    languages: {
      "es-EC": "https://undercodeec.com/ec",
      "es-ES": "https://undercodeec.com/es",
      "x-default": "https://undercodeec.com/",
    },
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
  verification: {
    google: "TjIVgYGV2-AduD8UBXsIX_Yf0Q7TwAmOp55hVkZI9ss",
  },
};

const SITE_URL = "https://undercodeec.com";

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: "UNDER CODEEC",
  alternateName: "Undercodeec",
  url: SITE_URL,
  logo: {
    "@type": "ImageObject",
    url: `${SITE_URL}/assets/img/undercode-logo.png`,
    width: 512,
    height: 512,
  },
  description:
    "Agencia digital especializada en diseño y desarrollo de páginas web profesionales, aplicaciones móviles, posicionamiento SEO y software empresarial a medida.",
  email: "ventas@undercodeec.com",
  telephone: "+593-979-046-329",
  foundingDate: "2018",
  areaServed: [
    { "@type": "Country", name: "Ecuador" },
    { "@type": "Country", name: "España" },
  ],
  sameAs: [
    "https://www.facebook.com/undercodeec",
    "https://www.instagram.com/undercodeec/",
  ],
  contactPoint: [
    {
      "@type": "ContactPoint",
      contactType: "sales",
      email: "ventas@undercodeec.com",
      telephone: "+593-979-046-329",
      availableLanguage: ["es"],
      areaServed: ["EC", "ES"],
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
  inLanguage: "es",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning={true}>
      <head>
        {/* Google Tag Manager */}
        <Script id="gtm-init" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-WX7HLGTV');`}
        </Script>
        {/* End Google Tag Manager */}

        <link rel="stylesheet" href="/assets/css/lib/all.min.css" />
        <link rel="stylesheet" href="/assets/css/lib/bootstrap-icons.css" />
        <link rel="stylesheet" href="/assets/css/lib/bootstrap.min.css" />
        <link rel="stylesheet" href="/assets/css/style.css" />
        <link rel="stylesheet" href="/landing-preview/css/preview-style.css" />
        <link rel="stylesheet" href="/assets/css/animations.css" />

        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-99Z5CCZ3RK"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-99Z5CCZ3RK');
          `}
        </Script>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }}
        />
      </head>
      <body suppressHydrationWarning={true}>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-WX7HLGTV"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}

        <CustomCursor />
        <AIAssistant />
        <AudioMuteButton />
        <PageTransition>
          {children}
        </PageTransition>

        <Script src={`https://www.google.com/recaptcha/enterprise.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`} strategy="beforeInteractive" />
        <Script src="/assets/js/lib/pace.js" strategy="afterInteractive" />
        <Script src="/assets/js/lib/bootstrap.bundle.min.js" strategy="afterInteractive" />
        <Script src="/landing-preview/js/parallax.min.js" strategy="afterInteractive" />
        <Script src="/assets/js/main.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
