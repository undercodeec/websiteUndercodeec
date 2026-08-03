'use client';

import React, { useEffect, useRef, useState } from 'react';

const Codei = () => {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!sectionRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          obs.disconnect();
        }
      },
      { rootMargin: '200px', threshold: 0.05 }
    );
    obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

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
          className={`bubble rotate-center animate-fadeIn ${isVisible ? 'animate-visible' : ''}`}
        />
        <h2 className={`title-gradient animate-fadeUp ${isVisible ? 'animate-visible' : ''}`}>
          Agenda tu Reunión para tu Página Web
        </h2>
        <p
          className={`mb-10 animate-fadeUp ${isVisible ? 'animate-visible' : ''}`}
          style={{ transitionDelay: '150ms' }}
        >
          Elige el día y la hora que mejor te convenga para potenciar tu negocio
        </p>

        <div
          className={`mx-auto animate-scaleUp ${isVisible ? 'animate-visible' : ''}`}
          style={{ minWidth: '320px', maxWidth: '1000px', height: '700px', transitionDelay: '300ms' }}
        >
          {isVisible && (
            <iframe
              src="https://calendly.com/undercodeec/30min?locale=es"
              width="100%"
              height="100%"
              frameBorder="0"
              title="Agendar reunión con Undercodeec"
              style={{ border: 'none', borderRadius: '8px' }}
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default Codei;
