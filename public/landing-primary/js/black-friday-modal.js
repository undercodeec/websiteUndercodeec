(() => {
  const modal = document.querySelector("[data-black-friday-modal]");
  if (!modal) return;

  const dialog = modal.querySelector("[role=dialog]");
  const closeButton = modal.querySelector("[data-black-friday-close]");
  const pointer = modal.querySelector(".black-friday-modal__pointer");
  const pointerAnchor = modal.querySelector(".black-friday-modal__pointer-anchor");
  const whatsappButton = modal.querySelector(".black-friday-modal__whatsapp");
  const focusableSelector = [
    "a[href]",
    "button:not([disabled])",
    "[tabindex]:not([tabindex='-1'])",
  ].join(",");
  let openTimer;
  let previouslyFocused;
  let hasOpened = false;
  let orbAnimation;

  const getFocusableElements = () => Array.from(dialog.querySelectorAll(focusableSelector));

  // Layout offsets ignore the entrance transforms on the message and CTA.
  const positionInDialog = (element) => {
    let left = 0;
    let top = 0;
    let current = element;
    while (current && current !== dialog) {
      left += current.offsetLeft;
      top += current.offsetTop;
      current = current.offsetParent;
    }
    return current === dialog ? { left, top } : null;
  };

  const updatePointerJourney = () => {
    if (!pointer || !pointerAnchor || !whatsappButton || modal.hidden) return;

    const anchorPosition = positionInDialog(pointerAnchor);
    const buttonPosition = positionInDialog(whatsappButton);
    const start = anchorPosition && buttonPosition ? anchorPosition : pointerAnchor.getBoundingClientRect();
    const target = anchorPosition && buttonPosition ? buttonPosition : whatsappButton.getBoundingClientRect();
    pointer.style.setProperty("--black-friday-pointer-x", `${target.left + whatsappButton.offsetWidth * 0.5 - start.left - 3}px`);
    pointer.style.setProperty("--black-friday-pointer-y", `${target.top + whatsappButton.offsetHeight * 0.5 - start.top - 2}px`);
  };

  const titleCharacters = [];
  modal.querySelectorAll("[data-black-friday-title-line]").forEach((line) => {
    const text = line.textContent;
    line.textContent = "";
    line.setAttribute("aria-hidden", "true");

    for (const letter of Array.from(text)) {
      if (letter === " ") {
        line.append(document.createTextNode(" "));
        continue;
      }

      const clip = document.createElement("span");
      clip.className = "home-hero-character-clip";
      const character = document.createElement("span");
      character.className = "char";
      character.textContent = letter;
      clip.append(character);
      line.append(clip);
      titleCharacters.push(character);
    }
  });

  const characterOrder = titleCharacters.map((_, index) => index);
  for (let index = characterOrder.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [characterOrder[index], characterOrder[randomIndex]] = [characterOrder[randomIndex], characterOrder[index]];
  }
  characterOrder.forEach((characterIndex, sequence) => {
    titleCharacters[characterIndex].style.setProperty("--home-hero-character-delay", `${sequence * 25}ms`);
  });

  const orb = modal.querySelector(".black-friday-modal__orb");
  if (orb && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    import("./whatsapp-primary-orb.js")
      .then(({ createPrimaryOrb }) => {
        if (hasOpened && modal.hidden) return;
        orbAnimation = createPrimaryOrb(orb, { color: "#25D366", shape: "rectangle" });
      })
      .catch(() => {}); // The green background keeps the CTA usable without WebGL.
  }

  const closeModal = () => {
    if (modal.hidden) return;

    window.clearTimeout(openTimer);
    modal.hidden = true;
    orbAnimation?.destroy();
    document.body.classList.remove("black-friday-modal-open");
    window.lenis?.start?.();
    window.SScroll?.start?.();
    previouslyFocused?.focus?.();
  };

  const openModal = () => {
    if (hasOpened) return;

    hasOpened = true;
    modal.hidden = false;
    updatePointerJourney();
    modal.setAttribute("data-title-ready", "");
    previouslyFocused = document.activeElement;
    document.body.classList.add("black-friday-modal-open");
    window.lenis?.stop?.();
    window.SScroll?.stop?.();
    window.requestAnimationFrame(() => closeButton.focus());
  };

  const scheduleModal = () => {
    if (hasOpened || openTimer) return;
    openTimer = window.setTimeout(openModal, 3000);
  };

  closeButton.addEventListener("click", closeModal);
  window.addEventListener("resize", updatePointerJourney);
  document.fonts?.ready.then(updatePointerJourney);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });

  document.addEventListener("keydown", (event) => {
    if (modal.hidden) return;

    if (event.key === "Escape") {
      closeModal();
      return;
    }

    if (event.key === "Tab") {
      const focusable = getFocusableElements();
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  window.addEventListener("homePreloaderDone", scheduleModal, { once: true });
  if (document.body.classList.contains("home-content-ready")) scheduleModal();
})();
