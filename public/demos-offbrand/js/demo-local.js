(() => {
  const releasePage = () => {
    document.querySelector("[preloader]")?.remove();
    document.documentElement.classList.remove("anti-flicker");
  };

  document.addEventListener("click", (event) => {
    const link = event.target.closest?.('a[href="#"]');
    if (link) event.preventDefault();
  });

  window.addEventListener("load", () => window.setTimeout(releasePage, 1400));
  window.setTimeout(releasePage, 4000);
})();
