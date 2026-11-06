"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, MessageCircle, X } from "lucide-react";
import { buildBlackFridayLandingWhatsAppUrl } from "./config.mjs";
import styles from "./BlackFridayLandingModal.module.css";

const DISMISSAL_KEY = "undercodeec-black-friday-landing-modal-dismissed";
const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "[tabindex]:not([tabindex=\"-1\"])",
].join(", ");

const benefits = [
  "Landing page de una sola sección",
  "Diseño responsive para celulares",
  "Botón flotante de WhatsApp y llamada directa",
  "Formulario de contacto o captura de prospectos",
  "Sección de beneficios del servicio o producto",
  "Dominio .com y hosting básico por 1 año",
  "5 correos corporativos",
  "SEO técnico base",
  "1 año de soporte posterior a la entrega",
];

export default function BlackFridayLandingModal({ isPageReady }) {
  const [hasDismissed, setHasDismissed] = useState(() => {
    if (typeof window === "undefined") return false;

    try {
      return window.sessionStorage.getItem(DISMISSAL_KEY) === "true";
    } catch {
      return false;
    }
  });
  const [isOpen, setIsOpen] = useState(false);
  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);
  const previousFocusRef = useRef(null);

  const dismiss = useCallback(() => {
    setIsOpen(false);
    setHasDismissed(true);

    try {
      window.sessionStorage.setItem(DISMISSAL_KEY, "true");
    } catch {
      // Storage can be unavailable in privacy-restricted browser contexts.
    }
  }, []);

  useEffect(() => {
    if (!isPageReady || hasDismissed) return undefined;

    const openTimer = window.setTimeout(() => setIsOpen(true), 3000);
    return () => window.clearTimeout(openTimer);
  }, [hasDismissed, isPageReady]);

  useEffect(() => {
    if (!isOpen) return undefined;

    previousFocusRef.current = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      previousFocusRef.current?.focus?.();
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") dismiss();

      if (event.key === "Tab") {
        const focusableElements = dialogRef.current?.querySelectorAll(FOCUSABLE_SELECTOR);
        if (!focusableElements?.length) {
          event.preventDefault();
          return;
        }

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        const activeElement = document.activeElement;

        if (event.shiftKey && activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        } else if (!event.shiftKey && activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dismiss, isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className={styles.backdrop}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) dismiss();
      }}
    >
      <section
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="black-friday-title"
        aria-describedby="black-friday-description"
      >
        <button
          ref={closeButtonRef}
          className={styles.closeButton}
          type="button"
          onClick={dismiss}
          aria-label="Cerrar oferta Black Friday"
        >
          <X aria-hidden="true" size={20} />
        </button>

        <p className={styles.eyebrow}>BLACK FRIDAY · OFERTA ESPECIAL</p>
        <h2 id="black-friday-title">Tu landing page profesional por</h2>
        <p className={styles.price}><span>$</span>80,00</p>
        <p id="black-friday-description" className={styles.summary}>
          Todo lo que necesitas para empezar a captar prospectos en línea.
        </p>

        <ul
          className={styles.benefits}
          tabIndex={0}
          aria-label="Beneficios incluidos en la oferta"
        >
          {benefits.map((benefit) => (
            <li key={benefit}>
              <Check aria-hidden="true" size={16} strokeWidth={3} />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>

        <a
          className={styles.whatsappButton}
          href={buildBlackFridayLandingWhatsAppUrl()}
          target="_blank"
          rel="noopener noreferrer"
        >
          <MessageCircle aria-hidden="true" size={22} fill="currentColor" />
          Hablar por WhatsApp
        </a>
      </section>
    </div>
  );
}
