"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Boxes,
  ClipboardCheck,
  Cpu,
  Fingerprint,
  Lock,
  ReceiptText,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  Users,
} from "lucide-react";
import services from "@/data/DataAnalysis/services.json";
import projects from "@/data/DataAnalysis/projects.json";
import styles from "./SoftwarePrimaryContent.module.css";

const solutionIcons = [Cpu, Users, Boxes, ShoppingBag, ReceiptText];

const securityFeatures = [
  {
    title: "Cifrado de datos",
    description: "Protegemos la información sensible con cifrado AES-256 y conexiones TLS para mantener cada dato bajo control.",
    icon: Lock,
  },
  {
    title: "Autenticación multifactor",
    description: "Añadimos capas de verificación para impedir accesos no autorizados a las operaciones críticas de tu empresa.",
    icon: Fingerprint,
  },
  {
    title: "Cumplimiento normativo",
    description: "Diseñamos cada módulo de acuerdo con las regulaciones de protección de datos y facturación electrónica aplicables.",
    icon: ClipboardCheck,
  },
  {
    title: "Actualizaciones continuas",
    description: "Aplicamos mantenimiento preventivo, parches de seguridad y mejoras para que tu plataforma siga protegida.",
    icon: RefreshCw,
  },
];

const integrations = [
  { name: "Google Cloud", image: "/assets/img/logos/log10.webp", href: "https://cloud.google.com/" },
  { name: "AWS", image: "/assets/img/icons/numbers/2.webp", href: "https://aws.amazon.com/es/" },
  { name: "n8n", image: "/assets/img/logos/log1.webp", href: "https://n8n.io/" },
  { name: "Microsoft Azure", image: "/assets/img/icons/numbers/4.webp", href: "https://azure.microsoft.com/es-es" },
  { name: "Docker", image: "/assets/img/logos/docker.svg", href: "https://www.docker.com/" },
];

const faq = [
  {
    question: "¿Cuánto tiempo toma desarrollar un sistema a medida?",
    answer: "El plazo depende de la complejidad. Un MVP funcional suele estar listo en 4 a 8 semanas, con avances quincenales y validaciones durante todo el proceso.",
  },
  {
    question: "¿Puedo empezar con un módulo básico y ampliarlo después?",
    answer: "Sí. Diseñamos arquitecturas escalables para comenzar por una función crítica —como CRM o facturación— y añadir inventarios, e-commerce o automatizaciones cuando el negocio lo requiera.",
  },
  {
    question: "¿Pueden integrarlo con mis sistemas actuales?",
    answer: "Sí. Conectamos APIs, bases de datos, sistemas contables, CRM, ERP, pasarelas de pago y plataformas de facturación para unificar el flujo de información.",
  },
  {
    question: "¿Cómo manejan el soporte y las actualizaciones?",
    answer: "Ofrecemos mantenimiento preventivo y correctivo, soporte técnico, actualizaciones funcionales y parches de seguridad para acompañar la evolución del sistema.",
  },
  {
    question: "¿Mis datos empresariales estarán seguros?",
    answer: "La seguridad forma parte de la arquitectura: aplicamos cifrado, autenticación multifactor, controles de acceso y buenas prácticas de protección de datos.",
  },
];

function SectionHeading({ number, eyebrow, title, copy, id }) {
  return (
    <header className={styles.sectionHeader} data-software-reveal>
      <p className={styles.sectionMeta}>{number} / {eyebrow}</p>
      <h2 id={id} className={styles.sectionTitle}>{title}</h2>
      {copy && <p className={styles.headerCopy}>{copy}</p>}
    </header>
  );
}

function SoftwareSystemVisual() {
  return (
    <figure className={styles.systemVisual} data-software-reveal>
      <svg className={styles.systemLines} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <path d="M50 50 L19 20 M50 50 L81 20 M50 50 L14 72 M50 50 L86 72 M50 50 L50 88" />
      </svg>
      <span className={`${styles.systemNode} ${styles.nodeCrm}`}>CRM</span>
      <span className={`${styles.systemNode} ${styles.nodeSales}`}>Ventas</span>
      <span className={`${styles.systemNode} ${styles.nodeStock}`}>Inventario</span>
      <span className={`${styles.systemNode} ${styles.nodeBilling}`}>Facturación</span>
      <span className={`${styles.systemNode} ${styles.nodeAutomation}`}>Automatización</span>
      <div className={styles.systemHub}>
        <Cpu aria-hidden="true" />
        <span>Plataforma</span>
      </div>
      <figcaption>Una arquitectura / Todos tus procesos conectados</figcaption>
    </figure>
  );
}

function ExpandableSecurity() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className={styles.securityList} data-software-reveal>
      {securityFeatures.map((feature, index) => {
        const Icon = feature.icon;
        const isOpen = activeIndex === index;
        const contentId = `software-security-${index}`;
        return (
          <article className={styles.securityItem} key={feature.title}>
            <button type="button" onClick={() => setActiveIndex(isOpen ? -1 : index)} aria-expanded={isOpen} aria-controls={contentId}>
              <span className={styles.securityIcon}><Icon aria-hidden="true" /></span>
              <span>{feature.title}</span>
              <span aria-hidden="true">{isOpen ? "−" : "+"}</span>
            </button>
            <div id={contentId} className={styles.securityAnswer} hidden={!isOpen}>
              <p>{feature.description}</p>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function FAQList() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className={styles.faqList}>
      {faq.map((item, index) => {
        const isOpen = activeIndex === index;
        const answerId = `software-faq-${index}`;
        return (
          <article className={styles.faqItem} data-software-reveal key={item.question}>
            <button type="button" aria-expanded={isOpen} aria-controls={answerId} onClick={() => setActiveIndex(isOpen ? -1 : index)}>
              <span className={styles.faqNumber}>{String(index + 1).padStart(2, "0")}</span>
              <span>{item.question}</span>
              <span className={styles.faqSymbol} aria-hidden="true">{isOpen ? "−" : "+"}</span>
            </button>
            <div id={answerId} className={styles.faqAnswer} hidden={!isOpen}>
              <p>{item.answer}</p>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export default function SoftwarePrimaryContent() {
  const surfaceRef = useRef(null);

  useEffect(() => {
    const surface = surfaceRef.current;
    if (!surface) return undefined;
    gsap.registerPlugin(ScrollTrigger);

    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const context = gsap.context(() => {
        gsap.utils.toArray("[data-software-reveal]").forEach((item) => {
          gsap.fromTo(item, { y: 34, autoAlpha: 0 }, {
            y: 0,
            autoAlpha: 1,
            duration: .9,
            ease: "power4.out",
            scrollTrigger: { trigger: item, start: "top 88%", once: true },
          });
        });
      }, surface);
      return () => context.revert();
    });

    return () => media.revert();
  }, []);

  return (
    <div ref={surfaceRef} className={styles.surface}>
      <section className={styles.intro} aria-labelledby="software-intro-title">
        <SectionHeading
          number="02"
          eyebrow="El sistema"
          id="software-intro-title"
          title="Tu operación, convertida en software."
          copy="Diseñamos una plataforma alrededor de la forma en que trabaja tu empresa: clara, conectada y preparada para crecer."
        />
        <SoftwareSystemVisual />
      </section>

      <section className={styles.solutions} aria-labelledby="software-solutions-title">
        <SectionHeading
          number="03"
          eyebrow="Soluciones"
          id="software-solutions-title"
          title="Un sistema para cada proceso."
          copy="Centraliza tareas, información y decisiones en herramientas creadas para tu realidad operativa."
        />
        <div className={styles.solutionGrid}>
          {services.map((service, index) => {
            const Icon = solutionIcons[index] || Cpu;
            return (
              <article className={styles.solutionCard} data-software-reveal key={service.title.trim()}>
                <div className={styles.cardTop}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <Icon aria-hidden="true" />
                </div>
                <div>
                  <h3>{service.title.trim()}</h3>
                  <p>{service.text}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className={styles.security} aria-labelledby="software-security-title">
        <div className={styles.securityIntro} data-software-reveal>
          <p className={styles.sectionMeta}>04 / Seguridad</p>
          <ShieldCheck className={styles.securityMark} aria-hidden="true" />
          <h2 id="software-security-title">Tus datos son parte del diseño.</h2>
          <p>La seguridad no se añade al final. Se integra en la arquitectura, los accesos y cada intercambio de información.</p>
        </div>
        <ExpandableSecurity />
      </section>

      <section className={styles.projects} aria-labelledby="software-projects-title">
        <SectionHeading
          number="05"
          eyebrow="Casos reales"
          id="software-projects-title"
          title="Software que ya está trabajando."
          copy="Productos digitales construidos para resolver operaciones concretas y producir resultados medibles."
        />
        <div className={styles.projectGrid}>
          {projects.map((project, index) => {
            const destination = project.iframeUrl || project.button?.link;
            const hasDestination = destination && destination !== "#";
            return (
              <article className={styles.projectCard} data-software-reveal key={project.tag}>
                <figure className={styles.projectImage}>
                  <Image src={project.image} alt={project.title || project.tag} fill sizes="(max-width: 700px) 94vw, 31vw" />
                  <span>{String(index + 1).padStart(2, "0")}</span>
                </figure>
                <div className={styles.projectInfo}>
                  <p className={styles.projectTag}>{project.tag}</p>
                  <h3>{project.title || project.tag}</h3>
                  <p>{project.text}</p>
                  {hasDestination && <a href={destination} target="_blank" rel="noopener noreferrer">Ver proyecto <span aria-hidden="true">↗</span></a>}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className={styles.integrations} aria-labelledby="software-integrations-title">
        <SectionHeading
          number="06"
          eyebrow="Ecosistema"
          id="software-integrations-title"
          title="Preparado para integrarse."
          copy="Conectamos infraestructura, automatización y despliegue para que la información circule sin fricción."
        />
        <div className={styles.integrationGrid} role="list">
          {integrations.map((integration) => (
            <a className={styles.integrationCard} data-software-reveal role="listitem" href={integration.href} target="_blank" rel="noopener noreferrer" key={integration.name}>
              <span>{integration.name}</span>
              <div><Image src={integration.image} alt="" fill sizes="(max-width: 700px) 40vw, 18vw" /></div>
              <span aria-hidden="true">↗</span>
            </a>
          ))}
        </div>
      </section>

      <section className={styles.faqSection} aria-labelledby="software-faq-title">
        <SectionHeading
          number="07"
          eyebrow="Preguntas frecuentes"
          id="software-faq-title"
          title="Antes de comenzar."
          copy="Respuestas directas sobre alcance, integración, seguridad y evolución de tu nuevo sistema."
        />
        <FAQList />
      </section>
    </div>
  );
}
