"use client";

import {
  createContext,
  type PropsWithChildren,
  useContext,
  useMemo,
} from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { translations, type Language } from "../i18n/translations";

type LanguageState = {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  tr: (typeof translations)[Language];
};

const LanguageContext = createContext<LanguageState | null>(null);

export function LanguageProvider({ children }: PropsWithChildren) {
  const [language, setLanguage] = useLocalStorage<Language>("mph-language", "ro");

  const value = useMemo<LanguageState>(() => ({
    language,
    setLanguage,
    toggleLanguage: () => setLanguage(language === "en" ? "ro" : "en"),
    tr: translations[language],
  }), [language, setLanguage]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }
  return context;
}
