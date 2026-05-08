import React from 'react';
import Link from 'next/link';
import { playSoundWithFade } from '@/utils/audio';

const PreviewNavbar = ({ navbarRef }) => {
  const playSoftSound = (e) => {
    if (typeof window !== 'undefined') {
      if (window.location.pathname === '/' || window.location.pathname === '') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'instant' });
        window.dispatchEvent(new Event('resetPreloader'));
      }
      
      playSoundWithFade();
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light style-1 nav-preview py-0" ref={navbarRef} style={{ backgroundColor: '#f7bcc2' }}>
      <div className="container-xxl">
        <a className="navbar-brand" href="#">
          <img src="/assets/img/undercode-logo.png" alt="" className="preview-logo" />
        </a>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false"
          aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav m-auto mb-2 mb-lg-0">

          <li className="nav-item">
              <Link className="nav-links dropLink" href='/'>
                Inicio
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-links dropLink" href='/nuestra-trayectoria'>
                Nuestra trayectoria
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-links dropLink" href='/servicios'>
                Servicios
              </Link>
            </li>
            <li className="nav-item dropDown megaMenu col3">
              <a className="nav-links dropLink" href="#">
                Todo en Uno
                <small className="icon ms-1"><i className="bi bi-chevron-down me-1"></i></small>
              </a>
              <ul className="dropDownMenu">
                <li className="dropdown-items">
                  <a href="#" className="menuLink">multi-Paginas</a>
                  <ul className="subDropDown">

          
                  
                    <li>
                      <Link href="/aplicaciones-moviles" className="subLink">
                        Aplicaciones Móviles 
                      </Link>
                      <span className="new">Nuevo</span>
                    </li>
                
                    <li>
                      <Link href="/marketing-para-tu-negocio" className="subLink">
                      Marketing para tu negocio.
                      </Link>
                      <span className="new">Hot</span>

                    </li>
                    <li>
                      <Link href="/software-para-tu-negocio" className="subLink">
                        Software para tu negocio
                      </Link>
                    </li>
                    
                   {/*  ----------- Enlase para la tienda-------------------
                    <li>
                      <Link href="/page-shop-5" className="subLink">
                        shop
                      </Link>
                    </li>
                    */} 
                  </ul>
                </li>
                {/* one-page and RTL sections removed */}
              </ul>
            </li>
            <li className="nav-item">
              <Link className="nav-links dropLink" href='/blog'>
                Blog
              </Link>
            </li>
            <li className="nav-item">
              <a className="nav-links dropLink" href='/contacto'>
              Contáctanos
              </a>
            </li>
            
            
           
          </ul>
          <div className="nav-side flex-shrink-0">
            <div className="qoute-nav">
              <a href="#reserva_agenda" className="btn sm-butn butn-gard border-0 text-white">
                <span>Agendar Reunión</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default PreviewNavbar
