import React from 'react';
import Link from 'next/link';

const Content = ({ list, rtl }) => {
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
              <h2>{ rtl ? 'أكثر من 100' : 'Desarrollamos' } <span>{ rtl ? 'بوابة دفع' : 'Apps' }</span> </h2>
            </div>
            <p>
              { rtl ? 'مع سوق Iteck ، اختر من بين مئات بوابات الدفع لعملائك. من PayPal إلى Stripe إلى Skrill ، Visa Debit ، Master Card ، إلخ' : 'Diseñamos apps a medida para satisfacer las necesidades específicas de tu empresa. Desde la gestión de pagos hasta la experiencia de usuario, todo ajustado a ti. ¡Descubre cómo podemos ayudarte hoy!' }
            </p>
            <ul className="list-icon">
              {
                list.map((item, index) => (
                  <li key={index}>
                    <span className="icon">
                      <i className={item.icon}></i>
                    </span>
                    <h6>{ item.title }</h6>
                  </li>
                ))
              }
            </ul>
            <Link href="/aplicaciones-moviles" className="btn rounded-pill blue5-3Dbutn hover-blue2 sm-butn fw-bold mt-50">
              <span>{ rtl ? 'احجز عرضًا تجريبيًا مجانيًا ' : 'Saber Más' }</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Content
