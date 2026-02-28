import React, { useState } from 'react';
import ModalVideo from "react-modal-video";
import "react-modal-video/css/modal-video.css";

const AboutHeader = ({ rtl, paddingTop }) => {
  const [isOpen, setOpen] = useState(false);

  const openVideo = (e) => {
    e.preventDefault();
    setOpen(true);
  }

  return (
    <header className={`about-page-sec style-5 ${paddingTop ? 'pt-100':''}`}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="info">
              <h1>{ rtl ? 'نحن نقدم حلول تكنولوجيا المعلومات  المثالية لأي' : <>Transformamos tus ideas en soluciones <br /> digitales </> }
                <span className="ms-2">
                  { rtl ? 'شركة ناشئة' : 'innovadoras' }
                  <img src="/assets/img/header/subrrayado.png" alt="" className="head-line" />
                  <img src="/assets/img/header/head5_pen.png" alt="" className="head-pen" />
                </span>
              </h1>
              <p>
                { rtl ? 'يساعدك Iteck على توحيد هوية علامتك التجارية من خلال جمع وتخزين ' : 'Somos un equipo joven y apasionado dedicado a crear experiencias digitales únicas. Nos especializamos en diseño web innovador y en el desarrollo de aplicaciones móviles a medida que no solo cumplen, sino que superan las expectativas de nuestros clientes. Cada proyecto es una oportunidad para fusionar creatividad, tecnología y funcionalidad, adaptándonos siempre a las necesidades específicas de cada cliente. Si buscas diseños modernos, tecnología avanzada y aplicaciones móviles intuitivas, estás en el lugar indicado.' } <br /> { rtl ? 'وتوزيع رموز وأصول التصميم - تلقائيًا.' : '' }
              </p>
            </div>
          </div>
            {/* Este es un comentario dentro del JSX 
          <div className="col-lg-12">
            <div className="main-vid">
              <img src="/assets/img/vid_banner5.png" alt="" />
              <a href="https://youtu.be/pGbIOC83-So?t=21" onClick={openVideo} className="play-icon">
                <i className="fas fa-play"></i>
              </a>
            </div>
          </div>
          */}
        </div>
      </div>
      <img src="/assets/img/header/hand_megaphone.png" alt="" className="hand-mega slide_up_down" />
      <img src="/assets/img/header/head6_rating.png" alt="" className="head6-rating scale_up_down" />
      <img src="/assets/img/header/header5_linechart.png" alt="" className="head6-charts scale_up_down" />
      <img src="/assets/img/header/rocket.png" alt="" className="head6-rocket" />
      {
        typeof window !== "undefined" && 
          (
            <ModalVideo
              channel="youtube"
              autoplay
              isOpen={isOpen}
              videoId="pGbIOC83-So"
              onClose={() => setOpen(false)}
            />
          )
      }
    </header>
  )
}

export default AboutHeader
