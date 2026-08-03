"use client";
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Monitor, Smartphone, ShoppingCart, Code } from 'lucide-react';

const services = [
  {
    Icon: Monitor,
    title: 'Diseño Web',
    desc: 'Desarrollo de sitios web modernos, responsivos y personalizados.',
  },
  {
    Icon: Smartphone,
    title: 'Aplicaciones móviles',
    desc: 'Diseño y desarrollo de aplicaciones para iOS y Android.',
  },
  {
    Icon: ShoppingCart,
    title: 'E-commerce',
    desc: 'Soluciones de comercio electrónico adaptadas a tus necesidades.',
  },
  {
    Icon: Code,
    title: 'Software',
    desc: 'Soluciones de software a medida para tu negocio.',
  },
];

const ChooseUs = ({}) => {
  return (
    <section className="choose-us style-6">
      <div className="container">
        <div className="row justify-content-between gx-0">

          {/* Video izquierda — entra desde la izquierda con scale */}
          <motion.div
            className="col-lg-6"
            initial={{ opacity: 0, x: -90, scale: 0.94 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="img" style={{ marginLeft: '40px' }}>
              <div
                style={{
                  padding: '75% 0 0 0',
                  position: 'relative',
                  WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
                  maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
                }}
              >
                <iframe
                  src="https://player.vimeo.com/video/1177025633?background=1&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479&amp;autoplay=1&amp;muted=1&amp;loop=1&amp;controls=0"
                  frameBorder="0"
                  allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
                  title="Video_de_Personajes_Trabajando"
                ></iframe>
              </div>
            </div>
          </motion.div>

          {/* Columna derecha — entra desde la derecha */}
          <motion.div
            className="col-lg-4"
            initial={{ opacity: 0, x: 80 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 1.1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="info">
              <div className="sec-head mb-30">
                <h2 className="num"></h2>

                {/* Título con wipe reveal */}
                <motion.h3
                  style={{
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundImage: 'linear-gradient(to right, #600b56 0%, #270f31 30%, #270f31 30%, #efa238 73%, #efa238 100%)',
                    fontSize: '70px',
                    fontWeight: '800',
                    lineHeight: '1',
                    marginBottom: '20px',
                    paddingBottom: '15px',
                  }}
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 1.05, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                >
                  {'Nuestros Servicios'}
                </motion.h3>
              </div>

              {/* Lista de servicios con stagger escalonado */}
              <ul>
                {services.map(({ Icon, title, desc }, i) => (
                  <motion.li
                    key={i}
                    className={`d-flex ${i < services.length - 1 ? 'mb-40' : ''}`}
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{
                      duration: 0.6,
                      delay: 0.3 + i * 0.12,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    whileHover={{ x: 6, transition: { duration: 0.2 } }}
                  >
                    <motion.small
                      className="icon-50 me-4 flex-shrink-0 tw-bg-gray-100 tw-rounded-full tw-flex tw-items-center tw-justify-center"
                      whileHover={{ scale: 1.2, rotate: 8, transition: { duration: 0.25 } }}
                    >
                      <Icon className="tw-text-purple-600 tw-w-6 tw-h-6" />
                    </motion.small>
                    <div className="inf">
                      <h5 className="tw-font-bold tw-text-xl">{title}</h5>
                      <p className="fs-12px color-666 mt-2">{desc}</p>
                    </div>
                  </motion.li>
                ))}
              </ul>

              {/* Botón con bounce de entrada */}
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.85 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{
                  duration: 0.7,
                  delay: 0.75,
                  type: 'spring',
                  bounce: 0.4,
                }}
              >
                <Link
                  href="/servicios"
                  className="btn rounded-pill blue5-3Dbutn hover-blue2 sm-butn fw-bold mt-60 px-5"
                >
                  <span>{'Saber Mas'}</span>
                </Link>
              </motion.div>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Burbuja decorativa flotante */}
      <motion.img
        src="/assets/img/about/about_s6_bubbles.png"
        alt=""
        className="bubbles rotate-center"
        animate={{ y: [0, -20, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />
    </section>
  );
};

export default ChooseUs;
