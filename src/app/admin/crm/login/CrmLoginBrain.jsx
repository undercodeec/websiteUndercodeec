"use client";

import { useEffect, useRef, useState } from "react";

function showOriginalBrain(frame) {
  const document = frame.contentDocument;
  const canvas = document?.getElementById("canvas");
  if (!canvas) return false;

  const canvasLayer = canvas.closest("body > div");
  if (!canvasLayer) return false;

  document.documentElement.style.setProperty("overflow", "hidden", "important");
  document.documentElement.style.setProperty("height", "100%", "important");
  document.body.style.setProperty("overflow", "hidden", "important");
  document.body.style.setProperty("height", "100%", "important");
  document.body.style.setProperty("min-height", "0", "important");
  canvasLayer.classList.add("crm-login-brain-canvas");

  if (!document.getElementById("crm-login-brain-only")) {
    const style = document.createElement("style");
    style.id = "crm-login-brain-only";
    style.textContent = `
      html, body { height: 100% !important; min-height: 0 !important; overflow: hidden !important; background-color: transparent !important; }
      html { scrollbar-width: none !important; }
      html::-webkit-scrollbar, body::-webkit-scrollbar { display: none !important; }
      body > :not(.crm-login-brain-canvas) { visibility: hidden !important; }
      .asscrollbar, [asscrollbar], [class*="scrollbar"] { display: none !important; }
      body > .crm-login-brain-canvas { position: fixed !important; inset: 0 !important; z-index: 1 !important; visibility: visible !important; }
    `;
    document.head.append(style);
  }

  for (const element of document.body.children) {
    if (element === canvasLayer) {
      element.style.setProperty("visibility", "visible", "important");
    } else {
      element.style.setProperty("visibility", "hidden", "important");
    }
  }
  return true;
}

export default function CrmLoginBrain() {
  const frameRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return undefined;

    const revealCanvas = () => {
      if (showOriginalBrain(frame)) {
        window.clearInterval(checkCanvas);
        setReady(true);
      }
    };
    const checkCanvas = window.setInterval(revealCanvas, 100);
    frame.addEventListener("load", revealCanvas);
    revealCanvas();

    return () => {
      window.clearInterval(checkCanvas);
      frame.removeEventListener("load", revealCanvas);
    };
  }, []);

  return (
    <div className={`crm-login-brain${ready ? " is-ready" : ""}`} aria-hidden="true">
      <iframe
        ref={frameRef}
        title="Cerebro animado de Dala"
        src="/admin/crm/login/dala-embed/"
        loading="eager"
        scrolling="no"
        tabIndex={-1}
        style={{ visibility: ready ? "visible" : "hidden" }}
      />
    </div>
  );
}
