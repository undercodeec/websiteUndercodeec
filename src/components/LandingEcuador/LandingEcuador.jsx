import MarketingHero from "@/components/Marketing/MarketingHero";
import EcuadorPrimaryContent from "./EcuadorPrimaryContent";

const faqs = [
  {
    question: "¿Cuánto cuesta crear una página web en Ecuador?",
    answer:
      "El precio de una página web en Ecuador depende del tipo de sitio, número de secciones, funcionalidades, integraciones y contenido requerido. Una landing page puede partir desde los valores referenciales mostrados en esta página; un sitio corporativo, ecommerce o plataforma a medida requiere una evaluación del alcance antes de preparar el presupuesto.",
  },
  {
    question: "¿Cuánto cuesta una página web profesional en Quito?",
    answer:
      "Una página web profesional en Quito se cotiza según los objetivos del negocio y las características del proyecto. Consideramos diseño, estructura de contenido, formularios, integración con WhatsApp, hosting, dominio y necesidades de posicionamiento SEO. Cuéntanos qué necesita tu empresa para recibir un presupuesto personalizado sin compromiso.",
  },
  {
    question: "¿Diseñan páginas web para empresas en Guayaquil?",
    answer:
      "Sí. Atendemos de forma remota proyectos de empresas, comercios y emprendimientos de Guayaquil. Creamos páginas corporativas, landing pages, tiendas online y soluciones web a medida, coordinando el proceso por videollamada, canales digitales y entregas planificadas según el alcance de cada proyecto.",
  },
  {
    question: "¿Cuánto tiempo toma desarrollar una página web?",
    answer:
      "El tiempo depende del alcance. El presupuesto suele prepararse aproximadamente en 24 horas. Una landing page puede iniciar desde 48 horas según sus contenidos y aprobaciones; los sitios corporativos normalmente requieren entre 2 y 4 semanas, mientras que un ecommerce, una app o un sistema a medida se planifica según sus integraciones y funcionalidades.",
  },
  {
    question: "¿El dominio y hosting están incluidos?",
    answer:
      "Los planes de páginas web pueden incluir dominio y hosting durante el periodo indicado en cada propuesta. La configuración final depende del plan contratado y de las necesidades técnicas del proyecto. Si necesitas correos corporativos, mayor capacidad o una configuración específica, evaluamos la alternativa de hosting adecuada para tu empresa.",
  },
  {
    question: "¿Una página web incluye posicionamiento SEO?",
    answer:
      "El desarrollo web incluye bases técnicas para SEO, como estructura semántica, adaptación a dispositivos móviles y buenas prácticas de rendimiento. El posicionamiento orgánico continuo requiere investigación de palabras clave, contenidos, enlazado interno, seguimiento y mejoras periódicas. Para ello contamos con un servicio especializado de marketing y posicionamiento SEO.",
  },
  {
    question: "¿Desarrollan tiendas online y ecommerce en Ecuador?",
    answer:
      "Sí. Desarrollamos tiendas online para negocios ecuatorianos que necesitan publicar productos, organizar catálogos, integrar medios de pago, coordinar inventarios y facilitar compras desde computadoras y celulares. El alcance de cada ecommerce se define según el catálogo, logística, integraciones y herramientas comerciales que necesite el negocio.",
  },
  {
    question: "¿Desarrollan aplicaciones móviles para empresas ecuatorianas?",
    answer:
      "Desarrollamos aplicaciones móviles para Android y iOS desde el diseño UX y UI hasta la publicación en Play Store y App Store. Evaluamos Flutter, React Native u otras tecnologías según los requisitos del producto, las integraciones necesarias y la evolución prevista para la aplicación.",
  },
  {
    question: "¿Crean software a medida, CRM o ERP?",
    answer:
      "Sí. Creamos software empresarial a medida para procesos como ventas, clientes, inventario, facturación electrónica, operaciones e integraciones con otros sistemas. Un CRM, ERP o plataforma interna se analiza antes de cotizarse para definir los usuarios, flujos, permisos, datos e integraciones que realmente necesita la empresa.",
  },
  {
    question: "¿Puedo solicitar un presupuesto de página web sin compromiso?",
    answer:
      "Sí. Puedes escribirnos por WhatsApp, teléfono o correo con una breve descripción de tu proyecto. Revisaremos el tipo de página, los objetivos, contenidos, funcionalidades y servicios necesarios para prepararte una propuesta clara. El presupuesto se ajusta al alcance real de tu empresa y no te obliga a contratar.",
  },
];

const services = [
  {
    title: "Diseño y Desarrollo Web en Ecuador",
    description:
      "Diseñamos y desarrollamos páginas web profesionales para empresas, negocios y emprendedores en Quito, Guayaquil y todo Ecuador. Creamos sitios corporativos, landing pages, portales web y soluciones a medida optimizadas para usuarios y motores de búsqueda.",
    features: [
      "Diseño personalizado según la identidad de cada negocio",
      "Sitios adaptados a celulares, tabletas y computadoras",
      "SEO técnico integrado desde el desarrollo",
      "Optimización de rendimiento y experiencia de usuario",
      "Integración con formularios, WhatsApp y herramientas empresariales",
      "Dominio y hosting según el plan contratado",
    ],
    href: "/servicios/",
    linkText: "Conoce nuestros servicios digitales",
  },
  {
    title: "Desarrollo de Aplicaciones Móviles en Ecuador",
    description:
      "Desarrollamos aplicaciones móviles para empresas ecuatorianas en Android y iOS, desde el diseño UX y UI hasta la publicación en Play Store y App Store. Podemos trabajar con Flutter, React Native u otras tecnologías según las necesidades técnicas del proyecto.",
    features: [
      "Apps para Android e iOS",
      "Flutter o React Native según el proyecto",
      "Diseño UX y UI",
      "Integraciones con APIs y sistemas empresariales",
      "Publicación en Play Store y App Store",
      "Mantenimiento y evolución del producto",
    ],
    href: "/aplicaciones-moviles/",
    linkText: "Desarrollo de aplicaciones móviles",
  },
  {
    title: "Posicionamiento SEO en Ecuador",
    description:
      "Mejoramos la visibilidad de páginas web en Google mediante SEO técnico, contenido, arquitectura web y estrategias orientadas al mercado ecuatoriano. Trabajamos búsquedas nacionales y locales para Quito, Guayaquil y otras ciudades del país.",
    features: [
      "Auditoría SEO técnica",
      "Investigación de palabras clave",
      "SEO local",
      "Optimización de contenido",
      "Arquitectura y enlazado interno",
      "Seguimiento de posiciones y conversiones",
    ],
    href: "/marketing-para-tu-negocio/",
    linkText: "Posicionamiento SEO y marketing digital",
  },
  {
    title: "Google Ads y Meta Ads en Ecuador",
    description:
      "Gestionamos campañas digitales orientadas a generar oportunidades comerciales en Ecuador mediante Google Ads y Meta Ads, utilizando seguimiento de conversiones y optimización basada en resultados.",
    features: [
      "Google Search",
      "Display cuando el proyecto lo requiera",
      "Meta Ads",
      "Segmentación geográfica",
      "Medición de conversiones",
      "Optimización periódica",
    ],
    href: "/marketing-para-tu-negocio/",
    linkText: "Servicios de marketing digital",
  },
  {
    title: "Desarrollo de Software a Medida en Ecuador",
    description:
      "Desarrollamos software empresarial a medida para compañías y negocios en Ecuador. Creamos sistemas CRM, ERP, inventarios, gestión de ventas, automatización de procesos e integraciones con plataformas existentes.",
    features: [
      "CRM personalizados",
      "ERP",
      "Sistemas de inventario",
      "Gestión de ventas",
      "Automatización de procesos",
      "Integraciones mediante API",
      "Plataformas empresariales escalables",
    ],
    href: "/software-para-tu-negocio/",
    linkText: "Desarrollo de software empresarial",
  },
  {
    title: "Facturación Electrónica SRI para Empresas",
    description:
      "Integramos soluciones de facturación electrónica para empresas que necesitan conectar sus sistemas con los procesos requeridos por el SRI en Ecuador.",
    features: [
      "Comprobantes XML",
      "Firma electrónica",
      "Emisión y autorización",
      "Integración con sistemas empresariales",
      "Actualizaciones ante cambios técnicos",
    ],
    href: "/software-para-tu-negocio/",
    linkText: "Software empresarial a medida",
  },
  {
    title: "Diseño de Tiendas Online y Ecommerce en Ecuador",
    description:
      "Creamos tiendas online para negocios ecuatorianos que necesitan vender productos o servicios por internet. Desarrollamos ecommerce administrables, adaptados a móviles y preparados para integrar pagos, inventarios, logística, WhatsApp y otras herramientas comerciales.",
    features: [
      "Catálogos administrables",
      "Integración con medios de pago",
      "Inventarios y procesos de venta",
      "Compras desde celulares y computadoras",
      "Integración con WhatsApp y canales comerciales",
      "SEO inicial para productos y categorías",
    ],
    href: "/software-para-tu-negocio/",
    linkText: "Soluciones ecommerce para empresas",
  },
];

const plans = [
  {
    name: "Landing Page",
    price: "250",
    description:
      "Para autónomos y pequeños negocios que necesitan una presencia web clara para presentar su propuesta y captar contactos.",
    features: [
      "Dominio .com y hosting por 1 año",
      "Diseño adaptable a móviles",
      "Formulario de contacto",
      "Botones de WhatsApp y llamadas",
      "SEO técnico inicial",
      "Soporte durante 1 mes y garantía de 1 año",
    ],
  },
  {
    name: "Sitio Web",
    price: "360",
    description:
      "Para empresas que necesitan presentar varios servicios e información desde un portal web completo.",
    features: [
      "Estructura de 5 a 10 páginas",
      "Diseño adaptado a la identidad de marca",
      "Diseño adaptable a móviles",
      "SEO técnico inicial",
      "Formularios de contacto e integración con WhatsApp",
      "Dominio .com y hosting por 1 año",
    ],
  },
  {
    name: "Tienda Online",
    price: "550",
    description:
      "Para negocios que requieren un ecommerce administrable y una operación de ventas acorde a su catálogo.",
    features: [
      "Tienda administrable para productos",
      "Carga inicial de 50 a 100 productos",
      "Pasarelas de pago según la necesidad del proyecto",
      "Dominio .com y hosting por 1 año",
      "Compra por WhatsApp, Telegram y redes sociales",
      "SEO técnico inicial",
    ],
  },
];

const includedRows = [
  ["Diseño personalizado", "Según la identidad y objetivos de tu negocio"],
  ["Dominio y hosting", "Según el plan contratado"],
  ["SSL", "Configuración incluida según la solución técnica"],
  ["Diseño responsive", "Adaptado a celulares, tabletas y computadoras"],
  ["SEO técnico inicial", "Estructura, semántica y buenas prácticas de desarrollo"],
  ["WhatsApp y formularios", "Integración cuando el proyecto lo requiere"],
  ["Soporte y garantía", "Según el alcance y plan contratado"],
  ["Presupuesto", "Personalizado según funcionalidades e integraciones"],
];

const webPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": "https://undercodeec.com/ec/#webpage",
  url: "https://undercodeec.com/ec/",
  name: "Diseño de Páginas Web en Quito, Guayaquil y Ecuador",
  description:
    "Diseño y desarrollo de páginas web profesionales para empresas de Quito, Guayaquil y Ecuador.",
  inLanguage: "es-EC",
  isPartOf: {
    "@type": "WebSite",
    "@id": "https://undercodeec.com/#website",
    url: "https://undercodeec.com",
    name: "Undercodeec",
  },
  about: { "@id": "https://undercodeec.com/ec/#web-development-service" },
};

const serviceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": "https://undercodeec.com/ec/#web-development-service",
  name: "Diseño y Desarrollo de Páginas Web en Ecuador",
  description:
    "Diseño y desarrollo de páginas web profesionales para empresas, negocios y emprendimientos de Quito, Guayaquil y Ecuador.",
  provider: { "@id": "https://undercodeec.com/#organization" },
  serviceType: [
    "Diseño de páginas web",
    "Desarrollo web",
    "Sitios corporativos",
    "Landing pages",
    "Tiendas online",
  ],
  areaServed: [
    { "@type": "City", name: "Quito" },
    { "@type": "City", name: "Guayaquil" },
    { "@type": "Country", name: "Ecuador" },
  ],
  availableChannel: {
    "@type": "ServiceChannel",
    serviceUrl: "https://undercodeec.com/ec/",
    availableLanguage: "es",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map(({ question, answer }) => ({
    "@type": "Question",
    name: question,
    acceptedAnswer: { "@type": "Answer", text: answer },
  })),
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Inicio",
      item: "https://undercodeec.com/",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Diseño de Páginas Web en Ecuador",
      item: "https://undercodeec.com/ec/",
    },
  ],
};

const schemas = [
  webPageJsonLd,
  serviceJsonLd,
  faqJsonLd,
  breadcrumbJsonLd,
];

export default function LandingEcuador() {
  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <main>
        <MarketingHero
          label="Diseño de Páginas Web en Quito, Guayaquil y Ecuador"
          lines={["Diseño de páginas", "web en Quito,", "Guayaquil y Ecuador"]}
          topMeta="Diseño web / Desarrollo / Ecuador"
          summary="Creamos páginas web profesionales para empresas de Quito, Guayaquil y todo Ecuador, con ecommerce, aplicaciones, software a medida y SEO."
          bottomMeta="Páginas web para empresas ecuatorianas"
          titleId="ecuador-hero-title"
        />
        <EcuadorPrimaryContent
          faqs={faqs}
          services={services}
          plans={plans}
          includedRows={includedRows}
        />
      </main>
    </>
  );
}
