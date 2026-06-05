import React from 'react';

const Responsive = () => {
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
         
         
          {/* Video principal */}
          <div className="video-frame">
            <video
              className="video-iframe"
              src="/assets/img/video/video-undercode-ec-1.mp4"
              autoPlay
              muted
              loop
              controls
              playsInline
            />
          </div>

        </div>
      </div>
    </section>
  );
};

export default Responsive;
