import Link from "next/link";

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
    price: "80",
    originalPrice: "250",
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
    name: "Web Site Lanzamiento",
    price: "120",
    originalPrice: "360",
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
    price: "250",
    originalPrice: "550",
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

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://undercodeec.com/#organization",
  name: "UNDER CODEEC",
  alternateName: "Undercodeec",
  url: "https://undercodeec.com",
  logo: "https://undercodeec.com/assets/img/undercode-logo.png",
  description:
    "Agencia de desarrollo web para empresas en Ecuador, con atención a proyectos de Quito, Guayaquil y otras ciudades del país.",
  sameAs: [
    "https://www.facebook.com/undercodeec",
    "https://www.instagram.com/undercodeec/",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "sales",
    email: "gerencia@undercodeec.com",
    telephone: "+593-999-739-534",
    availableLanguage: ["es"],
    areaServed: "EC",
  },
};

const professionalServiceJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": "https://undercodeec.com/ec/#professionalservice",
  name: "Undercodeec",
  url: "https://undercodeec.com/ec/",
  image: "https://undercodeec.com/assets/img/undercode-logo.png",
  telephone: "+593-999-739-534",
  email: "gerencia@undercodeec.com",
  priceRange: "$$",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Sangolquí - Valle de los Chillos",
    addressLocality: "Quito",
    addressRegion: "Pichincha",
    addressCountry: "EC",
  },
  areaServed: [
    { "@type": "City", name: "Quito" },
    { "@type": "City", name: "Guayaquil" },
    { "@type": "Country", name: "Ecuador" },
  ],
};

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
  about: { "@id": "https://undercodeec.com/ec/#professionalservice" },
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
  organizationJsonLd,
  professionalServiceJsonLd,
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
        <header>
          <p>Agencia de desarrollo web para empresas en Ecuador</p>
          <h1>Diseño de Páginas Web en Quito, Guayaquil y Ecuador</h1>
          <p>
            Creamos páginas web profesionales para empresas, emprendedores y
            negocios en Ecuador. Somos una agencia de desarrollo web con
            atención en Quito, Guayaquil y todo el país, especializada en
            diseño web, tiendas online, aplicaciones móviles, software a medida
            y posicionamiento SEO.
          </p>
          <p><a href="#presupuesto">Pide tu presupuesto gratis</a></p>
          <p><Link href="/#demos">Ver portafolio</Link></p>
          <ul>
            <li>Presupuesto personalizado en 24 horas</li>
            <li>Diseño adaptable a móviles y computadoras</li>
            <li>SEO técnico integrado desde el desarrollo</li>
            <li>Facturación electrónica SRI</li>
          </ul>
        </header>

        <section aria-labelledby="experiencia-title">
          <h2 id="experiencia-title">Experiencia y atención para tu proyecto</h2>
          <ul>
            <li>Más de 100 proyectos entregados</li>
            <li>Presupuestos en 24 horas</li>
            <li>Facturación electrónica SRI</li>
            <li>Más de 10 años de experiencia</li>
          </ul>
        </section>

        <section id="servicios" aria-labelledby="servicios-title">
          <h2 id="servicios-title">Servicios digitales para empresas en Ecuador</h2>
          <p>
            Ayudamos a empresas y emprendimientos ecuatorianos a crear,
            modernizar y escalar sus canales digitales. Nuestro equipo trabaja
            en desarrollo web, aplicaciones móviles, ecommerce, software
            empresarial, SEO y publicidad digital, con el desarrollo web como
            especialidad principal de esta landing.
          </p>
          {services.map((service) => (
            <article key={service.title}>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <ul>
                {service.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <p><Link href={service.href}>{service.linkText}</Link></p>
            </article>
          ))}
        </section>

        <section aria-labelledby="quito-title">
          <h2 id="quito-title">Diseño de Páginas Web en Quito</h2>
          <p>
            Desarrollamos páginas web para empresas, profesionales, comercios y
            emprendimientos en Quito y sus alrededores. Creamos sitios
            corporativos, landing pages, tiendas online y plataformas web
            adaptadas a cada negocio, con diseño responsive, optimización SEO y
            herramientas orientadas a generar contactos y oportunidades
            comerciales.
          </p>
          <p>
            Si buscas una agencia de diseño web en Quito, revisamos contigo el
            objetivo de la página, los contenidos y las funcionalidades
            necesarias antes de preparar una propuesta. Puedes{" "}
            <Link href="/contacto/">contactar a nuestro equipo en Ecuador</Link> para
            solicitar información.
          </p>
        </section>

        <section aria-labelledby="guayaquil-title">
          <h2 id="guayaquil-title">Diseño de Páginas Web en Guayaquil</h2>
          <p>
            Creamos páginas web profesionales para empresas y negocios de
            Guayaquil que necesitan captar clientes, presentar sus servicios,
            vender por internet o digitalizar procesos. Desarrollamos páginas
            corporativas, ecommerce, landing pages y soluciones web a medida
            con atención remota para proyectos en Guayaquil y otras ciudades de
            Ecuador.
          </p>
          <p>
            El diseño web en Guayaquil se planifica según el modelo comercial,
            el público, el catálogo y las herramientas que requiere cada
            proyecto, sin necesidad de afirmar una presencia física local.
          </p>
        </section>

        <section id="presupuesto" aria-labelledby="precios-title">
          <h2 id="precios-title">Precios de Páginas Web en Ecuador</h2>
          <p>
            El precio de una página web en Ecuador depende del diseño, número
            de secciones, funcionalidades, integraciones y alcance del
            proyecto. Estos valores son precios referenciales de partida; cada
            proyecto recibe un presupuesto personalizado.
          </p>
          {plans.map((plan) => {
            const message = encodeURIComponent(
              "Hola, quisiera solicitar un presupuesto del plan " + plan.name + ".",
            );

            return (
              <article key={plan.name}>
                <h3>{plan.name}</h3>
                <p>
                  Desde {"$"}{plan.price} USD. Precio referencial anterior: {"$"}
                  {plan.originalPrice} USD.
                </p>
                <p>{plan.description}</p>
                <ul>
                  {plan.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
                <p>
                  <a
                    href={"https://wa.me/593999739534?text=" + message}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Solicitar presupuesto por WhatsApp
                  </a>
                </p>
              </article>
            );
          })}
          <h3>Tiempos según el alcance del proyecto</h3>
          <ul>
            <li>Presupuesto: aproximadamente 24 horas.</li>
            <li>Landing page: puede iniciar desde 48 horas, según alcance y contenidos.</li>
            <li>Sitio corporativo: normalmente entre 2 y 4 semanas.</li>
            <li>Ecommerce, aplicaciones y software: según catálogo, integraciones y alcance.</li>
          </ul>
          <p>
            Si necesitas dominio, correos corporativos o una configuración
            específica, también contamos con <Link href="/hosting/">hosting para empresas</Link>.
          </p>
        </section>

        <section aria-labelledby="faq-title">
          <h2 id="faq-title">Preguntas frecuentes sobre páginas web en Ecuador</h2>
          {faqs.map((faq) => (
            <details key={faq.question}>
              <summary>{faq.question}</summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </section>

        <section aria-labelledby="incluye-title">
          <h2 id="incluye-title">Qué incluye trabajar con Undercodeec</h2>
          <table>
            <caption>
              Características que se definen según el plan y alcance de cada proyecto
            </caption>
            <thead>
              <tr>
                <th scope="col">Característica</th>
                <th scope="col">Información</th>
              </tr>
            </thead>
            <tbody>
              {includedRows.map(([feature, detail]) => (
                <tr key={feature}>
                  <th scope="row">{feature}</th>
                  <td>{detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section aria-labelledby="recursos-title">
          <h2 id="recursos-title">Recursos para empresas y emprendimientos</h2>
          <p>
            Puedes revisar nuestro <Link href="/blog/">blog de tecnología y negocios</Link>{" "}
            para conocer contenidos relacionados con desarrollo web, marketing
            digital y herramientas para empresas.
          </p>
        </section>

        <section id="contacto" aria-labelledby="contacto-title">
          <h2 id="contacto-title">Solicita tu Página Web en Ecuador</h2>
          <p>
            Trabajamos con empresas, profesionales y emprendimientos de Quito,
            Guayaquil y otras ciudades de Ecuador. Cuéntanos qué necesitas y
            prepararemos un presupuesto según las características de tu proyecto.
          </p>
          <p>
            <a
              href="https://wa.me/593999739534?text=Hola%2C%20quiero%20solicitar%20un%20presupuesto%20para%20una%20p%C3%A1gina%20web%20en%20Ecuador."
              target="_blank"
              rel="noopener noreferrer"
            >
              Solicitar presupuesto por WhatsApp
            </a>
          </p>
          <p><a href="tel:+593999739534">Llamar al +593 999 739 534</a></p>
          <p>
            <a href="mailto:gerencia@undercodeec.com">
              Escribir a gerencia@undercodeec.com
            </a>
          </p>
        </section>
      </main>
    </>
  );
}
