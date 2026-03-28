import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import enCommon from '@shared/i18n/en/common.json'
import heCommon from '@shared/i18n/he/common.json'

// Detect browser language preference
const detectedLang: 'en' | 'he' =
  typeof navigator !== 'undefined' && navigator.language?.startsWith('he')
    ? 'he'
    : 'en'

i18next.use(initReactI18next).init({
  resources: {
    en: { common: enCommon },
    he: { common: heCommon },
  },
  lng: detectedLang,
  fallbackLng: 'en',
  ns: ['common'],
  defaultNS: 'common',
  interpolation: {
    escapeValue: false, // React already escapes
  },
})

export default i18next
