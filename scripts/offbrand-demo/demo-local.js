(() => {
  const animationRuntimeReady = () => Boolean(window.SScroll);

  const introAnimationIsActive = () =>
    animationRuntimeReady() && document.body?.style.cursor === "progress";

  const releasePage = (force = false) => {
    if (!force && introAnimationIsActive()) return false;

    document.querySelector("[preloader]")?.remove();
    document.body?.removeAttribute("data-start");
    document.body?.style.removeProperty("cursor");
    document.body?.style.removeProperty("opacity");
    document.body?.style.removeProperty("visibility");
    document.documentElement.classList.remove("anti-flicker", "lenis-stopped");
    window.SScroll?.start?.();
    window.lenis?.start?.();
    return true;
  };

  const waitForPreloader = () => {
    if (!releasePage()) window.setTimeout(waitForPreloader, 250);
  };

  document.addEventListener("click", (event) => {
    const link = event.target.closest?.('a[href="#"]');
    if (link) event.preventDefault();
  });

  window.addEventListener("load", () => window.setTimeout(waitForPreloader, 250));
  window.setTimeout(() => releasePage(true), 15000);
})();
