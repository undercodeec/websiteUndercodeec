"use client";
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import BinaryCodeBackground from '../common/BinaryCodeBackground';

const footerColumns = [
  {
    title: 'Nosotros',
    content: (
      <>
        <small className="text">
          Somos expertos en diseño y desarrollo web, creando soluciones innovadoras para negocios que buscan destacar en el mundo digital.
        </small>
        <div className="socail-icons">
          <motion.a
            href="https://www.facebook.com/undercodeec"
            className="icon-35 rounded-circle bg-gray overflow-hidden d-inline-flex align-items-center justify-content-center text-gray me-2"
            whileHover={{ scale: 1.2, rotate: 8, transition: { duration: 0.2 } }}
          >
            <i className="fab fa-facebook-f"></i>
          </motion.a>
          <motion.a
            href="https://www.instagram.com/undercodeec/"
            className="icon-35 rounded-circle bg-gray overflow-hidden d-inline-flex align-items-center justify-content-center text-gray"
            whileHover={{ scale: 1.2, rotate: -8, transition: { duration: 0.2 } }}
          >
            <i className="fab fa-instagram"></i>
          </motion.a>
        </div>
      </>
    ),
    colClass: 'col-lg-3 col-sm-6',
  },
  {
    title: 'Contacto',
    content: (
      <ul>
        <li>Atención remota · Cobertura internacional</li>
        <li>gerencia@undercodeec.com</li>
      </ul>
    ),
    colClass: 'col-lg-3 col-sm-6',
  },
  {
    title: 'Enlaces Rápidos',
    content: (
      <ul>
        <li><Link href="/">Inicio</Link></li>
        <li><Link href="/nuestra-trayectoria">Nuestra Trayectoria</Link></li>
        <li><Link href="/servicios">Servicios</Link></li>
        <li><Link href="/portal">Portal de clientes</Link></li>
        <li><Link href="/politicas-playconsole">Términos y Condiciones</Link></li>
        <li><Link href="/contacto">Contactos</Link></li>
      </ul>
    ),
    colClass: 'col-lg-2',
  },
  {
    title: 'Servicios',
    content: (
      <ul>
        <li><Link href="/aplicaciones-moviles">Aplicaciones móviles</Link></li>
        <li><Link href="/marketing-para-tu-negocio">Marketing para tu negocio</Link></li>
        <li><Link href="/software-para-tu-negocio">Software para tu negocio</Link></li>
      </ul>
    ),
    colClass: 'col-lg-2',
  },
];

const Footer = ({ noWave }) => {
  return (
    <section className="chat-banner style-3 section-padding">
      <BinaryCodeBackground />
      <div className="container">
        <div className="row align-items-center">

          {/* Info izquierda: entra desde la izquierda */}
          <motion.div
            className="col-lg-7"
            initial={{ opacity: 0, x: -70 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="info" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <motion.img
                src="/assets/img/undercode-logo.png"
                alt="UnderCodeec"
                style={{ filter: 'brightness(0) invert(1)', width: '50px', height: 'auto', flexShrink: 0 }}
                initial={{ opacity: 0, rotate: -20, scale: 0.7 }}
                whileInView={{ opacity: 1, rotate: 0, scale: 1 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.7, delay: 0.15, type: 'spring', bounce: 0.4 }}
              />
              <motion.h3
                style={{ margin: 0 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              >
                Creando Soluciones Digitales:
                <span>Webs y Apps de Alto Impacto</span>
              </motion.h3>
            </div>
          </motion.div>

          {/* Botones derecha: entran desde la derecha con stagger */}
          <motion.div
            className="col-lg-5"
            initial={{ opacity: 0, x: 70 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.85, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="bttns text-end">
              <motion.a
                href="https://wa.me/593979046329?text=Hola%20Undercodeec%2C%20me%20gustar%C3%ADa%20obtener%20informaci%C3%B3n%20sobre%20sus%20servicios.%20%C2%BFMe%20pueden%20ayudar%20con%20alguna%20de%20estas%20opciones%3F%0A%0A1.%20Quiero%20saber%20m%C3%A1s%20sobre%20p%C3%A1ginas%20web%0A2.%20Quiero%20cotizar%20un%20proyecto%0A3.%20Quiero%20ver%20el%20portafolio%20de%20trabajos%20web%0A4.%20Quiero%20ver%20el%20portafolio%20de%20aplicaciones%20m%C3%B3viles%0A5.%20Quiero%20hablar%20con%20un%20asesor"
                target="_blank"
                rel="noopener noreferrer"
                className="btn rounded-pill bg-white border-1 border-white text-dark sm-butn me-2"
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ scale: 1.06, y: -3, transition: { duration: 0.2 } }}
              >
                <span>Chat Whatsapp</span>
              </motion.a>

              <motion.div
                style={{ display: 'inline-block' }}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ scale: 1.06, y: -3, transition: { duration: 0.2 } }}
              >
                <Link
                  href="/contacto"
                  className="btn rounded-pill border-1 border-white text-white sm-butn"
                >
                  <span>Información</span>
                </Link>
              </motion.div>
            </div>
          </motion.div>

        </div>
      </div>

      <footer className="style-3">
        <div className="container">
          <div className="row gx-0 justify-content-between">

            {/* Columnas del footer con stagger de abajo hacia arriba */}
            {footerColumns.map((col, i) => (
              <motion.div
                key={i}
                className={col.colClass}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{
                  duration: 0.65,
                  delay: i * 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <div className="items">
                  <div className="title">{col.title}</div>
                  {col.content}
                </div>
              </motion.div>
            ))}

          </div>

          {/* Copyright con fade up */}
          <motion.div
            className="foot"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-20px' }}
            transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="row">
              <div className="col-lg-3 col-sm-6"></div>
              <div className="col-lg-6">
                <small className="small">
                  © 2025{' '}
                  <a href="/politicas-playconsole" className="fw-bold text-decoration-underline">
                    Undercodeec
                  </a>
                  . Todos los derechos reservados y diseñados por nosotros.
                </small>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.img
          src="/assets/img/contact_globe.svg"
          alt=""
          className="contact_globe"
          initial={{ opacity: 0, scale: 0.7 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        />
      </footer>
    </section>
  );
};

export default Footer;
