'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

type Language = "en" | "ne";

interface TranslationContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: { [key: string]: string | number }) => string;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

// Helper to get nested keys like 'nav.dashboard'
const getNestedValue = (obj: any, key: string): string | undefined => {
  return key.split('.').reduce((acc, part) => acc && acc[part], obj);
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  const [translations, setTranslations] = useState({});

  useEffect(() => {
    try {
        const storedLang = localStorage.getItem('app-lang') as Language;
        if (storedLang && ['en', 'ne'].includes(storedLang)) {
            setLanguage(storedLang);
        }
    } catch (error) {
        // If localStorage is not available (e.g. in SSR or private browsing), default to 'en'
        console.warn("Could not access localStorage for language preference.");
        setLanguage('en');
    }
  }, []);

  useEffect(() => {
    const loadTranslations = async () => {
      try {
        const module = await import(`@/locales/${language}.json`);
        setTranslations(module.default);
      } catch (error) {
        console.error(`Could not load translations for language: ${language}`, error);
        // Fallback to English if the desired language file is missing
        try {
            const module = await import(`@/locales/en.json`);
            setTranslations(module.default);
        } catch (fallbackError) {
            console.error("Could not load fallback English translations.", fallbackError);
        }
      }
    };
    loadTranslations();
  }, [language]);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    try {
        localStorage.setItem('app-lang', lang);
    } catch (error) {
        console.warn("Could not save language preference to localStorage.");
    }
  };

  const t = useCallback((key: string, params?: { [key: string]: string | number }): string => {
    let translation = getNestedValue(translations, key);

    if (!translation) {
      // Fallback to the key itself if translation not found
      return key;
    }

    if (params) {
      Object.keys(params).forEach(paramKey => {
        translation = translation!.replace(`{${paramKey}}`, String(params[paramKey]));
      });
    }

    return translation;
  }, [translations]);

  const value = useMemo(() => ({
    language,
    setLanguage: handleSetLanguage,
    t,
  }), [language, t]);

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
}

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};

export { TranslationContext };
