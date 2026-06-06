import { useTranslation } from 'react-i18next';
import { useLanguage } from './LanguageContext';
import type { FontFamilySet } from './fonts';

export interface UseTResult {
  t: (key: string, options?: Record<string, any>) => string;
  language: string;
  fonts: FontFamilySet;
}

export const useT = (): UseTResult => {
  const { t, i18n } = useTranslation();
  const { fonts } = useLanguage();
  return {
    t: (key, options) => t(key, options) as string,
    language: i18n.language,
    fonts,
  };
};
