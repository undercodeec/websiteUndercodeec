(() => {
  const mobileQuery = window.matchMedia("(max-width: 991px)");
  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const supportsIndividualTransforms = Boolean(
    window.CSS
      && window.CSS.supports("translate", "1px 1px")
      && window.CSS.supports("scale", "1"),
  );

  const ORB_FRAMES = [
    { duration: .15, x: 50, y: 0, scale: 2 },
    { duration: .15, x: -50, y: -20, scale: 1.5 },
    { duration: .05, x: 0, y: 50, scale: 0 },
    { duration: .025, x: 0, y: 50, scale: 0 },
    { duration: .125, x: 0, y: 0, scale: 1 },
    { duration: .1, x: -25, y: 20, scale: 1.5 },
    { duration: .05, x: -60, y: -75, scale: 0 },
    { duration: .3, x: 0, y: 0, scale: 0 },
  ];

  const INNER_RING_FRAMES = [
    { duration: .15, x: 10, y: 0, scale: 1.2 },
    { duration: .15, x: -30, y: 0, scale: 1.3 },
    { duration: .05, x: 0, y: 50, scale: 1 },
    { duration: .025, x: 0, y: 50, scale: .8 },
    { duration: .125, x: 0, y: 0, scale: 1 },
    { duration: .15, x: 30, y: -20, scale: .7 },
    { duration: .05, x: 0, y: 0, scale: 1 },
    { duration: .25, x: 0, y: 0, scale: 0 },
    { duration: .05, x: 49, y: 0, scale: 1 },
  ];

  const OUTER_RING_FRAMES = [
    { duration: .15, x: 25, y: 0, scale: 1.3 },
    { duration: .15, x: -9, y: 32, scale: .6 },
    { duration: .05, x: 0, y: 50, scale: 1 },
    { duration: .025, x: 0, y: 50, scale: .8 },
    { duration: .125, x: 0, y: 0, scale: 1 },
    { duration: .15, x: 0, y: 14, scale: 1.2 },
    { duration: .05, x: 0, y: 0, scale: .6 },
    { duration: .25, x: 0, y: 0, scale: 0 },
    { duration: .05, x: 29, y: 0, scale: 1.5 },
  ];

  const START_STATE = { x: 0, y: 0, scale: 1 };
  let frameId = 0;
  let isRunning = false;
  let orbWrap;
  let orb;
  let innerRing;
  let outerRing;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const lerp = (start, end, progress) => start + (end - start) * progress;

  const getScrollProgress = () => {
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    return clamp(window.scrollY / maxScroll, 0, 1);
  };

  const interpolateTimeline = (frames, progress) => {
    const totalDuration = frames.reduce((total, frame) => total + frame.duration, 0);
    let elapsed = clamp(progress, 0, 1) * totalDuration;
    let previous = START_STATE;

    for (const frame of frames) {
      if (elapsed <= frame.duration) {
        const localProgress = frame.duration ? elapsed / frame.duration : 1;
        return {
          x: lerp(previous.x, frame.x, localProgress),
          y: lerp(previous.y, frame.y, localProgress),
          scale: lerp(previous.scale, frame.scale, localProgress),
        };
      }

      elapsed -= frame.duration;
      previous = frame;
    }

    return previous;
  };

  const applyState = (element, state) => {
    if (!element) return;

    if (supportsIndividualTransforms) {
      element.style.translate = `${state.x}vw ${state.y}vh`;
      element.style.scale = String(state.scale);
    } else {
      element.style.setProperty(
        "transform",
        `translate3d(${state.x}vw, ${state.y}vh, 0) scale(${state.scale})`,
        "important",
      );
    }
  };

  const clearState = (element) => {
    if (!element) return;
    element.style.removeProperty("translate");
    element.style.removeProperty("scale");
    if (!supportsIndividualTransforms) element.style.removeProperty("transform");
    element.style.removeProperty("will-change");
  };

  const render = () => {
    if (!isRunning) return;

    const progress = getScrollProgress();
    applyState(orb, interpolateTimeline(ORB_FRAMES, progress));
    applyState(innerRing, interpolateTimeline(INNER_RING_FRAMES, progress));
    applyState(outerRing, interpolateTimeline(OUTER_RING_FRAMES, progress));
    frameId = window.requestAnimationFrame(render);
  };

  const reset = () => {
    window.cancelAnimationFrame(frameId);
    frameId = 0;
    isRunning = false;

    clearState(orb);
    clearState(innerRing);
    clearState(outerRing);

    if (orbWrap) {
      orbWrap.style.removeProperty("will-change");
      delete orbWrap.dataset.responsiveOrbMotion;
    }
  };

  const isHomePage = () => Boolean(document.querySelector('[data-page="home"]'));

  const setUp = () => {
    const nextOrbWrap = document.querySelector("[data-orb-wrap]");
    const shouldAnimate = mobileQuery.matches
      && !reducedMotionQuery.matches
      && document.visibilityState === "visible"
      && Boolean(nextOrbWrap)
      && isHomePage();

    if (shouldAnimate && isRunning && orbWrap === nextOrbWrap) {
      orbWrap.style.position = "fixed";
      return;
    }

    reset();
    if (!shouldAnimate) {
      if (nextOrbWrap && isHomePage()) {
        nextOrbWrap.style.position = mobileQuery.matches ? "absolute" : "fixed";
      }
      return;
    }

    orbWrap = nextOrbWrap;
    orb = orbWrap.querySelector("[data-orb]");
    innerRing = orbWrap.querySelector('[orb-out-w="1"]');
    outerRing = orbWrap.querySelector('[orb-out-w="2"]');
    if (!orb || !innerRing || !outerRing) return;

    orbWrap.style.position = "fixed";
    orbWrap.dataset.responsiveOrbMotion = "active";
    [orb, innerRing, outerRing].forEach((element) => {
      element.style.willChange = supportsIndividualTransforms
        ? "translate, scale"
        : "transform";
    });

    isRunning = true;
    frameId = window.requestAnimationFrame(render);
  };

  const onMediaChange = (query, listener) => {
    if (typeof query.addEventListener === "function") {
      query.addEventListener("change", listener);
    } else if (typeof query.addListener === "function") {
      query.addListener(listener);
    }
  };

  window.addEventListener("pageshow", setUp);
  document.addEventListener("visibilitychange", setUp);
  onMediaChange(mobileQuery, setUp);
  onMediaChange(reducedMotionQuery, setUp);

  const taxiRoot = document.querySelector("[data-taxi]");
  if (taxiRoot) {
    new MutationObserver(setUp).observe(taxiRoot, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setUp, { once: true });
  } else {
    setUp();
  }
})();
