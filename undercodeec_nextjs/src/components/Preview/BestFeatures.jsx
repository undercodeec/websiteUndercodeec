import React from 'react';
import features from '@/data/Preview/best-features.json';

const BestFeatures = () => {
  return (
    <section className="best-feat section-padding" data-overlay-dark="0">
      <div className="container">
        <div className="row">
          {
            features.map((item, i) => (
              <div className="col-lg-4 mb-50" key={i}>
                <div className="item">
                  <span className="icon">
                    <i className={item.icon}></i>
                  </span>
                  <h6>{ item.title }</h6>
                  <p>{ item.description }</p>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </section>
  )
}

export default BestFeatures
