"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import styles from "./PrimaryCursor.module.css";

export default function PrimaryCursor() {
  const pathname = usePathname();
  const wrapRef = useRef(null);
  const dotRef = useRef(null);
  const isDisabled = pathname?.startsWith("/admin");

  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)");
    const wrap = wrapRef.current;
    const dot = dotRef.current;

    if (isDisabled || !finePointer.matches || !wrap || !dot) return;

    let hasPosition = false;

    const move = (event) => {
      dot.style.setProperty("--cursor-x", `${event.clientX}px`);
      dot.style.setProperty("--cursor-y", `${event.clientY}px`);
      hasPosition = true;

      wrap.classList.add(styles.visible);
    };

    const updateHover = (event) => {
      const targetElement = event.target instanceof Element ? event.target : null;
      const interactive = targetElement?.closest("a, button, [data-cursor-hover]");
      dot.classList.toggle(styles.hover, Boolean(interactive));
    };

    const hide = () => wrap.classList.remove(styles.visible);
    const show = () => {
      if (hasPosition) wrap.classList.add(styles.visible);
    };

    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("mouseover", updateHover, { passive: true });
    document.addEventListener("mouseleave", hide);
    document.addEventListener("mouseenter", show);

    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", updateHover);
      document.removeEventListener("mouseleave", hide);
      document.removeEventListener("mouseenter", show);
    };
  }, [isDisabled]);

  if (isDisabled) return null;

  return (
    <div ref={wrapRef} className={styles.cursorWrap} aria-hidden="true">
      <span ref={dotRef} className={styles.cursorDot} />
    </div>
  );
}
