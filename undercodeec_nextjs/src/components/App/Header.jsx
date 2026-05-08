import React, { useState } from 'react';
import ModalVideo from "react-modal-video";
import "react-modal-video/css/modal-video.css";
import { Link as ScrollLink } from 'react-scroll';

const Header = ({}) => {
  const [isOpen, setOpen] = useState(false);
  const [videoId, setVideoId] = useState(""); // estado para guardar el ID dinámico

  const openVideo = (e, id) => {
    e.preventDefault();
    setVideoId(id); // asignamos el ID del video
    setOpen(true);
  }

  return (
    <header className="style-4" data-scroll-index="0">
      <div className="content">
        <div className="container">
          <div className="row gx-0">
            <div className="col-lg-6">
              <div className="info">
                <small className="mb-50 title_small">{'Desarrollo de Aplicaciones Móviles en Ecuador'}</small>
                <h1 className="mb-30">{'Apps Android e iOS:'} <span>{'Diseño Innovador y Desarrollo Profesional'}</span> </h1>
                <p className="text">{'Somos una empresa de desarrollo de aplicaciones móviles en Quito, Ecuador. Creamos apps nativas y multiplataforma para Android e iOS con diseño UI/UX profesional. Desde apps de e-commerce, delivery y logística hasta gestión empresarial — cada aplicación está optimizada para rendimiento, seguridad y una experiencia de usuario excepcional. Publicamos tu app en Play Store y App Store.'}</p>
                <div className="d-flex align-items-center mt-50">

                  <a className="btn rounded-pill bg-blue4 fw-bold text-white me-4" href="#">
                    <ScrollLink
                      href="portafolio"
                      smooth={true}
                      duration={800}
                      offset={-100}
                    >
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
            <div className="col-lg-6">
              <div className="img">
                <img src="/assets/img/header/banner_app1.webp" alt="Desarrollo de aplicaciones móviles Android e iOS en Ecuador - Undercodeec" />
              </div>
            </div>
          </div>
        </div>
        <img src="/assets/img/header/header_4_bubble.png" alt="Burbujas decorativas desarrollo de apps" className="bubble" />
      </div>
      <img src="/assets/img/header/header_4_wave.png" alt="Onda decorativa sección apps móviles" className="wave" />
      {
        typeof window !== "undefined" && (
          <ModalVideo
            channel="youtube"
            autoplay
            isOpen={isOpen}
            videoId={videoId}
            onClose={() => setOpen(false)}
          />
        )
      }
    </header>
  );
}

export default Header;
