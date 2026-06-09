"use client";
import React, { useState, useEffect, useRef } from 'react';

/**
 * Delays iframe injection until element is visible in the viewport
 * (strategy="viewport", default) or until the browser is idle
 * (strategy="idle", for elements visible from first paint but not critical).
 * Eliminates ~1.2MB of Vimeo JS/CSS from the initial load.
 */
export default function VimeoFacade({
  src,
  title,
  style,
  className,
  allow,
  referrerPolicy,
  frameBorder = '0',
  iframeStyle,
  placeholderStyle,
  strategy = 'viewport',
}) {
  const [loaded, setLoaded] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (strategy === 'idle') {
      const schedule = window.requestIdleCallback || ((cb) => setTimeout(cb, 2500));
      const cancel = window.cancelIdleCallback || clearTimeout;
      const id = schedule(() => setLoaded(true), { timeout: 5000 });
      return () => cancel(id);
    }
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLoaded(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [strategy]);

  return (
    <div ref={containerRef} style={style} className={className}>
      {loaded ? (
        <iframe
          src={src}
          title={title}
          frameBorder={frameBorder}
          allow={allow ?? 'autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share'}
          referrerPolicy={referrerPolicy}
          style={iframeStyle}
        />
      ) : (
        <div style={{ width: '100%', height: '100%', background: 'rgba(0,0,0,0.08)', ...placeholderStyle }} />
      )}
    </div>
  );
}
