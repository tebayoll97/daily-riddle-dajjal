"use client";
import { createContext, useContext, useEffect, useState } from "react";
const LanguageContext = createContext(null);
export function LanguageProvider({ children, initialLanguage = "en" }) {
 const [language,setLanguageState]=useState(initialLanguage==="id"?"id":"en");
 const [ready,setReady]=useState(false);
 useEffect(()=>{const saved=localStorage.getItem("daily-riddle-language");if(saved==="en"||saved==="id")setLanguageState(saved);setReady(true);},[]);
 const setLanguage=(next)=>{if(next!=="en"&&next!=="id")return;setLanguageState(next);localStorage.setItem("daily-riddle-language",next);};
 return <LanguageContext.Provider value={{language,setLanguage,ready}}>{children}</LanguageContext.Provider>;
}
export function useLanguage(){const context=useContext(LanguageContext);if(!context)throw new Error("useLanguage must be used inside LanguageProvider");return context;}
