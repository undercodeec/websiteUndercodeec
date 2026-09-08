(() => {
  const releasePage = () => {
    document.querySelector("[preloader]")?.remove();
    document.body?.removeAttribute("data-start");
    document.body?.style.removeProperty("cursor");
    document.body?.style.removeProperty("opacity");
    document.body?.style.removeProperty("visibility");
    document.documentElement.classList.remove("anti-flicker", "lenis-stopped");
    window.lenis?.start?.();
  };

  document.addEventListener("click", (event) => {
    const link = event.target.closest?.('a[href="#"]');
    if (link) event.preventDefault();
  });

  window.addEventListener("load", () => window.setTimeout(releasePage, 1400));
  window.setTimeout(releasePage, 4000);
})();
