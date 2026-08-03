import React, { useState } from 'react';
import Link from 'next/link';

const Content = ({ list }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="content">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-8">
            <div className="img main-img2">
              <img src="/assets/img/about/about_s5_2_1.webp" alt="" />
              <img src="/assets/img/about/abaut_baner2.webp" alt="" className="img-body" />
            </div>
          </div>
          <div className="col-lg-4">
            <div className="section-head mb-30 style-5">
              <h2>{ 'Desarrollamos' } <span>{ 'Apps' }</span> </h2>
            </div>
            <p className="mb-4">
              { 'Diseñamos apps a medida para satisfacer las necesidades específicas de tu empresa. Desde la gestión de pagos hasta la experiencia de usuario, todo ajustado a ti. ¡Descubre cómo podemos ayudarte hoy!' }
            </p>
            
            <div className="line-links d-flex flex-column align-items-start">
              {
                list.map((item, index) => {
                  const isActive = activeIndex === index;
                  return (
                    <div key={index} className="w-100 mb-1">
                      <a 
                        href="#!" 
                        className="animated-link"
                        onClick={(e) => { e.preventDefault(); setActiveIndex(isActive ? -1 : index); }}
                        style={{
                          borderColor: isActive ? '#600b56' : '#ddd',
                          color: isActive ? '#600b56' : '#666',
                          backgroundColor: isActive ? '#f8f9fa' : 'transparent',
                          textDecoration: 'none',
                          display: 'inline-block'
                        }}
                      >
                        <i className={`${item.icon} me-2`}></i>
                        { item.title }
                      </a>
                      
                      {isActive && item.desc && (
                        <div className="mt-1 mb-3 p-3 rounded-3 bg-light text-muted border border-light" style={{ fontSize: '14px', lineHeight: '1.6' }}>
                          { item.desc }
                        </div>
                      )}
                    </div>
                  );
                })
              }
            </div>
            <Link href="/aplicaciones-moviles" className="btn rounded-pill blue5-3Dbutn hover-blue2 sm-butn fw-bold mt-50">
              <span>{ 'Saber Más' }</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Content
