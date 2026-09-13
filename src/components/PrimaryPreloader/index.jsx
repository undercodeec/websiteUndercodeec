"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function PrimaryPreloader() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const showBeforeNavigation = (event) => {
      const link = event.target.closest?.("a[href]");
      if (!link || link.target === "_blank" || link.hasAttribute("download")) return;

      const url = new URL(link.href, window.location.href);
      const currentPath = window.location.pathname.replace(/\/$/, "") || "/";
      const targetPath = url.pathname.replace(/\/$/, "") || "/";

      if (url.origin !== window.location.origin || url.hash || currentPath === targetPath) return;
      if (targetPath.startsWith("/admin") || targetPath.startsWith("/portal")) return;

      setVisible(true);
      setLeaving(false);
    };

    document.addEventListener("click", showBeforeNavigation, true);
    return () => document.removeEventListener("click", showBeforeNavigation, true);
  }, []);

  useEffect(() => {
    const isPrivateRoute = pathname.startsWith("/admin") || pathname.startsWith("/portal");

    if (isPrivateRoute) {
      return;
    }

    let leaveTimer;
    let finishTimer;
    const startTimer = window.setTimeout(() => {
      setVisible(true);
      setLeaving(false);

      leaveTimer = window.setTimeout(() => setLeaving(true), 900);
      finishTimer = window.setTimeout(() => {
        setVisible(false);
        window.dispatchEvent(new CustomEvent("preloaderDone"));
      }, 1250);
    }, 0);

    return () => {
      window.clearTimeout(startTimer);
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
      <div className="primary-global-preloader__mark" aria-hidden="true">
        <img
          src="/landing-primary/images/64ce56bd39c2f116181f1aa5_ob-2023-logomark-svg.svg"
          alt=""
        />
        <span />
      </div>
      <p>Cargando</p>
    </div>
  );
}
