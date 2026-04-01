"use client";
import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbars/DataAnalysis';
import '../Slider/slider.css';

const backgroundPattern = '/assets/slider/6fa818bb935c0e2a1081f259d84df226b237a184.png';

const Header = () => {
  return (
    <>
      <Navbar />
      <div className="tw-relative tw-w-full tw-h-[100dvh] tw-min-h-[700px] tw-overflow-hidden">
        {/* Animated Gradient Background */}
        <div className="tw-absolute tw-inset-0 gradient-bg tw-z-0 tw-pointer-events-none" />
        
        {/* Rotating Background Pattern */}
        <div className="tw-absolute tw-inset-0 tw-flex tw-items-center tw-justify-center tw-pointer-events-none tw-z-[1]">
          <img 
            src={backgroundPattern} 
            alt="Background Pattern" 
            className="rotating-pattern tw-w-full tw-h-full tw-object-cover tw-opacity-30 tw-pointer-events-none"
          />
        </div>
        
        {/* Additional gradient blobs */}
        <div className="gradient-blob-1 tw-pointer-events-none" />
        <div className="gradient-blob-2 tw-pointer-events-none" />
        <div className="gradient-blob-3 tw-pointer-events-none" />

        {/* Megaphone floating on the left side */}
      

        <div className="tw-h-full tw-relative tw-z-30 tw-flex tw-items-center tw-justify-center tw-px-4 md:tw-px-8 lg:tw-px-16">
          <div className="tw-container tw-mx-auto tw-max-w-7xl">
            <div className="tw-grid lg:tw-grid-cols-2 tw-gap-8 lg:tw-gap-16 tw-items-center">
              
              {/* Content Left */}
              <motion.div
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="tw-z-[60] tw-relative tw-space-y-6 lg:tw-space-y-8"
              >
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="gradient-title tw-text-[32px] sm:tw-text-[40px] md:tw-text-[60px] tw-font-bold tw-leading-tight"
                >
                  Soluciones de Software Esenciales <br /> para Pequeños Negocios
                  <span className="ms-2 tw-inline-block tw-relative">
                    <img src="/assets/img/header/subrrayado.png" alt="" className="tw-absolute tw--bottom-4 tw-left-0 tw-w-full tw-opacity-70" style={{ zIndex: -1 }} />
                    <img src="/assets/img/header/head5_pen.png" alt="" className="tw-absolute tw--top-6 tw--right-8 tw-w-12" />
                  </span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="tw-text-lg md:tw-text-xl tw-leading-relaxed tw-max-w-2xl tw-text-gray-900"
                >
                  En Undercodeec, nos especializamos en ofrecer soluciones de software integrales y personalizadas diseñadas para optimizar la eficiencia y crecimiento de tu pequeño o mediano negocio.
                </motion.p>
              </motion.div>

              {/* Content Right (Image with effects) */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="tw-relative tw-flex tw-items-center tw-justify-center tw-h-[400px] lg:tw-h-[500px]"
              >
                {/* Glow Effect */}
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                  }}
                  className="tw-absolute tw-inset-0 tw-rounded-full tw-blur-3xl"
                  style={{ background: '#ba27f4' }}
                />
                
                {/* Rotating Ring */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  className="tw-absolute tw-inset-0 tw-flex tw-items-center tw-justify-center"
                >
                  <div 
                    className="tw-w-[90%] tw-h-[90%] tw-rounded-full tw-border-4 tw-border-dashed"
                    style={{ borderColor: `#ba27f440` }}
                  />
                </motion.div>

                {/* Main Image */}
                <div className="tw-relative tw-w-full tw-h-full tw-flex tw-items-center tw-justify-center tw-z-10">
                   <div className="tw-relative tw-w-full tw-h-full tw-z-20 tw-flex tw-justify-center tw-items-center">
                      <motion.img 
                        src="/assets/img/header/Animation3DSoftware.webp" 
                        alt="Software Solutions" 
                        className="tw-w-[80%] lg:tw-w-full tw-max-w-[500px] tw-object-contain tw-drop-shadow-2xl"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 1 }}
                      />
                   </div>

                   {/* Floating decorative elements */}
                   <motion.img 
                      src="/assets/img/header/rocket.png"
                      alt="Rocket"
                      className="tw-absolute tw-z-30 tw-w-[40%] tw-max-w-[200px] lg:tw-max-w-[300px] tw-object-contain tw-drop-shadow-2xl tw-pointer-events-none"
                      style={{ left: '-30%', bottom: '10%' }}
                      animate={{ y: [0, -20, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                   />

                   <motion.img 
                      src="/assets/img/header/head6_rating.png"
                      alt="Rating"
                      className="tw-absolute tw-w-20 lg:tw-w-24 tw-top-0 tw-right-0 tw-z-30 tw-drop-shadow-xl tw-pointer-events-none"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                   />

                   <motion.img 
                      src="/assets/img/header/header5_piechart.png"
                      alt="Pie Chart"
                      className="tw-absolute tw-w-16 lg:tw-w-20 tw-top-5 tw-left-0 tw-z-30 tw-drop-shadow-xl tw-pointer-events-none"
                      animate={{ y: [0, -12, 0], rotate: [0, 5, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.7 }}
                   />

                   <motion.img 
                      src="/assets/img/header/header5_linechart.png"
                      alt="Chart"
                      className="tw-absolute tw-w-24 lg:tw-w-28 tw-bottom-10 tw--right-5 tw-z-30 tw-drop-shadow-xl tw-pointer-events-none"
                      animate={{ y: [0, 15, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                   />
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Bottom Decorative Elements */}
        <div className="tw-absolute tw-bottom-0 tw-left-0 tw-right-0 tw-h-[150px] tw-flex tw-flex-col tw-justify-end tw-pointer-events-none tw-z-50">
          <div className="tw-w-full tw-h-full tw-bg-gradient-to-b tw-from-white/0 tw-via-white/80 tw-to-white"></div>
          <div className="tw-w-full tw-h-2 tw-bg-white"></div>
        </div>
      </div>
    </>
  )
}

export default Header
