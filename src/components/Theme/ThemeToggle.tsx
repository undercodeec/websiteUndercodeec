"use client";

import { useTheme } from "./ThemeProvider";
import styles from "./ThemeToggle.module.css";

type ThemeToggleProps = {
  tabIndex?: number;
};

export default function ThemeToggle({ tabIndex }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      className={styles.toggle}
      aria-label={isDark ? "Cambiar a modo día" : "Cambiar a modo noche"}
      aria-pressed={isDark}
      onClick={toggleTheme}
      tabIndex={tabIndex}
    >
      <span>{isDark ? "Modo día" : "Modo noche"}</span>
      <span className={styles.icon} aria-hidden="true">
        {isDark ? "☀" : "☾"}
      </span>
    </button>
  );
}
