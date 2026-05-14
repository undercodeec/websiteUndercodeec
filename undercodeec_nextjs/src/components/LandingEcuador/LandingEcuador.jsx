"use client";

import React, { useState } from "react";
import Link from "next/link";
import "@/components/Slider/slider.css";

const heroBackgroundPattern = "/assets/slider/6fa818bb935c0e2a1081f259d84df226b237a184.png";

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "UNDER CODEEC",
  "alternateName": "Undercodeec",
  "url": "https://undercodeec.com/ec",
  "logo": "https://undercodeec.com/assets/img/undercode-logo.png",
  "description":
    "Agencia digital especializada en diseño y desarrollo de páginas web profesionales, aplicaciones móviles y posicionamiento SEO en Quito, Guayaquil y todo el Ecuador.",
  "areaServed": {
    "@type": "Country",
    "name": "Ecuador",
  },
  "sameAs": [
    "https://www.facebook.com/undercodeec",
    "https://www.instagram.com/undercodeec/",
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "sales",
    "email": "ventas@undercodeec.com",
    "telephone": "+593-979-046-329",
    "availableLanguage": ["es"],
    "areaServed": "EC",
  },
};

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "name": "UNDER CODEEC",
  "image": "https://undercodeec.com/assets/img/undercode-logo.png",
  "url": "https://undercodeec.com/ec",
  "telephone": "+593-979-046-329",
  "email": "ventas@undercodeec.com",
  "priceRange": "$$",
  "currenciesAccepted": "USD",
  "paymentAccepted": "Cash, Credit Card, Bank Transfer, PayPal",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Sangolquí - Valle de los Chillos",
    "addressLocality": "Quito",
    "addressRegion": "Pichincha",
    "addressCountry": "EC",
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": -0.3331,
    "longitude": -78.4530,
  },
  "areaServed": [
    { "@type": "City", "name": "Quito" },
    { "@type": "City", "name": "Guayaquil" },
    { "@type": "City", "name": "Cuenca" },
    { "@type": "City", "name": "Ambato" },
    { "@type": "City", "name": "Sangolquí" },
    { "@type": "AdministrativeArea", "name": "Valle de los Chillos" },
    { "@type": "Country", "name": "Ecuador" },
  ],
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    "opens": "09:00",
    "closes": "18:00",
  },
};

const serviceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Diseño Web, Apps Móviles y Posicionamiento SEO en Quito y Ecuador",
  "description":
    "Servicios profesionales de diseño y desarrollo web a medida, aplicaciones móviles para Android e iOS, posicionamiento en Google (SEO), Google Ads y software empresarial para pymes y empresas en Quito, Guayaquil y todo el Ecuador.",
  "provider": {
    "@type": "Organization",
    "name": "UNDER CODEEC",
    "url": "https://undercodeec.com/ec",
    "logo": "https://undercodeec.com/assets/img/undercode-logo.png",
  },
  "areaServed": {
    "@type": "Country",
    "name": "Ecuador",
  },
  "availableChannel": {
    "@type": "ServiceChannel",
    "serviceUrl": "https://undercodeec.com/ec",
    "availableLanguage": "es",
  },
  "serviceType": [
    "Diseño y desarrollo de páginas web en Quito",
    "Desarrollo de aplicaciones móviles Android e iOS",
    "Posicionamiento web (SEO) en Ecuador",
    "Campañas de Google Ads y Meta Ads",
    "Software empresarial a medida (CRM, ERP)",
    "Facturación electrónica SRI Ecuador",
    "Tiendas online y e-commerce",
    "Automatización de procesos",
  ],
  "offers": {
    "@type": "AggregateOffer",
    "priceCurrency": "USD",
    "lowPrice": "250",
    "highPrice": "30000",
    "offerCount": "8",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "¿Cuánto cuesta una página web profesional en Quito o Ecuador?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text":
          "El precio de una página web profesional en Ecuador parte desde $250 USD para una landing page corporativa, hasta $5.000 USD o más para tiendas online avanzadas o sistemas a medida. Trabajamos con presupuestos cerrados en dólares, sin costos ocultos.",
      },
    },
    {
      "@type": "Question",
      "name": "¿Atienden proyectos fuera de Quito?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text":
          "Sí. Trabajamos de forma remota con empresas y pymes de Quito, Guayaquil, Cuenca, Ambato, Sangolquí y todo el Ecuador. La gestión es 100 % online con videollamadas y entregas semanales.",
      },
    },
    {
      "@type": "Question",
      "name": "¿Su facturación electrónica cumple con el SRI?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text":
          "Sí. Nuestros sistemas de facturación electrónica están preparados para cumplir con los requisitos del SRI Ecuador, generación de comprobantes XML, firma electrónica y autorización en línea.",
      },
    },
    {
      "@type": "Question",
      "name": "¿Cuánto tarda el posicionamiento SEO en Google Ecuador?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text":
          "Los primeros resultados sólidos de SEO en Ecuador suelen verse entre los 3 y 6 meses, dependiendo del sector y la competencia local en Quito o Guayaquil. Entregamos informes mensuales con métricas claras de retorno.",
      },
    },
  ],
};

const services = [
  {
    icon: "bi bi-laptop",
    title: "Diseño de Páginas Web en Quito",
    text: "Diseñamos y desarrollamos páginas web profesionales, corporativas y tiendas online a medida en Quito y todo el Ecuador. Webs optimizadas para móvil, ordenador y tablet, con velocidad de carga y SEO desde el primer pixel.",
  },
  {
    icon: "bi bi-phone",
    title: "Desarrollo de Apps Móviles Android e iOS",
    text: "Desarrollo de aplicaciones móviles nativas y multiplataforma (Flutter, React Native) para Android e iOS. Publicamos tu app en Play Store y App Store para empresas en Ecuador.",
  },
  {
    icon: "bi bi-graph-up-arrow",
    title: "Posicionamiento SEO en Ecuador",
    text: "Posicionamiento web local y nacional en Google Ecuador. Auditoría SEO técnica, contenidos, link building y SEO local para que aparezcas cuando tus clientes buscan en Quito, Guayaquil y todo el país.",
  },
  {
    icon: "bi bi-megaphone",
    title: "Google Ads y Meta Ads",
    text: "Campañas SEM rentables en Google Ads y Meta Ads (Facebook e Instagram) orientadas al mercado ecuatoriano. Seguimiento de conversiones y ROI medible cada mes.",
  },
  {
    icon: "bi bi-gear-wide-connected",
    title: "Software Empresarial a Medida",
    text: "CRM, ERP, sistemas de inventarios, automatización de procesos y software a medida para tu pyme en Ecuador. Soluciones que se adaptan a tu forma de trabajar.",
  },
  {
    icon: "bi bi-receipt",
    title: "Facturación Electrónica SRI",
    text: "Sistemas de facturación electrónica preparados para el SRI Ecuador: comprobantes XML, firma electrónica y autorización en línea. Cumple con la normativa tributaria ecuatoriana sin complicaciones.",
  },
];

const pricingPlans = [
  {
    name: "Landing Page",
    price: "250",
    description: "Para emprendedores y pequeños negocios en Quito y Ecuador que necesitan estar en Google ya.",
    features: [
      "Dominio.com y Hosting por 1 año",
      "Diseño único optimizado",
      "Diseño 100% adaptable (Mobile-first)",
      "Formulario de contacto",
      "Botones flotantes de WhatsApp y Llamadas",
      "SEO orgánico integrado",
      "Soporte durante 1 mes y garantía de 1 año.",
    ],
  },
  {
    name: "Web Site Lanzamiento",
    price: "360",
    description: "Para mostrar servicios variados y gran cantidad de información en un portal web completo.",
    features: [
      "Diseño optimizado y adaptado a la identidad de la marca",
      "Estructura de 5 a 10 páginas (Inicio, Servicios, Nosotros, etc.)",
      "Diseño 100% Mobile-first (obligatorio en 2026)",
      "Configuración SEO orgánico integrado",
      "Formularios de contacto e integración con WhatsApp",
      "Dominio.com y Hosting por 1 año",
      "Soporte durante 1 mes y garantía de 1 año.",
    ],
    featured: true,
  },
  {
    name: "Tienda Online",
    price: "Desde 550",
    description: "Tienda autogestionable perfecta para vender 24/7 en Ecuador sin procesos manuales.",
    features: [
      "4 conceptos de diseño",
      "Tienda administrable para subir productos",
      "Carga inicial de 50 a 100 productos con opción a más",
      "Integración de pasarelas de pago (PayPal, Stripe, PayPhone, etc.)",
      "Dominio.com y Hosting por 1 año",
      "Compra de productos por WhatsApp, Telegram y redes sociales",
      "Métodos de envíos avanzados y SEO orgánico integrado",
      "Soporte durante 1 mes y garantía de 1 año.",
    ],
  },
];

const faqs = [
  {
    q: "¿Cuánto cuesta una página web profesional en Quito o Ecuador?",
    a: "El precio de una página web profesional en Ecuador parte desde $250 USD para una landing page corporativa, hasta $5.000 USD o más para tiendas online avanzadas o sistemas a medida. Trabajamos con presupuestos cerrados en dólares, sin costos ocultos.",
  },
  {
    q: "¿Atienden proyectos fuera de Quito?",
    a: "Sí. Trabajamos de forma remota con empresas y pymes de Quito, Guayaquil, Cuenca, Ambato, Sangolquí y todo el Ecuador. La gestión es 100 % online con videollamadas y entregas semanales.",
  },
  {
    q: "¿Su facturación electrónica cumple con el SRI?",
    a: "Sí. Nuestros sistemas de facturación electrónica están preparados para cumplir con los requisitos del SRI Ecuador: comprobantes XML, firma electrónica y autorización en línea.",
  },
  {
    q: "¿Cuánto tarda el posicionamiento SEO en Google Ecuador?",
    a: "Los primeros resultados sólidos de SEO en Ecuador suelen verse entre los 3 y 6 meses, dependiendo del sector y la competencia local en Quito o Guayaquil. Entregamos informes mensuales con métricas claras de retorno.",
  },
  {
    q: "¿Puedo pedir un presupuesto sin compromiso?",
    a: "Por supuesto. Cuéntanos tu proyecto y en 24-48 h te enviamos un presupuesto detallado en dólares, sin compromiso y sin letra pequeña. Si te encaja, seguimos. Si no, sin problema.",
  },
];

const LandingEcuador = () => {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <>
      {/* JSON-LD: Organization, LocalBusiness/ProfessionalService, Service, FAQPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <main className="landing-ecuador">
        {/* HERO */}
        <section
          className="tw-relative tw-overflow-hidden"
          style={{ paddingTop: "20px", paddingBottom: "100px" }}
        >
          <div className="tw-absolute tw-inset-0 gradient-bg tw-z-0 tw-pointer-events-none" />

          <div className="tw-absolute tw-inset-0 tw-flex tw-items-center tw-justify-center tw-pointer-events-none tw-z-[1]">
            <img
              src={heroBackgroundPattern}
              alt="Background Pattern"
              className="rotating-pattern tw-w-full tw-h-full tw-object-cover tw-opacity-30 tw-pointer-events-none"
            />
          </div>

          <div className="gradient-blob-1 tw-pointer-events-none" />
          <div className="gradient-blob-2 tw-pointer-events-none" />
          <div className="gradient-blob-3 tw-pointer-events-none" />

          <div className="container tw-relative" style={{ zIndex: 30 }}>
            <div className="row align-items-center">
              <div className="col-lg-7">
                <span
                  className="badge mb-3 px-3 py-2"
                  style={{
                    background: "rgba(96, 11, 86, 0.1)",
                    color: "#600b56",
                    fontSize: "14px",
                    fontWeight: 600,
                  }}
                >
                  Agencia digital · Cobertura nacional en Ecuador
                </span>
                <h1
                  className="gradient-title mb-4"
                  style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 700, lineHeight: 1.1 }}
                >
                  Diseño de Páginas Web en Quito y Ecuador
                </h1>
                <p className="mb-4" style={{ fontSize: "18px", color: "#333", maxWidth: "600px", lineHeight: 1.7 }}>
                  Expertos en diseño y desarrollo de páginas web profesionales, aplicaciones móviles y SEO en Quito, Guayaquil y todo el Ecuador. Impulsamos tu negocio digital con presupuestos cerrados en dólares y resultados medibles.
                </p>
                <div className="d-flex flex-wrap gap-3 mt-4">
                  <a
                    href="#presupuesto"
                    className="btn btn-lg fw-bold px-4 py-3"
                    style={{
                      borderRadius: "50px",
                      backgroundColor: "rgb(96, 11, 86)",
                      color: "#fff",
                      border: "none",
                    }}
                  >
                    Pide tu presupuesto gratis
                  </a>
                  <a
                    href="#servicios"
                    className="btn btn-lg fw-bold px-4 py-3"
                    style={{
                      borderRadius: "50px",
                      backgroundColor: "rgb(96, 11, 86)",
                      color: "#fff",
                      border: "none",
                    }}
                  >
                    Ver servicios
                  </a>
                </div>
                <div className="mt-4 d-flex flex-wrap gap-4" style={{ fontSize: "14px", color: "#555" }}>
                  <span><i className="bi bi-check-circle me-2" style={{ color: "#600b56" }}></i>Presupuesto en 24 h</span>
                  <span><i className="bi bi-check-circle me-2" style={{ color: "#600b56" }}></i>Sin permanencia</span>
                  <span><i className="bi bi-check-circle me-2" style={{ color: "#600b56" }}></i>Facturación electrónica SRI</span>
                </div>
              </div>
              <div className="col-lg-5 d-none d-lg-block text-center">
                <img
                  src="/assets/img/header/Animation3DSoftware.webp"
                  alt="Agencia de diseño web y desarrollo de aplicaciones móviles en Quito y Ecuador"
                  style={{ maxWidth: "100%", height: "auto", filter: "drop-shadow(0 20px 40px rgba(96, 11, 86, 0.25))" }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* TRUST BAR */}
        <section className="py-4 border-bottom" style={{ background: "#f8f9fa" }}>
          <div className="container">
            <div className="row text-center g-3">
              <div className="col-6 col-md-3">
                <div className="fw-bold" style={{ fontSize: "28px", color: "#600b56" }}>+100</div>
                <div className="text-muted small">Proyectos entregados</div>
              </div>
              <div className="col-6 col-md-3">
                <div className="fw-bold" style={{ fontSize: "28px", color: "#600b56" }}>24 h</div>
                <div className="text-muted small">Tiempo medio de presupuesto</div>
              </div>
              <div className="col-6 col-md-3">
                <div className="fw-bold" style={{ fontSize: "28px", color: "#600b56" }}>SRI</div>
                <div className="text-muted small">Facturación electrónica</div>
              </div>
              <div className="col-6 col-md-3">
                <div className="fw-bold" style={{ fontSize: "28px", color: "#600b56" }}>10+ años</div>
                <div className="text-muted small">Experiencia</div>
              </div>
            </div>
          </div>
        </section>

        {/* SERVICES */}
        <section id="servicios" className="py-5" style={{ paddingTop: "80px", paddingBottom: "80px" }}>
          <div className="container">
            <div className="text-center mb-5">
              <span className="text-uppercase fw-bold" style={{ color: "#ba27f4", letterSpacing: "2px", fontSize: "13px" }}>
                Qué hacemos
              </span>
              <h2 className="mt-2 mb-3" style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 700 }}>
                Servicios digitales para empresas en Quito y Ecuador
              </h2>
              <p className="text-muted mx-auto" style={{ maxWidth: "700px", fontSize: "17px" }}>
                Todo lo que tu empresa necesita para crecer online, con un único equipo y sin intermediarios. Hablamos claro y trabajamos con plazos reales.
              </p>
            </div>
            <div className="row g-4">
              {services.map((s, i) => (
                <div className="col-md-6 col-lg-4" key={i}>
                  <div
                    className="h-100 p-4 rounded-3"
                    style={{
                      background: "#fff",
                      border: "1px solid #eee",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
                      transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    }}
                  >
                    <div
                      className="mb-3 d-inline-flex align-items-center justify-content-center rounded-3"
                      style={{
                        width: "56px",
                        height: "56px",
                        background: "linear-gradient(135deg, #ba27f4, #600b56)",
                        color: "#fff",
                        fontSize: "26px",
                      }}
                    >
                      <i className={s.icon}></i>
                    </div>
                    <h3 className="mb-3" style={{ fontSize: "20px", fontWeight: 700 }}>
                      {s.title}
                    </h3>
                    <p className="text-muted mb-0" style={{ fontSize: "15px", lineHeight: 1.7 }}>
                      {s.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* WHY US */}
        <section className="py-5" style={{ background: "#f8f9fa", paddingTop: "80px", paddingBottom: "80px" }}>
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg-6 mb-4 mb-lg-0">
                <span className="text-uppercase fw-bold" style={{ color: "#ba27f4", letterSpacing: "2px", fontSize: "13px" }}>
                  Por qué UNDER CODEEC
                </span>
                <h2 className="mt-2 mb-4" style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 700 }}>
                  Un equipo técnico ecuatoriano, no una agencia de comerciales.
                </h2>
                <p className="text-muted mb-4" style={{ fontSize: "17px", lineHeight: 1.7 }}>
                  Cansado de agencias que prometen mucho y entregan tarde, mal o caro. En UNDER CODEEC hablamos como queremos que nos hablen a nosotros: claro, directo y con números reales sobre la mesa.
                </p>
                <ul className="list-unstyled">
                  {[
                    "Presupuesto cerrado en dólares (USD), sin sorpresas",
                    "Te asignamos un contacto técnico real, no un vendedor",
                    "Código fuente 100 % tuyo cuando termina el proyecto",
                    "Facturación electrónica SRI y normativa ecuatoriana",
                    "Soporte y mantenimiento sin permanencia",
                  ].map((p, i) => (
                    <li key={i} className="mb-2" style={{ fontSize: "16px" }}>
                      <i className="bi bi-check-circle-fill me-2" style={{ color: "#ba27f4" }}></i>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="col-lg-6 text-center">
                <img
                  src="/assets/img/about/3d_vector2.svg"
                  alt="Equipo técnico de desarrollo web, apps móviles y SEO en Quito Ecuador"
                  style={{ maxWidth: "100%", height: "auto" }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section id="presupuesto" className="py-5" style={{ paddingTop: "80px", paddingBottom: "80px" }}>
          <div className="container">
            <div className="text-center mb-5">
              <span className="text-uppercase fw-bold" style={{ color: "#ba27f4", letterSpacing: "2px", fontSize: "13px" }}>
                Tarifas en dólares (USD)
              </span>
              <h2 className="mt-2 mb-3" style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 700 }}>
                Planes de Precios para Páginas Web en Ecuador
              </h2>
              <p className="text-muted mx-auto" style={{ maxWidth: "650px", fontSize: "17px" }}>
                Estos son nuestros puntos de partida. Cada proyecto se ajusta a tus necesidades reales con un presupuesto cerrado.
              </p>
            </div>
            <div className="row g-4 justify-content-center">
              {pricingPlans.map((plan, i) => (
                <div className="col-md-6 col-lg-4" key={i}>
                  <div
                    className="h-100 p-4 rounded-3 text-center position-relative"
                    style={{
                      background: plan.featured ? "linear-gradient(135deg, #150e23, #600B56)" : "#fff",
                      color: plan.featured ? "#fff" : "inherit",
                      border: plan.featured ? "none" : "1px solid #eee",
                      boxShadow: plan.featured
                        ? "0 20px 40px rgba(186, 39, 244, 0.3)"
                        : "0 4px 20px rgba(0,0,0,0.04)",
                      transform: plan.featured ? "scale(1.03)" : "none",
                    }}
                  >
                    {plan.featured && (
                      <span
                        className="position-absolute top-0 start-50 translate-middle badge px-3 py-2"
                        style={{ background: "#fff", color: "#600b56", fontSize: "12px" }}
                      >
                        MÁS POPULAR
                      </span>
                    )}
                    <h3 className="mb-2" style={{ fontSize: "22px", fontWeight: 700 }}>
                      {plan.name}
                    </h3>
                    <div className="my-3">
                      <span style={{ fontSize: "14px", verticalAlign: "top" }}>desde</span>{" "}
                      <span style={{ fontSize: "24px" }}>$</span>
                      <span style={{ fontSize: "44px", fontWeight: 700 }}>{plan.price}</span>
                      <span style={{ fontSize: "16px" }}> USD</span>
                    </div>
                    <p className={plan.featured ? "mb-4" : "text-muted mb-4"} style={{ fontSize: "14px" }}>
                      {plan.description}
                    </p>
                    <ul className="list-unstyled text-start mb-4">
                      {plan.features.map((f, j) => (
                        <li key={j} className="mb-2" style={{ fontSize: "14px" }}>
                          <i
                            className="bi bi-check-lg me-2"
                            style={{ color: plan.featured ? "#fff" : "#ba27f4" }}
                          ></i>
                          {f}
                        </li>
                      ))}
                    </ul>
                    <a
                      href="#contacto"
                      className={`btn ${plan.featured ? "btn-light" : "btn-outline-primary"} fw-bold w-100 py-2`}
                      style={{
                        borderRadius: "50px",
                        color: plan.featured ? "#600b56" : "#ba27f4",
                        borderColor: "#ba27f4",
                      }}
                    >
                      Solicitar presupuesto
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-5" style={{ background: "#f8f9fa", paddingTop: "80px", paddingBottom: "80px" }}>
          <div className="container">
            <div className="text-center mb-5">
              <span className="text-uppercase fw-bold" style={{ color: "#ba27f4", letterSpacing: "2px", fontSize: "13px" }}>
                Resolvemos dudas
              </span>
              <h2 className="mt-2 mb-3" style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 700 }}>
                Preguntas Frecuentes sobre Sitios Web
              </h2>
            </div>
            <div className="row justify-content-center">
              <div className="col-lg-9">
                {faqs.map((item, i) => (
                  <div
                    key={i}
                    className="mb-3 rounded-3"
                    style={{ background: "#fff", border: "1px solid #eee", overflow: "hidden" }}
                  >
                    <button
                      type="button"
                      className="w-100 text-start p-4 d-flex justify-content-between align-items-center"
                      style={{
                        background: "none",
                        border: "none",
                        fontWeight: 600,
                        fontSize: "17px",
                        color: openFaq === i ? "#ba27f4" : "inherit",
                      }}
                      onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                    >
                      <span>{item.q}</span>
                      <i className={`bi ${openFaq === i ? "bi-dash-circle" : "bi-plus-circle"}`} style={{ fontSize: "22px" }}></i>
                    </button>
                    {openFaq === i && (
                      <div className="px-4 pb-4 text-muted" style={{ fontSize: "15px", lineHeight: 1.7 }}>
                        {item.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section
          id="contacto"
          className="py-5 text-center text-white"
          style={{
            background: "linear-gradient(135deg, #150e23, #600B56)",
            paddingTop: "100px",
            paddingBottom: "100px",
          }}
        >
          <div className="container">
            <h2 className="mb-3" style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 700 }}>
              Únase a Undercodeec
            </h2>
            <p className="mb-4 mx-auto" style={{ fontSize: "18px", opacity: 0.95, maxWidth: "650px" }}>
              Cuéntanos qué necesitas y en 24-48 h tienes un presupuesto cerrado en dólares, sin compromiso. Atendemos Quito, Sangolquí - Valle de los Chillos, Guayaquil, Cuenca y todo el Ecuador.
            </p>
            <div className="d-flex flex-wrap gap-3 justify-content-center">
              <a
                href="mailto:ventas@undercodeec.com"
                className="btn btn-light btn-lg fw-bold px-4 py-3"
                style={{ borderRadius: "50px", color: "#600b56" }}
              >
                <i className="bi bi-envelope-fill me-2"></i>
                ventas@undercodeec.com
              </a>
              <a
                href="tel:+593979046329"
                className="btn btn-outline-light btn-lg px-4 py-3"
                style={{ borderRadius: "50px" }}
              >
                <i className="bi bi-telephone-fill me-2"></i>
                +593 979 046 329
              </a>
              <Link
                href="/contacto"
                className="btn btn-outline-light btn-lg px-4 py-3"
                style={{ borderRadius: "50px" }}
              >
                Formulario de contacto
              </Link>
            </div>
            <p className="mt-4 small" style={{ opacity: 0.8 }}>
              Quito · Sangolquí - Valle de los Chillos · Cobertura nacional en Ecuador · Respuesta en 24 h
            </p>
          </div>
        </section>
      </main>
    </>
  );
};

export default LandingEcuador;
