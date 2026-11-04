"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(min-width: 768px)";

function subscribe(onChange) {
  const media = window.matchMedia(QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches;
}

function getServerSnapshot() {
  return false;
}

export function useDesktopCanvas() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export default function desktopCanvasOnly(Component) {
  function DesktopCanvas(props) {
    const show = useDesktopCanvas();
    return show ? <Component {...props} /> : null;
  }

  DesktopCanvas.displayName = `DesktopCanvas(${Component.displayName || Component.name || "Canvas"})`;
  return DesktopCanvas;
}
