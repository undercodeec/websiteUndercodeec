"use client";
import React, { useState } from 'react';
import ModalVideo from "react-modal-video";
import testimonialsData from '@/data/App/testimonials.json';

import "react-modal-video/css/modal-video.css";
import ReactGA from 'react-ga4';

const handleIframeClick = (nombreDemo) => {
  ReactGA.event({
    category: 'Demo Figma',
    action: 'Interacción con iframe',
    label: nombreDemo
  });
};

const Testimonials = ({}) => {
  const [isOpen, setOpen] = useState(false);
  const data = testimonialsData;

  const openVideo = (e) => {
    e.preventDefault();
    setOpen(true);
  }

  return (
    <section id="portafolio" className="testimonials style-4 pt-70" data-scroll-index="5">

      <div className="section-head text-center style-4 animate-fadeUp">
        <h2 className="mb-70">
          <span>{'Portafolio de Proyectos'}</span>
        </h2>
      </div>

      {/* Iframes Figma: entradas desde lados opuestos */}
      <div className="d-flex flex-wrap justify-content-center gap-4 mt-5">
        <div className="iframe-container animate-fadeRight" style={{ width: '100%', maxWidth: '400px', margin: '0 auto', transitionDelay: '100ms' }}>
          <iframe
            style={{ border: '1px solid rgba(0, 0, 0, 0.1)', borderRadius: '20px', overflow: 'hidden' }}
            width="100%"
            height="700"
            src="https://embed.figma.com/proto/4qQ45FdE4pRC7jhbWQmPsO/Aplicacion-Techni-Help-Demo--Community-?node-id=1-2&p=f&scaling=scale-down&content-scaling=fixed&page-id=0%3A1&starting-point-node-id=1%3A2&show-proto-sidebar=0&embed-host=share"
            allowFullScreen
          ></iframe>
        </div>

        <div className="iframe-container animate-fadeLeft" style={{ width: '100%', maxWidth: '400px', margin: '0 auto', transitionDelay: '200ms' }}>
          <iframe
            style={{ border: '1px solid rgba(0, 0, 0, 0.1)', borderRadius: '20px', overflow: 'hidden' }}
            width="100%"
            height="700"
            src="https://embed.figma.com/proto/EZkEOnTlJBVg6gykhUtf2V/Restaurante-App-Demo?node-id=3-2&p=f&scaling=scale-down&content-scaling=fixed&page-id=0%3A1&starting-point-node-id=3%3A2&show-proto-sidebar=0&embed-host=share"
            allowFullScreen
          ></iframe>
        </div>
      </div>

      <div className="container">
        <div className="content">
          <div className="row">

            {/* Columna izquierda — estadísticas */}
            <div className="col-lg-5 animate-fadeRight" style={{ transitionDelay: '100ms' }}>
              <div className="section-head style-4">
                <small className="title_small animate-fadeUp" style={{ transitionDelay: '150ms' }}>{'Testimonios'}</small>
                <h2 className="mb-30 animate-fadeUp" style={{ transitionDelay: '230ms' }}>
                  {'Historias'} <span>{'Reales'}</span>
                </h2>
              </div>
              <div className="numbs">
                {data.numCards.map((card, index) => (
                  <div className="num-card animate-scaleUp" key={index} style={{ transitionDelay: `${300 + index * 100}ms` }}>
                    <div className="icon img-contain">
                      <img src={card.image} alt="" />
                    </div>
                    <h2>{card.value}</h2>
                    {card.stars && (
                      <div className="stars">
                        {Array(card.stars).fill().map((_, i) => <i className="fas fa-star" key={i}></i>)}
                      </div>
                    )}
                    <p>{typeof card.type === 'string' ? card.type : (<>{card.type.text1} <br /> {card.type.text2}</>)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Columna derecha — reviews */}
            <div className="col-lg-7 animate-fadeLeft" style={{ transitionDelay: '200ms' }}>
              <div className="testi-cards">
                {data.testiCards.map((card, index) => (
                  <div className="client_card animate-fadeUp" key={index} style={{ transitionDelay: `${150 + index * 100}ms` }}>
                    <div className="user_img">
                      <img src={card.userImg} alt="" />
                    </div>
                    <div className="inf_content">
                      <div className="stars mb-2">
                        {Array(card.stars).fill().map((_, i) => <i className="fas fa-star" key={i}></i>)}
                      </div>
                      <h6>
                        {typeof card.title === 'string' ? card.title : (<>{card.title.text1} <br /> {card.title.text2}</>)}
                      </h6>
                      <p>{card.author.name} <span className="text-muted"> / {card.author.position} <span>{card.author.company}</span></span></p>
                    </div>
                  </div>
                ))}
                <img src="/assets/img/contact_globe.svg" alt="" className="testi-globe" />
              </div>
            </div>

          </div>
        </div>
      </div>

      {typeof window !== "undefined" && (
        <ModalVideo
          channel="youtube"
          autoplay
          isOpen={isOpen}
          videoId="pGbIOC83-So"
          onClose={() => setOpen(false)}
        />
      )}
    </section>
  );
}

export default Testimonials;
