const FOOTER_SELECTOR = "[data-primary-footer]";

function revealFooter(footer: HTMLElement, observer?: IntersectionObserver) {
  footer.classList.add("primary-footer--revealed");
  observer?.disconnect();
}

export function initPrimaryFooters() {
  document.querySelectorAll<HTMLElement>(FOOTER_SELECTOR).forEach((footer) => {
    if (footer.dataset.primaryFooterReady === "true") return;

    footer.dataset.primaryFooterReady = "true";

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches || !("IntersectionObserver" in window)) {
      revealFooter(footer);
      return;
    }

    const anchor = footer.querySelector<HTMLElement>("[data-primary-footer-anchor]");
    if (!anchor) {
      revealFooter(footer);
      return;
    }

    let observer: IntersectionObserver | undefined;
    window.requestAnimationFrame(() => {
      footer.classList.add("primary-footer--ready");
      observer = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) revealFooter(footer, observer);
      });
      observer.observe(anchor);
    });
  });
}
