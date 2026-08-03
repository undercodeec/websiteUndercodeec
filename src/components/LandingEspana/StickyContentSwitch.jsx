"use client";

import React, { Children, useEffect, useRef, useState } from "react";

/* ═══════════════════════════════════════════════════════════════
 *  StickyContentSwitch
 *  ─────────────────────────────────────────────────────────────
 *  "Pin the left-side heading in place while the right-side
 *   content scrolls past. As each new slide reaches the center,
 *   update the heading text to match."
 *
 *  Props
 *  ─────
 *  items    — [{ title, description }]  for the sticky panel
 *  children — arbitrary slide content (components, images, etc.)
 *
 *  Self-contained (internal scroll) so it lives neatly inside a
 *  column, following the project's ScrollShapesDemo pattern.
 * ═══════════════════════════════════════════════════════════════ */

const StickyContentSwitch = ({ items = [], children }) => {
  const scrollRef = useRef(null);
  const itemRefs = useRef([]);
  const [active, setActive] = useState(0);

  const slides = Children.toArray(children);

  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(Number(entry.target.dataset.idx));
          }
        });
      },
      { root, threshold: 0.5, rootMargin: "-35% 0px -35% 0px" }
    );

    itemRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [slides.length]);

  return (
    <div className="scs-widget">
      {/* Pinned heading (does not scroll) */}
      <div className="scs-pinned">
        <span className="scs-eyebrow">Casos de éxito</span>
        <h3 className="scs-title">{items[active]?.title}</h3>
        <p className="scs-desc">{items[active]?.description}</p>
        <div className="scs-progress">
          {items.map((_, i) => (
            <span
              key={i}
              className={`scs-dot${i === active ? " scs-dot--on" : ""}`}
            />
          ))}
        </div>
        <span className="scs-hint">Desplaza ↓</span>
      </div>

      {/* Scrolling slides — each child becomes a snap-target */}
      <div className="scs-scroll" ref={scrollRef}>
        {slides.map((child, i) => (
          <div
            key={i}
            data-idx={i}
            ref={(el) => (itemRefs.current[i] = el)}
            className="scs-slide"
          >
            {child}
          </div>
        ))}
      </div>

      {/* ═════════════ SCOPED STYLES ═════════════ */}
      <style jsx global>{`
        .scs-widget {
          position: relative;
          display: flex;
          gap: 1.25rem;
          width: 100%;
          height: 420px;
          align-items: stretch;
        }
        @media (max-width: 991px) {
          .scs-widget {
            height: 380px;
          }
        }
        @media (max-width: 575px) {
          .scs-widget {
            height: 340px;
            gap: 0.75rem;
          }
        }

        /* ── Pinned heading ── */
        .scs-pinned {
          flex: 1 1 0;
          min-width: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding-right: 0.5rem;
        }
        .scs-eyebrow {
          text-transform: uppercase;
          font-weight: 700;
          letter-spacing: 2px;
          font-size: 12px;
          background: linear-gradient(135deg, #150e23, #600b56);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 10px;
        }
        .scs-title {
          font-size: clamp(22px, 2.4vw, 32px);
          font-weight: 700;
          line-height: 1.15;
          margin: 0 0 12px;
          color: #150e23;
          transition: opacity 0.35s ease, transform 0.35s ease;
        }
        .scs-desc {
          font-size: 15px;
          line-height: 1.65;
          color: #6b7280;
          margin: 0 0 20px;
          transition: opacity 0.35s ease;
        }
        .scs-progress {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
        }
        .scs-dot {
          width: 26px;
          height: 4px;
          border-radius: 4px;
          background: rgba(96, 11, 86, 0.2);
          transition: background 0.35s ease, width 0.35s ease;
        }
        .scs-dot--on {
          width: 40px;
          background: linear-gradient(135deg, #150e23, #600b56);
        }
        .scs-hint {
          font-size: 12px;
          color: #9ca3af;
          letter-spacing: 1px;
        }

        /* ── Scrolling slides ── */
        .scs-scroll {
          flex: 1 1 0;
          min-width: 0;
          height: 100%;
          overflow-y: auto;
          overflow-x: hidden;
          border-radius: 16px;
          scroll-snap-type: y mandatory;
          scrollbar-width: none;
        }
        .scs-scroll::-webkit-scrollbar {
          width: 0;
          background: transparent;
        }
        .scs-slide {
          position: relative;
          height: 100%;
          width: 100%;
          scroll-snap-align: center;
          overflow: visible;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .scs-slide + .scs-slide {
          margin-top: 14px;
        }
      `}</style>
    </div>
  );
};

export default StickyContentSwitch;
