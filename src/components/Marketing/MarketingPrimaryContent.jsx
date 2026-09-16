"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ReactGA from "react-ga4";
import toolImages from "@/data/Startup/clients.json";
import { buildMarketingPayload, isMarketingSubmissionSuccessful } from "./marketingForm.mjs";
import { splitAnimatedWords } from "./marketingIntroText.mjs";
import MarketingCanvas from "./MarketingCanvas";
import RecaptchaEnterpriseScript from "@/components/RecaptchaEnterpriseScript";
import styles from "./MarketingPrimaryContent.module.css";

const journeySteps = [
  {
    number: "01",
    title: "Conecta",
    subtitle: "A tus clientes potenciales",
    description: "Atrae visitas con contenido que genere interés y destaque tu propuesta de valor en redes, blogs o buscadores.",
  },
  {
    number: "02",
    title: "Enamora",
    subtitle: "Haz que se conviertan en leads",
    description: "Genera una conexión auténtica respondiendo a sus dudas y ofreciendo soluciones personalizadas que los acerquen a ti.",
  },
  {
    number: "03",
    title: "Convence",
    subtitle: "Logra la decisión de compra",
    description: "Guía su decisión con contenido educativo, seguimiento inteligente y herramientas que refuercen su confianza, como un CRM.",
  },
  {
    number: "04",
    title: "Sorprende",
    subtitle: "Haz que te recomienden",
    description: "Ofrece un servicio excepcional que supere expectativas, fomente la lealtad y convierta clientes en embajadores de tu marca.",
  },
];

const benefits = [
  "SEO para que te encuentren",
  "Facebook Ads para atraer al instante",
  "Diseño gráfico que impacta",
];

const messageImages = [1, 2, 3, 4, 5].map((number) => (
  `/assets/img/choose_us/sms${number}.webp`
));
const TOOL_CORNER_ICON = "/landing-primary/images/6814c40aae002383aa8ef412_%252B.svg";
const DEFAULT_TOOL_LABEL = "Tecnologías";
const toolNames = [
  "Google Ads",
  "Facebook Ads",
  "Instagram",
  "Yoast",
  "SE Ranking",
  "DinoRANK",
  "BuzzSumo",
  "Ubersuggest",
  "Metricool",
  "Pingdom",
];
const marketingTools = toolImages.map((src, index) => ({ src, name: toolNames[index] }));

const initialFormData = {
  nombre: "",
  empresa: "",
  ruc: "",
  telefono: "",
  email: "",
  presupuesto: "",
  terms: false,
};

function AnimatedHeading({ as: Heading = "h2", children, className, id }) {
  return (
    <Heading id={id} className={className} aria-label={children}>
      <span aria-hidden="true">
        {splitAnimatedWords(children).map((token, tokenIndex) => {
          if (token.type === "space") return token.value;

          return (
            <span className={styles.headingWord} key={`${token.characters.join("")}-${tokenIndex}`}>
              {token.characters.map((character, characterIndex) => (
                <span className={styles.headingCharacterClip} key={`${character}-${characterIndex}`}>
                  <span className={styles.headingCharacter} data-marketing-content-heading-char>
                    {character}
                  </span>
                </span>
              ))}
            </span>
          );
        })}
      </span>
    </Heading>
  );
}

async function executeRecaptcha() {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  const enterprise = typeof window !== "undefined" ? window.grecaptcha?.enterprise : null;

  if (!siteKey || !enterprise) return null;

  try {
    await new Promise((resolve) => enterprise.ready(resolve));
    return await enterprise.execute(siteKey, { action: "MARKETING" });
  } catch (error) {
    console.error("Recaptcha error:", error);
    return null;
  }
}

function MarketingFormDialog({ isOpen, onClose }) {
  const dialogRef = useRef(null);
  const firstInputRef = useRef(null);
  const closeTimerRef = useRef(null);
  const [formData, setFormData] = useState(initialFormData);
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return undefined;

    let focusFrame;

    if (isOpen && !dialog.open) {
      setIsClosing(false);
      dialog.showModal();
      focusFrame = window.requestAnimationFrame(() => firstInputRef.current?.focus());
    }

    return () => {
      window.cancelAnimationFrame(focusFrame);
      window.clearTimeout(closeTimerRef.current);
    };
  }, [isOpen]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus("Verificando y enviando tu solicitud…");

    const recaptchaToken = await executeRecaptcha();
    if (!recaptchaToken) {
      setStatus("No pudimos verificar reCAPTCHA. Intenta nuevamente.");
      setIsSubmitting(false);
      return;
    }

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.undercodeec.com";
      const response = await fetch(`${backendUrl}/api/send-marketing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildMarketingPayload(formData, recaptchaToken)),
      });
      const data = await response.json().catch(() => ({}));

      if (isMarketingSubmissionSuccessful(response.ok, data)) {
        setStatus("Tu solicitud fue enviada correctamente.");
        setFormData(initialFormData);
      } else {
        setStatus(data.error || data.message || "El servidor no pudo procesar la solicitud.");
      }
    } catch (error) {
      console.error("Marketing form error:", error);
      setStatus("Ocurrió un error de red. Intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const requestClose = () => {
    const dialog = dialogRef.current;
    if (!dialog?.open || isClosing) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      dialog.close();
      return;
    }

    setIsClosing(true);
    window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = window.setTimeout(() => dialog.close(), 220);
  };

  const handleNativeClose = () => {
    window.clearTimeout(closeTimerRef.current);
    setIsClosing(false);
    setStatus("");
    onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      className={`${styles.dialog} ${isClosing ? styles.dialogClosing : ""}`}
      aria-labelledby="marketing-form-title"
      onClose={handleNativeClose}
      onCancel={(event) => {
        event.preventDefault();
        requestClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) requestClose();
      }}
    >
      <div className={styles.dialogPanel}>
        <header className={styles.dialogHeader}>
          <p>Solicitud de marketing</p>
          <button type="button" onClick={requestClose} aria-label="Cerrar formulario">×</button>
        </header>

        <div className={styles.dialogIntro}>
          <h2 id="marketing-form-title">¿En qué podemos ayudarte?</h2>
          <p>Cuéntanos sobre tu negocio y el objetivo que quieres alcanzar.</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label>
            <span>Nombre</span>
            <input ref={firstInputRef} type="text" name="nombre" value={formData.nombre} onChange={handleChange} autoComplete="name" required />
          </label>
          <label>
            <span>Empresa</span>
            <input type="text" name="empresa" value={formData.empresa} onChange={handleChange} autoComplete="organization" required />
          </label>
          <label>
            <span>Identificación fiscal</span>
            <input type="text" name="ruc" value={formData.ruc} onChange={handleChange} inputMode="numeric" required />
          </label>
          <label>
            <span>Teléfono</span>
            <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} autoComplete="tel" required />
          </label>
          <label className={styles.formWide}>
            <span>Email</span>
            <input type="email" name="email" value={formData.email} onChange={handleChange} autoComplete="email" required />
          </label>
          <label className={styles.formWide}>
            <span>Presupuesto u objetivo</span>
            <textarea name="presupuesto" value={formData.presupuesto} onChange={handleChange} rows={4} required />
          </label>

          <label className={`${styles.terms} ${styles.formWide}`}>
            <input type="checkbox" name="terms" checked={formData.terms} onChange={handleChange} required />
            <span>
              Acepto los <Link href="/politicas-playconsole">términos y condiciones</Link>.
            </span>
          </label>

          <div className={`${styles.formActions} ${styles.formWide}`}>
            <button type="submit" disabled={isSubmitting}>
              <span>{isSubmitting ? "Enviando" : "Enviar solicitud"}</span>
              <span aria-hidden="true">→</span>
            </button>
            <p role="status" aria-live="polite">{status}</p>
          </div>
        </form>
      </div>
    </dialog>
  );
}

export default function MarketingPrimaryContent() {
  const surfaceRef = useRef(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTool, setActiveTool] = useState(DEFAULT_TOOL_LABEL);

  useEffect(() => {
    const surface = surfaceRef.current;
    if (!surface) return undefined;

    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();

    media.add("(prefers-reduced-motion: no-preference)", () => {
      const context = gsap.context(() => {
        surface.querySelectorAll("[data-marketing-content-section]").forEach((section) => {
          const characters = section.querySelectorAll("[data-marketing-content-heading-char]");
          const revealItems = section.querySelectorAll("[data-marketing-content-reveal]");
          const visual = section.querySelector("[data-marketing-content-visual]");

          gsap.set(characters, { yPercent: 110, autoAlpha: 0 });
          gsap.set(revealItems, { y: 36, autoAlpha: 0 });
          if (visual) gsap.set(visual, { clipPath: "inset(0 0 100% 0)" });

          const timeline = gsap.timeline({
            scrollTrigger: {
              trigger: section,
              start: "top 78%",
              once: true,
            },
          });

          if (characters.length) {
            timeline.to(characters, {
              yPercent: 0,
              autoAlpha: 1,
              duration: 1,
              ease: "power4.inOut",
              stagger: { each: .022, from: "random" },
            });
          }

          if (revealItems.length) {
            timeline.to(revealItems, {
              y: 0,
              autoAlpha: 1,
              duration: .85,
              ease: "power4.out",
              stagger: .07,
            }, characters.length ? .1 : 0);
          }

          if (visual) {
            timeline.to(visual, {
              clipPath: "inset(0 0 0% 0)",
              duration: 1.1,
              ease: "power4.inOut",
            }, .08);
          }
        });

        const floatingItems = surface.querySelectorAll("[data-marketing-content-floating]");
        gsap.to(floatingItems, {
          y: -10,
          duration: 2.5,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          stagger: .35,
        });

        const messages = surface.querySelectorAll("[data-marketing-content-message]");
        if (messages.length) {
          const messageTimeline = gsap.timeline({ repeat: -1, repeatDelay: .8 });
          gsap.set(messages, { y: 18, autoAlpha: 0 });
          messages.forEach((message, index) => {
            messageTimeline.to(message, {
              y: 0,
              autoAlpha: 1,
              duration: .38,
              ease: "power3.out",
            }, index * .28);
          });
          messageTimeline.to(messages, {
            y: -8,
            autoAlpha: 0,
            duration: .4,
            ease: "power2.in",
          }, "+=3");
        }
      }, surface);

      return () => context.revert();
    });

    return () => media.revert();
  }, []);

  const openForm = () => {
    ReactGA.event({
      category: "Interacción",
      action: "Click en botón",
      label: "Descubre cómo hacerlo",
    });
    setIsFormOpen(true);
  };

  return (
    <>
      <RecaptchaEnterpriseScript />
    <div ref={surfaceRef} className={styles.surface}>
      <section className={styles.journey} data-marketing-content-section aria-labelledby="marketing-journey-title">
        <header className={styles.sectionHeader}>
          <p className={styles.sectionMeta} data-marketing-content-reveal>03 / Estrategia inbound</p>
          <AnimatedHeading id="marketing-journey-title" className={styles.sectionTitle}>
            ¿Cuál es el camino?
          </AnimatedHeading>
          <p className={styles.sectionIndex} data-marketing-content-reveal>04 pasos</p>
        </header>

        <ol className={styles.journeyGrid}>
          {journeySteps.map((step) => (
            <li className={styles.journeyStep} data-marketing-content-reveal key={step.number}>
              <span className={styles.stepNumber}>{step.number}</span>
              <div className={styles.stepVisual} aria-hidden="true">
                <MarketingCanvas scene={step.number} />
              </div>
              <div className={styles.stepContent}>
                <h3>{step.title}</h3>
                <p className={styles.stepSubtitle}>{step.subtitle}</p>
                <p className={styles.stepDescription}>{step.description}</p>
              </div>
              <span className={styles.stepCorner} aria-hidden="true">+</span>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.conversion} data-marketing-content-section aria-labelledby="marketing-conversion-title">
        <header className={styles.conversionHeader}>
          <p className={styles.sectionMeta} data-marketing-content-reveal>04 / Conversión</p>
          <AnimatedHeading id="marketing-conversion-title" className={styles.conversionTitle}>
            Alguien está buscando lo que ofreces.
          </AnimatedHeading>
          <p className={styles.sectionIndex} data-marketing-content-reveal>Momento ideal</p>
        </header>

        <div className={styles.conversionGrid}>
          <div className={styles.conversionCopy}>
            <p className={styles.conversionLead} data-marketing-content-reveal>
              Solo necesita el empujón perfecto . ¿Sabes cómo aparecer justo en el momento ideal?
            </p>
            <p className={styles.combination} data-marketing-content-reveal>
              Tú necesitas combinar <strong>Inbound Marketing + Publicidad Estratégica</strong>
            </p>
            <ul className={styles.benefits} data-marketing-content-reveal>
              {benefits.map((benefit, index) => (
                <li key={benefit}><span>{String(index + 1).padStart(2, "0")}</span>{benefit}</li>
              ))}
            </ul>
            <div className={styles.proof} data-marketing-content-reveal>
              <Image src="/assets/img/choose_us/google reviewsvg.webp" alt="Valoraciones de clientes en Google" width={420} height={135} />
              <p>Es así como esta página llegó hasta ti 😉</p>
            </div>
            <button className={styles.primaryAction} type="button" onClick={openForm} data-marketing-content-reveal>
              <span>Descubre cómo hacerlo</span><span aria-hidden="true">→</span>
            </button>
          </div>

          <figure className={styles.conversionVisual} data-marketing-content-visual>
            <span className={`${styles.corner} ${styles.cornerTopLeft}`} aria-hidden="true">+</span>
            <span className={`${styles.corner} ${styles.cornerTopRight}`} aria-hidden="true">+</span>
            <span className={`${styles.corner} ${styles.cornerBottomLeft}`} aria-hidden="true">+</span>
            <span className={`${styles.corner} ${styles.cornerBottomRight}`} aria-hidden="true">+</span>
            <div className={styles.camera}>
              <Image src="/assets/img/choose_us/manosinsta.webp" alt="Vista de una campaña de contenido para redes sociales" fill sizes="(max-width: 700px) 88vw, 42vw" />
            </div>
            <div className={`${styles.floatingIcon} ${styles.likeIcon}`} data-marketing-content-floating aria-hidden="true">
              <Image src="/assets/img/choose_us/iconlike.webp" alt="" fill sizes="5rem" />
            </div>
            <div className={`${styles.floatingIcon} ${styles.loveIcon}`} data-marketing-content-floating aria-hidden="true">
              <Image src="/assets/img/choose_us/iconlove.webp" alt="" fill sizes="5rem" />
            </div>
            <div className={`${styles.floatingIcon} ${styles.instagramIcon}`} data-marketing-content-floating aria-hidden="true">
              <Image src="/assets/img/choose_us/iconisntagram.webp" alt="" fill sizes="5rem" />
            </div>
            <div className={styles.messageStack} aria-hidden="true">
              {messageImages.map((message, index) => (
                <div className={styles.message} data-marketing-content-message key={message}>
                  <Image src={message} alt="" fill sizes="9rem" />
                  <span>{String(index + 1).padStart(2, "0")}</span>
                </div>
              ))}
            </div>
            <figcaption>Contenido / Audiencias / Resultados</figcaption>
          </figure>
        </div>
      </section>

      <section className={styles.toolkit} data-marketing-content-section aria-labelledby="marketing-tools-title">
        <header className={styles.toolsHeader} data-marketing-content-reveal>
          <h2 id="marketing-tools-title">Nuestras herramientas</h2>
          <p aria-live="polite">{activeTool}</p>
        </header>

        <div className={styles.toolGrid} role="list" aria-label="Plataformas utilizadas en nuestros servicios de marketing">
          {marketingTools.map((tool) => (
            <div
              className={styles.toolCard}
              role="listitem"
              tabIndex={0}
              aria-label={tool.name}
              data-marketing-content-reveal
              key={tool.name}
              onPointerEnter={() => setActiveTool(tool.name)}
              onPointerLeave={() => setActiveTool(DEFAULT_TOOL_LABEL)}
              onFocus={() => setActiveTool(tool.name)}
              onBlur={() => setActiveTool(DEFAULT_TOOL_LABEL)}
            >
              <div className={styles.toolLogo}>
                <Image src={tool.src} alt={tool.name} fill sizes="(max-width: 700px) 40vw, 18vw" />
              </div>
              <div className={styles.toolFrame} aria-hidden="true">
                <Image className={`${styles.toolCorner} ${styles.toolCornerTopLeft}`} src={TOOL_CORNER_ICON} alt="" width={20} height={20} />
                <Image className={`${styles.toolCorner} ${styles.toolCornerTopRight}`} src={TOOL_CORNER_ICON} alt="" width={20} height={20} />
                <Image className={`${styles.toolCorner} ${styles.toolCornerBottomLeft}`} src={TOOL_CORNER_ICON} alt="" width={20} height={20} />
                <Image className={`${styles.toolCorner} ${styles.toolCornerBottomRight}`} src={TOOL_CORNER_ICON} alt="" width={20} height={20} />
                <span className={styles.toolBorder} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <MarketingFormDialog isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
    </div>
    </>
  );
}
