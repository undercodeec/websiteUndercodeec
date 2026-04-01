"use client";
import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbars/StartupNav';
import '@/components/Slider/slider.css';

export default function MarketingHero() {
  return (
    <div className="tw-relative tw-w-full tw-min-h-[100dvh] tw-overflow-hidden">
      {/* Navbar */}
      <div className="tw-relative tw-z-50">
        <Navbar />
      </div>

      {/* Animated Gradient Background */}
      <div className="tw-absolute tw-inset-0 gradient-bg tw-z-0 tw-pointer-events-none" />
      
      {/* Rotating Background Pattern */}
      <div className="tw-absolute tw-inset-0 tw-flex tw-items-center tw-justify-center tw-pointer-events-none tw-z-[1]">
        <img 
          src="/assets/slider/6fa818bb935c0e2a1081f259d84df226b237a184.png"
          alt="Background Pattern" 
          className="rotating-pattern tw-w-full tw-h-full tw-object-cover tw-opacity-30 tw-pointer-events-none"
        />
      </div>
      
      {/* Additional gradient blobs */}
      <div className="gradient-blob-1 tw-pointer-events-none" />
      <div className="gradient-blob-2 tw-pointer-events-none" />
      <div className="gradient-blob-3 tw-pointer-events-none" />

      {/* === Scattered Marketing Illustrations (across the entire hero) === */}

      {/* Megaphone — top left */}
      <motion.img
        src="/assets/img/header/hand_megaphone.png"
        alt="Megáfono"
        className="tw-absolute tw-drop-shadow-2xl tw-z-[5] tw-hidden md:tw-block"
        style={{ width: '14%', top: '12%', left: '-2%' }}
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Charts — top right */}
      <motion.img
        src="/assets/img/header/header5_linechart.png"
        alt="Charts"
        className="tw-absolute tw-drop-shadow-2xl tw-z-[5] tw-hidden md:tw-block"
        style={{ width: '10%', top: '15%', right: '3%' }}
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Rating Stars — bottom left */}
      <motion.img
        src="/assets/img/header/head6_rating.png"
        alt="Rating"
        className="tw-absolute tw-drop-shadow-2xl tw-z-[5] tw-hidden md:tw-block"
        style={{ width: '13%', bottom: '15%', left: '8%' }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Rocket — bottom right */}
      <motion.img
        src="/assets/img/header/rocket.png"
        alt="Rocket"
        className="tw-absolute tw-drop-shadow-2xl tw-z-[5] tw-hidden md:tw-block"
        style={{ width: '12%', bottom: '8%', right: '5%' }}
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Target — bottom center */}
      <motion.img
        src="/assets/img/header/target_3d.png"
        alt="Target"
        className="tw-absolute tw-drop-shadow-2xl tw-z-[5] tw-hidden md:tw-block"
        style={{ width: '10%', bottom: '5%', left: '42%' }}
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
      />

      {/* Content wrapper */}
      <div className="tw-relative tw-h-full tw-flex tw-items-center tw-justify-center tw-px-4 md:tw-px-8 lg:tw-px-16 tw-z-30 tw-py-24">
        <div className="tw-container tw-mx-auto tw-max-w-7xl">
          <div className="tw-grid lg:tw-grid-cols-2 tw-gap-8 lg:tw-gap-16 tw-items-center">
            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="tw-z-50 tw-relative tw-space-y-6 lg:tw-space-y-8"
            >
              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="gradient-title tw-text-[32px] sm:tw-text-[40px] md:tw-text-[64px] tw-font-bold tw-leading-tight"
              >
                Análisis SEO y marketing para tu Negocio
              </motion.h1>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="tw-text-lg md:tw-text-xl lg:tw-text-2xl tw-leading-relaxed tw-max-w-2xl tw-text-gray-800"
              >
                Tu socio estratégico en el mundo digital. Potenciamos tu marca con estrategias de marketing innovadoras y análisis SEO de precisión para alcanzar resultados excepcionales.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="tw-flex tw-flex-wrap tw-gap-4 tw-pt-4"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="tw-px-8 tw-py-4 tw-rounded-full tw-font-bold tw-text-white tw-text-lg tw-transition-all tw-duration-300"
                  style={{ backgroundColor: '#600b56' }}
                  onClick={() => {
                    const section = document.getElementById('demos');
                    if (section) section.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Ver Portafolio
                </motion.button>
              </motion.div>
            </motion.div>

            {/* === Banner-right image as main visual === */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="tw-relative tw-flex tw-items-center tw-justify-center tw-w-full tw-h-[400px] md:tw-h-[500px]"
            >
              {/* Use the original banner-right structure with its CSS classes */}
              <div className="banner-right" style={{ position: 'relative', width: '100%', maxWidth: '350px' }}>
                <img
                  src="/assets/img/choose_us/banerimg_1.webp"
                  alt="Banner gráfico"
                  className="body-img"
                />
                <img
                  src="/assets/img/choose_us/banercabeza.webp"
                  alt="Cabeza animada"
                  className="head-img"
                  style={{ top: '2.5%', left: '28%', width: '16%' }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Bottom white gradient fade to blend with next section */}
      <div className="tw-absolute tw-bottom-0 tw-left-0 tw-right-0 tw-pointer-events-none tw-z-40" style={{ height: '200px', background: 'linear-gradient(to bottom, transparent 0%, white 70%, white 100%)' }} />
    </div>
  );
}
