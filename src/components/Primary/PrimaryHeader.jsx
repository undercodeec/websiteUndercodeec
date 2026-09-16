"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import PrimaryHamburgerButton from "./PrimaryHamburgerButton";
import styles from "./PrimaryHeader.module.css";

const services = [
  { href: "/aplicaciones-moviles", label: "Aplicaciones móviles", badge: "Nuevo" },
  { href: "/marketing-para-tu-negocio", label: "Marketing para tu negocio.", badge: "Hot" },
  { href: "/software-para-tu-negocio", label: "Software para tu negocio" },
];

const menuLinks = [
  { href: "/nuestra-trayectoria", label: "Nuestra trayectoria" },
  { href: "/blog", label: "Blog" },
  { href: "/contacto", label: "Contáctanos" },
];

const mobileHeaderLinks = [
  { href: "/", label: "Inicio" },
  { href: "/servicios", label: "Servicios" },
  ...services,
  { href: "/#reserva_agenda", label: "Agendar reunión" },
];

function StaggerText({ text }) {
  const characters = Array.from(text);

  return (
    <span className={styles.staggerText} aria-hidden="true">
      {characters.map((character, index) => (
        <span
          className={styles.character}
          key={`${character}-${index}`}
          style={{ "--character-order": Math.floor(Math.abs(Math.sin((index + 1) * 12.9898)) * characters.length) }}
        >
          {character === " " ? "\u00a0" : character}
        </span>
      ))}
    </span>
  );
}

function Arrow() {
  return (
    <span className={styles.arrowClip} aria-hidden="true">
      <span className={styles.arrow}>-&gt;</span>
    </span>
  );
}

function UnderlineLink({ href, label, badge, onClick, current = false, tabIndex, menuLink = false }) {
  return (
    <Link
      href={href}
      className={`${styles.pageLink} ${menuLink ? styles.menuLink : ""}`}
      onClick={onClick}
      aria-label={label}
      aria-current={current ? "page" : undefined}
      tabIndex={tabIndex}
    >
      <span className={styles.linkClip}>
        <span className={styles.linkLabel}>
          <StaggerText text={label} />
          {badge && <span className={styles.badge}>{badge}</span>}
        </span>
        <Arrow />
      </span>
      <span className={styles.linkTrack} aria-hidden="true"><span /></span>
    </Link>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M13.9 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.3-1.5 1.6-1.5h1.7V3.6c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.4-4 4.1v2.3H8v3.1h2.8v8h3.1Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 22 22" aria-hidden="true">
      <path d="M17.24.94H4.88A4.13 4.13 0 0 0 .75 5.07v12.37a4.13 4.13 0 0 0 4.13 4.12h12.36a4.13 4.13 0 0 0 4.13-4.12V5.07A4.13 4.13 0 0 0 17.24.94Zm-6.18 16.49a6.18 6.18 0 1 1 0-12.36 6.18 6.18 0 0 1 0 12.36Zm6.7-11.33a1.55 1.55 0 1 1 0-3.1 1.55 1.55 0 0 1 0 3.1Z" />
      <path d="M11.06 15.37a4.12 4.12 0 1 0 0-8.25 4.12 4.12 0 0 0 0 8.25Z" />
    </svg>
  );
}

export default function PrimaryHeader() {
  const pathname = usePathname();
  const [isMenuOpen, setMenuOpen] = useState(false);
  const closeTimerRef = useRef(null);
  const menuRef = useRef(null);
  const menuButtonRef = useRef(null);

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const closeMenu = useCallback(() => {
    clearCloseTimer();
    setMenuOpen(false);
  }, [clearCloseTimer]);

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key !== "Escape" || !isMenuOpen) return;
      closeMenu();
      menuButtonRef.current?.focus();
    };

    const closeOnOutsidePointer = (event) => {
      if (isMenuOpen && !menuRef.current?.contains(event.target)) closeMenu();
    };

    window.addEventListener("keydown", closeOnEscape);
    window.addEventListener("pointerdown", closeOnOutsidePointer);
    return () => {
      clearCloseTimer();
      window.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("pointerdown", closeOnOutsidePointer);
    };
  }, [clearCloseTimer, closeMenu, isMenuOpen]);

  const scheduleClose = () => {
    if (window.matchMedia("(max-width: 991px)").matches || !isMenuOpen) return;
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(closeMenu, 2000);
  };

  return (
    <header className={styles.hud} aria-label="Cabecera de Undercodeec">
      <div className={styles.frame}>
        <div className={styles.brandWrap}>
          <Link href="/" className={styles.brand} aria-label="Undercodeec — Inicio">
            <Image
              src="/assets/img/undercode-logo.png"
              alt="Undercodeec"
              width={56}
              height={56}
              priority
            />
          </Link>
        </div>

        <nav className={styles.topNav} aria-label="Navegación principal">
          <div className={styles.desktopLink}>
            <UnderlineLink href="/" label="Inicio" current={pathname === "/"} />
          </div>

          <div className={`${styles.desktopLink} ${styles.servicesMenu}`}>
            <UnderlineLink
              href="/servicios"
              label="Servicios"
              current={pathname === "/servicios" || services.some(({ href }) => pathname?.startsWith(href))}
            />
            <div className={styles.servicesDropdown} aria-label="Submenú de servicios">
              {services.map(({ href, label, badge }) => (
                <UnderlineLink
                  key={href}
                  href={href}
                  label={label}
                  badge={badge}
                  menuLink
                  current={pathname?.startsWith(href)}
                />
              ))}
            </div>
          </div>

          <a href="/#reserva_agenda" className={styles.cta} aria-label="Agendar reunión">
            <span className={styles.ctaClip}><StaggerText text="Agendar reunión" /></span>
            <Arrow />
          </a>
        </nav>

        <div
          ref={menuRef}
          className={`${styles.menuOverlay} ${isMenuOpen ? styles.menuOverlayOpen : ""}`}
          onMouseEnter={clearCloseTimer}
          onMouseLeave={scheduleClose}
        >
            <div className={styles.menuContent} id="primary-navigation-menu" aria-hidden={!isMenuOpen}>
            <nav className={styles.menuLinks} aria-label="Navegación secundaria">
              {mobileHeaderLinks.map(({ href, label, badge }) => (
                <div className={`${styles.menuLinkWrap} ${styles.mobileOnlyMenuLink}`} key={href}>
                  <UnderlineLink
                    href={href}
                    label={label}
                    badge={badge}
                    menuLink
                    current={href === "/" ? pathname === "/" : pathname?.startsWith(href)}
                    onClick={closeMenu}
                    tabIndex={isMenuOpen ? 0 : -1}
                  />
                </div>
              ))}
              {menuLinks.map(({ href, label }) => (
                <div className={styles.menuLinkWrap} key={href}>
                  <UnderlineLink
                    href={href}
                    label={label}
                    menuLink
                    onClick={closeMenu}
                    tabIndex={isMenuOpen ? 0 : -1}
                  />
                </div>
              ))}
            </nav>

            <div className={styles.socials} aria-label="Redes sociales">
              <a
                href="https://www.facebook.com/undercodeec"
                className={styles.socialLink}
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                tabIndex={isMenuOpen ? 0 : -1}
              >
                <FacebookIcon />
              </a>
              <a
                href="https://www.instagram.com/undercodeec/"
                className={styles.socialLink}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                tabIndex={isMenuOpen ? 0 : -1}
              >
                <InstagramIcon />
              </a>
            </div>

          </div>

          <PrimaryHamburgerButton
            buttonRef={menuButtonRef}
            isOpen={isMenuOpen}
            onToggle={() => {
              clearCloseTimer();
              setMenuOpen((value) => !value);
            }}
          />
        </div>
      </div>
    </header>
  );
}
