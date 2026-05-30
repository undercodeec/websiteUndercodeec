import React, { useState, useEffect } from 'react';
import testimonials from '@/data/Preview/testimonials.json';
import SwiperCore, { Autoplay } from "swiper"; // ✅ esta línea
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";

SwiperCore.use([Autoplay]);


const Testimonials = () => {
  const [load, setLoad] = useState(false);

  useEffect(() => {
    setLoad(true);
  }, []);

  return (
    <section className="testim-curv section-padding">
      <div className="container-xxl">
        <div className="row justify-content-center">
          <div className="col-lg-6 col-md-10">
            <div className="sec-head text-center mb-80 animate-fadeUp">
              <h2 className="color-000 text-capitalize">
                Personas reales, historias reales.<br /> Escucha a
                nuestra comunidad.</h2>
            </div>
          </div>
        </div>
      </div>
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="testim-grida animate-fadeIn" style={{ transitionDelay: '200ms' }}>
              <div className="swiper-container">
                {load && (
                  <Swiper
                    className="swiper-wrapper"
                    slidesPerView={3}
                    spaceBetween={30}
                    centeredSlides={true}
                    loop={true}
                    autoplay={{
                      delay: 3000, // tiempo entre slides (en ms)
                      disableOnInteraction: true,
                      pauseOnMouseEnter: true,
                    }}
                    breakpoints={{
                      1024: { slidesPerView: 3 },
                      768: { slidesPerView: 2 },
                      0: { slidesPerView: 1 }
                    }}
                  >

                    {
                      testimonials.map((testimonial, i) => (
                        <SwiperSlide key={i}>
                          <div className="item text-center">
                            
                            <div className="img-box mb-20">
                              <img src={testimonial.image} alt={testimonial.author} className="testimonial-img" />
                            </div>

                            <div className="info mb-15">
                              <h6 className="mb-10">{testimonial.author}</h6>
                              {testimonial.reason && (
                                <span className="fz-12 opacity-7 d-block">{testimonial.reason}</span>
                              )}
                            </div>

                            <div className="rate-star fz-10 mb-20">
                              {Array(testimonial.stars).fill().map((_, s) => <i className="fas fa-star" key={s}></i>)}
                            </div>

                            <div className="text">
                              <p>
                                {
                                  testimonial.comment.includes('<br>') ?
                                    (
                                      <>
                                        {testimonial.comment.split('<br>')[0]} <br /> {testimonial.comment.split('<br>')[1]}
                                      </>
                                    )
                                    :
                                    (
                                      testimonial.comment
                                    )
                                }
                              </p>
                            </div>
                          </div>
                        </SwiperSlide>
                      ))
                    }
                  </Swiper>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Testimonials
