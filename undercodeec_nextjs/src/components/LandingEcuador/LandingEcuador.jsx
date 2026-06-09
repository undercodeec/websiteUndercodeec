"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { animate, stagger } from "animejs";
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
    "email": "gerencia@undercodeec.com",
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
  "email": "gerencia@undercodeec.com",
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
    title: "Diseño Web en Quito",
    text: "Diseñamos y desarrollamos páginas web profesionales, corporativas y tiendas online a medida en Quito y todo el Ecuador. Webs optimizadas para móvil, ordenador y tablet, con velocidad de carga y SEO desde el primer pixel.",
    features: [
      "Diseño 100 % personalizado a tu identidad de marca",
      "Mobile-first · Core Web Vitals optimizados",
      "SEO técnico integrado desde el primer pixel",
      "Entrega en 2–4 semanas con garantía de 1 año",
    ],
  },
  {
    icon: "bi bi-phone",
    title: "Apps Móviles Android & iOS",
    text: "Desarrollo de aplicaciones móviles nativas y multiplataforma (Flutter, React Native) para Android e iOS. Publicamos tu app en Play Store y App Store para empresas en Ecuador.",
    features: [
      "Flutter o React Native según tu proyecto",
      "Publicación en Play Store y App Store incluida",
      "Diseño UX/UI nativo y fluido",
      "Mantenimiento y actualizaciones continuas",
    ],
  },
  {
    icon: "bi bi-graph-up-arrow",
    title: "SEO en Ecuador",
    text: "Posicionamiento web local y nacional en Google Ecuador. Auditoría SEO técnica, contenidos, link building y SEO local para que aparezcas cuando tus clientes buscan en Quito, Guayaquil y todo el país.",
    features: [
      "Auditoría técnica + palabras clave locales",
      "Contenido optimizado para Ecuador",
      "Link building y autoridad de dominio",
      "Reportes mensuales con métricas reales",
    ],
  },
  {
    icon: "bi bi-megaphone",
    title: "Google Ads y Meta Ads",
    text: "Campañas SEM rentables en Google Ads y Meta Ads (Facebook e Instagram) orientadas al mercado ecuatoriano. Seguimiento de conversiones y ROI medible cada mes.",
    features: [
      "Campañas Search, Display y Shopping",
      "Segmentación precisa al mercado ecuatoriano",
      "Seguimiento de conversiones y ROAS",
      "Optimización semanal para maximizar ROI",
    ],
  },
  {
    icon: "bi bi-gear-wide-connected",
    title: "Software a Medida",
    text: "CRM, ERP, sistemas de inventarios, automatización de procesos y software a medida para tu pyme en Ecuador. Soluciones que se adaptan a tu forma de trabajar.",
    features: [
      "CRM, ERP e inventarios personalizados",
      "Automatización de procesos operativos",
      "Integración con tus sistemas actuales",
      "Escalable y con soporte técnico dedicado",
    ],
  },
  {
    icon: "bi bi-receipt",
    title: "Facturación Electrónica SRI",
    text: "Sistemas de facturación electrónica preparados para el SRI Ecuador: comprobantes XML, firma electrónica y autorización en línea. Cumple con la normativa tributaria ecuatoriana sin complicaciones.",
    features: [
      "Comprobantes XML autorizados por el SRI",
      "Firma electrónica y emisión en línea",
      "Integración con tu sistema contable",
      "Actualizaciones automáticas ante cambios normativos",
    ],
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
      "Soporte durante 1 mes y garantía de 1 año.",
    ],
  },
  {
    name: "Web Site Lanzamiento",
    price: "360",
    description: "Para mostrar servicios variados, gran cantidad de información todo desde un portal web completo.",
    features: [
      "Diseño basado, optimizadas y adaptadas a la identidad de la marca",
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
    price: "550",
    description: "Tienda autogestionable perfecta para vender 24/7 sin preocuparse de procesos manuales.",
    features: [
      "4 conceptos de diseño",
      "Tienda administrable para subir productos",
      "Carga inicial de 50 a 100 productos con opción a más",
      "Integración de pasarelas de pago (Stripe, Paypal, etc.)",
      "Dominio.com y Hosting por 1 año",
      "Compra de productos por WhatsApp, Telegram y redes sociales",
      "Métodos de envíos avanzados y SEO orgánico integrado",
      "Soporte durante 1 mes y garantía de 1 año.",
    ],
  },
];

const storePlans = [
  {
    name: "🛒 Tienda de Lanzamiento",
    price: "550",
    description: "Lanza tu primera tienda online. Todo lo necesario para vender de forma segura, rápida y sin complicaciones técnicas.",
    features: [
      "Catálogo autoadministrable: sube, edita o elimina productos tú mismo",
      "Carga inicial de 50 a 100 productos para que arranques facturando",
      "Pasarelas de pago seguras (tarjetas, PayPal, Payphone, Stripe) y compras por WhatsApp",
      "SEO orgánico inicial para que tus productos aparezcan en Google",
      "Configuración de métodos de envío según la zona del cliente",
      "Dominio .com y hosting optimizado para e-commerce por 1 año",
      "1 mes de soporte guiado + 1 año de respaldo técnico",
    ],
  },
  {
    name: "🚀 Tienda de Crecimiento",
    price: "850",
    description: "Escala tus ventas y automatiza procesos. Mejoramos la experiencia de compra y recuperamos clientes indecisos.",
    features: [
      "Todo lo de la Tienda de Lanzamiento",
      "Filtros avanzados y buscador inteligente por talla, color o categoría",
      "SEO técnico avanzado para posicionar tus productos sobre la competencia",
      "Recuperación de carritos abandonados con correos automáticos",
      "Sincronización de inventario: nunca vendas algo sin stock",
      "Envío gratis por compra mínima o cálculo automático de impuestos",
    ],
    featured: true,
  },
  {
    name: "💎 Tienda Élite",
    price: "3,490",
    description: "Infraestructura tecnológica de alto rendimiento para líderes del mercado. Velocidad extrema e integraciones corporativas.",
    features: [
      "Todo lo de la Tienda de Crecimiento",
      "Arquitectura Headless ultra rápida (carga en milisegundos, mejor ranking en Google)",
      "Conexión vía API con sistemas contables/inventario (SAP, Oracle o sistemas locales)",
      "Recomendador con IA: sugerencias de productos personalizadas por comportamiento",
      "Multi-idioma, multi-moneda o múltiples bodegas y almacenes",
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

const PlanCard = ({ plan, index }) => {
  const cardRef = useRef(null);
  const innerRef = useRef(null);
  const animatedRef = useRef(false);
  const rafRef = useRef(null);
  const targetRef = useRef({ rx: 0, ry: 0, tz: 0 });
  const currentRef = useRef({ rx: 0, ry: 0, tz: 0 });
  const velocityRef = useRef({ rx: 0, ry: 0, tz: 0 });
  const isHoveringRef = useRef(false);

  useEffect(() => {
    if (!cardRef.current) return;
    const node = cardRef.current;
    const innerNode = innerRef.current;

    const runAnimation = () => {
      if (animatedRef.current) return;
      animatedRef.current = true;
      animate(node, {
        opacity: [0, 1],
        translateY: [80, 0],
        rotateX: [-30, 0],
        scale: [0.92, 1],
        duration: 1100,
        delay: index * 140,
        ease: "outElastic(1, 0.6)",
      });
      if (innerNode && plan.featured) {
        animate(innerNode, {
          scale: [1, 1.03],
          duration: 900,
          delay: index * 140 + 600,
          ease: "outQuad",
        });
      }
    };

    const rect = node.getBoundingClientRect();
    const viewportH = window.innerHeight || document.documentElement.clientHeight;
    if (rect.top < viewportH * 0.9 && rect.bottom > 0) {
      runAnimation();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          runAnimation();
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [index, plan.featured]);

  // Cleanup del rAF al desmontar
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const tick = () => {
    const t = targetRef.current;
    const c = currentRef.current;
    const v = velocityRef.current;
    // Spring damper: rigidez baja + amortiguación alta = suave + ligero rebote al volver
    const stiffness = 0.085;
    const damping = 0.82;

    v.rx = v.rx * damping + (t.rx - c.rx) * stiffness;
    v.ry = v.ry * damping + (t.ry - c.ry) * stiffness;
    v.tz = v.tz * damping + (t.tz - c.tz) * stiffness;

    c.rx += v.rx;
    c.ry += v.ry;
    c.tz += v.tz;

    const node = innerRef.current;
    if (node) {
      node.style.transform = `rotateX(${c.rx.toFixed(3)}deg) rotateY(${c.ry.toFixed(3)}deg) translateZ(${c.tz.toFixed(2)}px)`;
    }

    const settled =
      !isHoveringRef.current &&
      Math.abs(t.rx - c.rx) < 0.02 &&
      Math.abs(v.rx) < 0.02 &&
      Math.abs(t.ry - c.ry) < 0.02 &&
      Math.abs(v.ry) < 0.02 &&
      Math.abs(t.tz - c.tz) < 0.1 &&
      Math.abs(v.tz) < 0.05;

    if (settled) {
      rafRef.current = null;
      if (node) node.style.transform = "";
      currentRef.current = { rx: 0, ry: 0, tz: 0 };
      velocityRef.current = { rx: 0, ry: 0, tz: 0 };
      return;
    }
    rafRef.current = requestAnimationFrame(tick);
  };

  const ensureLoop = () => {
    if (rafRef.current == null) {
      rafRef.current = requestAnimationFrame(tick);
    }
  };

  const handleMouseEnter = () => {
    isHoveringRef.current = true;
    ensureLoop();
  };

  const handleMouseMove = (e) => {
    const node = innerRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    // Ángulo máximo reducido (de 10° a 7°) para sensación más sutil
    targetRef.current.ry = ((x - cx) / cx) * 7;
    targetRef.current.rx = -((y - cy) / cy) * 7;
    targetRef.current.tz = 14;
    node.style.setProperty("--mx", `${(x / rect.width) * 100}%`);
    node.style.setProperty("--my", `${(y / rect.height) * 100}%`);
    ensureLoop();
  };

  const handleMouseLeave = () => {
    isHoveringRef.current = false;
    targetRef.current = { rx: 0, ry: 0, tz: 0 };
    ensureLoop();
  };

  return (
    <div
      ref={cardRef}
      className="col-md-6 col-lg-4"
      style={{
        opacity: 0,
        perspective: "1200px",
        transformStyle: "preserve-3d",
        willChange: "transform, opacity",
      }}
    >
      <div
        ref={innerRef}
        className="h-100 p-4 rounded-3 text-center position-relative plan-card-tilt"
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          background: plan.featured ? "linear-gradient(135deg, #150e23, #600B56)" : "#fff",
          color: plan.featured ? "#fff" : "inherit",
          border: plan.featured ? "none" : "1px solid #eee",
          boxShadow: plan.featured ? "0 20px 40px rgba(186, 39, 244, 0.3)" : "0 4px 20px rgba(0,0,0,0.04)",
          transformOrigin: "center center",
          transformStyle: "preserve-3d",
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
  );
};

const LandingEcuador = () => {
  const [openFaq, setOpenFaq] = useState(0);
  const [activePricingTab, setActivePricingTab] = useState("web");
  const [hoveredService, setHoveredService] = useState(null);
  const heroRef = useRef(null);
  const heroImgRef = useRef(null);
  const trustBarRef = useRef(null);
  const galaxyCanvasRef = useRef(null);
  const galaxyAnimRef = useRef(null);
  const galaxyMouseRef = useRef({ x: 0, y: 0 });

  // Entrada en stagger del hero
  useEffect(() => {
    if (typeof window === "undefined") return;
    const node = heroRef.current;
    if (!node) return;
    const items = node.querySelectorAll("[data-hero-anim]");
    if (!items.length) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      items.forEach((el) => {
        el.style.opacity = "1";
        el.style.transform = "none";
      });
      return;
    }

    animate(items, {
      opacity: [0, 1],
      translateY: [24, 0],
      duration: 700,
      delay: stagger(90, { start: 80 }),
      ease: "outExpo",
    });
  }, []);

  // Floating loop sutil en la imagen (solo desktop, no reduced)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    if (window.innerWidth < 992) return;
    const node = heroImgRef.current;
    if (!node) return;

    const anim = animate(node, {
      translateY: [0, -10],
      duration: 2400,
      ease: "inOutSine",
      loop: true,
      alternate: true,
      delay: 1400,
    });

    return () => {
      if (anim && typeof anim.pause === "function") anim.pause();
    };
  }, []);

  // Tilt 3D mouse-follow en los botones del hero (no reduced)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const root = heroRef.current;
    if (!root) return;
    const nodes = root.querySelectorAll("[data-hero-tilt]");
    if (!nodes.length) return;

    const cleanups = [];

    nodes.forEach((node) => {
      const target = { rx: 0, ry: 0, tz: 0 };
      const current = { rx: 0, ry: 0, tz: 0 };
      const velocity = { rx: 0, ry: 0, tz: 0 };
      let rafId = null;
      let hovering = false;

      const tick = () => {
        const stiffness = 0.11;
        const damping = 0.78;
        velocity.rx = velocity.rx * damping + (target.rx - current.rx) * stiffness;
        velocity.ry = velocity.ry * damping + (target.ry - current.ry) * stiffness;
        velocity.tz = velocity.tz * damping + (target.tz - current.tz) * stiffness;
        current.rx += velocity.rx;
        current.ry += velocity.ry;
        current.tz += velocity.tz;

        node.style.transform = `perspective(700px) rotateX(${current.rx.toFixed(3)}deg) rotateY(${current.ry.toFixed(3)}deg) translateZ(${current.tz.toFixed(2)}px)`;

        const settled =
          !hovering &&
          Math.abs(target.rx - current.rx) < 0.02 &&
          Math.abs(velocity.rx) < 0.02 &&
          Math.abs(target.ry - current.ry) < 0.02 &&
          Math.abs(velocity.ry) < 0.02 &&
          Math.abs(target.tz - current.tz) < 0.1 &&
          Math.abs(velocity.tz) < 0.05;

        if (settled) {
          rafId = null;
          node.style.transform = "";
          current.rx = 0; current.ry = 0; current.tz = 0;
          velocity.rx = 0; velocity.ry = 0; velocity.tz = 0;
          return;
        }
        rafId = requestAnimationFrame(tick);
      };

      const ensureLoop = () => {
        if (rafId == null) rafId = requestAnimationFrame(tick);
      };

      const onEnter = () => {
        hovering = true;
        ensureLoop();
      };
      const onMove = (e) => {
        const rect = node.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        target.ry = ((x - cx) / cx) * 14;
        target.rx = -((y - cy) / cy) * 14;
        target.tz = 12;
        node.style.setProperty("--mx", `${(x / rect.width) * 100}%`);
        node.style.setProperty("--my", `${(y / rect.height) * 100}%`);
        ensureLoop();
      };
      const onLeave = () => {
        hovering = false;
        target.rx = 0; target.ry = 0; target.tz = 0;
        ensureLoop();
      };

      node.addEventListener("mouseenter", onEnter);
      node.addEventListener("mousemove", onMove);
      node.addEventListener("mouseleave", onLeave);

      cleanups.push(() => {
        node.removeEventListener("mouseenter", onEnter);
        node.removeEventListener("mousemove", onMove);
        node.removeEventListener("mouseleave", onLeave);
        if (rafId != null) cancelAnimationFrame(rafId);
      });
    });

    return () => cleanups.forEach((fn) => fn());
  }, []);

  // Counters animados en la trust bar
  useEffect(() => {
    if (typeof window === "undefined") return;
    const node = trustBarRef.current;
    if (!node) return;
    const counters = node.querySelectorAll("[data-counter-value]");
    if (!counters.length) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const writeFinal = (el) => {
      const v = el.getAttribute("data-counter-value");
      const prefix = el.getAttribute("data-counter-prefix") || "";
      const suffix = el.getAttribute("data-counter-suffix") || "";
      el.textContent = `${prefix}${v}${suffix}`;
    };

    if (reduced) {
      counters.forEach(writeFinal);
      return;
    }

    counters.forEach((el) => {
      el.textContent = `${el.getAttribute("data-counter-prefix") || ""}0${el.getAttribute("data-counter-suffix") || ""}`;
    });

    const started = new Set();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          if (started.has(el)) return;
          started.add(el);
          observer.unobserve(el);
          const target = parseFloat(el.getAttribute("data-counter-value"));
          const prefix = el.getAttribute("data-counter-prefix") || "";
          const suffix = el.getAttribute("data-counter-suffix") || "";
          const state = { val: 0 };
          animate(state, {
            val: target,
            duration: 1400,
            ease: "outExpo",
            onUpdate: () => {
              el.textContent = `${prefix}${Math.round(state.val)}${suffix}`;
            },
            onComplete: () => writeFinal(el),
          });
        });
      },
      { threshold: 0.35 }
    );
    counters.forEach((c) => observer.observe(c));
    return () => observer.disconnect();
  }, []);

  // Galaxy particle canvas
  useEffect(() => {
    const canvas = galaxyCanvasRef.current;
    if (!canvas) return;
    const section = canvas.parentElement;
    canvas.width = section.offsetWidth;
    canvas.height = section.offsetHeight;
    const ctx = canvas.getContext("2d");

    if (hoveredService === null) {
      cancelAnimationFrame(galaxyAnimRef.current);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    cancelAnimationFrame(galaxyAnimRef.current);
    const particles = [];

    const spawnBatch = () => {
      const { x, y } = galaxyMouseRef.current;
      for (let i = 0; i < 4; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 2.8 + 0.4;
        particles.push({
          x: x + (Math.random() - 0.5) * 24,
          y: y + (Math.random() - 0.5) * 24,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.6,
          life: 1,
          size: Math.random() * 2.8 + 0.7,
          rgb: Math.random() > 0.45 ? "180,40,160" : "255,255,255",
        });
      }
      while (particles.length > 160) particles.shift();
    };

    // Initial burst
    const bx = canvas.width / 2;
    const by = canvas.height * 0.35;
    for (let i = 0; i < 28; i++) {
      const angle = (i / 28) * Math.PI * 2;
      const speed = Math.random() * 5 + 2;
      particles.push({
        x: bx, y: by,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1, size: Math.random() * 3 + 1,
        rgb: Math.random() > 0.5 ? "180,40,160" : "255,255,255",
      });
    }

    let lastSpawn = 0;
    const frame = (ts) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (ts - lastSpawn > 38) { spawnBatch(); lastSpawn = ts; }
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy;
        p.vy += 0.06; p.vx *= 0.985;
        p.life -= 0.017;
        if (p.life <= 0) { particles.splice(i, 1); continue; }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.rgb},${p.life * 0.82})`;
        ctx.fill();
      }
      galaxyAnimRef.current = requestAnimationFrame(frame);
    };
    galaxyAnimRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(galaxyAnimRef.current);
  }, [hoveredService]);

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
          ref={heroRef}
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
                  data-hero-anim
                  className="badge mb-3 px-3 py-2"
                  style={{
                    background: "rgba(96, 11, 86, 0.1)",
                    color: "#600b56",
                    fontSize: "14px",
                    fontWeight: 600,
                    opacity: 0,
                  }}
                >
                  Agencia digital · Cobertura nacional en Ecuador
                </span>
                <h1
                  data-hero-anim
                  className="gradient-title mb-4"
                  style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 700, lineHeight: 1.1, opacity: 0 }}
                >
                  Diseño de Páginas Web en Quito y Ecuador
                </h1>
                <p
                  data-hero-anim
                  className="mb-4"
                  style={{ fontSize: "18px", color: "#333", maxWidth: "600px", lineHeight: 1.7, opacity: 0 }}
                >
                  Expertos en diseño y desarrollo de páginas web profesionales, aplicaciones móviles y SEO en Quito, Guayaquil y todo el Ecuador. Impulsamos tu negocio digital con presupuestos cerrados en dólares y resultados medibles.
                </p>
                <div data-hero-anim className="d-flex flex-wrap gap-3 mt-4" style={{ opacity: 0 }}>
                  <a
                    href="#presupuesto"
                    data-hero-tilt
                    className="btn btn-lg fw-bold px-4 py-3 hero-cta-tilt"
                    style={{
                      borderRadius: "50px",
                      backgroundColor: "rgb(96, 11, 86)",
                      color: "#fff",
                      border: "none",
                      transformStyle: "preserve-3d",
                      willChange: "transform",
                    }}
                  >
                    Pide tu presupuesto gratis
                  </a>
                  <a
                    href="#servicios"
                    data-hero-tilt
                    className="btn btn-lg fw-bold px-4 py-3 hero-cta-tilt"
                    style={{
                      borderRadius: "50px",
                      backgroundColor: "rgb(96, 11, 86)",
                      color: "#fff",
                      border: "none",
                      transformStyle: "preserve-3d",
                      willChange: "transform",
                    }}
                  >
                    Ver servicios
                  </a>
                </div>
                <div
                  data-hero-anim
                  className="mt-4 d-flex flex-wrap gap-4"
                  style={{ fontSize: "14px", color: "#555", opacity: 0 }}
                >
                  <span><i className="bi bi-check-circle me-2" style={{ color: "#600b56" }}></i>Presupuesto en 24 h</span>
                  <span><i className="bi bi-check-circle me-2" style={{ color: "#600b56" }}></i>Sin permanencia</span>
                  <span><i className="bi bi-check-circle me-2" style={{ color: "#600b56" }}></i>Facturación electrónica SRI</span>
                </div>
              </div>
              <div className="col-lg-5 d-none d-lg-block text-center">
                <img
                  ref={heroImgRef}
                  data-hero-anim
                  src="/assets/img/header/Animation3DSoftware.webp"
                  alt="Agencia de diseño web y desarrollo de aplicaciones móviles en Quito y Ecuador"
                  style={{ maxWidth: "100%", height: "auto", filter: "drop-shadow(0 20px 40px rgba(96, 11, 86, 0.25))", opacity: 0 }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* TRUST BAR */}
        <section ref={trustBarRef} className="py-4 border-bottom" style={{ background: "#f8f9fa" }}>
          <div className="container">
            <div className="row text-center g-3 animate-fadeUp">
              <div className="col-6 col-md-3">
                <div
                  suppressHydrationWarning
                  className="fw-bold"
                  style={{ fontSize: "28px", color: "#600b56" }}
                  data-counter-value="100"
                  data-counter-prefix="+"
                >
                  +0
                </div>
                <div className="text-muted small">Proyectos entregados</div>
              </div>
              <div className="col-6 col-md-3">
                <div
                  suppressHydrationWarning
                  className="fw-bold"
                  style={{ fontSize: "28px", color: "#600b56" }}
                  data-counter-value="24"
                  data-counter-suffix=" h"
                >
                  0 h
                </div>
                <div className="text-muted small">Tiempo medio de presupuesto</div>
              </div>
              <div className="col-6 col-md-3">
                <div className="fw-bold" style={{ fontSize: "28px", color: "#600b56" }}>SRI</div>
                <div className="text-muted small">Facturación electrónica</div>
              </div>
              <div className="col-6 col-md-3">
                <div
                  suppressHydrationWarning
                  className="fw-bold"
                  style={{ fontSize: "28px", color: "#600b56" }}
                  data-counter-value="10"
                  data-counter-suffix="+ años"
                >
                  0+ años
                </div>
                <div className="text-muted small">Experiencia</div>
              </div>
            </div>
          </div>
        </section>

        {/* SERVICES — Galaxy Timeline */}
        <section
          id="servicios"
          style={{ background: "#ffffff", paddingTop: "80px", paddingBottom: "80px", position: "relative", overflow: "hidden" }}
          onMouseMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            galaxyMouseRef.current = { x: e.clientX - r.left, y: e.clientY - r.top };
          }}
        >
          {/* Particle canvas */}
          <canvas ref={galaxyCanvasRef} style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none" }} />

          <div className="container" style={{ position: "relative", zIndex: 2 }}>
            {/* Header */}
            <div className="text-center mb-5 animate-fadeUp">
              <span style={{ textTransform: "uppercase", fontWeight: 700, background: "linear-gradient(135deg, #150e23, #600B56)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: "2px", fontSize: "13px" }}>
                Qué hacemos
              </span>
              <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 700, marginTop: "8px", marginBottom: "12px" }}>
                Servicios digitales para empresas en Ecuador
              </h2>
              <p style={{ color: "#6b7280", maxWidth: "680px", fontSize: "17px", margin: "0 auto" }}>
                Todo lo que tu empresa necesita para crecer online, con un único equipo y sin intermediarios.
              </p>
            </div>

            {/* Timeline + panel: onMouseLeave aquí para que mover al panel no cierre */}
            <div onMouseLeave={() => setHoveredService(null)}>
              {/* Horizontal timeline */}
              <div className="galaxy-timeline">
                {services.map((s, i) => (
                  <div
                    key={i}
                    className={`galaxy-node${hoveredService === i ? " galaxy-node--active" : ""}`}
                    onMouseEnter={() => setHoveredService(i)}
                  >
                    <div className="galaxy-node__ring" />
                    <div className="galaxy-node__dot">
                      <i className={s.icon} />
                    </div>
                    <p className="galaxy-node__label">{s.title}</p>
                  </div>
                ))}
              </div>

              {/* Expanded detail panel */}
              <div className="galaxy-detail">
                {services.map((s, i) => (
                  <div
                    key={i}
                    className={`galaxy-detail__card${hoveredService === i ? " galaxy-detail__card--visible" : ""}`}
                  >
                    {/* Left column */}
                    <div className="galaxy-detail__left">
                      <div className="galaxy-icon-wrap">
                        <i className={s.icon} />
                      </div>
                      <h3 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "12px", lineHeight: 1.3, color: "#150e23" }}>
                        {s.title}
                      </h3>
                      <p style={{ color: "#4b5563", fontSize: "15px", lineHeight: 1.75, margin: 0 }}>
                        {s.text}
                      </p>
                    </div>
                    {/* Vertical divider */}
                    <div className="galaxy-vdivider" />
                    {/* Right column */}
                    <div className="galaxy-detail__right">
                      <ul className="galaxy-features">
                        {s.features.map((f, j) => (
                          <li key={j}>{f}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* WHY US */}
        <section className="py-5" style={{ background: "#ffffff", paddingTop: "80px", paddingBottom: "80px" }}>
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg-6 mb-4 mb-lg-0 animate-fadeRight">
                <span className="text-uppercase fw-bold" style={{ background: "linear-gradient(135deg, #150e23, #600B56)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: "2px", fontSize: "13px" }}>
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
                      <i className="bi bi-check-circle-fill me-2" style={{ background: "linear-gradient(135deg, #150e23, #600B56)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}></i>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="col-lg-6 text-center animate-fadeLeft" style={{ transitionDelay: '150ms' }}>
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
        <section id="presupuesto" className="py-5" style={{ paddingTop: "80px", paddingBottom: "80px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
            <img src={heroBackgroundPattern} alt="" aria-hidden="true" className="rotating-pattern-reverse" style={{ width: "140%", height: "140%", objectFit: "cover", opacity: 0.08, filter: "brightness(0)", pointerEvents: "none" }} />
          </div>
          <div className="container" style={{ position: "relative", zIndex: 2 }}>
            <div className="text-center mb-4 animate-fadeUp">
              <h2 className="mt-2 mb-3" style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 700 }}>
                Planes y Precios
              </h2>
              <p className="text-muted mx-auto" style={{ maxWidth: "650px", fontSize: "17px" }}>
                Elige la categoría que mejor describe tu proyecto. Cada plan incluye presupuesto cerrado en dólares, sin sorpresas.
              </p>
            </div>

           

            {/* TAB: WEBS CORPORATIVAS */}
            {activePricingTab === "web" && (
              <>
                <div className="row g-4 justify-content-center">
                  {pricingPlans.map((plan, i) => (
                    <PlanCard key={i} plan={plan} index={i} />
                  ))}
                </div>
              </>
            )}

            {/* TAB: TIENDAS ONLINE */}
            {activePricingTab === "store" && (
              <>
                <div className="text-center mb-4 animate-fadeUp">
                  <span className="text-uppercase fw-bold" style={{ background: "linear-gradient(135deg, #150e23, #600B56)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: "2px", fontSize: "13px" }}>
                    Tiendas Online · Tu Sucursal 24/7
                  </span>
                  <p className="text-muted mt-2 mx-auto" style={{ maxWidth: "600px", fontSize: "16px" }}>
                    Vende tus productos en internet las 24 horas, todos los días. Desde tu primera tienda hasta una plataforma de alto rendimiento.
                  </p>
                </div>
                <div className="row g-4 justify-content-center">
                  {storePlans.map((plan, i) => (
                    <PlanCard key={i} plan={plan} index={i} />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>

        {/* FAQ */}
        <section className="py-5" style={{ background: "#ffffff", paddingTop: "80px", paddingBottom: "80px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
            <img src={heroBackgroundPattern} alt="" aria-hidden="true" className="rotating-pattern-slow" style={{ width: "130%", height: "130%", objectFit: "cover", opacity: 0.08, filter: "brightness(0)", pointerEvents: "none" }} />
          </div>
          <div className="container" style={{ position: "relative", zIndex: 2 }}>
            <div className="text-center mb-5 animate-fadeUp">
              <span className="text-uppercase fw-bold" style={{ background: "linear-gradient(135deg, #150e23, #600B56)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: "2px", fontSize: "13px" }}>
                Resolvemos dudas
              </span>
              <h2 className="mt-2 mb-3" style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 700 }}>
                Preguntas Frecuentes sobre Sitios Web
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
              Únase a Undercodeec
            </h2>
            <p className="mb-4 mx-auto animate-fadeUp" style={{ fontSize: "18px", opacity: 0.95, maxWidth: "650px", transitionDelay: '100ms' }}>
              Cuéntanos qué necesitas y en 24-48 h tienes un presupuesto cerrado en dólares, sin compromiso. Atendemos Quito, Sangolquí - Valle de los Chillos, Guayaquil, Cuenca y todo el Ecuador.
            </p>
            <div className="d-flex flex-wrap gap-3 justify-content-center animate-scaleUp" style={{ transitionDelay: '250ms' }}>
              <Link
                href="/contacto"
                className="btn btn-light btn-lg fw-bold px-4 py-3"
                style={{ borderRadius: "50px", color: "#600b56" }}
              >
                Formulario de contacto
              </Link>
              <a
                href="tel:+593979046329"
                className="btn btn-outline-light btn-lg px-4 py-3"
                style={{ borderRadius: "50px" }}
              >
                <i className="bi bi-telephone-fill me-2"></i>
                +593 979 046 329
              </a>
            </div>
            <p className="mt-4 small" style={{ opacity: 0.8 }}>
              Quito · Sangolquí - Valle de los Chillos · Cobertura nacional en Ecuador · Respuesta en 24 h
            </p>
          </div>
        </section>
      </main>

      <style jsx global>{`
        .plan-card-tilt {
          overflow: hidden;
          transform-style: preserve-3d;
          will-change: transform;
          transition: box-shadow 0.5s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .plan-card-tilt::before {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(
            circle 280px at var(--mx, 50%) var(--my, 50%),
            rgba(255, 255, 255, 0.2),
            transparent 65%
          );
          opacity: 0;
          transition: opacity 0.5s cubic-bezier(0.22, 1, 0.36, 1),
            background 0.15s linear;
          pointer-events: none;
          border-radius: inherit;
          z-index: 1;
        }
        .plan-card-tilt:hover::before {
          opacity: 1;
        }
        .plan-card-tilt:hover {
          box-shadow: 0 35px 60px -15px rgba(96, 11, 86, 0.45) !important;
        }
        .plan-card-tilt > * {
          position: relative;
          z-index: 2;
        }
        .hero-cta-tilt {
          position: relative;
          overflow: hidden;
          transition: box-shadow 0.4s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .hero-cta-tilt::after {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(
            circle 140px at var(--mx, 50%) var(--my, 50%),
            rgba(255, 255, 255, 0.45),
            transparent 65%
          );
          opacity: 0;
          mix-blend-mode: screen;
          transition: opacity 0.4s cubic-bezier(0.22, 1, 0.36, 1);
          pointer-events: none;
          border-radius: inherit;
        }
        .hero-cta-tilt:hover::after {
          opacity: 1;
        }
        .hero-cta-tilt:hover {
          box-shadow: 0 18px 35px -10px rgba(96, 11, 86, 0.55);
        }
      `}</style>
    </>
  );
};

export default LandingEcuador;
