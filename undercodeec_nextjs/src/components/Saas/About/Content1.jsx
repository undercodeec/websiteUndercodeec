import React from 'react';

const Content = ({ links, rtl }) => {
  return (
    <div className="content">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-4 order-2 order-lg-0">
            <div className="section-head mb-30 style-5">
              <h2> { rtl ? 'المحسّنة' : 'Desarrollo de ' }<span>{ rtl ? 'تجارب المستخدم ' : 'Software' } </span></h2>
            </div>
            <p>{ rtl ? 'يمكن تبسيط عمليات التحميل والتحديث التي يقوم بها الموردون من خلال لوحات المعلومات الأمامية التي توفر سهولة الوصول بشكل أفضل.' : 'Nuestro enfoque está en proporcionar herramientas digitales esenciales que ayuden a tu empresa a mantenerse organizada, mejorar la experiencia del cliente y aumentar la productividad.' }</p>
            <div className="line-links">
              {
                links.map((link, index) => (<a href="#" key={index}>{ link }</a>))
              }
            </div>
            <a class="btn rounded-pill blue5-3Dbutn hover-blue2 sm-butn fw-bold mt-50" href="/software-para-tu-negocio/"><span>Saber Más</span></a>
          </div>
          <div className="col-lg-8 order-0 order-lg-2">
            <div className="img main-img1">
              <img src="/assets/img/about/about_s5_1_1.webp" alt="" className="sm-circle" />
              <img src="/assets/img/about/abaut_baner1.webp" alt="" className="img-body" />
              <img src="/assets/img/about/about_s5_1_3.webp" alt="" className="card1" />
              <img src="/assets/img/about/about_s5_1_4.webp" alt="" className="card2" />
              <img src="/assets/img/about/about_s5_1_5.webp" alt="" className="lg-circle" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Content
