"use client";

import { useEffect, useRef } from "react";
import styles from "./PrimaryOrb.module.css";

export default function PrimaryOrb({
  className,
  color,
  textureUrl = "/landing-primary/images/ob_texture-old.webp",
  disableOnMobile = false,
}) {
  const viewportRef = useRef(null);

  useEffect(() => {
    let orb;
    let cancelled = false;

    // The primary orb needs floating-point WebGL render targets. On phones that
    // capability is not reliable and several simultaneous canvases can exhaust
    // the browser's WebGL-context budget, so callers can opt into their CSS
    // fallback without even creating a canvas.
    if (disableOnMobile && window.matchMedia("(max-width: 700px)").matches) {
      viewportRef.current?.setAttribute("data-orb-fallback", "mobile");
      return undefined;
    }

    import("@/lib/primary-orb/createPrimaryOrb")
      .then(({ createPrimaryOrb }) => {
        if (cancelled || !viewportRef.current) return;
        orb = createPrimaryOrb(viewportRef.current, { color, textureUrl });
        viewportRef.current.dataset.orbReady = "true";
      })
      .catch(() => {
        if (viewportRef.current) viewportRef.current.dataset.orbFallback = "true";
      });

    return () => {
      cancelled = true;
      orb?.destroy();
    };
  }, [color, disableOnMobile, textureUrl]);

  return (
    <div
      ref={viewportRef}
      className={`${styles.viewport} ${className || ""}`}
      data-primary-orb
      data-primary-orb-monochrome={color ? "true" : undefined}
      style={color ? { "--primary-orb-fallback-color": color } : undefined}
      aria-hidden="true"
    />
  );
}
