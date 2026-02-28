import React, { useState } from 'react';
import ModalVideo from "react-modal-video";
import "react-modal-video/css/modal-video.css";
import { Link as ScrollLink } from 'react-scroll';

const Header = ({ rtl }) => {
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
                <small className="mb-50 title_small">{rtl ? 'نوتيرو - تطبيق مذكرة سهل الاستخدام' : 'Aplicaciones a Medida'}</small>
                <h1 className="mb-30">{rtl ? 'احفظ' : 'Diseño Innovador'} <span>{rtl ? 'كل شئ' : 'Desarrollo Imparable'}</span> </h1>
                <p className="text">{rtl ? 'لا يلزم الترميز لإجراء التخصيصات...' : '¡Desarrollamos más que aplicaciones! Creamos experiencias móviles que impactan. Con un enfoque centrado en el usuario, cada aplicación que diseñamos está pensada para ser intuitiva, funcional y, sobre todo, ¡adictiva! Únete a los miles de clientes satisfechos que ya disfrutan de nuestros desarrollos.'}</p>
                <div className="d-flex align-items-center mt-50">

                  <a className="btn rounded-pill bg-blue4 fw-bold text-white me-4" href="#">
                    <ScrollLink
                      href="portafolio"
                      smooth={true}
                      duration={800}
                      offset={-100}
                    >
                      <small><i className="fab fa-apple me-2 pe-2 border-end"></i>{rtl ? 'تحميل التطبيق' : 'Ver Demos'}</small>
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
                    <strong className="small">{rtl ? 'البرومو' : 'Video Promocional'}</strong>
                  </a>

                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="img">
                <img src="/assets/img/header/banner_app1.webp" alt="" />
              </div>
            </div>
          </div>
        </div>
        <img src="/assets/img/header/header_4_bubble.png" alt="" className="bubble" />
      </div>
      <img src="/assets/img/header/header_4_wave.png" alt="" className="wave" />
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
