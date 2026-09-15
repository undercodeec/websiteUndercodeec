"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./ServiciosPrimaryFooter.module.css";

const FOOTER_TITLE_LINES = ["¿Hacemos", "algo", "juntos?"];

const sitemap = [
  { label: "Inicio", href: "/" },
  { label: "Sobre nosotros", href: "/nuestra-trayectoria" },
  { label: "Proyectos", href: "/#proyectos" },
  { label: "Servicios", href: "/servicios" },
  { label: "Contacto", href: "/contacto" },
];

const social = [
  { label: "Facebook", href: "https://www.facebook.com/undercodeec", external: true },
  { label: "Instagram", href: "https://www.instagram.com/undercodeec/", external: true },
];

const legal = [
  { label: "Políticas de privacidad", href: "/politicas-playconsole" },
  { label: "Derechos de autor", href: "/politicas-playconsole" },
  { label: "gerencia@undercodeec.com", href: "mailto:gerencia@undercodeec.com", external: true, isEmail: true },
];

const legalSecondary = [
  { label: "Privacidad", href: "/politicas-playconsole", isMini: true },
  { label: "Carreras", href: "/recursos-humanos", isMini: true },
];

const mobileLegal = [
  { label: "Privacidad", href: "/politicas-playconsole" },
];

function FooterLink({ link }) {
  const content = (
    <>
      <span className={styles.linkClip} data-services-footer-link-target>
        <span className={styles.linkLabel}>{link.label}</span>
        <span className={styles.arrowClip} aria-hidden="true">
          <span className={styles.arrow}>-&gt;</span>
        </span>
      </span>
      <span className={styles.linkTrack} aria-hidden="true" data-services-footer-link-track><span /></span>
    </>
  );

  const className = [styles.link, link.isEmail && styles.emailLink, link.isMini && styles.miniLink]
    .filter(Boolean)
    .join(" ");

  if (link.external) {
    return <a className={className} href={link.href} target={link.href.startsWith("http") ? "_blank" : undefined} rel={link.href.startsWith("http") ? "noreferrer" : undefined}>{content}</a>;
  }

  return <Link className={className} href={link.href}>{content}</Link>;
}

function FooterColumn({ title, links, label, secondaryLinks = [], className = "" }) {
  const columnClassName = [styles.column, secondaryLinks.length > 0 && styles.legalColumn, className]
    .filter(Boolean)
    .join(" ");

  return (
    <nav className={columnClassName} aria-label={label}>
      <p><span data-services-footer-heading>{title}</span></p>
      <div className={styles.linkList}>{links.map((link) => <FooterLink key={link.href} link={link} />)}</div>
      {secondaryLinks.length > 0 ? (
        <div className={`${styles.linkList} ${styles.secondaryList}`}>
          {secondaryLinks.map((link) => <FooterLink key={`${link.href}-${link.label}`} link={link} />)}
        </div>
      ) : null}
    </nav>
  );
}

function ContactButton({ mobile = false }) {
  return (
    <div className={`${styles.buttonClip} ${mobile ? styles.mobileButton : styles.desktopButton}`}>
      <Link href="/contacto" className={styles.button} data-services-footer-button>
        <span className={styles.buttonInner}>
          <span className={styles.buttonLabel}>Contáctanos</span>
          <span className={styles.arrowClip} aria-hidden="true"><span className={styles.arrow}>-&gt;</span></span>
        </span>
        <span className={styles.buttonBackground} aria-hidden="true" />
      </Link>
    </div>
  );
}

export default function ServiciosPrimaryFooter() {
  const footerRef = useRef(null);

  useEffect(() => {
    const footer = footerRef.current;
    if (!footer) return undefined;

    gsap.registerPlugin(ScrollTrigger);

    let refreshFrame;
    let preloaderFallback;
    let revealTrigger;
    let removePreloaderDoneListener = () => {};

    const context = gsap.context(() => {
      const titleLines = footer.querySelectorAll("[data-services-footer-title-line]");
      const headings = footer.querySelectorAll("[data-services-footer-heading]");
      const buttons = footer.querySelectorAll("[data-services-footer-button]");
      const linkTargets = footer.querySelectorAll("[data-services-footer-link-target]");
      const linkTracks = footer.querySelectorAll("[data-services-footer-link-track]");

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      gsap.set(titleLines, { yPercent: -101, autoAlpha: 0 });
      gsap.set(headings, { yPercent: -101, autoAlpha: 0 });
      gsap.set(buttons, { yPercent: 101, autoAlpha: 0 });
      gsap.set(linkTargets, { yPercent: 101 });
      gsap.set(linkTracks, { scaleX: 0 });

      let hasRevealed = false;
      let hasArmed = false;
      const revealFooter = () => {
        if (hasRevealed) return;

        hasRevealed = true;

        const revealTimeline = gsap.timeline();
        revealTimeline
          .to(titleLines, {
            yPercent: 0,
            autoAlpha: 1,
            duration: 2,
            ease: "power4.inOut",
            stagger: { each: .05, from: "start" },
          })
          .to(headings, {
            yPercent: 0,
            autoAlpha: 1,
            duration: 1,
            ease: "power4.inOut",
            stagger: { each: .05, from: "random" },
          }, "<")
          .to(buttons, { yPercent: 0, autoAlpha: 1, duration: 1, ease: "power1.out" }, "<")
          .to(linkTargets, { yPercent: 0, duration: 2, ease: "power1.out" }, "<")
          .to(linkTracks, { scaleX: 1, duration: 1, ease: "power1.out" }, "<");
      };

      const armReveal = () => {
        if (hasArmed) return;

        hasArmed = true;
        window.clearTimeout(preloaderFallback);
        removePreloaderDoneListener();
        revealTrigger = ScrollTrigger.create({
          trigger: footer,
          start: "20% bottom",
          once: true,
          onEnter: revealFooter,
        });
        refreshFrame = window.requestAnimationFrame(() => ScrollTrigger.refresh());
      };

      if (document.body.classList.contains("primary-preloading")) {
        window.addEventListener("preloaderDone", armReveal, { once: true });
        removePreloaderDoneListener = () => window.removeEventListener("preloaderDone", armReveal);
        preloaderFallback = window.setTimeout(armReveal, 2500);
      } else {
        armReveal();
      }
    }, footer);

    return () => {
      removePreloaderDoneListener();
      window.clearTimeout(preloaderFallback);
      window.cancelAnimationFrame(refreshFrame);
      revealTrigger?.kill();
      context.revert();
    };
  }, []);

  return (
    <footer ref={footerRef} className={styles.footer} aria-label="Pie de página" data-primary-footer>
      <div className={styles.spacer} />
      <div className={styles.grid}>
        <section className={styles.cta} aria-labelledby="services-footer-title">
          <h2 id="services-footer-title" className={styles.srOnly}>¿Hacemos algo juntos?</h2>
          <div className={styles.ctaGrid}>
            {FOOTER_TITLE_LINES.slice(0, 2).map((line) => (
              <div className={styles.titleReveal} key={line}>
                <span className={styles.titleLine} data-services-footer-title-line>{line}</span>
              </div>
            ))}
            <div className={styles.ctaRow}>
              <div className={styles.titleReveal}>
                <span className={styles.titleLine} data-services-footer-title-line>{FOOTER_TITLE_LINES[2]}</span>
              </div>
              <ContactButton />
            </div>
          </div>
        </section>

        <ContactButton mobile />

        <div className={styles.navigation}>
          <FooterColumn title="Mapa del sitio" label="Mapa del sitio" links={sitemap} />
          <FooterColumn title="Conecta" label="Redes sociales" links={social} />
          <FooterColumn title="Legal" label="Información legal" links={legal} secondaryLinks={legalSecondary} />
          <FooterColumn title="Legal" label="Información legal móvil" links={mobileLegal} className={styles.mobileLegal} />
        </div>
      </div>
      <div className={styles.spacer} />
    </footer>
  );
}
