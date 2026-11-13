"use client";

import { useEffect, useRef } from "react";
import styles from "./TrajectoryHomeTeam.module.css";

// The home page supplies both the canonical markup and carousel behavior.
export default function TrajectoryHomeTeam({ html }) {
  const container = useRef(null);

  useEffect(() => {
    let cancelled = false;
    let cleanup;
    import("../../../public/landing-primary/js/home-team-motion.js").then(() => {
      if (cancelled) return;
      const section = container.current?.querySelector(".home-team");
      if (section) cleanup = window.initHomeTeamCarousel?.(section);
    }).catch(() => {
      // Without enhancement the original static grid remains readable.
    });
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  return <div ref={container} className={styles.team} dangerouslySetInnerHTML={{ __html: html }} />;
}
