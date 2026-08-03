/* global fbq */
import React, { useEffect, useState } from 'react';
import chooseUsData from '@/data/Startup/chooseus.json';

import ReactGA from 'react-ga4';

const ChooseUs = ({}) => {
  const data = chooseUsData;
  const [showWhatsappMessage, setShowWhatsappMessage] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWhatsappMessage(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  // Esta función envía eventos a Google Analytics y Meta Pixel
  const trackSocialClick = (platform) => {
    const platformCapitalized = platform.charAt(0).toUpperCase() + platform.slice(1);

    // Google Analytics
    ReactGA.event({
      category: 'Redes Sociales',
      action: `click_${platform}`,
      label: `Clic en ícono de ${platformCapitalized}`
    });

    // Meta Pixel (asegúrate de que fbq esté cargado en tu sitio)
    if (typeof fbq !== 'undefined') {
      fbq('trackCustom', `Click${platformCapitalized}`, {
        platform: platform
      });
    }
  };

  return (
    <section className="choose-us section-padding style-6" data-scroll-index="4">
      <div className="custom-banner-container">

        {/* Redes sociales + mensaje */}
        <div className="social-icons">
          <a
            href="https://www.facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="facebook"
            onClick={() => trackSocialClick('facebook')}
          >
            <i className="fab fa-facebook-f"></i>
          </a>

          <a
            href="https://www.instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="instagram"
            onClick={() => trackSocialClick('instagram')}
          >
            <i className="fab fa-instagram"></i>
          </a>

          <div className="whatsapp-icon-container">
            <a
              href="https://wa.me/593999739534?text=¡Hola!%20Estoy%20interesado%20en%20obtener%20más%20información%20sobre%20los%20planes%20de%20marketing%20para%20mi%20negocio."
              target="_blank"
              rel="noopener noreferrer"
              className="whatsapp"
              onClick={() => trackSocialClick('whatsapp')}
            >
              <i className="fab fa-whatsapp"></i>
            </a>

            {showWhatsappMessage && (
              <div className="whatsapp-message">
                ¿Tienes preguntas?
              </div>
            )}
          </div>
        </div>



        {/* Banner de bienvenida */}
        <div className="banner-left">
          <div className="lava-bubbles">
            {/* Burbujas internas */}
            <span className="bubble-floating"></span>
            <span className="bubble-floating"></span>
            <span className="bubble-floating"></span>
            <span className="bubble-floating"></span>
            <span className="bubble-floating"></span>

          </div>
          <h2>¡Bienvenido!</h2>
          <h4>El mundo ya es digital</h4>
          <p>En los últimos años, las personas buscan todo en internet.</p>
        </div>


        {/* Imagen gráfica */}
        <div className="banner-right">
          <img
            src="/assets/img/choose_us/banerimg_1.webp"
            alt="Banner gráfico"
            className="body-img"
          />
          <img
            src="/assets/img/choose_us/banercabeza.webp"
            alt="Cabeza animada"
            className="head-img"
          />
        </div>

      </div>

      {/* Burbujas decorativas */}
      <div className="relative z-10">
        <img
          src="/assets/img/header/header_4_bubble.png"
          alt="burbuja"
          className="bubble rotate-center"
        />
      </div>
      <img src="/assets/img/about/about_s6_bubbles.png" alt="" className="bubbles rotate-center" />
    </section>
  );
};

export default ChooseUs;
