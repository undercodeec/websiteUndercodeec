import React, { useEffect, useRef, useState } from 'react';

const Codei = () => {
  const sectionRef = useRef(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if (!sectionRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          obs.disconnect();
        }
      },
      { rootMargin: '300px' }
    );
    obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!shouldLoad) return;
    if (document.querySelector('script[src*="calendly.com/assets/external/widget.js"]')) return;
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    document.body.appendChild(script);
  }, [shouldLoad]);

  return (
    <section
      id="reserva_agenda"
      ref={sectionRef}
      className="py-20 px-4 bg-black text-white text-center relative overflow-hidden"
    >
      <div className="relative z-10">
        <img
          src="/assets/img/header/header_4_bubble.png"
          alt="Agendar cita para diseño web"
          className="bubble rotate-center animate-fadeIn"
        />
        <h2 className="title-gradient animate-fadeUp">Agenda tu Reunión para tu Página Web</h2>
        <p className="mb-10 animate-fadeUp" style={{ transitionDelay: '150ms' }}>Elige el día y la hora que mejor te convenga para potenciar tu negocio</p>

        {shouldLoad ? (
          <div
            className="calendly-inline-widget mx-auto animate-scaleUp"
            data-url="https://calendly.com/carpathian199964/15-min-meeting?hide_gdpr_banner=1"
            style={{ minWidth: '320px', height: '700px', transitionDelay: '300ms' }}
          ></div>
        ) : (
          <div
            className="mx-auto"
            style={{ minWidth: '320px', height: '700px', backgroundColor: 'transparent' }}
            aria-hidden="true"
          />
        )}
      </div>
    </section>
  );
};

export default Codei;
