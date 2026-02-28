import React, { useState, useRef } from 'react';
import CountTo from '../CountTo';
import numbers from '@/data/DataAnalysis/numbers.json';

const Numbers = () => {
  const numbersSectionRef = useRef(null);
  const [position] = useState({ from: 2500, to: 2750 });


  return (
    <section className="numbers style-8 pt-100">
      <div className="container">
        <div className="section-head style-8 text-center mb-80 wow fadeInUp">
          <h3> Plataformas de integración </h3>
        </div>
        <div className="content">
          <div className="logo-icon wow zoomIn">
            <img src="/assets/img/undercode-logo.png" alt="" className='softunder' />
          </div>
          <div className="plat-icons">
            <a href="#" className="icon icon-shadow slide_up_down">
              <img src="/assets/img/logos/log10.webp" alt="" />
            </a>
            <a href="#" className="icon slide_up_down">
              <img src="/assets/img/icons/numbers/2.webp" alt="" />
            </a>
            <a href="#" className="icon icon-shadow slide_up_down">
              <img src="/assets/img/logos/log1.webp" alt="" />
            </a>
            <a href="#" className="icon slide_up_down">
              <img src="/assets/img/icons/numbers/4.webp" alt="" />
            </a>
            <a href="#" className="icon icon-shadow slide_up_down">
              <img src="/assets/img/logos/log6.webp" alt="" />
            </a>
            <a href="#" className="icon icon-shadow slide_up_down">
              <img src="/assets/img/logos/log4.webp" alt="" />
            </a>
          </div>
          <img src="/assets/img/num8_circle.webp" alt="" className="num8_circle rotate-center" />
        </div>
      </div>
     
      <img src="/assets/img/icons/numbers/7.webp" alt="" className="r_shape rotate-center" />
    </section>
  )
}

export default Numbers
