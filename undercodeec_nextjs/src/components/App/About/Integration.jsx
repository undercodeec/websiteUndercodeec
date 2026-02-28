import React from 'react';

const Integration = ({ integrations, rtl }) => {
  return (
    <div className="integration pt-60" data-scroll-index="3">
      <div className="section-head text-center style-4">
        <h2 className="mb-20">{ rtl ? 'متوافق مع' : 'Integración con tus' } <span>{ rtl ? 'التطبيقات الشعبية' : 'aplicaciones' }</span> </h2>
        <p>{ rtl ? 'نوتيرو يتكامل مع التطبيقات الشعبية. تساعدك على التواصل والتعاون بسهولة' : 'Integramos tus aplicaciones con plataformas seguras y reconocidas' }</p>
      </div>
      <div className="container">
        <div className="content">
          {
            integrations.map((integration, index) => (
              <div className="img" key={index}>
                <img src={integration} alt="" className="mt-30" />
              </div>
            ))
          }
        </div>
      </div>
      <img src="/assets/img/about/intg_back.png" alt="" className="intg-back" />
    </div>
  )
}

export default Integration
