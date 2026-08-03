"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { animate, stagger } from "animejs";
import "@/components/Slider/slider.css";

const heroBackgroundPattern =
  "/assets/slider/6fa818bb935c0e2a1081f259d84df226b237a184.png";

const hostingPlans = [
  {
    name: "Plan Basic",
    price: "40",
    period: "año",
    description:
      "Ideal para empezar tu proyecto en línea con una opción económica, estable y fácil de administrar.",
    features: [
      "1 sitio web",
      "1,000 MB de almacenamiento",
      "5,000 MB de ancho de banda",
      "3 cuentas de correo",
      "1 base de datos",
      "1 cuenta FTP",
      "Dominio .com incluido",
    ],
  },
  {
    name: "Plan Modern",
    price: "80",
    period: "año",
    description:
      "Perfecto para negocios en crecimiento que necesitan más recursos y una mejor capacidad para operar con comodidad.",
    features: [
      "1 sitio web",
      "15,000 MB de almacenamiento",
      "8,000 MB de ancho de banda",
      "10 cuentas de correo",
      "5 bases de datos",
      "1 cuenta FTP",
      "Dominio .com incluido",
    ],
    featured: true,
  },
  {
    name: "Plan Enterprise",
    price: "150",
    period: "año",
    description:
      "La mejor opción para empresas, proyectos profesionales o sitios que requieren mayor capacidad y rendimiento.",
    features: [
      "1 sitio web",
      "20,480 MB de almacenamiento",
      "102,400 MB de ancho de banda",
      "10 cuentas de correo",
      "5 bases de datos",
      "2 cuentas FTP",
      "Dominio .com incluido",
    ],
  },
];

const hostingFeatures = [
  {
    icon: "bi bi-globe",
    title: "Dominio .com Incluido",
    text: "Cada plan incluye un dominio .com para que tu marca tenga presencia profesional desde el primer día, sin costos adicionales ocultos.",
  },
  {
    icon: "bi bi-shield-check",
    title: "Seguridad y Estabilidad",
    text: "Servidores con alta disponibilidad, copias de seguridad automáticas y protección contra ataques para mantener tu sitio siempre en línea.",
  },
  {
    icon: "bi bi-envelope",
    title: "Correos Corporativos",
    text: "Crea cuentas de correo con tu propio dominio (nombre@tuempresa.com) para proyectar una imagen profesional ante tus clientes.",
  },
  {
    icon: "bi bi-speedometer2",
    title: "Panel cPanel Intuitivo",
    text: "Administra tu hosting desde un panel de control sencillo. Instala WordPress, gestiona archivos, bases de datos y correos en minutos.",
  },
  {
    icon: "bi bi-database",
    title: "Bases de Datos MySQL",
    text: "Soporte completo para bases de datos MySQL compatible con WordPress, Joomla, PrestaShop y cualquier CMS moderno.",
  },
  {
    icon: "bi bi-headset",
    title: "Soporte Técnico",
    text: "Nuestro equipo técnico ecuatoriano te acompaña en la configuración inicial y está disponible para resolver incidencias.",
  },
];

const faqs = [
  {
    q: "¿El dominio .com ya está incluido en el precio del plan?",
    a: "Sí. Todos nuestros planes de hosting incluyen un dominio .com por 1 año sin costo adicional. Al renovar el plan, el dominio puede mantenerse o renovarse según tu preferencia.",
  },
  {
    q: "¿Puedo migrar mi sitio web actual a uno de estos planes?",
    a: "Sí. Nuestro equipo se encarga de la migración completa de tu sitio web actual, incluyendo archivos, bases de datos y correos, sin tiempo de inactividad.",
  },
  {
    q: "¿Qué CMS puedo instalar en el hosting?",
    a: "Puedes instalar WordPress, Joomla, Drupal, PrestaShop, Magento y cualquier CMS popular desde el panel cPanel con un solo clic. También admitimos aplicaciones PHP, Python y Node.js.",
  },
  {
    q: "¿Puedo cambiar de plan si mis necesidades crecen?",
    a: "Por supuesto. Puedes hacer upgrade a un plan superior en cualquier momento. La diferencia de precio se prorratea y el proceso es inmediato sin interrumpir tu sitio.",
  },
  {
    q: "¿Cuánto tiempo tarda en activarse el hosting?",
    a: "La activación es inmediata tras confirmar el pago. Recibirás los datos de acceso a tu panel cPanel y las instrucciones para apuntar tu dominio en menos de 24 horas.",
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
          background: plan.featured
            ? "linear-gradient(135deg, #150e23, #600B56)"
            : "#fff",
          color: plan.featured ? "#fff" : "inherit",
          border: plan.featured ? "none" : "1px solid #eee",
          boxShadow: plan.featured
            ? "0 20px 40px rgba(186, 39, 244, 0.3)"
            : "0 4px 20px rgba(0,0,0,0.04)",
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
        <h3
          className={`mb-2 ${plan.featured ? "mt-3" : ""}`}
          style={{ fontSize: "22px", fontWeight: 700 }}
        >
          {plan.name}
        </h3>
        <div className="my-3">
          <span style={{ fontSize: "24px" }}>$</span>
          <span style={{ fontSize: "44px", fontWeight: 700 }}>{plan.price}</span>
          <span style={{ fontSize: "16px" }}>/{plan.period}</span>
        </div>
        <p
          className={plan.featured ? "mb-4" : "text-muted mb-4"}
          style={{ fontSize: "14px" }}
        >
          {plan.description}
        </p>
        <ul className="list-unstyled text-start mb-4">
          {plan.features.map((f, j) => (
            <li key={j} className="mb-2" style={{ fontSize: "14px" }}>
              <i
                className="bi bi-check-lg me-2"
                style={
                  plan.featured
                    ? { color: "#fff" }
                    : {
                        background: "linear-gradient(135deg, #150e23, #600B56)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }
                }
              ></i>
              {f}
            </li>
          ))}
        </ul>
        <a
          href={`https://wa.me/593999739534?text=${encodeURIComponent(
            `Hola, me interesa contratar el *${plan.name}* de hosting con dominio .com incluido por $${plan.price}/${plan.period}.\n\n¿Podrían darme más información?`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`btn ${plan.featured ? "btn-light" : "btn-outline-primary"} fw-bold w-100 py-2`}
          style={{
            borderRadius: "50px",
            color: plan.featured ? "#600b56" : "transparent",
            background: plan.featured
              ? "#fff"
              : "linear-gradient(135deg, #150e23, #600B56)",
            WebkitBackgroundClip: plan.featured ? "unset" : "text",
            WebkitTextFillColor: plan.featured ? "unset" : "transparent",
            borderColor: plan.featured ? "#fff" : "#600B56",
          }}
        >
          Contratar plan
        </a>
      </div>
    </div>
  );
};

const LandingHosting = () => {
  const [openFaq, setOpenFaq] = useState(0);
  const heroRef = useRef(null);
  const heroImgRef = useRef(null);
  const trustBarRef = useRef(null);

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
          el.textContent = `${prefix}0${suffix}`;
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

  return (
    <>
      <main className="landing-hosting">
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
                  Hosting profesional · Dominio .com incluido
                </span>
                <h1
                  data-hero-anim
                  className="gradient-title mb-4"
                  style={{
                    fontSize: "clamp(32px, 5vw, 56px)",
                    fontWeight: 700,
                    lineHeight: 1.1,
                    opacity: 0,
                  }}
                >
                  Planes de Hosting con Dominio .com Incluido
                </h1>
                <p
                  data-hero-anim
                  className="mb-4"
                  style={{
                    fontSize: "18px",
                    color: "#333",
                    maxWidth: "600px",
                    lineHeight: 1.7,
                    opacity: 0,
                  }}
                >
                  Lanza tu sitio web con todo incluido: hosting estable, correos corporativos y tu dominio .com en un solo plan sin costos ocultos. Desde $40/año.
                </p>
                <div
                  data-hero-anim
                  className="d-flex flex-wrap gap-3 mt-4"
                  style={{ opacity: 0 }}
                >
                  <a
                    href="#planes"
                    className="btn btn-lg fw-bold px-4 py-3"
                    style={{
                      borderRadius: "50px",
                      backgroundColor: "rgb(96, 11, 86)",
                      color: "#fff",
                      border: "none",
                    }}
                  >
                    Ver planes
                  </a>
                  <a
                    href="https://wa.me/593999739534?text=Hola%2C%20quisiera%20informaci%C3%B3n%20sobre%20los%20planes%20de%20hosting"
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
                    <i className="bi bi-whatsapp me-2"></i>Consultar por WhatsApp
                  </a>
                </div>
                <div
                  data-hero-anim
                  className="mt-4 d-flex flex-wrap gap-4"
                  style={{ fontSize: "14px", color: "#555", opacity: 0 }}
                >
                  <span>
                    <i className="bi bi-check-circle me-2" style={{ color: "#600b56" }}></i>
                    Dominio .com gratis
                  </span>
                  <span>
                    <i className="bi bi-check-circle me-2" style={{ color: "#600b56" }}></i>
                    Activación en 24 h
                  </span>
                  <span>
                    <i className="bi bi-check-circle me-2" style={{ color: "#600b56" }}></i>
                    Sin permanencia
                  </span>
                </div>
              </div>
              <div className="col-lg-5 d-none d-lg-block text-center">
                <img
                  ref={heroImgRef}
                  data-hero-anim
                  src="/assets/img/header/Animation3DSoftware.webp"
                  alt="Planes de hosting con dominio .com incluido"
                  style={{
                    maxWidth: "100%",
                    height: "auto",
                    filter: "drop-shadow(0 20px 40px rgba(96, 11, 86, 0.25))",
                    opacity: 0,
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* TRUST BAR */}
        <section
          ref={trustBarRef}
          className="py-4 border-bottom"
          style={{ background: "#f8f9fa" }}
        >
          <div className="container">
            <div className="row text-center g-3">
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
                <div className="text-muted small">Sitios hospedados</div>
              </div>
              <div className="col-6 col-md-3">
                <div className="fw-bold" style={{ fontSize: "28px", color: "#600b56" }}>
                  99.9%
                </div>
                <div className="text-muted small">Uptime garantizado</div>
              </div>
              <div className="col-6 col-md-3">
                <div className="fw-bold" style={{ fontSize: "28px", color: "#600b56" }}>
                  .com
                </div>
                <div className="text-muted small">Dominio incluido en todos los planes</div>
              </div>
              <div className="col-6 col-md-3">
                <div
                  className="fw-bold"
                  style={{ fontSize: "28px", color: "#600b56" }}
                  data-counter-value="24"
                  data-counter-suffix=" h"
                  suppressHydrationWarning
                >
                  0 h
                </div>
                <div className="text-muted small">Activación del servicio</div>
              </div>
            </div>
          </div>
        </section>

        {/* PLANES */}
        <section
          id="planes"
          className="py-5"
          style={{ paddingTop: "80px", paddingBottom: "80px" }}
        >
          <div className="container">
            <div className="text-center mb-5 animate-fadeUp">
              <span
                className="text-uppercase fw-bold"
                style={{
                  background: "linear-gradient(135deg, #150e23, #600B56)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  letterSpacing: "2px",
                  fontSize: "13px",
                }}
              >
                Elige tu plan
              </span>
              <h2
                className="mt-2 mb-3"
                style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 700 }}
              >
                Planes de Hosting con Dominio .com
              </h2>
              <p
                className="text-muted mx-auto"
                style={{ maxWidth: "650px", fontSize: "17px" }}
              >
                Todos los planes incluyen tu dominio .com por 1 año, panel cPanel, correos corporativos y soporte técnico. Sin letra pequeña.
              </p>
            </div>
            <div className="row g-4 justify-content-center">
              {hostingPlans.map((plan, i) => (
                <PlanCard key={i} plan={plan} index={i} />
              ))}
            </div>
          </div>
        </section>

        {/* CARACTERÍSTICAS */}
        <section
          className="py-5"
          style={{ background: "#ffffff", paddingTop: "80px", paddingBottom: "80px" }}
        >
          <div className="container">
            <div className="text-center mb-5 animate-fadeUp">
              <span
                className="text-uppercase fw-bold"
                style={{
                  background: "linear-gradient(135deg, #150e23, #600B56)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  letterSpacing: "2px",
                  fontSize: "13px",
                }}
              >
                Todo incluido
              </span>
              <h2
                className="mt-2 mb-3"
                style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 700 }}
              >
                ¿Qué incluye tu hosting?
              </h2>
              <p
                className="text-muted mx-auto"
                style={{ maxWidth: "700px", fontSize: "17px" }}
              >
                Cada plan está diseñado para que puedas lanzar y gestionar tu sitio web sin complicaciones técnicas.
              </p>
            </div>
            <div className="row g-4">
              {hostingFeatures.map((f, i) => (
                <div
                  className="col-md-6 col-lg-4 animate-scaleUp"
                  key={i}
                  style={{ transitionDelay: `${i * 80}ms` }}
                >
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
                      <i className={f.icon}></i>
                    </div>
                    <h3 className="mb-3" style={{ fontSize: "20px", fontWeight: 700 }}>
                      {f.title}
                    </h3>
                    <p
                      className="text-muted mb-0"
                      style={{ fontSize: "15px", lineHeight: 1.7 }}
                    >
                      {f.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* WHY US */}
        <section
          className="py-5"
          style={{ paddingTop: "80px", paddingBottom: "80px" }}
        >
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg-6 mb-4 mb-lg-0 animate-fadeRight">
                <span
                  className="text-uppercase fw-bold"
                  style={{
                    background: "linear-gradient(135deg, #150e23, #600B56)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    letterSpacing: "2px",
                    fontSize: "13px",
                  }}
                >
                  Por qué elegirnos
                </span>
                <h2
                  className="mt-2 mb-4"
                  style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 700 }}
                >
                  Hosting ecuatoriano con soporte real.
                </h2>
                <p
                  className="text-muted mb-4"
                  style={{ fontSize: "17px", lineHeight: 1.7 }}
                >
                  No eres un ticket de soporte. Somos un equipo técnico ecuatoriano que entiende tu negocio y habla tu idioma. Tu sitio siempre activo, tu dominio siempre tuyo.
                </p>
                <ul className="list-unstyled">
                  {[
                    "Precio fijo en dólares (USD), sin sorpresas",
                    "Dominio .com incluido en todos los planes",
                    "Panel cPanel en español, fácil de usar",
                    "Correos corporativos con tu dominio",
                    "Migración gratuita desde tu hosting actual",
                    "Soporte técnico ecuatoriano sin permanencia",
                  ].map((p, i) => (
                    <li key={i} className="mb-2" style={{ fontSize: "16px" }}>
                      <i
                        className="bi bi-check-circle-fill me-2"
                        style={{
                          background: "linear-gradient(135deg, #150e23, #600B56)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                        }}
                      ></i>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
              <div
                className="col-lg-6 text-center animate-fadeLeft"
                style={{ transitionDelay: "150ms" }}
              >
                <img
                  src="/assets/img/about/3d_vector2.svg"
                  alt="Hosting con dominio incluido en Ecuador"
                  style={{ maxWidth: "100%", height: "auto" }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section
          className="py-5"
          style={{ background: "#ffffff", paddingTop: "80px", paddingBottom: "80px" }}
        >
          <div className="container">
            <div className="text-center mb-5 animate-fadeUp">
              <span
                className="text-uppercase fw-bold"
                style={{
                  background: "linear-gradient(135deg, #150e23, #600B56)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  letterSpacing: "2px",
                  fontSize: "13px",
                }}
              >
                Resolvemos dudas
              </span>
              <h2
                className="mt-2 mb-3"
                style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 700 }}
              >
                Preguntas Frecuentes sobre Hosting
              </h2>
            </div>
            <div className="row justify-content-center">
              <div
                className="col-lg-9 animate-fadeUp"
                style={{ transitionDelay: "200ms" }}
              >
                {faqs.map((item, i) => (
                  <div
                    key={i}
                    className="mb-3 rounded-3"
                    style={{
                      background: "#fff",
                      border: "1px solid #eee",
                      overflow: "hidden",
                    }}
                  >
                    <button
                      type="button"
                      className="w-100 text-start p-4 d-flex justify-content-between align-items-center"
                      style={{
                        background:
                          openFaq === i
                            ? "linear-gradient(135deg, #150e23, #600B56)"
                            : "none",
                        WebkitBackgroundClip: openFaq === i ? "text" : "unset",
                        WebkitTextFillColor:
                          openFaq === i ? "transparent" : "inherit",
                        border: "none",
                        fontWeight: 600,
                        fontSize: "17px",
                        color: openFaq === i ? "transparent" : "inherit",
                      }}
                      onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                    >
                      <span>{item.q}</span>
                      <i
                        className={`bi ${openFaq === i ? "bi-dash-circle" : "bi-plus-circle"}`}
                        style={{ fontSize: "22px" }}
                      ></i>
                    </button>
                    {openFaq === i && (
                      <div
                        className="px-4 pb-4 text-muted"
                        style={{ fontSize: "15px", lineHeight: 1.7 }}
                      >
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
            <h2
              className="mb-3 animate-fadeUp"
              style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 700 }}
            >
              ¿Listo para lanzar tu sitio web?
            </h2>
            <p
              className="mb-4 mx-auto animate-fadeUp"
              style={{
                fontSize: "18px",
                opacity: 0.95,
                maxWidth: "650px",
                transitionDelay: "100ms",
              }}
            >
              Elige tu plan, dinos el nombre de dominio que quieres y en 24 horas tu hosting y tu .com están activos. Sin burocracia, sin sorpresas.
            </p>
            <div
              className="d-flex flex-wrap gap-3 justify-content-center animate-scaleUp"
              style={{ transitionDelay: "250ms" }}
            >
              <a
                href="#planes"
                className="btn btn-light btn-lg fw-bold px-4 py-3"
                style={{ borderRadius: "50px", color: "#600b56" }}
              >
                Ver planes
              </a>
              <a
                href="https://wa.me/593999739534?text=Hola%2C%20quiero%20contratar%20un%20plan%20de%20hosting%20con%20dominio%20incluido"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline-light btn-lg px-4 py-3"
                style={{ borderRadius: "50px" }}
              >
                <i className="bi bi-whatsapp me-2"></i>
                Contratar por WhatsApp
              </a>
            </div>
            <p className="mt-4 small" style={{ opacity: 0.8 }}>
              Ecuador · Activación en 24 h · Dominio .com incluido · Sin permanencia
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

export default LandingHosting;
