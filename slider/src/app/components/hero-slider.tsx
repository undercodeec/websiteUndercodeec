import image_27243ea8ef847ba47c211ec9091848db1ffe8454 from 'figma:asset/27243ea8ef847ba47c211ec9091848db1ffe8454.png'
import { useEffect, useRef, useState } from 'react';
import Slider from 'react-slick';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Code, Palette, Rocket, Zap } from 'lucide-react';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import characterImage from 'figma:asset/66f0344ac49f2d8983e5df4c83caa818ebfb5c45.png';
import backgroundPattern from 'figma:asset/6fa818bb935c0e2a1081f259d84df226b237a184.png';
import phoneImage from 'figma:asset/e270e8cb3ebd0653ddfdf111b87da9e62265ddc9.png';
import monitorImage from 'figma:asset/6b71e3ffeb1745be4d8b903007d2836793483db6.png';

const slides = [
  {
    title: 'Diseño de Páginas Web en Quito y Ecuador',
    subtitle: '',
    description: 'Creación, Programación y Desarrollo de Aplicaciones Web',
    icon: Palette,
    color: '#ba27f4',
    type: 'character' // Tipo de slide para renderizar la imagen del personaje
  }
];

const CustomArrow = ({ direction, onClick }: { direction: 'left' | 'right'; onClick?: () => void }) => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`absolute top-1/2 -translate-y-1/2 ${direction === 'left' ? 'left-4 md:left-8' : 'right-4 md:right-8'} z-20 bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-full p-3 md:p-4 transition-all duration-300 border border-white/20 shadow-lg`}
  >
    {direction === 'left' ? (
      <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-white" />
    ) : (
      <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-white" />
    )}
  </motion.button>
);

export function HeroSlider() {
  const sliderRef = useRef<Slider>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentImage, setCurrentImage] = useState(0); // 0 = character, 1 = monitor

  // Alternar imagen cada 8 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev === 0 ? 1 : 0));
    }, 8000);

    return () => clearInterval(interval);
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
    beforeChange: (_current: number, next: number) => setCurrentSlide(next),
    nextArrow: <CustomArrow direction="right" />,
    prevArrow: <CustomArrow direction="left" />,
    customPaging: () => (
      <div className="w-3 h-3 mx-1 rounded-full bg-white/30 hover:bg-white/60 transition-all duration-300" />
    ),
    dotsClass: 'slick-dots custom-dots !bottom-8'
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 gradient-bg z-0 pointer-events-none" />
      
      {/* Rotating Background Pattern */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[1]">
        <img 
          src={backgroundPattern} 
          alt="Background Pattern" 
          className="rotating-pattern w-full h-full object-cover opacity-30 pointer-events-none"
        />
      </div>
      
      {/* Additional gradient blobs */}
      <div className="gradient-blob-1 pointer-events-none" />
      <div className="gradient-blob-2 pointer-events-none" />
      <div className="gradient-blob-3 pointer-events-none" />
      
      {/* Animated Particles */}
      

      {/* Slider */}
      <Slider ref={sliderRef} {...settings} className="h-full relative z-30">
        {slides.map((slide, index) => (
          <div key={index} className="h-screen">
            <div className="relative h-full flex items-center justify-center px-4 md:px-8 lg:px-16">
              <div className="container mx-auto max-w-7xl">
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
                  {/* Content - Se muestra a la derecha si es video, a la izquierda si es character */}
                  <motion.div
                    initial={{ opacity: 0, x: slide.type === 'video' ? 100 : -100 }}
                    animate={currentSlide === index ? { opacity: 1, x: 0 } : { opacity: 0, x: slide.type === 'video' ? 100 : -100 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className={`text-white z-50 relative space-y-6 lg:space-y-8 ${slide.type === 'video' ? 'lg:order-2' : ''}`}
                  >
                    {/* Icon */}
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={currentSlide === index ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -180 }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                      className="inline-block"
                    >
                      
                    </motion.div>

                    {/* Title */}
                    <motion.h1
                      initial={{ opacity: 0, y: 30 }}
                      animate={currentSlide === index ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                      className="gradient-title text-[64px]"
                    >
                      {slide.title}
                    </motion.h1>

                    {/* Description */}
                    <motion.p
                      initial={{ opacity: 0, y: 30 }}
                      animate={currentSlide === index ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                      transition={{ duration: 0.6, delay: 0.6 }}
                      className="text-lg md:text-xl lg:text-2xl leading-relaxed max-w-2xl text-[#333333]"
                    >
                      {slide.description}
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={currentSlide === index ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                      transition={{ duration: 0.6, delay: 0.7 }}
                      className="flex flex-wrap gap-4 pt-4"
                    >
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-8 py-4 rounded-full font-bold text-white text-lg transition-all duration-300"
                        style={{ backgroundColor: '#600b56' }}
                      >
                        Ver Portafolio
                      </motion.button>
                    </motion.div>
                  </motion.div>

                  {/* Media - Character Image o Video dependiendo del tipo */}
                  {slide.type === 'character' ? (
                    /* Character Image */
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                      animate={currentSlide === index ? { opacity: 1, scale: 1, rotate: 0 } : { opacity: 0, scale: 0.8, rotate: -10 }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                      className="relative hidden lg:flex items-center justify-center"
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
                        className="absolute inset-0 rounded-full blur-3xl"
                        style={{ background: slide.color }}
                      />
                      
                      {/* Rotating Ring */}
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <div 
                          className="w-[90%] h-[90%] rounded-full border-4 border-dashed"
                          style={{ borderColor: `${slide.color}40` }}
                        />
                      </motion.div>

                      {/* Character */}
                      <div className="relative flex items-center justify-center">
                        <AnimatePresence mode="wait">
                          <motion.img
                            key={currentImage}
                            src={currentImage === 0 ? characterImage : monitorImage}
                            alt="Web Developer Character"
                            className="relative drop-shadow-2xl"
                            style={{ width: '500px', height: '500px', objectFit: 'contain' }}
                            initial={{ 
                              opacity: 0, 
                              scale: 0.5, 
                              rotate: -45,
                              x: currentImage === 0 ? -100 : 100,
                              filter: 'blur(20px)'
                            }}
                            animate={{ 
                              opacity: 1, 
                              scale: 1, 
                              rotate: 0,
                              x: 0,
                              y: [0, -20, 0],
                              filter: 'blur(0px)'
                            }}
                            exit={{ 
                              opacity: 0, 
                              scale: 0.5, 
                              rotate: 45,
                              x: currentImage === 0 ? 100 : -100,
                              filter: 'blur(20px)'
                            }}
                            transition={{
                              opacity: { duration: 0.8, ease: 'easeInOut' },
                              scale: { duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] },
                              rotate: { duration: 0.8, ease: 'easeInOut' },
                              x: { duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] },
                              filter: { duration: 0.6 },
                              y: {
                                duration: 4,
                                repeat: Infinity,
                                ease: 'easeInOut',
                                delay: 0.8
                              }
                            }}
                          />
                        </AnimatePresence>
                        
                        {/* Floating Phone */}
                        <motion.img
                          src={image_27243ea8ef847ba47c211ec9091848db1ffe8454}
                          alt="Mobile Phone"
                          className="absolute drop-shadow-2xl"
                          style={{ 
                            width: '200px', 
                            height: '200px', 
                            objectFit: 'contain',
                            // Personaliza la posición aquí:
                            top: '50%',      // Mover arriba/abajo (usa % o px, ejemplo: '30%', '100px')
                            // bottom: 'auto', // Alternativa a top (descomenta para usar)
                            right: '10%',    // Mover izquierda/derecha desde la derecha (ejemplo: '5%', '50px')
                            // left: 'auto',   // Alternativa a right (descomenta para usar desde la izquierda)
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
                  ) : (
                    /* Video */
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8, x: -100 }}
                      animate={currentSlide === index ? { opacity: 1, scale: 1, x: 0 } : { opacity: 0, scale: 0.8, x: -100 }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                      className="relative hidden lg:flex items-center justify-center lg:order-1"
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
                        className="absolute inset-0 rounded-full blur-3xl"
                        style={{ background: slide.color }}
                      />
                      
                      {/* Rotating Ring */}
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <div 
                          className="w-[90%] h-[90%] rounded-full border-4 border-dashed"
                          style={{ borderColor: `${slide.color}40` }}
                        />
                      </motion.div>

                      {/* Video Container */}
                      <div className="relative w-full max-w-md aspect-square">
                        <motion.div
                          animate={{
                            y: [0, -15, 0],
                          }}
                          transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                          className="w-full h-full rounded-2xl overflow-hidden shadow-2xl"
                          style={{
                            boxShadow: `0 25px 50px -12px ${slide.color}80`
                          }}
                        >
                          <iframe 
                            src="https://player.vimeo.com/video/1165182372?badge=0&autopause=0&player_id=0&app_id=58479&autoplay=1&loop=1&muted=0" 
                            frameBorder="0" 
                            allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share" 
                            referrerPolicy="strict-origin-when-cross-origin" 
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%', 
                              height: '100%'
                            }} 
                            title="Diseño Web Profesional"
                          />
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </Slider>

      {/* Bottom Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
    </div>
  );
}