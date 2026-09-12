"use client";

import { FaWhatsapp } from "react-icons/fa";
import { usePathname } from "next/navigation";
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
      <FaWhatsapp aria-hidden="true" size={26} />
      <span>Hablar por WhatsApp</span>
      <style jsx>{`
        .hermes-whatsapp-button {
          position: fixed;
          right: 24px;
          bottom: 24px;
          z-index: 9999;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          min-height: 58px;
          padding: 0 20px;
          border: 2px solid #ffffff;
          border-radius: 999px;
          background: #075e54;
          box-shadow: 0 8px 24px rgba(7, 94, 84, 0.32);
          color: #ffffff;
          font-size: 14px;
          font-weight: 700;
          line-height: 1;
          text-decoration: none;
          transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
        }

        .hermes-whatsapp-button:hover {
          transform: translateY(-3px);
          background: #064b43;
          box-shadow: 0 12px 28px rgba(7, 94, 84, 0.4);
          color: #ffffff;
        }

        .hermes-whatsapp-button:focus-visible {
          outline: 3px solid #111827;
          outline-offset: 3px;
        }

        @media (max-width: 575px) {
          .hermes-whatsapp-button {
            right: 16px;
            bottom: 16px;
            width: 58px;
            justify-content: center;
            padding: 0;
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
        }
      `}</style>
    </a>
  );
};

export default HermesWhatsAppButton;
