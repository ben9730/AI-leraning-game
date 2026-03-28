import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import { I18nManager } from 'react-native';
import { reloadApp } from './reload';

import enCommon from './en/common.json';
import heCommon from './he/common.json';

const detectedLang =
  Localization.getLocales()[0]?.languageCode === 'he' ? 'he' : 'en';

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
    escapeValue: false,
  },
});

export async function setLanguage(lang: 'en' | 'he'): Promise<void> {
  await i18next.changeLanguage(lang);
  const shouldBeRTL = lang === 'he';
  I18nManager.allowRTL(shouldBeRTL);
  I18nManager.forceRTL(shouldBeRTL);
  await reloadApp();
}

export function isRTL(): boolean {
  return i18next.language === 'he';
}

export default i18next;
