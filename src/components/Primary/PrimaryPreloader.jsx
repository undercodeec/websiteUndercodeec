"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import PrimaryOrb from "../PrimaryOrb/PrimaryOrb";
import styles from "./PrimaryPreloader.module.css";

const ORB_START = {
  autoAlpha: 0,
  width: "0em",
  height: "0em",
  minHeight: "auto",
  minWidth: "auto",
  x: "8em",
  y: "8.1em",
};

function resetPreloader(preloader) {
  const orb = preloader?.querySelector("[data-primary-orb]");
  const rings = preloader?.querySelectorAll("[data-primary-preloader-ring]");

  if (!preloader || !orb) return null;

  gsap.set(preloader, { autoAlpha: 1 });
  gsap.set(orb, ORB_START);
  gsap.set(rings, { autoAlpha: 0, scale: 0 });
  return { orb, rings };
}

export default function PrimaryPreloader() {
  const pathname = usePathname();
  const preloaderRef = useRef(null);

  useEffect(() => {
    const showBeforeNavigation = (event) => {
      const link = event.target.closest?.("a[href]");
      if (!link || link.target === "_blank" || link.hasAttribute("download")) return;

      const url = new URL(link.href, window.location.href);
      const currentPath = window.location.pathname.replace(/\/$/, "") || "/";
      const targetPath = url.pathname.replace(/\/$/, "") || "/";

      if (url.origin !== window.location.origin || url.hash || currentPath === targetPath) return;

      document.body.classList.add("primary-preloading");
      resetPreloader(preloaderRef.current);
    };

    document.addEventListener("click", showBeforeNavigation, true);
    return () => document.removeEventListener("click", showBeforeNavigation, true);
  }, []);

  useEffect(() => {
    const preloader = preloaderRef.current;
    const targets = resetPreloader(preloader);
    if (!targets) return undefined;

    const { orb, rings } = targets;
    const [innerRing, outerRing] = rings;
    const isTabletOrBelow = window.matchMedia("(max-width: 991px)").matches;
    const orbTarget = isTabletOrBelow
      ? { width: "90vw", height: "90vw" }
      : { width: "80vh", height: "80vh", minHeight: "45em", minWidth: "45em" };

    document.body.classList.add("primary-preloading");

    const timeline = gsap.timeline({
      onComplete: () => {
        document.body.classList.remove("primary-preloading");
        window.dispatchEvent(new CustomEvent("preloaderDone"));
      },
    });

    timeline.to(orb, { autoAlpha: 1, width: "4.3em", height: "4.3em", duration: 1 }, 0);
    if (innerRing) timeline.to(innerRing, { autoAlpha: 1, scale: 1, duration: 2, ease: "power2.inOut" }, 0);
    if (outerRing) timeline.to(outerRing, { autoAlpha: 1, scale: 1, duration: 2, ease: "power2.inOut" }, 1);
    timeline.to(orb, {
      x: "0em",
      y: "0em",
      ...orbTarget,
      duration: 1,
      ease: "power2.inOut",
    }, 1);
    timeline.to(preloader, { autoAlpha: 0, duration: .2 }, 2);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) timeline.timeScale(100);

    return () => {
      timeline.kill();
      document.body.classList.remove("primary-preloading");
    };
  }, [pathname]);

  return (
    <div
      ref={preloaderRef}
      className={styles.preloader}
      aria-label="Cargando"
      role="status"
      data-primary-preloader
    >
      <div className={styles.orbStage} aria-hidden="true">
        <span className={`${styles.orbRing} ${styles.orbRingInner}`} data-primary-preloader-ring />
        <span className={`${styles.orbRing} ${styles.orbRingOuter}`} data-primary-preloader-ring />
        <PrimaryOrb className={styles.orb} />
      </div>
    </div>
  );
}
