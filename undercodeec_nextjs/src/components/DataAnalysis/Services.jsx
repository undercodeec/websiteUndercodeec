import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore, { Autoplay } from 'swiper';
import services from '@/data/DataAnalysis/services.json';

import "swiper/css";
import 'swiper/css/autoplay';

SwiperCore.use([Autoplay]);

const Services = () => {
  const [load, setLoad] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setLoad(true);
    });
  }, []);

  return (
    <section className="services style-8 section-padding">
      <div className="container">
        <div className="section-head style-8 text-center mb-80 wow fadeInUp">
          <h3> Nuestros Servicios </h3>
        </div>
      </div>
      <div className="content wow fadeInUp">
        <div className="services-slider8 pb-60">
          {
            load && (
              <Swiper
                spaceBetween={50}
                speed={10000}
                autoplay={{
                  delay: 1
                }}
                loop={true}
                breakpoints={{
                  0: {
                    slidesPerView: 1,
                  },
                  480: {
                    slidesPerView: 1,
                  },
                  787: {
                    slidesPerView: 1,
                  },
                  991: {
                    slidesPerView: 3,
                  },
                  1200: {
                    slidesPerView: 4,
                  }
                }}
              >
                {
                  services.map((service, index) => (
                    <SwiperSlide key={index}>
                      <div className="service-card style-8">
                        <div className="icon">
                          <img src={service.image} alt="" />
                        </div>
                        <div className="info">
                          <h5>{service.title}</h5>
                          <p>{service.text}</p>
                        </div>
                      </div>
                    </SwiperSlide>
                  ))
                }
              </Swiper>
            )
          }
        </div>
        <div className="container">

        </div>
      </div>
    </section>
  )
}

export default Services
