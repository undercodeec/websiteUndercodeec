import { useEffect, useRef } from 'react';

/**
 * Hook personalizado para animaciones al hacer scroll
 * Usa Intersection Observer para detectar cuando los elementos entran en el viewport
 */
const useScrollAnimation = (options = {}) => {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const defaultOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
      ...options
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-visible');
          // Opcional: dejar de observar después de la primera animación
          observer.unobserve(entry.target);
        }
      });
    }, defaultOptions);

    observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, [options]);

  return ref;
};

export default useScrollAnimation;
