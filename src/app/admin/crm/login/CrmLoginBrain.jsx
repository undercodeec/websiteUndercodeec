"use client";

import { useEffect, useRef } from "react";

function showOriginalBrain(frame) {
  const document = frame.contentDocument;
  const canvas = document?.getElementById("canvas");
  if (!canvas) return false;

  for (const element of document.body.children) {
    if (element.contains(canvas)) {
      element.style.zIndex = "1";
    } else {
      element.style.visibility = "hidden";
    }
  }
  return true;
}

export default function CrmLoginBrain() {
  const frameRef = useRef(null);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return undefined;

    const revealCanvas = () => {
      if (showOriginalBrain(frame)) window.clearInterval(checkCanvas);
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
    <div className="crm-login-brain" aria-hidden="true">
      <iframe
        ref={frameRef}
        title="Cerebro animado de Dala"
        src="/demos/dala/index.html"
        loading="eager"
        tabIndex={-1}
      />
    </div>
  );
}
