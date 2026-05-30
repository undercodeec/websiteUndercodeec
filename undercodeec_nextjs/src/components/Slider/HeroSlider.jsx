"use client";
import React, { useEffect, useRef, useState } from 'react';
import Slider from 'react-slick';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Palette } from 'lucide-react';
import { usePageReady } from '@/common/usePageReady';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './slider.css';

// Assets
const backgroundPattern = '/assets/slider/6fa818bb935c0e2a1081f259d84df226b237a184.png';
const phoneImageFloating = '/assets/slider/27243ea8ef847ba47c211ec9091848db1ffe8454.png';
const mobileImage = '/assets/slider/66f0344ac49f2d8983e5df4c83caa818ebfb5c45.png';
import HeroModel from '@/components/3D/HeroModel';

const slides = [
  {
    title: 'Diseño de Páginas Web Profesional a Medida',
    subtitle: '',
    description: 'Creación, Programación y Desarrollo de Aplicaciones Web',
    icon: Palette,
    color: '#600b56',
    type: 'character' // Tipo de slide para renderizar la imagen del personaje
  }
];

const CustomArrow = ({ direction, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`tw-absolute tw-top-1/2 tw--translate-y-1/2 ${direction === 'left' ? 'tw-left-4 md:tw-left-8' : 'tw-right-4 md:tw-right-8'} tw-z-20 tw-bg-black/10 tw-backdrop-blur-md hover:tw-bg-black/20 tw-rounded-full tw-p-3 md:tw-p-4 tw-transition-all tw-duration-300 tw-border tw-border-black/20 tw-shadow-lg`}
  >
    {direction === 'left' ? (
      <ChevronLeft className="tw-w-5 tw-h-5 md:tw-w-6 md:tw-h-6 tw-text-gray-900" />
    ) : (
      <ChevronRight className="tw-w-5 tw-h-5 md:tw-w-6 md:tw-h-6 tw-text-gray-900" />
    )}
  </motion.button>
);

export default function HeroSlider() {
  const sliderRef = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const isReady = usePageReady();

  useEffect(() => {
    setMounted(true);
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    fade: true,
    beforeChange: (_current, next) => setCurrentSlide(next),
    nextArrow: <CustomArrow direction="right" />,
    prevArrow: <CustomArrow direction="left" />,
    customPaging: () => (
      <div className="tw-w-3 tw-h-3 tw-mx-1 tw-rounded-full tw-bg-black/30 hover:tw-bg-black/60 tw-transition-all tw-duration-300" />
    ),
    dotsClass: 'slick-dots custom-dots !tw-bottom-8'
  };

  return (
    <div className="tw-relative tw-w-full tw-h-[100dvh] tw-overflow-hidden">
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
      
      {/* Slider */}
      <Slider ref={sliderRef} {...settings} className="tw-h-full tw-relative tw-z-30">
        {slides.map((slide, index) => (
          <div key={index} className="tw-h-[100dvh]">
            <div className="tw-relative tw-h-full tw-flex tw-items-center tw-justify-center tw-px-4 md:tw-px-8 lg:tw-px-16">
              <div className="tw-container tw-mx-auto tw-max-w-7xl">
                <div className="tw-grid lg:tw-grid-cols-2 tw-gap-8 lg:tw-gap-16 tw-items-center">
                  {/* Content */}
                  <motion.div
                    initial={{ opacity: 0, x: slide.type === 'video' ? 60 : -60 }}
                    animate={isReady && currentSlide === index ? { opacity: 1, x: 0 } : { opacity: 0, x: slide.type === 'video' ? 60 : -60 }}
                    transition={{ duration: 0.5, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
                    className={`tw-z-50 tw-relative tw-space-y-6 lg:tw-space-y-8 ${slide.type === 'video' ? 'lg:tw-order-2' : ''}`}
                  >
                    {/* Title */}
                    <motion.h1
                      initial={{ opacity: 0, y: 24 }}
                      animate={isReady && currentSlide === index ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
                      transition={{ duration: 0.45, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                      className="gradient-title tw-text-[42px] sm:tw-text-[40px] md:tw-text-[64px] tw-font-bold tw-leading-tight"
                    >
                      {slide.title}
                    </motion.h1>

                    {/* Description */}
                    <motion.p
                      initial={{ opacity: 0, y: 24 }}
                      animate={isReady && currentSlide === index ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
                      transition={{ duration: 0.45, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      className="tw-text-lg md:tw-text-xl lg:tw-text-2xl tw-leading-relaxed tw-max-w-2xl tw-text-gray-800"
                    >
                      {slide.description}
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div
                      initial={{ opacity: 0, y: 24 }}
                      animate={isReady && currentSlide === index ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
                      transition={{ duration: 0.45, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="tw-flex tw-flex-wrap tw-gap-4 tw-pt-4 tw-border-0"
                    >
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          const section = document.getElementById('demos');
                          if (section) section.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="tw-px-8 tw-py-4 tw-rounded-full tw-font-bold tw-text-white tw-text-lg tw-transition-all tw-duration-300 tw-border-0"
                        style={{ backgroundColor: '#600b56', border: 'none', outline: 'none' }}
                      >
                        Ver Portafolio
                      </motion.button>
                    </motion.div>
                  </motion.div>

                  {/* Media */}
                  {slide.type === 'character' ? (
                    /* Character Image */
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, rotate: -6 }}
                      animate={isReady && currentSlide === index ? { opacity: 1, scale: 1, rotate: 0 } : { opacity: 0, scale: 0.9, rotate: -6 }}
                      transition={{ duration: 0.55, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                      className="tw-relative tw-flex tw-items-center tw-justify-center"
                    >
                      
                      {/* Rotating Ring */}
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                        className="tw-absolute tw-inset-0 tw-flex tw-items-center tw-justify-center"
                      >
                        <div 
                          className="tw-w-[90%] tw-h-[90%] tw-rounded-full tw-border-4 tw-border-dashed"
                          style={{ borderColor: `${slide.color}40` }}
                        />
                      </motion.div>

                      {/* Character */}
                      <div className="tw-relative tw-flex tw-items-center tw-justify-center tw-w-[280px] tw-h-[280px] md:tw-w-[400px] md:tw-h-[400px] lg:tw-w-[500px] lg:tw-h-[500px]">
                        {/* Hero Model (3D Canvas) */}
                        <motion.div
                            className="tw-absolute tw-inset-0 tw-drop-shadow-2xl"
                            style={{ 
                              pointerEvents: 'auto',
                              zIndex: 10
                            }}
                            animate={{ 
                              y: [0, -20, 0],
                            }}
                            transition={{
                              y: { duration: 4, repeat: Infinity, ease: 'easeInOut' }
                            }}
                        >
                            {isMobile || !mounted ? (
                              <img src={mobileImage} alt="Mobile Character" className="tw-w-full tw-h-full tw-object-contain tw-drop-shadow-2xl" />
                            ) : (
                              <HeroModel isActive={true} />
                            )}
                        </motion.div>
                        
                        {/* Floating Phone */}
                        <motion.img
                          src={phoneImageFloating}
                          alt="Mobile Phone"
                          className="tw-absolute tw-drop-shadow-2xl"
                          style={{ 
                            width: '200px', 
                            height: '200px', 
                            objectFit: 'contain',
                            top: '50%',
                            right: '10%',
                          }}
                          animate={{
                            rotateY: [-15, 15, -15],
                            y: [0, -10, 0],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                        />
                      </div>
                    </motion.div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        ))}
      </Slider>

      {/* Styles inline for animations that Tailwind might miss or for specific custom classes */}
      <style jsx global>{`
        .gradient-text {
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
          background-image: linear-gradient(135deg, #150e23, #600B56);
        }
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .rotating-pattern {
          animation: rotate 100s linear infinite;
        }
      `}</style>
    </div>
  );
}
