"use client";

import React, { useRef, useLayoutEffect } from "react";
import gsap from "gsap";

/* ═══════════════════════════════════════════════════════════════
 *  HorizontalGallery
 *  ─────────────────────────────────────────────────────────────
 *  A "sticky" section where vertical scroll is translated into
 *  smooth horizontal sliding. 
 * 
 *  Technical implementation: Intercepts wheel events using GSAP 
 *  to calculate and animate the track translation. Once the 
 *  gallery reaches either end, it releases the scroll back to 
 *  the parent so the user can continue navigating the page.
 * ═══════════════════════════════════════════════════════════════ */

const projects = [
  { id: 1, title: "Fintech App", img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop" },
  { id: 2, title: "E-Commerce Platform", img: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=800&auto=format&fit=crop" },
  { id: 3, title: "AI Dashboard", img: "https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=800&auto=format&fit=crop" },
  { id: 4, title: "Health Tech", img: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=800&auto=format&fit=crop" },
  { id: 5, title: "Social Network", img: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=800&auto=format&fit=crop" },
];

const HorizontalGallery = () => {
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const progressRef = useRef(0);
  const targetProgressRef = useRef(0);
  const animationRef = useRef(null);

  // Use GSAP to smooth the horizontal movement based on wheel accumulation
  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      const container = containerRef.current;
      const track = trackRef.current;
      if (!container || !track) return;

      const handleWheel = (e) => {
        // Allow pure horizontal swipes to work natively or be ignored by this hijacker
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;

        const maxScroll = track.scrollWidth - container.clientWidth;
        if (maxScroll <= 0) return;

        // Calculate hypothetical new scroll position
        let newTarget = targetProgressRef.current + e.deltaY;
        
        // Clamp boundaries and determine if we should release the scroll
        if (newTarget < 0) {
          if (targetProgressRef.current > 0) {
            newTarget = 0;
          } else {
            // Already at start, let parent scroll normally (go to previous slide)
            return;
          }
        } else if (newTarget > maxScroll) {
          if (targetProgressRef.current < maxScroll) {
            newTarget = maxScroll;
          } else {
            // Already at end, let parent scroll normally (go to next slide)
            return;
          }
        }

        // We are within bounds, prevent vertical scroll of the parent
        e.preventDefault();
        e.stopPropagation();

        targetProgressRef.current = newTarget;

        // Animate to new target smoothly using GSAP
        if (animationRef.current) animationRef.current.kill();
        
        animationRef.current = gsap.to(progressRef, {
          current: newTarget,
          duration: 0.6,
          ease: "power2.out",
          onUpdate: () => {
            gsap.set(track, { x: -progressRef.current });
          }
        });
      };

      // Passive: false is required to call preventDefault
      container.addEventListener("wheel", handleWheel, { passive: false });
      
      // Recalculate on window resize
      const handleResize = () => {
        const maxScroll = track.scrollWidth - container.clientWidth;
        if (targetProgressRef.current > maxScroll) {
          targetProgressRef.current = Math.max(0, maxScroll);
          progressRef.current = targetProgressRef.current;
          gsap.set(track, { x: -progressRef.current });
        }
      };
      window.addEventListener("resize", handleResize);

      return () => {
        container.removeEventListener("wheel", handleWheel);
        window.removeEventListener("resize", handleResize);
      };
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="hg-root" ref={containerRef}>
      <div className="hg-track" ref={trackRef}>
        {projects.map((p) => (
          <div key={p.id} className="hg-item group">
            <img src={p.img} alt={p.title} className="hg-img" />
            <div className="hg-overlay" />
            <div className="hg-content">
              <span className="hg-badge">Project {p.id}</span>
              <h4 className="hg-title">{p.title}</h4>
            </div>
          </div>
        ))}
      </div>
      
      {/* Scroll Hint HUD */}
      <div className="hg-hint">
        <span className="hg-hint-text">Explora la galería</span>
        <div className="hg-hint-icon">→</div>
      </div>

      {/* ═════════════ SCOPED STYLES ═════════════ */}
      <style jsx global>{`
        .hg-root {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
          background: #fdfdfd;
          border-radius: 16px;
          display: flex;
          align-items: center;
          border: 1px solid rgba(0,0,0,0.05);
        }

        .hg-track {
          display: flex;
          gap: 1.5rem;
          padding: 0 2rem;
          width: max-content;
          will-change: transform;
        }

        .hg-item {
          position: relative;
          width: 280px;
          height: 320px;
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          box-shadow: 0 10px 30px rgba(0,0,0,0.05);
          transform: scale(0.98);
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease;
        }

        .hg-item:hover {
          transform: scale(1);
          box-shadow: 0 20px 40px rgba(0,0,0,0.12);
        }

        .hg-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.7s ease;
        }

        .hg-item:hover .hg-img {
          transform: scale(1.08);
        }

        .hg-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(21,14,35,0.85) 0%, rgba(21,14,35,0.2) 50%, transparent 100%);
          opacity: 0.8;
          transition: opacity 0.4s ease;
        }

        .hg-item:hover .hg-overlay {
          opacity: 1;
        }

        .hg-content {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 24px;
          color: white;
          transform: translateY(10px);
          transition: transform 0.4s ease;
        }

        .hg-item:hover .hg-content {
          transform: translateY(0);
        }

        .hg-badge {
          display: inline-block;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: #FEE07A;
          margin-bottom: 8px;
          padding: 4px 8px;
          background: rgba(254, 224, 122, 0.15);
          border-radius: 4px;
          backdrop-filter: blur(4px);
        }

        .hg-title {
          font-size: 20px;
          font-weight: 700;
          margin: 0;
          letter-spacing: -0.5px;
        }

        .hg-hint {
          position: absolute;
          top: 24px;
          right: 24px;
          display: flex;
          align-items: center;
          gap: 8px;
          background: white;
          padding: 8px 16px;
          border-radius: 20px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.06);
          pointer-events: none;
        }

        .hg-hint-text {
          font-size: 11px;
          font-weight: 600;
          color: #150e23;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .hg-hint-icon {
          color: #600b56;
          font-weight: bold;
          animation: hg-bounce-right 1.5s infinite;
        }

        @keyframes hg-bounce-right {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(4px); }
        }

        @media (max-width: 575px) {
          .hg-item {
            width: 240px;
            height: 280px;
          }
          .hg-hint {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default HorizontalGallery;
