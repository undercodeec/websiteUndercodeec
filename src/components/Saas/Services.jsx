"use client";
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
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

            {/* Header con wipe reveal */}
            <div className="section-head text-center mb-60 style-5">
              <motion.h2
                className="mb-20"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                {'Nuestros'}{' '}
                <motion.span
                  initial={{ clipPath: 'inset(0 100% 0 0)' }}
                  whileInView={{ clipPath: 'inset(0 0% 0 0)' }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  style={{ display: 'inline-block' }}
                >
                  {'Servicios Top'}
                </motion.span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
              </motion.p>
            </div>

          </div>
        </div>
      </div>

      {/* Slider con scale + fade de entrada */}
      <motion.div
        className="content"
        initial={{ opacity: 0, scale: 0.96, y: 30 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.85, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      >
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
            autoplay={{ delay: 4000 }}
            loop={true}
            breakpoints={{
              0: { slidesPerView: 1 },
              480: { slidesPerView: 1 },
              787: { slidesPerView: 2 },
              991: { slidesPerView: 4 },
              1200: { slidesPerView: 6 },
            }}
          >
            {servicesData.map((service, index) => (
              <SwiperSlide key={index}>
                <motion.div
                  className="service-card style-6"
                  whileHover={{ y: -10, scale: 1.04, transition: { duration: 0.25 } }}
                >
                  <motion.div
                    className="icon"
                    whileHover={{ rotate: [0, -10, 10, 0], transition: { duration: 0.4 } }}
                  >
                    <img src={service.img} alt="" />
                  </motion.div>
                  <div className="info">
                    <h5>{service.info}</h5>
                    <div className="text">{service.text}</div>
                  </div>
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </motion.div>
    </section>
  );
};

export default Services;
