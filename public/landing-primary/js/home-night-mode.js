(() => {
  const storageKey = "undercodeec-home-theme";
  const root = document.documentElement;

  const getSavedTheme = () => {
    try {
      return window.localStorage.getItem(storageKey) === "dark" ? "dark" : "light";
    } catch {
      return "light";
    }
  };

  const applyTheme = (theme) => {
    const isDark = theme === "dark";
    root.classList.toggle("dark", isDark);
    root.classList.toggle("light", !isDark);
    root.dataset.theme = theme;

    document.querySelectorAll("[data-home-theme-toggle]").forEach((button) => {
      button.setAttribute("aria-pressed", String(isDark));
      button.setAttribute("aria-label", isDark ? "Cambiar a modo día" : "Cambiar a modo noche");
      button.querySelector("[data-home-theme-label]").textContent = isDark ? "Modo día" : "Modo noche";
      button.querySelector("[data-home-theme-icon]").textContent = isDark ? "☀" : "☾";
    });
  };

  const saveTheme = (theme) => {
    try {
      window.localStorage.setItem(storageKey, theme);
    } catch {
      // The chosen theme still works when storage is unavailable.
    }
  };

  const mountThemeToggle = () => {
    const menuContent = document.querySelector(".hud-menu-content");
    if (!menuContent || menuContent.querySelector("[data-home-theme-toggle]")) return;

    const control = document.createElement("div");
    control.className = "home-theme-control";
    control.innerHTML = `
      <button class="home-theme-toggle" type="button" data-home-theme-toggle aria-pressed="false">
        <span data-home-theme-label>Modo noche</span>
        <span class="home-theme-toggle__icon" data-home-theme-icon aria-hidden="true">☾</span>
      </button>
    `;

    const button = control.querySelector("button");
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const nextTheme = root.classList.contains("dark") ? "light" : "dark";
      applyTheme(nextTheme);
      saveTheme(nextTheme);
    });

    menuContent.append(control);
    applyTheme(getSavedTheme());
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountThemeToggle, { once: true });
  } else {
    mountThemeToggle();
  }
})();
