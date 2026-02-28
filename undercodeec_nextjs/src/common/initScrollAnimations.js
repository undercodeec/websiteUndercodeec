/**
 * Script para inicializar las animaciones de scroll
 * Detecta todos los elementos con clases de animación y los observa
 */
const initScrollAnimations = () => {
  if (typeof window === 'undefined') return;

  // Esperar un poco para que el DOM esté listo
  const startAnimations = () => {
    const animatedElements = document.querySelectorAll(
      '.animate-fadeUp:not(.animate-visible), ' +
      '.animate-fadeIn:not(.animate-visible), ' +
      '.animate-fadeLeft:not(.animate-visible), ' +
      '.animate-fadeRight:not(.animate-visible), ' +
      '.animate-scaleUp:not(.animate-visible), ' +
      '.animate-slideUp:not(.animate-visible), ' +
      '.animate-zoomIn:not(.animate-visible), ' +
      '.animate-blurIn:not(.animate-visible)'
    );

    if (animatedElements.length === 0) return;

    // Comprobar si el navegador soporta Intersection Observer
    if (!('IntersectionObserver' in window)) {
      // Fallback: mostrar todos los elementos inmediatamente
      animatedElements.forEach((el) => {
        el.classList.add('animate-visible');
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Agregar la clase visible
            entry.target.classList.add('animate-visible');
            // Dejar de observar
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -30px 0px'
      }
    );

    animatedElements.forEach((el) => {
      observer.observe(el);
    });

    // Activar inmediatamente los elementos que ya están visibles en el viewport
    animatedElements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;
      
      if (rect.top < windowHeight && rect.bottom > 0) {
        el.classList.add('animate-visible');
        observer.unobserve(el);
      }
    });
  };

  // Ejecutar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startAnimations);
  } else {
    // DOM ya cargado, ejecutar con un pequeño delay
    setTimeout(startAnimations, 100);
  }

  // También ejecutar después del preloader
  if (window.Pace) {
    window.Pace.on('done', () => {
      setTimeout(startAnimations, 50);
    });
  }
};

export default initScrollAnimations;
