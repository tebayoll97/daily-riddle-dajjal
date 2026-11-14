"use client";

import { createContext, useContext } from "react";

const LanguageContext = createContext(null);
const LOCALE_COOKIE = "df-locale";

export function LanguageProvider({ children, initialLanguage = "id" }) {
  const language = initialLanguage === "en" ? "en" : "id";

  function setLanguage(nextLanguage) {
    if (nextLanguage !== "en" && nextLanguage !== "id") return;
    if (nextLanguage === currentLanguage) return;

    document.cookie = `${LOCALE_COOKIE}=${nextLanguage}; Path=/; Max-Age=31536000; SameSite=Lax${window.location.protocol === "https:" ? "; Secure" : ""}`;

    const currentPath = window.location.pathname || "/";
    const segments = currentPath.split("/");
    const currentLocale = segments[1] === "id" || segments[1] === "en" ? segments[1] : null;
    const pathWithoutLocale = currentLocale
      ? "/" + segments.slice(2).join("/")
      : currentPath;
    const destinationPath = pathWithoutLocale === "/" ? `/${nextLanguage}` : `/${nextLanguage}${pathWithoutLocale}`;

    window.location.assign(`${destinationPath}${window.location.search}${window.location.hash}`);
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, ready: true }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}
