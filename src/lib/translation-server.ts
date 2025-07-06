import 'server-only';
import { promises as fs } from 'fs';
import path from 'path';

type Translations = { [key: string]: string | Translations };

const translationsCache: { [key: string]: Translations } = {};

// Helper to get nested keys like 'nav.dashboard'
const getNestedValue = (obj: any, key: string): string | undefined => {
  return key.split('.').reduce((acc, part) => acc && acc[part], obj);
};

export async function getTranslations(lang: 'en' | 'ne' = 'en') {
  if (translationsCache[lang]) {
    return translationsCache[lang];
  }
  const filePath = path.join(process.cwd(), `src/locales/${lang}.json`);
  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const translations = JSON.parse(fileContent);
    translationsCache[lang] = translations;
    return translations;
  } catch (error) {
    console.error(`Could not load translations for language: ${lang}`, error);
    if (lang !== 'en') {
        return getTranslations('en'); // Fallback to English
    }
    return {};
  }
}

export async function getT(lang: 'en' | 'ne' = 'en') {
    const translations = await getTranslations(lang);
    
    return (key: string, params?: { [key: string]: string | number }): string => {
        let translation = getNestedValue(translations, key);
        if (!translation) return key;

        if (params) {
            Object.keys(params).forEach(paramKey => {
                translation = translation!.replace(`{${paramKey}}`, String(params[paramKey]));
            });
        }
        return translation;
    };
}
