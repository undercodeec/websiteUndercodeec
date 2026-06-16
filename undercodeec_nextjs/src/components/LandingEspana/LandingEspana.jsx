"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { animate } from "animejs";
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
    features: [
      "Diseño 100 % personalizado a tu identidad de marca",
      "Mobile-first · Core Web Vitals optimizados",
      "SEO técnico integrado desde el primer pixel",
      "Entrega en 2–4 semanas con garantía de 1 año",
    ],
  },
  {
    icon: "bi bi-phone",
    title: "Apps Móviles Android e iOS",
    text: "Desarrollamos aplicaciones móviles nativas y multiplataforma (Flutter, React Native) para Android e iOS. Publicamos tu app en Play Store y App Store con todas las garantías.",
    features: [
      "Flutter o React Native según tu proyecto",
      "Publicación en Play Store y App Store incluida",
      "Diseño UX/UI nativo y fluido",
      "Mantenimiento y actualizaciones continuas",
    ],
  },
  {
    icon: "bi bi-graph-up-arrow",
    title: "Posicionamiento Web (SEO)",
    text: "Posicionamiento web local y nacional en Google. Auditoría SEO técnica, contenidos, link building y SEO local para que tu negocio aparezca cuando tus clientes buscan en España.",
    features: [
      "Auditoría técnica + palabras clave locales",
      "Contenido optimizado para el mercado español",
      "Link building y autoridad de dominio",
      "Reportes mensuales con métricas reales",
    ],
  },
  {
    icon: "bi bi-megaphone",
    title: "Google Ads y Meta Ads",
    text: "Campañas SEM rentables en Google Ads y Meta Ads (Facebook e Instagram). Sin gastar de más, con seguimiento de conversiones y ROI medible cada mes.",
    features: [
      "Campañas Search, Display y Shopping",
      "Segmentación precisa al mercado español",
      "Seguimiento de conversiones y ROAS",
      "Optimización semanal para maximizar ROI",
    ],
  },
  {
    icon: "bi bi-gear-wide-connected",
    title: "Software Empresarial a Medida",
    text: "CRM, ERP, sistemas de inventarios, automatización de procesos y software a medida para tu pyme. Soluciones que se adaptan a tu forma de trabajar, no al revés.",
    features: [
      "CRM, ERP e inventarios personalizados",
      "Automatización de procesos operativos",
      "Integración con tus sistemas actuales",
      "Escalable y con soporte técnico dedicado",
    ],
  },
  {
    icon: "bi bi-receipt",
    title: "Facturación Electrónica · Verifactu & SRI",
    text: "Software de facturación electrónica preparado para la AEAT, Ley Crea y Crece y Verifactu en España, y para el SRI Ecuador con comprobantes XML, firma electrónica y autorización en línea. Un solo equipo, dos normativas resueltas.",
    features: [
      "Cumplimiento AEAT, Ley Crea y Crece y Verifactu (España)",
      "Facturación electrónica autorizada por el SRI (Ecuador)",
      "Integración con tu sistema contable o ERP",
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

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const tick = () => {
    const t = targetRef.current;
    const c = currentRef.current;
    const v = velocityRef.current;
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
  );
};

const VideoShowcase = () => {
  const sectionRef = useRef(null);
  const videoWrapRef = useRef(null);
  const glowRef = useRef(null);
  const starCanvasRef = useRef(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const starAnimRef = useRef(null);

  // Starfield canvas with mouse parallax
  useEffect(() => {
    const canvas = starCanvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;

    const ctx = canvas.getContext("2d");
    let w, h;

    const resize = () => {
      w = section.offsetWidth;
      h = section.offsetHeight;
      canvas.width = w;
      canvas.height = h;
    };
    resize();
    window.addEventListener("resize", resize);

    const layers = [
      { count: 120, speed: 0.3, sizeMin: 0.4, sizeMax: 1.2, alpha: 0.3 },
      { count: 80, speed: 0.6, sizeMin: 0.8, sizeMax: 2.0, alpha: 0.5 },
      { count: 40, speed: 1.0, sizeMin: 1.2, sizeMax: 3.0, alpha: 0.8 },
    ];

    const stars = [];
    layers.forEach((layer) => {
      for (let i = 0; i < layer.count; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          baseX: Math.random() * w,
          baseY: Math.random() * h,
          size: layer.sizeMin + Math.random() * (layer.sizeMax - layer.sizeMin),
          speed: layer.speed,
          alpha: layer.alpha * (0.5 + Math.random() * 0.5),
          twinkleSpeed: 0.005 + Math.random() * 0.015,
          twinkleOffset: Math.random() * Math.PI * 2,
          hue: Math.random() > 0.7 ? 290 + Math.random() * 30 : 0,
        });
      }
    });

    const shootingStars = [];
    let lastShoot = 0;

    const spawnShootingStar = () => {
      shootingStars.push({
        x: Math.random() * w * 0.8,
        y: Math.random() * h * 0.3,
        vx: 4 + Math.random() * 6,
        vy: 2 + Math.random() * 3,
        life: 1,
        length: 40 + Math.random() * 60,
        size: 1 + Math.random() * 1.5,
      });
    };

    const frame = (ts) => {
      ctx.clearRect(0, 0, w, h);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const offsetX = (mx - 0.5) * 2;
      const offsetY = (my - 0.5) * 2;

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        const parallaxX = offsetX * 30 * s.speed;
        const parallaxY = offsetY * 20 * s.speed;
        s.x = s.baseX + parallaxX;
        s.y = s.baseY + parallaxY;

        const twinkle = 0.5 + 0.5 * Math.sin(ts * s.twinkleSpeed + s.twinkleOffset);
        const finalAlpha = s.alpha * twinkle;

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        if (s.hue > 0) {
          ctx.fillStyle = `hsla(${s.hue}, 80%, 40%, ${finalAlpha})`;
        } else {
          ctx.fillStyle = `rgba(96,11,86,${finalAlpha})`;
        }
        ctx.fill();

        if (s.size > 1.8) {
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size * 3, 0, Math.PI * 2);
          ctx.fillStyle = s.hue > 0
            ? `hsla(${s.hue}, 80%, 40%, ${finalAlpha * 0.15})`
            : `rgba(96,11,86,${finalAlpha * 0.15})`;
          ctx.fill();
        }
      }

      const layer3 = stars.filter((s) => s.speed === 1.0);
      for (let i = 0; i < layer3.length; i++) {
        for (let j = i + 1; j < layer3.length; j++) {
          const dx = layer3[i].x - layer3[j].x;
          const dy = layer3[i].y - layer3[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(layer3[i].x, layer3[i].y);
            ctx.lineTo(layer3[j].x, layer3[j].y);
            ctx.strokeStyle = `rgba(180,40,160,${0.12 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      if (ts - lastShoot > 4000 + Math.random() * 6000) {
        spawnShootingStar();
        lastShoot = ts;
      }
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const ss = shootingStars[i];
        ss.x += ss.vx;
        ss.y += ss.vy;
        ss.life -= 0.018;
        if (ss.life <= 0) { shootingStars.splice(i, 1); continue; }

        const grad = ctx.createLinearGradient(
          ss.x, ss.y,
          ss.x - ss.vx * ss.length * 0.15, ss.y - ss.vy * ss.length * 0.15
        );
        grad.addColorStop(0, `rgba(96,11,86,${ss.life * 0.9})`);
        grad.addColorStop(1, `rgba(180,40,160,0)`);
        ctx.beginPath();
        ctx.moveTo(ss.x, ss.y);
        ctx.lineTo(ss.x - ss.vx * ss.length * 0.15, ss.y - ss.vy * ss.length * 0.15);
        ctx.strokeStyle = grad;
        ctx.lineWidth = ss.size * ss.life;
        ctx.lineCap = "round";
        ctx.stroke();
      }

      starAnimRef.current = requestAnimationFrame(frame);
    };

    starAnimRef.current = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(starAnimRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  // Video reveal animation
  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const section = sectionRef.current;
    const videoWrap = videoWrapRef.current;
    const glow = glowRef.current;
    if (!section || !videoWrap) return;

    videoWrap.style.opacity = "0";
    videoWrap.style.transform = "scale(0.82) translateY(60px) rotateX(8deg)";
    videoWrap.style.filter = "blur(8px)";
    if (glow) {
      glow.style.opacity = "0";
      glow.style.transform = "scale(0.6)";
    }

    if (reduced) {
      videoWrap.style.opacity = "1";
      videoWrap.style.transform = "none";
      videoWrap.style.filter = "none";
      if (glow) { glow.style.opacity = "1"; glow.style.transform = "none"; }
      return;
    }

    let triggered = false;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !triggered) {
            triggered = true;
            observer.unobserve(section);

            animate(videoWrap, {
              opacity: [0, 1],
              scale: [0.82, 1],
              translateY: [60, 0],
              rotateX: [8, 0],
              filter: ["blur(8px)", "blur(0px)"],
              duration: 1200,
              ease: "outExpo",
            });

            if (glow) {
              animate(glow, {
                opacity: [0, 0.7],
                scale: [0.6, 1.05],
                duration: 1400,
                delay: 300,
                ease: "outExpo",
              });
              setTimeout(() => {
                animate(glow, {
                  scale: [1.05, 1.12, 1.05],
                  opacity: [0.7, 0.9, 0.7],
                  duration: 3000,
                  ease: "inOutSine",
                  loop: true,
                });
              }, 1700);
            }
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const handleMouseMove = (e) => {
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseRef.current = {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    };
  };

  const videoRef = useRef(null);
  const wasMutedBeforeRef = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => {
      if (typeof window === "undefined") return;
      wasMutedBeforeRef.current = localStorage.getItem("isGlobalMuted") === "true";
      if (!wasMutedBeforeRef.current) {
        localStorage.setItem("isGlobalMuted", "true");
        window.dispatchEvent(new Event("storage"));
        if (window.currentAudio) window.currentAudio.pause();
        if (window.preloaderAudio) window.preloaderAudio.pause();
      }
    };

    const handlePause = () => {
      if (typeof window === "undefined") return;
      if (!wasMutedBeforeRef.current) {
        localStorage.setItem("isGlobalMuted", "false");
        window.dispatchEvent(new Event("storage"));
      }
    };

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("ended", handlePause);

    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("ended", handlePause);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        video.muted = !entry.isIntersecting;
      },
      { threshold: 0.5 }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      style={{
        background: "linear-gradient(180deg, #ffffff 0%, #ffffff 42%, #f8f5f8 48%, #f5f1f5 50%, #f8f5f8 52%, #ffffff 58%, #ffffff 100%)",
        paddingTop: "100px",
        paddingBottom: "200px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <canvas
        ref={starCanvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div className="container" style={{ position: "relative", zIndex: 2 }}>
        <div
          ref={videoWrapRef}
          style={{
            maxWidth: "960px",
            margin: "0 auto",
            borderRadius: "20px",
            overflow: "hidden",
            boxShadow: "0 30px 80px rgba(96,11,86,0.5), 0 0 60px rgba(180,40,160,0.2)",
            border: "1px solid rgba(180,40,160,0.25)",
            perspective: "1000px",
            transformStyle: "preserve-3d",
            willChange: "transform, opacity, filter",
          }}
        >
          <video
            ref={videoRef}
            autoPlay
            muted
            controls
            loop
            playsInline
            preload="metadata"
            style={{ width: "100%", height: "auto", display: "block" }}
          >
            <source src="/assets/img/video/video-undercode-ec-1.mp4" type="video/mp4" />
          </video>
        </div>
      </div>
    </section>
  );
};

const FeaturesParticles = ({ active }) => {
  const canvasRef = useRef(null);
  const animRef  = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();

    if (!active) {
      cancelAnimationFrame(animRef.current);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    cancelAnimationFrame(animRef.current);

    const particles = Array.from({ length: 35 }, () => ({
      x:       Math.random() * canvas.width,
      y:       Math.random() * canvas.height,
      vy:      -(Math.random() * 0.65 + 0.22),
      phase:   Math.random() * Math.PI * 2,
      amp:     Math.random() * 14 + 4,
      size:    Math.random() * 2.6 + 1.1,
      opacity: Math.random() * 0.7 + 0.1,
      dOp:     (Math.random() * 0.007 + 0.003) * (Math.random() > 0.5 ? 1 : -1),
      purple:  Math.random() > 0.45,
    }));

    let t = 0;
    const frame = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 0.018;

      particles.forEach((p) => {
        p.y += p.vy;
        p.x += Math.sin(t * 1.1 + p.phase) * 0.38;
        p.opacity += p.dOp;
        if (p.opacity > 0.82) p.dOp = -Math.abs(p.dOp);
        if (p.opacity < 0.07) p.dOp =  Math.abs(p.dOp);
        if (p.y < -8) {
          p.y = canvas.height + 8;
          p.x = Math.random() * canvas.width;
        }

        const color = p.purple ? `150,28,128` : `185,110,215`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color},${p.opacity})`;
        ctx.fill();
      });

      animRef.current = requestAnimationFrame(frame);
    };

    animRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(animRef.current);
  }, [active]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0 }}
    />
  );
};

const LandingEspana = () => {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState(0);
  const [hoveredService, setHoveredService] = useState(null);
  const galaxyCanvasRef = useRef(null);
  const galaxyAnimRef = useRef(null);
  const galaxyMouseRef = useRef({ x: 0, y: 0 });

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
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      sessionStorage.setItem("scrollToDemos", "true");
                      sessionStorage.setItem("preloaderShown_home", "true");
                      router.push("/");
                    }}
                    className="btn btn-lg fw-bold px-4 py-3"
                    style={{
                      borderRadius: "50px",
                      backgroundColor: "rgb(96, 11, 86)",
                      color: "#fff",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Ver portafolio
                  </button>
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
                Servicios digitales para empresas en España
              </h2>
              <p style={{ color: "#6b7280", maxWidth: "700px", fontSize: "17px", margin: "0 auto" }}>
                Todo lo que tu empresa necesita para crecer online, con un único equipo y sin intermediarios. Hablamos claro y trabajamos con plazos reales.
              </p>
            </div>

            {/* Timeline + panel */}
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
              <div className={`galaxy-detail${hoveredService !== null ? " galaxy-detail--open" : ""}`}>
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
                      <FeaturesParticles active={hoveredService === i} />
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

        {/* VIDEO SHOWCASE */}
        <VideoShowcase />

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
                <PlanCard key={i} plan={plan} index={i} />
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
              <a
                href="https://calendly.com/undercodeec/30min"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-lg fw-bold px-4 py-3"
                style={{
                  borderRadius: "50px",
                  backgroundColor: "rgb(96, 11, 86)",
                  color: "#fff",
                  border: "none",
                }}
              >
                <i className="bi bi-calendar-event me-2"></i>
                Agendar Reunión
              </a>
            </div>
            <p className="mt-4 small" style={{ opacity: 0.8 }}>
              Atención remota · Cobertura nacional en España · Respuesta en 24 h
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
      `}</style>
    </>
  );
};

export default LandingEspana;
