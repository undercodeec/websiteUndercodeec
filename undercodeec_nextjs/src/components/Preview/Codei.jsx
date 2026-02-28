import React, { useEffect } from 'react';

const Codei = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <section id="reserva_agenda" className="py-20 px-4 bg-black text-white text-center relative overflow-hidden">
      {/* Burbuja animada */}
      

      <div className="relative z-10">
      <img
        src="/assets/img/header/header_4_bubble.png"
        alt="Agendar cita para diseño web"
        className="bubble rotate-center"
      />
        <h2 className="title-gradient">Agenda tu Reunión para tu Página Web en Quito</h2>
        <p className="mb-10">Elige el día y la hora que mejor te convenga para potenciar tu negocio</p>

        <div
          className="calendly-inline-widget mx-auto"
          data-url="https://calendly.com/carpathian199964/15-min-meeting?hide_gdpr_banner=1"
          style={{ minWidth: '320px', height: '700px' }}
        ></div>
      </div>
    </section>
  );
};

export default Codei;
