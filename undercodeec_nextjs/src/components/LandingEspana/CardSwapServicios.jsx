"use client";

import React, {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  useEffect,
  useMemo,
  useRef,
} from "react";
import gsap from "gsap";
import StickyContentSwitch from "@/components/LandingEspana/StickyContentSwitch";
import GlitchTechAnimation from "@/components/LandingEspana/GlitchTechAnimation";
import HorizontalGallery from "@/components/LandingEspana/HorizontalGallery";
/* ═══════════════════════════════════════════════════════════════
 *  CardSwapServicios – perspective card-swap showcase
 *  GSAP timeline engine adapted from the Card_Swap spec to the
 *  project's conventions (JSX + scoped CSS, no shadcn tokens).
 *
 *  Now embedded as the first slide inside StickyContentSwitch.
 *  Additional design components can be added as extra slides.
 * ═══════════════════════════════════════════════════════════════ */

/* ─────────────────────── Card primitives ─────────────────────── */

export const Card = forwardRef(({ customClass, className, ...rest }, ref) => (
  <div
    ref={ref}
    {...rest}
    className={`csw-card ${customClass ?? ""} ${className ?? ""}`.trim()}
  />
));
Card.displayName = "Card";

const makeSlot = (i, distX, distY, total) => ({
  x: i * distX,
  y: -i * distY,
  z: -i * distX * 1.5,
  zIndex: total - i,
});

const placeNow = (el, slot, skew) =>
  gsap.set(el, {
    x: slot.x,
    y: slot.y,
    z: slot.z,
    xPercent: -50,
    yPercent: -50,
    skewY: skew,
    transformOrigin: "center center",
    zIndex: slot.zIndex,
    force3D: true,
  });

export const CardSwap = ({
  width = 500,
  height = 400,
  cardDistance = 60,
  verticalDistance = 70,
  delay = 5000,
  pauseOnHover = false,
  onCardClick,
  skewAmount = 6,
  easing = "elastic",
  children,
}) => {
  const config =
    easing === "elastic"
      ? {
          ease: "back.out(1.4)",
          durDrop: 0.9,
          durMove: 0.9,
          durReturn: 0.9,
          promoteOverlap: 0.7,
          returnDelay: 0.05,
        }
      : {
          ease: "power2.inOut",
          durDrop: 0.6,
          durMove: 0.6,
          durReturn: 0.6,
          promoteOverlap: 0.45,
          returnDelay: 0.15,
        };

  const childArr = useMemo(() => Children.toArray(children), [children]);
  const refs = useMemo(
    () => childArr.map(() => React.createRef()),
    [childArr]
  );
  const order = useRef(Array.from({ length: childArr.length }, (_, i) => i));
  const tlRef = useRef(null);
  const intervalRef = useRef(0);
  const container = useRef(null);

  useEffect(() => {
    const total = refs.length;
    refs.forEach((r, i) => {
      if (r.current) {
        placeNow(r.current, makeSlot(i, cardDistance, verticalDistance, total), skewAmount);
      }
    });

    const swap = () => {
      if (order.current.length < 2) return;
      const [front, ...rest] = order.current;
      const elFront = refs[front].current;
      if (!elFront) return;

      const tl = gsap.timeline();
      tlRef.current = tl;

      tl.to(elFront, {
        y: "+=500",
        duration: config.durDrop,
        ease: config.ease,
      });

      tl.addLabel("promote", `-=${config.durDrop * config.promoteOverlap}`);
      rest.forEach((idx, i) => {
        const el = refs[idx].current;
        if (!el) return;
        const slot = makeSlot(i, cardDistance, verticalDistance, refs.length);
        tl.set(el, { zIndex: slot.zIndex }, "promote");
        tl.to(
          el,
          {
            x: slot.x,
            y: slot.y,
            z: slot.z,
            duration: config.durMove,
            ease: config.ease,
          },
          `promote+=${i * 0.08}`
        );
      });

      const backSlot = makeSlot(refs.length - 1, cardDistance, verticalDistance, refs.length);
      tl.addLabel("return", `promote+=${config.durMove * config.returnDelay}`);
      tl.call(
        () => {
          gsap.set(elFront, { zIndex: backSlot.zIndex });
        },
        undefined,
        "return"
      );

      tl.to(
        elFront,
        {
          x: backSlot.x,
          y: backSlot.y,
          z: backSlot.z,
          duration: config.durReturn,
          ease: config.ease,
        },
        "return"
      );

      tl.call(() => {
        order.current = [...rest, front];
      });
    };

    intervalRef.current = window.setInterval(swap, delay);

    if (pauseOnHover && container.current) {
      const node = container.current;
      const pause = () => {
        tlRef.current?.pause();
        clearInterval(intervalRef.current);
      };
      const resume = () => {
        tlRef.current?.play();
        intervalRef.current = window.setInterval(swap, delay);
      };
      node.addEventListener("mouseenter", pause);
      node.addEventListener("mouseleave", resume);
      return () => {
        node.removeEventListener("mouseenter", pause);
        node.removeEventListener("mouseleave", resume);
        clearInterval(intervalRef.current);
      };
    }

    return () => clearInterval(intervalRef.current);
  }, [cardDistance, verticalDistance, delay, pauseOnHover, skewAmount, easing, refs]);

  const rendered = childArr.map((child, i) =>
    isValidElement(child)
      ? cloneElement(child, {
          key: i,
          ref: refs[i],
          style: { width, height, ...(child.props.style ?? {}) },
          onClick: (e) => {
            child.props.onClick?.(e);
            onCardClick?.(i);
          },
        })
      : child
  );

  return (
    <div
      ref={container}
      className="csw-container"
      style={{ width, height, perspective: "1200px" }}
    >
      <div className="csw-stack">{rendered}</div>
    </div>
  );
};

/* ── Service card data (Spanish) ── */
const servicios = [
  {
    title: "Diseño Web Profesional",
    description: "Webs rápidas que convierten visitas en clientes.",
    image:
      "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?q=80&w=800&auto=format&fit=crop",
  },
  {
    title: "Apps Móviles",
    description: "Aplicaciones nativas para Android e iOS.",
    image:
      "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=800&auto=format&fit=crop",
  },
  {
    title: "Posicionamiento SEO",
    description: "Aparece primero cuando te buscan en Google.",
    image:
      "https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?q=80&w=800&auto=format&fit=crop",
  },
  {
    title: "Software a Medida",
    description: "CRM, ERP y automatización para tu pyme.",
    image:
      "https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=800&auto=format&fit=crop",
  },
];

/* ── Card stack sub-component ── */
const ServiceCardStack = ({ cards, delay }) => (
  <div className="csw-stage">
    <CardSwap
      width={320}
      height={250}
      cardDistance={42}
      verticalDistance={42}
      delay={delay}
      pauseOnHover
      skewAmount={5}
    >
      {cards.map((s, i) => (
        <Card key={i} customClass="csw-service">
          <div className="csw-service-inner">
            <img src={s.image} alt={s.title} className="csw-service-img" />
            <div className="csw-service-shade" />
            <div className="csw-service-text">
              <h3>{s.title}</h3>
              <p>{s.description}</p>
            </div>
          </div>
        </Card>
      ))}
    </CardSwap>
  </div>
);

/* ── Data for the SCS sticky panel (current items) ── */
const scsItems = [
  {
    title: "E-commerce a Medida",
    description: "Tiendas online autogestionables que venden 24/7.",
  },
  {
    title: "Landing Pages",
    description: "Páginas enfocadas que convierten visitas en ventas.",
  },
  {
    title: "Identidad de Marca",
    description: "Diseño que hace memorable y reconocible tu negocio.",
  },
  {
    title: "Soporte y Mantenimiento",
    description: "Tu web siempre rápida, segura y actualizada.",
  },
];

/* ═══════════════════════════════════════════════════════════════
 *  Main section – StickyContentSwitch hosts all slides
 *  ─────────────────────────────────────────────────────────────
 *  To add a new design, place it as a child of StickyContentSwitch
 *  and add a matching entry to scsItems for the sticky heading.
 * ═══════════════════════════════════════════════════════════════ */
const CardSwapServicios = () => {
  return (
    <section className="csw-section">
      <div className="container">
        <StickyContentSwitch items={scsItems}>
          {/* ── Slide 1: CardSwap animation ── */}
          <ServiceCardStack cards={servicios} delay={3000} />

          {/* ── Slide 2: Glitch Tech scroll animation ── */}
          <GlitchTechAnimation />

          {/* ── Slide 3: Horizontal Gallery ── */}
          <HorizontalGallery />

          {/* ── Slide 4: Add next design component here ── */}
          <div className="scs-slide-placeholder">
            <span className="scs-slide-placeholder-icon">+</span>
          </div>
        </StickyContentSwitch>
      </div>

      {/* ═════════════ SCOPED STYLES ═════════════ */}
      <style jsx global>{`
        .csw-section {
          background: #ffffff;
          padding-top: 80px;
          padding-bottom: 80px;
          overflow: hidden;
        }

        /* ── Stage / engine ── */
        .csw-stage {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .csw-container {
          position: relative;
          transform: translateZ(0);
        }
        .csw-stack {
          position: absolute;
          inset: 0;
          transform-style: preserve-3d;
        }
        .csw-card {
          position: absolute;
          top: 50%;
          left: 50%;
          border-radius: 16px;
          border: 1px solid rgba(0, 0, 0, 0.06);
          background: #fff;
          box-shadow: 0 24px 60px rgba(21, 14, 35, 0.28);
          transform-style: preserve-3d;
          will-change: transform;
          backface-visibility: hidden;
          overflow: hidden;
          cursor: pointer;
        }

        /* ── Service card content ── */
        .csw-service-inner {
          position: relative;
          height: 100%;
          width: 100%;
        }
        .csw-service-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.7s ease;
        }
        .csw-card:hover .csw-service-img {
          transform: scale(1.08);
        }
        .csw-service-shade {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            rgba(21, 14, 35, 0.85),
            rgba(21, 14, 35, 0.1) 55%,
            transparent
          );
        }
        .csw-service-text {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          padding: 22px;
          color: #fff;
        }
        .csw-service-text h3 {
          font-size: 20px;
          font-weight: 600;
          margin: 0 0 6px;
        }
        .csw-service-text p {
          font-size: 14px;
          line-height: 1.5;
          color: rgba(255, 255, 255, 0.78);
          margin: 0;
          max-width: 90%;
        }

        /* ── Placeholder slides (replace with real components) ── */
        .scs-slide-placeholder {
          width: 100%;
          height: 100%;
          border: 2px dashed rgba(96, 11, 86, 0.18);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(96, 11, 86, 0.025);
        }
        .scs-slide-placeholder-icon {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: 2px dashed rgba(96, 11, 86, 0.22);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          color: rgba(96, 11, 86, 0.25);
          font-weight: 300;
        }

        @media (max-width: 991px) {
          .csw-stage {
            height: 380px;
          }
        }
        @media (max-width: 575px) {
          .csw-stage {
            height: 340px;
          }
        }
      `}</style>
    </section>
  );
};

export default CardSwapServicios;
