import React from 'react';
import Link from 'next/link';
import { Monitor, Smartphone, ShoppingCart, Code } from 'lucide-react';

const ChooseUs = ({}) => {

  return (
    <section className="choose-us style-6">
      <div className="container">
        <div className="row justify-content-between gx-0">
          <div className="col-lg-6">
            <div className="img" style={{ marginLeft: '40px' }}>
              <div style={{ 
                padding: '75% 0 0 0', 
                position: 'relative',
                WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
                maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)'
              }}>
                <iframe
                  src="https://player.vimeo.com/video/1177025633?background=1&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479&amp;autoplay=1&amp;muted=1&amp;loop=1&amp;controls=0"
                  frameBorder="0"
                  allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
                  title="Video_de_Personajes_Trabajando"
                ></iframe>
              </div>
            </div>
          </div>
          <div className="col-lg-4">
            <div className="info">
              <div className="sec-head mb-30">
                <h2 className="num">
                  
                </h2>
                <h3 style={{
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundImage: 'linear-gradient(to right, #600b56 0%, #270f31 30%, #270f31 30%, #efa238 73%, #efa238 100%)',
                  fontSize: '70px',
                  fontWeight: '800',
                  lineHeight: '1',
                  marginBottom: '20px',
                  paddingBottom: '15px'
                }}>
                  { 'Nuestros Servicios' }
                </h3>
              </div>
              
              <ul>
                <li className="d-flex mb-40">
                  <small className="icon-50 me-4 flex-shrink-0 tw-bg-gray-100 tw-rounded-full tw-flex tw-items-center tw-justify-center">
                    <Monitor className="tw-text-purple-600 tw-w-6 tw-h-6" />
                  </small>
                  <div className="inf">
                    <h5 className="tw-font-bold tw-text-xl">Diseño Web</h5>
                    <p className="fs-12px color-666 mt-2">Desarrollo de sitios web modernos, responsivos y personalizados.</p>
                  </div>
                </li>
                
                <li className="d-flex mb-40">
                  <small className="icon-50 me-4 flex-shrink-0 tw-bg-gray-100 tw-rounded-full tw-flex tw-items-center tw-justify-center">
                    <Smartphone className="tw-text-purple-600 tw-w-6 tw-h-6" />
                  </small>
                  <div className="inf">
                    <h5 className="tw-font-bold tw-text-xl">Aplicaciones móviles</h5>
                    <p className="fs-12px color-666 mt-2">Diseño y desarrollo de aplicaciones para iOS y Android.</p>
                  </div>
                </li>

                <li className="d-flex mb-40">
                  <small className="icon-50 me-4 flex-shrink-0 tw-bg-gray-100 tw-rounded-full tw-flex tw-items-center tw-justify-center">
                    <ShoppingCart className="tw-text-purple-600 tw-w-6 tw-h-6" />
                  </small>
                  <div className="inf">
                    <h5 className="tw-font-bold tw-text-xl">E-commerce</h5>
                    <p className="fs-12px color-666 mt-2">Soluciones de comercio electrónico adaptadas a tus necesidades.</p>
                  </div>
                </li>

                <li className="d-flex">
                  <small className="icon-50 me-4 flex-shrink-0 tw-bg-gray-100 tw-rounded-full tw-flex tw-items-center tw-justify-center">
                    <Code className="tw-text-purple-600 tw-w-6 tw-h-6" />
                  </small>
                  <div className="inf">
                    <h5 className="tw-font-bold tw-text-xl">Software</h5>
                    <p className="fs-12px color-666 mt-2">Soluciones de software a medida para tu negocio.</p>
                  </div>
                </li>
              </ul>
              <Link href={ "/servicios" } className="btn rounded-pill blue5-3Dbutn hover-blue2 sm-butn fw-bold mt-60 px-5">
                <span>{ 'Saber Mas' }</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <img src="/assets/img/about/about_s6_bubbles.png" alt="" className="bubbles rotate-center" />
    </section>
  )
}

export default ChooseUs
