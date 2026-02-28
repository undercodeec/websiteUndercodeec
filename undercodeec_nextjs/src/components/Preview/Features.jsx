import React from 'react';
import features from '@/data/Preview/features.json'

const Features = () => {
  return (
    <section className="feat-dark" data-overlay-dark="0">
      <div className="container">
        <div className="row">
          {
            features.map((feature, i) => (
              <div className="col-lg-4" key={i}>
                <div className="item d-flex text-white animate-fadeUp" style={{ transitionDelay: `${i * 150}ms` }}>
                  <div className="icon">
                    <span className="d-flex align-items-center justify-content-center">
                      <i className={feature.icon}></i>
                    </span>
                  </div>
                  <div className="cont">
                    <h6>{ feature.title }</h6>
                    <p>{ feature.description }</p>
                  </div>
                </div>
              </div>
            ))
          }
        </div>
      </div>
      <div className="pattern bg-img"></div>
    </section>
  )
}

export default Features
