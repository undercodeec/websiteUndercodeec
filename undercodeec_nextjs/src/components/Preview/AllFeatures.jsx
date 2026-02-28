import React from 'react';
import features from '@/data/Preview/all-features.json';

const AllFeatures = () => {
  return (
    <section className="all-feat" data-overlay-dark="0">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="main-marq">
              <div className="slide-har st1">

                <div className="box">
                  {
                    features.map((feature, i) => (
                      <div className="item d-flex align-items-center justify-content-between" key={i}>
                        <span className={`icon ${feature.icon}`}></span>
                        <h6>{ feature.text }</h6>
                      </div>
                    ))
                  }
                </div>

                <div className="box">
                  {
                    features.map((feature, i) => (
                      <div className="item d-flex align-items-center justify-content-between" key={i}>
                        <span className={`icon ${feature.icon}`}></span>
                        <h6>{ feature.text }</h6>
                      </div>
                    ))
                  }
                </div>

              </div>
              <div className="slide-har st2">

                <div className="box">
                  {
                    features.map((feature, i) => (
                      <div className="item d-flex align-items-center justify-content-between" key={i}>
                        <span className={`icon ${feature.icon}`}></span>
                        <h6>{ feature.text }</h6>
                      </div>
                    ))
                  }
                </div>

                <div className="box">
                  {
                    features.map((feature, i) => (
                      <div className="item d-flex align-items-center justify-content-between" key={i}>
                        <span className={`icon ${feature.icon}`}></span>
                        <h6>{ feature.text }</h6>
                      </div>
                    ))
                  }
                </div>

              </div>
              <div className="slide-har st1">

                <div className="box">
                  {
                    features.map((feature, i) => (
                      <div className="item d-flex align-items-center justify-content-between" key={i}>
                        <span className={`icon ${feature.icon}`}></span>
                        <h6>{ feature.text }</h6>
                      </div>
                    ))
                  }
                </div>

                <div className="box">
                  {
                    features.map((feature, i) => (
                      <div className="item d-flex align-items-center justify-content-between" key={i}>
                        <span className={`icon ${feature.icon}`}></span>
                        <h6>{ feature.text }</h6>
                      </div>
                    ))
                  }
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AllFeatures
