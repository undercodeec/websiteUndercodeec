"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Code2, Layers3, MonitorSmartphone, PenTool } from "lucide-react";
import TrajectoryPhilosophyCanvas from "./TrajectoryPhilosophyCanvas";
import TrajectoryPrincipleCanvas from "./TrajectoryPrincipleCanvas";
import styles from "./TrajectoryPrimaryContent.module.css";

const principles = [
  ["01", "Soluciones a medida", "Cada proyecto parte del contexto, las personas y los objetivos reales del negocio."],
  ["02", "Decisiones honestas", "Priorizamos lo que genera valor, con alcances claros y tecnología sostenible."],
  ["03", "Soporte continuo", "Acompañamos cada solución después de publicarla para que siga evolucionando."],
];

const capabilities = [
  { title: "Diseño web", description: "Sitios modernos, rápidos y construidos alrededor de una identidad reconocible.", icon: MonitorSmartphone },
  { title: "Aplicaciones móviles", description: "Productos intuitivos para iOS y Android, preparados para crecer.", icon: Layers3 },
  { title: "E-commerce", description: "Experiencias de compra conectadas con pagos, inventario y operación.", icon: PenTool },
  { title: "Software a medida", description: "Sistemas que automatizan procesos y centralizan decisiones importantes.", icon: Code2 },
];

function SectionHeading({ number, eyebrow, title, copy, id }) {
  return (
    <header className={styles.sectionHeader} data-trajectory-reveal>
      <p className={styles.sectionMeta}>{number} / {eyebrow}</p>
      <h2 id={id} className={styles.sectionTitle}>{title}</h2>
      {copy && <p className={styles.headerCopy}>{copy}</p>}
    </header>
  );
}

function AnimatedNumber({ value, suffix = "", duration = 1800 }) {
  const numberRef = useRef(null);
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const element = numberRef.current;
    if (!element) return undefined;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frameId = null;

    if (reduceMotion) {
      frameId = window.requestAnimationFrame(() => setDisplayValue(value));
      return () => window.cancelAnimationFrame(frameId);
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      const startedAt = performance.now();

      const update = (now) => {
        const progress = Math.min(1, (now - startedAt) / duration);
        const eased = 1 - Math.pow(1 - progress, 4);
        setDisplayValue(Math.round(value * eased));
        if (progress < 1) frameId = window.requestAnimationFrame(update);
      };

      frameId = window.requestAnimationFrame(update);
    }, { threshold: .35 });

    observer.observe(element);
    return () => {
      observer.disconnect();
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, [duration, value]);

  return (
    <strong ref={numberRef} aria-label={`${value}${suffix}`}>
      <span aria-hidden="true">{displayValue}{suffix}</span>
    </strong>
  );
}

export default function TrajectoryPrimaryContent() {
  const surfaceRef = useRef(null);

  useEffect(() => {
    const surface = surfaceRef.current;
    if (!surface) return undefined;
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();

    media.add("(prefers-reduced-motion: no-preference)", () => {
      const context = gsap.context(() => {
        gsap.utils.toArray("[data-trajectory-reveal]").forEach((item) => {
          gsap.fromTo(item, { y: 36, autoAlpha: 0 }, {
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
      <section className={styles.story} aria-labelledby="trajectory-story-title">
        <SectionHeading
          number="02"
          eyebrow="Desde 2018"
          id="trajectory-story-title"
          title="Aprendemos construyendo."
          copy="Nuestra trayectoria se mide en productos publicados, problemas resueltos y relaciones que continúan después de cada entrega."
        />
        <div className={styles.storyGrid}>
          <article className={styles.origin} data-trajectory-reveal>
            <span>2018</span>
            <h3>El punto de partida.</h3>
            <p>Nacimos con una idea sencilla: acercar diseño y tecnología útil a negocios que necesitan avanzar.</p>
          </article>
          <div className={styles.storyLine} aria-hidden="true"><span /></div>
          <article className={styles.today} data-trajectory-reveal>
            <span>HOY</span>
            <h3>Un estudio digital integral.</h3>
            <p>Combinamos estrategia, diseño y desarrollo para crear sitios web, aplicaciones, software y experiencias conectadas.</p>
          </article>
        </div>
      </section>

      <section className={styles.philosophy} aria-labelledby="trajectory-philosophy-title">
        <div className={styles.philosophyCopy} data-trajectory-reveal>
          <p className={styles.sectionMeta}>03 / Filosofía</p>
          <h2 id="trajectory-philosophy-title">La calidad está en cada decisión.</h2>
          <p>Cada proyecto es una oportunidad para crear una solución innovadora, eficiente y alineada con objetivos concretos. Diseñamos con intención y desarrollamos pensando en el largo plazo.</p>
        </div>
        <figure
          className={styles.philosophyMedia}
          data-trajectory-reveal
          aria-label="Ciclo de trabajo de estrategia, diseño, desarrollo y control de calidad"
        >
          <div className={styles.philosophyCanvas} aria-hidden="true">
            <TrajectoryPhilosophyCanvas />
          </div>
          <figcaption>Estrategia / Diseño / Desarrollo / Calidad</figcaption>
        </figure>
        <div className={styles.principleGrid}>
          {principles.map(([number, title, description]) => (
            <article className={styles.principle} data-trajectory-reveal key={title}>
              <span>{number}</span>
              <div className={styles.principleVisual} aria-hidden="true">
                <TrajectoryPrincipleCanvas scene={number} />
              </div>
              <div className={styles.principleCopy}><h3>{title}</h3><p>{description}</p></div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.capabilities} aria-labelledby="trajectory-capabilities-title">
        <SectionHeading
          number="04"
          eyebrow="Lo que hacemos"
          id="trajectory-capabilities-title"
          title="Distintas disciplinas. Una sola visión."
          copy="Unimos capacidades que normalmente trabajan separadas para construir experiencias consistentes de principio a fin."
        />
        <div className={styles.capabilityGrid}>
          {capabilities.map(({ title, description, icon: Icon }, index) => (
            <article className={styles.capability} data-trajectory-reveal key={title}>
              <div><span>{String(index + 1).padStart(2, "0")}</span><Icon aria-hidden="true" /></div>
              <div><h3>{title}</h3><p>{description}</p></div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.impact} aria-labelledby="trajectory-impact-title">
        <SectionHeading
          number="05"
          eyebrow="Impacto"
          id="trajectory-impact-title"
          title="El recorrido en números."
          copy="Cada cifra representa una colaboración, una entrega y conocimiento acumulado que llevamos al siguiente desafío."
        />
        <div className={styles.numberGrid}>
          <article data-trajectory-reveal><AnimatedNumber value={2018} /><span>Año de inicio</span></article>
          <article data-trajectory-reveal><AnimatedNumber value={100} suffix="+" /><span>Proyectos completados</span></article>
          <article data-trajectory-reveal><AnimatedNumber value={265} /><span>Clientes atendidos</span></article>
        </div>
      </section>

    </div>
  );
}
