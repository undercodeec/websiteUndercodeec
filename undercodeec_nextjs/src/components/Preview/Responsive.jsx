import React from 'react';

const Responsive = () => {
  return (
    <section className="responsive-section">
      <div className="responsive-container">
        <div className="responsive-text">
          <p className="section-subtitle">Impulsa Tu Negocio Al Mundo Digital con una Web Profesiona</p>
          <h2 className="section-title">¿Por qué Necesitas Una Página Web en Ecuador?</h2>
          <p className="section-description">
            Tener una página web optimizada es esencial para destacar en el mercado local y global. Genera confianza y profesionalismo,
            superando a la competencia que no tiene presencia online. Además, te ayuda a formalizar tu negocio en Quito y
            se convierte en una poderosa herramienta de ventas que trabaja para ti 24/7.
          </p>
        </div>

        <div className="responsive-video-container">
         
         
          {/* Video principal */}
          <div className="video-frame">
            <iframe
              className="video-iframe"
              src="https://www.youtube.com/embed/9L1CWaSOUaU?si=ole5W7MLrmyaUKZO"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            ></iframe>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Responsive;
