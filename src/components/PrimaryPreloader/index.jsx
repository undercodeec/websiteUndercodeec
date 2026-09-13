"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const LOAD_DURATION = 900;
const EXIT_DURATION = 350;

const loadMark = (
  <svg
    version="1.1"
    id="ob-load-img"
    xmlns="http://www.w3.org/2000/svg"
    x="0"
    y="0"
    viewBox="0 0 162 162"
    xmlSpace="preserve"
  >
    <path
      id="ob-l-x"
      className="st-x"
      d="M108 88.7c-10.8 0-19.7 8.8-19.7 19.7v47.4c0 1.9-1.5 3.4-3.4 3.4h-8.6c-1.9 0-3.4-1.5-3.4-3.4v-47.4c0-10.8-8.8-19.7-19.7-19.7H6.4c-1.9 0-3.4-1.5-3.4-3.4v-8c0-1.9 1.5-3.4 3.4-3.4h46.9c10.8 0 19.7-8.8 19.6-19.7V6.4c0-1.9 1.5-3.4 3.4-3.4H85c1.9 0 3.4 1.5 3.4 3.4v47.8c0 10.8 8.8 19.7 19.7 19.7h46.6c1.9 0 3.4 1.5 3.4 3.4v8c0 1.9-1.5 3.4-3.4 3.4H108z"
    />
    <path
      id="ob-l-c"
      className="st-c"
      d="M146.1 134.4h-.7c-6.5 0-11.9 5.3-11.9 11.9v.7c0 6.7 5.5 12.2 12.2 12.2s12.2-5.5 12.2-12.2v-.7c0-6.6-5.2-11.9-11.8-11.9z"
    />
  </svg>
);

export default function PrimaryPreloader() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);
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
      setVisible(true);
      setLeaving(false);
    };

    document.addEventListener("click", showBeforeNavigation, true);
    return () => document.removeEventListener("click", showBeforeNavigation, true);
  }, []);

  useEffect(() => {
    let frame;
    let leaveTimer;
    let finishTimer;

    const startTimer = window.setTimeout(() => {
      const startedAt = window.performance.now();
      setProgress(0);
      setVisible(true);
      setLeaving(false);

      const tick = (now) => {
        const nextProgress = Math.min(100, Math.round(((now - startedAt) / LOAD_DURATION) * 100));
        setProgress(nextProgress);

        if (nextProgress < 100) frame = window.requestAnimationFrame(tick);
      };

      frame = window.requestAnimationFrame(tick);
      leaveTimer = window.setTimeout(() => setLeaving(true), LOAD_DURATION);
      finishTimer = window.setTimeout(() => {
        setVisible(false);
        window.dispatchEvent(new CustomEvent("preloaderDone"));
      }, LOAD_DURATION + EXIT_DURATION);
    }, 0);

    return () => {
      window.clearTimeout(startTimer);
      window.cancelAnimationFrame(frame);
      window.clearTimeout(leaveTimer);
      window.clearTimeout(finishTimer);
    };
  }, [pathname]);

  if (!visible) return null;

  return (
    <div
      className={`primary-global-preloader${leaving ? " is-leaving" : ""}`}
      aria-label="Cargando"
      role="status"
    >
      <div preloader="" className="pre-w">
        <div className="ob-mask-wrap">
          <div className="ob-mask-outline" aria-hidden="true">
            {loadMark}
          </div>
          <div className="ob-fill-mask" aria-hidden="true">
            <div
              className="ob-fill-fill"
              style={{ transform: `scaleY(${progress / 100})` }}
            />
          </div>
          <div className="pre-info-w is-1">
            <div className="pre-info-inner is-2">
              <div className="o-hidden">
                <div split-text="" pre-text="" className="text-mini">cargando</div>
              </div>
              <div className="o-hidden is-ppercent">
                <div pre-percent="" className="text-mini">{progress}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
