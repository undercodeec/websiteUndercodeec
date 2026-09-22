"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type SiteTheme = "light" | "dark";

export const SITE_THEME_STORAGE_KEY = "undercodeec-home-theme";

type ThemeContextValue = {
  theme: SiteTheme;
  setTheme: (theme: SiteTheme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyTheme(theme: SiteTheme) {
  const root = document.documentElement;
  const isDark = theme === "dark";

  root.classList.toggle("dark", isDark);
  root.classList.toggle("light", !isDark);
  root.dataset.theme = theme;
}

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<SiteTheme>("light");

  const setTheme = useCallback((nextTheme: SiteTheme) => {
    applyTheme(nextTheme);
    setThemeState(nextTheme);

    try {
      window.localStorage.setItem(SITE_THEME_STORAGE_KEY, nextTheme);
    } catch {
      // The selected theme still applies when storage is unavailable.
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [setTheme, theme]);

  useEffect(() => {
    const initialTheme: SiteTheme = document.documentElement.classList.contains("dark")
      ? "dark"
      : "light";
    const syncFrame = window.requestAnimationFrame(() => setThemeState(initialTheme));

    const syncTheme = (event: StorageEvent) => {
      if (event.key !== SITE_THEME_STORAGE_KEY) return;
      const nextTheme: SiteTheme = event.newValue === "dark" ? "dark" : "light";
      applyTheme(nextTheme);
      setThemeState(nextTheme);
    };

    window.addEventListener("storage", syncTheme);
    return () => {
      window.cancelAnimationFrame(syncFrame);
      window.removeEventListener("storage", syncTheme);
    };
  }, []);

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [setTheme, theme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside ThemeProvider");
  return context;
}
