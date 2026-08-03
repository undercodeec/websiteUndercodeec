"use client";
import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore, { Autoplay } from 'swiper';
import { motion } from 'framer-motion';
import clients from '@/data/Saas/clients.json';

import "swiper/css";
import 'swiper/css/autoplay';

SwiperCore.use([Autoplay]);

const Clients = ({ padding }) => {
  const [loadSwiper, setLoadSwiper] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setLoadSwiper(true);
    }, 0);
  }, []);

  return (
    <section
      className={`clients style-5 ${padding ? 'section-padding' : 'pb-100'}`}
      data-scroll-index="2"
    >
      {/* Header con wipe reveal */}
      <motion.div
        className="sec-head text-center mb-40"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <h2 className="num" style={{ marginTop: '40px' }}>
          <motion.span
            className="color-grd"
            initial={{ clipPath: 'inset(0 100% 0 0)' }}
            whileInView={{ clipPath: 'inset(0 0% 0 0)' }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: 'inline-block' }}
          >
            {'NUESTRAS HERRAMIENTAS'}<span className="thin"></span>
          </motion.span>
        </h2>
      </motion.div>

      <div className="content">
        {/* Primer slider: entra desde la izquierda */}
        <motion.div
          className="clients-slider5"
          initial={{ opacity: 0, x: -60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.85, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          {loadSwiper && (
            <Swiper
              className="swiper-container"
              dir={'ltr'}
              spaceBetween={0}
              centeredSlides={true}
              slidesPerView={6}
              speed={6000}
              autoplay={{ delay: 1, disableOnInteraction: true }}
              loop={true}
              allowTouchMove={false}
              breakpoints={{
                0: { slidesPerView: 2 },
                480: { slidesPerView: 2 },
                787: { slidesPerView: 3 },
                991: { slidesPerView: 4 },
                1200: { slidesPerView: 6 },
              }}
            >
              {clients.row1.map((client, i) => (
                <SwiperSlide key={i}>
                  <a href="#" className="img">
                    <img src={client} alt="" />
                  </a>
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </motion.div>

        {/* Segundo slider: entra desde la derecha */}
        <motion.div
          className="clients-slider5"
          dir="rtl"
          initial={{ opacity: 0, x: 60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.85, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          {loadSwiper && (
            <Swiper
              className="swiper-container"
              spaceBetween={0}
              centeredSlides={true}
              slidesPerView={6}
              speed={6000}
              autoplay={{ delay: 1, disableOnInteraction: true }}
              loop={true}
              allowTouchMove={false}
              breakpoints={{
                0: { slidesPerView: 2 },
                480: { slidesPerView: 2 },
                787: { slidesPerView: 3 },
                991: { slidesPerView: 4 },
                1200: { slidesPerView: 6 },
              }}
            >
              {clients.row2.map((client, i) => (
                <SwiperSlide key={i}>
                  <a href="#" className="img">
                    <img src={client} alt="" />
                  </a>
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default Clients;
