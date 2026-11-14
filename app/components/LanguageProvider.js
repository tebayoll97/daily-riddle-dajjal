"use client";
import { createContext, useContext, useEffect, useState } from "react";

const LanguageContext = createContext(null);
const STORAGE_KEY = "daily-riddle-language";

function detectBrowserLanguage(fallback = "en") {
  if (typeof navigator === "undefined") return fallback;
  const preferences = [...(navigator.languages || []), navigator.language].filter(Boolean);
  const detected = preferences.find((value) => value.toLowerCase().startsWith("id") || value.toLowerCase().startsWith("en"));
  if (!detected) return fallback;
  return detected.toLowerCase().startsWith("id") ? "id" : "en";
}

export function LanguageProvider({ children, initialLanguage = "en" }) {
  const fallback = initialLanguage === "id" ? "id" : "en";
  const [language, setLanguageState] = useState(fallback);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const next = saved === "en" || saved === "id" ? saved : detectBrowserLanguage(fallback);
    setLanguageState(next);
    setReady(true);
  }, [fallback]);

  const setLanguage = (next) => {
    if (next !== "en" && next !== "id") return;
    setLanguageState(next);
    localStorage.setItem(STORAGE_KEY, next);
  };

  return <LanguageContext.Provider value={{ language, setLanguage, ready }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}
