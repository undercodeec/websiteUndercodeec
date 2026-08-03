import React, { useEffect, useRef, useState } from 'react';

const Responsive = () => {
  const frameRef = useRef(null);
  const videoRef = useRef(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if (!frameRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          obs.disconnect();
        }
      },
      { rootMargin: '300px' }
    );
    obs.observe(frameRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!videoRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        videoRef.current.muted = !entry.isIntersecting;
      },
      { threshold: 0.5 }
    );
    observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, [shouldLoad]);

  return (
    <section className="responsive-section">
      <div className="responsive-container">
        <div className="responsive-text animate-fadeRight">
          <p className="section-subtitle">Impulsa Tu Negocio Al Mundo Digital con una Web Profesional</p>
          <h2 className="section-title">¿Por qué Necesitas Una Página Web Profesional?</h2>
          <p className="section-description">
            Tener una página web optimizada es esencial para destacar en el mercado local y global. Genera confianza y profesionalismo,
            superando a la competencia que no tiene presencia online. Además, te ayuda a formalizar tu negocio y
            se convierte en una poderosa herramienta de ventas que trabaja para ti 24/7.
          </p>
        </div>

        <div className="responsive-video-container animate-fadeLeft" style={{ transitionDelay: '150ms' }}>
          {/* Video principal — lazy-loaded vía IntersectionObserver para evitar 19MB en el primer paint */}
          <div className="video-frame" ref={frameRef}>
            {shouldLoad ? (
              <video
                ref={videoRef}
                className="video-iframe"
                src="/assets/img/video/video-undercode-ec-1.mp4"
                autoPlay
                muted
                loop
                controls
                playsInline
                preload="metadata"
              />
            ) : (
              <div
                className="video-iframe"
                style={{ aspectRatio: '16 / 9', backgroundColor: '#000' }}
                aria-hidden="true"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Responsive;
