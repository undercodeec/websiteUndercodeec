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

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": `${SITE_URL}/marketing-para-tu-negocio/#faq`,
  mainEntity: [
    {
      "@type": "Question",
      name: "¿Cuánto cuesta una campaña de marketing digital con Undercodeec?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Una campaña de marketing digital con Undercodeec cuesta desde 300 USD mensuales para pymes en planes básicos de SEO y redes sociales, hasta 10.000 USD para estrategias integrales con SEO técnico, Google Ads, Meta Ads y gestión avanzada de contenidos. El presupuesto se ajusta a tus objetivos, sector y mercado.",
      },
    },
    {
      "@type": "Question",
      name: "¿En cuánto tiempo se ven resultados del posicionamiento SEO?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Los resultados del posicionamiento SEO se ven entre 3 y 6 meses para keywords de baja-media competencia, y entre 6 y 12 meses para términos competitivos. SEO es una estrategia de mediano-largo plazo: trabajamos optimización técnica, contenidos y enlaces para asegurar tráfico orgánico sostenible.",
      },
    },
    {
      "@type": "Question",
      name: "¿Qué diferencia hay entre SEO y Google Ads?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "SEO genera tráfico orgánico (gratuito) a mediano-largo plazo optimizando tu web para Google. Google Ads genera tráfico de pago inmediato pagando por clics. Lo ideal es combinarlos: Google Ads para resultados rápidos mientras el SEO madura.",
      },
    },
    {
      "@type": "Question",
      name: "¿Gestionan campañas de Facebook e Instagram (Meta Ads)?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sí. Gestionamos campañas completas de Meta Ads (Facebook e Instagram): segmentación avanzada de audiencias, creación de creatividades, A/B testing, retargeting con píxel de Meta y reportes mensuales de ROI.",
      },
    },
    {
      "@type": "Question",
      name: "¿Optimizan mi web para que sea citada por IA como ChatGPT y Perplexity?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sí. Aplicamos Generative Engine Optimization (GEO): estructuramos tu contenido con datos JSON-LD, FAQs, schema speakable y formato pregunta-respuesta para que motores de IA como ChatGPT, Perplexity, Gemini y Claude indexen y citen tu web como fuente confiable.",
      },
    },
  ],
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {children}
    </>
  );
}
