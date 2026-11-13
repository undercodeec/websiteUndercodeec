// Self-contained reveal: never hide content in CSS or mutate text for animation.
// Unlike the desktop-only Webflow split-text/ScrollTrigger effects, this also runs on mobile.
(() => {
  const init = () => {
    const section = document.querySelector(".home-team");
    if (!section || !window.IntersectionObserver || !Element.prototype.animate) return;

    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (preference.matches) return;
    const headings = [...section.querySelectorAll(
      ".home-team__header > .h-eyebrow, .home-team__notice, .home-team__intro",
    )];
    // Carousel cards may be offscreen when prepared. Never leave their contents
    // waiting on an intersection that may not occur before the slide changes.
    const targets = headings.map((target, index) => ({ target, index, heading: true }));
    // Prepare only elements below the viewport. Elements already seen (including
    // restored scroll positions) stay untouched instead of flashing invisible.
    const pending = new Map();
    const animations = [];

    const onPreferenceChange = () => {
      if (preference.matches) {
        observer.disconnect();
        window.removeEventListener("scroll", releasePassed);
        animations.forEach((animation) => animation.cancel());
        pending.clear();
      }
    };
    preference.addEventListener("change", onPreferenceChange);

    // A large scroll jump can skip an intersection entirely. Do not leave
    // skipped content hidden when the reader later scrolls back to it.
    const releasePassed = () => {
      pending.forEach((animation, target) => {
        if (target.getBoundingClientRect().bottom <= 0) {
          animation.cancel();
          pending.delete(target);
          observer.unobserve(target);
        }
      });
      if (!pending.size) window.removeEventListener("scroll", releasePassed);
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (!isIntersecting || !pending.has(target)) return;
        const animation = pending.get(target);
        pending.delete(target);
        observer.unobserve(target);
        if (preference.matches) animation.cancel();
        else animation.play();
      });
      if (!pending.size) window.removeEventListener("scroll", releasePassed);
    }, { threshold: 0 });

    try {
      targets.forEach(({ target, index, heading }) => {
        if (target.getBoundingClientRect().top < window.innerHeight) return;
        const animation = target.animate(
          [{ transform: "translateY(24px)", opacity: 0 },
            { transform: "translateY(0)", opacity: 1 }],
          { duration: 680, delay: index * (heading ? 75 : 95),
            easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "backwards" },
        );
        animations.push(animation);
        animation.pause();
        pending.set(target, animation);
        observer.observe(target);
      });
      if (pending.size) window.addEventListener("scroll", releasePassed, { passive: true });
    } catch (_) {
      // Any unsupported animation/observer behavior must leave content visible.
      observer.disconnect();
      window.removeEventListener("scroll", releasePassed);
      animations.forEach((animation) => animation.cancel());
      pending.clear();
    }
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();

// The original grid remains readable without JavaScript and with reduced motion.
(() => {
  const init = () => {
    const section = document.querySelector('.home-team');
    const grid = section?.querySelector('.home-team__grid');
    const help = section?.querySelector('.home-team__help');
    const cards = grid ? [...grid.querySelectorAll('.home-team__member')] : [];
    if (!grid || cards.length < 2 || !window.matchMedia) return;
    let timer;
    let index = 0;
    let focused = false;
    let opened = null;
    let pointerType = null;
    let pointerCleanup;
    let transitions = [];
    let initialized = false;
    try {
      const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
      // Observe the cards, not the taller section heading: a visitor must see
      // the first card for a full interval before autoplay can advance it.
      const isVisible = () => {
        const rect = grid.getBoundingClientRect();
        return rect.bottom > 0 && rect.right > 0 && rect.top < window.innerHeight && rect.left < window.innerWidth;
      };
      const clearPointer = () => {
        clearTimeout(pointerCleanup);
        pointerCleanup = undefined;
        pointerType = null;
      };
      const show = () => {
        cards.forEach((card, i) => {
          const offset = (i - index + cards.length) % cards.length;
          card.dataset.position = offset === 0 ? 'active' : offset === 1 ? 'next' : offset === cards.length - 1 ? 'prev' : 'back';
        });
      };
      const changeLayout = (carousel) => {
        if (preference.matches) {
          transitions.forEach(animation => animation.cancel());
          transitions = [];
          grid.classList.remove('is-layout-changing');
        }
        if (grid.classList.contains('is-carousel') === carousel) return;
        const canAnimate = initialized && !preference.matches && typeof grid.animate === 'function' && typeof DOMMatrixReadOnly === 'function';
        const beforeGrid = canAnimate && grid.getBoundingClientRect();
        const before = canAnimate && cards.map(card => ({ rect: card.getBoundingClientRect(), opacity: getComputedStyle(card).opacity }));
        transitions.forEach(animation => animation.cancel());
        transitions = [];
        if (canAnimate) grid.classList.add('is-layout-changing');
        grid.classList.toggle('is-carousel', carousel);
        if (!canAnimate) return;
        const afterGrid = grid.getBoundingClientRect();
        const after = cards.map(card => ({ rect: card.getBoundingClientRect(), style: getComputedStyle(card) }));
        const timing = { duration: 650, easing: 'cubic-bezier(.22, 1, .36, 1)' };
        const heightAnimation = grid.animate([{ boxSizing: 'border-box', height: `${beforeGrid.height}px` }, { boxSizing: 'border-box', height: `${afterGrid.height}px` }], timing);
        transitions.push(heightAnimation);
        heightAnimation.onfinish = () => grid.classList.remove('is-layout-changing');
        cards.forEach((card, i) => {
          const from = before[i].rect, to = after[i].rect;
          if (!to.width || !to.height || !card.offsetWidth || !card.offsetHeight) return;
          const transform = after[i].style.transform === 'none' ? '' : after[i].style.transform;
          const matrix = new DOMMatrixReadOnly(transform || undefined);
          transitions.push(card.animate([
            { transformOrigin: 'top left', transform: `translate(${from.left - to.left + matrix.e}px, ${from.top - to.top + matrix.f}px) scale(${from.width / card.offsetWidth}, ${from.height / card.offsetHeight})`, opacity: before[i].opacity },
            { transformOrigin: 'top left', transform: transform || 'none', opacity: after[i].style.opacity },
          ], timing));
        });
      };
      const update = () => {
        clearInterval(timer);
        if (help) help.hidden = preference.matches;
        if (preference.matches || focused || opened) {
          changeLayout(false);
          if (preference.matches && !focused) grid.removeAttribute('tabindex');
          return;
        }
        show();
        changeLayout(true);
        grid.setAttribute('tabindex', '0');
        if (!document.hidden && isVisible()) {
          timer = setInterval(() => {
            if (document.hidden || !isVisible()) { clearInterval(timer); return; }
            index = (index + 1) % cards.length; show();
          }, 3000);
        }
      };
      section.addEventListener('pointerleave', (event) => {
        if (event.pointerType === 'mouse' && opened === 'mouse') { opened = null; update(); }
      });
      section.addEventListener('focusin', () => {
        // Selecting text can focus the region with a mouse; only keyboard focus
        // should keep the list open after the pointer leaves.
        if (pointerType !== 'mouse') focused = true;
        update();
      });
      section.addEventListener('focusout', (event) => {
        if (!section.contains(event.relatedTarget)) { focused = false; opened = null; update(); }
      });
      grid.addEventListener('pointerdown', (event) => {
        clearPointer();
        pointerType = event.pointerType;
        // A mouse click need not focus this reading region. Keyboard focus is untouched.
        if (pointerType === 'mouse' && grid.classList.contains('is-carousel')) event.preventDefault();
      });
      grid.addEventListener('click', (event) => {
        opened = event.detail === 0 ? 'keyboard' : (pointerType || 'touch');
        clearPointer();
        update();
      });
      document.addEventListener('pointerdown', (event) => {
        if (!section.contains(event.target)) { opened = null; focused = false; update(); }
      });
      // A drag may end outside the grid without dispatching click. Never let
      // that stale pointer modality suppress the next keyboard focus.
      document.addEventListener('pointerup', (event) => {
        clearTimeout(pointerCleanup);
        if (!grid.contains(event.target)) clearPointer();
        // Click follows pointerup synchronously; an in-grid drag may have no
        // click at all. Clear in the next task for later assistive focus.
        else pointerCleanup = setTimeout(clearPointer, 0);
      });
      document.addEventListener('pointercancel', clearPointer);
      document.addEventListener('keydown', clearPointer, true);
      window.addEventListener('blur', clearPointer);
      section.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && (opened || focused)) {
          opened = null;
          focused = false;
          if (section.contains(document.activeElement)) document.activeElement.blur();
          update();
        }
      });
      document.addEventListener('visibilitychange', update);
      preference.addEventListener('change', update);
      // A threshold-zero observer can fire at exact edge contact but not again
      // for the first positive pixel. Scroll/resize checks always supplement it.
      let visible = isVisible();
      const checkVisibility = () => {
        const next = isVisible();
        if (next !== visible) { visible = next; update(); }
      };
      if (window.IntersectionObserver) {
        const observer = new window.IntersectionObserver(checkVisibility, { threshold: 0 });
        observer.observe(grid);
      }
      window.addEventListener('scroll', checkVisibility, { passive: true });
      window.addEventListener('resize', checkVisibility);
      update();
      initialized = true;
    } catch (_) {
      clearInterval(timer);
      grid.classList.remove('is-carousel');
      grid.removeAttribute('tabindex');
      cards.forEach((card) => { delete card.dataset.position; });
    }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
