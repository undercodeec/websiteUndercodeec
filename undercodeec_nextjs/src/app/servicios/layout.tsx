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

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": `${SITE_URL}/servicios/#faq`,
  mainEntity: [
    {
      "@type": "Question",
      name: "¿Qué servicios digitales ofrece Undercodeec?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Undercodeec ofrece cuatro servicios digitales principales: (1) Diseño y desarrollo de páginas web profesionales, (2) Desarrollo de aplicaciones móviles Android e iOS, (3) Software empresarial a medida — CRM, ERP, facturación electrónica, control de inventarios y e-commerce —, y (4) Marketing digital y posicionamiento SEO con campañas de Google Ads y Meta Ads.",
      },
    },
    {
      "@type": "Question",
      name: "¿Trabajan con empresas fuera de Ecuador?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sí. Tenemos clientes en Ecuador, España y Latinoamérica. Trabajamos de forma 100% remota con reuniones por videollamada, gestión ágil con Jira/Trello y entregas quincenales. La facturación se hace en USD o EUR según el país del cliente.",
      },
    },
    {
      "@type": "Question",
      name: "¿Cuál es el rango de precios de los servicios de Undercodeec?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Los precios de Undercodeec son: páginas web profesionales desde 500 USD, aplicaciones móviles desde 2.000 USD, software empresarial a medida desde 1.500 USD y planes de marketing digital y SEO desde 300 USD mensuales. Todos los presupuestos son personalizados según los requisitos del proyecto.",
      },
    },
    {
      "@type": "Question",
      name: "¿Ofrecen soporte técnico después del lanzamiento?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sí. Todos nuestros servicios incluyen soporte técnico post-lanzamiento: correcciones de errores, actualizaciones de seguridad, mejoras de rendimiento y nuevas funcionalidades. Ofrecemos planes de mantenimiento mensuales y soporte por email, WhatsApp y videollamada.",
      },
    },
    {
      "@type": "Question",
      name: "¿Cómo solicito un presupuesto?",
      acceptedAnswer: {
        "@type": "Answer",
      text: "Para solicitar un presupuesto puedes (1) escribir a gerencia@undercodeec.com, (2) llamar al +593-999-739-534 o (3) llenar el formulario en /contacto. Respondemos en menos de 24 horas con una propuesta personalizada y una videollamada de descubrimiento sin costo.",
      },
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {children}
    </>
  );
}
