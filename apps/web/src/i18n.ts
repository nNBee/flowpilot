// apps/web/src/i18n.ts
import { config } from './config';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { en } from './locales/en/translation';
import { hu } from './locales/hu/translation';

export const supportedLocales = ['en', 'hu'] as const;

export type Locale = (typeof supportedLocales)[number];

const STORAGE_KEY = 'locale';

function isLocale(value: string | null | undefined): value is Locale {
  return supportedLocales.includes(value as Locale);
}

function getInitialLocale(): Locale {
  const savedLocale = localStorage.getItem(STORAGE_KEY);

  if (isLocale(savedLocale)) {
    return savedLocale;
  }

  const configuredLocale = config.defaultLocale;

  if (isLocale(configuredLocale)) {
    return configuredLocale;
  }

  return 'en';
}
const initialLocale = getInitialLocale();

document.documentElement.lang = initialLocale;

void i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: en,
    },
    hu: {
      translation: hu,
    },
  },
  lng: initialLocale,
  fallbackLng: 'en',
  supportedLngs: supportedLocales,
  interpolation: {
    escapeValue: false,
  },
});

export async function changeLocale(locale: Locale) {
  localStorage.setItem(STORAGE_KEY, locale);
  document.documentElement.lang = locale;
  await i18n.changeLanguage(locale);
}

export default i18n;
