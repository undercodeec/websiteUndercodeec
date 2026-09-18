"use client";

import { FaWhatsapp } from "react-icons/fa";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useAttribution } from "@/components/Attribution/AttributionProvider";
import { useConsent } from "@/components/Consent/ConsentManager";
import { PrimaryOrb } from "@/components/Primary";
import { resolveAttributedWhatsAppUrl } from "@/lib/attribution/whatsapp-client.mjs";
import {
  buildHermesWhatsAppUrl,
  HERMES_WHATSAPP_LINK_PROPS,
  isHermesWhatsAppHiddenPath,
  trackHermesWhatsAppClick,
} from "./config.mjs";

const HermesWhatsAppButton = () => {
  const pathname = usePathname();
  const { buildIntent } = useAttribution();
  const { preferences } = useConsent();
  const buttonRef = useRef(null);
  const dragRef = useRef(null);
  const suppressClickRef = useRef(false);
  const preparingRef = useRef(false);
  const [position, setPosition] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);

  const clampPosition = (x, y, width, height) => ({
    x: Math.min(Math.max(8, x), Math.max(8, window.innerWidth - width - 8)),
    y: Math.min(Math.max(8, y), Math.max(8, window.innerHeight - height - 8)),
  });

  useEffect(() => {
    const keepButtonInViewport = () => {
      if (!position || !buttonRef.current) return;

      const { width, height } = buttonRef.current.getBoundingClientRect();
      setPosition((currentPosition) =>
        currentPosition
          ? clampPosition(currentPosition.x, currentPosition.y, width, height)
          : currentPosition,
      );
    };

    window.addEventListener("resize", keepButtonInViewport);
    return () => window.removeEventListener("resize", keepButtonInViewport);
  }, [position]);

  if (isHermesWhatsAppHiddenPath(pathname)) return null;

  const handlePointerDown = (event) => {
    if (event.button !== undefined && event.button !== 0) return;

    const button = buttonRef.current;
    if (!button) return;

    const { left, top, width, height } = button.getBoundingClientRect();
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      initialX: left,
      initialY: top,
      width,
      height,
      hasMoved: false,
    };
    button.setPointerCapture(event.pointerId);
    setPosition({ x: left, y: top });
  };

  const handlePointerMove = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const distanceX = event.clientX - drag.startX;
    const distanceY = event.clientY - drag.startY;
    if (!drag.hasMoved && Math.hypot(distanceX, distanceY) < 4) return;

    drag.hasMoved = true;
    setIsDragging(true);
    setPosition(
      clampPosition(
        drag.initialX + distanceX,
        drag.initialY + distanceY,
        drag.width,
        drag.height,
      ),
    );
  };

  const finishDragging = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    if (buttonRef.current?.hasPointerCapture(event.pointerId)) {
      buttonRef.current.releasePointerCapture(event.pointerId);
    }
    suppressClickRef.current = drag.hasMoved;
    dragRef.current = null;
    setIsDragging(false);
  };

  const preventNativeDrag = (event) => {
    event.preventDefault();
  };

  const trackClick = async (event) => {
    if (suppressClickRef.current) {
      event.preventDefault();
      suppressClickRef.current = false;
      return;
    }

    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (preparingRef.current) return;

    preparingRef.current = true;
    setIsPreparing(true);

    if (preferences?.analytics && Array.isArray(window.dataLayer)) {
      window.dataLayer.push({
        event: "whatsapp_click",
        source: "hermes_whatsapp_button",
        page_path: pathname || "/",
      });
    }

    if (preferences?.advertising) {
      trackHermesWhatsAppClick(window.fbq, pathname);
    }

    const popup = window.open("about:blank", "_blank");
    if (popup) popup.opener = null;

    try {
      const destination = await resolveAttributedWhatsAppUrl(
        buildHermesWhatsAppUrl(),
        buildIntent(),
      );
      preparingRef.current = false;
      setIsPreparing(false);
      if (popup && !popup.closed) popup.location.replace(destination);
      else window.location.assign(destination);
    } catch {
      const fallback = buildHermesWhatsAppUrl();
      preparingRef.current = false;
      setIsPreparing(false);
      if (popup && !popup.closed) popup.location.replace(fallback);
      else window.location.assign(fallback);
    }
  };

  return (
    <a
      ref={buttonRef}
      href={buildHermesWhatsAppUrl()}
      data-attribution-managed="true"
      {...HERMES_WHATSAPP_LINK_PROPS}
      draggable={false}
      onClick={trackClick}
      onDragStart={preventNativeDrag}
      aria-label="Hablar con Hermes por WhatsApp"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishDragging}
      onPointerCancel={finishDragging}
      aria-busy={isPreparing}
      className={`hermes-whatsapp-button${isDragging ? " is-dragging" : ""}${isPreparing ? " is-preparing" : ""}`}
      style={
        position
          ? { left: position.x, top: position.y, right: "auto", bottom: "auto" }
          : undefined
      }
    >
      <PrimaryOrb className="hermes-whatsapp-orb" color="#25D366" disableOnMobile />
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
          cursor: grab;
          touch-action: none;
          user-select: none;
          -webkit-user-drag: none;
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

        .hermes-whatsapp-button.is-dragging {
          cursor: grabbing;
          transform: none;
          transition: opacity 0.18s ease;
        }

        .hermes-whatsapp-button.is-preparing {
          cursor: wait;
          opacity: 0.78;
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

        @media (max-width: 700px) {
          .hermes-whatsapp-button {
            right: 16px;
            bottom: 82px;
            width: 58px;
            height: 58px;
            visibility: visible;
            pointer-events: auto;
            opacity: 1;
            background:
              radial-gradient(circle at 31% 24%, rgba(255, 255, 255, 0.88) 0 3%, rgba(255, 255, 255, 0.24) 13%, transparent 31%),
              radial-gradient(circle at 74% 78%, rgba(0, 0, 0, 0.3) 0, transparent 56%),
              #25D366;
            box-shadow:
              inset 8px 9px 16px rgba(255, 255, 255, 0.2),
              inset -12px -14px 20px rgba(0, 0, 0, 0.18),
              0 8px 20px rgba(37, 211, 102, 0.34);
          }
        }
      `}</style>
    </a>
  );
};

export default HermesWhatsAppButton;
