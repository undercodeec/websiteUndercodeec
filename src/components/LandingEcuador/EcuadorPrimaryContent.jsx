"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { splitAnimatedWords } from "@/components/Marketing/marketingIntroText.mjs";
import styles from "./EcuadorPrimaryContent.module.css";

const metrics = [
  ["100+", "Proyectos entregados"],
  ["24 h", "Presupuesto personalizado"],
  ["SRI", "Facturación electrónica"],
  ["10+", "Años de experiencia"],
];

function AnimatedHeading({ children, className, id }) {
  return (
    <h2 id={id} className={className} aria-label={children}>
      <span aria-hidden="true">
        {splitAnimatedWords(children).map((token, tokenIndex) => {
          if (token.type === "space") return token.value;

          return (
            <span className={styles.headingWord} key={`${token.characters.join("")}-${tokenIndex}`}>
              {token.characters.map((character, characterIndex) => (
                <span className={styles.characterClip} key={`${character}-${characterIndex}`}>
                  <span className={styles.character} data-ecuador-heading-character>
                    {character}
                  </span>
                </span>
              ))}
            </span>
          );
        })}
      </span>
    </h2>
  );
}

function SectionHeading({ number, eyebrow, title, copy, id }) {
  return (
    <header className={styles.sectionHeader}>
      <p className={styles.sectionMeta} data-ecuador-reveal>
        {number} / {eyebrow}
      </p>
      <div className={styles.titleBlend}>
        <AnimatedHeading id={id} className={`primary-heading-b ${styles.sectionTitle}`}>
          {title}
        </AnimatedHeading>
      </div>
      <div className={styles.headingCopy} data-ecuador-reveal>
        <p>{copy}</p>
        <span>{number}</span>
      </div>
    </header>
  );
}

function ActionLink({ href, children, external = false }) {
  const content = <>{children}<span aria-hidden="true">→</span></>;

  if (external) {
    return (
      <a className={styles.action} href={href} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }

  return <Link className={styles.action} href={href}>{content}</Link>;
}

export default function EcuadorPrimaryContent({ faqs, services, plans, includedRows }) {
  const contentRef = useRef(null);

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return undefined;

    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();

    media.add("(prefers-reduced-motion: no-preference)", () => {
      const context = gsap.context(() => {
        const sections = gsap.utils.toArray("[data-ecuador-section]");

        sections.forEach((section) => {
          const characters = section.querySelectorAll("[data-ecuador-heading-character]");
          const revealItems = section.querySelectorAll("[data-ecuador-reveal]");

          gsap.set(characters, { yPercent: 110, autoAlpha: 0 });
          gsap.set(revealItems, { y: 30, autoAlpha: 0 });

          const timeline = gsap.timeline({
            scrollTrigger: {
              trigger: section,
              start: "top 72%",
              once: true,
            },
          });

          timeline
            .to(characters, {
              yPercent: 0,
              autoAlpha: 1,
              duration: 1,
              ease: "power4.inOut",
              stagger: { each: .022, from: "random" },
            })
            .to(revealItems, {
              y: 0,
              autoAlpha: 1,
              duration: .8,
              ease: "power4.out",
              stagger: .07,
            }, .12);
        });
      }, content);

      return () => context.revert();
    });

    return () => media.revert();
  }, []);

  return (
    <div ref={contentRef} className={styles.content}>
      <section className={styles.experience} data-ecuador-section aria-labelledby="experiencia-title">
        <SectionHeading
          number="02"
          eyebrow="Experiencia"
          id="experiencia-title"
          title="Experiencia y atención para tu proyecto."
          copy="Un proceso claro para convertir la necesidad de tu empresa en una presencia digital útil y medible."
        />
        <ul className={styles.metrics}>
          {metrics.map(([value, label]) => (
            <li data-ecuador-reveal key={label}>
              <strong>{value}</strong>
              <span>{label}</span>
            </li>
          ))}
        </ul>
      </section>

      <section id="servicios" className={styles.services} data-ecuador-section aria-labelledby="servicios-title">
        <SectionHeading
          number="03"
          eyebrow="Servicios"
          id="servicios-title"
          title="Servicios digitales para empresas en Ecuador."
          copy="El desarrollo web guía esta landing; las especialidades complementarias cuentan con páginas propias para profundizar en cada necesidad."
        />
        <div className={styles.serviceGrid}>
          {services.map((service, index) => (
            <article className={styles.serviceCard} data-ecuador-reveal key={service.title}>
              <div className={styles.cardMeta}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <span>Undercodeec</span>
              </div>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <ul>
                {service.features.map((feature) => <li key={feature}>{feature}</li>)}
              </ul>
              <ActionLink href={service.href}>{service.linkText}</ActionLink>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.city} data-ecuador-section aria-labelledby="quito-title">
        <SectionHeading
          number="04"
          eyebrow="Cobertura local"
          id="quito-title"
          title="Diseño de Páginas Web en Quito."
          copy="Atención para empresas, profesionales, comercios y emprendimientos de Quito y sus alrededores."
        />
        <div className={styles.cityContent} data-ecuador-reveal>
          <p className={styles.cityLead}>
            Desarrollamos páginas web, landing pages, tiendas online y plataformas adaptadas a cada negocio, con diseño responsive, optimización SEO y herramientas para generar contactos.
          </p>
          <div>
            <p>
              Si buscas una agencia de diseño web en Quito, revisamos contigo el objetivo, los contenidos y las funcionalidades antes de preparar una propuesta. Nuestro desarrollo web se adapta a la operación y las metas comerciales de cada empresa.
            </p>
            <ActionLink href="/contacto/">Contactar a nuestro equipo en Ecuador</ActionLink>
          </div>
        </div>
      </section>

      <section className={styles.city} data-ecuador-section aria-labelledby="guayaquil-title">
        <SectionHeading
          number="05"
          eyebrow="Cobertura local"
          id="guayaquil-title"
          title="Diseño de Páginas Web en Guayaquil."
          copy="Proyectos web remotos para negocios que necesitan captar clientes, vender por internet o digitalizar procesos."
        />
        <div className={styles.cityContent} data-ecuador-reveal>
          <p className={styles.cityLead}>
            Creamos páginas web profesionales, ecommerce, landing pages y soluciones a medida para empresas de Guayaquil y otras ciudades de Ecuador.
          </p>
          <div>
            <p>
              El desarrollo web en Guayaquil se planifica según el modelo comercial, el público, el catálogo y las herramientas de cada proyecto. Coordinamos de forma remota las etapas de contenido, diseño, desarrollo y lanzamiento.
            </p>
            <ActionLink href="#presupuesto">Solicitar presupuesto personalizado</ActionLink>
          </div>
        </div>
      </section>

      <section id="presupuesto" className={styles.pricing} data-ecuador-section aria-labelledby="precios-title">
        <SectionHeading
          number="06"
          eyebrow="Precios"
          id="precios-title"
          title="Precios de Páginas Web en Ecuador."
          copy="Los valores son referenciales de partida. Cada propuesta considera diseño, contenido, funcionalidades, integraciones y alcance."
        />
        <div className={styles.planGrid}>
          {plans.map((plan, index) => {
            const message = encodeURIComponent(`Hola, quisiera solicitar un presupuesto del plan ${plan.name}.`);

            return (
              <article className={styles.plan} data-ecuador-reveal key={plan.name}>
                <p className={styles.planMeta}>{String(index + 1).padStart(2, "0")} / Plan web</p>
                <h3>{plan.name}</h3>
                <p className={styles.price}>Desde <strong>${plan.price}</strong> USD</p>
                {plan.originalPrice && (
                  <p className={styles.previousPrice}>Precio anterior: ${plan.originalPrice} USD.</p>
                )}
                <p className={styles.planDescription}>{plan.description}</p>
                <ul>
                  {plan.features.map((feature) => <li key={feature}>{feature}</li>)}
                </ul>
                <ActionLink href={`https://wa.me/593999739534?text=${message}`} external>
                  Solicitar por WhatsApp
                </ActionLink>
              </article>
            );
          })}
        </div>
        <div className={styles.delivery} data-ecuador-reveal>
          <h3>Tiempos según el alcance del proyecto</h3>
          <ul>
            <li><span>Presupuesto</span> aproximadamente 24 horas.</li>
            <li><span>Landing page</span> puede iniciar desde 48 horas, según alcance y contenidos.</li>
            <li><span>Sitio corporativo</span> normalmente entre 2 y 4 semanas.</li>
            <li><span>Ecommerce, aplicaciones y software</span> según catálogo, integraciones y alcance.</li>
          </ul>
          <p>Para dominio, correos corporativos o una configuración específica, contamos con <Link href="/hosting/">hosting para empresas</Link>.</p>
        </div>
      </section>

      <section className={styles.faq} data-ecuador-section aria-labelledby="faq-title">
        <SectionHeading
          number="07"
          eyebrow="Preguntas frecuentes"
          id="faq-title"
          title="Preguntas sobre páginas web en Ecuador."
          copy="Información directa para evaluar el alcance, los tiempos y los servicios que necesita tu empresa."
        />
        <div className={styles.faqList}>
          {faqs.map((faq, index) => (
            <details data-ecuador-reveal key={faq.question}>
              <summary>
                <span>{String(index + 1).padStart(2, "0")}</span>
                {faq.question}
              </summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className={styles.included} data-ecuador-section aria-labelledby="incluye-title">
        <SectionHeading
          number="08"
          eyebrow="Incluye"
          id="incluye-title"
          title="Qué incluye trabajar con Undercodeec."
          copy="Cada proyecto define sus detalles técnicos y comerciales en una propuesta personalizada."
        />
        <div className={styles.tableWrap} data-ecuador-reveal>
          <table>
            <caption>Características que se definen según el plan y alcance de cada proyecto</caption>
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
        </div>
      </section>

      <section className={styles.contact} data-ecuador-section aria-labelledby="contacto-title">
        <SectionHeading
          number="09"
          eyebrow="Contacto"
          id="contacto-title"
          title="Solicita tu Página Web en Ecuador."
          copy="Trabajamos con empresas, profesionales y emprendimientos de Quito, Guayaquil y otras ciudades del país."
        />
        <div className={styles.contactGrid} data-ecuador-reveal>
          <p>
            Cuéntanos qué necesitas y prepararemos un presupuesto según las características de tu proyecto. También puedes revisar nuestro <Link href="/blog/">blog de tecnología y negocios</Link>.
          </p>
          <div className={styles.contactActions}>
            <ActionLink
              href="https://wa.me/593999739534?text=Hola%2C%20quiero%20solicitar%20un%20presupuesto%20para%20una%20p%C3%A1gina%20web%20en%20Ecuador."
              external
            >
              Solicitar presupuesto por WhatsApp
            </ActionLink>
            <a href="tel:+593999739534">+593 999 739 534</a>
            <a href="mailto:gerencia@undercodeec.com">gerencia@undercodeec.com</a>
          </div>
        </div>
      </section>
    </div>
  );
}
