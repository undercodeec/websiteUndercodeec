const PRELOADER_PATHS = ['/', '/ec', '/es'];

function getPreloaderKey(path) {
  if (path === '/ec') return 'preloaderShown_ec';
  if (path === '/es') return 'preloaderShown_es';
  return 'preloaderShown_home';
}

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

  const path = window.location.pathname;
  const hasPreloader = PRELOADER_PATHS.includes(path);

  // Pages without preloader, or preloader already dismissed: start after short delay
  if (!hasPreloader || sessionStorage.getItem(getPreloaderKey(path))) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => setTimeout(startAnimations, 200));
    } else {
      setTimeout(startAnimations, 200);
    }
    return;
  }

  // Pages with active preloader: wait for the "preloaderDone" event, then start
  window.addEventListener('preloaderDone', () => {
    setTimeout(startAnimations, 100);
  }, { once: true });
};

export default initScrollAnimations;
