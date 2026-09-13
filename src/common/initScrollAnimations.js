const initScrollAnimations = () => {
  if (typeof window === 'undefined') return;

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

    if (!('IntersectionObserver' in window)) {
      animatedElements.forEach((el) => el.classList.add('animate-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
    );

    animatedElements.forEach((el) => observer.observe(el));

    // Activate elements already in viewport
    animatedElements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      if (rect.top < vh && rect.bottom > 0) {
        el.classList.add('animate-visible');
        observer.unobserve(el);
      }
    });
  };

  // Pages without preloader, or preloader already dismissed: start after short delay
  // Pages with active preloader: wait for the "preloaderDone" event, then start
  const fallbackTimer = setTimeout(startAnimations, 1400);
  window.addEventListener('preloaderDone', () => {
    clearTimeout(fallbackTimer);
    setTimeout(startAnimations, 100);
  }, { once: true });
};

export default initScrollAnimations;
