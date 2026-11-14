"use client";
import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);
const STORAGE_KEY = "dajjal-family-theme";

function getSystemTheme() {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("dark");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const next = saved === "light" || saved === "dark" ? saved : getSystemTheme();
    setTheme(next);
    document.documentElement.dataset.theme = next;
    document.documentElement.style.colorScheme = next;
    setReady(true);

    if (saved !== "light" && saved !== "dark") {
      const media = window.matchMedia("(prefers-color-scheme: light)");
      const onChange = (event) => {
        const currentSaved = localStorage.getItem(STORAGE_KEY);
        if (currentSaved !== "light" && currentSaved !== "dark") {
          const value = event.matches ? "light" : "dark";
          setTheme(value);
          document.documentElement.dataset.theme = value;
          document.documentElement.style.colorScheme = value;
        }
      };
      media.addEventListener?.("change", onChange);
      return () => media.removeEventListener?.("change", onChange);
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.dataset.theme = next;
    document.documentElement.style.colorScheme = next;
  };

  return <ThemeContext.Provider value={{ theme, toggleTheme, ready }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside ThemeProvider");
  return context;
}
