import React, { useEffect, useRef } from 'react';

/**
 * Componente wrapper para aplicar animaciones de scroll a cualquier sección
 * @param {string} animation - Tipo de animación: 'fadeUp', 'fadeIn', 'fadeLeft', 'fadeRight', 'scaleUp', 'slideUp'
 * @param {number} delay - Delay en milisegundos antes de iniciar la animación
 * @param {number} duration - Duración de la animación en milisegundos
 * @param {string} className - Clases adicionales
 */
const AnimatedSection = ({ 
  children, 
  animation = 'fadeUp', 
  delay = 0, 
  duration = 600,
  className = '',
  as: Component = 'div'
}) => {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add('animate-visible');
            }, delay);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -30px 0px'
      }
    );

    observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, [delay]);

  const animationClass = `animate-on-scroll animate-${animation}`;

  return (
    <Component 
      ref={ref} 
      className={`${animationClass} ${className}`}
      style={{ '--animation-duration': `${duration}ms` }}
    >
      {children}
    </Component>
  );
};

export default AnimatedSection;
