"use client";

import React, { useState } from "react";
import Link from "next/link";
import "@/components/Slider/slider.css";

const heroBackgroundPattern = "/assets/slider/6fa818bb935c0e2a1081f259d84df226b237a184.png";

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Undercodeec",
  "url": "https://undercodeec.com/es",
  "logo": "https://undercodeec.com/assets/img/undercode-logo.png",
  "description":
    "Agencia digital especializada en diseño web, desarrollo de aplicaciones móviles, posicionamiento SEO y software empresarial a medida para empresas en España.",
  "areaServed": {
    "@type": "Country",
    "name": "España",
  },
  "sameAs": [
    "https://www.facebook.com/undercodeec",
    "https://www.instagram.com/undercodeec/",
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "sales",
    "email": "gerencia@undercodeec.com",
    "availableLanguage": ["es"],
    "areaServed": "ES",
  },
};

const serviceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Desarrollo Web, Apps Móviles y Posicionamiento SEO en España",
  "description":
    "Servicios profesionales de diseño y desarrollo web a medida, aplicaciones móviles para Android e iOS, posicionamiento en Google (SEO), Google Ads y software empresarial (CRM, facturación electrónica, e-commerce) para pymes y empresas en España.",
  "provider": {
    "@type": "Organization",
    "name": "Undercodeec",
    "url": "https://undercodeec.com/es",
    "logo": "https://undercodeec.com/assets/img/undercode-logo.png",
  },
  "areaServed": {
    "@type": "Country",
    "name": "España",
  },
  "availableChannel": {
    "@type": "ServiceChannel",
    "serviceUrl": "https://undercodeec.com/es",
    "availableLanguage": "es",
  },
  "serviceType": [
    "Diseño y desarrollo de páginas web",
    "Desarrollo de aplicaciones móviles Android e iOS",
    "Posicionamiento web (SEO)",
    "Campañas de Google Ads y Meta Ads",
    "Software empresarial a medida (CRM, ERP)",
    "Facturación electrónica y cumplimiento Verifactu",
    "Tiendas online y e-commerce",
    "Automatización de procesos",
  ],
  "offers": {
    "@type": "AggregateOffer",
    "priceCurrency": "EUR",
    "lowPrice": "600",
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
      "name": "¿Cuánto cuesta una página web profesional en España?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text":
          "El presupuesto de una página web profesional en España suele ir desde 250€ para una web corporativa autogestionable, hasta 8.000€ o más para tiendas online avanzadas o portales con funcionalidades personalizadas. Trabajamos siempre con presupuestos cerrados, sin letra pequeña.",
      },
    },
    {
      "@type": "Question",
      "name": "¿Trabajáis con empresas de toda España?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text":
          "Sí. Trabajamos en remoto con empresas y pymes de toda España — Madrid, Barcelona, Valencia, Sevilla, Bilbao, Málaga, Zaragoza y resto del territorio. La gestión del proyecto es 100 % online con videollamadas y entregas semanales.",
      },
    },
    {
      "@type": "Question",
      "name": "¿La facturación electrónica que desarrolláis cumple con la normativa española?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text":
          "Sí. Nuestro software de facturación electrónica está preparado para cumplir con los requisitos de la AEAT, la Ley Crea y Crece y el sistema Verifactu, garantizando que tu negocio cumpla con la normativa fiscal vigente en España.",
      },
    },
    {
      "@type": "Question",
      "name": "¿Cuánto tarda el posicionamiento web (SEO) en dar resultados?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text":
          "El SEO en España es competitivo. Los primeros resultados sólidos suelen verse entre los 3 y 6 meses, dependiendo del sector y la competencia local. Trabajamos con informes mensuales transparentes y métricas claras de retorno.",
      },
    },
  ],
};

const services = [
  {
    icon: "bi bi-laptop",
    title: "Diseño Web Profesional",
    text: "Diseñamos y desarrollamos webs corporativas, tiendas online y portales a medida, optimizados para móvil, ordenador y tablet. Velocidad de carga, conversión y posicionamiento, desde el primer pixel.",
  },
  {
    icon: "bi bi-phone",
    title: "Apps Móviles Android e iOS",
    text: "Desarrollamos aplicaciones móviles nativas y multiplataforma (Flutter, React Native) para Android e iOS. Publicamos tu app en Play Store y App Store con todas las garantías.",
  },
  {
    icon: "bi bi-graph-up-arrow",
    title: "Posicionamiento Web (SEO)",
    text: "Posicionamiento web local y nacional en Google. Auditoría SEO técnica, contenidos, link building y SEO local para que tu negocio aparezca cuando tus clientes buscan en España.",
  },
  {
    icon: "bi bi-megaphone",
    title: "Google Ads y Meta Ads",
    text: "Campañas SEM rentables en Google Ads y Meta Ads (Facebook e Instagram). Sin gastar de más, con seguimiento de conversiones y ROI medible cada mes.",
  },
  {
    icon: "bi bi-gear-wide-connected",
    title: "Software Empresarial a Medida",
    text: "CRM, ERP, sistemas de inventarios, automatización de procesos y software a medida para tu pyme. Soluciones que se adaptan a tu forma de trabajar, no al revés.",
  },
  {
    icon: "bi bi-receipt",
    title: "Facturación Electrónica · Verifactu",
    text: "Software de facturación electrónica preparado para la AEAT, Ley Crea y Crece y Verifactu. Cumple con la normativa fiscal española y olvídate de problemas con Hacienda.",
  },
];

const pricingPlans = [
  {
    name: "Landing Page",
    price: "250",
    description: "Para autónomos y pequeños negocios que necesitan estar en Google ya.",
    features: [
      "Dominio.com y Hosting por 1 año",
      "Diseño unico optimizado",
      "Diseño 100% adaptable (Mobile-first)",
      "Formulario de contacto",
      "Botones flotantes de WhatsApp y Llamadas",
      "SEO orgánico integrado",
      "Soporte durante 1 mes y garantía de 1 año."
    ],
  },
  {
    name: "Web Site Lanzamiento",
    price: "360",
    description: "Para mostrar servicios variados , gran cantidad de informacion todo desde un portal web completo. ",
    features: [
      "Diseño basado, optimizadas y adaptadas a la identidad de la marca",
      "Estructura de 5 a 10 páginas (Inicio, Servicios, Nosotros, etc.)",
      "Diseño 100% Mobile-first (obligatorio en 2026)",
      "Configuración SEO orgánico integrado",
      "Formularios de contacto e integración con WhatsApp",
      "Dominio.com y Hosting por 1 año",
      "Soporte durante 1 mes y garantía de 1 año."
    ],
    featured: true,
  },
  {
    name: "Tienda Onlinea",
    price: "Desde 550",
    description: "Tienda autogestionable perfecta para vender 24/7 sin preocuparse de procesos manuales.",
    features: [
      "4 conceptos de diseño",
      "Tienda administrable para subir productos",
      "Carga inicial de 50 a 100 productos con opcion a mas",
      "Integración de pasarelas de pago (Stripe, Paypal, etc.)",
      "Dominio.com y Hosting por 1 año",
      "Compra de productos por WhatsApp, Telegram y redes sociales",
      "Métodos de envíos avanzados y SEO orgánico integrado",
      "Soporte durante 1 mes y garantía de 1 año."
    ],
  },
];

const faqs = [
  {
    q: "¿Cuánto cuesta una página web profesional en España?",
    a: "El presupuesto de una página web profesional en España suele ir desde 250€ para una web corporativa autogestionable, hasta 8.000€ o más para tiendas online avanzadas o portales con funcionalidades personalizadas. Trabajamos siempre con presupuestos cerrados, sin letra pequeña.",
  },
  {
    q: "¿Trabajáis con empresas de toda España?",
    a: "Sí. Trabajamos en remoto con empresas y pymes de toda España — Madrid, Barcelona, Valencia, Sevilla, Bilbao, Málaga, Zaragoza y resto del territorio. La gestión del proyecto es 100 % online con videollamadas y entregas semanales.",
  },
  {
    q: "¿La facturación electrónica que desarrolláis cumple con la normativa española?",
    a: "Sí. Nuestro software de facturación electrónica está preparado para cumplir con los requisitos de la AEAT, la Ley Crea y Crece y el sistema Verifactu, garantizando que tu negocio cumpla con la normativa fiscal vigente en España.",
  },
  {
    q: "¿Cuánto tarda el posicionamiento web (SEO) en dar resultados?",
    a: "El SEO en España es competitivo. Los primeros resultados sólidos suelen verse entre los 3 y 6 meses, dependiendo del sector y la competencia local. Trabajamos con informes mensuales transparentes y métricas claras de retorno.",
  },
  {
    q: "¿Podemos pedir un presupuesto sin compromiso?",
    a: "Por supuesto. Cuéntanos tu proyecto y en 24-48 h te enviamos un presupuesto detallado en euros, sin compromiso y sin letra pequeña. Si te encaja, seguimos. Si no, sin problema.",
  },
];

const LandingEspana = () => {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <>
      {/* JSON-LD: Organization, Service, FAQPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <main className="landing-espana">
        {/* HERO — mismo background animado que la home (gradient-bg + rotating pattern + blobs) */}
        <section
          className="tw-relative tw-overflow-hidden"
          style={{ paddingTop: "20px", paddingBottom: "100px" }}
        >
          {/* Animated Gradient Background */}
          <div className="tw-absolute tw-inset-0 gradient-bg tw-z-0 tw-pointer-events-none" />

          {/* Rotating Background Pattern */}
          <div className="tw-absolute tw-inset-0 tw-flex tw-items-center tw-justify-center tw-pointer-events-none tw-z-[1]">
            <img
              src={heroBackgroundPattern}
              alt="Background Pattern"
              className="rotating-pattern tw-w-full tw-h-full tw-object-cover tw-opacity-30 tw-pointer-events-none"
            />
          </div>

          {/* Additional gradient blobs */}
          <div className="gradient-blob-1 tw-pointer-events-none" />
          <div className="gradient-blob-2 tw-pointer-events-none" />
          <div className="gradient-blob-3 tw-pointer-events-none" />

          <div className="container tw-relative" style={{ zIndex: 30 }}>
            <div className="row align-items-center">
              <div className="col-lg-7 animate-fadeRight">
                <span
                  className="badge mb-3 px-3 py-2"
                  style={{
                    background: "rgba(96, 11, 86, 0.1)",
                    color: "#600b56",
                    fontSize: "14px",
                    fontWeight: 600,
                  }}
                >
                  Agencia digital · Cobertura nacional en España
                </span>
                <h1
                  className="gradient-title mb-4"
                  style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 700, lineHeight: 1.1 }}
                >
                  Hacemos webs, apps móviles y SEO que venden en España.
                </h1>
                <p className="mb-4" style={{ fontSize: "18px", color: "#333", maxWidth: "600px", lineHeight: 1.7 }}>
                  Sin postureo, sin letra pequeña y con presupuestos cerrados en euros. Diseñamos páginas web, desarrollamos aplicaciones móviles para Android e iOS y posicionamos tu negocio en Google para que te encuentren tus clientes en Madrid, Barcelona, Valencia y toda España.
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
                  <span><i className="bi bi-check-circle me-2" style={{ color: "#600b56" }}></i>Cumplimiento RGPD y AEAT</span>
                </div>
              </div>
              <div className="col-lg-5 d-none d-lg-block text-center animate-fadeLeft" style={{ transitionDelay: '150ms' }}>
                <img
                  src="/assets/img/header/Animation3DSoftware.webp"
                  alt="Agencia digital de desarrollo web y aplicaciones móviles para empresas en España"
                  style={{ maxWidth: "100%", height: "auto", filter: "drop-shadow(0 20px 40px rgba(96, 11, 86, 0.25))" }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* TRUST BAR */}
        <section className="py-4 border-bottom" style={{ background: "#f8f9fa" }}>
          <div className="container">
            <div className="row text-center g-3 animate-fadeUp">
              <div className="col-6 col-md-3">
                <div className="fw-bold" style={{ fontSize: "28px", color: "#600b56" }}>+100</div>
                <div className="text-muted small">Proyectos entregados</div>
              </div>
              <div className="col-6 col-md-3">
                <div className="fw-bold" style={{ fontSize: "28px", color: "#600b56" }}>24 h</div>
                <div className="text-muted small">Tiempo medio de presupuesto</div>
              </div>
              <div className="col-6 col-md-3">
                <div className="fw-bold" style={{ fontSize: "28px", color: "#600b56" }}>100 %</div>
                <div className="text-muted small">Cumplimiento RGPD</div>
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
            <div className="text-center mb-5 animate-fadeUp">
              <span className="text-uppercase fw-bold" style={{ background: "linear-gradient(135deg, #150e23, #600B56)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: "2px", fontSize: "13px" }}>
                Qué hacemos
              </span>
              <h2 className="mt-2 mb-3" style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 700 }}>
                Servicios digitales para empresas en España
              </h2>
              <p className="text-muted mx-auto" style={{ maxWidth: "700px", fontSize: "17px" }}>
                Todo lo que tu empresa necesita para crecer online, con un único equipo y sin intermediarios. Hablamos claro y trabajamos con plazos reales.
              </p>
            </div>
            <div className="row g-4">
              {services.map((s, i) => (
                <div className="col-md-6 col-lg-4 animate-scaleUp" key={i} style={{ transitionDelay: `${i * 80}ms` }}>
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
                        background: "linear-gradient(135deg, #150e23, #600B56)",
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
        <section className="py-5" style={{ background: "#ffffff", paddingTop: "80px", paddingBottom: "80px" }}>
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg-6 mb-4 mb-lg-0 animate-fadeRight">
                <span className="text-uppercase fw-bold" style={{ background: "linear-gradient(135deg, #150e23, #600B56)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: "2px", fontSize: "13px" }}>
                  Por qué Undercodeec
                </span>
                <h2 className="mt-2 mb-4" style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 700 }}>
                  Un equipo técnico, no una agencia de comerciales.
                </h2>
                <p className="text-muted mb-4" style={{ fontSize: "17px", lineHeight: 1.7 }}>
                  Cansado de agencias que prometen mucho y entregan tarde, mal o caro. En Undercodeec hablamos como queremos que nos hablen a nosotros: claro, directo y con números reales sobre la mesa.
                </p>
                <ul className="list-unstyled">
                  {[
                    "Presupuesto cerrado en euros, sin sustos a final de mes",
                    "Te asignamos un contacto técnico real, no un cuenta-historias",
                    "Código fuente 100 % tuyo cuando termina el proyecto",
                    "Cumplimiento RGPD, AEAT y normativa española de serie",
                    "Soporte y mantenimiento sin permanencia",
                  ].map((p, i) => (
                    <li key={i} className="mb-2" style={{ fontSize: "16px" }}>
                      <i className="bi bi-check-circle-fill me-2" style={{ background: "linear-gradient(135deg, #150e23, #600B56)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}></i>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="col-lg-6 text-center animate-fadeLeft" style={{ transitionDelay: '150ms' }}>
                <img
                  src="/assets/img/about/3d_vector2.svg"
                  alt="Equipo técnico de desarrollo web y SEO en España"
                  style={{ maxWidth: "100%", height: "auto" }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section id="presupuesto" className="py-5" style={{ paddingTop: "80px", paddingBottom: "80px" }}>
          <div className="container">
            <div className="text-center mb-5 animate-fadeUp">
              <span className="text-uppercase fw-bold" style={{ background: "linear-gradient(135deg, #150e23, #600B56)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: "2px", fontSize: "13px" }}>
                Tarifas en euros
              </span>
              <h2 className="mt-2 mb-3" style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 700 }}>
                Presupuestos transparentes, sin letra pequeña
              </h2>
              <p className="text-muted mx-auto" style={{ maxWidth: "650px", fontSize: "17px" }}>
                Estos son nuestros puntos de partida. Cada proyecto se ajusta a tus necesidades reales con un presupuesto cerrado.
              </p>
            </div>
            <div className="row g-4 justify-content-center">
              {pricingPlans.map((plan, i) => (
                <div className="col-md-6 col-lg-4 animate-scaleUp" key={i} style={{ transitionDelay: `${i * 100}ms` }}>
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
                    <h3 className={`mb-2 ${plan.featured ? "mt-3" : ""}`} style={{ fontSize: "22px", fontWeight: 700 }}>
                      {plan.name}
                    </h3>
                    <div className="my-3">
                      <span style={{ fontSize: "14px", verticalAlign: "top" }}>desde</span>{" "}
                      <span style={{ fontSize: "44px", fontWeight: 700 }}>{plan.price}</span>
                      <span style={{ fontSize: "24px" }}>€</span>
                    </div>
                    <p className={plan.featured ? "mb-4" : "text-muted mb-4"} style={{ fontSize: "14px" }}>
                      {plan.description}
                    </p>
                    <ul className="list-unstyled text-start mb-4">
                      {plan.features.map((f, j) => (
                        <li key={j} className="mb-2" style={{ fontSize: "14px" }}>
                          <i
                            className="bi bi-check-lg me-2"
                            style={plan.featured ? { color: "#fff" } : { background: "linear-gradient(135deg, #150e23, #600B56)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
                          ></i>
                          {f}
                        </li>
                      ))}
                    </ul>
                    <a
                      href={`https://wa.me/593979046329?text=${encodeURIComponent(`Hola, quisiera solicitar un presupuesto del plan *${plan.name}*.\n\nDescripción del plan: ${plan.description}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`btn ${plan.featured ? "btn-light" : "btn-outline-primary"} fw-bold w-100 py-2`}
                      style={{
                        borderRadius: "50px",
                        color: plan.featured ? "#fff" : "transparent",
                        background: plan.featured ? "none" : "linear-gradient(135deg, #150e23, #600B56)",
                        WebkitBackgroundClip: plan.featured ? "unset" : "text",
                        WebkitTextFillColor: plan.featured ? "unset" : "transparent",
                        borderColor: plan.featured ? "#fff" : "#600B56",
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
        <section className="py-5" style={{ background: "#ffffff", paddingTop: "80px", paddingBottom: "80px" }}>
          <div className="container">
            <div className="text-center mb-5 animate-fadeUp">
              <span className="text-uppercase fw-bold" style={{ background: "linear-gradient(135deg, #150e23, #600B56)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: "2px", fontSize: "13px" }}>
                Resolvemos dudas
              </span>
              <h2 className="mt-2 mb-3" style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 700 }}>
                Preguntas frecuentes
              </h2>
            </div>
            <div className="row justify-content-center">
              <div className="col-lg-9 animate-fadeUp" style={{ transitionDelay: '200ms' }}>
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
                        background: openFaq === i ? "linear-gradient(135deg, #150e23, #600B56)" : "none",
                        WebkitBackgroundClip: openFaq === i ? "text" : "unset",
                        WebkitTextFillColor: openFaq === i ? "transparent" : "inherit",
                        border: "none",
                        fontWeight: 600,
                        fontSize: "17px",
                        color: openFaq === i ? "transparent" : "inherit",
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
            background: "#150e23",
            paddingTop: "100px",
            paddingBottom: "100px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div className="lava-blob lava-blob-1" />
          <div className="lava-blob lava-blob-2" />
          <div className="lava-blob lava-blob-3" />
          <div className="lava-blob lava-blob-4" />
          <div className="lava-bubble" style={{ width: 20, height: 20, left: "8%",  animationDuration: "8s",   animationDelay: "0s"   }} />
          <div className="lava-bubble" style={{ width: 14, height: 14, left: "20%", animationDuration: "11s",  animationDelay: "1.5s" }} />
          <div className="lava-bubble" style={{ width: 26, height: 26, left: "33%", animationDuration: "9s",   animationDelay: "3s"   }} />
          <div className="lava-bubble" style={{ width: 10, height: 10, left: "48%", animationDuration: "12s",  animationDelay: "0.5s" }} />
          <div className="lava-bubble" style={{ width: 18, height: 18, left: "60%", animationDuration: "7s",   animationDelay: "4s"   }} />
          <div className="lava-bubble" style={{ width: 16, height: 16, left: "73%", animationDuration: "10s",  animationDelay: "2s"   }} />
          <div className="lava-bubble" style={{ width: 22, height: 22, left: "84%", animationDuration: "8.5s", animationDelay: "1s"   }} />
          <div className="lava-bubble" style={{ width: 12, height: 12, left: "91%", animationDuration: "13s",  animationDelay: "3.5s" }} />
          <div className="lava-bubble" style={{ width:  8, height:  8, left: "43%", animationDuration: "6s",   animationDelay: "5s"   }} />
          <div className="lava-bubble" style={{ width: 30, height: 30, left: "15%", animationDuration: "14s",  animationDelay: "2.5s" }} />
          <div className="container" style={{ position: "relative", zIndex: 2 }}>
            <h2 className="mb-3 animate-fadeUp" style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 700 }}>
              ¿Hablamos de tu proyecto?
            </h2>
            <p className="mb-4 mx-auto animate-fadeUp" style={{ fontSize: "18px", opacity: 0.95, maxWidth: "650px", transitionDelay: '100ms' }}>
              Cuéntanos qué necesitas y en 24-48 h tienes un presupuesto cerrado en euros, sin compromiso. Si encaja, empezamos. Si no, te damos consejo gratis igualmente.
            </p>
            <div className="d-flex flex-wrap gap-3 justify-content-center animate-scaleUp" style={{ transitionDelay: '250ms' }}>
              <a
                href="mailto:gerencia@undercodeec.com"
                className="btn btn-light btn-lg fw-bold px-4 py-3"
                style={{ borderRadius: "50px", color: "#600b56" }}
              >
                <i className="bi bi-envelope-fill me-2"></i>
                gerencia@undercodeec.com
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
              Atención remota · Cobertura nacional en España · Respuesta en 24 h
            </p>
          </div>
        </section>
      </main>
    </>
  );
};

export default LandingEspana;
