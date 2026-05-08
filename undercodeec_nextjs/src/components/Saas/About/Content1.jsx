import React, { useState } from 'react';

const Content = ({ links }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="content">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-4 order-2 order-lg-0">
            <div className="section-head mb-30 style-5">
              <h2> { 'Desarrollo de ' }<span>{ 'Software' } </span></h2>
            </div>
            <p>{ 'Nuestro enfoque está en proporcionar herramientas digitales esenciales que ayuden a tu empresa a mantenerse organizada, mejorar la experiencia del cliente y aumentar la productividad.' }</p>
            
            <div className="line-links mt-3 d-flex flex-column align-items-start">
              {
                links.map((link, index) => {
                  const title = typeof link === 'string' ? link : link.title;
                  const icon = typeof link === 'string' ? null : link.icon;
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
                        {icon && <i className={`${icon} me-2`}></i>}
                        { title }
                      </a>
                      
                      {isActive && (typeof link !== 'string') && link.desc && (
                        <div className="mt-1 mb-3 p-3 rounded-3 bg-light text-muted border border-light" style={{ fontSize: '14px', lineHeight: '1.6' }}>
                          { link.desc }
                        </div>
                      )}
                    </div>
                  );
                })
              }
            </div>

            <a className="btn rounded-pill blue5-3Dbutn hover-blue2 sm-butn fw-bold mt-30" href="/software-para-tu-negocio/"><span>Saber Más</span></a>
          </div>
          <div className="col-lg-8 order-0 order-lg-2">
            <div className="img main-img1">
              <img src="/assets/img/about/abaut_baner1.webp" alt="" className="img-body" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Content
