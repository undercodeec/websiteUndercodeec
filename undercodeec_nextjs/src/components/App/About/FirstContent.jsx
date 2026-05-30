"use client";
import React, { useState } from 'react';

const FirstContent = ({ features }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="content frs-content" id="about" data-scroll-index="2">
      <div className="container">
        <div className="row align-items-center justify-content-between">

          <div className="col-lg-6 animate-fadeRight">
            <div className="img mb-30 mb-lg-0">
              <img src="/assets/img/about/ipad.png" alt="" />
            </div>
          </div>

          <div className="col-lg-5 animate-fadeLeft" style={{ transitionDelay: '150ms' }}>
            <div className="info">
              <div className="section-head style-4">
                <h2 className="mb-30 animate-fadeUp" style={{ transitionDelay: '200ms' }}>
                  {'Diseño'} <span>{'Creativo'}</span>
                </h2>
              </div>
              <p className="text mb-40 animate-fadeUp" style={{ transitionDelay: '300ms' }}>
                El diseño en aplicaciones móviles es más que solo una apariencia visual, es la clave para una experiencia de usuario fluida y atractiva. <br /> Un diseño bien pensado no solo mejora la interacción, sino que también hace que la navegación sea intuitiva, eficiente y placentera.
              </p>
              <div style={{ marginTop: '35px' }}>
                {features.map((item, index) => {
                  const isActive = activeIndex === index;
                  return (
                    <div key={index} className="w-100 animate-fadeUp" style={{ transitionDelay: `${350 + index * 80}ms` }}>
                      <a
                        href="#!"
                        className="animated-link"
                        onClick={(e) => { e.preventDefault(); setActiveIndex(isActive ? -1 : index); }}
                        style={{
                          position: 'relative',
                          color: isActive ? '#600b56' : '#000',
                          fontSize: '15px',
                          fontWeight: 'bold',
                          borderBottom: '1px solid rgba(153, 153, 153, 0.2)',
                          padding: '13px 0',
                          display: 'block',
                          width: '100%',
                          textDecoration: 'none',
                          transition: 'color 0.3s ease',
                        }}
                      >
                        {item.icon && <i className={`${item.icon} me-2`}></i>}
                        {item.title}
                      </a>
                      {isActive && item.desc && (
                        <div className="text-muted" style={{ fontSize: '14px', lineHeight: '1.6', padding: '10px 0 5px' }}>
                          {item.desc}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      </div>
      <img src="/assets/img/about/about_s4_lines.png" alt="" className="lines" />
      <img src="/assets/img/about/about_s4_bubble.png" alt="" className="bubble" />
    </div>
  );
}

export default FirstContent;
