import { createPrimaryOrb } from "./whatsapp-primary-orb.js";

(() => {
  const whatsappUrl =
    "https://wa.me/593999739534?text=Hola%2C%20quisiera%20obtener%20informaci%C3%B3n%20sobre%20los%20servicios%20de%20Undercodeec.";
  const viewportPadding = 8;

  const clampPosition = (x, y, width, height) => ({
    x: Math.min(Math.max(viewportPadding, x), Math.max(viewportPadding, window.innerWidth - width - viewportPadding)),
    y: Math.min(Math.max(viewportPadding, y), Math.max(viewportPadding, window.innerHeight - height - viewportPadding)),
  });

  const makeButtonDraggable = (button) => {
    let drag = null;
    let suppressClick = false;

    const setPosition = (x, y, width, height) => {
      const position = clampPosition(x, y, width, height);
      button.style.left = `${position.x}px`;
      button.style.top = `${position.y}px`;
      button.style.right = "auto";
      button.style.bottom = "auto";
    };

    button.addEventListener("pointerdown", (event) => {
      if (event.button !== undefined && event.button !== 0) return;

      const { left, top, width, height } = button.getBoundingClientRect();
      drag = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        initialX: left,
        initialY: top,
        width,
        height,
        hasMoved: false,
      };
      button.setPointerCapture(event.pointerId);
      setPosition(left, top, width, height);
    });

    button.addEventListener("pointermove", (event) => {
      if (!drag || drag.pointerId !== event.pointerId) return;

      const distanceX = event.clientX - drag.startX;
      const distanceY = event.clientY - drag.startY;
      if (!drag.hasMoved && Math.hypot(distanceX, distanceY) < 4) return;

      drag.hasMoved = true;
      button.classList.add("is-dragging");
      setPosition(drag.initialX + distanceX, drag.initialY + distanceY, drag.width, drag.height);
    });

    const finishDragging = (event) => {
      if (!drag || drag.pointerId !== event.pointerId) return;

      if (button.hasPointerCapture(event.pointerId)) button.releasePointerCapture(event.pointerId);
      suppressClick = drag.hasMoved;
      drag = null;
      button.classList.remove("is-dragging");
    };

    button.addEventListener("pointerup", finishDragging);
    button.addEventListener("pointercancel", finishDragging);
    button.addEventListener("dragstart", (event) => event.preventDefault());
    button.addEventListener("click", (event) => {
      if (!suppressClick) return;

      event.preventDefault();
      suppressClick = false;
    });

    window.addEventListener("resize", () => {
      if (!button.style.left) return;

      const { width, height } = button.getBoundingClientRect();
      setPosition(Number.parseFloat(button.style.left), Number.parseFloat(button.style.top), width, height);
    });
  };

  const mountButton = () => {
    if (document.querySelector(".hermes-whatsapp-button")) return;

    const button = document.createElement("a");
    button.className = "hermes-whatsapp-button";
    button.href = whatsappUrl;
    button.target = "_blank";
    button.rel = "noopener noreferrer";
    button.draggable = false;
    button.setAttribute("aria-label", "Hablar con Hermes por WhatsApp");
    const orb = document.createElement("div");
    orb.className = "hermes-whatsapp-orb";
    button.innerHTML = `
      <svg aria-hidden="true" viewBox="0 0 32 32" focusable="false">
        <path d="M19.11 17.21c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07a8.17 8.17 0 0 1-2.4-1.48 9.03 9.03 0 0 1-1.67-2.08c-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.49 0 1.47 1.07 2.89 1.22 3.09.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.08-.12-.27-.2-.57-.35Z" />
        <path d="M16.02 3.2a12.73 12.73 0 0 0-10.96 19.2L3.7 28.8l6.56-1.72A12.8 12.8 0 1 0 16.02 3.2Zm0 23.2c-1.93 0-3.82-.52-5.47-1.5l-.39-.23-3.89 1.02 1.04-3.79-.25-.39a10.48 10.48 0 1 1 8.96 4.89Z" />
      </svg>`;
    button.prepend(orb);
    document.body.append(button);
    makeButtonDraggable(button);
    createPrimaryOrb(orb, { color: "#25D366" });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountButton, { once: true });
  } else {
    mountButton();
  }
})();
