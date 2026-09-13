"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import PrimaryOrb from "../PrimaryOrb/PrimaryOrb";
import styles from "./PrimaryPreloader.module.css";

const DEFAULT_LOAD_DURATION = 900;
const FIRST_PRIMARY_LOAD_DURATION = 4000;
const REPEAT_PRIMARY_LOAD_DURATION = 1000;
const PRIMARY_INTRO_DELAY = 1500;
const PRIMARY_ORB_REVEAL_DURATION = 1100;
const EXIT_DURATION = 350;

const loadingCharacters = Array.from("cargando");

function LoadMark() {
  return (
    <svg
      version="1.1"
      id="ob-load-img"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 162 162"
      xmlSpace="preserve"
      aria-hidden="true"
    >
      <path
        pathLength="1"
        className={styles.markStroke}
        d="M108 88.7c-10.8 0-19.7 8.8-19.7 19.7v47.4c0 1.9-1.5 3.4-3.4 3.4h-8.6c-1.9 0-3.4-1.5-3.4-3.4v-47.4c0-10.8-8.8-19.7-19.7-19.7H6.4c-1.9 0-3.4-1.5-3.4-3.4v-8c0-1.9 1.5-3.4 3.4-3.4h46.9c10.8 0 19.7-8.8 19.6-19.7V6.4c0-1.9 1.5-3.4 3.4-3.4H85c1.9 0 3.4 1.5 3.4 3.4v47.8c0 10.8 8.8 19.7 19.7 19.7h46.6c1.9 0 3.4 1.5 3.4 3.4v8c0 1.9-1.5 3.4-3.4 3.4H108z"
      />
      <path
        pathLength="1"
        className={styles.markStroke}
        d="M146.1 134.4h-.7c-6.5 0-11.9 5.3-11.9 11.9v.7c0 6.7 5.5 12.2 12.2 12.2s12.2-5.5 12.2-12.2v-.7c0-6.6-5.2-11.9-11.8-11.9z"
      />
    </svg>
  );
}

function routeMatches(pathname, route) {
  const normalizedPath = pathname?.replace(/\/$/, "") || "/";
  const normalizedRoute = route.replace(/\/$/, "") || "/";
  return normalizedPath === normalizedRoute || normalizedPath.startsWith(`${normalizedRoute}/`);
}

export default function PrimaryPreloader({ orbRoutes = ["/servicios"] }) {
  const pathname = usePathname();
  const usesOrb = orbRoutes.some((route) => routeMatches(pathname, route));
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const [phase, setPhase] = useState("mark");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const showBeforeNavigation = (event) => {
      const link = event.target.closest?.("a[href]");
      if (!link || link.target === "_blank" || link.hasAttribute("download")) return;

      const url = new URL(link.href, window.location.href);
      const currentPath = window.location.pathname.replace(/\/$/, "") || "/";
      const targetPath = url.pathname.replace(/\/$/, "") || "/";

      if (url.origin !== window.location.origin || url.hash || currentPath === targetPath) return;

      setProgress(0);
      setPhase("mark");
      setVisible(true);
      setLeaving(false);
    };

    document.addEventListener("click", showBeforeNavigation, true);
    return () => document.removeEventListener("click", showBeforeNavigation, true);
  }, []);

  useEffect(() => {
    let frame;
    let startTimer;
    let progressTimer;
    let orbTimer;
    let leaveTimer;
    let finishTimer;

    const isRepeatPrimaryLoad = usesOrb && window.localStorage.getItem("primaryPreloaderVisited") === "true";
    const loadDuration = usesOrb
      ? (isRepeatPrimaryLoad ? REPEAT_PRIMARY_LOAD_DURATION : FIRST_PRIMARY_LOAD_DURATION)
      : DEFAULT_LOAD_DURATION;
    const introDelay = usesOrb ? PRIMARY_INTRO_DELAY : 0;
    const orbRevealDuration = usesOrb ? PRIMARY_ORB_REVEAL_DURATION : 0;

    if (usesOrb) window.localStorage.setItem("primaryPreloaderVisited", "true");

    document.body.classList.add("primary-preloading");
    startTimer = window.setTimeout(() => {
      setProgress(0);
      setPhase("mark");
      setVisible(true);
      setLeaving(false);

      progressTimer = window.setTimeout(() => {
        const startedAt = window.performance.now();

        const tick = (now) => {
          const nextProgress = Math.min(100, Math.round(((now - startedAt) / loadDuration) * 100));
          setProgress(nextProgress);
          if (nextProgress < 100) frame = window.requestAnimationFrame(tick);
        };

        frame = window.requestAnimationFrame(tick);
      }, introDelay);

      orbTimer = window.setTimeout(() => setPhase("orb"), introDelay + loadDuration);
      leaveTimer = window.setTimeout(
        () => setLeaving(true),
        introDelay + loadDuration + orbRevealDuration,
      );
      finishTimer = window.setTimeout(() => {
        setVisible(false);
        document.body.classList.remove("primary-preloading");
        window.dispatchEvent(new CustomEvent("preloaderDone"));
      }, introDelay + loadDuration + orbRevealDuration + EXIT_DURATION);
    }, 0);

    return () => {
      window.clearTimeout(startTimer);
      window.clearTimeout(progressTimer);
      window.cancelAnimationFrame(frame);
      window.clearTimeout(orbTimer);
      window.clearTimeout(leaveTimer);
      window.clearTimeout(finishTimer);
      document.body.classList.remove("primary-preloading");
    };
  }, [pathname, usesOrb]);

  if (!visible) return null;

  return (
    <div
      key={pathname}
      className={`${styles.preloader} ${phase === "orb" ? styles.orbReveal : ""} ${leaving ? styles.leaving : ""}`}
      aria-label="Cargando"
      role="status"
      data-primary-preloader
    >
      {usesOrb && (
        <div className={styles.orbStage} aria-hidden="true">
          <span className={`${styles.orbRing} ${styles.orbRingInner}`} />
          <span className={`${styles.orbRing} ${styles.orbRingOuter}`} />
          <PrimaryOrb className={styles.orb} />
        </div>
      )}

      <div className={styles.markStage}>
        <div className={styles.markWrap}>
          <div className={styles.markOutline}><LoadMark /></div>
          <div className={styles.fillMask} aria-hidden="true">
            <div className={styles.fill} style={{ transform: `scaleY(${progress / 100})` }} />
          </div>
          <div className={styles.info}>
            <div className={styles.infoInner}>
              <span className={styles.loadingText} aria-hidden="true">
                {loadingCharacters.map((character, index) => (
                  <span key={`${character}-${index}`} style={{ "--pre-char": index }}>{character}</span>
                ))}
              </span>
              <span className={styles.percentage}>{progress}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
