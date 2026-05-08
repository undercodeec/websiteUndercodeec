import React from 'react';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper';
import services from '@/data/Saas/services.json';


import "swiper/css";
import "swiper/css/autoplay";

const Services = ({}) => {
  const servicesData = services;

  return (
    <section className="services section-padding bg-white pb-50 style-6">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="section-head text-center mb-60 style-5">
              <h2 className="mb-20">{'Nuestros'} <span>{'Servicios Top'}</span> </h2>
              <p>
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="content">
        <div className="services-slider position-relative style-6">
          <Swiper
            modules={[Autoplay]}
            className="swiper-container"
            slidesPerView={6}
            centeredSlides={true}
            spaceBetween={0}
            speed={1000}
            pagination={false}
            navigation={false}
            mousewheel={false}
            keyboard={true}
            autoplay={{
              delay: 4000
            }}
            loop={true}
            breakpoints={{
              0: {
                slidesPerView: 1
              },
              480: {
                slidesPerView: 1
              },
              787: {
                slidesPerView: 2
              },
              991: {
                slidesPerView: 4
              },
              1200: {
                slidesPerView: 6
              }
            }}
          >
            {
              servicesData.map((service, index) => (
                <SwiperSlide key={index}>
                  <div className="service-card style-6" onClick={() => { }}>
                    <div className="icon">
                      <img src={service.img} alt="" />
                    </div>
                    <div className="info">
                      <h5>{service.info}</h5>
                      <div className="text">
                        {service.text}
                      </div>
                    </div>
                  </div>
                </SwiperSlide>

              ))
            }
          </Swiper>
        </div>
      </div>
    </section>
  )
}

export default Services
