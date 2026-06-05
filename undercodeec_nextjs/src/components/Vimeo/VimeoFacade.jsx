"use client";
import React, { useState, useEffect, useRef } from 'react';

/**
 * Delays iframe injection until element is visible in the viewport.
 * Eliminates ~1.2MB Vimeo JS/CSS from the initial load.
 *
 * Props mirror a standard <iframe> but accept an optional `placeholderStyle`
 * for the container shown before the iframe loads.
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
}) {
  const [loaded, setLoaded] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
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
  }, []);

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
