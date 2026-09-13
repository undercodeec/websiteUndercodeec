"use client";

import { useEffect, useRef } from "react";
import styles from "./PrimaryOrb.module.css";

export default function PrimaryOrb({ className, textureUrl = "/landing-primary/images/ob_texture-old.webp" }) {
  const viewportRef = useRef(null);

  useEffect(() => {
    let orb;
    let cancelled = false;

    import("@/lib/primary-orb/createPrimaryOrb")
      .then(({ createPrimaryOrb }) => {
        if (cancelled || !viewportRef.current) return;
        orb = createPrimaryOrb(viewportRef.current, { textureUrl });
        viewportRef.current.dataset.orbReady = "true";
      })
      .catch(() => {
        if (viewportRef.current) viewportRef.current.dataset.orbFallback = "true";
      });

    return () => {
      cancelled = true;
      orb?.destroy();
    };
  }, [textureUrl]);

  return (
    <div
      ref={viewportRef}
      className={`${styles.viewport} ${className || ""}`}
      data-primary-orb
      aria-hidden="true"
    />
  );
}
