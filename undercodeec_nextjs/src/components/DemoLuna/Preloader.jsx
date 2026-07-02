"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./LunaExperience.module.css";

/**
 * Anillo de carga inicial. Avanza con una curva "ease-out" durante `duration`
 * y avisa con `onDone` cuando termina. Es puramente estético: da un respiro
 * mientras el modelo 3D (pesado) se descarga en segundo plano.
 */
export default function Preloader({ duration = 2300, onDone }) {
  const [progress, setProgress] = useState(0);
  const [hidden, setHidden] = useState(false);
  const doneRef = useRef(onDone);
  useEffect(() => {
    doneRef.current = onDone;
  });

  useEffect(() => {
    const start = performance.now();
    let raf = 0;

    const tick = (now) => {
      const linear = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - linear, 2.4);
      setProgress(eased);
      if (linear < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setTimeout(() => {
          setHidden(true);
          doneRef.current?.();
        }, 260);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [duration]);

  const R = 48;
  const circumference = 2 * Math.PI * R;

  return (
    <div className={`${styles.preloader} ${hidden ? styles.preloaderHidden : ""}`}>
      <div className={styles.preloaderInner}>
        <svg width="100" height="100" viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r={R} fill="none" stroke="rgba(255,243,234,0.12)" strokeWidth="2" />
          <circle
            cx="50"
            cy="50"
            r={R}
            fill="none"
            stroke="#fff3ea"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
            transform="rotate(-90 50 50)"
          />
        </svg>
        <div className={styles.preloaderPct}>{Math.round(progress * 100)}%</div>
      </div>
    </div>
  );
}
