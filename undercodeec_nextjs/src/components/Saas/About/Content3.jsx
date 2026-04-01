import React, { useState } from 'react';

const Content = ({ texts, webLinks, number, rtl }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="content pb-0">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-4 order-2 order-lg-0">
            <div className="section-head mb-30 style-5">
              <h2>{ rtl ? 'سهل' : 'Desarrollo y ' } <span>{ rtl ? 'التخصيص' : 'Diseño Web' }</span> </h2>
            </div>
            <p>
              { texts.text1 }
            </p>
            <p className="mt-20 mb-4">
              { texts.text2 }
            </p>
            
            <div className="line-links d-flex flex-column align-items-start">
              {
                webLinks && webLinks.map((link, index) => {
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
                        {link.icon && <i className={`${link.icon} me-2`}></i>}
                        { link.title }
                      </a>
                      
                      {isActive && link.desc && (
                        <div className="mt-1 mb-3 p-3 rounded-3 bg-light text-muted border border-light" style={{ fontSize: '14px', lineHeight: '1.6' }}>
                          { link.desc }
                        </div>
                      )}
                    </div>
                  );
                })
              }
            </div>

            <a className="btn rounded-pill blue5-3Dbutn hover-blue2 sm-butn fw-bold mt-40" href="/"><span>Saber Más</span></a>

          </div>
          
          <div className="col-lg-8 order-0 order-lg-2">
            <div className="img main-img3">
              <img src="/assets/img/about/about_s5_3_1.png" alt="" className="img-body" />
              
              <img src="/assets/img/about/abaout_baner3.webp" alt="" />
             
              
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Content
