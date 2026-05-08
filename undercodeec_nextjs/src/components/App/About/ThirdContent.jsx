import React, { useState } from 'react';

const ThirdContent = ({ features }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="content trd-content">
      <div className="container">
        <div className="row align-items-center justify-content-between">
          <div className="col-lg-6">
            <div className="img mb-30 mb-lg-0">
              <img src="/landing-preview/img/baner_1.webp" alt="" />
            </div>
          </div>
          <div className="col-lg-5">
            <div className="info">
              <div className="section-head style-4">
                <h2 className="mb-30">{ ' Impulsa tu' } <span>{ 'Negocio ' }</span> </h2>
              </div>
              <p className="text mb-40">
                { 'Desarrollamos apps personalizadas con interfaces modernas y funcionales, como esta app de catálogo para restaurantes.' }
              </p>
              
              <div style={{ marginTop: '35px' }}>
                {
                  features.map((feature, index) => {
                    const isActive = activeIndex === index;
                    return (
                      <div key={index} className="w-100">
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
                            transition: 'color 0.3s ease'
                          }}
                        >
                          {feature.icon && <i className={`${feature.icon} me-2`}></i>}
                          { feature.title }
                        </a>
                        
                        {isActive && feature.desc && (
                          <div className="text-muted" style={{ fontSize: '14px', lineHeight: '1.6', padding: '10px 0 5px' }}>
                            { feature.desc }
                          </div>
                        )}
                      </div>
                    );
                  })
                }
              </div>
              
            </div>
          </div>
        </div>
      </div>
      <img src="/assets/img/about/about_s4_bubble.png" alt="" className="bubble" />
    </div>
  )
}

export default ThirdContent
