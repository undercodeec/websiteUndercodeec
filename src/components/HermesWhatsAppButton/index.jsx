"use client";

import { FaWhatsapp } from "react-icons/fa";
import { useEffect, useRef, useState } from "react";
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
  const buttonRef = useRef(null);
  const dragRef = useRef(null);
  const suppressClickRef = useRef(false);
  const [position, setPosition] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

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

  const trackClick = (event) => {
    if (suppressClickRef.current) {
      event.preventDefault();
      suppressClickRef.current = false;
      return;
    }

    const tracker = typeof window !== "undefined" ? window.fbq : undefined;
    trackHermesWhatsAppClick(tracker, pathname);
  };

  return (
    <a
      ref={buttonRef}
      href={buildHermesWhatsAppUrl()}
      {...HERMES_WHATSAPP_LINK_PROPS}
      draggable={false}
      onClick={trackClick}
      onDragStart={preventNativeDrag}
      aria-label="Hablar con Hermes por WhatsApp"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishDragging}
      onPointerCancel={finishDragging}
      className={`hermes-whatsapp-button${isDragging ? " is-dragging" : ""}`}
      style={
        position
          ? { left: position.x, top: position.y, right: "auto", bottom: "auto" }
          : undefined
      }
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
