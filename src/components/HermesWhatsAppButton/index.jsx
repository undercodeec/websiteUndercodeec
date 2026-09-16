"use client";

import { FaWhatsapp } from "react-icons/fa";
import { usePathname } from "next/navigation";
import { PrimaryOrb } from "@/components/Primary";
import {
  buildHermesWhatsAppUrl,
  HERMES_WHATSAPP_LINK_PROPS,
  isHermesWhatsAppHiddenPath,
  trackHermesWhatsAppClick,
} from "./config.mjs";

const HermesWhatsAppButton = () => {
  const pathname = usePathname();

  if (isHermesWhatsAppHiddenPath(pathname)) return null;

  const trackClick = () => {
    const tracker = typeof window !== "undefined" ? window.fbq : undefined;
    trackHermesWhatsAppClick(tracker, pathname);
  };

  return (
    <a
      href={buildHermesWhatsAppUrl()}
      {...HERMES_WHATSAPP_LINK_PROPS}
      onClick={trackClick}
      aria-label="Hablar con Hermes por WhatsApp"
      className="hermes-whatsapp-button"
    >
      <PrimaryOrb className="hermes-whatsapp-orb" color="#25D366" />
      <FaWhatsapp aria-hidden="true" size={28} />
      <span>Hablar por WhatsApp</span>
      <style jsx global>{`
        .hermes-whatsapp-button {
          position: fixed;
          right: var(--primary-page-gutter, 24px);
          bottom: 88px;
          z-index: 9999;
          display: grid;
          place-items: center;
          width: 64px;
          height: 64px;
          overflow: hidden;
          border: 0;
          border-radius: 50%;
          background: transparent;
          box-shadow: none;
          color: #ffffff;
          text-decoration: none;
          isolation: isolate;
          visibility: hidden;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.18s ease, transform 0.2s ease;
        }

        .hermes-whatsapp-button:has(.hermes-whatsapp-orb > canvas[data-primary-orb-texture-ready="true"]) {
          visibility: visible;
          pointer-events: auto;
          opacity: 1;
        }

        .hermes-whatsapp-orb {
          position: absolute;
          inset: 0;
          z-index: -1;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .hermes-whatsapp-button svg {
          position: relative;
          z-index: 1;
          filter: drop-shadow(0 1px 2px rgba(0, 63, 31, 0.28));
        }

        .hermes-whatsapp-button:hover {
          transform: translateY(-3px);
          color: #ffffff;
        }

        .hermes-whatsapp-button:focus-visible {
          outline: 3px solid #111827;
          outline-offset: 3px;
        }

        .hermes-whatsapp-button span {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }

        @media (max-width: 575px) {
          .hermes-whatsapp-button {
            right: 16px;
            bottom: 82px;
            width: 58px;
            height: 58px;
          }
        }
      `}</style>
    </a>
  );
};

export default HermesWhatsAppButton;
