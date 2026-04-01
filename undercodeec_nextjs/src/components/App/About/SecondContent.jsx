import React, { useState } from 'react';

const SecondContent = ({ accordions, rtl }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="content sec-content">
      <div className="container">
        <div className="row align-items-center justify-content-between">
          <div className="col-lg-5 order-2 order-lg-0">
            <div className="info">
              <div className="section-head style-4">
                <h2 className="mb-30">{ rtl ? 'ملاحظاتك' : 'Estándares de' } <span> { rtl ? 'في امان' : 'Seguridad' } </span></h2>
              </div>
              <p className="text mb-40">
                {
                 rtl ? 
                 'يتزامن تلقائيًا عبر جميع أجهزتك. يمكنك أيضًا الوصول إلى الملاحظات وكتابتها بدون اتصال بالإنترنت'
                 :
                 'La seguridad es uno de los pilares fundamentales en el desarrollo de aplicaciones móviles. A medida que la tecnología avanza, también lo hacen las amenazas. Por eso, nos aseguramos de que cada aplicación que diseñamos esté protegida con los más altos estándares de seguridad, garantizando la privacidad y protección de los datos de los usuarios desde el primer momento.' 
                }
              </p>
              
              <div style={{ marginTop: '35px' }}>
                {
                  accordions.map((accordion, index) => {
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
                          {accordion.icon && <i className={`${accordion.icon} me-2`}></i>}
                          { accordion.title }
                        </a>
                        
                        {isActive && accordion.content && (
                          <div className="text-muted" style={{ fontSize: '14px', lineHeight: '1.6', padding: '10px 0 5px' }}>
                            { accordion.content }
                          </div>
                        )}
                      </div>
                    );
                  })
                }
              </div>
              
            </div>
          </div>
          <div className="col-lg-6 order-0 order-lg-2">
            <div className="img mb-30 mb-lg-0">
              <img src="/assets/img/about/segurityapp.webp" alt="" />
            </div>
          </div>
        </div>
      </div>
      <img src="/assets/img/about/about_s4_bubble2.webp" alt="" className="bubble2" />
    </div>
  )
}

export default SecondContent
