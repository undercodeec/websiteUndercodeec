(() => {
  let bundlePromise;
  const loadBundle = () => {
    if (window.__createHeroParticleExperience) return Promise.resolve();
    if (!bundlePromise) {
      bundlePromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = '/landing-primary/js/auros-hero-particles.bundle.js?v=20261023-shared-1';
        script.onload = resolve;
        script.onerror = reject;
        document.head.append(script);
      });
    }
    return bundlePromise;
  };

  const mount = (hero, clip = document.createElement('div')) => {
    if (!hero || clip.dataset.heroParticlesMounted === 'true') return () => {};
    const rootLanding = !!hero.closest('[data-page="home"]');
    const primaryHero = rootLanding || !!hero.closest('[data-primary-page]');
    clip.dataset.heroParticlesMounted = 'true';
    clip.classList.add('hero-particles');
    clip.setAttribute('aria-hidden', 'true');
    let host = clip.querySelector('.webgpu-container');
    if (!host) {
      host = document.createElement('div');
      host.className = 'webgpu-container';
      clip.append(host);
    }
    const createdClip = !clip.isConnected;
    if (createdClip) hero.prepend(clip);

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let disposed = false;
    let experience;
    let fallbackCleanup = () => {};
    const fitMobileCamera = () => {
      if (!primaryHero || !experience?.particles?.cameras?.main) return;
      const camera = experience.particles.cameras.main;
      const mobile = window.innerWidth < 768;
      camera.position.x = mobile && !rootLanding ? -0.3 : 0;
      camera.position.z = mobile && host.clientWidth
        ? Math.max(1.5, host.clientHeight / host.clientWidth)
        : 1.5;
    };
    window.addEventListener('resize', fitMobileCamera, { passive: true });
    const clamp = (value) => Math.min(1, Math.max(0, value));
    const smoothstep = (start, end, value) => {
      const progress = clamp((value - start) / (end - start));
      return progress * progress * (3 - 2 * progress);
    };
    let scrollTarget = 0;
    let scrollProgress = 0;
    let scrollFrame = 0;
    const animateScroll = () => {
      scrollFrame = 0;
      scrollProgress += (scrollTarget - scrollProgress) * 0.18;
      if (Math.abs(scrollTarget - scrollProgress) < 0.001) scrollProgress = scrollTarget;

      const mobile = window.innerWidth < 768;
      // Keep the particle mass intact until the hero is almost out of view.
      // Expansion and opacity use the same late exit range so the canvas does
      // not look like it fades simply because the particles spread apart.
      const exitStart = mobile ? 0.55 : 0.62;
      const exitEnd = mobile ? 0.95 : 0.98;
      const expansion = smoothstep(exitStart, exitEnd, scrollProgress);
      const visibility = 1 - smoothstep(exitStart, exitEnd, scrollProgress);
      const baseOpacity = mobile && !primaryHero ? 0.65 : 0.8;
      clip.style.setProperty('--hero-particle-opacity', (visibility * baseOpacity).toFixed(3));

      const particles = experience?.particles?.particles;
      if (particles?.scrollExplosionUniform) {
        particles.scrollExplosionUniform.value = expansion * 0.9;
        particles.instanceScaleUniform.value = (mobile ? (rootLanding ? 1.3 : primaryHero ? 2 : 1.25) : 1) * (1 + expansion * 0.6);
      }
      if (scrollProgress !== scrollTarget) scrollFrame = requestAnimationFrame(animateScroll);
    };
    const updateScrollTarget = () => {
      const bounds = hero.getBoundingClientRect();
      scrollTarget = clamp(-bounds.top / Math.max(bounds.height, window.innerHeight));
      if (!scrollFrame) scrollFrame = requestAnimationFrame(animateScroll);
    };
    if (!reducedMotion) {
      window.addEventListener('scroll', updateScrollTarget, { passive: true });
      window.addEventListener('resize', updateScrollTarget, { passive: true });
      updateScrollTarget();
    }

    let fallbackStarted = false;
    const startFallback = () => {
      if (fallbackStarted) return;
      fallbackStarted = true;
      experience?.dispose();
      experience = null;
      host.replaceChildren();

      const canvas = document.createElement('canvas');
      canvas.className = 'home-hero-particles-fallback';
      const context = canvas.getContext('2d', { alpha: true });
      if (!context) return;
      host.append(canvas);

      const count = window.matchMedia('(max-width: 767px)').matches ? 4500 : 6500;
      const goldenAngle = Math.PI * (3 - Math.sqrt(5));
      const particles = Array.from({ length: count }, (_, index) => {
        const y = 1 - 2 * (index + 0.5) / count;
        const radius = Math.sqrt(1 - y * y);
        const angle = index * goldenAngle;
        return {
          x: Math.cos(angle) * radius,
          y,
          z: Math.sin(angle) * radius,
          offsetX: 0,
          offsetY: 0,
          velocityX: 0,
          velocityY: 0,
          scatterX: Math.sin(index * 12.9898),
          scatterY: Math.cos(index * 78.233),
        };
      });
      const pointer = { x: -1000, y: -1000, active: false };
      let width = 0;
      let height = 0;
      let pixelRatio = 1;
      let frame = 0;
      let visible = true;
      let lastFrame = 0;

      const resize = () => {
        width = host.clientWidth;
        height = host.clientHeight;
        pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(width * pixelRatio);
        canvas.height = Math.round(height * pixelRatio);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      };
      const draw = (now) => {
        frame = 0;
        if (!visible || !width || !height) return;
        if (!reducedMotion && now - lastFrame < 33) {
          frame = requestAnimationFrame(draw);
          return;
        }
        lastFrame = now;
        context.clearRect(0, 0, width, height);
        const rotation = reducedMotion ? 0 : now * 0.00012;
        const cos = Math.cos(rotation);
        const sin = Math.sin(rotation);
        const mobile = width < 768;
        const centerX = width * (primaryHero && mobile && !rootLanding ? 0.74 : 0.5);
        const centerY = height * (mobile ? (rootLanding ? 0.55 : 0.38) : 0.46);
        const sphereRadius = primaryHero && mobile
          ? rootLanding
            ? Math.min(width * 0.48, height * 0.22)
            : Math.min(width * 0.72, height * 0.3)
          : Math.min(width * (mobile ? 0.52 : 0.25), height * 0.22) * (mobile ? 1.35 : 1.5);
        const exitStart = mobile ? 0.55 : 0.62;
        const exitEnd = mobile ? 0.95 : 0.98;
        const expansion = smoothstep(exitStart, exitEnd, scrollProgress);
        const spread = 1 + expansion * 1.4;
        const nearColor = primaryHero ? '1, 83, 79' : '93, 40, 121';
        const farColor = primaryHero ? '147, 230, 226' : '166, 88, 135';

        for (const particle of particles) {
          const rotatedX = particle.x * cos - particle.z * sin;
          const rotatedZ = particle.x * sin + particle.z * cos;
          const depth = (rotatedZ + 1) / 2;
          const targetX = centerX + rotatedX * sphereRadius * (0.84 + depth * 0.16) * spread + particle.scatterX * sphereRadius * expansion * 0.24;
          const targetY = centerY + particle.y * sphereRadius * (0.84 + depth * 0.16) * spread + particle.scatterY * sphereRadius * expansion * 0.24;
          const differenceX = targetX - pointer.x;
          const differenceY = targetY - pointer.y;
          const distance = Math.hypot(differenceX, differenceY);
          if (pointer.active && distance < 125 && !reducedMotion) {
            const strength = (1 - distance / 125) * 1.5;
            particle.velocityX += (differenceX / (distance || 1)) * strength - differenceY * 0.0015;
            particle.velocityY += (differenceY / (distance || 1)) * strength + differenceX * 0.0015;
          }
          particle.velocityX += -particle.offsetX * 0.025;
          particle.velocityY += -particle.offsetY * 0.025;
          particle.velocityX *= 0.91;
          particle.velocityY *= 0.91;
          particle.offsetX += particle.velocityX;
          particle.offsetY += particle.velocityY;

          context.fillStyle = depth > 0.52
            ? `rgba(${nearColor}, ${0.35 + depth * 0.55})`
            : `rgba(${farColor}, ${0.2 + depth * 0.45})`;
          const size = (0.65 + depth * 1.25) * (1 + expansion * 1.1);
          context.fillRect(targetX + particle.offsetX, targetY + particle.offsetY, size, size);
        }
        if (!reducedMotion) frame = requestAnimationFrame(draw);
      };
      const onPointerMove = (event) => {
        const bounds = host.getBoundingClientRect();
        pointer.x = event.clientX - bounds.left;
        pointer.y = event.clientY - bounds.top;
        pointer.active = pointer.x >= 0 && pointer.x <= width && pointer.y >= 0 && pointer.y <= height;
      };
      const onPointerLeave = () => { pointer.active = false; };
      window.addEventListener('pointermove', onPointerMove, { passive: true });
      hero.addEventListener('pointerleave', onPointerLeave);
      window.addEventListener('resize', resize, { passive: true });
      const observer = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !frame) frame = requestAnimationFrame(draw);
      });
      observer.observe(hero);
      resize();
      frame = requestAnimationFrame(draw);
      fallbackCleanup = () => {
        cancelAnimationFrame(frame);
        observer.disconnect();
        window.removeEventListener('pointermove', onPointerMove);
        hero.removeEventListener('pointerleave', onPointerLeave);
        window.removeEventListener('resize', resize);
      };
    };

    if (reducedMotion) {
      startFallback();
    } else {
      Promise.resolve()
        .then(() => navigator.gpu?.requestAdapter())
        .then((adapter) => {
          if (!adapter) throw new Error('WebGPU unavailable');
          return loadBundle();
        })
        .then(() => {
          if (disposed) return;
          experience = window.__createHeroParticleExperience(
            host,
            () => {
              fitMobileCamera();
              updateScrollTarget();
            },
            () => { if (!disposed) startFallback(); },
          );
        })
        .catch(() => { if (!disposed) startFallback(); });
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(scrollFrame);
      window.removeEventListener('scroll', updateScrollTarget);
      window.removeEventListener('resize', updateScrollTarget);
      window.removeEventListener('resize', fitMobileCamera);
      fallbackCleanup();
      experience?.dispose();
      delete clip.dataset.heroParticlesMounted;
      host.replaceChildren();
      if (createdClip) clip.remove();
    };
  };

  window.mountHeroParticles = mount;
  const initHome = () => {
    const hero = document.querySelector('[data-page="home"] [home-hero]');
    if (!hero) return;

    let mounted = false;
    let observer;
    const start = () => {
      if (mounted) return;
      mounted = true;
      observer?.disconnect();
      window.removeEventListener('homePreloaderDone', start);
      mount(hero);
    };

    if (!document.querySelector('[preloader]')) {
      start();
      return;
    }

    // The root page has its own opening sequence. Do not reveal the particle
    // canvas behind it; begin only when that sequence has removed its overlay.
    window.addEventListener('homePreloaderDone', start, { once: true });
    observer = new MutationObserver(() => {
      if (!document.querySelector('[preloader]')) start();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initHome, { once: true });
  else initHome();
})();
