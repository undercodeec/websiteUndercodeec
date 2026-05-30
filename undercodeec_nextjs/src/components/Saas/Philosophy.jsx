"use client";
import React from 'react';
import Script from 'next/script';
import { motion } from 'framer-motion';

const linkItems = ['Innovación constante', 'Precios Competitivos', 'Enfoque en el usuario'];

const Philosophy = ({}) => {
  return (
    <section className="about section-padding style-5 style-6">
      <div className="content border-0 p-0">
        <div className="container">
          <div className="row align-items-center justify-content-between">

            {/* Columna de texto — entra desde la izquierda */}
            <motion.div
              className="col-lg-4 order-2 order-lg-0"
              initial={{ opacity: 0, x: -80 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="sec-head mb-30">
                {/* Label con wipe reveal */}
                <motion.h2
                  className="num"
                  initial={{ clipPath: 'inset(0 100% 0 0)', opacity: 0 }}
                  whileInView={{ clipPath: 'inset(0 0% 0 0)', opacity: 1 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 1.1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                >
                  <span className="color-grd" style={{ display: 'inline-block' }}>
                    {'NUESTRA'}<span className="thin"></span>
                  </span>
                </motion.h2>

                {/* Título grande con zoom + fade */}
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
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 1.05, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
                >
                  {'Filosofía'}
                </motion.h3>
              </div>

              {/* Párrafo: slide up suave */}
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 1.0, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                {'En nuestra agencia, creemos que la calidad de nuestro trabajo es lo que realmente nos define. Cada proyecto es una oportunidad para ofrecer soluciones innovadoras y eficientes, siempre con un enfoque en la satisfacción total de nuestros clientes. Nos comprometemos a mantener los más altos estándares de diseño web y desarrollo de aplicaciones móviles, asegurándonos de que cada detalle de tu proyecto esté alineado con tus objetivos.'}
              </motion.p>

              {/* Links con stagger escalonado */}
              <div className="line-links">
                {linkItems.map((text, i) => (
                  <motion.a
                    key={i}
                    href="#"
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.85, delay: 0.45 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                    whileHover={{ x: 8, transition: { duration: 0.2 } }}
                    style={{ display: 'inline-block' }}
                  >
                    {text}
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Columna de video — entra desde la derecha con escala */}
            <motion.div
              className="col-lg-6"
              initial={{ opacity: 0, x: 80, scale: 0.95 }}
              whileInView={{ opacity: 1, x: 0, scale: 1 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 1.25, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="img">
                <div style={{ padding: '56.25% 0 0 0', position: 'relative' }}>
                  <iframe
                    src="https://player.vimeo.com/video/1176609262?badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479&amp;autoplay=1&amp;muted=1&amp;loop=1&amp;controls=0&amp;title=0&amp;byline=0&amp;portrait=0"
                    frameBorder="0"
                    allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                    title="Creación_de_Video_D_con_Imagen"
                  ></iframe>
                </div>
                <Script src="https://player.vimeo.com/api/player.js" strategy="lazyOnload" />
              </div>
            </motion.div>

          </div>
        </div>
      </div>

      {/* Burbuja decorativa con float continuo */}
      <motion.img
        src="/assets/img/about/about_s6_bubbles.png"
        alt=""
        className="bubbles rotate-center"
        animate={{ y: [0, -18, 0], scale: [1, 1.04, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
    </section>
  );
};

export default Philosophy;
