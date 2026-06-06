import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import en from './locales/en';
import km from './locales/km';
import zh from './locales/zh';
import type { LanguageCode } from './fonts';

const STORAGE_KEY = '@ams/language';
export const SUPPORTED_LANGUAGES: LanguageCode[] = ['en', 'km', 'zh'];
export const DEFAULT_LANGUAGE: LanguageCode = 'en';

const detectInitialLanguage = async (): Promise<LanguageCode> => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED_LANGUAGES.includes(stored as LanguageCode)) {
      return stored as LanguageCode;
    }
  } catch {
    // ignore
  }
  const device = Localization.getLocales?.()[0]?.languageCode ?? 'en';
  if (device === 'km' || device === 'kh') return 'km';
  if (device === 'zh') return 'zh';
  return DEFAULT_LANGUAGE;
};

export const persistLanguage = async (lang: LanguageCode): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // ignore
  }
};

export const initI18n = async (): Promise<LanguageCode> => {
  const lng = await detectInitialLanguage();

  if (!i18n.isInitialized) {
    await i18n.use(initReactI18next).init({
      resources: {
        en: { translation: en },
        km: { translation: km },
        zh: { translation: zh },
      },
      lng,
      fallbackLng: DEFAULT_LANGUAGE,
      compatibilityJSON: 'v4',
      interpolation: { escapeValue: false },
      returnNull: false,
    });
  } else {
    await i18n.changeLanguage(lng);
  }
  return lng;
};

export default i18n;
