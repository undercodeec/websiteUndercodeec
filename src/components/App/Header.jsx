"use client";
import React, { useState } from 'react';
import ModalVideo from "react-modal-video";
import "react-modal-video/css/modal-video.css";
import { Link as ScrollLink } from 'react-scroll';

const Header = ({}) => {
  const [isOpen, setOpen] = useState(false);
  const [videoId, setVideoId] = useState("");

  const openVideo = (e, id) => {
    e.preventDefault();
    setVideoId(id);
    setOpen(true);
  }

  return (
    <header className="style-4" data-scroll-index="0">
      <div className="content">
        <div className="container">
          <div className="row gx-0">

            <div className="col-lg-6 animate-fadeRight">
              <div className="info">
                <small className="mb-50 title_small animate-fadeUp" style={{ transitionDelay: '100ms' }}>
                  {'Desarrollo de Aplicaciones Móviles'}
                </small>
                <h1 className="mb-30 animate-fadeUp" style={{ transitionDelay: '200ms' }}>
                  {'Apps Android e iOS:'} <span>{'Diseño Innovador y Desarrollo Profesional'}</span>
                </h1>
                <p
                  className="text animate-fadeUp geo-answer"
                  data-speakable="true"
                  style={{ transitionDelay: '320ms' }}
                >
                  {'Undercodeec es una empresa de desarrollo de aplicaciones móviles para Android e iOS. Creamos apps nativas (Kotlin, Swift) y multiplataforma (Flutter, React Native) con diseño UI/UX profesional, publicación en Play Store y App Store, soporte técnico post-lanzamiento y precios desde 2.000 USD. Atendemos clientes en Ecuador, España y Latinoamérica.'}
                </p>
                <div className="d-flex align-items-center mt-50 animate-scaleUp" style={{ transitionDelay: '440ms' }}>
                  <a className="btn rounded-pill bg-blue4 fw-bold text-white me-4" href="#">
                    <ScrollLink href="portafolio" smooth={true} duration={800} offset={-100}>
                      <small><i className="fab fa-apple me-2 pe-2 border-end"></i>{'Ver Demos'}</small>
                    </ScrollLink>
                  </a>
                  <a
                    href="https://youtube.com/shorts/ZvHLP2f7iu4"
                    className="play-btn"
                    onClick={(e) => openVideo(e, "ZvHLP2f7iu4")}
                  >
                    <span className="icon me-2">
                      <i className="fas fa-play ms-1"></i>
                    </span>
                    <strong className="small">{'Video Promocional'}</strong>
                  </a>
                </div>
              </div>
            </div>

            <div className="col-lg-6 animate-fadeLeft" style={{ transitionDelay: '150ms' }}>
              <div className="img">
                <img src="/assets/img/header/banner_app1.webp" alt="Desarrollo de aplicaciones móviles Android e iOS - Undercodeec" />
              </div>
            </div>

          </div>
        </div>
        <img src="/assets/img/header/header_4_bubble.png" alt="Burbujas decorativas desarrollo de apps" className="bubble" />
      </div>
      <img src="/assets/img/header/header_4_wave.png" alt="Onda decorativa sección apps móviles" className="wave" />
      {typeof window !== "undefined" && (
        <ModalVideo
          channel="youtube"
          autoplay
          isOpen={isOpen}
          videoId={videoId}
          onClose={() => setOpen(false)}
        />
      )}
    </header>
  );
}

export default Header;
