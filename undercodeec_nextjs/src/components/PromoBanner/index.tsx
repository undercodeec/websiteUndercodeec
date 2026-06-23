"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

export default function PromoBanner() {
  const bannerRef = useRef<HTMLDivElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);

  const handleSaberMas = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = document.getElementById("presupuesto");
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    const update = () => {
      const h = bannerRef.current?.offsetHeight ?? 0;
      if (spacerRef.current) spacerRef.current.style.height = h + "px";
      document.documentElement.style.setProperty("--promo-banner-height", h + "px");
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <>
      {/* Espaciador estático que empuja el resto del contenido hacia abajo */}
      <div ref={spacerRef} aria-hidden="true" />

      <div
        ref={bannerRef}
        data-promo-banner="true"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          background: "linear-gradient(90deg, #150e23 0%, #600b56 40%, #c0392b 75%, #e67e22 100%)",
          color: "#fff",
          padding: "10px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "12px",
          flexWrap: "wrap",
          fontSize: "14px",
          lineHeight: "1.4",
          textAlign: "center",
        }}
      >
        <span style={{ fontWeight: 600, letterSpacing: "0.2px" }}>
          🔥 <strong>Descuentos Junio &amp; Julio</strong> — hasta el{" "}
          <span
            style={{
              display: "inline-block",
              background: "linear-gradient(135deg, #ff4d4d, #f7b733)",
              borderRadius: "999px",
              padding: "2px 10px",
              fontWeight: 800,
              fontSize: "13px",
              color: "#fff",
              margin: "0 2px",
            }}
          >
            68% OFF
          </span>{" "}
          en nuestros planes
        </span>

        <Link
          href="/#planes"
          onClick={handleSaberMas}
          style={{
            color: "#f7b733",
            fontWeight: 700,
            textDecoration: "underline",
            textUnderlineOffset: "3px",
            whiteSpace: "nowrap",
            fontSize: "14px",
          }}
        >
          Saber más →
        </Link>
      </div>
    </>
  );
}
