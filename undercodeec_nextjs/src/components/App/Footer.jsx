import React from 'react';
import Link from 'next/link';

const Blog = () => {
  return (
    <section className="chat-banner style-3 section-padding">
      <div className="container">
        <div className="row align-items-center">

          <div className="col-lg-7 animate-fadeRight">
            <div className="info" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <img
                src="/assets/img/undercode-logo.png"
                alt="UnderCodeec"
                style={{ filter: 'brightness(0) invert(1)', width: '50px', height: 'auto', flexShrink: 0 }}
              />
              <h3 style={{ margin: 0 }}>Creando Soluciones Digitales:
                <span>Webs y Apps de Alto Impacto</span>
              </h3>
            </div>
          </div>

          <div className="col-lg-5 animate-fadeLeft" style={{ transitionDelay: '150ms' }}>
            <div className="bttns text-end">
              <a
                href="https://wa.me/593979046329?text=Hola%20Undercodeec%2C%20me%20gustar%C3%ADa%20obtener%20informaci%C3%B3n%20sobre%20sus%20servicios.%20%C2%BFMe%20pueden%20ayudar%20con%20alguna%20de%20estas%20opciones%3F%0A%0A1.%20Quiero%20saber%20m%C3%A1s%20sobre%20p%C3%A1ginas%20web%0A2.%20Quiero%20cotizar%20un%20proyecto%0A3.%20Quiero%20ver%20el%20portafolio%20de%20trabajos%20web%0A4.%20Quiero%20ver%20el%20portafolio%20de%20aplicaciones%20m%C3%B3viles%0A5.%20Quiero%20hablar%20con%20un%20asesor"
                target="_blank"
                rel="noopener noreferrer"
                className="btn rounded-pill bg-white border-1 border-white text-dark sm-butn me-2 animate-scaleUp"
                style={{ transitionDelay: '200ms' }}
              >
                <span>Chat Whatsapp</span>
              </a>
              <Link
                href="/contacto"
                className="btn rounded-pill border-1 border-white text-white sm-butn animate-scaleUp"
                style={{ transitionDelay: '300ms' }}
              >
                <span>Información</span>
              </Link>
            </div>
          </div>

        </div>
      </div>

      <footer className="style-3">
        <div className="container">
          <div className="row gx-0 justify-content-between">

            <div className="col-lg-3 col-sm-6 animate-fadeUp" style={{ transitionDelay: '0ms' }}>
              <div className="items">
                <div className="title">Nosotros</div>
                <small className="text">
                  Somos expertos en diseño y desarrollo web, creando soluciones innovadoras para negocios que buscan destacar en el mundo digital.
                </small>
                <div className="socail-icons">
                  <a href="https://www.facebook.com/undercodeec" className="icon-35 rounded-circle bg-gray overflow-hidden d-inline-flex align-items-center justify-content-center text-gray me-2">
                    <i className="fab fa-facebook-f"></i>
                  </a>
                  <a href="https://www.instagram.com/undercodeec/" className="icon-35 rounded-circle bg-gray overflow-hidden d-inline-flex align-items-center justify-content-center text-gray">
                    <i className="fab fa-instagram"></i>
                  </a>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-sm-6 animate-fadeUp" style={{ transitionDelay: '100ms' }}>
              <div className="items">
                <div className="title">Contacto</div>
                <ul>
                  <li>Atención remota · Cobertura internacional</li>
                  <li>gerencia@undercodeec.com</li>
                </ul>
              </div>
            </div>

            <div className="col-lg-2 animate-fadeUp" style={{ transitionDelay: '200ms' }}>
              <div className="items">
                <div className="title">Enlaces Rápidos</div>
                <ul>
                  <li><Link href="/">Inicio</Link></li>
                  <li><Link href="/nuestra-trayectoria">Nuestra Trayectoria</Link></li>
                  <li><Link href="/servicios">Servicios</Link></li>
                  <li><Link href="/politicas-playconsole">Términos y Condiciones</Link></li>
                  <li><Link href="/contacto">Contactos</Link></li>
                </ul>
              </div>
            </div>

            <div className="col-lg-2 animate-fadeUp" style={{ transitionDelay: '300ms' }}>
              <div className="items">
                <div className="title">Servicios</div>
                <ul>
                  <li><Link href="/aplicaciones-moviles">Aplicaciones móviles</Link></li>
                  <li><Link href="/marketing-para-tu-negocio">Marketing para tu negocio</Link></li>
                  <li><Link href="/software-para-tu-negocio">Software para tu negocio</Link></li>
                </ul>
              </div>
            </div>

          </div>

          <div className="foot">
            <div className="row">
              <div className="col-lg-3 col-sm-6"></div>
              <div className="col-lg-6">
                <small className="small">
                  © 2025 <a href="/politicas-playconsole" className="fw-bold text-decoration-underline">Undercodeec</a>. Todos los derechos reservados y diseñados por nosotros.
                </small>
              </div>
            </div>
          </div>
        </div>
        <img src="/assets/img/contact_globe.svg" alt="" className="contact_globe animate-scaleUp" style={{ transitionDelay: '400ms' }} />
      </footer>
    </section>
  );
}

export default Blog;
