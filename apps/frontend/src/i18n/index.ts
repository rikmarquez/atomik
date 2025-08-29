import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Import translation files
import en from './locales/en.json'
import es from './locales/es.json'

// i18n configuration
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es }
    },
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',

    // Language detection options
    detection: {
      order: [
        'localStorage',    // Check localStorage first
        'navigator',       // Then check browser language
        'htmlTag',         // Then check html lang attribute
        'path',           // Then check URL path
        'subdomain'       // Finally check subdomain
      ],
      caches: ['localStorage'], // Cache language preference
      lookupLocalStorage: 'atomic_language',
    },

    interpolation: {
      escapeValue: false // React already escapes
    },

    // Namespaces for organizing translations
    ns: ['translation'],
    defaultNS: 'translation',

    // Load missing translations in development
    saveMissing: process.env.NODE_ENV === 'development',
  })

export default i18n