import React from 'react';
import features from '@/data/App/features.json';
import featuresRTL from '@/data/App/features-rtl.json';

const Features = ({ rtl }) => {
  const featuresData = rtl ? featuresRTL : features;

  return (
    <section className="features pt-70 pb-70 style-4" data-scroll-index="1">
      <div className="container">
        <div className="section-head text-center style-4">
          <h2 className="mb-70">{ rtl ? 'خدمات' : 'Porque' } <span> { rtl ? 'رائعة' : 'Elegirnos' } </span> </h2>
        </div>
        <div className="content">
          {
            featuresData.map((feature, index) => (
              <div className="features-card" key={index}>
                <div className="icon img-contain">
                  <img src={feature.image} alt="" />
                  { feature.new && <span className="label icon-40 alert-success text-success rounded-circle small text-uppercase fw-bold">{ rtl ? 'جديد' : 'new' }</span> }
                </div>
                <h6>{ feature.title.text1 } <br /> { feature.title.text2 }</h6>
              </div>
            ))
          }
        </div>
      </div>
      <img src="/assets/img/feat_circle.webp" alt="" className="img-circle" />
    </section>
  )
}

export default Features
