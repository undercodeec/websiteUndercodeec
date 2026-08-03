"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore, { Pagination, Autoplay } from 'swiper';
import testimonials from '@/data/Saas/testimonials.json';

import "swiper/css";
import 'swiper/css/autoplay';
import 'swiper/css/pagination';

const Testimonials = ({}) => {
  const testimonialsData = testimonials;

  return (
    <section className="testimonials section-padding bg-gray5 style-5" data-scroll-index="5">
      <div className="container">

        {/* Header con wipe reveal en el span destacado */}
        <div className="section-head text-center mb-60 style-5">
          <motion.h2
            className="mb-20"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            {'Reseñas de'}{' '}
            <motion.span
              initial={{ clipPath: 'inset(0 100% 0 0)' }}
              whileInView={{ clipPath: 'inset(0 0% 0 0)' }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              style={{ display: 'inline-block' }}
            >
              {'Empresas'}
            </motion.span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {'Undercodeec es valorado por nuestros clientes y cuenta con la confianza de empresas tanto pequeñas como grandes.'}
          </motion.p>
        </div>
      </div>

      {/* Slider con scale + perspectiva de entrada */}
      <motion.div
        className="content"
        initial={{ opacity: 0, scale: 0.94, y: 40 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="testimonial-slider position-relative style-5">
          <Swiper
            modules={[Pagination, Autoplay]}
            className="swiper-container pb-70"
            spaceBetween={0}
            slidesPerView={4}
            speed={1000}
            pagination={{
              el: '.testimonial-slider.style-5 .swiper-pagination',
              clickable: true,
            }}
            navigation={false}
            mousewheel={false}
            keyboard={true}
            autoplay={{ delay: 4000 }}
            loop={true}
            breakpoints={{
              0: { slidesPerView: 1 },
              480: { slidesPerView: 1 },
              787: { slidesPerView: 2 },
              991: { slidesPerView: 3 },
            }}
          >
            {testimonialsData.map((testimonial, i) => (
              <SwiperSlide key={i}>
                <motion.a
                  href="#"
                  className="testi-card style-5"
                  whileHover={{
                    y: -8,
                    boxShadow: '0 20px 45px rgba(96, 11, 86, 0.14)',
                    transition: { duration: 0.25 },
                  }}
                  style={{ display: 'block' }}
                >
                  <div className="stars">
                    {Array(testimonial.stars).fill().map((_, t) => (
                      <i className="fas fa-star" key={t}></i>
                    ))}
                  </div>
                  <div className="text">{testimonial.comment}</div>
                  <div className="user mt-40 text-center">
                    <div className="icon-80 rounded-circle img-cover overflow-hidden m-auto">
                      <img src={testimonial.author.image} alt="" />
                    </div>
                    <h6>{testimonial.author.name}</h6>
                    <small>{testimonial.author.position}</small>
                  </div>
                </motion.a>
              </SwiperSlide>
            ))}
          </Swiper>
          <div className="swiper-pagination"></div>
        </div>
      </motion.div>
    </section>
  );
};

export default Testimonials;
