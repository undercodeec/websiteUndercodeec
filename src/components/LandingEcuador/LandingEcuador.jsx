const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "UNDER CODEEC",
  alternateName: "Undercodeec",
  url: "https://undercodeec.com/ec",
  logo: "https://undercodeec.com/assets/img/undercode-logo.png",
  description:
    "Agencia digital especializada en diseño y desarrollo de páginas web profesionales, aplicaciones móviles y posicionamiento SEO en Quito, Guayaquil y todo el Ecuador.",
  areaServed: { "@type": "Country", name: "Ecuador" },
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

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "UNDER CODEEC",
  image: "https://undercodeec.com/assets/img/undercode-logo.png",
  url: "https://undercodeec.com/ec",
  telephone: "+593-999-739-534",
  email: "gerencia@undercodeec.com",
  priceRange: "$$",
  currenciesAccepted: "USD",
  paymentAccepted: "Cash, Credit Card, Bank Transfer, PayPal",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Sangolquí - Valle de los Chillos",
    addressLocality: "Quito",
    addressRegion: "Pichincha",
    addressCountry: "EC",
  },
  geo: { "@type": "GeoCoordinates", latitude: -0.3331, longitude: -78.453 },
  areaServed: [
    { "@type": "City", name: "Quito" },
    { "@type": "City", name: "Guayaquil" },
    { "@type": "Country", name: "Ecuador" },
  ],
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    opens: "09:00",
    closes: "18:00",
  },
};

const serviceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Diseño Web, Apps Móviles y Posicionamiento SEO en Quito y Ecuador",
  description:
    "Servicios profesionales de diseño y desarrollo web a medida, aplicaciones móviles para Android e iOS, posicionamiento en Google, Google Ads y software empresarial para empresas en Quito, Guayaquil y Ecuador.",
  provider: {
    "@type": "Organization",
    name: "UNDER CODEEC",
    url: "https://undercodeec.com/ec",
  },
  areaServed: { "@type": "Country", name: "Ecuador" },
  availableChannel: {
    "@type": "ServiceChannel",
    serviceUrl: "https://undercodeec.com/ec",
    availableLanguage: "es",
  },
  serviceType: [
    "Diseño y desarrollo de páginas web en Quito",
    "Desarrollo de aplicaciones móviles Android e iOS",
    "Posicionamiento web SEO en Ecuador",
    "Campañas de Google Ads y Meta Ads",
    "Software empresarial a medida",
    "Facturación electrónica SRI Ecuador",
    "Tiendas online y e-commerce",
  ],
  offers: {
    "@type": "AggregateOffer",
    priceCurrency: "USD",
    lowPrice: "80",
    highPrice: "30000",
    offerCount: "8",
  },
};

const faqs = [
  {
    question: "¿Cuánto cuesta una página web profesional en Quito o Ecuador?",
    answer:
      "El precio de una página web profesional en Ecuador parte desde $80 USD para una landing page, hasta $5.000 USD o más para tiendas online avanzadas o sistemas a medida. Trabajamos con presupuestos que se ajustan a tu bolsillo, sin costos ocultos.",
  },
  {
    question: "¿Atienden proyectos fuera de Quito?",
    answer:
      "Sí. Trabajamos de forma remota con empresas y pymes de Quito, Guayaquil y todo el Ecuador. La gestión es online con videollamadas y entregas semanales.",
  },
  {
    question: "¿Su facturación electrónica cumple con el SRI?",
    answer:
      "Sí. Nuestros sistemas de facturación electrónica están preparados para cumplir con los requisitos del SRI Ecuador, generación de comprobantes XML, firma electrónica y autorización en línea.",
  },
  {
    question: "¿Cuánto tarda el posicionamiento SEO en Google Ecuador?",
    answer:
      "Los primeros resultados sólidos de SEO en Ecuador suelen verse entre los 3 y 6 meses, dependiendo del sector y la competencia local en Quito o Guayaquil.",
  },
  {
    question: "¿Puedo pedir un presupuesto sin compromiso?",
    answer:
      "Por supuesto. Cuéntanos tu proyecto y en 24 a 48 horas te enviamos un presupuesto detallado en dólares, sin compromiso.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map(({ question, answer }) => ({
    "@type": "Question",
    name: question,
    acceptedAnswer: { "@type": "Answer", text: answer },
  })),
};

const services = [
  {
    title: "Diseño Web en Quito",
    description:
      "Diseñamos y desarrollamos páginas web profesionales, corporativas y tiendas online a medida en Quito y todo el Ecuador.",
    features: [
      "Diseño personalizado a tu identidad de marca",
      "Sitios web adaptados a móviles, ordenadores y tabletas",
      "SEO técnico integrado desde el inicio",
      "Entrega en 2 a 4 semanas con garantía de 1 año",
    ],
  },
  {
    title: "Apps Móviles Android y iOS",
    description:
      "Desarrollo de aplicaciones móviles nativas y multiplataforma para Android e iOS, con publicación en Play Store y App Store.",
    features: [
      "Flutter o React Native según tu proyecto",
      "Publicación en Play Store y App Store",
      "Diseño UX y UI nativo",
      "Mantenimiento y actualizaciones continuas",
    ],
  },
  {
    title: "SEO en Ecuador",
    description:
      "Posicionamiento web local y nacional en Google Ecuador para aparecer cuando tus clientes buscan en Quito, Guayaquil y el país.",
    features: [
      "Auditoría técnica y palabras clave locales",
      "Contenido optimizado para Ecuador",
      "Link building y autoridad de dominio",
      "Reportes mensuales con métricas reales",
    ],
  },
  {
    title: "Google Ads y Meta Ads",
    description:
      "Campañas en Google Ads y Meta Ads orientadas al mercado ecuatoriano, con seguimiento de conversiones y retorno de inversión.",
    features: [
      "Campañas Search, Display y Shopping",
      "Segmentación para el mercado ecuatoriano",
      "Seguimiento de conversiones y ROAS",
      "Optimización semanal",
    ],
  },
  {
    title: "Software a Medida",
    description:
      "CRM, ERP, inventarios, automatización de procesos y software a medida para empresas en Ecuador.",
    features: [
      "CRM, ERP e inventarios personalizados",
      "Automatización de procesos operativos",
      "Integración con sistemas actuales",
      "Soluciones escalables con soporte técnico",
    ],
  },
  {
    title: "Facturación Electrónica SRI",
    description:
      "Sistemas preparados para el SRI Ecuador, con comprobantes XML, firma electrónica y autorización en línea.",
    features: [
      "Comprobantes XML autorizados por el SRI",
      "Firma electrónica y emisión en línea",
      "Integración con sistemas contables",
      "Actualizaciones ante cambios normativos",
    ],
  },
];

const plans = [
  {
    name: "Landing Page",
    price: "80",
    originalPrice: "250",
    description:
      "Para autónomos y pequeños negocios que necesitan estar en Google.",
    features: [
      "Dominio .com y hosting por 1 año",
      "Diseño optimizado y adaptable a móviles",
      "Formulario de contacto",
      "Botones de WhatsApp y llamadas",
      "SEO orgánico integrado",
      "Soporte durante 1 mes y garantía de 1 año",
    ],
  },
  {
    name: "Web Site Lanzamiento",
    price: "120",
    originalPrice: "360",
    description:
      "Para mostrar servicios e información desde un portal web completo.",
    features: [
      "Estructura de 5 a 10 páginas",
      "Diseño adaptado a la identidad de marca",
      "Diseño adaptable a móviles",
      "SEO orgánico integrado",
      "Formularios de contacto e integración con WhatsApp",
      "Dominio .com y hosting por 1 año",
    ],
  },
  {
    name: "Tienda Online",
    price: "250",
    originalPrice: "550",
    description:
      "Tienda autogestionable para vender sin procesos manuales.",
    features: [
      "Tienda administrable para productos",
      "Carga inicial de 50 a 100 productos",
      "Pasarelas de pago como Stripe y PayPal",
      "Dominio .com y hosting por 1 año",
      "Compra por WhatsApp, Telegram y redes sociales",
      "SEO orgánico integrado",
    ],
  },
];

const comparisonRows = [
  ["Precio de landing page", "Desde $80", "—", "Desde $1.000"],
  ["Tiempo de entrega", "24 a 48 horas", "1 a 2 semanas", "2 a 4 semanas"],
  ["Demo gratis", "Sí", "No", "No"],
  ["Hosting incluido", "Sí", "A veces", "No"],
  ["SSL incluido", "Sí", "A veces", "A veces"],
  ["Diseño responsive", "Sí", "Sí", "Sí"],
  ["SEO configurado", "Sí", "Básico", "Sí"],
  ["Soporte por WhatsApp", "Sí", "Limitado", "No"],
  ["Cada web es única", "Sí", "Depende", "Sí"],
];

const organizationJsonLdString = JSON.stringify(organizationJsonLd);
const localBusinessJsonLdString = JSON.stringify(localBusinessJsonLd);
const serviceJsonLdString = JSON.stringify(serviceJsonLd);
const faqJsonLdString = JSON.stringify(faqJsonLd);

export default function LandingEcuador() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: organizationJsonLdString }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: localBusinessJsonLdString }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serviceJsonLdString }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: faqJsonLdString }}
      />

      <main>
        <header>
          <p>Agencia digital con cobertura nacional en Ecuador</p>
          <h1>Diseño de Páginas Web en Quito y Ecuador</h1>
          <p>
            Diseñamos páginas web, aplicaciones móviles y estrategias SEO para
            empresas en Quito, Guayaquil y todo el Ecuador.
          </p>
          <p><a href="#presupuesto">Pide tu presupuesto gratis</a></p>
          <p><a href="/#demos">Ver portafolios</a></p>
          <ul>
            <li>Presupuesto en 24 horas</li>
            <li>Sin permanencia</li>
            <li>Facturación electrónica SRI</li>
          </ul>
        </header>

        <section aria-labelledby="indicadores-title">
          <h2 id="indicadores-title">Experiencia y atención</h2>
          <ul>
            <li>Más de 100 proyectos entregados</li>
            <li>Presupuestos en 24 horas</li>
            <li>Facturación electrónica SRI</li>
            <li>Más de 10 años de experiencia</li>
          </ul>
        </section>

        <section id="servicios">
          <h2>Servicios digitales para empresas en Ecuador</h2>
          <p>Todo lo que tu empresa necesita para crecer online con un único equipo.</p>
          {services.map((service) => (
            <article key={service.title}>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <ul>
                {service.features.map((feature) => <li key={feature}>{feature}</li>)}
              </ul>
            </article>
          ))}
        </section>

        <section id="presupuesto">
          <h2>Presupuestos transparentes</h2>
          <p>Estos precios son puntos de partida. Cada proyecto recibe un presupuesto acorde a sus necesidades.</p>
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
                  {plan.features.map((feature) => <li key={feature}>{feature}</li>)}
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
        </section>

        <section aria-labelledby="faq-title">
          <h2 id="faq-title">Preguntas frecuentes</h2>
          {faqs.map((faq) => (
            <details key={faq.question}>
              <summary>{faq.question}</summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </section>

        <section aria-labelledby="comparacion-title">
          <h2 id="comparacion-title">Undercodeec frente a otras opciones</h2>
          <table>
            <caption>Comparación de servicios de desarrollo web</caption>
            <thead>
              <tr>
                <th scope="col">Característica</th>
                <th scope="col">Undercodeec</th>
                <th scope="col">Freelancer</th>
                <th scope="col">Agencia</th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map(([feature, undercodeec, freelancer, agency]) => (
                <tr key={feature}>
                  <th scope="row">{feature}</th>
                  <td>{undercodeec}</td>
                  <td>{freelancer}</td>
                  <td>{agency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section id="contacto">
          <h2>Contacta a Undercodeec</h2>
          <p>Atendemos proyectos de Quito, Guayaquil y todo el Ecuador.</p>
          <p>
            <a
              href="https://wa.me/593999739534?text=Hola%2C%20me%20gustar%C3%ADa%20obtener%20m%C3%A1s%20informaci%C3%B3n%20sobre%20los%20servicios%20de%20Undercodeec."
              target="_blank"
              rel="noopener noreferrer"
            >
              Chatear por WhatsApp
            </a>
          </p>
          <p><a href="tel:+593999739534">Llamar al +593 999 739 534</a></p>
          <p><a href="mailto:gerencia@undercodeec.com">Escribir a gerencia@undercodeec.com</a></p>
        </section>
      </main>
    </>
  );
}
