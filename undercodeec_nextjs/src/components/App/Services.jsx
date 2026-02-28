import React from 'react';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import services from '@/data/App/services.json';

import "swiper/css";

const Services = () => {
  return (
    <section className="services section-padding bg-white pb-50 style-6">
      <div className="container">
        <div className="section-head text-center style-4 mb-60">
          <small className="title_small"> Software Apps </small>
          <h2 className="mb-20"> Our sTop <span> Servidces </span> </h2>
          <p> Notero intergrsdsdate with popular apps. Help you easy to connect and collaboration </p>
        </div>
      </div>
      <div className="content">
        <div className="services-slider position-relative style-6">
          <Swiper
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
              services.map((service, index) => (
                <SwiperSlide key={index}>
                  <Link href="/servicios" className="service-card style-6">
                    <div className="icon">
                      <img src={service.img} alt="" />
                    </div>
                    <div className="info">
                      <h5>{ service.info }</h5>
                      <div className="text">
                        { service.text }
                      </div>
                    </div>
                  </Link>
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
