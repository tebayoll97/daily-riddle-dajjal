"use client";
import { useTheme } from "./ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === "light";
  return (
    <button
      type="button"
      className="df-theme-toggle"
      onClick={toggleTheme}
      aria-label={isLight ? "Switch to dark theme" : "Switch to light theme"}
      aria-pressed={isLight}
      title={isLight ? "Light mode" : "Dark mode"}
    >
      <span aria-hidden="true">{isLight ? "☀" : "☾"}</span>
      <span className="df-theme-toggle-label">{isLight ? "LIGHT" : "DARK"}</span>
    </button>
  );
}
